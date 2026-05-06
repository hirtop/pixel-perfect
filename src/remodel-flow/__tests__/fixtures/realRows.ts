/**
 * Pass 7 — Real-row snapshot fixtures.
 *
 * Realistic shapes pulled from the production `remodel_designs` and
 * legacy `projects` tables, with all PII removed (no user_id, name
 * stripped to generic placeholder). Used by the migration & picker
 * tests to ensure hydration + identity normalization stay correct.
 */
import type { DesignRow } from "@/remodel-flow/persistence/serializer";

export const REAL_ROW_MODERN_BALANCED_CLEAN: DesignRow = {
  id: "00000000-0000-0000-0000-000000000001",
  user_id: null,
  name: "Project",
  status: "draft",
  selected_style: "modern",
  selected_tier: "balanced",
  selected_package_id: "modern-balanced",
  selected_legacy_tier_route: null,
  selections: { vanity: "v-1" },
  resolved_state: {},
  pricing: {},
  validation: {},
  current_step: "customize",
  completed_steps: ["start", "style", "tier"],
  schema_version: 2,
  selected_package: null,
};

export const REAL_ROW_LEGACY_TIER_ROUTE_ONLY: DesignRow = {
  id: "00000000-0000-0000-0000-000000000002",
  user_id: null,
  name: "Project",
  status: "draft",
  selected_style: "classic",
  selected_tier: "balanced",
  selected_package_id: null,
  selected_legacy_tier_route: "balanced",
  selections: {},
  resolved_state: {},
  pricing: {},
  validation: {},
  current_step: "tier",
  completed_steps: ["start", "style"],
  schema_version: 2,
  selected_package: null,
};

export const REAL_ROW_LEGACY_OBJECT_ONLY: DesignRow = {
  id: "00000000-0000-0000-0000-000000000003",
  user_id: null,
  name: "Project",
  status: "draft",
  selected_style: null,
  selected_tier: null,
  selected_package_id: null,
  selected_legacy_tier_route: null,
  selections: {},
  resolved_state: {},
  pricing: {},
  validation: {},
  current_step: null,
  completed_steps: [],
  schema_version: 1,
  selected_package: { name: "Balanced", tier: "balanced" },
};

export const REAL_ROW_GARBAGE_PACKAGE_ID: DesignRow = {
  id: "00000000-0000-0000-0000-000000000004",
  user_id: null,
  name: "Project",
  status: "draft",
  selected_style: null,
  selected_tier: null,
  selected_package_id: "🪐ghost-package🌚",
  selected_legacy_tier_route: null,
  selections: {},
  resolved_state: {},
  pricing: {},
  validation: {},
  current_step: null,
  completed_steps: [],
  schema_version: 2,
  selected_package: null,
};

/** Legacy `projects` row — what useUserProjects surfaces today. */
export interface LegacyProjectRow {
  id: string;
  name: string;
  status: string;
  bathroom_type: string | null;
  updated_at: string;
  workflow_progress: { current_step?: string; completed_steps?: string[] } | null;
  selected_package: { name?: string; tier?: string } | null;
  style_preferences: { style?: string | null } | null;
}

export const LEGACY_PROJECT_MODERN_BALANCED: LegacyProjectRow = {
  id: "00000000-0000-0000-0000-000000000010",
  name: "Project",
  status: "draft",
  bathroom_type: "full",
  updated_at: "2026-05-06T00:00:00.000Z",
  workflow_progress: { current_step: "customize", completed_steps: ["start"] },
  selected_package: { name: "Balanced", tier: "balanced" },
  style_preferences: { style: "modern" },
};

export const LEGACY_PROJECT_BALANCED_NO_STYLE: LegacyProjectRow = {
  id: "00000000-0000-0000-0000-000000000011",
  name: "Project",
  status: "draft",
  bathroom_type: "full",
  updated_at: "2026-05-06T00:00:00.000Z",
  workflow_progress: { current_step: "tier", completed_steps: ["start"] },
  selected_package: { name: "Balanced", tier: "balanced" },
  style_preferences: null,
};

export const LEGACY_PROJECT_EMPTY: LegacyProjectRow = {
  id: "00000000-0000-0000-0000-000000000012",
  name: "Project",
  status: "draft",
  bathroom_type: null,
  updated_at: "2026-05-06T00:00:00.000Z",
  workflow_progress: null,
  selected_package: null,
  style_preferences: null,
};
