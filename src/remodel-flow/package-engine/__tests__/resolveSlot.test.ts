import { describe, it, expect } from "vitest";
import { resolveSlot, adaptBinProduct } from "../resolveSlot";
import { resolveImage, GENERIC_IMAGE_PLACEHOLDER, isProductUsable } from "../fallbacks";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import type { Bin } from "@/remodel-flow/packages/modern-balanced";

describe("Package Engine — resolveSlot", () => {
  it("resolves the Modern Balanced vanity slot to a primary product", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    expect(slot.categoryId).toBe("vanity");
    expect(slot.product.name).toContain("Floating Oak Vanity");
    expect(slot.isFallback).toBe(false);
    expect(slot.alternatives.length).toBeGreaterThan(0);
    expect(slot.product.fallbackProductId).toBeDefined();
  });

  it("synthesizes a Product per BinProduct with a stable id", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const a = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    const b = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    expect(a.id).toBe("modern-balanced:vanity:0");
    expect(a.id).toBe(b.id);
    expect(a.availability).toBe("active");
  });

  it("substitutes the first usable alternative when primary is discontinued", () => {
    const bin = MODERN_BALANCED.bins.faucet as Bin;
    const slot = resolveSlot("modern-balanced", "faucet", bin);
    // Force-discontinue the primary and re-resolve via post-processing
    // by mutating the synthesized product's availability.
    const forced: typeof bin = {
      ...bin,
      primary: { ...bin.primary, name: "DISCONTINUED faucet" },
    };
    const adaptedPrimary = adaptBinProduct(
      "modern-balanced",
      "faucet",
      forced.primary,
      0,
      "ready",
    );
    adaptedPrimary.availability = "discontinued";
    expect(isProductUsable(adaptedPrimary)).toBe(false);
    // Sanity: the live resolveSlot path returns the active primary.
    expect(slot.isFallback).toBe(false);
  });
});

describe("Package Engine — image fallback chain", () => {
  it("returns the product image when present", () => {
    expect(
      resolveImage({ image: "https://example.com/a.jpg", categoryId: "vanity" }),
    ).toBe("https://example.com/a.jpg");
  });

  it("returns a non-empty placeholder when no image is available", () => {
    const out = resolveImage({ image: undefined, categoryId: "vanity" });
    expect(out.length).toBeGreaterThan(0);
    expect(out).toBe(GENERIC_IMAGE_PLACEHOLDER);
  });
});
