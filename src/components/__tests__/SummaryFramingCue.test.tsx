import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SummaryFramingCue, { FRAMING_HEADING, FRAMING_BODY } from "../SummaryFramingCue";

describe("SummaryFramingCue", () => {
  it("renders the heading exactly: Planning summary", () => {
    render(<SummaryFramingCue />);
    expect(
      screen.getByRole("heading", { name: /planning summary/i }),
    ).toBeInTheDocument();
  });

  it("renders body copy exactly", () => {
    render(<SummaryFramingCue />);
    expect(
      screen.getByText(
        /this is a planning summary, not a final contractor quote\. use it to review your direction; your contractor will confirm site-specific details\./i,
      ),
    ).toBeInTheDocument();
  });

  it("heading export matches exactly", () => {
    expect(FRAMING_HEADING).toBe("Planning summary");
  });

  it("body export matches exactly", () => {
    expect(FRAMING_BODY).toBe(
      "This is a planning summary, not a final contractor quote. Use it to review your direction; your contractor will confirm site-specific details.",
    );
  });

  it("body is one paragraph", () => {
    const { container } = render(<SummaryFramingCue />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(1);
  });

  it("body word count is 30 or fewer", () => {
    const wordCount = FRAMING_BODY.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(30);
  });

  it("does NOT render restricted phrases", () => {
    const { container } = render(<SummaryFramingCue />);
    const text = (container.textContent || "").toLowerCase();
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
  });

  it("renders exactly one instance of the component", () => {
    const { container } = render(<SummaryFramingCue />);
    expect(container.querySelectorAll("[data-testid='summary-framing-cue']")).toHaveLength(1);
  });
});
