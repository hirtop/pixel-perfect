/**
 * Pass 7 — Project identity normalizer.
 *
 * Translates legacy "saved project" shapes (the rows behind
 * `useUserProjects` / ProjectPickerDialog, which still use the legacy
 * `projects.selected_package` jsonb shape) into the unified
 * `{ packageId, legacyTierRoute }` split used by RemodelFlowState.
 *
 * Rules:
 *   - Real packageId (e.g. "modern-balanced") ALWAYS wins.
 *   - A bare tier alias ("balanced" / "essential" / "premium") becomes
 *     `legacyTierRoute`, NEVER `packageId`.
 *   - Style+tier objects can synthesize a real packageId only if both
 *     resolve to canonical values AND the resulting id is a registered
 *     curated package — otherwise we emit `legacyTierRoute` only.
 *   - Junk / unknowns return `{ packageId: null, legacyTierRoute: null }`.
 *
 * Pure function — no React, no IO. Safe to call from anywhere.
 */
import {
  splitPackageIdField,
  type SplitPackageId,
} from "./flowStateMigration";
import { normalizeTier, normalizeStyle, makePackageId } from "./normalize";
import { isPackageRegistered, isCurated } from "./registry";
import { reportUnknownPackageId, type UnknownPackageIdSource } from "./telemetry";

/** Minimal subset of the legacy saved-project shape we read here. */
export interface LegacySavedProjectLike {
  /** New column on `remodel_designs` rows (not `projects` rows). */
  selected_package_id?: string | null;
  /** New column on `remodel_designs` rows (not `projects` rows). */
  selected_legacy_tier_route?: string | null;
  /** Legacy jsonb shape on `projects` rows: { name?, tier? }. */
  selected_package?: { name?: string | null; tier?: string | null } | null;
  /** Legacy free-form style hint on the `projects` row. */
  style_preferences?: { style?: string | null } | null;
}

export interface NormalizedProjectIdentity extends SplitPackageId {
  /** Canonical style if we could resolve one — for FlowContext.setStyle. */
  style: ReturnType<typeof normalizeStyle> | null;
  /** Canonical tier if we could resolve one — for FlowContext.setTier. */
  tier: ReturnType<typeof normalizeTier> | null;
}

export interface NormalizeOptions {
  /** Where this saved-project blob came from, for telemetry. */
  source?: UnknownPackageIdSource;
  /** Optional route context for telemetry. */
  route?: string;
}

export function normalizeSavedProjectIdentity(
  row: LegacySavedProjectLike | null | undefined,
  opts: NormalizeOptions = {},
): NormalizedProjectIdentity {
  const empty: NormalizedProjectIdentity = {
    packageId: null,
    legacyTierRoute: null,
    style: null,
    tier: null,
  };
  if (!row || typeof row !== "object") return empty;

  // 1. New explicit columns first (only present on remodel_designs rows).
  const idSplit = splitPackageIdField(row.selected_package_id ?? null);
  const explicitLegacySplit = splitPackageIdField(
    row.selected_legacy_tier_route ?? null,
  );

  let packageId = idSplit.packageId ?? null;
  let legacyTierRoute =
    explicitLegacySplit.legacyTierRoute ?? idSplit.legacyTierRoute ?? null;

  // Telemetry: explicit column held something we couldn't classify.
  if (
    row.selected_package_id &&
    !packageId &&
    !idSplit.legacyTierRoute
  ) {
    reportUnknownPackageId({
      value: row.selected_package_id,
      source: opts.source ?? "saved-project",
      route: opts.route,
    });
  }

  // 2. Legacy jsonb fallback only when nothing better was found.
  if (!packageId && !legacyTierRoute) {
    const sp = row.selected_package ?? null;
    const tierFromObj = normalizeTier(sp?.tier ?? null) ?? null;
    if (tierFromObj) legacyTierRoute = tierFromObj;
  }

  // 3. Style hint (separate from packageId resolution).
  const styleHint =
    normalizeStyle(row.style_preferences?.style ?? null) ?? null;
  const tierResolved =
    normalizeTier(row.selected_package?.tier ?? null) ?? legacyTierRoute ?? null;

  // 4. Promote to a real packageId ONLY if the synthesized id is a
  //    registered curated package. Otherwise we keep legacyTierRoute.
  if (!packageId && styleHint && tierResolved) {
    const synth = makePackageId(styleHint, tierResolved);
    if (synth && isPackageRegistered(synth) && isCurated(synth)) {
      packageId = synth;
      legacyTierRoute = null;
    }
  }

  return {
    packageId,
    legacyTierRoute,
    style: styleHint,
    tier: tierResolved,
  };
}
