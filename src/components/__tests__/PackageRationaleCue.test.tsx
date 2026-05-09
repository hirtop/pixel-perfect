import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PackageRationaleCue, { RATIONALE_COPY } from "../PackageRationaleCue";

const ESSENTIAL =
  "Clean modern refresh with streamlined finishes and fewer upgrades, designed around existing plumbing.";
const BALANCED =
  "Shower-forward modern remodel with cohesive finishes and curated retailer-anchored selections, designed around existing plumbing.";
const PREMIUM =
  "Designer-grade materials and finishes, designed around existing plumbing.";

const RESTRICTED = [
  "best",
  "better",
  "most popular",
  "recommended",
  "top",
  "approved",
  "certified",
  "guaranteed",
  "binding",
  "firm quote",
  "firm bid",
  "firm price",
  "final price",
  "contractor-ready",
  "ready for contractor",
  "construction-ready",
  "everything you need",
  "complete summary",
  "BOBOX recommends",
  "permit",
  "permits",
  "licensed",
  "legal",
  "insurance",
  "insured",
  "bonded",
  "warranty",
  "free quote",
  "no obligation",
];

describe("PackageRationaleCue", () => {
  it("renders Modern Essential exact copy", () => {
    render(<PackageRationaleCue tier="Budget" />);
    expect(screen.getByText(ESSENTIAL)).toBeInTheDocument();
  });

  it("renders Modern Balanced exact copy", () => {
    render(<PackageRationaleCue tier="Balanced" />);
    expect(screen.getByText(BALANCED)).toBeInTheDocument();
  });

  it("renders Modern Premium exact copy", () => {
    render(<PackageRationaleCue tier="Premium" />);
    expect(screen.getByText(PREMIUM)).toBeInTheDocument();
  });

  it("contains no restricted phrases in any rationale copy", () => {
    const all = Object.values(RATIONALE_COPY).join(" \n ").toLowerCase();
    for (const phrase of RESTRICTED) {
      expect(all).not.toContain(phrase.toLowerCase());
    }
  });
});
