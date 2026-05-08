/**
 * Phase 2.9 — Bathtub + Tub Valve deferred-posture invariants.
 *
 * MODERN_BALANCED is shower-forward. Both `bathtub` and `tubValve` are
 * intentionally deferred to the legacy fallback path. `tubValve` is
 * coupled to `bathtub` and must never open independently.
 *
 * These tests are read-only and do not exercise customer surfaces.
 */
import { describe, it, expect } from "vitest";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import { MODERN_BALANCED_MISSING_LEGACY_CATEGORIES } from "../buildEngineCategoriesForCustomize";
import { EMPTY_BINS } from "../emptyBins";
import { tieredCatalog } from "@/data/tiered-catalog";

describe("Phase 2.9 — bathtub + tubValve deferred posture", () => {
  it("MODERN_BALANCED_MISSING_LEGACY_CATEGORIES equals exactly ['Bathtubs','Tub Valve']", () => {
    expect([...MODERN_BALANCED_MISSING_LEGACY_CATEGORIES]).toEqual([
      "Bathtubs",
      "Tub Valve",
    ]);
  });

  it("MODERN_BALANCED.bins has no `bathtub` key", () => {
    expect(
      Object.prototype.hasOwnProperty.call(MODERN_BALANCED.bins, "bathtub"),
    ).toBe(false);
  });

  it("MODERN_BALANCED.bins has no `tubValve` key", () => {
    expect(
      Object.prototype.hasOwnProperty.call(MODERN_BALANCED.bins, "tubValve"),
    ).toBe(false);
  });

  it("legacy /customize catalog still surfaces Bathtubs", () => {
    const bathtubs = tieredCatalog.filter((p) => p.category === "Bathtubs");
    expect(bathtubs.length).toBeGreaterThan(0);
  });

  it("legacy /customize catalog still surfaces Tub Valve", () => {
    const tubValves = tieredCatalog.filter((p) => p.category === "Tub Valve");
    expect(tubValves.length).toBeGreaterThan(0);
  });

  it("coupling invariant — bathtub presence implies tubValve presence (and vice versa)", () => {
    const bins = MODERN_BALANCED.bins as Record<string, unknown>;
    const hasBathtub = Object.prototype.hasOwnProperty.call(bins, "bathtub");
    const hasTubValve = Object.prototype.hasOwnProperty.call(bins, "tubValve");
    expect(hasBathtub).toBe(hasTubValve);
  });

  it("bathtub is NOT in EMPTY_BINS (deferred ≠ globally empty)", () => {
    expect((EMPTY_BINS as readonly string[]).includes("bathtub")).toBe(false);
  });

  it("tubValve is NOT in EMPTY_BINS (deferred ≠ globally empty)", () => {
    expect((EMPTY_BINS as readonly string[]).includes("tubValve")).toBe(false);
  });
});
