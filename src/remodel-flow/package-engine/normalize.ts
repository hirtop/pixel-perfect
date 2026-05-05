/**
 * Normalization helpers for the package engine. Pure functions only.
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
  if (v === "budget") return "essential"; // legacy alias
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
 * Map a display category (e.g. "Shower Wall Tile", "Bathtubs") into a
 * canonical BinKey slug. Returns undefined for unmapped/ambiguous inputs.
 */
const DISPLAY_TO_BIN: Record<string, BinKey> = {
  // Canonical singulars (exact-match shortcuts)
  vanity: "vanity",
  vanities: "vanity",
  faucet: "faucet",
  faucets: "faucet",
  sink: "sink",
  sinks: "sink",
  mirror: "mirror",
  mirrors: "mirror",
  lighting: "lighting",
  toilet: "toilet",
  toilets: "toilet",
  bathtub: "bathtub",
  bathtubs: "bathtub",
  tub: "bathtub",
  "tub valve": "tubValve",
  tubvalve: "tubValve",
  "shower valve": "showerValve",
  showervalve: "showerValve",
  "shower system": "showerSystem",
  "shower systems": "showerSystem",
  showersystem: "showerSystem",
  "shower door": "showerDoor",
  "shower doors": "showerDoor",
  showerdoor: "showerDoor",
  "shower glass": "showerDoor", // alias
  "shower wall tile": "showerWallTile",
  "shower walls": "showerWallTile", // alias
  showerwalltile: "showerWallTile",
  "shower floor tile": "showerFloorTile",
  "shower floor": "showerFloorTile", // alias
  showerfloortile: "showerFloorTile",
  "main floor tile": "mainFloorTile",
  "main floor": "mainFloorTile", // alias
  mainfloortile: "mainFloorTile",
  "accent tile": "accentTile",
  accenttile: "accentTile",
  "heated floor": "heatedFloor",
  "heated floors": "heatedFloor",
  heatedfloor: "heatedFloor",
};

/**
 * Inputs we explicitly DO NOT canonicalize (no clear catalog mapping).
 * Returning `undefined` is intentional — callers must handle it.
 */
const UNMAPPED = new Set<string>([
  "shower trim",
  "shower niche",
  "accessories",
]);

export function normalizeBinKey(input: string | null | undefined): BinKey | undefined {
  if (!input) return undefined;
  const v = String(input).trim();
  if ((BIN_KEYS as readonly string[]).includes(v)) return v as BinKey;
  const lower = v.toLowerCase();
  if ((BIN_KEYS as readonly string[]).includes(lower)) return lower as BinKey;
  if (UNMAPPED.has(lower)) return undefined;
  return DISPLAY_TO_BIN[lower];
}
