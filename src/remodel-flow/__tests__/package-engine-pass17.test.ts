import { describe, it, expect } from "vitest";
import {
  serializeForDb,
  deserializeFromDb,
  type DesignRow,
} from "@/remodel-flow/persistence/serializer";
import type { RemodelFlowState } from "@/remodel-flow/types";

const baseState: RemodelFlowState = { selections: {} };

describe("Pass 17 — serializer round-trip for legacy_project_id / legacy_extras", () => {
  it("omits both keys when neither passed", () => {
    const row = serializeForDb(baseState);
    expect("legacy_project_id" in row).toBe(false);
    expect("legacy_extras" in row).toBe(false);
  });

  it("legacyProjectId: null → key included as null", () => {
    const row = serializeForDb(baseState, { legacyProjectId: null });
    expect("legacy_project_id" in row).toBe(true);
    expect(row.legacy_project_id).toBeNull();
  });

  it("legacyProjectId: string → preserved", () => {
    const row = serializeForDb(baseState, { legacyProjectId: "abc-123" });
    expect(row.legacy_project_id).toBe("abc-123");
  });

  it("omits legacy_extras when not passed", () => {
    const row = serializeForDb(baseState, { legacyProjectId: "x" });
    expect("legacy_extras" in row).toBe(false);
  });

  it("legacyExtras: null → key included as null", () => {
    const row = serializeForDb(baseState, { legacyExtras: null });
    expect("legacy_extras" in row).toBe(true);
    expect(row.legacy_extras).toBeNull();
  });

  it("legacyExtras: object → preserved", () => {
    const extras = { dimensions: { length: 8 } };
    const row = serializeForDb(baseState, { legacyExtras: extras });
    expect(row.legacy_extras).toEqual(extras);
  });

  it("deserialize null legacy fields → null/null", () => {
    const row: DesignRow = {
      id: "d1",
      legacy_project_id: null,
      legacy_extras: null,
    };
    const { meta } = deserializeFromDb(row);
    expect(meta.legacyProjectId).toBeNull();
    expect(meta.legacyExtras).toBeNull();
  });

  it("deserialize preserves legacy values", () => {
    const row: DesignRow = {
      id: "d1",
      legacy_project_id: "p-9",
      legacy_extras: { foo: "bar" },
    };
    const { meta, state } = deserializeFromDb(row);
    expect(meta.legacyProjectId).toBe("p-9");
    expect(meta.legacyExtras).toEqual({ foo: "bar" });
    // legacy_extras must NOT bleed into selections / resolved_state.
    expect(state.selections).toEqual({});
    expect(meta.resolvedState).toEqual({});
  });
});

describe("Pass 17 — SELECT shape guarantees", () => {
  it("useUserProjects picker SELECT includes legacy_project_id but NOT legacy_extras", async () => {
    const src = await import("fs").then((fs) =>
      fs.readFileSync("src/hooks/useUserProjects.ts", "utf8"),
    );
    // Find the remodel_designs picker .select(...) call.
    const m = src.match(/from\("remodel_designs"\)\s*\.select\(\s*"([^"]+)"/);
    expect(m, "remodel_designs picker SELECT not found").toBeTruthy();
    const cols = m![1];
    expect(cols).toContain("legacy_project_id");
    expect(cols).not.toContain("legacy_extras");
  });

  it("loadDesign by-id SELECT includes both legacy_project_id and legacy_extras", async () => {
    const src = await import("fs").then((fs) =>
      fs.readFileSync("src/remodel-flow/persistence/client.ts", "utf8"),
    );
    expect(src).toMatch(/\.select\("\*,\s*legacy_project_id,\s*legacy_extras"\)/);
  });
});
