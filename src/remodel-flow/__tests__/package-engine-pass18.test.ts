/**
 * Pass 18 — Resume-time stamping of legacy_project_id / legacy_extras.
 *
 * Covers:
 *   1. buildLegacyExtrasSnapshot rules (allowed/excluded/empty/malformed)
 *   2. hydrateFlowFromSavedProject — legacyOrigin only for source="projects"
 *   3. Serializer first-INSERT vs subsequent-UPDATE behavior
 *   4. legacy_project_id equals the public.projects id, not a designs id
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildLegacyExtrasSnapshot,
  __resetLegacyExtrasSnapshotTelemetryForTests,
  LEGACY_EXTRAS_SNAPSHOT_SKIPPED_EVENT,
} from "@/remodel-flow/package-engine/legacyExtrasSnapshot";
import {
  hydrateFlowFromSavedProject,
  type FlowSetters,
  type SavedProjectRowLike,
} from "@/remodel-flow/package-engine/hydrateFromSavedProject";
import { serializeForDb } from "@/remodel-flow/persistence/serializer";
import type { RemodelFlowState } from "@/remodel-flow/types";

const noopSetters: FlowSetters = {
  setStyle: () => {},
  setTier: () => {},
  setPackageId: () => {},
  setLegacyTierRoute: () => {},
};

const STATE: RemodelFlowState = { selections: {} };

describe("buildLegacyExtrasSnapshot — allowed fields", () => {
  beforeEach(() => __resetLegacyExtrasSnapshotTelemetryForTests());

  it("captures all allowed fields when fully populated", () => {
    const snap = buildLegacyExtrasSnapshot({
      bathroom_type: "full",
      property_type: "house",
      dimensions: { width_ft: "8" },
      agreement_data: { signature: "X" },
      assessment_data: { activeLeaks: "no" },
      notes: "hello",
      subcontractor_interactions: [{ name: "A" }],
    });
    expect(snap).toEqual({
      bathroom_type: "full",
      property_type: "house",
      dimensions: { width_ft: "8" },
      agreement_data: { signature: "X" },
      assessment_data: { activeLeaks: "no" },
      notes: "hello",
      subcontractor_interactions: [{ name: "A" }],
    });
  });

  it("returns null when nothing meaningful remains", () => {
    expect(buildLegacyExtrasSnapshot({})).toBeNull();
    expect(
      buildLegacyExtrasSnapshot({
        bathroom_type: "",
        dimensions: {},
        agreement_data: {},
      }),
    ).toBeNull();
  });

  it("omits empty/null fields", () => {
    const snap = buildLegacyExtrasSnapshot({
      bathroom_type: "full",
      property_type: null as unknown as string,
      dimensions: {},
    });
    expect(snap).toEqual({ bathroom_type: "full" });
  });
});

describe("buildLegacyExtrasSnapshot — exclusions", () => {
  beforeEach(() => __resetLegacyExtrasSnapshotTelemetryForTests());

  it("strips agreement_data.photos", () => {
    const snap = buildLegacyExtrasSnapshot({
      agreement_data: {
        signature: "Y",
        photos: { metadata: [{ name: "a.jpg" }] },
      },
    });
    expect(snap).toEqual({ agreement_data: { signature: "Y" } });
  });

  it("ignores fields covered elsewhere (selected_package, style_preferences, customizations, workflow_progress)", () => {
    const snap = buildLegacyExtrasSnapshot({
      // @ts-expect-error — intentionally passing legacy junk
      selected_package: { tier: "balanced" },
      // @ts-expect-error — intentionally passing legacy junk
      style_preferences: { style: "modern" },
      // @ts-expect-error — intentionally passing legacy junk
      customizations: { categories: [] },
      // @ts-expect-error — intentionally passing legacy junk
      workflow_progress: { current_step: "x" },
      bathroom_type: "full",
    });
    expect(snap).toEqual({ bathroom_type: "full" });
  });

  it("agreement_data with only photos collapses to nothing", () => {
    const snap = buildLegacyExtrasSnapshot({
      agreement_data: { photos: { metadata: [] } },
    });
    expect(snap).toBeNull();
  });
});

describe("buildLegacyExtrasSnapshot — malformed telemetry", () => {
  beforeEach(() => __resetLegacyExtrasSnapshotTelemetryForTests());

  it("emits legacy_extras_snapshot_skipped once for malformed dimensions", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    buildLegacyExtrasSnapshot({ dimensions: "not-an-object" as unknown as object });
    buildLegacyExtrasSnapshot({ dimensions: 42 as unknown as object });
    const calls = warn.mock.calls.filter(
      (c) => c[0] === LEGACY_EXTRAS_SNAPSHOT_SKIPPED_EVENT,
    );
    expect(calls.length).toBe(1);
    expect(calls[0][1]).toMatchObject({
      source: "legacyExtrasSnapshot",
      code: "dimensions",
    });
    warn.mockRestore();
  });
});

describe("hydrateFlowFromSavedProject — legacyOrigin", () => {
  beforeEach(() => __resetLegacyExtrasSnapshotTelemetryForTests());

  it("source='projects' → legacyOrigin populated with id + extras snapshot", () => {
    const row: SavedProjectRowLike = {
      id: "00000000-0000-0000-0000-000000000abc",
      source: "projects",
      bathroom_type: "full",
      selected_package: { tier: "balanced" },
      style_preferences: { style: "modern" },
    };
    const result = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(result.legacyOrigin).not.toBeNull();
    expect(result.legacyOrigin!.legacyProjectId).toBe(
      "00000000-0000-0000-0000-000000000abc",
    );
    expect(result.legacyOrigin!.legacyExtras).toEqual({ bathroom_type: "full" });
  });

  it("source='remodel_designs' → legacyOrigin null (never stamp a designs id)", () => {
    const row: SavedProjectRowLike = {
      id: "00000000-0000-0000-0000-000000000def",
      source: "remodel_designs",
      bathroom_type: "full",
      selected_package_id: "modern-balanced",
    };
    const result = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(result.legacyOrigin).toBeNull();
  });

  it("null/empty row → legacyOrigin null", () => {
    expect(hydrateFlowFromSavedProject(null, STATE, noopSetters).legacyOrigin).toBeNull();
    expect(hydrateFlowFromSavedProject({}, STATE, noopSetters).legacyOrigin).toBeNull();
  });

  it("source missing → legacyOrigin null (do not stamp)", () => {
    const row: SavedProjectRowLike = {
      id: "00000000-0000-0000-0000-000000000111",
      bathroom_type: "full",
    };
    expect(hydrateFlowFromSavedProject(row, STATE, noopSetters).legacyOrigin).toBeNull();
  });
});

describe("Pass 18 — serializer stamping semantics", () => {
  it("first INSERT (no designId) with legacy origin → both keys present", () => {
    const row = serializeForDb(STATE, {
      legacyProjectId: "00000000-0000-0000-0000-000000000abc",
      legacyExtras: { bathroom_type: "full" },
    });
    expect(row.legacy_project_id).toBe("00000000-0000-0000-0000-000000000abc");
    expect(row.legacy_extras).toEqual({ bathroom_type: "full" });
  });

  it("subsequent UPDATE (no legacy keys passed) → both keys absent from payload", () => {
    const row = serializeForDb(STATE, {});
    expect("legacy_project_id" in row).toBe(false);
    expect("legacy_extras" in row).toBe(false);
  });

  it("fresh non-legacy flow → both keys absent", () => {
    const row = serializeForDb(STATE);
    expect("legacy_project_id" in row).toBe(false);
    expect("legacy_extras" in row).toBe(false);
  });
});
