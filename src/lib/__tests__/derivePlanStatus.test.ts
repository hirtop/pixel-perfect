import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { derivePlanStatus, type PlanStatusInput } from "@/lib/derivePlanStatus";

const NOW = new Date("2026-05-08T12:00:00Z").getTime();

function isoDaysAgo(days: number): string {
  return new Date(NOW - days * 24 * 60 * 60 * 1000).toISOString();
}

function make(p: Partial<PlanStatusInput> = {}, daysAgo = 1): PlanStatusInput {
  return {
    updated_at: isoDaysAgo(daysAgo),
    selected_package: null,
    workflow_progress: { completed_steps: [] },
    ...p,
  };
}

describe("derivePlanStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for missing project", () => {
    expect(derivePlanStatus(null)).toBeNull();
    expect(derivePlanStatus(undefined)).toBeNull();
  });

  it("returns null when updated_at is missing/invalid", () => {
    expect(derivePlanStatus({ updated_at: "" })).toBeNull();
    expect(derivePlanStatus({ updated_at: "not-a-date" })).toBeNull();
  });

  it("returns null when updated_at is older than 60 days", () => {
    const p = make({ selected_package: { tier: "balanced" } }, 61);
    expect(derivePlanStatus(p)).toBeNull();
  });

  it("returns 'exploring' when no package locked (regardless of selections)", () => {
    const p = make({
      selected_package: null,
      workflow_progress: { completed_steps: ["a", "b", "c", "d", "e"] },
    });
    expect(derivePlanStatus(p)).toBe("exploring");
  });

  it("returns 'exploring' when 2 or fewer selections", () => {
    const p = make({
      selected_package: { tier: "balanced" },
      workflow_progress: { completed_steps: ["a", "b"] },
    });
    expect(derivePlanStatus(p)).toBe("exploring");
  });

  it("returns 'shaping' with package locked and 3 selections recently", () => {
    const p = make({
      selected_package: { tier: "balanced" },
      workflow_progress: { completed_steps: ["a", "b", "c"] },
    });
    expect(derivePlanStatus(p)).toBe("shaping");
  });

  it("returns 'shaping' with package locked and 6 selections recently", () => {
    const p = make({
      selected_package: { tier: "balanced" },
      workflow_progress: { completed_steps: ["1", "2", "3", "4", "5", "6"] },
    });
    expect(derivePlanStatus(p)).toBe("shaping");
  });

  it("returns 'ready-to-share' with package locked and 7+ selections recently", () => {
    const p = make({
      selected_package: { tier: "balanced" },
      workflow_progress: { completed_steps: ["1", "2", "3", "4", "5", "6", "7"] },
    });
    expect(derivePlanStatus(p)).toBe("ready-to-share");
  });

  it("at exactly 14 days old, locked + 5 selections still classifies as 'shaping'", () => {
    const p = make(
      {
        selected_package: { tier: "balanced" },
        workflow_progress: { completed_steps: ["a", "b", "c", "d", "e"] },
      },
      14,
    );
    expect(derivePlanStatus(p)).toBe("shaping");
  });

  it("just over 14 days old with locked + 5 selections returns null (ambiguous)", () => {
    const p = make(
      {
        selected_package: { tier: "balanced" },
        workflow_progress: { completed_steps: ["a", "b", "c", "d", "e"] },
      },
      15,
    );
    expect(derivePlanStatus(p)).toBeNull();
  });

  it("just over 60 days old is suppressed", () => {
    const p = make(
      {
        selected_package: { tier: "balanced" },
        workflow_progress: { completed_steps: ["a", "b", "c"] },
      },
      61,
    );
    expect(derivePlanStatus(p)).toBeNull();
  });

  it("prefers customizations.categories count when present", () => {
    const p = make({
      selected_package: { tier: "balanced" },
      workflow_progress: { completed_steps: ["a"] },
      customizations: { categories: [1, 2, 3, 4, 5, 6, 7, 8] as unknown[] },
    });
    expect(derivePlanStatus(p)).toBe("ready-to-share");
  });
});
