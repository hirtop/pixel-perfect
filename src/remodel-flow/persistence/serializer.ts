import type { RemodelFlowState } from "../types";

export interface DesignRow {
  id?: string;
  user_id?: string | null;
  name?: string | null;
  status?: string | null;
  selected_style?: string | null;
  selected_tier?: string | null;
  selected_package_id?: string | null;
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

export const SCHEMA_VERSION = 1;

/**
 * Convert in-memory flow state (+ optional derived context) into a row
 * shape matching the `remodel_designs` table. Pure function — no IO.
 */
export function serializeForDb(
  flowState: RemodelFlowState,
  ctx: SerializeContext = {},
): DesignRow {
  return {
    name: ctx.name ?? "Untitled Design",
    status: ctx.status ?? "draft",
    selected_style: flowState.style ?? null,
    selected_tier: flowState.tier ?? null,
    selected_package_id: flowState.packageId ?? null,
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
  const state: RemodelFlowState = {
    style: (row.selected_style ?? undefined) as RemodelFlowState["style"],
    tier: (row.selected_tier ?? undefined) as RemodelFlowState["tier"],
    packageId: row.selected_package_id ?? undefined,
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
