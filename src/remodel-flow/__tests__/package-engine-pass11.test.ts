/**
 * Pass 11 — Compatibility union read.
 *
 * useUserProjects now reads BOTH public.projects AND remodel_designs and
 * merges them into one SavedProject-shaped list. These tests verify the
 * pure mapping + merge helpers (no React, no Supabase).
 */
import { describe, it, expect } from "vitest";
import { mergeSavedProjects, type SavedProject } from "@/hooks/useUserProjects";
import { normalizeSavedProjectIdentity } from "@/remodel-flow/package-engine/projectIdentity";

const legacyRow: SavedProject = {
  id: "legacy-1",
  name: "Gmail project",
  status: "in_progress",
  bathroom_type: "full",
  updated_at: "2026-05-01T00:00:00.000Z",
  workflow_progress: { current_step: "style" },
  selected_package: { tier: "balanced", name: "Balanced" },
  style_preferences: { style: "modern" },
  source: "projects",
};

const designRow: SavedProject = {
  id: "design-1",
  name: "Untitled design",
  status: "draft",
  bathroom_type: null,
  updated_at: "2026-05-05T00:00:00.000Z",
  workflow_progress: null,
  selected_package: null,
  style_preferences: { style: "modern" },
  selected_package_id: "modern-balanced",
  selected_legacy_tier_route: null,
  source: "remodel_designs",
};

describe("Pass 11 — useUserProjects compatibility union", () => {
  it("legacy-only rows still appear", () => {
    const merged = mergeSavedProjects([legacyRow], []);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe("projects");
  });

  it("remodel_designs-only rows appear", () => {
    const merged = mergeSavedProjects([], [designRow]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe("remodel_designs");
  });

  it("union returns both when both exist (no row dropped)", () => {
    const merged = mergeSavedProjects([legacyRow], [designRow]);
    expect(merged).toHaveLength(2);
    expect(merged.map((p) => p.id).sort()).toEqual(["design-1", "legacy-1"]);
  });

  it("does NOT dedupe across tables even if ids collide", () => {
    const a: SavedProject = { ...legacyRow, id: "same-id" };
    const b: SavedProject = { ...designRow, id: "same-id" };
    const merged = mergeSavedProjects([a], [b]);
    expect(merged).toHaveLength(2);
  });

  it("sorts by updated_at descending", () => {
    const older: SavedProject = { ...legacyRow, id: "old", updated_at: "2026-01-01T00:00:00.000Z" };
    const newer: SavedProject = { ...designRow, id: "new", updated_at: "2026-05-05T00:00:00.000Z" };
    const merged = mergeSavedProjects([older], [newer]);
    expect(merged[0].id).toBe("new");
    expect(merged[1].id).toBe("old");
  });

  it("design row with selected_package_id resolves to packageId", () => {
    const id = normalizeSavedProjectIdentity(designRow);
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });

  it("design row with selected_legacy_tier_route resolves to legacyTierRoute", () => {
    const row: SavedProject = {
      ...designRow,
      selected_package_id: null,
      selected_legacy_tier_route: "balanced",
    };
    const id = normalizeSavedProjectIdentity(row);
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("legacy row with selected_package.tier still resolves (fallback or synth)", () => {
    // Bare legacy row without a style hint — falls back to legacyTierRoute.
    const bare: SavedProject = { ...legacyRow, style_preferences: null };
    const id = normalizeSavedProjectIdentity(bare);
    expect(id.packageId).toBeNull();
    expect(id.legacyTierRoute).toBe("balanced");
  });

  it("legacy row with style + tier may synthesize curated packageId", () => {
    // style=modern + tier=balanced → modern-balanced (registered curated).
    const id = normalizeSavedProjectIdentity(legacyRow);
    expect(id.packageId).toBe("modern-balanced");
    expect(id.legacyTierRoute).toBeNull();
  });

  it("no tier alias lands in packageId from any union row", () => {
    for (const alias of ["balanced", "essential", "premium", "budget"]) {
      const a = normalizeSavedProjectIdentity({
        ...designRow,
        selected_package_id: alias,
        selected_legacy_tier_route: null,
        style_preferences: null,
      });
      expect(a.packageId).toBeNull();
      const b = normalizeSavedProjectIdentity({
        style_preferences: null,
        selected_package: { tier: alias },
      });
      expect(b.packageId).toBeNull();
    }
  });
});
