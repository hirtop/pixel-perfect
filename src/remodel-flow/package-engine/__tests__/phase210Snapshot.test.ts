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
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import { resolveSlot } from "../resolveSlot";

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

    // Map binKey → underlying engine Product so we can read pricingSource
    // (which lives on Product, not EngineCategory).
    const binAlias: Record<string, string> = {
      vanity: "vanity",
      faucet: "faucet",
      sink: "sink",
      mirror: "mirror",
      lighting: "lighting",
      showerWallTile: "showerWallTile",
      floorTile: "mainFloorTile",
      showerFloorTile: "showerFloorTile",
      showerTrim: "showerValve",
      showerSystem: "showerSystem",
      showerGlass: "showerDoor",
      toilet: "toilet",
      accentTile: "accentTile",
    };
    const productByBin = new Map<string, ReturnType<typeof resolveSlot>["product"]>();
    for (const [binKeyRaw, binRaw] of Object.entries(MODERN_BALANCED.bins)) {
      const aliased = binAlias[binKeyRaw];
      if (!aliased) continue;
      const slot = resolveSlot("modern-balanced", aliased as never, binRaw as never);
      productByBin.set(aliased, slot.product);
    }

    for (const eng of opened) {
      const legacyRows = tieredCatalog.filter(
        (p) => p.category === eng.name && p.tier === "Balanced",
      );
      const primary = legacyRows.find((p) => p.isDefault) ?? legacyRows[0];
      const legacy = primary
        ? { name: primary.name, vendor: primary.vendor, price: primary.price }
        : undefined;

      const product = productByBin.get(eng._engine.binKey);
      const klass = classifyEngineLegacyDelta({
        engine: {
          name: eng.selected,
          vendor: eng.vendor,
          price: eng.price,
          isCuratedOnly: eng._engine.enrichedFromLegacyId == null,
          enrichedFromLegacyId: eng._engine.enrichedFromLegacyId,
          pricingSource: product?.pricingSource,
        },
        legacy,
      });
      dist[klass]++;
      if (klass === "unexplained") {
        unexplained.push({
          bin: eng._engine.binKey,
          category: eng.name,
          enrichedFromLegacyId: eng._engine.enrichedFromLegacyId,
          productIsCuratedOnly: product?.isCuratedOnly,
          engine: { name: eng.selected, vendor: eng.vendor, price: eng.price, pricingSource: product?.pricingSource },
          legacy,
        });
      }
    }

    const deferred = MODERN_BALANCED_MISSING_LEGACY_CATEGORIES.map((c) =>
      lookupLegacyDeferredBin(c, "Balanced"),
    );

    const productsForCount = Array.from(productByBin.values());
    const confirmed = productsForCount.filter(
      (p) => p.pricingSource === "retailer" || p.pricingSource === "project-allowance",
    ).length;
    const estimated = productsForCount.filter((p) => p.pricingSource === "estimated").length;
    const pending = productsForCount.filter((p) => p.pricingSource === "pending").length;

    const snapshot = {
      header: {
        totalBins: opened.length + deferred.length + EMPTY_BINS.length,
        openedBins: opened.length,
        deferredBins: deferred.length,
        emptyBins: EMPTY_BINS.length,
        confirmedPricingCount: confirmed,
        estimatedPricingCount: estimated,
        pendingPricingCount: pending,
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
