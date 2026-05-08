/**
 * Package registry / manifest.
 *
 * Single source of truth for which real packages exist and their lifecycle
 * status. Legacy generic-tier ids ("essential", "balanced", "premium") are
 * intentionally NOT in this manifest — they live in `LEGACY_ROUTE_ALIASES`.
 *
 * Hard rule: do NOT register placeholder entries for the other 7 styles or
 * the full 27-package matrix. Only register packages that actually have a
 * real spec/data file.
 */

import type { PackageId, PackageStatus, Tier } from "./types";

export interface PackageManifestEntry {
  id: PackageId;
  status: PackageStatus;
  label: string;
  source?: string;
  notes?: string;
}

export const PACKAGE_MANIFEST: readonly PackageManifestEntry[] = [
  // ── Real, sourced specs ──────────────────────────────────────────
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

  // ── Phase 1: 9-package matrix scaffolding ────────────────────────
  // These entries make the 3 tiers × 3 styles matrix visible to the
  // engine and registry consumers. They have NO product data yet —
  // status:"placeholder" means UI must not render them as finished.
  { id: "modern-essential",  status: "placeholder", label: "Modern — Essential",  notes: "Phase 1 placeholder. No data." },
  { id: "modern-premium",    status: "placeholder", label: "Modern — Premium",    notes: "Phase 1 placeholder. No data." },
  { id: "classic-essential", status: "placeholder", label: "Classic — Essential", notes: "Phase 1 placeholder. No data." },
  { id: "classic-premium",   status: "placeholder", label: "Classic — Premium",   notes: "Phase 1 placeholder. No data." },
  { id: "spa-essential",     status: "placeholder", label: "Spa — Essential",     notes: "Phase 1 placeholder. No data." },
  { id: "spa-balanced",      status: "placeholder", label: "Spa — Balanced",      notes: "Phase 1 placeholder. No data." },
  { id: "spa-premium",       status: "placeholder", label: "Spa — Premium",       notes: "Phase 1 placeholder. No data." },
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

export function isCurated(id: string): boolean {
  return getPackageManifest(id)?.status === "curated";
}

export function listPackagesByStatus(status: PackageStatus): PackageManifestEntry[] {
  return PACKAGE_MANIFEST.filter((e) => e.status === status);
}

/** Public registry API — prefer over reading PACKAGE_MANIFEST directly. */
export function getPackage(id: string): PackageManifestEntry | undefined {
  return getPackageManifest(id);
}

export function listPackages(opts: { status?: PackageStatus } = {}): PackageManifestEntry[] {
  if (opts.status) return listPackagesByStatus(opts.status);
  return [...PACKAGE_MANIFEST];
}

/* ─── Legacy route aliases ──────────────────────────────────────────
 * These are tier-only ids that the existing /package/:id and
 * /customize/:id routes accept. They are NOT packages — they fall back
 * to the legacy generic-tier flow.
 */
export const LEGACY_ROUTE_ALIASES: Readonly<Record<string, { tier: Tier; label: string }>> = {
  essential: { tier: "essential", label: "Essential (legacy tier)" },
  balanced: { tier: "balanced", label: "Balanced (legacy tier)" },
  premium: { tier: "premium", label: "Premium (legacy tier)" },
};

export function isLegacyRouteAlias(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(LEGACY_ROUTE_ALIASES, id);
}
