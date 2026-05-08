/**
 * Read-only parity builder — builds a legacy-compatible `Category[]`
 * from package-engine output for the curated Modern + Balanced cell.
 *
 * Phase 2 hard rules:
 *  - Pure / read-only. Does not mutate ProjectContext, persistence, or
 *    customer-visible UI.
 *  - Returns `null` when no curated package can serve the URL+style
 *    combo. Callers (today: tests + dev inspector) MUST treat null as
 *    "fall back to legacy buildCategoriesForTier".
 *  - Never resolves placeholder packages.
 *
 * Compatibility filtering currently mirrors the legacy customize page
 * (vanity room-width gating, faucet-hole gating). When the engine cannot
 * supply the metadata, the slot is left unfiltered rather than guessed.
 */

import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import type { Bin } from "@/remodel-flow/packages/modern-balanced";
import { resolveSlot } from "./resolveSlot";
import { resolvePackageIdFromUrl, urlIdToTier } from "./urlPackageRoute";
import {
  adaptEngineProductToLegacy,
  type LegacyDrawerProductFields,
} from "./productAdapter";
import type { BinKey } from "./types";
import type { ProductTier } from "@/data/tiered-catalog";

/** Subset of legacy `Category` shape needed for parity comparison. */
export interface EngineCategory {
  /** Display category label (matches legacy `Category.name`). */
  name: string;
  selected: string;
  selectedId: string;
  reason: string;
  price: number;
  basePrice: number;
  vendor: string;
  finish?: string;
  image?: string;
  tag?: string;
  spec?: string;
  disclaimer?: string;
  affiliateUrl?: string;
  laborDelta: number;
  laborNote?: string;
  alternatives: Array<{
    id: string;
    name: string;
    desc: string;
    vendor: string;
    finish?: string;
    image?: string;
    tag?: string;
    spec?: string;
    laborNote?: string;
    disclaimer?: string;
    price: number;
    laborDelta: number;
    affiliateUrl?: string;
  }>;
  /* ─── Engine-only diagnostics (not in legacy Category) ──────────── */
  _engine: {
    binKey: BinKey;
    isFallback: boolean;
    isUnresolved: boolean;
    enrichedFromLegacyId: string | null;
    /** Phase 2.10 — authoritative curated-only flag from the source Product. */
    isCuratedOnly: boolean;
    /** Phase 2.10 — pricing source-of-truth from the source Product. */
    pricingSource?: "retailer" | "project-allowance" | "estimated" | "pending";
  };
}

/** Map engine BinKey → legacy display category label. */
const BIN_TO_LEGACY_CATEGORY: Partial<Record<BinKey, string>> = {
  vanity: "Vanities",
  sink: "Sinks",
  faucet: "Faucets",
  mirror: "Mirrors",
  showerWallTile: "Shower Wall Tile",
  showerFloorTile: "Shower Floor Tile",
  mainFloorTile: "Main Floor Tile",
  accentTile: "Accent Tile",
  showerDoor: "Shower Doors",
  showerValve: "Shower Valve",
  showerSystem: "Shower Systems",
  bathtub: "Bathtubs",
  tubValve: "Tub Valve",
  // lighting / toilet / heatedFloor are static / non-customizable today
  // and intentionally omitted from the customize drawer.
};

/**
 * MODERN_BALANCED was authored before the canonical BinKey vocabulary
 * existed and uses some non-canonical bin names (`floorTile`,
 * `showerGlass`, plus internal-only `showerTrim`/`accessories`). Map
 * them to canonical BinKeys so the drawer surfaces the right rows.
 *
 * Internal-only bins (showerTrim, accessories) intentionally map to
 * `null` — they are not customer-facing customize categories today.
 */
const MODERN_BALANCED_BIN_ALIAS: Record<string, BinKey | null> = {
  vanity: "vanity",
  faucet: "faucet",
  sink: "sink",                      // Phase 2.8 — opened
  mirror: "mirror",
  lighting: "lighting",
  showerWallTile: "showerWallTile",
  floorTile: "mainFloorTile",        // canonical legacy "Main Floor Tile"
  showerFloorTile: "showerFloorTile",
  showerTrim: "showerValve",         // closest customize-drawer fit
  showerSystem: "showerSystem",      // Phase 2.8 — opened
  showerGlass: "showerDoor",         // canonical legacy "Shower Doors"
  toilet: "toilet",
  accentTile: "accentTile",          // Phase 2.8 — opened
  accessories: null,                  // not in customize drawer
};

const LEGACY_TIER_FROM_URL: Record<string, ProductTier> = {
  essential: "Budget",
  budget: "Budget",
  balanced: "Balanced",
  premium: "Premium",
};

export interface BuildEngineCategoriesOpts {
  urlId: string;
  style?: string | null;
  roomWidthInches?: number;
  selectedVanityId?: string;
}

function toLegacyAlt(p: LegacyDrawerProductFields) {
  return {
    id: p.id,
    name: p.name,
    desc: p.description,
    vendor: p.vendor,
    finish: p.finish,
    image: p.image,
    tag: p.tag,
    spec: p.spec,
    laborNote: p.laborNote,
    disclaimer: p.disclaimer,
    price: p.price,
    laborDelta: p.laborDelta,
    affiliateUrl: p.affiliateUrl,
  };
}

/**
 * Build engine-driven legacy-compatible categories. Returns null when no
 * curated package matches — callers MUST fall back to the legacy path.
 */
export function buildEngineCategoriesForCustomize(
  opts: BuildEngineCategoriesOpts,
): EngineCategory[] | null {
  const packageId = resolvePackageIdFromUrl(opts.urlId, { style: opts.style });
  if (!packageId) return null;

  // Phase 2 only wires the single curated package: modern-balanced.
  if (packageId !== "modern-balanced") return null;

  const tier = urlIdToTier(opts.urlId);
  if (!tier) return null;
  const legacyTier = LEGACY_TIER_FROM_URL[String(opts.urlId).toLowerCase()] ?? "Balanced";

  // Resolve everything first so we can reference the selected vanity for
  // the faucet-hole compatibility check.
  type ResolvedEntry = {
    binKey: BinKey;
    legacyCategory: string;
    slot: ReturnType<typeof resolveSlot>;
  };
  const resolved: ResolvedEntry[] = [];
  for (const [binKeyRaw, binRaw] of Object.entries(MODERN_BALANCED.bins)) {
    const aliased = MODERN_BALANCED_BIN_ALIAS[binKeyRaw];
    if (aliased === undefined) continue; // unknown source bin
    if (aliased === null) continue; // explicitly internal-only
    const binKey: BinKey = aliased;
    const legacyCategory = BIN_TO_LEGACY_CATEGORY[binKey];
    if (!legacyCategory) continue;
    const bin = binRaw as Bin;
    const slot = resolveSlot(packageId, binKey, bin);
    resolved.push({ binKey, legacyCategory, slot });
  }

  // Find the engine vanity selection — drives faucet-hole compatibility.
  const vanityEntry = resolved.find((r) => r.binKey === "vanity");
  const selectedVanity =
    vanityEntry &&
    (opts.selectedVanityId
      ? vanityEntry.slot.alternatives.find((a) => a.id === opts.selectedVanityId) ??
        vanityEntry.slot.product
      : vanityEntry.slot.product);
  const selectedVanityHoles = selectedVanity?.faucetHoles;

  const out: EngineCategory[] = [];
  for (const { binKey, legacyCategory, slot } of resolved) {
    // Compatibility filters — read-only on alternatives only. Primary is
    // the curated default and is not silently swapped here (mirrors the
    // legacy /customize behavior).
    let alts = slot.alternatives;

    if (binKey === "vanity" && opts.roomWidthInches && opts.roomWidthInches > 0) {
      const max = opts.roomWidthInches;
      alts = alts.filter((a) => {
        // Drop alternatives whose intrinsic width exceeds the room. When
        // intrinsic width is unknown, keep the alternative (legacy parity:
        // unknown-width rows were never gated either).
        return a.widthInches == null || a.widthInches <= max;
      });
    }

    if (binKey === "faucet" && selectedVanityHoles != null) {
      alts = alts.filter((a) => {
        return a.faucetHoles == null || a.faucetHoles === selectedVanityHoles;
      });
    }

    const primary = adaptEngineProductToLegacy(slot.product, {
      legacyTier,
      isFallback: slot.isFallback,
      isUnresolved: slot.isUnresolved,
    });
    const adaptedAlts = alts.map((p) =>
      adaptEngineProductToLegacy(p, { legacyTier }),
    );

    out.push({
      name: legacyCategory,
      selected: primary.name,
      selectedId: primary.id,
      reason: primary.description,
      price: primary.price,
      basePrice: primary.price,
      vendor: primary.vendor,
      finish: primary.finish,
      image: primary.image,
      tag: primary.tag,
      spec: primary.spec,
      disclaimer: primary.disclaimer,
      affiliateUrl: primary.affiliateUrl,
      laborDelta: primary.laborDelta,
      laborNote: primary.laborNote,
      alternatives: adaptedAlts.map(toLegacyAlt),
      _engine: {
        binKey,
        isFallback: slot.isFallback,
        isUnresolved: slot.isUnresolved,
        enrichedFromLegacyId: primary.enrichedFromLegacyId,
        isCuratedOnly: !!slot.product.isCuratedOnly,
        pricingSource: slot.product.pricingSource,
      },
    });
  }
  return out;
}

/**
 * Documented parity gap — categories the legacy customize drawer shows
 * but `MODERN_BALANCED` does not yet have a curated bin for.
 *
 * Phase 2.8 opened: Sinks, Shower Systems, Accent Tile.
 *
 * Phase 2.9 — Shower-forward posture (locked):
 *   MODERN_BALANCED is conceptually a SHOWER-FORWARD package. Its curated
 *   bins already form a complete walk-in shower posture (showerWallTile,
 *   showerFloorTile, showerDoor/glass, showerValve, showerSystem). There
 *   is no curated tub deck, tub filler, or tub-surround track.
 *
 *   - "Bathtubs" remains DEFERRED to legacy fallback. Freestanding modern
 *     tubs have unstable retailer pricing/freight/install scope; drop-in
 *     and alcove tubs conflict with the shower-forward direction.
 *   - "Tub Valve" remains DEFERRED and is COUPLED to bathtub: rough-in
 *     height, spout type, diverter logic, and finish-match are downstream
 *     of the tub decision. Tub Valve must NOT be opened independently of
 *     Bathtub. If Bathtub opens in a future phase, Tub Valve must open
 *     with it using a compatible matched-finish primary.
 *   - These bins are NOT moved to EMPTY_BINS — legacy/catalog products
 *     exist for both categories; they are simply not curated for this
 *     package yet. EMPTY_BINS is reserved for genuinely empty catalog
 *     categories (e.g. toilet, heatedFloor), not deferred package-
 *     specific curation choices.
 *   - A future tub-forward package variant may revisit this decision.
 *
 * Until then both categories are served by the legacy fallback path.
 */
export const MODERN_BALANCED_MISSING_LEGACY_CATEGORIES: readonly string[] = [
  "Bathtubs",
  "Tub Valve",
] as const;
