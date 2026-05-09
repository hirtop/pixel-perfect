import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RemodelOptions from "../../pages/RemodelOptions";

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({
    project: {
      name: "Test Project",
      status: "draft",
      bathroom_type: "",
      property_type: "",
      bathing_setup: "",
      photos: { metadata: [], notes: "" },
      dimensions: {},
      style_preferences: { budget_level: "" },
      selected_package: { name: "", tier: "" },
      customizations: {},
      workflow_progress: { current_step: "start", completed_steps: [] },
      subcontractor_interactions: [],
      agreement_data: {},
    },
    updateProject: vi.fn(),
    markStepComplete: vi.fn(),
  }),
}));

vi.mock("@/hooks/useBathroomPhotoScans", () => ({
  useBathroomPhotoScans: () => ({ scans: [] }),
}));

vi.mock("@/assets/package-budget.jpg", () => ({ default: "" }));
vi.mock("@/assets/package-balanced.jpg", () => ({ default: "" }));
vi.mock("@/assets/package-premium.jpg", () => ({ default: "" }));

describe("RemodelOptions Pass 19 copy cleanup", () => {
  it("does not render 'Most Popular' on Balanced card", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Most Popular/i)).not.toBeInTheDocument();
  });

  it("does not render any 'Best for…' text", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Best for/i)).not.toBeInTheDocument();
  });

  it("does not render any 'Recommended' text on the page", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Recommended/i)).not.toBeInTheDocument();
  });
});
