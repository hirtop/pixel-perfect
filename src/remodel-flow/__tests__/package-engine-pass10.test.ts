/**
 * Pass 10 — LegacyProjectRow identity cleanup.
 *
 * Verifies that saved-project rows can carry explicit identity fields
 * (`selected_package_id`, `selected_legacy_tier_route`) and that
 * normalizeSavedProjectIdentity resolves them with the documented
 * priority:
 *   1. selected_package_id (real PackageId)
 *   2. selected_legacy_tier_route (legacy tier alias)
 *   3. selected_package.tier (legacy jsonb fallback)
 *   4. style_preferences.style + tier → curated packageId synthesis
 *   5. unknown packageId → telemetry once + safe null
 *
 * Tier aliases must NEVER land in `packageId`.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { normalizeSavedProjectIdentity } from "@/remodel-flow/package-engine/projectIdentity";
import { __resetUnknownPackageIdTelemetryForTests } from "@/remodel-flow/package-engine/telemetry";

describe("Pass 10 — saved-project explicit identity fields", () => {
  beforeEach(() => {
    __resetUnknownPackageIdTelemetryForTests();
  });

  it("selected_package_id = 'modern-balanced' resolves to packageId modern-balanced", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package_id: "modern-balanced",
    });
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });

  it("selected_legacy_tier_route = 'balanced' resolves to legacyTierRoute balanced", () => {
    const id = normalizeSavedProjectIdentity({
      selected_legacy_tier_route: "balanced",
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("selected_package_id wins over legacy selected_package.tier", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package_id: "modern-balanced",
      selected_package: { tier: "essential", name: "Essential" },
    });
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });

  it("selected_legacy_tier_route wins over legacy selected_package.tier", () => {
    const id = normalizeSavedProjectIdentity({
      selected_legacy_tier_route: "balanced",
      selected_package: { tier: "essential" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("legacy-only selected_package.tier still works as fallback", () => {
    const id = normalizeSavedProjectIdentity({
      selected_package: { tier: "balanced" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("unknown selected_package_id emits package_engine.unknown_package_id once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    normalizeSavedProjectIdentity({ selected_package_id: "ghost-pass10-xyz" });
    normalizeSavedProjectIdentity({ selected_package_id: "ghost-pass10-xyz" });
    const ours = warn.mock.calls.filter(
      (c) => c[0] === "package_engine.unknown_package_id",
    );
    expect(ours.length).toBe(1);
    warn.mockRestore();
  });

  it("valid rows do NOT emit unknown telemetry", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    normalizeSavedProjectIdentity({ selected_package_id: "modern-balanced" });
    normalizeSavedProjectIdentity({ selected_legacy_tier_route: "balanced" });
    normalizeSavedProjectIdentity({ selected_package: { tier: "balanced" } });
    const ours = warn.mock.calls.filter(
      (c) => c[0] === "package_engine.unknown_package_id",
    );
    expect(ours.length).toBe(0);
    warn.mockRestore();
  });

  it("tier alias never lands in packageId", () => {
    for (const alias of ["balanced", "essential", "premium", "budget"]) {
      const a = normalizeSavedProjectIdentity({ selected_package_id: alias });
      expect(a.packageId).toBeNull();
      const b = normalizeSavedProjectIdentity({
        selected_legacy_tier_route: alias,
      });
      expect(b.packageId).toBeNull();
      const c = normalizeSavedProjectIdentity({
        selected_package: { tier: alias },
      });
      expect(c.packageId).toBeNull();
    }
  });
});
