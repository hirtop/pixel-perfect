/**
 * Resume-route resolver for the unified remodel-flow.
 *
 * Maps the in-memory RemodelFlowState (from FlowContext) to the next
 * /remodel-flow/* path the user should land on when they click
 * "Continue Your Project" from the homepage or top nav.
 *
 * Rules:
 *   - empty state                      → /remodel-flow/start
 *   - style only                       → /remodel-flow/style
 *   - style + tier                     → /remodel-flow/tier
 *   - + curated packageId|legacyTier   → /remodel-flow/packages
 *   - + selections                     → /remodel-flow/customize
 *   - placeholder packageId            → /options (safe fallback)
 *
 * Honors the Pass 5 packageId/legacyTierRoute split — never treats a
 * tier alias as a real packageId, and never sends users into a curated
 * UI for a placeholder package.
 *
 * NOTE: dual storage keys today —
 *   - `bobox_remodel_flow_v1`   → primary FlowContext state (this resolver)
 *   - `bobox_project_draft`     → legacy ProjectContext draft (legacy /start...
 *     /agreement pages). When both exist, RemodelFlowState wins for homepage
 *     CTA routing. TODO(post-MVP): retire `bobox_project_draft` once
 *     legacy /start.../agreement traffic is near zero.
 */
import type { RemodelFlowState } from "./types";
import { getPackage } from "./package-engine/registry";

export function resolveFlowResumeRoute(state: RemodelFlowState | null | undefined): string {
  if (!state) return "/remodel-flow/start";
  const hasStyle = Boolean(state.style);
  const hasTier = Boolean(state.tier);
  const hasPackageId = Boolean(state.packageId);
  const hasLegacy = Boolean(state.legacyTierRoute);
  const hasPackage = hasPackageId || hasLegacy;
  const hasSelections = Boolean(state.selections && Object.keys(state.selections).length > 0);

  if (!hasStyle) return "/remodel-flow/start";
  if (!hasTier) return "/remodel-flow/style";
  if (!hasPackage) return "/remodel-flow/tier";

  // Placeholder real-packageId protection: do NOT route into curated UI
  // for an unfinished package (e.g. classic-balanced today).
  if (hasPackageId && state.packageId) {
    const entry = getPackage(state.packageId);
    if (!entry || entry.status !== "curated") {
      return "/options";
    }
  }

  if (!hasSelections) return "/remodel-flow/packages";
  return "/remodel-flow/customize";
}

/**
 * True when the state has any meaningful progress beyond defaults — used to
 * decide whether to show "Continue Your Project" vs only "Design Your Bathroom".
 */
export function hasFlowProgress(state: RemodelFlowState | null | undefined): boolean {
  if (!state) return false;
  return Boolean(
    state.style ||
      state.tier ||
      state.packageId ||
      state.legacyTierRoute ||
      (state.selections && Object.keys(state.selections).length > 0),
  );
}
