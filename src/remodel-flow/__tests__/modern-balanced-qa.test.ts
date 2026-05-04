import { describe, it, expect } from "vitest";
import { getPackageFor, getPackageId } from "../catalog";
import {
  MODERN_BALANCED,
  filterBinForModernBalanced,
  isAllowedInModernBalanced,
  type Bin,
} from "../packages/modern-balanced";
import { serializeForDb, deserializeFromDb } from "../persistence/serializer";

describe("Modern Balanced QA", () => {
  it("packageId is 'modern-balanced'", () => {
    expect(getPackageId("modern", "balanced")).toBe("modern-balanced");
    expect(getPackageFor("modern", "balanced").id).toBe("modern-balanced");
  });

  it("exposes exactly 11 curated bins", () => {
    expect(Object.keys(MODERN_BALANCED.bins)).toHaveLength(11);
  });

  it("faucet bin uses Trinsic / Doux / Trinsic Champagne — no legacy products", () => {
    const f = MODERN_BALANCED.bins.faucet;
    expect(f.primary.name).toMatch(/Trinsic/i);
    const names = [f.primary.name, ...f.backups.map((b) => b.name)].join(" | ");
    expect(names).toMatch(/Trinsic/);
    expect(names).toMatch(/Doux/);
    expect(names).toMatch(/Champagne/i);
    // No legacy generic ids
    expect(names).not.toMatch(/Chrome Essentials/i);
    expect(names).not.toMatch(/Brushed Nickel Suite/i);
  });

  it("each bin has exactly one primary === true", () => {
    for (const [key, bin] of Object.entries(MODERN_BALANCED.bins) as [string, Bin][]) {
      expect(bin.primary.primary, `${key}.primary.primary`).toBe(true);
      const backupPrimaries = bin.backups.filter((b) => b.primary === true);
      expect(backupPrimaries, `${key} backups should not be primary`).toHaveLength(0);
    }
  });

  it("style validation blocks non-modern products and keeps modern ones", () => {
    expect(isAllowedInModernBalanced({ name: "x", priceRange: [1, 1], style: ["modern"] })).toBe(true);
    expect(isAllowedInModernBalanced({ name: "x", priceRange: [1, 1], style: ["minimal"] })).toBe(true);
    expect(isAllowedInModernBalanced({ name: "x", priceRange: [1, 1], style: ["traditional"] })).toBe(false);
    expect(isAllowedInModernBalanced({ name: "x", priceRange: [1, 1], style: ["classic"] })).toBe(false);
    expect(isAllowedInModernBalanced({ name: "x", priceRange: [1, 1] })).toBe(false);
  });

  it("filterBinForModernBalanced preserves all curated bins (all tagged modern/minimal)", () => {
    for (const [key, bin] of Object.entries(MODERN_BALANCED.bins) as [string, Bin][]) {
      const filtered = filterBinForModernBalanced(bin);
      expect(filtered, `${key} should not be dropped`).not.toBeNull();
    }
  });

  it("filterBinForModernBalanced drops a bin whose products are all non-modern", () => {
    const bad: Bin = {
      intent: "x",
      sourcing: "ready",
      primary: { name: "Trad A", priceRange: [1, 1], style: ["traditional"] },
      backups: [{ name: "Ornate B", priceRange: [1, 1], style: ["ornate"] }],
      constraints: [],
      priceRange: [1, 1],
      customerText: "x",
    };
    expect(filterBinForModernBalanced(bad)).toBeNull();
  });

  it("save/load preserves Modern Balanced state including packageId", () => {
    const row = serializeForDb({
      style: "modern",
      tier: "balanced",
      packageId: "modern-balanced",
      selections: { vanity: "vanity-floating" },
    });
    expect(row.selected_package_id).toBe("modern-balanced");
    expect(row.selected_style).toBe("modern");
    expect(row.selected_tier).toBe("balanced");

    const { state } = deserializeFromDb(row);
    expect(state.packageId).toBe("modern-balanced");
    expect(state.style).toBe("modern");
    expect(state.tier).toBe("balanced");
    expect(state.selections.vanity).toBe("vanity-floating");
  });

  it("other styles/tiers keep generic ids", () => {
    expect(getPackageId("classic", "balanced")).toBe("classic-balanced");
    expect(getPackageId("modern", "premium")).toBe("modern-premium");
    expect(getPackageId(undefined, "balanced")).toBe("balanced");
  });
});
