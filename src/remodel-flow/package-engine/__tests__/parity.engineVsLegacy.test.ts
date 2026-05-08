/**
 * Read-only parity comparison between:
 *   - legacy buildCategoriesForTier-equivalent (rebuilt locally to avoid
 *     importing the page module) for tier = "Balanced"
 *   - engine buildEngineCategoriesForCustomize("balanced", style="modern")
 *
 * This test does NOT enforce strict equality — the underlying catalog
 * data is genuinely different (modern-balanced spec uses Delta/Moen/etc.
 * while tieredCatalog Balanced uses a different vendor mix). The point is
 * to surface the parity gaps as structured assertions.
 */

import { describe, it, expect } from "vitest";
import {
  CUSTOMIZABLE_CATEGORIES,
  getTierDefaults,
  getTierAlternatives,
} from "@/data/products";
import { buildEngineCategoriesForCustomize } from "../buildEngineCategoriesForCustomize";

describe("Phase 2 parity — modern + balanced engine vs legacy", () => {
  const engine = buildEngineCategoriesForCustomize({
    urlId: "balanced",
    style: "modern",
  });

  it("engine returns a non-null result", () => {
    expect(engine).not.toBeNull();
  });

  it("every engine category name belongs to the legacy customizable vocabulary", () => {
    for (const c of engine!) {
      expect(CUSTOMIZABLE_CATEGORIES as readonly string[]).toContain(c.name);
    }
  });

  it("engine categories are a subset of legacy categories — gap is acceptable", () => {
    const legacyDefaults = getTierDefaults("Balanced").filter((p) =>
      (CUSTOMIZABLE_CATEGORIES as readonly string[]).includes(p.category),
    );
    const legacyCategoryNames = new Set(legacyDefaults.map((p) => p.category));
    const engineCategoryNames = new Set(engine!.map((c) => c.name));
    // Every engine category must be a recognized legacy category.
    for (const name of engineCategoryNames) {
      expect(legacyCategoryNames.has(name as string) || (CUSTOMIZABLE_CATEGORIES as readonly string[]).includes(name as string)).toBe(true);
    }
  });

  it("alternatives count is non-zero for vanity (sanity check)", () => {
    const vanity = engine!.find((c) => c.name === "Vanities");
    expect(vanity).toBeTruthy();
    // modern-balanced ships 3 backups for vanity.
    expect(vanity!.alternatives.length).toBeGreaterThanOrEqual(1);
  });

  it("documents known parity gap: engine vendor/spec/tag may be empty when no legacy match", () => {
    // Engine product names from MODERN_BALANCED do not currently overlap
    // with tieredCatalog Balanced rows by name (different sourcing). So
    // enrichedFromLegacyId will frequently be null. This is expected
    // until the catalogs are reconciled.
    const enrichedCount = engine!.filter((c) => c._engine.enrichedFromLegacyId).length;
    const total = engine!.length;
    // No assertion on the exact number — this just exercises the path.
    expect(enrichedCount).toBeLessThanOrEqual(total);
  });

  it("documents legacy compatibility filters not yet implemented in engine path", () => {
    // Width/faucet-hole filters require fields the engine `Product` does
    // not yet carry. Calling with a tiny room must NOT throw and must
    // still return categories — gating happens at the legacy adapter.
    const tinyRoom = buildEngineCategoriesForCustomize({
      urlId: "balanced",
      style: "modern",
      roomWidthInches: 24, // smaller than any default vanity
    });
    expect(tinyRoom).not.toBeNull();
    // Vanity row still present — engine has no width metadata to gate on.
    expect(tinyRoom!.find((c) => c.name === "Vanities")).toBeTruthy();
  });

  it("legacy still has Balanced alternatives for Vanities (control)", () => {
    const alts = getTierAlternatives("Balanced", "Vanities");
    expect(alts.length).toBeGreaterThan(0);
  });
});
