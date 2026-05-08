/**
 * Phase 2.10 — legacyDeferredLookup tests + EMPTY_BINS hygiene.
 */
import { describe, it, expect } from "vitest";
import { lookupLegacyDeferredBin } from "../dev/legacyDeferredLookup";
import { EMPTY_BINS } from "../emptyBins";

describe("Phase 2.10 — lookupLegacyDeferredBin", () => {
  it("Bathtubs returns a primary + alternatives count", () => {
    const r = lookupLegacyDeferredBin("Bathtubs", "Balanced");
    expect(r.legacyCategoryName).toBe("Bathtubs");
    expect(r.legacyPrimary).not.toBeNull();
    expect(r.legacyPrimary!.name.length).toBeGreaterThan(0);
    expect(typeof r.legacyPrimary!.price).toBe("number");
    expect(r.legacyAlternativesCount).toBeGreaterThanOrEqual(0);
  });

  it("Tub Valve returns a primary + alternatives count", () => {
    const r = lookupLegacyDeferredBin("Tub Valve", "Balanced");
    expect(r.legacyPrimary).not.toBeNull();
    expect(r.legacyPrimary!.vendor.length).toBeGreaterThan(0);
    expect(r.legacyAlternativesCount).toBeGreaterThanOrEqual(0);
  });

  it("missing category returns null primary (deferred-legacy-MISSING)", () => {
    const r = lookupLegacyDeferredBin("DefinitelyNotACategory", "Balanced");
    expect(r.legacyPrimary).toBeNull();
    expect(r.legacyAlternativesCount).toBe(0);
  });
});

describe("Phase 2.10 — EMPTY_BINS expectation for diff console", () => {
  it("contains toilet + heatedFloor", () => {
    expect((EMPTY_BINS as readonly string[]).includes("toilet")).toBe(true);
    expect((EMPTY_BINS as readonly string[]).includes("heatedFloor")).toBe(true);
  });
});
