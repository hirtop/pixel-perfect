import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryExclusionsCue from "../SummaryExclusionsCue";

describe("SummaryExclusionsCue", () => {
  it("renders the heading exactly: Still to confirm", () => {
    render(<SummaryExclusionsCue />);
    expect(
      screen.getByRole("heading", { name: /still to confirm/i }),
    ).toBeInTheDocument();
  });

  it("renders body copy", () => {
    render(<SummaryExclusionsCue />);
    expect(
      screen.getByText(
        /your bobox summary helps organize your selections, but some project details still need to be confirmed before work begins\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders all four bullets exactly", () => {
    render(<SummaryExclusionsCue />);
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual([
      "Demo, haul-away, and site preparation",
      "Permits, inspections, and local code requirements",
      "Plumbing, electrical, or structural changes",
      "Final labor scope, measurements, and installation details",
    ]);
  });

  it("renders footer exactly: Review these items with your contractor or project professional.", () => {
    render(<SummaryExclusionsCue />);
    expect(
      screen.getByText(
        /review these items with your contractor or project professional\./i,
      ),
    ).toBeInTheDocument();
  });

  it("does NOT render restricted phrases", () => {
    const { container } = render(<SummaryExclusionsCue />);
    const text = (container.textContent || "").toLowerCase();
    const forbidden = [
      "contractor-ready",
      "ready for contractor",
      "approved",
      "certified",
      "guaranteed",
      "binding",
      "firm quote",
      "firm bid",
      "firm price",
      "quote-ready",
      "bid-ready",
      "final price",
      "construction-ready",
      "everything you need",
      "complete summary",
      "bobox recommends",
      "make decisions",
      "making decisions",
      "warranty",
      "insured",
      "bonded",
      "no obligation",
      "free quote",
    ];
    for (const term of forbidden) {
      expect(text).not.toContain(term);
    }
  });
});
