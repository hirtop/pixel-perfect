/**
 * Resume-route resolver for the unified remodel-flow.
 *
 * Maps the in-memory RemodelFlowState (from FlowContext) to the next
 * /remodel-flow/* path the user should land on when they click
 * "Continue Your Project" from the homepage or top nav.
 *
 * Rules:
 *   - empty state             → /remodel-flow/start
 *   - style only              → /remodel-flow/style
 *   - style + tier            → /remodel-flow/tier
 *   - + packageId|legacyTier  → /remodel-flow/packages
 *   - + selections            → /remodel-flow/customize
 *
 * Honors the Pass 5 packageId/legacyTierRoute split — never treats a
 * tier alias as a real packageId.
 */
import type { RemodelFlowState } from "./types";

export function resolveFlowResumeRoute(state: RemodelFlowState | null | undefined): string {
  if (!state) return "/remodel-flow/start";
  const hasStyle = Boolean(state.style);
  const hasTier = Boolean(state.tier);
  const hasPackage = Boolean(state.packageId) || Boolean(state.legacyTierRoute);
  const hasSelections = Boolean(state.selections && Object.keys(state.selections).length > 0);

  if (!hasStyle) return "/remodel-flow/start";
  if (!hasTier) return "/remodel-flow/style";
  if (!hasPackage) return "/remodel-flow/tier";
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
