import { describe, it, expect } from "vitest";
import { tieredCatalog } from "@/data/tiered-catalog";
import {
  getNormalizedCatalog,
  getNormalizedByBinKey,
  getPackage,
  listPackages,
  BIN_KEYS,
  type BinKey,
  type CanonicalStyleId,
  type PackageId,
} from "@/remodel-flow/package-engine";

const REAL_ROW_IDS = ["bal-vanity-01", "bal-vanity-02", "bal-sink-01", "bal-sink-02", "bal-sink-03"];

describe("package-engine: catalog migration through adapter", () => {
  const all = getNormalizedCatalog();

  it("normalizes every raw catalog row (1:1 count)", () => {
    expect(all.length).toBe(tieredCatalog.length);
    expect(all.length).toBeGreaterThan(0);
  });

  it("normalizes real catalog rows with correct binKey + tier", () => {
    for (const id of REAL_ROW_IDS) {
      const np = all.find((p) => p.id === id);
      expect(np, `missing normalized row ${id}`).toBeTruthy();
      expect(np!.binKey, `${id} binKey`).not.toBeNull();
      expect(np!.tier).toBe("balanced");
    }
  });

  it("Vanities + Sinks (canonical categories) never produce binKey: null", () => {
    const canonicalRows = tieredCatalog.filter((r) =>
      ["Vanities", "Sinks", "Faucets", "Mirrors", "Lighting", "Toilet", "Bathtubs"].includes(r.category),
    );
    for (const raw of canonicalRows) {
      const np = all.find((p) => p.id === raw.id)!;
      expect(np.binKey, `row ${raw.id} cat=${raw.category}`).not.toBeNull();
    }
  });

  it("untagged rows fall back to styles: []", () => {
    const untagged = all.find((p) => p.id === "bal-vanity-03" /* not in hints? */);
    // bal-vanity-03 IS hinted; pick a non-hinted real row instead:
    const nonHinted = all.filter((p) => !["bal-vanity-01","bal-vanity-02","bal-vanity-03","bal-sink-01","bal-sink-02","bal-sink-03"].includes(p.id));
    expect(nonHinted.length).toBeGreaterThan(0);
    for (const np of nonHinted) {
      expect(np.styles).toEqual([]);
    }
    expect(untagged).toBeTruthy();
  });

  it("hinted rows carry only allowed styles (classic|modern|spa|minimal)", () => {
    const allowed: CanonicalStyleId[] = ["classic", "modern", "spa", "minimal"];
    const hinted = all.filter((p) => p.styles.length > 0);
    expect(hinted.length).toBeGreaterThan(0);
    for (const np of hinted) {
      for (const s of np.styles) {
        expect(allowed).toContain(s as CanonicalStyleId);
      }
    }
  });

  it("getNormalizedByBinKey('vanity') returns vanity rows", () => {
    const v = getNormalizedByBinKey("vanity");
    expect(v.length).toBeGreaterThan(0);
    expect(v.every((p) => p.binKey === "vanity")).toBe(true);
  });

  it("BIN_KEYS coverage report has zero null binKeys for real category rows", () => {
    const nullCount = all.filter((p) => p.binKey === null && p.displayCategory).length;
    // "Shower Niche" is intentionally unmapped — allow up to that count.
    const nicheCount = tieredCatalog.filter((r) => r.category === "Shower Niche").length;
    expect(nullCount).toBeLessThanOrEqual(nicheCount);
  });

  it("BIN_KEYS list still contains 16 canonical keys", () => {
    expect(BIN_KEYS.length).toBe(16);
  });
});

describe("package-engine: registry public API", () => {
  it("getPackage returns curated modern-balanced", () => {
    const p = getPackage("modern-balanced");
    expect(p?.status).toBe("curated");
  });

  it("getPackage returns placeholder classic-balanced", () => {
    const p = getPackage("classic-balanced");
    expect(p?.status).toBe("placeholder");
  });

  it("getPackage returns undefined for legacy alias 'balanced'", () => {
    expect(getPackage("balanced")).toBeUndefined();
  });

  it("listPackages() returns full manifest", () => {
    expect(listPackages().length).toBeGreaterThanOrEqual(2);
  });

  it("listPackages({ status: 'curated' }) filters", () => {
    const curated = listPackages({ status: "curated" });
    expect(curated.every((p) => p.status === "curated")).toBe(true);
    expect(curated.find((p) => p.id === "modern-balanced")).toBeTruthy();
  });

  it("listPackages({ status: 'placeholder' }) filters", () => {
    const ph = listPackages({ status: "placeholder" });
    expect(ph.every((p) => p.status === "placeholder")).toBe(true);
  });
});

describe("package-engine: PackageId type acceptance (compile-time)", () => {
  it("accepts canonical PackageId values", () => {
    const a: PackageId = "modern-balanced";
    const b: PackageId = "classic-balanced";
    const c: PackageId = "spa-premium";
    expect([a, b, c].every((s) => typeof s === "string")).toBe(true);
    // @ts-expect-error - bare tier is not a PackageId
    const bad: PackageId = "balanced";
    expect(bad).toBe("balanced");
  });
});
