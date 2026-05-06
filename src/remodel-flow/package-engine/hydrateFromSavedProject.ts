/**
 * Pass 7 fix-pass — shared hydration helper used by ProjectPickerDialog
 * and the homepage Index single-saved-project Continue path.
 *
 * Centralizes the apply-then-route sequence so both call sites:
 *   1. Normalize the saved-project row via normalizeSavedProjectIdentity.
 *   2. Push style / tier / packageId / legacyTierRoute into FlowContext
 *      via the provided setters (apply order is deterministic).
 *   3. Compute the *next* RemodelFlowState (not stale flowState) and
 *      return it together with the resume route.
 *
 * Pure-ish: only React-state setters are side-effects. No navigation here
 * — callers decide whether/when to call navigate(route).
 */
import type { RemodelFlowState } from "@/remodel-flow/FlowContext";
import { resolveFlowResumeRoute } from "@/remodel-flow/resumeRoute";
import {
  normalizeSavedProjectIdentity,
  type LegacySavedProjectLike,
  type NormalizedProjectIdentity,
} from "@/remodel-flow/package-engine/projectIdentity";
import type { UnknownPackageIdSource } from "@/remodel-flow/package-engine/telemetry";

/** Styles supported by FlowContext.setStyle. */
export const FLOW_STYLES = ["modern", "classic", "spa", "minimal"] as const;
export type FlowStyle = (typeof FLOW_STYLES)[number];

export interface FlowSetters {
  setStyle: (style: FlowStyle) => void;
  setTier: (tier: NonNullable<RemodelFlowState["tier"]>) => void;
  setPackageId: (id: string) => void;
  setLegacyTierRoute: (alias: string) => void;
}

export interface HydrateResult {
  identity: NormalizedProjectIdentity;
  nextState: RemodelFlowState;
  route: string;
  /** Order setters were invoked, for tests. */
  appliedOrder: Array<"style" | "tier" | "packageId" | "legacyTierRoute">;
}

export interface HydrateOptions {
  source?: UnknownPackageIdSource;
  route?: string;
}

/**
 * Apply identity to FlowContext and compute the resume route from the
 * synthesized next state. Used by ProjectPickerDialog and Index.
 *
 * IMPORTANT: setters are called BEFORE the route is computed, and the
 * route is derived from `nextState` rather than the stale flowState.
 */
export function hydrateFlowFromSavedProject(
  row: LegacySavedProjectLike | null | undefined,
  flowState: RemodelFlowState,
  setters: FlowSetters,
  opts: HydrateOptions = {},
): HydrateResult {
  const identity = normalizeSavedProjectIdentity(row, {
    source: opts.source ?? "project-picker",
    route: opts.route,
  });

  const styleForFlow: FlowStyle | null =
    identity.style && (FLOW_STYLES as readonly string[]).includes(identity.style)
      ? (identity.style as FlowStyle)
      : null;

  const appliedOrder: HydrateResult["appliedOrder"] = [];

  if (styleForFlow) {
    setters.setStyle(styleForFlow);
    appliedOrder.push("style");
  }
  if (identity.tier) {
    setters.setTier(identity.tier);
    appliedOrder.push("tier");
  }
  if (identity.packageId) {
    setters.setPackageId(identity.packageId);
    appliedOrder.push("packageId");
  } else if (identity.legacyTierRoute) {
    setters.setLegacyTierRoute(identity.legacyTierRoute);
    appliedOrder.push("legacyTierRoute");
  }

  const nextState: RemodelFlowState = {
    ...flowState,
    style: styleForFlow ?? flowState.style,
    tier: identity.tier ?? flowState.tier,
    packageId: identity.packageId ?? flowState.packageId ?? null,
    legacyTierRoute: identity.packageId
      ? null
      : identity.legacyTierRoute ?? flowState.legacyTierRoute ?? null,
  };

  const route = resolveFlowResumeRoute(nextState);
  return { identity, nextState, route, appliedOrder };
}
