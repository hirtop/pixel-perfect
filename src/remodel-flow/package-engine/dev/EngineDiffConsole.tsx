/**
 * Phase 2.10 — Engine Diff Console (dev-only).
 *
 * Mounted inside the engine drawer dev path on /customize. Renders only
 * when DEV + ENGINE_DRAWER_ENABLED + ENGINE_DIFF_ENABLED. Otherwise
 * returns null with no layout side-effects.
 *
 * Read-only. Does NOT touch ProjectContext, persistence, /summary,
 * routes, auth, payments, LK scoring, or customer-facing copy.
 */

import { useMemo, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  buildEngineCategoriesForCustomize,
  MODERN_BALANCED_MISSING_LEGACY_CATEGORIES,
  type EngineCategory,
} from "../buildEngineCategoriesForCustomize";
import {
  diffEngineVsLegacy,
  getEngineDataCompleteness,
  logCategoryDiffs,
  ENGINE_DIFF_ENABLED,
} from "../engineDiagnostics";
import { ENGINE_DRAWER_ENABLED } from "../engineDrawerFlag";
import { EMPTY_BINS } from "../emptyBins";
import { tieredCatalog, type ProductTier } from "@/data/tiered-catalog";
import { lookupLegacyDeferredBin } from "./legacyDeferredLookup";
import {
  classifyEngineLegacyDelta,
  type DeltaClassification,
} from "./classifyEngineLegacyDelta";

export interface EngineDiffConsoleProps {
  urlId: string;
  style?: string | null;
  roomWidthInches?: number;
  selectedVanityId?: string;
  /** Optional: pass already-resolved engine categories to avoid rework. */
  engineCategories?: EngineCategory[] | null;
  legacyTier?: ProductTier;
}

interface LegacyRow {
  name: string;
  vendor?: string;
  price?: number;
  affiliateUrl?: string;
  altCount: number;
}

function lookupLegacyForCategory(
  categoryName: string,
  tier: ProductTier,
): LegacyRow | null {
  const rows = tieredCatalog.filter(
    (p) => p.category === categoryName && p.tier === tier,
  );
  if (rows.length === 0) return null;
  const primary = rows.find((p) => p.isDefault) ?? rows[0];
  return {
    name: primary.name,
    vendor: primary.vendor,
    price: primary.price,
    affiliateUrl: primary.affiliateUrl,
    altCount: rows.length - 1,
  };
}

const EngineDiffConsole = ({
  urlId,
  style,
  roomWidthInches,
  selectedVanityId,
  engineCategories,
  legacyTier = "Balanced",
}: EngineDiffConsoleProps) => {
  const [open, setOpen] = useState(false);

  const engine = useMemo<EngineCategory[] | null>(() => {
    if (engineCategories !== undefined) return engineCategories;
    // TODO(Phase 2.11): pass already-resolved engineCategories from the
    // /customize page into this console to remove this double-resolution.
    // Customize.tsx does not currently retain the resolved engine output
    // because the curated drawer renders directly from MODERN_BALANCED.
    try {
      return buildEngineCategoriesForCustomize({
        urlId,
        style,
        roomWidthInches,
        selectedVanityId,
      });
    } catch {
      return null;
    }
  }, [engineCategories, urlId, style, roomWidthInches, selectedVanityId]);

  const summary = useMemo(() => {
    const opened = engine ?? [];
    const deferred = MODERN_BALANCED_MISSING_LEGACY_CATEGORIES.map((cat) =>
      lookupLegacyDeferredBin(cat, legacyTier),
    );
    const empty = EMPTY_BINS.map((b) => ({ binKey: b }));

    // Per-row diff + classification
    const rows = opened.map((eng) => {
      const legacy = lookupLegacyForCategory(eng.name, legacyTier);
      const diff = diffEngineVsLegacy(legacy ?? undefined, eng);
      const engineProduct = {
        name: eng.selected,
        vendor: eng.vendor,
        price: eng.price,
        isCuratedOnly: eng._engine.enrichedFromLegacyId == null,
        enrichedFromLegacyId: eng._engine.enrichedFromLegacyId,
        // pricingSource is on the underlying Product but not exposed on
        // EngineCategory directly; re-derive via a heuristic: missing
        // legacy enrichment + curated-only is the typical Option-A case.
        pricingSource: undefined as
          | "retailer"
          | "project-allowance"
          | "estimated"
          | "pending"
          | undefined,
      };
      const classification: DeltaClassification = classifyEngineLegacyDelta({
        engine: engineProduct,
        legacy: legacy
          ? { name: legacy.name, vendor: legacy.vendor, price: legacy.price }
          : undefined,
      });
      return { eng, legacy, diff, classification };
    });

    const completeness = getEngineDataCompleteness([]); // placeholder counts
    const counts = {
      totalBins: opened.length + deferred.length + empty.length,
      openedBins: opened.length,
      deferredBins: deferred.length,
      emptyBins: empty.length,
      confirmedPricingCount: completeness.confirmedPricingCount,
      estimatedPricingCount: completeness.estimatedPricingCount,
      pendingPricingCount: completeness.pendingPricingCount,
      unexplainedDeltaCount: rows.filter((r) => r.classification === "unexplained")
        .length,
    };

    return { rows, deferred, empty, counts };
  }, [engine, legacyTier]);

  // Structured info log when console is mounted — flag-gated inside helper.
  useMemo(() => {
    logCategoryDiffs(summary.rows.map((r) => r.diff));
  }, [summary]);

  // Render gate — placed AFTER hooks so the hook order is stable
  // regardless of flag combination. The flags are build-time constants
  // so this branch is always taken or never taken in a given build.
  if (!import.meta.env.DEV) return null;
  if (!ENGINE_DRAWER_ENABLED) return null;
  if (!ENGINE_DIFF_ENABLED) return null;

  return (
    <section
      data-testid="engine-diff-console"
      className="mt-6 rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left font-mono text-[11px] uppercase tracking-wider text-foreground/80">
          <span>[dev] Engine vs Legacy Diff</span>
          <span className="text-muted-foreground">
            opened {summary.counts.openedBins} · deferred{" "}
            {summary.counts.deferredBins} · empty {summary.counts.emptyBins} ·
            unexplained {summary.counts.unexplainedDeltaCount}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-4">
          {/* Header counts */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] md:grid-cols-4">
            <div>total: {summary.counts.totalBins}</div>
            <div>opened: {summary.counts.openedBins}</div>
            <div>deferred: {summary.counts.deferredBins}</div>
            <div>empty: {summary.counts.emptyBins}</div>
            <div>confirmed: {summary.counts.confirmedPricingCount}</div>
            <div>estimated: {summary.counts.estimatedPricingCount}</div>
            <div>pending: {summary.counts.pendingPricingCount}</div>
            <div
              className={
                summary.counts.unexplainedDeltaCount > 0
                  ? "text-destructive"
                  : ""
              }
            >
              unexplained: {summary.counts.unexplainedDeltaCount}
            </div>
          </div>

          {/* Opened bins */}
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase">opened bins</p>
            <table className="w-full border-collapse font-mono text-[10px]">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="border-b border-border/40 p-1">bin</th>
                  <th className="border-b border-border/40 p-1">engine</th>
                  <th className="border-b border-border/40 p-1">legacy</th>
                  <th className="border-b border-border/40 p-1">delta</th>
                  <th className="border-b border-border/40 p-1">alts e/l</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((r) => (
                  <tr key={r.eng._engine.binKey} className="align-top">
                    <td className="p-1">{r.eng.name}</td>
                    <td className="p-1">
                      {r.eng.vendor || "—"} · ${r.eng.price}
                    </td>
                    <td className="p-1">
                      {r.legacy
                        ? `${r.legacy.vendor ?? "—"} · $${r.legacy.price ?? 0}`
                        : "—"}
                    </td>
                    <td
                      className={
                        "p-1 " +
                        (r.classification === "unexplained"
                          ? "text-destructive"
                          : r.classification === "identical"
                            ? "text-emerald-600 dark:text-emerald-500"
                            : "")
                      }
                    >
                      {r.classification}
                    </td>
                    <td className="p-1">
                      {r.eng.alternatives.length}/{r.legacy?.altCount ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deferred bins */}
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase">deferred bins</p>
            <ul className="space-y-1 font-mono text-[10px]">
              {summary.deferred.map((d) => {
                const missing = !d.legacyPrimary;
                const isTubValve = d.legacyCategoryName === "Tub Valve";
                return (
                  <li
                    key={d.legacyCategoryName}
                    className={missing ? "text-destructive" : ""}
                    data-testid={`deferred-${d.legacyCategoryName}`}
                  >
                    <span>{d.legacyCategoryName}: </span>
                    {missing ? (
                      <span>status: deferred-legacy-MISSING</span>
                    ) : (
                      <>
                        <span>
                          {d.legacyPrimary!.vendor} · {d.legacyPrimary!.name} · $
                          {d.legacyPrimary!.price} · alts{" "}
                          {d.legacyAlternativesCount}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          status: deferred-legacy-fallback
                        </span>
                      </>
                    )}
                    {isTubValve && (
                      <span className="ml-2 text-muted-foreground">
                        (coupled to bathtub posture)
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Empty bins */}
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase">empty bins</p>
            <ul className="space-y-1 font-mono text-[10px]">
              {summary.empty.map((e) => (
                <li key={e.binKey} data-testid={`empty-${e.binKey}`}>
                  {e.binKey}: status: intentional-empty · reason: zero products
                  in live catalog
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default EngineDiffConsole;
