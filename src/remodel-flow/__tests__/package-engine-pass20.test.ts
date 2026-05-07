/**
 * Pass 20 — Carry legacy project name to stamped remodel_designs row.
 *
 * Covers:
 *   1. hydrateFlowFromSavedProject populates legacyOrigin.legacyName
 *      only for source="projects" with a non-empty trimmed name.
 *   2. resolveLegacyNameCarry helper rules (default vs user-named,
 *      empty/whitespace/null legacy names).
 *   3. Serializer first-INSERT vs subsequent-UPDATE name semantics
 *      via ctx.name handoff.
 */
import { describe, it, expect } from "vitest";
import {
  hydrateFlowFromSavedProject,
  type FlowSetters,
  type SavedProjectRowLike,
} from "@/remodel-flow/package-engine/hydrateFromSavedProject";
import {
  resolveLegacyNameCarry,
  DEFAULT_DESIGN_NAME,
} from "@/remodel-flow/package-engine/legacyNameCarry";
import { serializeForDb } from "@/remodel-flow/persistence/serializer";
import type { RemodelFlowState } from "@/remodel-flow/types";

const noopSetters: FlowSetters = {
  setStyle: () => {},
  setTier: () => {},
  setPackageId: () => {},
  setLegacyTierRoute: () => {},
};
const STATE: RemodelFlowState = { selections: {} };
const LEGACY_ID = "00000000-0000-0000-0000-000000000abc";

describe("Pass 20 — legacyOrigin.legacyName capture", () => {
  it("source='projects' with name 'Summary' → legacyName='Summary'", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "projects",
      name: "Summary",
      bathroom_type: "full",
    };
    const r = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(r.legacyOrigin?.legacyName).toBe("Summary");
  });

  it("trims whitespace around legacy name", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "projects",
      name: "  My Bath  ",
    };
    const r = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(r.legacyOrigin?.legacyName).toBe("My Bath");
  });

  it("empty / whitespace / null name → legacyName null", () => {
    for (const name of ["", "   ", null, undefined]) {
      const row: SavedProjectRowLike = {
        id: LEGACY_ID,
        source: "projects",
        name: name as string | null,
      };
      const r = hydrateFlowFromSavedProject(row, STATE, noopSetters);
      expect(r.legacyOrigin?.legacyName).toBeNull();
    }
  });

  it("source='remodel_designs' → no legacyOrigin, no legacyName", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "remodel_designs",
      name: "Some Design",
    };
    const r = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(r.legacyOrigin).toBeNull();
  });

  it("missing source → no legacyOrigin (do not carry name)", () => {
    const row: SavedProjectRowLike = { id: LEGACY_ID, name: "X" };
    const r = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(r.legacyOrigin).toBeNull();
  });

  it("switch-origin mid-session: most recent legacy wins", () => {
    const a = hydrateFlowFromSavedProject(
      { id: LEGACY_ID, source: "projects", name: "First" },
      STATE,
      noopSetters,
    );
    const b = hydrateFlowFromSavedProject(
      { id: "00000000-0000-0000-0000-000000000def", source: "projects", name: "Second" },
      STATE,
      noopSetters,
    );
    expect(a.legacyOrigin?.legacyName).toBe("First");
    expect(b.legacyOrigin?.legacyName).toBe("Second");
  });
});

describe("Pass 20 — resolveLegacyNameCarry", () => {
  it("returns trimmed legacyName when current is default", () => {
    expect(resolveLegacyNameCarry(DEFAULT_DESIGN_NAME, "Summary")).toBe("Summary");
    expect(resolveLegacyNameCarry(null, "Summary")).toBe("Summary");
    expect(resolveLegacyNameCarry(undefined, "Summary")).toBe("Summary");
    expect(resolveLegacyNameCarry("", "Summary")).toBe("Summary");
  });

  it("returns null when current name is user-set (non-default)", () => {
    expect(resolveLegacyNameCarry("My Custom", "Summary")).toBeNull();
  });

  it("returns null when legacyName is empty/whitespace/null", () => {
    expect(resolveLegacyNameCarry(DEFAULT_DESIGN_NAME, "")).toBeNull();
    expect(resolveLegacyNameCarry(DEFAULT_DESIGN_NAME, "   ")).toBeNull();
    expect(resolveLegacyNameCarry(DEFAULT_DESIGN_NAME, null)).toBeNull();
    expect(resolveLegacyNameCarry(DEFAULT_DESIGN_NAME, undefined)).toBeNull();
  });
});

describe("Pass 20 — serializer name handoff", () => {
  it("first INSERT with ctx.name='Summary' → row.name='Summary'", () => {
    const row = serializeForDb(STATE, {
      legacyProjectId: LEGACY_ID,
      legacyExtras: null,
      name: "Summary",
    });
    expect(row.name).toBe("Summary");
    expect(row.legacy_project_id).toBe(LEGACY_ID);
  });

  it("subsequent UPDATE without ctx.name → name still defaults (UPDATE caller omits name)", () => {
    // The autosave UPDATE path passes no ctx.name; serializer falls back
    // to default. The DB UPDATE also targets only sent keys at the call
    // site; this test just verifies the serializer never fabricates a
    // legacy name on UPDATE (no legacy keys passed either).
    const row = serializeForDb(STATE, {});
    expect(row.name).toBe(DEFAULT_DESIGN_NAME);
    expect("legacy_project_id" in row).toBe(false);
  });

  it("fresh flow → default name, no legacy keys", () => {
    const row = serializeForDb(STATE);
    expect(row.name).toBe(DEFAULT_DESIGN_NAME);
    expect("legacy_project_id" in row).toBe(false);
    expect("legacy_extras" in row).toBe(false);
  });
});
