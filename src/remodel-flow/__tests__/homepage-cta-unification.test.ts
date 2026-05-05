import { describe, it, expect } from "vitest";
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
  it("with real packageId -> /packages", () => {
    expect(
      resolveFlowResumeRoute({ ...empty, style: "modern", tier: "balanced", packageId: "modern-balanced" }),
    ).toBe("/remodel-flow/packages");
  });
  it("legacyTierRoute counts as having a package -> /packages", () => {
    expect(
      resolveFlowResumeRoute({ ...empty, style: "classic", tier: "balanced", legacyTierRoute: "balanced" }),
    ).toBe("/remodel-flow/packages");
  });
  it("with selections -> /customize", () => {
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
