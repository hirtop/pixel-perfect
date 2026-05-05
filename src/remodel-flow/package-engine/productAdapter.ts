/**
 * Product adapter — normalizes raw catalog products into a stable shape
 * the package engine can consume without mutating the source data.
 */

import { normalizeBinKey, normalizeTier } from "./normalize";
import type { BinKey, Tier } from "./types";

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
    raw,
  };
}
