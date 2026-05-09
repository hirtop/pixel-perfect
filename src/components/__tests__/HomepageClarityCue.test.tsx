import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomepageClarityCue, { HEADING, BODY, SUPPORTING_LINE } from "../HomepageClarityCue";

const RESTRICTED = [
  "contractor-ready",
  "ready for contractor",
  "approved",
  "certified",
  "guaranteed",
  "binding",
  "firm quote",
  "firm bid",
  "firm price",
  "final price",
  "quote-ready",
  "bid-ready",
  "construction-ready",
  "everything you need",
  "complete summary",
  "BOBOX recommends",
  "best",
  "better",
  "most popular",
  "top",
  "licensed",
  "legal",
  "insurance",
  "insured",
  "bonded",
  "warranty",
  "free quote",
  "no obligation",
  "permit",
  "permits",
];

describe("HomepageClarityCue", () => {
  it("renders the heading exactly", () => {
    render(<HomepageClarityCue />);
    expect(screen.getByText(HEADING)).toBeInTheDocument();
  });

  it("renders the body exactly", () => {
    render(<HomepageClarityCue />);
    expect(screen.getByText(BODY)).toBeInTheDocument();
  });

  it("does not render the supporting line by default", () => {
    render(<HomepageClarityCue />);
    expect(screen.queryByText(SUPPORTING_LINE)).not.toBeInTheDocument();
  });

  it("renders the supporting line when withSupportingLine is true", () => {
    render(<HomepageClarityCue withSupportingLine />);
    expect(screen.getByText(SUPPORTING_LINE)).toBeInTheDocument();
  });

  it("contains no restricted phrases in heading, body, or supporting line", () => {
    const allText = [HEADING, BODY, SUPPORTING_LINE].join(" \n ").toLowerCase();
    for (const phrase of RESTRICTED) {
      expect(allText).not.toContain(phrase.toLowerCase());
    }
  });
});
