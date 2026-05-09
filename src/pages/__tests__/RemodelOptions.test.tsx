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

describe("RemodelOptions Pass 20 comparison cue", () => {
  it("renders exactly one PackageComparisonCue", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("package-comparison-cue")).toHaveLength(1);
  });

  it("renders PackageComparisonCue between ProjectSnapshot and the first package card", () => {
    const { container } = render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    const cue = container.querySelector('[data-testid="package-comparison-cue"]');
    const snapshotHeading = screen.getByText("Next Step");
    const firstCardHeading = screen.getByRole("heading", { name: "Essential" });
    expect(cue).toBeTruthy();
    // DOM order check via documentPosition
    expect(
      snapshotHeading.compareDocumentPosition(cue!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      cue!.compareDocumentPosition(firstCardHeading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("PackageComparisonCue subtree does not mention Essential/Balanced/Premium", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    const cue = screen.getByTestId("package-comparison-cue");
    expect(cue.textContent ?? "").not.toMatch(/Essential|Balanced|Premium/);
  });
});

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

describe("RemodelOptions Pass 24 Premium copy fix", () => {
  it("renders Modern Premium rationale exactly", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        "Designer-grade materials and finishes, designed around existing plumbing."
      )
    ).toBeInTheDocument();
  });

  it("renders Modern Premium bullet 'Higher-grade fixtures and tile within existing layout'", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText("Higher-grade fixtures and tile within existing layout")
    ).toBeInTheDocument();
  });

  it("renders Modern Premium body with 'upgraded finish work.'", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/upgraded finish work\./i)
    ).toBeInTheDocument();
  });

  it("Modern Premium card subtree does not contain layout-flexibility wording", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    const premiumHeading = screen.getByRole("heading", { name: "Premium" });
    const card = premiumHeading.closest("[class*='rounded-2xl']") || premiumHeading.parentElement?.parentElement;
    const text = card?.textContent ?? "";
    expect(text).not.toMatch(/flexibility to change the layout/i);
    expect(text).not.toMatch(/Layout modifications available/i);
    expect(text).not.toMatch(/rethink the layout/i);
    expect(text).not.toMatch(/flexibility to rethink/i);
    expect(text).not.toMatch(/layout flexibility/i);
    expect(text).not.toMatch(/layout variation/i);
  });

  it("does not render 'flexibility to change the layout' anywhere on /options", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/flexibility to change the layout/i)).not.toBeInTheDocument();
  });

  it("does not render 'Layout modifications available' anywhere on /options", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Layout modifications available/i)).not.toBeInTheDocument();
  });

  it("does not render 'rethink the layout' anywhere on /options", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.queryByText(/rethink the layout/i)).not.toBeInTheDocument();
  });

  it("Essential rationale remains unchanged", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        "Clean modern refresh with streamlined finishes and fewer upgrades, designed around existing plumbing."
      )
    ).toBeInTheDocument();
  });

  it("Balanced rationale remains unchanged", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        "Shower-forward modern remodel with cohesive finishes and curated retailer-anchored selections, designed around existing plumbing."
      )
    ).toBeInTheDocument();
  });

  it("PackagePersonaCue strings unchanged", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/For homeowners doing a first remodel or working within a tighter budget\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/For homeowners doing a real modern remodel without going custom-build\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/For homeowners planning a fully upgraded modern bathroom\./i)
    ).toBeInTheDocument();
  });

  it("PackageComparisonCue heading and body unchanged", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.getByText("How to choose")).toBeInTheDocument();
    expect(
      screen.getByText(
        /The three packages differ in how much of the bathroom you want to change\./i
      )
    ).toBeInTheDocument();
  });

  it("ProjectSnapshot heading remains 'Next Step'", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    expect(screen.getByText("Next Step")).toBeInTheDocument();
  });

  it("does not render forbidden copy anywhere on /options", () => {
    render(
      <MemoryRouter>
        <RemodelOptions />
      </MemoryRouter>
    );
    const body = document.body.textContent ?? "";
    const forbidden = [
      "Recommended",
      "Most Popular",
      "Best for",
      "Best value",
      "Guaranteed",
      "final quote",
      "contractor-approved",
      "ready to build",
      "BOBOX recommends",
      "top",
      "popular choice",
    ];
    for (const phrase of forbidden) {
      expect(body).not.toMatch(new RegExp(phrase, "i"));
    }
  });
});
