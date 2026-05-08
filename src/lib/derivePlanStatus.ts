/**
 * Pass 12 — Quiet "Status:" cue for the saved plan.
 *
 * Pure helper. Reads only already-loaded project state. No fetches, no
 * persistence fields, no mutation. Returns null when state is ambiguous
 * or the plan is stale (≥60 days), so we never label old plans as active
 * and never shame stale drafts.
 */

export type PlanStatus = "exploring" | "shaping" | "ready-to-share";

export interface PlanStatusInput {
  updated_at?: string | null;
  selected_package?: { name?: string | null; tier?: string | null } | null;
  workflow_progress?: { completed_steps?: string[] | null } | null;
  /** Optional — only present on the in-flow `ProjectData` shape. */
  customizations?: { categories?: Array<unknown> | null } | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW_MS = 14 * DAY_MS;
const STALE_CUTOFF_MS = 60 * DAY_MS;

function countExplicitSelections(p: PlanStatusInput): number {
  const customs = p.customizations?.categories;
  if (Array.isArray(customs)) return customs.length;
  const steps = p.workflow_progress?.completed_steps;
  if (Array.isArray(steps)) return steps.length;
  return 0;
}

function isPackageLocked(p: PlanStatusInput): boolean {
  const pkg = p.selected_package;
  if (!pkg) return false;
  return Boolean((pkg.tier && pkg.tier.length > 0) || (pkg.name && pkg.name.length > 0));
}

export function derivePlanStatus(
  project: PlanStatusInput | null | undefined,
): PlanStatus | null {
  if (!project) return null;

  const iso = project.updated_at;
  if (!iso) return null;
  const updatedAt = Date.parse(iso);
  if (!updatedAt || Number.isNaN(updatedAt)) return null;

  const ageMs = Date.now() - updatedAt;
  // Stale: never label old plans as active.
  if (ageMs > STALE_CUTOFF_MS) return null;

  const locked = isPackageLocked(project);
  const selections = countExplicitSelections(project);
  const recent = ageMs <= RECENT_WINDOW_MS;

  // Exploring: no package locked, OR very few selections.
  if (!locked || selections <= 2) return "exploring";

  // From here on, package is locked and selections >= 3.
  if (recent && selections >= 7) return "ready-to-share";
  if (recent && selections >= 3 && selections <= 6) return "shaping";

  // Ambiguous (e.g. locked + active selections but >14d and <60d): prefer null.
  return null;
}
