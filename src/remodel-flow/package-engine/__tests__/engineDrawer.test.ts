/**
 * Phase 2.1 tests — verify the dev gate semantics and engine/legacy
 * merge behavior. These tests do not depend on Vite env replacement;
 * they exercise the pure helpers directly.
 */

import { describe, it, expect } from "vitest";
import { computeEngineDrawerEnabled } from "../engineDrawerFlag";
import { mergeEngineWithLegacyCategories } from "../mergeEngineCategories";
import type { EngineCategory } from "../buildEngineCategoriesForCustomize";

describe("engineDrawerFlag.computeEngineDrawerEnabled", () => {
  it("is OFF when env var is unset", () => {
    expect(computeEngineDrawerEnabled({ DEV: true })).toBe(false);
  });
  it("is OFF in production even if flag is true", () => {
    expect(
      computeEngineDrawerEnabled({ DEV: false, VITE_BOBOX_ENGINE_DRAWER: "true" }),
    ).toBe(false);
  });
  it("is OFF when flag is any truthy-but-not-'true' string", () => {
    for (const v of ["1", "yes", "TRUE", "on", ""]) {
      expect(
        computeEngineDrawerEnabled({ DEV: true, VITE_BOBOX_ENGINE_DRAWER: v }),
      ).toBe(false);
    }
  });
  it("is ON only when DEV && flag === 'true'", () => {
    expect(
      computeEngineDrawerEnabled({ DEV: true, VITE_BOBOX_ENGINE_DRAWER: "true" }),
    ).toBe(true);
  });
});

interface LegacyRow {
  name: string;
  selected: string;
  price: number;
}
const legacyRow = (name: string, selected = `${name}-legacy`): LegacyRow => ({
  name,
  selected,
  price: 100,
});

const engineRow = (name: string): EngineCategory =>
  ({
    name,
    selected: `${name}-engine`,
    selectedId: `${name}-engine-id`,
    reason: "",
    price: 200,
    basePrice: 200,
    vendor: "",
    laborDelta: 0,
    alternatives: [],
    _engine: {
      binKey: "vanity",
      isFallback: false,
      isUnresolved: false,
      enrichedFromLegacyId: null,
    },
  }) as unknown as EngineCategory;

describe("mergeEngineWithLegacyCategories", () => {
  const legacy: LegacyRow[] = [
    legacyRow("Vanities"),
    legacyRow("Sinks"),
    legacyRow("Faucets"),
    legacyRow("Bathtubs"),
  ];

  it("returns legacy verbatim when engine is null", () => {
    const { merged, sources } = mergeEngineWithLegacyCategories(legacy, null);
    expect(merged).toEqual(legacy);
    expect(sources).toEqual(["legacy", "legacy", "legacy", "legacy"]);
  });

  it("returns legacy verbatim when engine is empty", () => {
    const { merged, sources } = mergeEngineWithLegacyCategories(legacy, []);
    expect(merged).toEqual(legacy);
    expect(sources.every((s) => s === "legacy")).toBe(true);
  });

  it("replaces only matching legacy rows, preserves order, drops unmatched engine rows", () => {
    const engine = [
      engineRow("Vanities"),
      engineRow("Faucets"),
      engineRow("Mirrors"), // not in legacy → dropped
    ];
    const { merged, sources } = mergeEngineWithLegacyCategories(legacy, engine);
    expect(merged.map((c) => c.name)).toEqual([
      "Vanities",
      "Sinks",
      "Faucets",
      "Bathtubs",
    ]);
    expect(sources).toEqual(["engine", "legacy", "engine", "legacy"]);
    // Engine row replaced legacy field values
    expect(merged[0].selected).toBe("Vanities-engine");
    expect(merged[2].selected).toBe("Faucets-engine");
    // Legacy untouched
    expect(merged[1].selected).toBe("Sinks-legacy");
    expect(merged[3].selected).toBe("Bathtubs-legacy");
  });

  it("does not mutate the legacy input array", () => {
    const snap = legacy.map((c) => ({ ...c }));
    mergeEngineWithLegacyCategories(legacy, [engineRow("Vanities")]);
    expect(legacy).toEqual(snap);
  });
});
