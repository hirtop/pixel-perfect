/**
 * Phase 2.6 — diagnostics & explicit-intrinsic-field tests.
 */

import { describe, it, expect } from "vitest";
import { adaptBinProduct } from "../resolveSlot";
import {
  computeEngineDiffEnabled,
  diffEngineVsLegacy,
  getDerivedIntrinsicFields,
} from "../engineDiagnostics";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";

describe("Phase 2.6 — explicit intrinsic fields beat regex", () => {
  const baseSpec = {
    name: "Delta Trinsic Single Hole Faucet",
    priceRange: [200, 200] as [number, number],
    type: "single_hole",
    link: "https://www.homedepot.com/p/foo/123",
    retailer: "Home Depot",
  };

  it("explicit vendor beats regex", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      ...baseSpec,
      vendor: "ExplicitBrand",
    }, 0, "ready");
    expect(p.vendor).toBe("ExplicitBrand");
    expect(p._engineFieldSources?.vendor).toBe("explicit");
  });

  it("explicit widthInches beats regex", () => {
    const p = adaptBinProduct("modern-balanced", "vanity", {
      name: 'Floating Vanity 36"',
      priceRange: [1000, 1000],
      widthInches: 42,
    }, 0, "ready");
    expect(p.widthInches).toBe(42);
    expect(p._engineFieldSources?.widthInches).toBe("explicit");
  });

  it("explicit mountType beats regex", () => {
    const p = adaptBinProduct("modern-balanced", "vanity", {
      name: "Floating Vanity",
      priceRange: [1000, 1000],
      mountType: "floor",
    }, 0, "ready");
    expect(p.mountType).toBe("floor");
    expect(p._engineFieldSources?.mountType).toBe("explicit");
  });

  it("explicit faucetHoles beats regex", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      ...baseSpec,
      faucetHoles: 3,
    }, 0, "ready");
    expect(p.faucetHoles).toBe(3);
    expect(p._engineFieldSources?.faucetHoles).toBe("explicit");
  });

  it("explicit unitPrice beats derived price", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      ...baseSpec,
      price: 200,
      unitPrice: 250,
    }, 0, "ready");
    expect(p.unitPrice).toBe(250);
    expect(p._engineFieldSources?.unitPrice).toBe("explicit");
  });

  it("explicit estimatedProjectPrice beats derived priceRange", () => {
    const p = adaptBinProduct("modern-balanced", "showerWallTile", {
      name: 'Tile 12"x24"',
      priceRange: [10, 800],
      estimatedProjectPrice: 1234,
    }, 0, "ready");
    expect(p.estimatedProjectPrice).toBe(1234);
    expect(p._engineFieldSources?.estimatedProjectPrice).toBe("explicit");
  });

  it("explicit canonicalKey beats derived URL/name key", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      ...baseSpec,
      canonicalKey: "my-explicit-key",
    }, 0, "ready");
    expect(p.canonicalKey).toBe("my-explicit-key");
    expect(p._engineFieldSources?.canonicalKey).toBe("explicit");
  });

  it("falls back to regex when explicit absent (vendor)", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", baseSpec, 0, "ready");
    expect(p.vendor).toBe("Delta");
    expect(p._engineFieldSources?.vendor).toBe("regex");
  });

  it("reports missing when nothing derivable", () => {
    const p = adaptBinProduct("modern-balanced", "lighting", {
      name: "Generic Light",
      priceRange: [100, 100],
    }, 0, "ready");
    expect(p._engineFieldSources?.vendor).toBe("missing");
  });
});

describe("Phase 2.6 — MODERN_BALANCED primary coverage", () => {
  const primaries = Object.entries(MODERN_BALANCED.bins).map(
    ([k, b]) => [k, b.primary] as const,
  );

  it.each(primaries)("primary in bin %s has explicit vendor", (_k, p) => {
    expect(typeof p.vendor).toBe("string");
    expect(p.vendor!.length).toBeGreaterThan(0);
  });

  it.each(primaries)("primary in bin %s has explicit canonicalKey", (_k, p) => {
    expect(typeof p.canonicalKey).toBe("string");
    expect(p.canonicalKey!.length).toBeGreaterThan(0);
  });

  it.each(primaries)("primary in bin %s has explicit unitPrice or estimatedProjectPrice", (_k, p) => {
    const bp = p as { unitPrice?: number; estimatedProjectPrice?: number };
    expect(
      typeof bp.unitPrice === "number" || typeof bp.estimatedProjectPrice === "number",
    ).toBe(true);
  });

  it.each(primaries)("primary in bin %s is curated-only", (_k, p) => {
    expect(p.isCuratedOnly).toBe(true);
  });

  it("vanity primary has widthInches + mountType + faucetHoles", () => {
    const v = MODERN_BALANCED.bins.vanity.primary;
    expect(typeof v.widthInches).toBe("number");
    expect(v.mountType).toBeDefined();
    expect(v.faucetHoles).toBeDefined();
  });

  it("faucet primary has faucetHoles", () => {
    expect(MODERN_BALANCED.bins.faucet.primary.faucetHoles).toBeDefined();
  });
});

describe("Phase 2.6 — MODERN_BALANCED alternative coverage", () => {
  it("every bin has at least one alternative with explicit vendor + canonicalKey", () => {
    for (const [name, bin] of Object.entries(MODERN_BALANCED.bins)) {
      const hasExplicit = bin.backups.some(
        (b) =>
          typeof b.vendor === "string" &&
          b.vendor.length > 0 &&
          typeof b.canonicalKey === "string",
      );
      expect(hasExplicit, `bin ${name} missing explicit-fields backup`).toBe(true);
    }
  });
});

describe("Phase 2.6 — getDerivedIntrinsicFields", () => {
  it("explicit-only product reports no derived fields for tracked fields", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      name: "Faucet",
      priceRange: [100, 100],
      vendor: "X",
      unitPrice: 100,
      canonicalKey: "x",
      faucetHoles: 1,
    }, 0, "ready");
    const r = getDerivedIntrinsicFields(p);
    expect(r.derivedFields).not.toContain("vendor");
    expect(r.derivedFields).not.toContain("canonicalKey");
  });

  it("regex-derived product reports derived vendor", () => {
    const p = adaptBinProduct("modern-balanced", "faucet", {
      name: "Delta Trinsic Faucet",
      priceRange: [100, 100],
    }, 0, "ready");
    const r = getDerivedIntrinsicFields(p);
    expect(r.derivedFields).toContain("vendor");
  });
});

describe("Phase 2.6 — diffEngineVsLegacy", () => {
  const legacy = {
    name: "Vanities",
    selected: "Oak Vanity",
    price: 1700,
    vendor: "Acme",
    finish: "Oak",
    image: "img.jpg",
    tag: "Best",
    spec: "36in",
    disclaimer: "x",
    affiliateUrl: "u",
    alternatives: [{}, {}],
  };

  it("same fields produce status 'same'", () => {
    const r = diffEngineVsLegacy(legacy, { ...legacy });
    for (const d of r.differences) {
      if (d.field === "alternativesCount") continue;
      expect(d.status).toBe("same");
    }
  });

  it("changed fields produce 'different'", () => {
    const r = diffEngineVsLegacy(legacy, { ...legacy, price: 9999 });
    expect(r.differences.find((d) => d.field === "price")?.status).toBe("different");
  });

  it("missing legacy field produces 'engine-only'", () => {
    const r = diffEngineVsLegacy({ ...legacy, tag: undefined }, legacy);
    expect(r.differences.find((d) => d.field === "tag")?.status).toBe("engine-only");
  });

  it("missing engine field produces 'legacy-only'", () => {
    const r = diffEngineVsLegacy(legacy, { ...legacy, spec: undefined });
    expect(r.differences.find((d) => d.field === "spec")?.status).toBe("legacy-only");
  });

  it("curated-only product without legacy enrichment is reported", () => {
    const r = diffEngineVsLegacy(legacy, {
      ...legacy,
      _engine: { enrichedFromLegacyId: null },
    });
    expect(r.isCuratedOnlyWithoutLegacy).toBe(true);
  });
});

describe("Phase 2.6 — ENGINE_DIFF flag semantics", () => {
  it("OFF by default", () => {
    expect(computeEngineDiffEnabled({})).toBe(false);
  });
  it("requires DEV", () => {
    expect(
      computeEngineDiffEnabled({
        ENGINE_DRAWER_ENABLED: true,
        VITE_BOBOX_ENGINE_DIFF: "true",
        DEV: false,
      }),
    ).toBe(false);
  });
  it("requires engine drawer flag", () => {
    expect(
      computeEngineDiffEnabled({
        DEV: true,
        VITE_BOBOX_ENGINE_DIFF: "true",
        ENGINE_DRAWER_ENABLED: false,
      }),
    ).toBe(false);
  });
  it("requires diff flag === 'true'", () => {
    for (const v of ["1", "TRUE", " true ", "yes", undefined, ""]) {
      expect(
        computeEngineDiffEnabled({
          DEV: true,
          ENGINE_DRAWER_ENABLED: true,
          VITE_BOBOX_ENGINE_DIFF: v as string | undefined,
        }),
      ).toBe(false);
    }
  });
  it("ON only when all three are set", () => {
    expect(
      computeEngineDiffEnabled({
        DEV: true,
        ENGINE_DRAWER_ENABLED: true,
        VITE_BOBOX_ENGINE_DIFF: "true",
      }),
    ).toBe(true);
  });
});
