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
import type { RemodelFlowState } from "@/remodel-flow/types";
import { resolveFlowResumeRoute } from "@/remodel-flow/resumeRoute";
import {
  normalizeSavedProjectIdentity,
  type LegacySavedProjectLike,
  type NormalizedProjectIdentity,
} from "@/remodel-flow/package-engine/projectIdentity";
import type { UnknownPackageIdSource } from "@/remodel-flow/package-engine/telemetry";
import {
  buildLegacyExtrasSnapshot,
  type LegacyExtras,
  type LegacyProjectRowForSnapshot,
} from "@/remodel-flow/package-engine/legacyExtrasSnapshot";

/**
 * Pass 18 — A saved-project row carries a `source` discriminator
 * (added in Pass 11) telling us whether it came from public.projects
 * or remodel_designs. Only "projects" rows produce a legacy origin
 * stamp.
 */
export interface SavedProjectRowLike
  extends LegacySavedProjectLike,
    LegacyProjectRowForSnapshot {
  id?: string;
  source?: "projects" | "remodel_designs" | string;
  /** Pass 20 — legacy public.projects.name, used for first-INSERT name carry. */
  name?: string | null;
}

/**
 * Pass 18 — when present, the next first-INSERT autosave on this flow
 * should stamp `legacy_project_id` + `legacy_extras` and then clear
 * itself. Subsequent updates must NOT resend these fields.
 */
export interface LegacyOriginStamp {
  legacyProjectId: string;
  legacyExtras: LegacyExtras | null;
  /**
   * Pass 20 — legacy public.projects.name carried through to the first
   * INSERT into remodel_designs so the stamped row inherits the legacy
   * project name instead of defaulting to "Untitled Design".
   * Only populated when source === "projects" and name is non-empty
   * after trim. Never set for remodel_designs / fresh / unknown sources.
   */
  legacyName: string | null;
}

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
  /**
   * Pass 18 — non-null only when the saved-project row originated from
   * `public.projects` (source === "projects") and carries an `id`.
   * Consumers (FlowContext) stamp these on the next first-INSERT autosave.
   */
  legacyOrigin: LegacyOriginStamp | null;
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
  row: SavedProjectRowLike | null | undefined,
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

  // Pass 18 — only legacy public.projects rows produce an origin stamp.
  // Never stamp a remodel_designs id as legacy_project_id.
  let legacyOrigin: LegacyOriginStamp | null = null;
  if (row && row.source === "projects" && typeof row.id === "string" && row.id) {
    legacyOrigin = {
      legacyProjectId: row.id,
      legacyExtras: buildLegacyExtrasSnapshot(row, { route: opts.route }),
    };
  }

  const route = resolveFlowResumeRoute(nextState);
  return { identity, nextState, route, appliedOrder, legacyOrigin };
}

