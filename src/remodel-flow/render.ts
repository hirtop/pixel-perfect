// Foundation for the BOBOX AI rendering pipeline.
// No AI calls yet — this module only defines the request shape and a
// helper to build a render request from current flow state.

import type { RemodelFlowState, StyleId, TierId } from "./types";
import type { ResolvedState } from "./engine";

export type RenderMode = "template" | "photo" | "scan";

export type BathroomSizeTemplate = "small" | "medium" | "large" | "unknown";

export interface StyleProfile {
  style?: StyleId;
  /** Free-form descriptors derived from selections (materials, finishes, tones). */
  descriptors: string[];
}

export type RenderIntent = "concept";

export interface RenderRequest {
  render_session_id: string;
  mode: RenderMode;
  render_intent: RenderIntent;
  variation_index: number;
  selected_package_id?: string;
  selected_style?: StyleId;
  selected_tier?: TierId;
  /** Engine-resolved slot state (slots, not flattened product_bins). */
  resolved_state?: { slots: ResolvedState["slots"] };
  style_profile: StyleProfile;
  bathroom_size_template: BathroomSizeTemplate;
}

const newSessionId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export interface BuildRenderRequestArgs {
  state: RemodelFlowState;
  resolvedState?: ResolvedState;
  mode?: RenderMode;
  bathroomSizeTemplate?: BathroomSizeTemplate;
  variationIndex?: number;
}

export const buildRenderRequest = ({
  state,
  resolvedState,
  mode = "template",
  bathroomSizeTemplate = "unknown",
  variationIndex = 0,
}: BuildRenderRequestArgs): RenderRequest => {
  const descriptors = resolvedState
    ? Array.from(
        new Set(
          resolvedState.slots
            .map((s) => s.optionName)
            .filter((v): v is string => Boolean(v)),
        ),
      )
    : [];

  return {
    render_session_id: newSessionId(),
    mode,
    render_intent: "concept",
    variation_index: variationIndex,
    selected_package_id: state.packageId,
    selected_style: state.style,
    selected_tier: state.tier,
    resolved_state: resolvedState ? { slots: resolvedState.slots } : undefined,
    style_profile: {
      style: state.style,
      descriptors,
    },
    bathroom_size_template: bathroomSizeTemplate,
  };
};
