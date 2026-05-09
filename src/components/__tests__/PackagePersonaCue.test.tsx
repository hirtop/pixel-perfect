import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PackagePersonaCue, { PERSONA_COPY } from "../PackagePersonaCue";

const ESSENTIAL = "For homeowners doing a first remodel or working within a tighter budget.";
const BALANCED = "For homeowners doing a real modern remodel without going custom-build.";
const PREMIUM = "For homeowners planning a fully upgraded modern bathroom.";

const RESTRICTED = [
  "best", "better", "most popular", "recommended", "top",
  "approved", "certified", "guaranteed", "binding",
  "firm quote", "firm bid", "firm price", "final price",
  "contractor-ready", "ready for contractor", "construction-ready",
  "everything you need", "complete summary", "BOBOX recommends",
  "permit", "permits", "licensed", "legal",
  "insurance", "insured", "bonded", "warranty",
  "free quote", "no obligation",
];

describe("PackagePersonaCue", () => {
  it("renders Modern Essential exact copy", () => {
    render(<PackagePersonaCue tier="Budget" />);
    expect(screen.getByText(ESSENTIAL)).toBeInTheDocument();
  });

  it("renders Modern Balanced exact copy", () => {
    render(<PackagePersonaCue tier="Balanced" />);
    expect(screen.getByText(BALANCED)).toBeInTheDocument();
  });

  it("renders Modern Premium exact copy", () => {
    render(<PackagePersonaCue tier="Premium" />);
    expect(screen.getByText(PREMIUM)).toBeInTheDocument();
  });

  it("contains no restricted phrases in any persona copy", () => {
    const all = Object.values(PERSONA_COPY).join(" \n ").toLowerCase();
    for (const phrase of RESTRICTED) {
      expect(all).not.toContain(phrase.toLowerCase());
    }
  });
});
