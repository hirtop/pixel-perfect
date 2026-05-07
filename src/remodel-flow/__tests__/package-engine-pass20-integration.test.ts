/**
 * Pass 20 — Integration-style tests for the legacy name carry lifecycle.
 *
 * These tests stitch together the three pure pieces of the carry path:
 *   1. hydrateFlowFromSavedProject  → produces pendingLegacyOrigin
 *   2. FlowContext autosave logic   → builds saveOpts for first INSERT
 *      vs subsequent UPDATE (simulated here without React)
 *   3. serializeForDb               → converts state + ctx into the row
 *      payload actually sent to the DB
 *
 * We do not mount FlowContext; instead we replicate its decision logic
 * (isFirstInsert + pendingOrigin + clear-on-success) so we can assert on
 * the exact payload shape that would be written.
 */
import { describe, it, expect } from "vitest";
import {
  hydrateFlowFromSavedProject,
  type FlowSetters,
  type SavedProjectRowLike,
} from "@/remodel-flow/package-engine/hydrateFromSavedProject";
import { serializeForDb } from "@/remodel-flow/persistence/serializer";
import {
  buildLegacyExtrasSnapshot,
  __resetLegacyExtrasSnapshotTelemetryForTests,
} from "@/remodel-flow/package-engine/legacyExtrasSnapshot";
import type { RemodelFlowState } from "@/remodel-flow/types";

const noopSetters: FlowSetters = {
  setStyle: () => {},
  setTier: () => {},
  setPackageId: () => {},
  setLegacyTierRoute: () => {},
};
const STATE: RemodelFlowState = { selections: {} };
const LEGACY_ID = "11111111-2222-3333-4444-555555555555";

/**
 * Mirror of FlowContext autosave saveOpts builder. Pure.
 */
function buildSaveOpts(
  pendingOrigin: {
    legacyProjectId: string;
    legacyExtras: unknown | null;
    legacyName: string | null;
  } | null,
  designId: string | undefined,
) {
  const isFirstInsert = !designId;
  const opts: {
    designId?: string;
    legacyProjectId?: string;
    legacyExtras?: unknown | null;
    name?: string;
  } = { designId };
  if (isFirstInsert && pendingOrigin) {
    opts.legacyProjectId = pendingOrigin.legacyProjectId;
    opts.legacyExtras = pendingOrigin.legacyExtras ?? null;
    if (pendingOrigin.legacyName) opts.name = pendingOrigin.legacyName;
  }
  return opts;
}

describe("Pass 20 integration — legacy name carry lifecycle", () => {
  it("hydrate → first INSERT carries name+legacy keys; UPDATE omits them", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "projects",
      name: "Summary",
      bathroom_type: "full",
      property_type: "primary",
    };

    const { legacyOrigin } = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(legacyOrigin).not.toBeNull();
    expect(legacyOrigin!.legacyProjectId).toBe(LEGACY_ID);
    expect(legacyOrigin!.legacyName).toBe("Summary");
    expect(legacyOrigin!.legacyExtras).toMatchObject({
      bathroom_type: "full",
      property_type: "primary",
    });

    // First INSERT (no designId yet)
    const firstOpts = buildSaveOpts(legacyOrigin, undefined);
    const firstRow = serializeForDb(STATE, {
      name: firstOpts.name,
      legacyProjectId: firstOpts.legacyProjectId ?? null,
      legacyExtras: (firstOpts.legacyExtras ?? null) as never,
    });
    expect(firstRow.name).toBe("Summary");
    expect(firstRow.legacy_project_id).toBe(LEGACY_ID);
    expect("legacy_extras" in firstRow).toBe(true);
    expect(firstRow.legacy_extras).toMatchObject({ bathroom_type: "full" });

    // INSERT succeeded → pending cleared. UPDATE path:
    const updateOpts = buildSaveOpts(null, "design-uuid-123");
    const updateRow = serializeForDb(STATE, {
      name: updateOpts.name,
    });
    expect("legacy_project_id" in updateRow).toBe(false);
    expect("legacy_extras" in updateRow).toBe(false);
    // ctx.name omitted on UPDATE → serializer default; caller in production
    // would only send mutated columns, so this default is never written.
    expect(updateOpts.name).toBeUndefined();
  });

  it("failed first INSERT → pending retained; retry still carries name+legacy keys", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "projects",
      name: "Summary",
    };
    const { legacyOrigin } = hydrateFlowFromSavedProject(row, STATE, noopSetters);

    // Simulate FlowContext: only clear pending on success. First attempt fails.
    let pending = legacyOrigin;
    const attempt1 = buildSaveOpts(pending, undefined);
    expect(attempt1.name).toBe("Summary");
    expect(attempt1.legacyProjectId).toBe(LEGACY_ID);
    // INSERT failed → do NOT clear pending.
    // (FlowContext only clears inside `if (result.ok)`.)
    // Retry — still no designId, still pending.
    const attempt2 = buildSaveOpts(pending, undefined);
    expect(attempt2.name).toBe("Summary");
    expect(attempt2.legacyProjectId).toBe(LEGACY_ID);
    expect(attempt2.legacyExtras).toBeDefined();

    // Now retry succeeds → clear pending.
    pending = null;
    const followup = buildSaveOpts(pending, "new-design-id");
    expect(followup.name).toBeUndefined();
    expect(followup.legacyProjectId).toBeUndefined();
  });

  it("legacy name 'Untitled Design' is still carried (no source-side filter)", () => {
    const row: SavedProjectRowLike = {
      id: LEGACY_ID,
      source: "projects",
      name: "Untitled Design",
    };
    const { legacyOrigin } = hydrateFlowFromSavedProject(row, STATE, noopSetters);
    expect(legacyOrigin?.legacyName).toBe("Untitled Design");

    const opts = buildSaveOpts(legacyOrigin, undefined);
    const dbRow = serializeForDb(STATE, {
      name: opts.name,
      legacyProjectId: opts.legacyProjectId ?? null,
      legacyExtras: (opts.legacyExtras ?? null) as never,
    });
    expect(dbRow.name).toBe("Untitled Design");
    expect(dbRow.legacy_project_id).toBe(LEGACY_ID);
  });
});

describe("Pass 20 — legacyExtrasSnapshot strips photos without mutating input", () => {
  it("removes agreement_data.photos from snapshot and leaves source object untouched", () => {
    __resetLegacyExtrasSnapshotTelemetryForTests();
    const photos = [{ url: "https://example/p1.jpg" }];
    const agreement = {
      signed_at: "2026-05-01",
      photos,
      signer: "Hirtop",
    };
    const row = {
      bathroom_type: "full",
      agreement_data: agreement,
    };

    const snap = buildLegacyExtrasSnapshot(row);
    expect(snap).not.toBeNull();
    expect(snap!.agreement_data).toBeDefined();
    expect("photos" in (snap!.agreement_data as object)).toBe(false);
    expect((snap!.agreement_data as { signer?: string }).signer).toBe("Hirtop");

    // Original input must be unchanged.
    expect(agreement.photos).toBe(photos);
    expect(Object.keys(agreement).sort()).toEqual(
      ["photos", "signed_at", "signer"].sort(),
    );
  });
});
