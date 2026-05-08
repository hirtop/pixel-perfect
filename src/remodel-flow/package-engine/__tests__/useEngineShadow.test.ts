/**
 * Phase 2.11 — useEngineShadow tests.
 *
 * Tests the pure `computeEngineShadow` core directly so we don't need
 * to depend on Vite's static replacement of import.meta.env flags.
 */
import { describe, it, expect } from "vitest";
import { computeEngineShadow } from "../useEngineShadow";
import { buildLegacyDrawerCategoriesFromCatalog } from "../dev/buildLegacyDrawerCategoriesFromCatalog";
import { buildEngineCategoriesForCustomize } from "../buildEngineCategoriesForCustomize";

const LEGACY_BIN_KEYS = [
  "vanity", "sink", "faucet", "mirror",
  "showerWallTile", "showerFloorTile", "mainFloorTile", "accentTile",
  "showerDoor", "showerValve", "showerSystem",
] as const;

const buildLegacy = () =>
  buildLegacyDrawerCategoriesFromCatalog(
    LEGACY_BIN_KEYS as unknown as never,
    "Balanced",
  );

describe("Phase 2.11 — useEngineShadow guards", () => {
  it("returns inactive (engine-disabled) when flag is false", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: [] },
      false,
    );
    expect(r.isActive).toBe(false);
    expect(r.reason).toBe("engine-disabled");
    expect(r.engineCategories).toBeNull();
  });

  it("returns inactive (not-modern-balanced) for non-modern styles", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "classic", legacyCategories: [] },
      true,
    );
    expect(r.isActive).toBe(false);
    expect(r.reason).toBe("not-modern-balanced");
  });

  it("returns inactive for premium tier", () => {
    const r = computeEngineShadow(
      { urlId: "premium", style: "modern", legacyCategories: [] },
      true,
    );
    expect(r.isActive).toBe(false);
    expect(r.reason).toBe("not-modern-balanced");
  });

  it("returns inactive for essential tier", () => {
    const r = computeEngineShadow(
      { urlId: "essential", style: "modern", legacyCategories: [] },
      true,
    );
    expect(r.isActive).toBe(false);
    expect(r.reason).toBe("not-modern-balanced");
  });

  it("returns active for balanced + modern", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: buildLegacy() },
      true,
    );
    expect(r.isActive).toBe(true);
    expect(r.engineCategories).not.toBeNull();
    expect(r.diffReport).not.toBeNull();
    expect(r.diagnostics).not.toBeNull();
  });
});

describe("Phase 2.11 — useEngineShadow diff + diagnostics", () => {
  it("matches buildEngineCategoriesForCustomize totalBins", () => {
    const legacy = buildLegacy();
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: legacy },
      true,
    );
    const direct = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    expect(r.diagnostics!.totalBins).toBe(direct!.length);
  });

  it("produces 0 unexplained deltas for MODERN_BALANCED", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: buildLegacy() },
      true,
    );
    expect(r.diffReport!.unexplainedDeltaCount).toBe(0);
  });

  it("classification distribution sums to engine bin count", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: buildLegacy() },
      true,
    );
    const d = r.diffReport!;
    const total =
      d.identicalCount +
      d.curatedOnlyVendorMismatchCount +
      d.pricingPerOptionACount +
      d.unexplainedDeltaCount;
    expect(total).toBe(r.engineCategories!.length);
    expect(d.deltas.length).toBe(r.engineCategories!.length);
  });

  it("diagnostics pricing counts sum reflects engine categories", () => {
    const r = computeEngineShadow(
      { urlId: "balanced", style: "modern", legacyCategories: buildLegacy() },
      true,
    );
    const d = r.diagnostics!;
    expect(
      d.confirmedPricingCount + d.estimatedPricingCount + d.pendingPricingCount,
    ).toBeLessThanOrEqual(d.totalBins);
  });
});
