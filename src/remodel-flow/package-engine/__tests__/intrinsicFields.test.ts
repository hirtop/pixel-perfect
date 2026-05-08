/**
 * Phase 2.5 — engine `Product` now owns intrinsic fields. These tests
 * pin the derivation rules so future changes to MODERN_BALANCED don't
 * silently drop vendor / width / faucetHole / mountType metadata.
 */
import { describe, it, expect } from "vitest";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import { resolveSlot, getEngineProductTotalPrice } from "../resolveSlot";
import type { Bin } from "@/remodel-flow/packages/modern-balanced";

describe("Phase 2.5 intrinsic fields", () => {
  it("vanity primary derives widthInches and wall mount", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "vanity",
      MODERN_BALANCED.bins.vanity as Bin,
    );
    expect(slot.product.widthInches).toBe(36);
    expect(slot.product.mountType).toBe("wall");
  });

  it("faucet primary derives single-hole + Delta vendor", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "faucet",
      MODERN_BALANCED.bins.faucet as Bin,
    );
    expect(slot.product.faucetHoles).toBe(1);
    expect(slot.product.vendor).toBe("Delta");
    expect(slot.product.unitPrice).toBe(329);
  });

  it("canonicalKey is stable and URL-derived when link present", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "faucet",
      MODERN_BALANCED.bins.faucet as Bin,
    );
    // Delta Trinsic SKU tail
    expect(slot.product.canonicalKey).toContain("301646776");
  });

  it("isCuratedOnly is set on modern-balanced products", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "vanity",
      MODERN_BALANCED.bins.vanity as Bin,
    );
    expect(slot.product.isCuratedOnly).toBe(true);
  });

  it("getEngineProductTotalPrice prefers estimatedProjectPrice", () => {
    expect(
      getEngineProductTotalPrice({
        unitPrice: 10,
        estimatedProjectPrice: 568,
      }),
    ).toBe(568);
    expect(getEngineProductTotalPrice({ unitPrice: 329 })).toBe(329);
    expect(getEngineProductTotalPrice({ price: 100 })).toBe(100);
    expect(getEngineProductTotalPrice({})).toBe(0);
  });

  it("tile bins surface estimatedProjectPrice from priceRange upper bound", () => {
    const slot = resolveSlot(
      "modern-balanced",
      "showerWallTile",
      MODERN_BALANCED.bins.showerWallTile as Bin,
    );
    // showerWallTile primary: priceRange [480, 960] — engine should treat
    // 960 as the project allowance, 480 as the unit/per-SF price.
    expect(slot.product.unitPrice).toBe(480);
    expect(slot.product.estimatedProjectPrice).toBe(960);
    expect(getEngineProductTotalPrice(slot.product)).toBe(960);
  });
});
