/**
 * Phase 2.11 — useEngineShadow hook.
 *
 * Computes engine output alongside legacy at the /customize read path,
 * in dev only. Legacy remains the rendered source of truth — this hook
 * never mutates state, never writes persistence, never makes network
 * calls, and never changes customer-visible behavior.
 *
 * Hard rules:
 *  - Returns inactive when ENGINE_DRAWER_ENABLED is false (production).
 *  - Returns inactive when no curated package resolves.
 *  - Only runs for the curated `modern-balanced` package.
 *  - Pure compute via `buildEngineCategoriesForCustomize`.
 */

import { useMemo } from "react";
import {
  buildEngineCategoriesForCustomize,
  type EngineCategory,
} from "./buildEngineCategoriesForCustomize";
import { resolvePackageIdFromUrl } from "./urlPackageRoute";
import { ENGINE_DRAWER_ENABLED } from "./engineDrawerFlag";
import { ENGINE_DIFF_ENABLED } from "./engineDiagnostics";
import {
  classifyEngineLegacyDelta,
  type DeltaClassification,
} from "./dev/classifyEngineLegacyDelta";

export interface UseEngineShadowInput {
  urlId: string;
  style?: string | null;
  roomWidthInches?: number;
  selectedVanityId?: string;
  /**
   * The legacy categories currently rendered to the user (or the
   * closest legacy-catalog approximation thereof). Used as the
   * "legacy side" of the per-render parity diff.
   */
  legacyCategories: EngineCategory[];
}

export interface ShadowDiffReport {
  identicalCount: number;
  curatedOnlyVendorMismatchCount: number;
  pricingPerOptionACount: number;
  unexplainedDeltaCount: number;
  deltas: Array<{
    categoryName: string;
    classification: DeltaClassification;
  }>;
}

export interface ShadowDiagnostics {
  totalBins: number;
  confirmedPricingCount: number;
  estimatedPricingCount: number;
  pendingPricingCount: number;
}

export interface UseEngineShadowResult {
  engineCategories: EngineCategory[] | null;
  diffReport: ShadowDiffReport | null;
  isActive: boolean;
  diagnostics: ShadowDiagnostics | null;
  reason?: "not-modern-balanced" | "engine-disabled" | "no-engine-result";
}

const INACTIVE_NOT_MB: UseEngineShadowResult = {
  engineCategories: null,
  diffReport: null,
  isActive: false,
  diagnostics: null,
  reason: "not-modern-balanced",
};

const INACTIVE_DISABLED: UseEngineShadowResult = {
  engineCategories: null,
  diffReport: null,
  isActive: false,
  diagnostics: null,
  reason: "engine-disabled",
};

const INACTIVE_NO_RESULT: UseEngineShadowResult = {
  engineCategories: null,
  diffReport: null,
  isActive: false,
  diagnostics: null,
  reason: "no-engine-result",
};

/** Pure core — exposed for direct testing without React. */
export function computeEngineShadow(
  input: UseEngineShadowInput,
  enabled: boolean = ENGINE_DRAWER_ENABLED,
): UseEngineShadowResult {
  if (!enabled) return INACTIVE_DISABLED;

  const packageId = resolvePackageIdFromUrl(input.urlId, { style: input.style });
  if (packageId !== "modern-balanced") return INACTIVE_NOT_MB;

  let engineCategories: EngineCategory[] | null = null;
  try {
    engineCategories = buildEngineCategoriesForCustomize({
      urlId: input.urlId,
      style: input.style,
      roomWidthInches: input.roomWidthInches,
      selectedVanityId: input.selectedVanityId,
    });
  } catch {
    engineCategories = null;
  }
  if (!engineCategories || engineCategories.length === 0) {
    return INACTIVE_NO_RESULT;
  }

  // Build a quick legacy lookup by category name.
  const legacyByName = new Map<string, EngineCategory>();
  for (const lc of input.legacyCategories ?? []) {
    legacyByName.set(lc.name, lc);
  }

  const deltas: ShadowDiffReport["deltas"] = [];
  let identical = 0;
  let curatedOnly = 0;
  let pricingOptionA = 0;
  let unexplained = 0;

  for (const eng of engineCategories) {
    const legacy = legacyByName.get(eng.name);
    const enrichedId = eng._engine.enrichedFromLegacyId;
    const enrichedAuthoritative =
      enrichedId != null && !enrichedId.endsWith("(loose)");
    const classification = classifyEngineLegacyDelta({
      engine: {
        name: eng.selected,
        vendor: eng.vendor,
        price: eng.price,
        isCuratedOnly: eng._engine.isCuratedOnly,
        enrichedFromLegacyId: enrichedAuthoritative ? enrichedId : null,
        pricingSource: eng._engine.pricingSource,
      },
      legacy: legacy
        ? { name: legacy.selected, vendor: legacy.vendor, price: legacy.price }
        : undefined,
    });
    deltas.push({ categoryName: eng.name, classification });
    switch (classification) {
      case "identical":
        identical++;
        break;
      case "curated-only-vendor-mismatch":
        curatedOnly++;
        break;
      case "pricing-per-Option-A":
        pricingOptionA++;
        break;
      default:
        unexplained++;
        break;
    }
  }

  const pricingSources = engineCategories.map((e) => e._engine.pricingSource);
  const diagnostics: ShadowDiagnostics = {
    totalBins: engineCategories.length,
    confirmedPricingCount: pricingSources.filter(
      (s) => s === "retailer" || s === "project-allowance",
    ).length,
    estimatedPricingCount: pricingSources.filter((s) => s === "estimated").length,
    pendingPricingCount: pricingSources.filter((s) => s === "pending").length,
  };

  return {
    engineCategories,
    diffReport: {
      identicalCount: identical,
      curatedOnlyVendorMismatchCount: curatedOnly,
      pricingPerOptionACount: pricingOptionA,
      unexplainedDeltaCount: unexplained,
      deltas,
    },
    isActive: true,
    diagnostics,
  };
}

/** React hook wrapper — memoized on its inputs. */
export function useEngineShadow(input: UseEngineShadowInput): UseEngineShadowResult {
  const result = useMemo(
    () => computeEngineShadow(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      input.urlId,
      input.style,
      input.roomWidthInches,
      input.selectedVanityId,
      input.legacyCategories,
    ],
  );

  // Dev-only logging — gated, never runs in production.
  useMemo(() => {
    if (!ENGINE_DIFF_ENABLED) return;
    if (!result.isActive || !result.diffReport) return;
    // eslint-disable-next-line no-console
    console.info("[engine-shadow] diff distribution", {
      identical: result.diffReport.identicalCount,
      curatedOnlyVendorMismatch: result.diffReport.curatedOnlyVendorMismatchCount,
      pricingPerOptionA: result.diffReport.pricingPerOptionACount,
      unexplained: result.diffReport.unexplainedDeltaCount,
      diagnostics: result.diagnostics,
    });
  }, [result]);

  return result;
}
