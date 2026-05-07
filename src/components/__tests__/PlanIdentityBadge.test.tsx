import { describe, it, expect } from "vitest";
import { buildBadgeCopy } from "../PlanIdentityBadge";
import type { ProjectData } from "@/contexts/ProjectContext";

describe("PlanIdentityBadge", () => {
  const baseProject: ProjectData = {
    name: "Untitled Project",
    status: "draft",
    bathroom_type: "",
    property_type: "",
    bathing_setup: "",
    photos: { metadata: [], notes: "" },
    dimensions: {},
    style_preferences: {},
    selected_package: {},
    customizations: {},
    workflow_progress: { current_step: "start", completed_steps: [] },
    subcontractor_interactions: [],
    agreement_data: {},
  };

  it("uses 'Your project' when name is default/empty", () => {
    const copy = buildBadgeCopy(baseProject);
    expect(copy).toBe("Project: Your project");
  });

  it("uses custom name when provided", () => {
    const copy = buildBadgeCopy({ ...baseProject, name: "Balanced bathroom" });
    expect(copy).toBe("Project: Balanced bathroom");
  });

  it("formats updated_at as Month Day", () => {
    const copy = buildBadgeCopy({
      ...baseProject,
      name: "Summary",
      updated_at: "2026-05-07T12:00:00Z",
    });
    expect(copy).toContain("Updated May 7");
    expect(copy).toMatch(/^Project: Summary · Updated/);
  });

  it("omits Updated when date is missing", () => {
    const copy = buildBadgeCopy({
      ...baseProject,
      name: "No date project",
    });
    expect(copy).toBe("Project: No date project");
    expect(copy).not.toContain("Updated");
  });

  it("treats 'Untitled Design' as default-like", () => {
    const copy = buildBadgeCopy({ ...baseProject, name: "Untitled Design" });
    expect(copy).toBe("Project: Your project");
  });

  it("handles empty/whitespace name as default", () => {
    const copy = buildBadgeCopy({ ...baseProject, name: "   " });
    expect(copy).toBe("Project: Your project");
  });

  it("treats literal 'null' string as default-like", () => {
    const copy = buildBadgeCopy({ ...baseProject, name: "null" });
    expect(copy).toBe("Project: Your project");
  });

  it("treats literal 'undefined' string as default-like", () => {
    const copy = buildBadgeCopy({ ...baseProject, name: "undefined" });
    expect(copy).toBe("Project: Your project");
  });

  it("hides Updated date when hideUpdatedDate=true", () => {
    const copy = buildBadgeCopy(
      { ...baseProject, name: "Summary", updated_at: "2026-05-07T12:00:00Z" },
      true,
    );
    expect(copy).toBe("Project: Summary");
    expect(copy).not.toContain("Updated");
  });

  it("includes Updated date by default (hideUpdatedDate=false)", () => {
    const copy = buildBadgeCopy({
      ...baseProject,
      name: "Summary",
      updated_at: "2026-05-07T12:00:00Z",
    });
    expect(copy).toContain("Updated");
  });
});
