/**
 * Canonical package-engine types.
 *
 * This module is additive. It does NOT replace the existing
 * `src/remodel-flow/types.ts` (which keeps the narrower `StyleId` used by
 * the current Balanced flow). New code should prefer these canonical
 * types when building real package-engine functionality.
 */

/** Canonical tier slugs. Always lowercase. */
export type Tier = "essential" | "balanced" | "premium";

export const TIERS: readonly Tier[] = ["essential", "balanced", "premium"] as const;

/**
 * Canonical style ids. Superset of the legacy 4-style flow `StyleId`.
 * Always lowercase, kebab-case-free (single token).
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
 * Stable product-bin slugs. These are the canonical shopping bins a
 * package can fill. Names are camelCase to match existing
 * Modern/Classic Balanced data files.
 */
export type BinKey =
  | "vanity"
  | "faucet"
  | "mirror"
  | "lighting"
  | "toilet"
  | "showerWallTile"
  | "showerFloorTile"
  | "mainFloorTile"
  | "accentTile"
  | "showerDoor"
  | "showerGlass"
  | "showerValve"
  | "showerTrim"
  | "tub"
  | "tubValve"
  | "showerNiche"
  | "accessories"
  | "sink";

export const BIN_KEYS: readonly BinKey[] = [
  "vanity",
  "faucet",
  "mirror",
  "lighting",
  "toilet",
  "showerWallTile",
  "showerFloorTile",
  "mainFloorTile",
  "accentTile",
  "showerDoor",
  "showerGlass",
  "showerValve",
  "showerTrim",
  "tub",
  "tubValve",
  "showerNiche",
  "accessories",
  "sink",
] as const;

/**
 * Lifecycle status of a package in the registry.
 *
 *  - `curated`    — fully sourced, real SKUs, safe to expose in finished UI.
 *  - `partial`    — some bins curated, others placeholder. Internal only.
 *  - `placeholder`— spec exists but no real SKUs. Internal only.
 *  - `legacy`     — generic tier-only flow (e.g. plain "balanced"); kept for
 *                   backwards compatibility with /package/balanced and
 *                   /customize/balanced URLs.
 */
export type PackageStatus = "curated" | "partial" | "placeholder" | "legacy";
