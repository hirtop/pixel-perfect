/**
 * Phase 2.7 — pricing source-of-truth + alternative backfill coverage.
 */
import { describe, it, expect } from "vitest";
import { MODERN_BALANCED, type Bin, type BinProduct } from "@/remodel-flow/packages/modern-balanced";
import { adaptBinProduct, getEngineProductTotalPrice, resolveSlot } from "../resolveSlot";
import {
  getEngineDataCompleteness,
  getPricingDiagnostic,
  warnOnPricingUncertainty,
} from "../engineDiagnostics";

const allBackups: Array<[string, BinProduct]> = Object.entries(
  MODERN_BALANCED.bins,
).flatMap(([k, b]) =>
  (b as Bin).backups.map((bp): [string, BinProduct] => [k, bp]),
);

const allPrimaries: Array<[string, BinProduct]> = Object.entries(
  MODERN_BALANCED.bins,
).map(([k, b]) => [k, (b as Bin).primary]);

describe("Phase 2.7 — alternative backfill coverage", () => {
  it.each(allBackups)("alt in %s has explicit vendor", (_k, bp) => {
    expect(typeof bp.vendor).toBe("string");
    expect((bp.vendor ?? "").length).toBeGreaterThan(0);
  });

  it.each(allBackups)("alt in %s has explicit canonicalKey", (_k, bp) => {
    expect(typeof bp.canonicalKey).toBe("string");
    expect((bp.canonicalKey ?? "").length).toBeGreaterThan(0);
  });

  it.each(allBackups)("alt in %s is curated-only", (_k, bp) => {
    expect(bp.isCuratedOnly).toBe(true);
  });

  it.each(allBackups)("alt in %s has unitPrice or estimatedProjectPrice", (_k, bp) => {
    expect(
      typeof bp.unitPrice === "number" ||
        typeof bp.estimatedProjectPrice === "number",
    ).toBe(true);
  });

  it.each(allBackups)("alt in %s has pricingSource", (_k, bp) => {
    expect(bp.pricingSource).toBeDefined();
  });
});

describe("Phase 2.7 — pricing policy", () => {
  it.each(allPrimaries)("primary in %s has confirmed pricingSource", (_k, p) => {
    expect(p.pricingSource).toBeDefined();
    expect(p.pricingSource).not.toBe("pending");
  });

  it("no primary uses pending pricing", () => {
    for (const [k, p] of allPrimaries) {
      expect(p.pricingSource, `primary ${k}`).not.toBe("pending");
    }
  });

  it("any pending alternative carries a pricingNote / TODO", () => {
    for (const [k, bp] of allBackups) {
      if (bp.pricingSource === "pending") {
        expect(typeof bp.pricingNote, `bin ${k}`).toBe("string");
        expect((bp.pricingNote ?? "").toLowerCase()).toContain("todo");
      }
    }
  });

  it("estimatedProjectPrice wins over unitPrice in totals", () => {
    expect(
      getEngineProductTotalPrice({ unitPrice: 10, estimatedProjectPrice: 720 }),
    ).toBe(720);
  });

  it("project-allowance source is allowed when estimatedProjectPrice is present", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "showerWallTile",
      MODERN_BALANCED.bins.showerWallTile as Bin,
    );
    expect(slot.product.pricingSource).toBe("project-allowance");
    expect(typeof slot.product.estimatedProjectPrice).toBe("number");
  });
});

describe("Phase 2.7 — pricing diagnostics", () => {
  it("classifies retailer pricing as confirmed", () => {
    const p = adaptBinProduct(
      "modern-balanced",
      "faucet",
      {
        name: "Faucet",
        priceRange: [100, 100],
        vendor: "X",
        unitPrice: 100,
        canonicalKey: "x",
        pricingSource: "retailer",
      },
      0,
      "ready",
    );
    const d = getPricingDiagnostic(p);
    expect(d.isConfirmed).toBe(true);
    expect(d.isPending).toBe(false);
    expect(d.isEstimated).toBe(false);
  });

  it("classifies pending and estimated correctly", () => {
    const pending = adaptBinProduct(
      "modern-balanced",
      "lighting",
      {
        name: "L",
        priceRange: [100, 100],
        vendor: "X",
        unitPrice: 100,
        canonicalKey: "x",
        pricingSource: "pending",
        pricingNote: "TODO",
      },
      0,
      "ready",
    );
    expect(getPricingDiagnostic(pending).isPending).toBe(true);
    const est = adaptBinProduct(
      "modern-balanced",
      "lighting",
      {
        name: "L",
        priceRange: [100, 100],
        vendor: "X",
        unitPrice: 100,
        canonicalKey: "x2",
        pricingSource: "estimated",
      },
      0,
      "ready",
    );
    expect(getPricingDiagnostic(est).isEstimated).toBe(true);
  });

  it("warnOnPricingUncertainty is a no-op (no throw) when flag off", () => {
    const p = adaptBinProduct(
      "modern-balanced",
      "lighting",
      {
        name: "L",
        priceRange: [100, 100],
        vendor: "X",
        unitPrice: 100,
        canonicalKey: "k",
        pricingSource: "pending",
      },
      0,
      "ready",
    );
    expect(() => warnOnPricingUncertainty(p)).not.toThrow();
  });

  it("pricingSource origin is recorded on _engineFieldSources", () => {
    const p = adaptBinProduct(
      "modern-balanced",
      "faucet",
      {
        name: "F",
        priceRange: [100, 100],
        unitPrice: 100,
        canonicalKey: "k",
        vendor: "V",
        pricingSource: "retailer",
      },
      0,
      "ready",
    );
    expect(p._engineFieldSources?.pricingSource).toBe("explicit");
  });
});

describe("Phase 2.7 — completeness helper", () => {
  it("reports zero pending for an all-confirmed sample", () => {
    const products = [
      adaptBinProduct(
        "modern-balanced",
        "faucet",
        {
          name: "F",
          priceRange: [100, 100],
          vendor: "V",
          unitPrice: 100,
          canonicalKey: "k1",
          pricingSource: "retailer",
        },
        0,
        "ready",
      ),
    ];
    const r = getEngineDataCompleteness(products);
    expect(r.total).toBe(1);
    expect(r.confirmedPricingCount).toBe(1);
    expect(r.pendingPricingCount).toBe(0);
    expect(r.estimatedPricingCount).toBe(0);
    expect(r.explicitVendor).toBe(1);
    expect(r.explicitCanonicalKey).toBe(1);
    expect(r.explicitPrice).toBe(1);
    expect(r.pricingSourceSet).toBe(1);
  });

  it("counts pending and regex-derived fields", () => {
    const products = [
      adaptBinProduct(
        "modern-balanced",
        "faucet",
        {
          name: "Delta Trinsic",
          priceRange: [100, 100],
          pricingSource: "pending",
        },
        0,
        "ready",
      ),
    ];
    const r = getEngineDataCompleteness(products);
    expect(r.pendingPricingCount).toBe(1);
    expect(r.regexDerivedFieldCount).toBeGreaterThan(0);
  });

  it("MODERN_BALANCED full catalog: all primaries are confirmed", () => {
    const products = Object.entries(MODERN_BALANCED.bins).flatMap(
      ([k, bin]) => {
        const b = bin as Bin;
        return [b.primary, ...b.backups].map((bp, i) =>
          adaptBinProduct(
            "modern-balanced",
            // categoryId isn't enforced here; reuse k as a label
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            k as any,
            bp,
            i,
            b.sourcing,
            b.intent,
          ),
        );
      },
    );
    const r = getEngineDataCompleteness(products);
    // Every primary (11) confirmed + most backups confirmed
    expect(r.confirmedPricingCount).toBeGreaterThanOrEqual(11);
    // Total tracked products
    expect(r.total).toBe(products.length);
    // Pending is bounded — only documented TODO entries
    expect(r.pendingPricingCount).toBeLessThanOrEqual(2);
  });
});
