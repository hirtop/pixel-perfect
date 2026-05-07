import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResumePlanBanner, { buildMetadataLine } from "@/components/ResumePlanBanner";
import type { SavedProject } from "@/hooks/useUserProjects";

const baseProject: SavedProject = {
  id: "p1",
  name: "Test",
  status: "draft",
  bathroom_type: null,
  updated_at: "2026-05-07T12:00:00Z",
  workflow_progress: null,
  selected_package: { tier: "balanced" },
  style_preferences: { style: "modern" },
  source: "projects",
};

describe("ResumePlanBanner", () => {
  it("renders welcome heading and CTA", () => {
    render(
      <MemoryRouter>
        <ResumePlanBanner project={baseProject} onResume={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Welcome back. Your plan is saved.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open my plan/i })).toBeInTheDocument();
  });

  it("builds metadata line with tier, style, date", () => {
    const line = buildMetadataLine(baseProject);
    expect(line).toContain("Balanced");
    expect(line).toContain("Modern");
    expect(line).toMatch(/Updated /);
  });

  it("returns null metadata when no fields available", () => {
    const empty: SavedProject = {
      ...baseProject,
      selected_package: null,
      style_preferences: null,
      updated_at: "",
    };
    expect(buildMetadataLine(empty)).toBeNull();
  });

  it("builds metadata line with tier only and skips missing style", () => {
    const partial: SavedProject = {
      ...baseProject,
      selected_package: { tier: "balanced" },
      style_preferences: null,
      updated_at: "2026-05-07T12:00:00Z",
    };
    const line = buildMetadataLine(partial);
    expect(line).toContain("Balanced");
    expect(line).toMatch(/Updated /);
    expect(line).not.toMatch(/ ·  · /);
    expect(line).not.toContain("Modern");
  });
});
