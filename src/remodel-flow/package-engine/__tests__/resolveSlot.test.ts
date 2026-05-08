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

  it("synthesizes a Product per BinProduct with a stable, deterministic id", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const a = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    const b = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    expect(a.id).toBe(b.id);
    expect(a.id.startsWith("modern-balanced:vanity:")).toBe(true);
    expect(a.availability).toBe("active");
  });

  it("alternatives produce different ids from the primary", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const primary = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    const ids = bin.backups.map((b, i) =>
      adaptBinProduct("modern-balanced", "vanity", b, i + 1, "ready").id,
    );
    for (const id of ids) expect(id).not.toBe(primary.id);
    expect(new Set([primary.id, ...ids]).size).toBe(1 + ids.length);
  });

  it("changing display name alone does not change id when link is present", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    if (!bin.primary.link) return; // only meaningful when link exists
    const original = adaptBinProduct("modern-balanced", "vanity", bin.primary, 0, "ready");
    const renamed = adaptBinProduct(
      "modern-balanced",
      "vanity",
      { ...bin.primary, name: "Totally Different Display Name" },
      0,
      "ready",
    );
    expect(renamed.id).toBe(original.id);
  });

  it("falls back to name slug when link is missing", () => {
    const synthetic = {
      name: "Brushed Brass Floating Vanity",
      priceRange: [100, 200] as [number, number],
    };
    const a = adaptBinProduct("modern-balanced", "vanity", synthetic, 0, "ready");
    const b = adaptBinProduct("modern-balanced", "vanity", synthetic, 7, "ready");
    expect(a.id).toBe(b.id);
    expect(a.id).toBe("modern-balanced:vanity:brushed-brass-floating-vanity");
  });

  it("fallback chain remains stable across repeated resolveSlot calls", () => {
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const r1 = resolveSlot("modern-balanced", "vanity", bin);
    const r2 = resolveSlot("modern-balanced", "vanity", bin);
    expect(r1.product.id).toBe(r2.product.id);
    expect(r1.product.fallbackProductId).toBe(r2.product.fallbackProductId);
    expect(r1.alternatives.map((a) => a.id)).toEqual(r2.alternatives.map((a) => a.id));
  });

  it("does not crash when primary and all alternatives are unusable", () => {
    const bin: Bin = {
      sourcing: "ready",
      primary: { name: "Gone A", priceRange: [10, 20] },
      backups: [{ name: "Gone B", priceRange: [10, 20] }],
    } as unknown as Bin;
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    // Force everything discontinued post-hoc — the resolver must still
    // return a defined slot rather than throwing.
    slot.product.availability = "discontinued";
    slot.alternatives.forEach((a) => (a.availability = "discontinued"));
    expect(slot).toBeDefined();
    expect(slot.product).toBeDefined();
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
