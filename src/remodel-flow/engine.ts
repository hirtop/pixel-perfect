import {
  CATEGORIES,
  PACKAGES,
  TIER_BINS,
  getAllCandidates,
  getCategory,
  getOption,
} from "./catalog";
import { STYLES } from "./styles";
import type {
  CatalogOption,
  CatalogPackage,
  PriceBin,
  RemodelFlowState,
  StyleId,
  TierId,
} from "./types";

// =====================================================================
// Public engine output
// =====================================================================

export type ResolutionSource =
  | "user-override"
  | "package-default"
  | "backup"
  | "dynamic-pool"
  | "unresolved";

export interface ResolvedSlot {
  categoryId: string;
  categoryName: string;
  optionId: string | null;
  optionName: string | null;
  estPrice: number;
  bin: PriceBin | null;
  source: ResolutionSource;
  score: number; // ranking score of the chosen candidate (0 if unresolved)
  considered: number; // number of candidates ranked
  reason?: string;
}

export interface ResolvedState {
  style?: StyleId;
  tier?: TierId;
  packageId?: string;
  packageName?: string;
  slots: ResolvedSlot[];
}

export interface PricingBreakdown {
  basePrice: number;
  itemsTotal: number;
  defaultsTotal: number;
  upgradeDelta: number;
  total: number;
  perSlot: { categoryId: string; estPrice: number; deltaVsDefault: number }[];
}

export interface ValidationIssue {
  level: "error" | "warning";
  categoryId?: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface EngineResult {
  resolved_state: ResolvedState;
  pricing: PricingBreakdown;
  validation: ValidationResult;
}

// =====================================================================
// Ranking
// =====================================================================

interface RankedCandidate {
  option: CatalogOption;
  score: number;
  parts: {
    compatibility: number; // 0..1
    tagOverlap: number; // 0..1
    priceProximity: number; // 0..1
    binPenalty: number; // -1..0
    overrideBoost: number; // 0..0.5 if user picked it
  };
}

const TAG_TARGETS: Partial<Record<StyleId, Record<string, string[]>>> = {
  modern: {
    vanity: ["floating", "oak", "walnut", "stone_top"],
    tile: ["porcelain", "honed", "marble"],
    fixtures: ["matte_black", "brushed_nickel"],
    lighting: ["layered", "sconce"],
  },
  classic: {
    vanity: ["freestanding", "stone_top"],
    tile: ["subway", "marble", "polished"],
    fixtures: ["chrome", "brushed_nickel"],
    lighting: ["sconce", "pendant"],
  },
  spa: {
    vanity: ["oak", "walnut", "stone_top"],
    tile: ["zellige", "marble", "honed", "handmade"],
    fixtures: ["brass", "brushed_nickel"],
    lighting: ["layered", "sconce"],
  },
  minimal: {
    vanity: ["floating", "laminate"],
    tile: ["porcelain", "honed", "subway"],
    fixtures: ["matte_black", "chrome"],
    lighting: ["flush", "sconce"],
  },
};

function tagOverlapScore(
  style: StyleId | undefined,
  categoryId: string,
  option: CatalogOption,
): number {
  if (!style) return 0.5;
  const targets = new Set(TAG_TARGETS[style]?.[categoryId] ?? []);
  if (targets.size === 0) return 0.5;
  const tags = [...(option.material_tags ?? []), ...(option.finish_tags ?? [])];
  if (tags.length === 0) return 0.3;
  let hits = 0;
  for (const t of tags) if (targets.has(t)) hits++;
  return Math.min(1, hits / Math.max(2, targets.size / 2));
}

function compatibilityScore(
  style: StyleId | undefined,
  categoryId: string,
  option: CatalogOption,
): number {
  if (!style) return 0.5;
  const table = STYLES[style]?.compatibility_scores[categoryId] ?? {};
  const tags = [...(option.material_tags ?? []), ...(option.finish_tags ?? [])];
  if (tags.length === 0) return 0.4;
  let sum = 0;
  let n = 0;
  for (const t of tags) {
    const v = table[t];
    if (typeof v === "number") {
      sum += v;
      n++;
    }
  }
  if (n === 0) return 0.35;
  return sum / n;
}

function priceProximityScore(option: CatalogOption, anchorPrice: number): number {
  if (anchorPrice <= 0) return 0.5;
  const diff = Math.abs(option.estPrice - anchorPrice);
  // Within 25% of anchor => ~1.0; falls off to ~0 at 3x anchor distance.
  const ratio = diff / anchorPrice;
  return Math.max(0, 1 - ratio / 1.5);
}

function binPenalty(option: CatalogOption, allowed: PriceBin[] | undefined): number {
  if (!option.bin || !allowed || allowed.length === 0) return 0;
  return allowed.includes(option.bin) ? 0 : -0.6;
}

/**
 * Rank-based candidate selection (NOT filter-only).
 * Out-of-bin candidates are penalized but still considered, so the engine can
 * recover when the in-bin pool is empty.
 */
export function rank_candidates(args: {
  categoryId: string;
  style?: StyleId;
  allowedBins?: PriceBin[];
  anchorPrice: number;
  userOverrideId?: string;
}): RankedCandidate[] {
  const { categoryId, style, allowedBins, anchorPrice, userOverrideId } = args;
  const candidates = getAllCandidates(categoryId);

  const ranked = candidates.map<RankedCandidate>((option) => {
    const compatibility = compatibilityScore(style, categoryId, option);
    const tagOverlap = tagOverlapScore(style, categoryId, option);
    const priceProximity = priceProximityScore(option, anchorPrice);
    const bp = binPenalty(option, allowedBins);
    const overrideBoost = userOverrideId && option.id === userOverrideId ? 0.5 : 0;

    // Weights: compatibility 0.45, tag overlap 0.25, price proximity 0.20,
    // plus bin penalty and override boost.
    const score =
      compatibility * 0.45 +
      tagOverlap * 0.25 +
      priceProximity * 0.2 +
      bp +
      overrideBoost;

    return {
      option,
      score,
      parts: { compatibility, tagOverlap, priceProximity, binPenalty: bp, overrideBoost },
    };
  });

  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

// =====================================================================
// Slot resolution with fallback chain
// =====================================================================

export function resolve_slot(args: {
  categoryId: string;
  pkg: CatalogPackage;
  style?: StyleId;
  tier?: TierId;
  userOverrideId?: string;
}): ResolvedSlot {
  const { categoryId, pkg, style, tier, userOverrideId } = args;
  const cat = getCategory(categoryId);
  if (!cat) {
    return {
      categoryId,
      categoryName: categoryId,
      optionId: null,
      optionName: null,
      estPrice: 0,
      bin: null,
      source: "unresolved",
      score: 0,
      considered: 0,
      reason: "Unknown category",
    };
  }

  const slot = pkg.slots?.[categoryId];
  const allowedBins =
    slot?.preferred_bins ??
    cat.swap_config?.allowed_bins ??
    (tier ? TIER_BINS[tier] : undefined);

  const defaultId = pkg.defaults[categoryId];
  const defaultOpt = defaultId ? getOption(categoryId, defaultId) : undefined;
  const anchorPrice = defaultOpt?.estPrice ?? 0;

  // Fallback chain: user override -> package default -> backup chain ->
  // dynamic-pool best-ranked -> unresolved.
  const chain: { id: string; source: ResolutionSource }[] = [];
  if (userOverrideId) chain.push({ id: userOverrideId, source: "user-override" });
  if (defaultId) chain.push({ id: defaultId, source: "package-default" });
  for (const id of slot?.backup_option_ids ?? []) chain.push({ id, source: "backup" });
  if (cat.swap_config?.backup_option_id)
    chain.push({ id: cat.swap_config.backup_option_id, source: "backup" });

  // Always rank the full pool — this is rank-based selection, not pure filtering.
  const ranked = rank_candidates({
    categoryId,
    style,
    allowedBins,
    anchorPrice,
    userOverrideId,
  });

  // Walk the chain in order. Use the chain id only if it exists in the pool.
  for (const step of chain) {
    const hit = ranked.find((r) => r.option.id === step.id);
    if (hit) {
      return {
        categoryId,
        categoryName: cat.name,
        optionId: hit.option.id,
        optionName: hit.option.name,
        estPrice: hit.option.estPrice,
        bin: hit.option.bin ?? null,
        source: step.source,
        score: round3(hit.score),
        considered: ranked.length,
      };
    }
  }

  // Dynamic-pool / general fallback: take best-ranked candidate overall.
  const best = ranked[0];
  if (best) {
    const isDynamic = (cat.dynamic_pool ?? []).some((o) => o.id === best.option.id);
    return {
      categoryId,
      categoryName: cat.name,
      optionId: best.option.id,
      optionName: best.option.name,
      estPrice: best.option.estPrice,
      bin: best.option.bin ?? null,
      source: isDynamic ? "dynamic-pool" : "package-default",
      score: round3(best.score),
      considered: ranked.length,
      reason: "Resolved via best-ranked fallback",
    };
  }

  return {
    categoryId,
    categoryName: cat.name,
    optionId: null,
    optionName: null,
    estPrice: 0,
    bin: null,
    source: "unresolved",
    score: 0,
    considered: 0,
    reason: "No candidates available",
  };
}

// =====================================================================
// Package resolution
// =====================================================================

export function resolve_package(state: RemodelFlowState): ResolvedState {
  const tier = state.tier;
  const pkg = tier ? PACKAGES[tier] : undefined;

  const slots = CATEGORIES.map((cat) =>
    pkg
      ? resolve_slot({
          categoryId: cat.id,
          pkg,
          style: state.style,
          tier,
          userOverrideId: state.selections[cat.id],
        })
      : ({
          categoryId: cat.id,
          categoryName: cat.name,
          optionId: null,
          optionName: null,
          estPrice: 0,
          bin: null,
          source: "unresolved",
          score: 0,
          considered: 0,
          reason: "No tier selected",
        } satisfies ResolvedSlot),
  );

  return {
    style: state.style,
    tier,
    packageId: pkg?.id,
    packageName: pkg?.name,
    slots,
  };
}

// =====================================================================
// Validation
// =====================================================================

export function validate_resolution(resolved: ResolvedState): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!resolved.tier) {
    issues.push({ level: "error", message: "No tier selected." });
  }
  if (!resolved.style) {
    issues.push({ level: "warning", message: "No style selected — using neutral compatibility." });
  }

  for (const slot of resolved.slots) {
    if (slot.source === "unresolved" || !slot.optionId) {
      issues.push({
        level: "error",
        categoryId: slot.categoryId,
        message: `${slot.categoryName} could not be resolved.`,
      });
      continue;
    }
    const cat = getCategory(slot.categoryId);
    const allowed = cat?.swap_config?.allowed_bins;
    if (slot.bin && allowed && !allowed.includes(slot.bin)) {
      issues.push({
        level: "warning",
        categoryId: slot.categoryId,
        message: `${slot.categoryName} uses bin "${slot.bin}" outside swap_config.`,
      });
    }
    if (slot.score < 0.25) {
      issues.push({
        level: "warning",
        categoryId: slot.categoryId,
        message: `${slot.categoryName} has low compatibility (${slot.score}).`,
      });
    }
  }

  return { ok: issues.every((i) => i.level !== "error"), issues };
}

// =====================================================================
// Pricing
// =====================================================================

export function compute_pricing(
  state: RemodelFlowState,
  resolved: ResolvedState,
): PricingBreakdown {
  const pkg = resolved.tier ? PACKAGES[resolved.tier] : undefined;
  const basePrice = pkg?.basePrice ?? 0;

  const defaultsTotal = CATEGORIES.reduce((sum, cat) => {
    const id = pkg?.defaults[cat.id];
    const opt = id ? getOption(cat.id, id) : undefined;
    return sum + (opt?.estPrice ?? 0);
  }, 0);

  const itemsTotal = resolved.slots.reduce((sum, s) => sum + s.estPrice, 0);
  const upgradeDelta = itemsTotal - defaultsTotal;

  const perSlot = resolved.slots.map((s) => {
    const defId = pkg?.defaults[s.categoryId];
    const defPrice = defId ? getOption(s.categoryId, defId)?.estPrice ?? 0 : 0;
    return {
      categoryId: s.categoryId,
      estPrice: s.estPrice,
      deltaVsDefault: s.estPrice - defPrice,
    };
  });

  return {
    basePrice,
    itemsTotal,
    defaultsTotal,
    upgradeDelta,
    total: basePrice + upgradeDelta,
    perSlot,
  };
}

// =====================================================================
// Top-level entry point
// =====================================================================

export function runEngine(state: RemodelFlowState): EngineResult {
  const resolved_state = resolve_package(state);
  const pricing = compute_pricing(state, resolved_state);
  const validation = validate_resolution(resolved_state);
  return { resolved_state, pricing, validation };
}

// =====================================================================
// Helpers
// =====================================================================

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}
