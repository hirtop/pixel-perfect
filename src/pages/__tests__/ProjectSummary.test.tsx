import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjectSummary from "../../pages/ProjectSummary";

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({
    project: {
      id: "test-project-id",
      name: "Test Project",
      status: "draft",
      bathroom_type: "Full bath",
      property_type: "Single family",
      bathing_setup: "Tub + shower",
      photos: { metadata: [], notes: "" },
      dimensions: {},
      style_preferences: {
        budget_level: "Comfortable",
        style: "Modern",
        finish: "Matte black",
      },
      selected_package: { name: "Balanced", tier: "balanced" },
      customizations: { categories: [] },
      workflow_progress: { current_step: "summary", completed_steps: [] },
      subcontractor_interactions: [],
      agreement_data: {},
      updated_at: new Date().toISOString(),
      assessment: {},
    },
    updateProject: vi.fn(),
    markStepComplete: vi.fn(),
    saveProject: vi.fn(() => Promise.resolve(true)),
    isSaving: false,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/components/ReferencePhotos", () => ({
  default: () => <div data-testid="reference-photos" />,
}));

vi.mock("@/components/BathroomRiskScan", () => ({
  default: () => <div data-testid="bathroom-risk-scan" />,
}));

vi.mock("@/components/PlanConfidenceFooter", () => ({
  PlanConfidenceFooter: () => <div data-testid="plan-confidence-footer" />,
}));

vi.mock("@/components/PlanNameEditor", () => ({
  default: () => <span>Test Project</span>,
}));

vi.mock("@/components/RecencyHint", () => ({
  default: () => <div data-testid="recency-hint" />,
}));

vi.mock("@/components/PlanStatusBadge", () => ({
  default: () => <div data-testid="plan-status-badge" />,
}));

vi.mock("@/components/shopping-assistant/ShoppingAssistantFab", () => ({
  default: () => <div data-testid="shopping-assistant-fab" />,
}));

vi.mock("@/assets/package-budget.jpg", () => ({ default: "" }));
vi.mock("@/assets/package-balanced.jpg", () => ({ default: "" }));
vi.mock("@/assets/package-premium.jpg", () => ({ default: "" }));

describe("ProjectSummary Pass 22 framing cue", () => {
  it("renders exactly one SummaryFramingCue", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("summary-framing-cue")).toHaveLength(1);
  });

  it("SummaryFramingCue heading is exactly Planning summary", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    const cue = screen.getByTestId("summary-framing-cue");
    expect(cue.textContent).toMatch(/Planning summary/);
  });

  it("SummaryFramingCue body matches approved copy", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        /this is a planning summary, not a final contractor quote\. use it to review your direction; your contractor will confirm site-specific details\./i,
      ),
    ).toBeInTheDocument();
  });

  it("DOM order: hero subtitle → SummaryFramingCue → hero image", () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    const heroSubtitle = screen.getByText(
      /here's your selected remodel direction, budget snapshot, and project overview so far\./i
    );
    const cue = container.querySelector('[data-testid="summary-framing-cue"]');
    const heroImg = container.querySelector('img[alt="Selected bathroom remodel direction"]');
    expect(cue).toBeTruthy();
    expect(heroImg).toBeTruthy();
    expect(
      heroSubtitle.compareDocumentPosition(cue!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      cue!.compareDocumentPosition(heroImg!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("hero subtitle renders unchanged", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByText(
        /here's your selected remodel direction, budget snapshot, and project overview so far\./i,
      ),
    ).toBeInTheDocument();
  });

  it("SummaryIncludesCue renders unchanged", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /your summary includes/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/selected package and style direction/i)).toBeInTheDocument();
    expect(screen.getByText(/saved product choices/i)).toBeInTheDocument();
    expect(screen.getByText(/project notes and dimensions, when provided/i)).toBeInTheDocument();
  });

  it("SummaryExclusionsCue renders unchanged", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /still to confirm/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /your bobox summary helps organize your selections, but some project details still need to be confirmed before work begins\./i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/review these items with your contractor or project professional\./i),
    ).toBeInTheDocument();
  });

  it("contractor handoff panel renders unchanged", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /summary for your contractor/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/included in this planning estimate/i)).toBeInTheDocument();
    expect(screen.getByText(/not included in this estimate/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this is a planning package, not a final contractor quote\./i),
    ).toBeInTheDocument();
  });

  it("first-meeting / questions panel renders unchanged", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /questions to ask your contractor/i }),
    ).toBeInTheDocument();
  });

  it("SummaryFramingCue is not placed near SummaryIncludesCue or SummaryExclusionsCue", () => {
    const { container } = render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    const cue = container.querySelector('[data-testid="summary-framing-cue"]');
    const includesCue = container.querySelector('[data-testid="summary-includes-cue"]');
    const exclusionsCue = container.querySelector('[data-testid="summary-exclusions-cue"]');
    const contractorSection = container.querySelector(".contractor-section");
    expect(cue).toBeTruthy();
    expect(includesCue).toBeTruthy();
    expect(exclusionsCue).toBeTruthy();
    expect(contractorSection).toBeTruthy();
    // Cue should come BEFORE includes/exclusions/contractor sections
    expect(
      cue!.compareDocumentPosition(includesCue!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      cue!.compareDocumentPosition(exclusionsCue!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      cue!.compareDocumentPosition(contractorSection!) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("SummaryFramingCue subtree does not contain forbidden words", () => {
    render(
      <MemoryRouter>
        <ProjectSummary />
      </MemoryRouter>
    );
    const cue = screen.getByTestId("summary-framing-cue");
    const text = (cue.textContent || "").toLowerCase();
    const forbidden = [
      "guaranteed",
      "fixed quote",
      "contractor-approved",
      "ready to build",
      "bobox recommends",
      "savings",
      "roi",
      "priced",
      "scheduled",
      "final pricing",
      "firm price",
      "binding",
      "permit",
      "recommended",
      "top",
      "popular",
      "best",
    ];
    for (const term of forbidden) {
      expect(text).not.toContain(term);
    }
    // Allowed carve-out
    expect(text).toContain("final contractor quote");
  });
});
