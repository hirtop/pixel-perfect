/**
 * Pass 19 — Picker dedupe by legacy_project_id.
 *
 * Pure helper tests. No DB, no network. Verifies that legacy public.projects
 * rows are hidden when a remodel_designs row carries a matching
 * legacy_project_id, and that null / missing values do not cause spurious
 * hides. Also covers idempotency and merge sort order.
 */
import { describe, it, expect } from "vitest";
import {
  dedupeSavedProjectsByLegacyProjectId,
  mergeSavedProjects,
  type SavedProject,
} from "@/hooks/useUserProjects";

const legacyRow = (id: string, updated_at = "2026-05-01T00:00:00.000Z"): SavedProject => ({
  id,
  name: "Legacy",
  status: "draft",
  bathroom_type: null,
  updated_at,
  workflow_progress: null,
  selected_package: null,
  style_preferences: null,
  source: "projects",
});

const designRow = (
  id: string,
  legacy_project_id: string | null,
  updated_at = "2026-05-02T00:00:00.000Z",
): SavedProject => ({
  id,
  name: "Design",
  status: "draft",
  bathroom_type: null,
  updated_at,
  workflow_progress: null,
  selected_package: null,
  style_preferences: null,
  source: "remodel_designs",
  legacy_project_id,
});

describe("Pass 19 — dedupeSavedProjectsByLegacyProjectId", () => {
  it("hides legacy row when a design.legacy_project_id matches", () => {
    const legacy = [legacyRow("a"), legacyRow("b")];
    const designs = [designRow("d1", "a")];
    const { legacy: kept, hiddenCount } =
      dedupeSavedProjectsByLegacyProjectId(legacy, designs);
    expect(kept.map((p) => p.id)).toEqual(["b"]);
    expect(hiddenCount).toBe(1);
  });

  it("preserves unmatched legacy rows", () => {
    const legacy = [legacyRow("a"), legacyRow("b")];
    const designs = [designRow("d1", "zzz")];
    const { legacy: kept } = dedupeSavedProjectsByLegacyProjectId(legacy, designs);
    expect(kept.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("never removes design rows", () => {
    const legacy = [legacyRow("a")];
    const designs = [designRow("d1", "a"), designRow("d2", null)];
    const merged = mergeSavedProjects(legacy, designs);
    expect(merged.filter((p) => p.source === "remodel_designs").length).toBe(2);
  });

  it("ignores null legacy_project_id", () => {
    const legacy = [legacyRow("a")];
    const designs = [designRow("d1", null), designRow("d2", null)];
    const { legacy: kept, hiddenCount } =
      dedupeSavedProjectsByLegacyProjectId(legacy, designs);
    expect(kept.map((p) => p.id)).toEqual(["a"]);
    expect(hiddenCount).toBe(0);
  });

  it("keeps multiple design rows with the same legacy_project_id but only hides legacy once", () => {
    const legacy = [legacyRow("a"), legacyRow("b")];
    const designs = [designRow("d1", "a"), designRow("d2", "a")];
    const merged = mergeSavedProjects(legacy, designs);
    expect(merged.filter((p) => p.id === "a").length).toBe(0);
    expect(merged.filter((p) => p.source === "remodel_designs").length).toBe(2);
    expect(merged.filter((p) => p.id === "b").length).toBe(1);
  });

  it("design row with missing/deleted legacy parent still shows", () => {
    const legacy: SavedProject[] = [];
    const designs = [designRow("d1", "ghost-id")];
    const merged = mergeSavedProjects(legacy, designs);
    expect(merged.length).toBe(1);
    expect(merged[0].id).toBe("d1");
  });

  it("no dedupe when only legacy rows exist", () => {
    const legacy = [legacyRow("a"), legacyRow("b")];
    const { legacy: kept, hiddenCount } =
      dedupeSavedProjectsByLegacyProjectId(legacy, []);
    expect(kept.length).toBe(2);
    expect(hiddenCount).toBe(0);
  });

  it("no dedupe when only design rows exist", () => {
    const designs = [designRow("d1", "a")];
    const { legacy: kept, hiddenCount } =
      dedupeSavedProjectsByLegacyProjectId([], designs);
    expect(kept.length).toBe(0);
    expect(hiddenCount).toBe(0);
  });

  it("merged list is sorted descending by updated_at after dedupe", () => {
    const legacy = [
      legacyRow("a", "2026-04-01T00:00:00.000Z"),
      legacyRow("b", "2026-04-10T00:00:00.000Z"),
    ];
    const designs = [
      designRow("d1", "a", "2026-05-15T00:00:00.000Z"),
      designRow("d2", null, "2026-04-05T00:00:00.000Z"),
    ];
    const merged = mergeSavedProjects(legacy, designs);
    const dates = merged.map((p) => Date.parse(p.updated_at));
    const sorted = [...dates].sort((x, y) => y - x);
    expect(dates).toEqual(sorted);
    // 'a' should be hidden by d1
    expect(merged.find((p) => p.id === "a")).toBeUndefined();
  });

  it("is idempotent", () => {
    const legacy = [legacyRow("a"), legacyRow("b")];
    const designs = [designRow("d1", "a")];
    const once = dedupeSavedProjectsByLegacyProjectId(legacy, designs).legacy;
    const twice = dedupeSavedProjectsByLegacyProjectId(once, designs).legacy;
    expect(twice).toEqual(once);
  });
});
