import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryIncludesCue from "../SummaryIncludesCue";

describe("SummaryIncludesCue", () => {
  it("renders the heading", () => {
    render(<SummaryIncludesCue />);
    expect(
      screen.getByRole("heading", { name: /your summary includes/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly the three allowed bullets", () => {
    render(<SummaryIncludesCue />);
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items).toEqual([
      "Selected package and style direction",
      "Saved product choices",
      "Project notes and dimensions, when provided",
    ]);
  });

  it("renders the review note", () => {
    render(<SummaryIncludesCue />);
    expect(
      screen.getByText(/review everything before sharing or making decisions\./i),
    ).toBeInTheDocument();
  });

  it("does not render any restricted copy", () => {
    const { container } = render(<SummaryIncludesCue />);
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
      "permit",
      "licensed",
      "legal",
      "insurance",
      "financing",
      "ready to share",
      "quote-ready",
      "bid-ready",
      "final price",
      "construction-ready",
    ];
    for (const term of forbidden) {
      expect(text).not.toContain(term);
    }
  });
});
