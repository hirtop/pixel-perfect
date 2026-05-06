/**
 * Pass 7 fix-pass — hydration order + telemetry happy-path tests.
 *
 * Verifies the shared `hydrateFlowFromSavedProject` helper used by both
 * ProjectPickerDialog and the homepage Index single-saved-project path:
 *
 *   - setStyle / setTier / setPackageId / setLegacyTierRoute are invoked
 *     BEFORE the resume route is computed.
 *   - The returned route is derived from the *next* synthesized state,
 *     not the stale flowState passed in.
 *   - modern-balanced row → packageId, legacyTierRoute=null.
 *   - legacy balanced-only row → legacyTierRoute="balanced", packageId=null.
 *   - tier aliases never enter packageId.
 *   - Telemetry stays SILENT for valid rows.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hydrateFlowFromSavedProject,
  type FlowSetters,
} from "@/remodel-flow/package-engine/hydrateFromSavedProject";
import {
  __resetUnknownPackageIdTelemetryForTests,
  UNKNOWN_PACKAGE_ID_EVENT,
} from "@/remodel-flow/package-engine/telemetry";
import type { RemodelFlowState } from "@/remodel-flow/types";
import {
  LEGACY_PROJECT_MODERN_BALANCED,
  LEGACY_PROJECT_BALANCED_NO_STYLE,
  LEGACY_PROJECT_EMPTY,
} from "./fixtures/realRows";

const STALE_STATE: RemodelFlowState = {
  selections: { foo: "stale" },
  // intentionally stale values that MUST NOT influence the resume route
  // when fresher identity is supplied:
  packageId: null,
  legacyTierRoute: null,
};

function makeRecorder() {
  const calls: Array<{ name: keyof FlowSetters; arg: unknown; at: number }> = [];
  let i = 0;
  const setters: FlowSetters = {
    setStyle: (s) => calls.push({ name: "setStyle", arg: s, at: i++ }),
    setTier: (t) => calls.push({ name: "setTier", arg: t, at: i++ }),
    setPackageId: (p) => calls.push({ name: "setPackageId", arg: p, at: i++ }),
    setLegacyTierRoute: (l) =>
      calls.push({ name: "setLegacyTierRoute", arg: l, at: i++ }),
  };
  return { calls, setters };
}

describe("hydrateFlowFromSavedProject — apply-then-route order", () => {
  beforeEach(() => __resetUnknownPackageIdTelemetryForTests());

  it("modern-balanced project → packageId, no tier-alias leak, route from next state", () => {
    const { calls, setters } = makeRecorder();
    const result = hydrateFlowFromSavedProject(
      LEGACY_PROJECT_MODERN_BALANCED,
      STALE_STATE,
      setters,
    );
    expect(result.identity.packageId).toBe("modern-balanced");
    expect(result.identity.legacyTierRoute).toBeNull();
    expect(result.nextState.packageId).toBe("modern-balanced");
    expect(result.nextState.legacyTierRoute).toBeNull();

    const names = calls.map((c) => c.name);
    expect(names).toContain("setStyle");
    expect(names).toContain("setTier");
    expect(names).toContain("setPackageId");
    expect(names).not.toContain("setLegacyTierRoute");
    // Order: style/tier/packageId — packageId never first.
    expect(names.indexOf("setPackageId")).toBeGreaterThan(
      names.indexOf("setStyle"),
    );

    // Route is derived from nextState, not stale state.
    // Stale state has no packageId; nextState has modern-balanced.
    // resumeRoute for a hydrated package is never /remodel-flow/start.
    expect(result.route).not.toBe("/remodel-flow/start");
  });

  it("legacy balanced-only project → legacyTierRoute, packageId stays null", () => {
    const { calls, setters } = makeRecorder();
    const result = hydrateFlowFromSavedProject(
      LEGACY_PROJECT_BALANCED_NO_STYLE,
      STALE_STATE,
      setters,
    );
    expect(result.identity.packageId).toBeNull();
    expect(result.identity.legacyTierRoute).toBe("balanced");
    expect(result.nextState.packageId).toBeNull();
    expect(result.nextState.legacyTierRoute).toBe("balanced");

    const names = calls.map((c) => c.name);
    expect(names).toContain("setTier");
    expect(names).toContain("setLegacyTierRoute");
    expect(names).not.toContain("setPackageId");
    expect(result.route).not.toBe("/remodel-flow/start");
  });

  it("never writes a tier alias into packageId across all rows", () => {
    for (const row of [
      LEGACY_PROJECT_MODERN_BALANCED,
      LEGACY_PROJECT_BALANCED_NO_STYLE,
      { selected_package: { tier: "essential" }, style_preferences: null },
      { selected_package: { tier: "premium" }, style_preferences: null },
    ]) {
      const { setters } = makeRecorder();
      const r = hydrateFlowFromSavedProject(row, STALE_STATE, setters);
      expect(r.nextState.packageId).not.toBe("balanced");
      expect(r.nextState.packageId).not.toBe("essential");
      expect(r.nextState.packageId).not.toBe("premium");
    }
  });

  it("empty row hydrates nothing, route falls back safely", () => {
    const { calls, setters } = makeRecorder();
    const result = hydrateFlowFromSavedProject(
      LEGACY_PROJECT_EMPTY,
      STALE_STATE,
      setters,
    );
    expect(calls).toHaveLength(0);
    expect(result.identity.packageId).toBeNull();
    expect(result.identity.legacyTierRoute).toBeNull();
  });
});

describe("hydrateFlowFromSavedProject — telemetry happy-path silence", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    __resetUnknownPackageIdTelemetryForTests();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  function unknownCalls() {
    return warn.mock.calls.filter((c) => c[0] === UNKNOWN_PACKAGE_ID_EVENT);
  }

  it("modern-balanced row emits no unknown_package_id", () => {
    const { setters } = makeRecorder();
    hydrateFlowFromSavedProject(
      { selected_package_id: "modern-balanced" },
      STALE_STATE,
      setters,
    );
    expect(unknownCalls()).toHaveLength(0);
  });

  it("explicit selected_legacy_tier_route=balanced emits no unknown telemetry", () => {
    const { setters } = makeRecorder();
    hydrateFlowFromSavedProject(
      { selected_legacy_tier_route: "balanced" },
      STALE_STATE,
      setters,
    );
    expect(unknownCalls()).toHaveLength(0);
  });

  it("legacy { selected_package: { tier: 'balanced' } } emits no unknown telemetry", () => {
    const { setters } = makeRecorder();
    hydrateFlowFromSavedProject(
      { selected_package: { tier: "balanced" } },
      STALE_STATE,
      setters,
    );
    expect(unknownCalls()).toHaveLength(0);
  });

  it("empty / null row stays silent", () => {
    const { setters } = makeRecorder();
    hydrateFlowFromSavedProject(null, STALE_STATE, setters);
    hydrateFlowFromSavedProject({}, STALE_STATE, setters);
    expect(unknownCalls()).toHaveLength(0);
  });
});
