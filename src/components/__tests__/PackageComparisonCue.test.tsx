import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PackageComparisonCue from "../PackageComparisonCue";

describe("PackageComparisonCue", () => {
  it("renders the exact heading 'How to choose'", () => {
    render(<PackageComparisonCue />);
    expect(screen.getByRole("heading", { name: "How to choose" })).toBeInTheDocument();
  });

  it("renders the exact approved body copy", () => {
    render(<PackageComparisonCue />);
    expect(
      screen.getByText(
        "The three packages differ in how much of the bathroom you want to change. Read the per-package summaries below to see which fits your project."
      )
    ).toBeInTheDocument();
  });

  it("does not mention Essential, Balanced, or Premium", () => {
    const { container } = render(<PackageComparisonCue />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Essential/);
    expect(text).not.toMatch(/Balanced/);
    expect(text).not.toMatch(/Premium/);
  });

  it("does not introduce restricted ranking/recommendation terms", () => {
    const { container } = render(<PackageComparisonCue />);
    const text = (container.textContent ?? "").toLowerCase();
    [
      "recommended",
      "most popular",
      "best for",
      "best value",
      "guaranteed",
      "savings",
      "roi",
      "popular",
      "bobox recommends",
      "make decisions",
      "default",
      "popular choice",
    ].forEach((term) => {
      expect(text).not.toContain(term);
    });
  });
});
