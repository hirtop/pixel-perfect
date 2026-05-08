import { describe, it, expect } from "vitest";
import {
  PACKAGE_MANIFEST,
  isCustomerReadyPackage,
  isPlaceholderPackage,
  assertCustomerReadyPackage,
  listCustomerReadyPackages,
  getPackage,
} from "../registry";

describe("Package Engine — placeholder safety", () => {
  it("flags exactly the 7 Phase-1 placeholder packages", () => {
    const placeholders = PACKAGE_MANIFEST.filter(isPlaceholderPackage).map((p) => p.id);
    expect(placeholders.sort()).toEqual(
      [
        "classic-balanced",
        "classic-essential",
        "classic-premium",
        "modern-essential",
        "modern-premium",
        "spa-balanced",
        "spa-essential",
        "spa-premium",
      ].sort(),
    );
  });

  it("modern-balanced is the only currently-curated package", () => {
    const ready = listCustomerReadyPackages().map((p) => p.id);
    expect(ready).toEqual(["modern-balanced"]);
  });

  it("isCustomerReadyPackage excludes placeholder packages", () => {
    for (const p of PACKAGE_MANIFEST.filter(isPlaceholderPackage)) {
      expect(isCustomerReadyPackage(p)).toBe(false);
    }
  });

  it("assertCustomerReadyPackage allows curated and refuses placeholder", () => {
    expect(() => assertCustomerReadyPackage(getPackage("modern-balanced"))).not.toThrow();
    expect(() => assertCustomerReadyPackage(getPackage("spa-essential"))).toThrow();
    expect(() => assertCustomerReadyPackage(undefined)).toThrow();
  });
});
