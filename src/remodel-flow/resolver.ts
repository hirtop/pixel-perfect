// Public resolver API consumed by the UI.
// Internally delegates to the full BOBOX resolver engine
// (resolve_package / resolve_slot / rank_candidates / validate_resolution /
// compute_pricing). The shape of `ResolvedPlan` is preserved so existing UI
// (Customize.tsx, Preview.tsx) does not need to change.

import { runEngine, type EngineResult, type ResolutionSource } from "./engine";
import type { RemodelFlowState, TierId } from "./types";

export interface ResolvedLineItem {
  categoryId: string;
  categoryName: string;
  optionId: string;
  optionName: string;
  estPrice: number;
  /** UI consumes only "package-default" | "user-selection" today; both extra
   *  engine sources are mapped onto these to preserve the existing UI labels. */
  source: "package-default" | "user-selection";
  /** Extra engine metadata (safe additions; ignored by current UI). */
  engineSource?: ResolutionSource;
  score?: number;
}

export interface ResolvedPlan {
  tier?: TierId;
  packageName?: string;
  basePrice: number;
  items: ResolvedLineItem[];
  upgradeDelta: number;
  total: number;
  /** Full engine output for any future UI / debugging needs. Unused by current UI. */
  engine?: EngineResult;
}

export function resolvePlan(state: RemodelFlowState): ResolvedPlan {
  const engine = runEngine(state);
  const { resolved_state, pricing } = engine;

  const items: ResolvedLineItem[] = resolved_state.slots
    .filter((s) => s.optionId && s.optionName)
    .map((s) => ({
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      optionId: s.optionId as string,
      optionName: s.optionName as string,
      estPrice: s.estPrice,
      source: s.source === "user-override" ? "user-selection" : "package-default",
      engineSource: s.source,
      score: s.score,
    }));

  return {
    tier: resolved_state.tier,
    packageName: resolved_state.packageName,
    basePrice: pricing.basePrice,
    items,
    upgradeDelta: pricing.upgradeDelta,
    total: pricing.total,
    engine,
  };
}

// Re-export engine pieces for advanced consumers / tests.
export {
  resolve_package,
  resolve_slot,
  rank_candidates,
  validate_resolution,
  compute_pricing,
  runEngine,
  styleScore,
  styleMatchLabel,
} from "./engine";
export type {
  EngineResult,
  ResolvedSlot,
  ResolvedState,
  PricingBreakdown,
  ValidationResult,
  ValidationIssue,
  ResolutionSource,
} from "./engine";
