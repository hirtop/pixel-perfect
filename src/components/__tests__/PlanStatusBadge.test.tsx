import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PlanStatusBadge from "@/components/PlanStatusBadge";

const recentIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

describe("PlanStatusBadge", () => {
  it("renders 'Status: Exploring.' when no package locked", () => {
    render(
      <PlanStatusBadge
        project={{
          updated_at: recentIso,
          selected_package: null,
          workflow_progress: { completed_steps: [] },
        }}
      />,
    );
    expect(screen.getByText("Status: Exploring.")).toBeInTheDocument();
  });

  it("renders 'Status: Shaping.' for locked + mid selection count", () => {
    render(
      <PlanStatusBadge
        project={{
          updated_at: recentIso,
          selected_package: { tier: "balanced" },
          workflow_progress: { completed_steps: ["a", "b", "c", "d"] },
        }}
      />,
    );
    expect(screen.getByText("Status: Shaping.")).toBeInTheDocument();
  });

  it("renders 'Status: Well shaped.' when locked + 7+ selections", () => {
    render(
      <PlanStatusBadge
        project={{
          updated_at: recentIso,
          selected_package: { tier: "balanced" },
          workflow_progress: { completed_steps: ["1", "2", "3", "4", "5", "6", "7"] },
        }}
      />,
    );
    expect(screen.getByText("Status: Well shaped.")).toBeInTheDocument();
  });

  it("renders nothing when status is null (stale plan)", () => {
    const stale = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { container } = render(
      <PlanStatusBadge
        project={{
          updated_at: stale,
          selected_package: { tier: "balanced" },
          workflow_progress: { completed_steps: ["a", "b", "c"] },
        }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when project is null", () => {
    const { container } = render(<PlanStatusBadge project={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
