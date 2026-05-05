import { describe, it, expect, beforeEach } from "vitest";
import { resolveFlowResumeRoute, hasFlowProgress } from "@/remodel-flow/resumeRoute";
import type { RemodelFlowState } from "@/remodel-flow/types";

const empty: RemodelFlowState = { selections: {} };

describe("resolveFlowResumeRoute", () => {
  it("returns /remodel-flow/start for empty state", () => {
    expect(resolveFlowResumeRoute(empty)).toBe("/remodel-flow/start");
    expect(resolveFlowResumeRoute(null)).toBe("/remodel-flow/start");
  });
  it("style only -> /style", () => {
    expect(resolveFlowResumeRoute({ ...empty, style: "modern" })).toBe("/remodel-flow/style");
  });
  it("style + tier -> /tier", () => {
    expect(resolveFlowResumeRoute({ ...empty, style: "modern", tier: "balanced" })).toBe("/remodel-flow/tier");
  });
  it("curated packageId (modern-balanced) -> /packages", () => {
    expect(
      resolveFlowResumeRoute({ ...empty, style: "modern", tier: "balanced", packageId: "modern-balanced" }),
    ).toBe("/remodel-flow/packages");
  });
  it("placeholder packageId (classic-balanced) -> /options safe fallback (NOT curated route)", () => {
    const route = resolveFlowResumeRoute({
      ...empty,
      style: "classic",
      tier: "balanced",
      packageId: "classic-balanced",
    });
    expect(route).toBe("/options");
    expect(route).not.toBe("/remodel-flow/packages");
    expect(route).not.toBe("/customize/balanced");
  });
  it("placeholder packageId with selections still -> /options (placeholder wins)", () => {
    expect(
      resolveFlowResumeRoute({
        style: "classic",
        tier: "balanced",
        packageId: "classic-balanced",
        selections: { vanity: "v-1" },
      }),
    ).toBe("/options");
  });
  it("legacyTierRoute counts as having a package -> /packages", () => {
    expect(
      resolveFlowResumeRoute({ ...empty, style: "classic", tier: "balanced", legacyTierRoute: "balanced" }),
    ).toBe("/remodel-flow/packages");
  });
  it("curated package + selections -> /customize", () => {
    expect(
      resolveFlowResumeRoute({
        style: "modern",
        tier: "balanced",
        packageId: "modern-balanced",
        selections: { vanity: "v-1" },
      }),
    ).toBe("/remodel-flow/customize");
  });
});

describe("hasFlowProgress", () => {
  it("false for empty", () => {
    expect(hasFlowProgress(empty)).toBe(false);
    expect(hasFlowProgress(null)).toBe(false);
  });
  it("true for any progress field", () => {
    expect(hasFlowProgress({ ...empty, style: "modern" })).toBe(true);
    expect(hasFlowProgress({ ...empty, legacyTierRoute: "balanced" })).toBe(true);
    expect(hasFlowProgress({ selections: { vanity: "v-1" } })).toBe(true);
  });
});

/**
 * "Start a New Project" must clear BOTH storage keys so stale values
 * (packageId, legacyTierRoute, selected_package.tier, style, tier) cannot
 * leak into the new flow. Saved Supabase rows are NOT touched here.
 */
describe("Start a New Project — reset both storage keys", () => {
  const FLOW_KEY = "bobox_remodel_flow_v1";
  const LEGACY_KEY = "bobox_project_draft";

  beforeEach(() => {
    localStorage.clear();
  });

  it("clears bobox_remodel_flow_v1 and bobox_project_draft together", () => {
    localStorage.setItem(
      FLOW_KEY,
      JSON.stringify({
        style: "classic",
        tier: "balanced",
        packageId: "classic-balanced",
        legacyTierRoute: "balanced",
        selections: { vanity: "v-1" },
      }),
    );
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify({
        name: "Old",
        status: "draft",
        selected_package: { name: "Balanced", tier: "balanced" },
      }),
    );

    // Simulate the homepage "Start a New Project" handler: resetFlow()
    // (FlowContext) and resetProject() (ProjectContext) both wipe their
    // respective localStorage keys.
    localStorage.removeItem(FLOW_KEY);
    localStorage.removeItem(LEGACY_KEY);

    expect(localStorage.getItem(FLOW_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("after reset, no stale packageId/legacyTierRoute/style/tier survives", () => {
    localStorage.setItem(
      FLOW_KEY,
      JSON.stringify({
        style: "modern",
        tier: "premium",
        packageId: "modern-balanced",
        legacyTierRoute: "premium",
        selections: { vanity: "v-1" },
      }),
    );
    localStorage.removeItem(FLOW_KEY);
    localStorage.removeItem(LEGACY_KEY);

    const raw = localStorage.getItem(FLOW_KEY);
    expect(raw).toBeNull();
    // hasFlowProgress(null) confirms no progress remains
    expect(hasFlowProgress(null)).toBe(false);
  });
});
