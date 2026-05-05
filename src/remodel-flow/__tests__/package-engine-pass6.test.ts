/**
 * Pass 6 — Publish Readiness tests.
 *
 * Covers:
 *  - Legacy `selected_package` object → legacyTierRoute fallback
 *  - Idempotency of serializer migration on read
 *  - Unknown packageId graceful fallback
 */

import { describe, it, expect } from "vitest";
import {
  deserializeFromDb,
  serializeForDb,
  type DesignRow,
} from "../persistence/serializer";
import { splitPackageIdField } from "../package-engine/flowStateMigration";

const baseRow = (over: Partial<DesignRow> = {}): DesignRow => ({
  selections: {},
  ...over,
});

describe("serializer — legacy selected_package object fallback", () => {
  const cases: Array<{
    name: string;
    obj: { name?: string | null; tier?: string | null };
    expectedLegacy: string | null;
  }> = [
    { name: "tier balanced", obj: { tier: "balanced" }, expectedLegacy: "balanced" },
    { name: "tier essential", obj: { tier: "essential" }, expectedLegacy: "essential" },
    { name: "tier premium", obj: { tier: "premium" }, expectedLegacy: "premium" },
    { name: "name only Custom", obj: { name: "Custom" }, expectedLegacy: null },
    { name: "name+tier balanced", obj: { name: "Balanced", tier: "balanced" }, expectedLegacy: "balanced" },
  ];

  for (const c of cases) {
    it(`maps selected_package ${c.name} → legacyTierRoute=${c.expectedLegacy}`, () => {
      const { state } = deserializeFromDb(baseRow({ selected_package: c.obj }));
      expect(state.packageId).toBeNull();
      expect(state.legacyTierRoute).toBe(c.expectedLegacy);
    });
  }

  it("real selected_package_id wins over selected_package.tier", () => {
    const { state } = deserializeFromDb(
      baseRow({
        selected_package_id: "modern-balanced",
        selected_package: { tier: "essential" },
      }),
    );
    expect(state.packageId).toBe("modern-balanced");
    expect(state.legacyTierRoute).toBeNull();
  });

  it("legacy alias in selected_package_id still routes to legacyTierRoute over object", () => {
    const { state } = deserializeFromDb(
      baseRow({
        selected_package_id: "balanced",
        selected_package: { tier: "essential" },
      }),
    );
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBe("balanced");
  });

  it("explicit selected_legacy_tier_route wins over selected_package.tier", () => {
    const { state } = deserializeFromDb(
      baseRow({
        selected_legacy_tier_route: "premium",
        selected_package: { tier: "essential" },
      }),
    );
    expect(state.legacyTierRoute).toBe("premium");
  });
});

describe("serializer — migration idempotency", () => {
  const fixtures: DesignRow[] = [
    baseRow({ selected_package_id: "balanced" }), // legacy alias only
    baseRow({ selected_package_id: "modern-balanced" }), // real packageId only
    baseRow({
      selected_package_id: "modern-balanced",
      selected_legacy_tier_route: "balanced",
    }), // both present (real wins)
    baseRow(), // neither
    baseRow({ selected_package_id: "🪐garbage🌚" }), // garbage
    baseRow({ selected_package: { tier: "balanced" } }), // legacy object
    baseRow({ selected_package: { tier: "essential" } }),
    baseRow({ selected_package: { tier: "premium" } }),
    baseRow({ selected_package: { name: "Custom" } }),
  ];

  for (const row of fixtures) {
    it(`idempotent for ${JSON.stringify({
      pid: row.selected_package_id,
      lr: row.selected_legacy_tier_route,
      sp: row.selected_package,
    })}`, () => {
      const first = deserializeFromDb(row).state;
      // Re-serialize then re-deserialize. Result must equal first.
      const reRow = serializeForDb(first);
      const second = deserializeFromDb(reRow).state;
      expect(second.packageId ?? null).toBe(first.packageId ?? null);
      expect(second.legacyTierRoute ?? null).toBe(first.legacyTierRoute ?? null);

      // Third pass for stricter idempotency.
      const thirdRow = serializeForDb(second);
      const third = deserializeFromDb(thirdRow).state;
      expect(third.packageId ?? null).toBe(second.packageId ?? null);
      expect(third.legacyTierRoute ?? null).toBe(second.legacyTierRoute ?? null);
    });
  }
});

describe("unknown packageId graceful fallback", () => {
  it("splitPackageIdField returns nulls for ghost-package", () => {
    expect(splitPackageIdField("ghost-package")).toEqual({
      packageId: null,
      legacyTierRoute: null,
    });
  });

  it("deserialize ghost-package → packageId null", () => {
    const { state } = deserializeFromDb(
      baseRow({ selected_package_id: "ghost-package" }),
    );
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBeNull();
  });

  it("ghost-package preserves valid legacy alias from explicit column", () => {
    const { state } = deserializeFromDb(
      baseRow({
        selected_package_id: "ghost-package",
        selected_legacy_tier_route: "balanced",
      }),
    );
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBe("balanced");
  });
});

describe("serializer — write side defensive split", () => {
  it("never writes a legacy alias into selected_package_id", () => {
    const row = serializeForDb({
      // Producer accidentally jammed a legacy alias into packageId.
      packageId: "balanced" as never,
      selections: {},
    });
    expect(row.selected_package_id).toBeNull();
    expect(row.selected_legacy_tier_route).toBe("balanced");
  });
});
