/**
 * Phase 2.10 closing snapshot — runs the same computation the dev
 * EngineDiffConsole performs and prints the counts.
 *
 * Read-only. Test-only. Not imported by app code.
 */
import { describe, it, expect } from "vitest";
import {
  buildEngineCategoriesForCustomize,
  MODERN_BALANCED_MISSING_LEGACY_CATEGORIES,
} from "../buildEngineCategoriesForCustomize";
import { EMPTY_BINS } from "../emptyBins";
import { tieredCatalog } from "@/data/tiered-catalog";
import { lookupLegacyDeferredBin } from "../dev/legacyDeferredLookup";
import { classifyEngineLegacyDelta } from "../dev/classifyEngineLegacyDelta";

describe("Phase 2.10 closing — MODERN_BALANCED diff snapshot", () => {
  it("produces 0 unexplainedDelta and emits a snapshot", () => {
    const engine = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    expect(engine).not.toBeNull();
    const opened = engine!;

    const dist = {
      identical: 0,
      "curated-only-vendor-mismatch": 0,
      "pricing-per-Option-A": 0,
      unexplained: 0,
    };
    const unexplained: unknown[] = [];

    for (const eng of opened) {
      const legacyRows = tieredCatalog.filter(
        (p) => p.category === eng.name && p.tier === "Balanced",
      );
      const primary = legacyRows.find((p) => p.isDefault) ?? legacyRows[0];
      const legacy = primary
        ? { name: primary.name, vendor: primary.vendor, price: primary.price }
        : undefined;

      const enrichedId = eng._engine.enrichedFromLegacyId;
      const enrichedAuthoritative =
        enrichedId != null && !enrichedId.endsWith("(loose)");
      const klass = classifyEngineLegacyDelta({
        engine: {
          name: eng.selected,
          vendor: eng.vendor,
          price: eng.price,
          isCuratedOnly: eng._engine.isCuratedOnly,
          enrichedFromLegacyId: enrichedAuthoritative ? enrichedId : null,
          pricingSource: eng._engine.pricingSource,
        },
        legacy,
      });
      dist[klass]++;
      if (klass === "unexplained") {
        unexplained.push({
          bin: eng._engine.binKey,
          category: eng.name,
          enrichedFromLegacyId: enrichedId,
          isCuratedOnly: eng._engine.isCuratedOnly,
          engine: {
            name: eng.selected,
            vendor: eng.vendor,
            price: eng.price,
            pricingSource: eng._engine.pricingSource,
          },
          legacy,
        });
      }
    }

    const deferred = MODERN_BALANCED_MISSING_LEGACY_CATEGORIES.map((c) =>
      lookupLegacyDeferredBin(c, "Balanced"),
    );
    const pricingSources = opened.map((e) => e._engine.pricingSource);
    const snapshot = {
      header: {
        totalBins: opened.length + deferred.length + EMPTY_BINS.length,
        openedBins: opened.length,
        deferredBins: deferred.length,
        emptyBins: EMPTY_BINS.length,
        confirmedPricingCount: pricingSources.filter(
          (s) => s === "retailer" || s === "project-allowance",
        ).length,
        estimatedPricingCount: pricingSources.filter((s) => s === "estimated").length,
        pendingPricingCount: pricingSources.filter((s) => s === "pending").length,
        unexplainedDeltaCount: dist.unexplained,
      },
      classificationDistribution: dist,
      unexplained,
    };

    // eslint-disable-next-line no-console
    console.log("\n=== PHASE 2.10 SNAPSHOT ===\n" + JSON.stringify(snapshot, null, 2) + "\n=== END ===\n");

    expect(dist.unexplained).toBe(0);
  });
});
