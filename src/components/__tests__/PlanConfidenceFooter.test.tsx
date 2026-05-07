import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanConfidenceFooter } from "./PlanConfidenceFooter";

describe("PlanConfidenceFooter", () => {
  it("renders customize copy", () => {
    render(<PlanConfidenceFooter context="customize" />);
    expect(screen.getByText(/revisit and adjust any selection/i)).toBeInTheDocument();
  });

  it("renders summary copy", () => {
    render(<PlanConfidenceFooter context="summary" />);
    expect(screen.getByText(/revisit and update this plan/i)).toBeInTheDocument();
  });
});
