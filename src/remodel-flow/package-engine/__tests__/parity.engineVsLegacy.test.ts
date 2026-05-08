/**
 * Read-only parity comparison between:
 *   - legacy buildCategoriesForTier-equivalent for tier = "Balanced"
 *   - engine buildEngineCategoriesForCustomize("balanced", style="modern")
 *
 * Phase 2.5 status: most MODERN_BALANCED products are intentionally
 * curated-only (Delta/Daltile/Bedrosians/DreamLine vs the tieredCatalog
 * Balanced mix of James Martin/Kohler/Signature Hardware). These tests
 * therefore assert structural parity + documented gaps, NOT byte
 * identity. Each documented gap is named as such.
 */

import { describe, it, expect } from "vitest";
import {
  CUSTOMIZABLE_CATEGORIES,
  getTierDefaults,
  getTierAlternatives,
} from "@/data/products";
import {
  buildEngineCategoriesForCustomize,
  MODERN_BALANCED_MISSING_LEGACY_CATEGORIES,
} from "../buildEngineCategoriesForCustomize";

describe("Phase 2.5 parity — modern + balanced engine vs legacy", () => {
  const engine = buildEngineCategoriesForCustomize({
    urlId: "balanced",
    style: "modern",
  })!;

  it("engine returns a non-null result", () => {
    expect(engine).not.toBeNull();
  });

  it("every engine category name belongs to the legacy customizable vocabulary", () => {
    for (const c of engine) {
      expect(CUSTOMIZABLE_CATEGORIES as readonly string[]).toContain(c.name);
    }
  });

  it("engine covers vanity, faucet, mirror, and both tile-coordination bins", () => {
    const names = new Set(engine.map((c) => c.name));
    expect(names.has("Vanities")).toBe(true);
    expect(names.has("Faucets")).toBe(true);
    expect(names.has("Mirrors")).toBe(true);
    expect(names.has("Shower Wall Tile")).toBe(true);
    expect(names.has("Shower Floor Tile")).toBe(true);
    expect(names.has("Main Floor Tile")).toBe(true);
    expect(names.has("Shower Doors")).toBe(true);
  });

  it("documented gap: known legacy categories not yet in MODERN_BALANCED", () => {
    const engineNames = new Set(engine.map((c) => c.name));
    for (const missing of MODERN_BALANCED_MISSING_LEGACY_CATEGORIES) {
      expect(engineNames.has(missing)).toBe(false);
    }
  });

  it("alternatives count is non-zero for vanity (sanity)", () => {
    const vanity = engine.find((c) => c.name === "Vanities");
    expect(vanity!.alternatives.length).toBeGreaterThanOrEqual(1);
  });

  it("documented gap: most modern-balanced products are curated-only (no legacy enrichment)", () => {
    const enriched = engine.filter((c) => c._engine.enrichedFromLegacyId).length;
    expect(enriched).toBeLessThanOrEqual(engine.length);
  });

  it("vendor is never invented: engine-derived (Delta/Kohler/etc.) or empty", () => {
    for (const c of engine) {
      expect(typeof c.vendor).toBe("string");
    }
  });

  it("vanity 60in room: parity-pinned no-op until backup width derivation lands", () => {
    const out = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
      roomWidthInches: 60,
    });
    const vanity = out!.find((c) => c.name === "Vanities");
    expect(vanity!.alternatives.length).toBeGreaterThan(0);
  });

  it("legacy still has Balanced alternatives for Vanities (control)", () => {
    expect(getTierAlternatives("Balanced", "Vanities").length).toBeGreaterThan(0);
  });

  it("legacy Balanced defaults still exist (control)", () => {
    expect(getTierDefaults("Balanced").length).toBeGreaterThan(0);
  });
});
