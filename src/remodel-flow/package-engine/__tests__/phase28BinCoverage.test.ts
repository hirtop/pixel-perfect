/**
 * Phase 2.8 — bin coverage expansion tests.
 *
 * Verifies that sink / showerSystem / accentTile are opened in
 * MODERN_BALANCED with the standards required for a newly opened bin
 * (confirmed primary pricing, explicit intrinsic fields, alternatives
 * with required metadata) and that bathtub / tubValve remain deferred.
 */
import { describe, it, expect } from "vitest";
import {
  MODERN_BALANCED,
  MODERN_BALANCED_PRICE_BANDS,
  type Bin,
  type BinProduct,
} from "@/remodel-flow/packages/modern-balanced";
import {
  buildEngineCategoriesForCustomize,
  MODERN_BALANCED_MISSING_LEGACY_CATEGORIES,
} from "../buildEngineCategoriesForCustomize";
import { resolveSlot } from "../resolveSlot";
import { getEngineDataCompleteness } from "../engineDiagnostics";
import { adaptBinProduct } from "../resolveSlot";
import type { Bin as BinT } from "@/remodel-flow/packages/modern-balanced";

const NEW_BINS = ["sink", "showerSystem", "accentTile"] as const;
const DEFERRED_LEGACY = ["Bathtubs", "Tub Valve"] as const;

describe("Phase 2.8 — newly opened bins exist", () => {
  it.each(NEW_BINS)("MODERN_BALANCED.bins.%s exists with primary + alternatives", (k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bin = (MODERN_BALANCED.bins as any)[k] as Bin | undefined;
    expect(bin).toBeDefined();
    expect(bin!.sourcing).toBe("ready");
    expect(bin!.primary).toBeDefined();
    expect(bin!.backups.length).toBeGreaterThanOrEqual(1);
  });

  it.each(NEW_BINS)("MODERN_BALANCED_PRICE_BANDS has band for %s", (k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((MODERN_BALANCED_PRICE_BANDS as any)[k]).toBeDefined();
  });
});

describe("Phase 2.8 — deferred bins remain deferred", () => {
  it.each(DEFERRED_LEGACY)("'%s' remains in MODERN_BALANCED_MISSING_LEGACY_CATEGORIES", (cat) => {
    expect(MODERN_BALANCED_MISSING_LEGACY_CATEGORIES).toContain(cat);
  });

  it("opened categories no longer in missing list", () => {
    expect(MODERN_BALANCED_MISSING_LEGACY_CATEGORIES).not.toContain("Sinks");
    expect(MODERN_BALANCED_MISSING_LEGACY_CATEGORIES).not.toContain("Shower Systems");
    expect(MODERN_BALANCED_MISSING_LEGACY_CATEGORIES).not.toContain("Accent Tile");
  });
});

describe("Phase 2.8 — primary standards for newly opened bins", () => {
  it.each(NEW_BINS)("primary in %s meets confirmed-pricing standard", (k) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (MODERN_BALANCED.bins as any)[k].primary as BinProduct;
    expect(typeof p.vendor).toBe("string");
    expect((p.vendor ?? "").length).toBeGreaterThan(0);
    expect(typeof p.canonicalKey).toBe("string");
    expect((p.canonicalKey ?? "").length).toBeGreaterThan(0);
    expect(p.isCuratedOnly).toBe(true);
    expect(p.pricingSource).toBeDefined();
    expect(p.pricingSource).not.toBe("pending");
    expect(p.pricingSource).not.toBe("estimated");
    expect(
      typeof p.unitPrice === "number" || typeof p.estimatedProjectPrice === "number",
    ).toBe(true);
  });

  it("sink primary is undermount white", () => {
    const p = MODERN_BALANCED.bins.sink.primary as BinProduct;
    expect(p.mountType).toBe("undermount");
    expect((p.finish ?? "").toLowerCase()).toContain("white");
  });

  it("showerSystem primary is matte-black trim kit", () => {
    const p = MODERN_BALANCED.bins.showerSystem.primary as BinProduct;
    expect((p.finish ?? "").toLowerCase()).toContain("matte black");
  });

  it("accentTile primary uses project-allowance pricing", () => {
    const p = MODERN_BALANCED.bins.accentTile.primary as BinProduct;
    expect(p.pricingSource).toBe("project-allowance");
    expect(typeof p.estimatedProjectPrice).toBe("number");
  });
});

describe("Phase 2.8 — alternative standards for newly opened bins", () => {
  for (const k of NEW_BINS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backups = (MODERN_BALANCED.bins as any)[k].backups as BinProduct[];
    backups.forEach((bp, i) => {
      it(`alt #${i} in ${k} has required metadata`, () => {
        expect(typeof bp.vendor).toBe("string");
        expect((bp.vendor ?? "").length).toBeGreaterThan(0);
        expect(typeof bp.canonicalKey).toBe("string");
        expect(bp.isCuratedOnly).toBe(true);
        expect(
          typeof bp.unitPrice === "number" ||
            typeof bp.estimatedProjectPrice === "number",
        ).toBe(true);
        expect(bp.pricingSource).toBeDefined();
        if (bp.pricingSource === "pending" || bp.pricingSource === "estimated") {
          expect(typeof bp.pricingNote).toBe("string");
          expect((bp.pricingNote ?? "").length).toBeGreaterThan(0);
        }
      });
    });
  }
});

describe("Phase 2.8 — resolveSlot smoke test for opened bins", () => {
  it.each(NEW_BINS)("resolveSlot for %s yields a usable, non-unresolved primary", (k) => {
    const slot = resolveSlot(
      "modern-balanced",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      k as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (MODERN_BALANCED.bins as any)[k] as BinT,
    );
    expect(slot.isUnresolved).toBe(false);
    expect(slot.product).toBeDefined();
    expect(slot.product.canonicalKey.length).toBeGreaterThan(0);
  });
});

describe("Phase 2.8 — buildEngineCategoriesForCustomize surfaces new bins", () => {
  const out = buildEngineCategoriesForCustomize({
    urlId: "balanced",
    style: "modern",
  });

  it("output is non-null", () => {
    expect(out).not.toBeNull();
  });

  it.each(["Sinks", "Shower Systems", "Accent Tile"])(
    "category '%s' is present",
    (label) => {
      expect(out!.some((c) => c.name === label)).toBe(true);
    },
  );

  it("does not surface Bathtubs or Tub Valve from engine", () => {
    expect(out!.some((c) => c.name === "Bathtubs")).toBe(false);
    expect(out!.some((c) => c.name === "Tub Valve")).toBe(false);
  });

  it("no opened category is unresolved", () => {
    for (const c of out!) {
      expect(c._engine.isUnresolved).toBe(false);
    }
  });

  it("no duplicate categories", () => {
    const names = out!.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Phase 2.8 — completeness diagnostics reflect new bins", () => {
  it("MODERN_BALANCED full catalog: confirmed primaries grew to ≥14", () => {
    const products = Object.entries(MODERN_BALANCED.bins).flatMap(([k, bin]) => {
      const b = bin as Bin;
      return [b.primary, ...b.backups].map((bp, i) =>
        adaptBinProduct(
          "modern-balanced",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          k as any,
          bp,
          i,
          b.sourcing,
          b.intent,
        ),
      );
    });
    const r = getEngineDataCompleteness(products);
    // 11 prior primaries + 3 new (sink, showerSystem, accentTile) = 14 confirmed primaries minimum
    expect(r.confirmedPricingCount).toBeGreaterThanOrEqual(14);
    // Pending count remains bounded — only the documented bidet-ready alt
    expect(r.pendingPricingCount).toBeLessThanOrEqual(2);
  });
});
