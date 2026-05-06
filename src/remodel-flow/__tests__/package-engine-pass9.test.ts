/**
 * Pass 9 — Centralized ProjectContext identity helper.
 *
 * Verifies normalizeProjectContextIdentity() returns the right
 * { packageId, legacyTierRoute, tier, savedTierLower, savedPackageName }
 * for the legacy ProjectContext shape used by CustomizeOption,
 * PackageDetail, ProjectSummary, Shop, and Workflow.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { normalizeProjectContextIdentity } from "@/remodel-flow/package-engine/projectContextIdentity";
import { __resetUnknownPackageIdTelemetryForTests } from "@/remodel-flow/package-engine/telemetry";

describe("Pass 9 — normalizeProjectContextIdentity", () => {
  beforeEach(() => {
    __resetUnknownPackageIdTelemetryForTests();
  });

  it("legacy { selected_package: { tier: 'balanced' } } resolves to legacyTierRoute, not packageId", () => {
    const id = normalizeProjectContextIdentity({
      selected_package: { tier: "balanced", name: "Balanced" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
    expect(id.tier).toBe("balanced");
    expect(id.savedTierLower).toBe("balanced");
    expect(id.savedPackageName).toBe("Balanced");
  });

  it("real packageId in selected_package_id wins", () => {
    const id = normalizeProjectContextIdentity({
      selected_package_id: "modern-balanced",
      selected_package: { tier: "essential" },
    } as never);
    expect(id.packageId).toBe("modern-balanced");
  });

  it("legacy 'budget' alias maps to canonical 'essential' tier and stays as legacyTierRoute", () => {
    const id = normalizeProjectContextIdentity({
      selected_package: { tier: "budget", name: "Budget" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("essential");
    expect(id.savedTierLower).toBe("budget"); // raw preserved for legacy URL routing
  });

  it("unknown / empty selected_package returns nulls", () => {
    expect(normalizeProjectContextIdentity({ selected_package: {} })).toMatchObject({
      packageId: null,
      legacyTierRoute: null,
      tier: null,
      savedTierLower: undefined,
      savedPackageName: undefined,
    });
    expect(normalizeProjectContextIdentity(null)).toMatchObject({
      packageId: null,
      legacyTierRoute: null,
    });
  });

  it("unknown selected_package_id emits telemetry once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    normalizeProjectContextIdentity(
      { selected_package_id: "ghost-pass9", selected_package: {} } as never,
      { source: "saved-project" },
    );
    const ours = warn.mock.calls.filter(
      (c) => c[0] === "package_engine.unknown_package_id",
    );
    expect(ours.length).toBeGreaterThanOrEqual(1);
    warn.mockRestore();
  });

  it("does NOT promote tier alias into packageId", () => {
    const id = normalizeProjectContextIdentity({
      selected_package: { tier: "balanced" },
      style_preferences: { style: "doesnt-exist" },
    });
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });
});
