import { describe, it, expect } from "vitest";
import { getTradeoffCopy, tagDirection } from "../swapTradeoff";

describe("swapTradeoff", () => {
  it("returns gain/give-up for value tags", () => {
    const copy = getTradeoffCopy("Vanities", "Value Pick");
    expect(copy).not.toBeNull();
    expect(copy?.costLabel).toBe("give-up");
    expect(copy?.gain).toMatch(/lower/i);
  });

  it("returns gain/adds-to for upgrade tags", () => {
    const copy = getTradeoffCopy("Faucets", "Upgrade");
    expect(copy?.costLabel).toBe("adds-to");
    expect(copy?.cost).toMatch(/your material estimate\./i);
  });

  it("returns null for Best tag (curation, not upgrade)", () => {
    expect(getTradeoffCopy("Vanities", "Best")).toBeNull();
    expect(getTradeoffCopy("Faucets", "Best Fit")).toBeNull();
  });

  it("returns null for Recommended tag", () => {
    expect(getTradeoffCopy("Vanities", "Recommended")).toBeNull();
  });

  it("falls back when no category-specific copy exists", () => {
    const copy = getTradeoffCopy("Tub Valve", "Value");
    expect(copy?.gain).toMatch(/lower material cost/i);
    expect(copy?.costLabel).toBe("give-up");
  });

  it("returns null when tag has no direction", () => {
    expect(getTradeoffCopy("Vanities", "Recommended")).toBeNull();
    expect(getTradeoffCopy("Vanities", undefined)).toBeNull();
  });

  it("tagDirection maps tags correctly", () => {
    expect(tagDirection("Value Pick")).toBe("value");
    expect(tagDirection("Budget")).toBe("value");
    expect(tagDirection("Essential")).toBe("value");
    expect(tagDirection("Upgrade")).toBe("upgrade");
    expect(tagDirection("Premium")).toBe("upgrade");
    expect(tagDirection("Best")).toBeNull();
    expect(tagDirection("Best Fit")).toBeNull();
    expect(tagDirection("Recommended")).toBeNull();
  });
});
