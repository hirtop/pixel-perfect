/**
 * Normalization helpers for the package engine.
 *
 * Converts loose user/legacy inputs (display strings, old slugs,
 * category names) into canonical types. Pure functions only.
 */

import {
  BIN_KEYS,
  CANONICAL_STYLES,
  TIERS,
  type BinKey,
  type CanonicalStyleId,
  type PackageId,
  type Tier,
} from "./types";

/** Map legacy / display tier strings to canonical Tier slugs. */
export function normalizeTier(input: string | null | undefined): Tier | undefined {
  if (!input) return undefined;
  const v = String(input).trim().toLowerCase();
  // Legacy: "budget" was the old name for "essential".
  if (v === "budget") return "essential";
  if ((TIERS as readonly string[]).includes(v)) return v as Tier;
  return undefined;
}

/** Map any incoming style string to a canonical StyleId, if recognised. */
export function normalizeStyle(input: string | null | undefined): CanonicalStyleId | undefined {
  if (!input) return undefined;
  const v = String(input).trim().toLowerCase();
  if ((CANONICAL_STYLES as readonly string[]).includes(v)) return v as CanonicalStyleId;
  return undefined;
}

/**
 * Build a canonical PackageId from a (style, tier) pair, after
 * normalization. Returns undefined when either value is unrecognised.
 */
export function makePackageId(
  style: string | null | undefined,
  tier: string | null | undefined,
): PackageId | undefined {
  const s = normalizeStyle(style);
  const t = normalizeTier(tier);
  if (!s || !t) return undefined;
  return `${s}-${t}` as PackageId;
}

/** Parse "classic-balanced" → { style, tier }. Returns undefined if unrecognised. */
export function parsePackageId(
  id: string | null | undefined,
): { style: CanonicalStyleId; tier: Tier } | undefined {
  if (!id) return undefined;
  const [styleRaw, tierRaw] = String(id).toLowerCase().split("-");
  const style = normalizeStyle(styleRaw);
  const tier = normalizeTier(tierRaw);
  if (!style || !tier) return undefined;
  return { style, tier };
}

/**
 * Map a legacy display category (e.g. "Shower Wall Tile", "Main Floor")
 * into a canonical BinKey slug.
 */
const DISPLAY_TO_BIN: Record<string, BinKey> = {
  vanity: "vanity",
  sink: "sink",
  faucet: "faucet",
  mirror: "mirror",
  lighting: "lighting",
  toilet: "toilet",
  "shower wall tile": "showerWallTile",
  "shower walls": "showerWallTile",
  "shower floor tile": "showerFloorTile",
  "shower floor": "showerFloorTile",
  "main floor tile": "mainFloorTile",
  "main floor": "mainFloorTile",
  "accent tile": "accentTile",
  "shower door": "showerDoor",
  "shower glass": "showerGlass",
  "shower valve": "showerValve",
  "shower trim": "showerTrim",
  tub: "tub",
  "tub valve": "tubValve",
  "shower niche": "showerNiche",
  accessories: "accessories",
};

export function normalizeBinKey(input: string | null | undefined): BinKey | undefined {
  if (!input) return undefined;
  const v = String(input).trim();
  // Already a canonical bin key?
  if ((BIN_KEYS as readonly string[]).includes(v)) return v as BinKey;
  const lower = v.toLowerCase();
  if ((BIN_KEYS as readonly string[]).includes(lower)) return lower as BinKey;
  return DISPLAY_TO_BIN[lower];
}
