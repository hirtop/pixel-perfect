/**
 * Canonical package-engine types.
 *
 * Additive — does NOT replace `src/remodel-flow/types.ts`.
 */

/** Canonical tier slugs. Always lowercase. */
export type Tier = "essential" | "balanced" | "premium";

export const TIERS: readonly Tier[] = ["essential", "balanced", "premium"] as const;

/**
 * Canonical style ids. Superset of the legacy 4-style flow `StyleId`.
 */
export type CanonicalStyleId =
  | "classic"
  | "modern"
  | "spa"
  | "minimal"
  | "coastal"
  | "farmhouse"
  | "transitional"
  | "contemporary"
  | "traditional";

export const CANONICAL_STYLES: readonly CanonicalStyleId[] = [
  "classic",
  "modern",
  "spa",
  "minimal",
  "coastal",
  "farmhouse",
  "transitional",
  "contemporary",
  "traditional",
] as const;

/** Canonical PackageId, formatted as `${style}-${tier}`. */
export type PackageId = `${CanonicalStyleId}-${Tier}`;

/**
 * Stable product-bin slugs. Reconciled to the 16 real catalog categories
 * (see `src/data/products.ts#PRODUCT_CATEGORIES`).
 *
 * Aliases like "showerWalls", "showerGlass", "showerTrim", "showerNiche",
 * "accessories" are NOT canonical outputs. They may only appear as input
 * aliases in `normalizeBinKey`.
 */
export type BinKey =
  | "vanity"
  | "faucet"
  | "sink"
  | "mirror"
  | "lighting"
  | "toilet"
  | "bathtub"
  | "tubValve"
  | "showerValve"
  | "showerSystem"
  | "showerDoor"
  | "showerWallTile"
  | "showerFloorTile"
  | "mainFloorTile"
  | "accentTile"
  | "heatedFloor";

export const BIN_KEYS: readonly BinKey[] = [
  "vanity",
  "faucet",
  "sink",
  "mirror",
  "lighting",
  "toilet",
  "bathtub",
  "tubValve",
  "showerValve",
  "showerSystem",
  "showerDoor",
  "showerWallTile",
  "showerFloorTile",
  "mainFloorTile",
  "accentTile",
  "heatedFloor",
] as const;

/**
 * Lifecycle status of a package in the registry.
 *
 *  - `curated`     — fully sourced, real SKUs, safe to expose in finished UI.
 *  - `partial`     — some bins curated, others placeholder. Internal only.
 *  - `placeholder` — spec exists but no real SKUs. Internal only.
 *
 * Note: legacy generic-tier ids (essential/balanced/premium) are NOT
 * package statuses anymore — they live in `LEGACY_ROUTE_ALIASES`.
 */
export type PackageStatus = "curated" | "partial" | "placeholder";
