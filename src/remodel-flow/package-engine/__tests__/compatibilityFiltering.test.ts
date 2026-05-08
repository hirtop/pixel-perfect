/**
 * Phase 2.5 — vanity-width and faucet-hole compat filters operate on
 * alternatives only. Engine never silently swaps the curated primary.
 */
import { describe, it, expect } from "vitest";
import { buildEngineCategoriesForCustomize } from "../buildEngineCategoriesForCustomize";

describe("Phase 2.5 compatibility filtering", () => {
  it("does not swap the primary for tiny rooms", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
      roomWidthInches: 24, // smaller than the 36" curated primary
    });
    expect(out).not.toBeNull();
    const vanity = out!.find((c) => c.name === "Vanities");
    expect(vanity).toBeTruthy();
    // Primary stays curated (width derivation = 36, room = 24).
    expect(vanity!.selected).toMatch(/Floating Oak Vanity/);
  });

  it("does not crash and keeps a row when room width is generous", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
      roomWidthInches: 96,
    });
    expect(out!.find((c) => c.name === "Vanities")).toBeTruthy();
  });

  it("faucet alternatives respect selected vanity faucetHoles when known", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    const faucet = out!.find((c) => c.name === "Faucets");
    expect(faucet).toBeTruthy();
    // Curated vanity has no faucetHoles derivation today (name doesn't
    // declare it). Filter must therefore be a no-op rather than wiping
    // alternatives — verify alternatives are non-empty.
    expect(faucet!.alternatives.length).toBeGreaterThan(0);
  });

  it("alias-mapped bins surface as legacy categories (floorTile → Main Floor Tile, showerGlass → Shower Doors)", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    const names = new Set(out!.map((c) => c.name));
    expect(names.has("Main Floor Tile")).toBe(true);
    expect(names.has("Shower Doors")).toBe(true);
  });

  it("unresolved primaries never appear as confident selections", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
    });
    for (const c of out!) {
      expect(c._engine.isUnresolved).toBe(false);
    }
  });
});
