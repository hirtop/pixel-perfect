import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectSnapshot from "../ProjectSnapshot";
import type { ProjectSnapshot as Snapshot } from "@/data/project-snapshot";

const mockSnapshot: Snapshot = {
  yourTierRange: "$12,000 – $16,000",
  yourTierLabel: "Balanced",
  marketRange: "$8,000 – $32,000",
  complexity: "Moderate",
  complexityReason: "Standard vanity and tub layout with updated finishes.",
  drivers: [
    { label: "Vanity & countertop", detail: "Quartz top with floating cabinet" },
    { label: "Tile selection", detail: "Large-format porcelain for floor and walls" },
  ],
  nextStep: {
    text: "Review the Balanced package and explore product options.",
    highlightTier: "Balanced",
  },
};

describe("ProjectSnapshot Pass 19 copy cleanup", () => {
  it("renders 'Next Step' heading exactly", () => {
    render(<ProjectSnapshot snapshot={mockSnapshot} />);
    expect(screen.getByText("Next Step")).toBeInTheDocument();
  });

  it("does not render 'Recommended Next Step'", () => {
    render(<ProjectSnapshot snapshot={mockSnapshot} />);
    expect(screen.queryByText(/Recommended Next Step/i)).not.toBeInTheDocument();
  });

  it("does not render any 'Recommended' text", () => {
    render(<ProjectSnapshot snapshot={mockSnapshot} />);
    expect(screen.queryByText(/Recommended/i)).not.toBeInTheDocument();
  });
});
