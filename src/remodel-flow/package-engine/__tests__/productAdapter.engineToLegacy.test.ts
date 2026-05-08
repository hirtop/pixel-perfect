import { describe, it, expect } from "vitest";
import {
  adaptEngineProductToLegacy,
  adaptEngineSlotToLegacy,
  findLegacyMatch,
} from "../productAdapter";
import { resolveSlot } from "../resolveSlot";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import type { BinKey, Product, ResolvedSlot } from "../types";
import { tieredCatalog } from "@/data/tiered-catalog";

const baseProduct: Product = {
  id: "x:y:z",
  categoryId: "vanity",
  name: "Some Vanity",
  styleTags: [],
  bin: "mid",
  availability: "active",
};

describe("productAdapter (engine→legacy)", () => {
  it("preserves engine fields when no legacy match exists", () => {
    const out = adaptEngineProductToLegacy(
      { ...baseProduct, name: "Totally Fake Product Name 9999", price: 123, image: "img://x" },
      { legacyTier: "Balanced" },
    );
    expect(out.name).toBe("Totally Fake Product Name 9999");
    expect(out.price).toBe(123);
    expect(out.image).toBe("img://x");
    expect(out.vendor).toBe(""); // never invented
    expect(out.enrichedFromLegacyId).toBeNull();
    expect(out.isFallback).toBe(false);
    expect(out.isUnresolved).toBe(false);
  });

  it("does not crash when product has no price/image", () => {
    expect(() =>
      adaptEngineProductToLegacy(baseProduct, { legacyTier: "Balanced" }),
    ).not.toThrow();
    const out = adaptEngineProductToLegacy(baseProduct, { legacyTier: "Balanced" });
    expect(out.price).toBe(0);
  });

  it("preserves productUrl as affiliateUrl when no enrichment", () => {
    const out = adaptEngineProductToLegacy(
      { ...baseProduct, productUrl: "https://example.com/p" },
      { legacyTier: "Balanced" },
    );
    expect(out.affiliateUrl).toBe("https://example.com/p");
  });

  it("findLegacyMatch returns null for unknown name", () => {
    expect(
      findLegacyMatch({ name: "zzz nothing matches", productUrl: undefined }, "Balanced"),
    ).toBeNull();
  });

  it("findLegacyMatch matches a real Balanced catalog row by exact name", () => {
    const known = tieredCatalog.find((p) => p.tier === "Balanced");
    expect(known).toBeTruthy();
    if (!known) return;
    const match = findLegacyMatch({ name: known.name, productUrl: undefined }, "Balanced");
    expect(match?.id).toBe(known.id);
  });

  it("adapts a full ResolvedSlot — modern-balanced vanity", () => {
    const bin = MODERN_BALANCED.bins.vanity;
    const slot = resolveSlot("modern-balanced", "vanity" as BinKey, bin as never);
    const adapted = adaptEngineSlotToLegacy(slot, { legacyTier: "Balanced" });
    expect(adapted.primary.name).toBeTruthy();
    expect(adapted.primary.image).toBeDefined();
    expect(adapted.alternatives.length).toBe(slot.alternatives.length);
  });

  it("propagates isFallback / isUnresolved flags", () => {
    const slot: ResolvedSlot = {
      categoryId: "vanity",
      product: baseProduct,
      isFallback: true,
      isUnresolved: true,
      alternatives: [],
    };
    const adapted = adaptEngineSlotToLegacy(slot, { legacyTier: "Balanced" });
    expect(adapted.primary.isFallback).toBe(true);
    expect(adapted.primary.isUnresolved).toBe(true);
  });
});
