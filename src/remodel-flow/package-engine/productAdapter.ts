/**
 * Product adapter — normalizes raw catalog products into a stable shape
 * the package engine can consume without mutating the source data.
 */

import { normalizeBinKey, normalizeTier } from "./normalize";
import type { BinKey, Product, ResolvedSlot, Tier } from "./types";
import { tieredCatalog, type ProductTier, type TieredProduct } from "@/data/tiered-catalog";

export interface NormalizedProduct {
  id: string;
  name: string;
  binKey: BinKey | null;
  /** Original display category label, preserved verbatim. */
  displayCategory: string;
  tier: Tier | null;
  styles: string[];
  tags: string[];
  price?: number;
  priceRange?: [number, number];
  imageUrl?: string;
  affiliateUrl?: string;

  /* ─── Promoted functional fields (Pass 4) ───────────────────────
   * These were previously only available via .raw. Promoted because UI
   * consumers will need them once they read NormalizedProduct directly.
   * Still preserved on .raw verbatim.
   */
  finish: string | null;
  faucet_holes: number | string | null;
  mount_type: string | null;
  width_inches: number | null;
  isDefault: boolean;
  laborDelta: number | null;
  laborNote: string | null;

  /** The original raw object, untouched. */
  raw: unknown;
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

function pickString(...vals: unknown[]): string | undefined {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v;
  return undefined;
}

function pickNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function pickPriceRange(v: unknown): [number, number] | undefined {
  if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number") {
    return [v[0], v[1]];
  }
  return undefined;
}

/**
 * Normalize an arbitrary raw product object. Never throws on missing fields.
 */
export function normalizeProduct(raw: unknown): NormalizedProduct {
  const r = (raw ?? {}) as Record<string, unknown>;

  const displayCategory =
    pickString(r.category, r.displayCategory, r.bin) ?? "";
  const binKey = normalizeBinKey(displayCategory) ?? null;
  const tier = normalizeTier(typeof r.tier === "string" ? r.tier : undefined) ?? null;

  const styles = asArray(r.styles ?? r.style);
  const tags = asArray(r.tags ?? r.tag);

  // Promoted functional fields
  const finish = pickString(r.finish) ?? null;
  const fhRaw = r.faucet_holes;
  const faucet_holes: number | string | null =
    typeof fhRaw === "number" || typeof fhRaw === "string" ? fhRaw : null;
  const mount_type = pickString(r.mount_type) ?? null;
  const width_inches = pickNumber(r.width_inches) ?? null;
  const isDefault = r.isDefault === true;
  const laborDelta = pickNumber(r.laborDelta) ?? null;
  const laborNote = pickString(r.laborNote) ?? null;

  return {
    id: pickString(r.id) ?? "",
    name: pickString(r.name) ?? "",
    binKey,
    displayCategory,
    tier,
    styles,
    tags,
    price: pickNumber(r.price),
    priceRange: pickPriceRange(r.priceRange),
    imageUrl: pickString(r.imageUrl, r.image),
    affiliateUrl: pickString(r.affiliateUrl, r.affiliate_url),
    finish,
    faucet_holes,
    mount_type,
    width_inches,
    isDefault,
    laborDelta,
    laborNote,
    raw,
  };
}

/* ─── Engine → Legacy drawer adapter (Phase 2) ─────────────────────
 * One-direction adapter: package-engine `Product` (or `ResolvedSlot`)
 * back into the field shape the legacy /customize drawer expects.
 *
 * This adapter is read-only and additive. It does NOT mutate engine
 * data and does NOT change customer-visible behavior. Used today only
 * by the parity builder + dev inspector.
 */

/** Subset of the legacy drawer's `Category`/`Alternative` fields. */
export interface LegacyDrawerProductFields {
  id: string;
  name: string;
  /** Total price the legacy drawer would render (`getProductTotalPrice`). */
  price: number;
  /** Vendor / retailer label (e.g. "Home Depot"). */
  vendor: string;
  finish?: string;
  image?: string;
  tag?: string;
  spec?: string;
  /** Description / "reason" text shown under the name. */
  description: string;
  disclaimer?: string;
  affiliateUrl?: string;
  laborDelta: number;
  laborNote?: string;
  /** True when no usable engine product backed this slot. */
  isUnresolved: boolean;
  /** True when engine substituted from the alternatives chain. */
  isFallback: boolean;
  /** Internal-only: which legacy `tieredCatalog` row, if any, enriched the row. */
  enrichedFromLegacyId: string | null;
}

function normalizeForMatch(s: string | undefined | null): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Pull the SKU-like tail of a URL path (e.g. ".../delta-t17t459-h2o/..." → "delta-t17t459-h2o"). */
function urlTail(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const segs = u.pathname.split("/").filter(Boolean);
    const tail = segs[segs.length - 1] ?? null;
    return tail ? tail.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Best-effort match an engine `Product` to a legacy `TieredProduct`.
 *
 * Match precedence (most specific first, Phase 2.5):
 *   1. canonicalKey ↔ slugified affiliateUrl tail
 *   2. exact productUrl ↔ affiliateUrl
 *   3. exact normalized name
 *   4. (loose) prefix overlap ≥ 12 chars — last resort, flagged via
 *      `_engine.enrichedFromLegacyId` so callers can audit.
 *
 * Returns null when no confident match — callers MUST handle this and
 * fall back to engine-only fields rather than fabricating data.
 */
export function findLegacyMatch(
  product: Pick<Product, "name" | "productUrl" | "canonicalKey">,
  tier: ProductTier,
): { match: TieredProduct; strategy: "canonicalKey" | "url" | "name" | "prefix" } | null {
  const candidates = tieredCatalog.filter((p) => p.tier === tier);

  // 1. canonicalKey vs URL tails of legacy rows
  if (product.canonicalKey) {
    const ck = product.canonicalKey.toLowerCase();
    const byCk = candidates.find((p) => {
      const tail = urlTail(p.affiliateUrl);
      return tail !== null && (tail === ck || ck.endsWith(tail) || tail.endsWith(ck));
    });
    if (byCk) return { match: byCk, strategy: "canonicalKey" };
  }

  // 2. exact productUrl ↔ affiliateUrl
  const url = product.productUrl?.trim();
  if (url) {
    const byUrl = candidates.find((p) => p.affiliateUrl && p.affiliateUrl === url);
    if (byUrl) return { match: byUrl, strategy: "url" };
  }

  // 3. exact normalized name
  const target = normalizeForMatch(product.name);
  if (!target) return null;
  const exact = candidates.find((p) => normalizeForMatch(p.name) === target);
  if (exact) return { match: exact, strategy: "name" };

  // 4. loose prefix
  if (target.length >= 12) {
    const prefix = candidates.find((p) => {
      const n = normalizeForMatch(p.name);
      return n.length >= 12 && (n.startsWith(target.slice(0, 12)) || target.startsWith(n.slice(0, 12)));
    });
    if (prefix) return { match: prefix, strategy: "prefix" };
  }
  return null;
}

/**
 * Adapt one engine `Product` into the legacy drawer field shape.
 * Optionally enriches from `tieredCatalog` when a confident match exists.
 *
 * Never invents customer-facing fields: missing vendor/spec stay empty,
 * not fabricated. The engine-intrinsic `vendor` (Phase 2.5) is preferred
 * when no legacy enrichment is found.
 */
export function adaptEngineProductToLegacy(
  product: Product,
  opts: {
    legacyTier: ProductTier;
    isFallback?: boolean;
    isUnresolved?: boolean;
  },
): LegacyDrawerProductFields {
  const found = findLegacyMatch(product, opts.legacyTier);
  const enrich = found?.match ?? null;
  const enrichTag =
    found?.strategy === "prefix" ? `${enrich!.id} (loose)` : enrich?.id ?? null;
  // Phase 2.5: prefer engine-intrinsic price; fall back to legacy.
  const enginePrice =
    product.estimatedProjectPrice ?? product.unitPrice ?? product.price;
  return {
    id: product.id,
    name: enrich?.name ?? product.name,
    price: enrich
      ? (enrich.estimatedProjectPrice ?? enrich.price)
      : (enginePrice ?? 0),
    vendor: enrich?.vendor ?? product.vendor ?? "",
    finish: enrich?.finish ?? product.finish,
    image: product.image ?? enrich?.image,
    tag: enrich?.tag,
    spec: enrich?.spec,
    description: enrich?.description ?? product.customerText ?? "",
    disclaimer: enrich?.disclaimer,
    affiliateUrl: enrich?.affiliateUrl ?? product.productUrl,
    laborDelta: enrich?.laborDelta ?? 0,
    laborNote: enrich?.laborNote,
    isUnresolved: !!opts.isUnresolved,
    isFallback: !!opts.isFallback,
    enrichedFromLegacyId: enrichTag,
  };
}

/** Adapt a full ResolvedSlot — primary + alternatives — to legacy fields. */
export function adaptEngineSlotToLegacy(
  slot: ResolvedSlot,
  opts: { legacyTier: ProductTier },
): {
  primary: LegacyDrawerProductFields;
  alternatives: LegacyDrawerProductFields[];
} {
  const primary = adaptEngineProductToLegacy(slot.product, {
    legacyTier: opts.legacyTier,
    isFallback: slot.isFallback,
    isUnresolved: slot.isUnresolved,
  });
  const alternatives = slot.alternatives.map((alt) =>
    adaptEngineProductToLegacy(alt, { legacyTier: opts.legacyTier }),
  );
  return { primary, alternatives };
}
