import type { RemodelFlowState } from "../types";
import { splitPackageIdField } from "../package-engine/flowStateMigration";
import { normalizeTier } from "../package-engine/normalize";

/**
 * Legacy production shape — pre-Pass 5 some rows / localStorage blobs
 * stored a `selected_package` object like:
 *   { name: "Balanced", tier: "balanced" }
 * We accept it on read only as a fallback.
 */
export interface LegacySelectedPackageObject {
  name?: string | null;
  tier?: string | null;
}

export interface DesignRow {
  id?: string;
  user_id?: string | null;
  name?: string | null;
  status?: string | null;
  selected_style?: string | null;
  selected_tier?: string | null;
  selected_package_id?: string | null;
  selected_legacy_tier_route?: string | null;
  package_version?: number | null;
  selections?: Record<string, string> | null;
  resolved_state?: Record<string, unknown> | null;
  pricing?: Record<string, unknown> | null;
  validation?: Record<string, unknown> | null;
  current_step?: string | null;
  completed_steps?: string[] | null;
  schema_version?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_active_at?: string | null;
  saved_at?: string | null;
  deleted_at?: string | null;
}

export interface SerializeContext {
  resolvedState?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  validation?: Record<string, unknown>;
  packageVersion?: number;
  currentStep?: string;
  completedSteps?: string[];
  name?: string;
  status?: string;
}

export const SCHEMA_VERSION = 2;

/**
 * Convert in-memory flow state into a row shape matching `remodel_designs`.
 * Pure function — no IO.
 *
 * Pass 5: writes both `selected_package_id` (real PackageId only) and
 * `selected_legacy_tier_route` explicitly, so legacy aliases are never
 * conflated with real package IDs going forward. The DB column does not
 * yet exist for `selected_legacy_tier_route` — it is included in the
 * payload as a no-op until the migration lands.
 */
export function serializeForDb(
  flowState: RemodelFlowState,
  ctx: SerializeContext = {},
): DesignRow {
  // Defensive: even if a producer accidentally writes a legacy alias into
  // `packageId`, split it on the way out so the DB column never holds one.
  const split = splitPackageIdField(flowState.packageId ?? null);
  const realPackageId = split.packageId ?? null;
  const legacyTierRoute =
    flowState.legacyTierRoute ?? split.legacyTierRoute ?? null;

  return {
    name: ctx.name ?? "Untitled Design",
    status: ctx.status ?? "draft",
    selected_style: flowState.style ?? null,
    selected_tier: flowState.tier ?? null,
    selected_package_id: realPackageId,
    selected_legacy_tier_route: legacyTierRoute,
    package_version: ctx.packageVersion ?? null,
    selections: flowState.selections ?? {},
    resolved_state: ctx.resolvedState ?? {},
    pricing: ctx.pricing ?? {},
    validation: ctx.validation ?? {},
    current_step: ctx.currentStep ?? null,
    completed_steps: ctx.completedSteps ?? [],
    schema_version: SCHEMA_VERSION,
  };
}

/**
 * Convert a `remodel_designs` row back into a flow state (+ metadata).
 * Pure function — no IO.
 *
 * Pass 5: applies `splitPackageIdField` migration on read. Handles old
 * rows where `selected_package_id` was a bare tier alias like "balanced",
 * new rows with a real PackageId, both fields present, neither, or junk.
 */
export function deserializeFromDb(row: DesignRow): {
  state: RemodelFlowState;
  meta: {
    id?: string;
    name: string;
    status: string;
    packageVersion: number | null;
    resolvedState: Record<string, unknown>;
    pricing: Record<string, unknown>;
    validation: Record<string, unknown>;
    currentStep: string | null;
    completedSteps: string[];
    schemaVersion: number;
    createdAt: string | null;
    updatedAt: string | null;
    lastActiveAt: string | null;
    savedAt: string | null;
    deletedAt: string | null;
  };
} {
  // Migration: classify whatever was stored.
  const split = splitPackageIdField(row.selected_package_id ?? null);
  const explicitLegacy = row.selected_legacy_tier_route ?? null;
  const explicitLegacySplit = splitPackageIdField(explicitLegacy);

  const packageId = split.packageId ?? null;
  // Prefer the explicit legacy column when present; else fall back to
  // whatever the migration extracted from selected_package_id.
  const legacyTierRoute =
    explicitLegacySplit.legacyTierRoute ?? split.legacyTierRoute ?? null;

  const state: RemodelFlowState = {
    style: (row.selected_style ?? undefined) as RemodelFlowState["style"],
    tier: (row.selected_tier ?? undefined) as RemodelFlowState["tier"],
    packageId,
    legacyTierRoute,
    selections: (row.selections ?? {}) as Record<string, string>,
  };

  return {
    state,
    meta: {
      id: row.id,
      name: row.name ?? "Untitled Design",
      status: row.status ?? "draft",
      packageVersion: row.package_version ?? null,
      resolvedState: (row.resolved_state ?? {}) as Record<string, unknown>,
      pricing: (row.pricing ?? {}) as Record<string, unknown>,
      validation: (row.validation ?? {}) as Record<string, unknown>,
      currentStep: row.current_step ?? null,
      completedSteps: (row.completed_steps ?? []) as string[],
      schemaVersion: row.schema_version ?? SCHEMA_VERSION,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
      lastActiveAt: row.last_active_at ?? null,
      savedAt: row.saved_at ?? null,
      deletedAt: row.deleted_at ?? null,
    },
  };
}
