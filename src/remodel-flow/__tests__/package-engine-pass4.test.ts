import { describe, it, expect } from "vitest";
import { tieredCatalog } from "@/data/tiered-catalog";
import {
  getNormalizedCatalog,
  BIN_KEYS,
  EMPTY_BINS,
  isEmptyBin,
  splitPackageIdField,
  joinPackageIdField,
  type BinKey,
} from "@/remodel-flow/package-engine";

describe("Pass 4 — promoted NormalizedProduct fields", () => {
  const all = getNormalizedCatalog();

  it("vanity rows promote width_inches + faucet_holes from raw", () => {
    const v1 = all.find((p) => p.id === "bal-vanity-01")!;
    expect(v1.width_inches).toBe(48);
    expect(v1.faucet_holes).toBe("widespread");
    expect(v1.isDefault).toBe(true);
    expect(v1.finish).toMatch(/Oak/i);
  });

  it("non-default vanity row reflects isDefault: false", () => {
    const v2 = all.find((p) => p.id === "bal-vanity-02")!;
    expect(v2.isDefault).toBe(false);
    expect(v2.width_inches).toBe(42);
  });

  it("rows without these fields default to null/false", () => {
    const sink = all.find((p) => p.id === "bal-sink-01")!;
    expect(sink.width_inches).toBeNull();
    expect(sink.faucet_holes).toBeNull();
    expect(sink.mount_type).toBeNull();
    expect(sink.laborDelta).toBe(0); // present in raw as 0
  });

  it("every normalized row has the promoted fields defined (not undefined)", () => {
    for (const p of all) {
      expect(p).toHaveProperty("finish");
      expect(p).toHaveProperty("faucet_holes");
      expect(p).toHaveProperty("mount_type");
      expect(p).toHaveProperty("width_inches");
      expect(p).toHaveProperty("isDefault");
      expect(p).toHaveProperty("laborDelta");
      expect(p).toHaveProperty("laborNote");
      expect(typeof p.isDefault).toBe("boolean");
    }
  });
});

describe("Pass 4 — EMPTY_BINS invariant", () => {
  const all = getNormalizedCatalog();

  it("EMPTY_BINS is exactly toilet + heatedFloor (current state)", () => {
    expect([...EMPTY_BINS].sort()).toEqual(["heatedFloor", "toilet"]);
  });

  it("isEmptyBin reports correctly", () => {
    expect(isEmptyBin("toilet")).toBe(true);
    expect(isEmptyBin("heatedFloor")).toBe(true);
    expect(isEmptyBin("vanity")).toBe(false);
  });

  it("every BinKey with zero products is listed in EMPTY_BINS", () => {
    const counts: Record<BinKey, number> = Object.fromEntries(
      BIN_KEYS.map((k) => [k, 0]),
    ) as Record<BinKey, number>;
    for (const p of all) if (p.binKey) counts[p.binKey]++;

    const actuallyEmpty = BIN_KEYS.filter((k) => counts[k] === 0);
    // Symmetric check: actually-empty must equal documented empty.
    expect([...actuallyEmpty].sort()).toEqual([...EMPTY_BINS].sort());
  });

  it("every normalized row binKey is within the canonical 16 (or null)", () => {
    const set = new Set<string>(BIN_KEYS);
    for (const p of all) {
      if (p.binKey !== null) expect(set.has(p.binKey)).toBe(true);
    }
  });
});

describe("Pass 4 — Style coverage report (spa mismatch)", () => {
  const all = getNormalizedCatalog();
  const counts = { classic: 0, modern: 0, spa: 0, minimal: 0 } as Record<string, number>;
  for (const p of all) for (const s of p.styles) if (s in counts) counts[s]++;

  it("spa: 0 is correct — no product-level spa tags exist in raw catalog", () => {
    // The string 'spa' appears once in raw catalog, but only inside a
    // marketing description ("spa-like experience from above"), not in
    // any tag/style field. spa: 0 is therefore the correct outcome.
    const spaInTagFields = tieredCatalog.filter((r) => {
      const tag = (r as { tag?: string }).tag;
      return typeof tag === "string" && /spa/i.test(tag);
    });
    expect(spaInTagFields.length).toBe(0);
    expect(counts.spa).toBe(0);
  });

  it("modern + classic + minimal hint counts are non-zero", () => {
    expect(counts.modern).toBeGreaterThan(0);
    expect(counts.classic).toBeGreaterThan(0);
    expect(counts.minimal).toBeGreaterThan(0);
  });
});

describe("Pass 4 — splitPackageIdField migration", () => {
  it("real PackageId stays in packageId", () => {
    expect(splitPackageIdField("modern-balanced")).toEqual({
      packageId: "modern-balanced",
      legacyTierRoute: null,
    });
    expect(splitPackageIdField("classic-balanced")).toEqual({
      packageId: "classic-balanced",
      legacyTierRoute: null,
    });
  });

  it("legacy tier alias moves to legacyTierRoute", () => {
    expect(splitPackageIdField("balanced")).toEqual({
      packageId: null,
      legacyTierRoute: "balanced",
    });
    expect(splitPackageIdField("essential")).toEqual({
      packageId: null,
      legacyTierRoute: "essential",
    });
    expect(splitPackageIdField("premium")).toEqual({
      packageId: null,
      legacyTierRoute: "premium",
    });
  });

  it("undefined / unknown collapse to null/null", () => {
    expect(splitPackageIdField(undefined)).toEqual({ packageId: null, legacyTierRoute: null });
    expect(splitPackageIdField("")).toEqual({ packageId: null, legacyTierRoute: null });
    expect(splitPackageIdField("nonsense")).toEqual({ packageId: null, legacyTierRoute: null });
  });

  it("joinPackageIdField is the inverse, real packageId wins", () => {
    expect(joinPackageIdField({ packageId: "modern-balanced", legacyTierRoute: null })).toBe("modern-balanced");
    expect(joinPackageIdField({ packageId: null, legacyTierRoute: "balanced" })).toBe("balanced");
    expect(joinPackageIdField({ packageId: null, legacyTierRoute: null })).toBeNull();
  });

  it("packageId true IDs and legacy aliases never collide", () => {
    const ids = ["modern-balanced", "classic-balanced", "balanced", "essential", "premium"];
    for (const id of ids) {
      const split = splitPackageIdField(id);
      expect(!!split.packageId && !!split.legacyTierRoute).toBe(false);
    }
  });
});
