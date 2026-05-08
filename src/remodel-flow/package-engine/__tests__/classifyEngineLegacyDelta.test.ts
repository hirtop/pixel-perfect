/**
 * Phase 2.10 — classifyEngineLegacyDelta tests.
 */
import { describe, it, expect } from "vitest";
import { classifyEngineLegacyDelta } from "../dev/classifyEngineLegacyDelta";

describe("Phase 2.10 — classifyEngineLegacyDelta", () => {
  it("identical: name + vendor + price match", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: { name: "Trinsic Faucet", vendor: "Delta", price: 200 },
        legacy: { name: "Trinsic Faucet", vendor: "Delta", price: 200 },
      }),
    ).toBe("identical");
  });

  it("curated-only-vendor-mismatch: curated-only, no legacy enrichment", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: {
          name: "Curated Vanity",
          vendor: "BrandX",
          price: 1200,
          isCuratedOnly: true,
          enrichedFromLegacyId: null,
          pricingSource: "retailer",
        },
        legacy: { name: "Other Vanity", vendor: "BrandY", price: 1200 },
      }),
    ).toBe("curated-only-vendor-mismatch");
  });

  it("pricing-per-Option-A: only price differs and pricingSource is retailer", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: {
          name: "Trinsic",
          vendor: "Delta",
          price: 250,
          pricingSource: "retailer",
        },
        legacy: { name: "Trinsic", vendor: "Delta", price: 200 },
      }),
    ).toBe("pricing-per-Option-A");
  });

  it("pricing-per-Option-A: project-allowance also counts", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: {
          name: "Tile",
          vendor: "Daltile",
          price: 800,
          pricingSource: "project-allowance",
        },
        legacy: { name: "Tile", vendor: "Daltile", price: 600 },
      }),
    ).toBe("pricing-per-Option-A");
  });

  it("unexplained: name+vendor match, price differs, no confirmed pricing source", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: { name: "Faucet", vendor: "Delta", price: 99 },
        legacy: { name: "Faucet", vendor: "Delta", price: 200 },
      }),
    ).toBe("unexplained");
  });

  it("unexplained: estimated pricing does not satisfy Option A", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: {
          name: "Faucet",
          vendor: "Delta",
          price: 99,
          pricingSource: "estimated",
        },
        legacy: { name: "Faucet", vendor: "Delta", price: 200 },
      }),
    ).toBe("unexplained");
  });

  it("unexplained: curated-only with price diff but no confirmed source", () => {
    expect(
      classifyEngineLegacyDelta({
        engine: {
          name: "X",
          vendor: "Y",
          price: 99,
          isCuratedOnly: true,
          enrichedFromLegacyId: null,
          pricingSource: "pending",
        },
        legacy: { name: "Z", vendor: "W", price: 200 },
      }),
    ).toBe("unexplained");
  });
});
