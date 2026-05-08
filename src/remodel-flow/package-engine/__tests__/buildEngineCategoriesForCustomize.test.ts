import { describe, it, expect } from "vitest";
import { buildEngineCategoriesForCustomize } from "../buildEngineCategoriesForCustomize";

describe("buildEngineCategoriesForCustomize", () => {
  it("returns categories for modern + balanced", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    expect(out).not.toBeNull();
    expect(out!.length).toBeGreaterThan(0);
    // Every category must have a stable selectedId and a name from the
    // legacy CUSTOMIZABLE_CATEGORIES vocabulary.
    for (const c of out!) {
      expect(c.name).toMatch(/^[A-Z]/);
      expect(c.selectedId).toContain("modern-balanced:");
      expect(c.selected).toBeTruthy();
    }
  });

  it("returns null for non-modern styles (placeholder packages excluded)", () => {
    expect(
      buildEngineCategoriesForCustomize({ urlId: "balanced", style: "spa" }),
    ).toBeNull();
    expect(
      buildEngineCategoriesForCustomize({ urlId: "balanced", style: "classic" }),
    ).toBeNull();
  });

  it("returns null for non-balanced tier even when style is modern", () => {
    expect(
      buildEngineCategoriesForCustomize({ urlId: "essential", style: "modern" }),
    ).toBeNull();
    expect(
      buildEngineCategoriesForCustomize({ urlId: "premium", style: "modern" }),
    ).toBeNull();
  });

  it("returns null when style is missing", () => {
    expect(buildEngineCategoriesForCustomize({ urlId: "balanced" })).toBeNull();
  });

  it("returns null for unknown URL id", () => {
    expect(
      buildEngineCategoriesForCustomize({ urlId: "garbage", style: "modern" }),
    ).toBeNull();
  });

  it("does not surface unresolved primary as a normal selection", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    expect(out).not.toBeNull();
    // None of the modern-balanced bins should currently be unresolved
    // (curated package). Guard against silent regressions.
    for (const c of out!) {
      expect(c._engine.isUnresolved).toBe(false);
    }
  });

  it("does not mutate output across calls (pure)", () => {
    const a = buildEngineCategoriesForCustomize({ urlId: "balanced", style: "modern" });
    const b = buildEngineCategoriesForCustomize({ urlId: "balanced", style: "modern" });
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a!.length).toBe(b!.length);
    expect(a!.map((c) => c.selectedId)).toEqual(b!.map((c) => c.selectedId));
  });
});
