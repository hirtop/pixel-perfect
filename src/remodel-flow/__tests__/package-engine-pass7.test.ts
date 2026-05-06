/**
 * Pass 7 — ProjectPickerDialog / Index identity normalization tests.
 *
 * Verifies:
 *  - normalizeSavedProjectIdentity handles all real-row shapes correctly
 *  - tier alias never lands in packageId
 *  - real packageId from selected_package_id wins
 *  - legacy { selected_package: { tier } } falls back to legacyTierRoute
 *  - unknown packageId emits telemetry once per session per value
 *  - real-row snapshot migration via deserializeFromDb
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  normalizeSavedProjectIdentity,
  type LegacySavedProjectLike,
} from "@/remodel-flow/package-engine/projectIdentity";
import { deserializeFromDb } from "@/remodel-flow/persistence/serializer";
import {
  reportUnknownPackageId,
  __resetUnknownPackageIdTelemetryForTests,
  UNKNOWN_PACKAGE_ID_EVENT,
} from "@/remodel-flow/package-engine/telemetry";
import {
  REAL_ROW_MODERN_BALANCED_CLEAN,
  REAL_ROW_LEGACY_TIER_ROUTE_ONLY,
  REAL_ROW_LEGACY_OBJECT_ONLY,
  REAL_ROW_GARBAGE_PACKAGE_ID,
  LEGACY_PROJECT_MODERN_BALANCED,
  LEGACY_PROJECT_BALANCED_NO_STYLE,
  LEGACY_PROJECT_EMPTY,
} from "./fixtures/realRows";

describe("normalizeSavedProjectIdentity — legacy projects rows", () => {
  it("modern + balanced (legacy obj + style hint) → packageId modern-balanced", () => {
    const id = normalizeSavedProjectIdentity(LEGACY_PROJECT_MODERN_BALANCED);
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
    expect(id.style).toBe("modern");
    expect(id.tier).toBe("balanced");
  });

  it("balanced object, no style → legacyTierRoute=balanced, packageId=null", () => {
    const id = normalizeSavedProjectIdentity(LEGACY_PROJECT_BALANCED_NO_STYLE);
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("empty row → all nulls", () => {
    const id = normalizeSavedProjectIdentity(LEGACY_PROJECT_EMPTY);
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBeNull();
  });

  it("never writes a tier alias into packageId", () => {
    const cases: LegacySavedProjectLike[] = [
      { selected_package: { tier: "balanced" } },
      { selected_package: { tier: "essential" } },
      { selected_package: { tier: "premium" } },
      { selected_package_id: "balanced" },
      { selected_legacy_tier_route: "balanced" },
    ];
    for (const c of cases) {
      const id = normalizeSavedProjectIdentity(c);
      expect(id.packageId).not.toBe("balanced");
      expect(id.packageId).not.toBe("essential");
      expect(id.packageId).not.toBe("premium");
    }
  });

  it("real selected_package_id wins over legacy object", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package_id: "modern-balanced",
      selected_package: { tier: "essential" },
    });
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });

  it("placeholder packageId stays as packageId (caller decides routing)", () => {
    // classic-balanced is registered but placeholder. Identity normalizer
    // doesn't strip it — resolveFlowResumeRoute is responsible for the
    // safe fallback to /options.
    const id = normalizeSavedProjectIdentity({
      selected_package_id: "classic-balanced",
    });
    expect(id.packageId).toBe("classic-balanced");
  });
});

describe("normalizeSavedProjectIdentity — synthesized packageId promotion", () => {
  it("does NOT promote to packageId when synthesized id is not registered", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package: { tier: "balanced" },
      style_preferences: { style: "spa" },
    });
    // spa-balanced isn't in PACKAGE_MANIFEST → keep as legacyTierRoute.
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("does NOT promote to packageId for placeholder package", () => {
    // classic-balanced IS registered but placeholder → not promoted.
    const id = normalizeSavedProjectIdentity({
      selected_package: { tier: "balanced" },
      style_preferences: { style: "classic" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("DOES promote when synthesized id is curated (modern-balanced)", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package: { tier: "balanced" },
      style_preferences: { style: "modern" },
    });
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });
});

describe("real-row snapshot migration via deserializeFromDb", () => {
  it("modern-balanced clean row → packageId set, legacyTierRoute null", () => {
    const { state } = deserializeFromDb(REAL_ROW_MODERN_BALANCED_CLEAN);
    expect(state.packageId).toBe("modern-balanced");
    expect(state.legacyTierRoute).toBeNull();
    expect(state.style).toBe("modern");
    expect(state.tier).toBe("balanced");
  });

  it("legacy tier-route-only row → legacyTierRoute set", () => {
    const { state } = deserializeFromDb(REAL_ROW_LEGACY_TIER_ROUTE_ONLY);
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBe("balanced");
  });

  it("legacy object-only row → legacyTierRoute via fallback", () => {
    const { state } = deserializeFromDb(REAL_ROW_LEGACY_OBJECT_ONLY);
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBe("balanced");
  });

  it("garbage selected_package_id → both null, no onboarding fallback", () => {
    const { state } = deserializeFromDb(REAL_ROW_GARBAGE_PACKAGE_ID);
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBeNull();
  });
});

describe("unknown packageId telemetry", () => {
  beforeEach(() => {
    __resetUnknownPackageIdTelemetryForTests();
  });

  it("fires once per (source, value) per session", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportUnknownPackageId({ value: "ghost-package", source: "db-row" });
    reportUnknownPackageId({ value: "ghost-package", source: "db-row" });
    reportUnknownPackageId({ value: "ghost-package", source: "db-row" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toBe(UNKNOWN_PACKAGE_ID_EVENT);
    warn.mockRestore();
  });

  it("dedupe key is per source — different source emits again", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportUnknownPackageId({ value: "ghost-package", source: "db-row" });
    reportUnknownPackageId({ value: "ghost-package", source: "localStorage" });
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("ignores empty / null values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportUnknownPackageId({ value: null, source: "db-row" });
    reportUnknownPackageId({ value: "", source: "db-row" });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("garbage row read via deserializeFromDb emits exactly once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    deserializeFromDb(REAL_ROW_GARBAGE_PACKAGE_ID);
    deserializeFromDb(REAL_ROW_GARBAGE_PACKAGE_ID);
    const ourCalls = warn.mock.calls.filter(
      (c) => c[0] === UNKNOWN_PACKAGE_ID_EVENT,
    );
    expect(ourCalls).toHaveLength(1);
    warn.mockRestore();
  });
});
