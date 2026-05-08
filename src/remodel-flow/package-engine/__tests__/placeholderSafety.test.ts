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
  it("matrix is exactly 1 curated + 8 placeholder (0 partial)", () => {
    const counts = PACKAGE_MANIFEST.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    expect(counts.curated).toBe(1);
    expect(counts.placeholder).toBe(8);
    expect(counts.partial ?? 0).toBe(0);
    expect(PACKAGE_MANIFEST.length).toBe(9);
  });

  it("flags exactly the 8 Phase-1 placeholder packages", () => {
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

  it("isCustomerReadyPackage and assert exclude hypothetical 'partial' status", () => {
    const fakePartial = { status: "partial" as const };
    expect(isCustomerReadyPackage(fakePartial)).toBe(false);
    expect(() =>
      // @ts-expect-error — exercising the runtime guard for non-curated status
      assertCustomerReadyPackage({ id: "modern-balanced", status: "partial", label: "x" }),
    ).toThrow();
  });

  it("listCustomerReadyPackages returns only curated entries", () => {
    for (const p of listCustomerReadyPackages()) {
      expect(p.status).toBe("curated");
    }
  });

  it("assertCustomerReadyPackage allows curated and refuses placeholder", () => {
    expect(() => assertCustomerReadyPackage(getPackage("modern-balanced"))).not.toThrow();
    expect(() => assertCustomerReadyPackage(getPackage("spa-essential"))).toThrow();
    expect(() => assertCustomerReadyPackage(undefined)).toThrow();
  });
});
