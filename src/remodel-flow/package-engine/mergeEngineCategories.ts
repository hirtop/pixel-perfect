/**
 * Pure merge helper — combines engine-built categories with the legacy
 * `buildCategoriesForTier` output for the `/customize` drawer.
 *
 * Phase 2.1 strategy:
 *  - The legacy list is the source of truth for which category rows the
 *    drawer renders (and in what order). The engine never adds rows the
 *    legacy drawer would not already show.
 *  - For each legacy category, if the engine produced a row with the
 *    same `name`, the engine row replaces the legacy one. Otherwise the
 *    legacy row is preserved unchanged (this is how MODERN_BALANCED's
 *    documented missing categories — Sinks, Bathtubs, etc. — keep
 *    working seamlessly).
 *  - Pure / read-only. Never mutates inputs.
 *
 * The return type is the legacy `Category` shape augmented with the
 * optional engine diagnostic blob, so callers that don't care about the
 * source can ignore it.
 */

import type { EngineCategory } from "./buildEngineCategoriesForCustomize";

export interface MergeableCategory {
  name: string;
}

export interface MergedCategory<L extends MergeableCategory> {
  category: L;
  source: "engine" | "legacy";
}

/**
 * Merge engine categories into the legacy list, preserving legacy order
 * and shape. Engine rows missing from legacy are silently dropped (the
 * drawer would not have rendered them anyway).
 */
export function mergeEngineWithLegacyCategories<L extends MergeableCategory>(
  legacy: readonly L[],
  engine: readonly EngineCategory[] | null,
): { merged: L[]; sources: Array<"engine" | "legacy"> } {
  if (!engine || engine.length === 0) {
    return {
      merged: legacy.map((c) => c),
      sources: legacy.map(() => "legacy" as const),
    };
  }
  const byName = new Map<string, EngineCategory>();
  for (const c of engine) byName.set(c.name, c);
  const merged: L[] = [];
  const sources: Array<"engine" | "legacy"> = [];
  for (const lc of legacy) {
    const ec = byName.get(lc.name);
    if (ec) {
      // Engine row replaces legacy row entirely. Cast through unknown
      // because EngineCategory is structurally compatible with the
      // legacy `Category` shape (verified by parity tests).
      merged.push(ec as unknown as L);
      sources.push("engine");
    } else {
      merged.push(lc);
      sources.push("legacy");
    }
  }
  return { merged, sources };
}
