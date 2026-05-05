/**
 * Package registry / manifest.
 *
 * Single source of truth for which packages exist and their lifecycle
 * status. UI surfaces should ONLY expose packages with status `curated`
 * as finished. `partial` and `placeholder` packages remain internal
 * until they have real curated product data.
 *
 * Legacy generic tier ids ("essential", "balanced", "premium") are
 * registered as `legacy` so /package/balanced and /customize/balanced
 * keep working unchanged.
 */

import type { PackageId, PackageStatus, Tier } from "./types";

export interface PackageManifestEntry {
  /** Canonical id, e.g. "modern-balanced". For legacy entries, the bare tier slug. */
  id: PackageId | Tier;
  status: PackageStatus;
  /** Human-readable label for internal tooling/logs. Not used by UI yet. */
  label: string;
  /** Optional pointer to the package data module path. */
  source?: string;
  /** Optional notes (sourcing gaps, blockers, etc). */
  notes?: string;
}

/**
 * NOTE: Keep this list small and honest.
 *  - Only mark a package `curated` once every bin has real, sourced products.
 *  - Do NOT invent SKUs to promote a package to `curated`.
 */
export const PACKAGE_MANIFEST: readonly PackageManifestEntry[] = [
  // Legacy generic-tier packages — preserve current behavior.
  { id: "essential", status: "legacy", label: "Essential (legacy tier)" },
  { id: "balanced",  status: "legacy", label: "Balanced (legacy tier)" },
  { id: "premium",   status: "legacy", label: "Premium (legacy tier)" },

  // Real curated/style packages.
  {
    id: "modern-balanced",
    status: "curated",
    label: "Modern — Balanced",
    source: "src/remodel-flow/packages/modern-balanced.ts",
  },
  {
    id: "classic-balanced",
    status: "placeholder",
    label: "Classic — Balanced",
    source: "src/remodel-flow/packages/classic-balanced.ts",
    notes: "Spec defined; all 11 bins are placeholder. Do not expose as finished.",
  },
] as const;

const MANIFEST_INDEX: ReadonlyMap<string, PackageManifestEntry> = new Map(
  PACKAGE_MANIFEST.map((e) => [e.id, e]),
);

export function getPackageManifest(id: string): PackageManifestEntry | undefined {
  return MANIFEST_INDEX.get(id);
}

export function isPackageRegistered(id: string): boolean {
  return MANIFEST_INDEX.has(id);
}

/** Returns true only for packages safe to expose in finished UI. */
export function isCurated(id: string): boolean {
  return getPackageManifest(id)?.status === "curated";
}

/** Legacy tier-only packages (essential/balanced/premium). */
export function isLegacyTierPackage(id: string): boolean {
  return getPackageManifest(id)?.status === "legacy";
}

export function listPackagesByStatus(status: PackageStatus): PackageManifestEntry[] {
  return PACKAGE_MANIFEST.filter((e) => e.status === status);
}
