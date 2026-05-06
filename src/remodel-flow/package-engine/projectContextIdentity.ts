/**
 * Pass 9 — Centralized identity reader for the legacy ProjectContext shape.
 *
 * Legacy pages (CustomizeOption, PackageDetail, ProjectSummary, Shop,
 * Workflow, Agreement, RemodelOptions) used to reach into
 * `project.selected_package.tier` directly. This helper is now the ONLY
 * sanctioned read site outside of the persistence/serializer layer.
 *
 * Behavior:
 *   - Reuses `normalizeSavedProjectIdentity` so the canonical
 *     `{ packageId, legacyTierRoute, tier, style }` rules stay consistent
 *     with saved DB rows.
 *   - ALSO exposes `savedTierLower` / `savedPackageName` — the raw
 *     lowercased values legacy pages need to keep their existing
 *     "balanced"/"premium"/"budget" routing/labels working unchanged.
 *
 * Pure function. No React, no IO.
 */
import {
  normalizeSavedProjectIdentity,
  type LegacySavedProjectLike,
  type NormalizedProjectIdentity,
  type NormalizeOptions,
} from "./projectIdentity";

export interface ProjectContextIdentity extends NormalizedProjectIdentity {
  /**
   * Raw saved tier, lowercased. May be "balanced" | "premium" | "budget"
   * | "essential" | undefined. Legacy pages use this for their existing
   * tier-name maps and `/customize/:tier` route building. Do NOT introduce
   * new uses; prefer `tier` / `packageId` / `legacyTierRoute` instead.
   */
  savedTierLower: string | undefined;
  /** Raw saved package display name (e.g., "Balanced"). */
  savedPackageName: string | undefined;
}

export function normalizeProjectContextIdentity(
  projectState: LegacySavedProjectLike | null | undefined,
  opts: NormalizeOptions = {},
): ProjectContextIdentity {
  const base = normalizeSavedProjectIdentity(projectState ?? null, opts);
  const sp = projectState?.selected_package ?? null;
  const rawTier = sp?.tier == null ? undefined : String(sp.tier);
  const rawName = sp?.name == null ? undefined : String(sp.name);
  return {
    ...base,
    savedTierLower: rawTier ? rawTier.toLowerCase() : undefined,
    savedPackageName: rawName || undefined,
  };
}
