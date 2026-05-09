import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import SummaryIncludesCue from "../SummaryIncludesCue";
import {
  getPrimaryFaucetForTier,
  type CuratedFaucetTier,
} from "@/data/curatedFaucets";

const TIERS: CuratedFaucetTier[] = ["essential", "balanced", "premium"];

const EXPECTED_NAMES: Record<CuratedFaucetTier, string> = {
  essential: "Delta Modern Single-Hole Bathroom Faucet, Chrome",
  balanced: "Delta Trinsic Single-Hole Bathroom Faucet, Matte Black",
  premium:
    "Kohler Purist 8-in. Widespread Low-Arc Bathroom Faucet, Polished Chrome",
};

const FORBIDDEN = [
  "recommended",
  "most popular",
  "best value",
  "guaranteed",
  "savings",
  "roi",
  "final quote",
  "fixed quote",
  "contractor-approved",
  "ready to build",
  "layout flexibility",
  "layout modification",
  "rethink the layout",
  "custom",
  "bespoke",
  "made-to-order",
  "build-to-order",
  "premium-grade",
  "top choice",
  "top-rated",
  "popular",
  "default",
  "matched to",
  " fits ",
  "compatible with",
  "designed for",
  "selected for this package",
  "shown as the package",
  "chosen to match",
  "faucet selected separately",
];

describe("SummaryIncludesCue — Phase 2B faucet surfacing", () => {
  it("does not render faucet block when tier is missing", () => {
    render(<SummaryIncludesCue />);
    expect(screen.queryByTestId("summary-includes-faucet")).toBeNull();
  });

  it("renders heading 'Faucet in this package' exactly once", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const headings = screen.getAllByRole("heading", {
      name: /faucet in this package/i,
    });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Faucet in this package");
  });

  it.each(TIERS)("renders the primary faucet for tier %s", (tier) => {
    render(<SummaryIncludesCue tier={tier} />);
    const faucet = getPrimaryFaucetForTier(tier)!;
    const block = screen.getByTestId("summary-includes-faucet");
    const text = block.textContent || "";
    expect(faucet.cleanedDisplayName).toBe(EXPECTED_NAMES[tier]);
    expect(text).toContain(EXPECTED_NAMES[tier]);
    expect(text).toContain(`Finish: ${faucet.finish}`);
  });

  it("renders derived faucet type label (single-hole)", () => {
    render(<SummaryIncludesCue tier="essential" />);
    const block = screen.getByTestId("summary-includes-faucet");
    expect(within(block).getByText("Single-hole faucet")).toBeInTheDocument();
  });

  it("renders derived faucet type label (widespread)", () => {
    render(<SummaryIncludesCue tier="premium" />);
    const block = screen.getByTestId("summary-includes-faucet");
    expect(within(block).getByText("Widespread faucet")).toBeInTheDocument();
  });

  it("renders image with imageUrl when available", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const faucet = getPrimaryFaucetForTier("balanced")!;
    const block = screen.getByTestId("summary-includes-faucet");
    const img = within(block).getByAltText(
      faucet.cleanedDisplayName,
    ) as HTMLImageElement;
    expect(img.src).toBe(faucet.imageUrl);
  });

  it("falls back to placeholder text when image errors", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const faucet = getPrimaryFaucetForTier("balanced")!;
    const block = screen.getByTestId("summary-includes-faucet");
    const img = within(block).getByAltText(faucet.cleanedDisplayName);
    fireEvent.error(img);
    expect(
      screen.getByTestId("summary-includes-faucet-image-fallback"),
    ).toBeInTheDocument();
  });

  it("faucet block sits directly below vanity block", () => {
    const { container } = render(<SummaryIncludesCue tier="balanced" />);
    const vanity = container.querySelector(
      '[data-testid="summary-includes-vanity"]',
    );
    const faucet = container.querySelector(
      '[data-testid="summary-includes-faucet"]',
    );
    expect(vanity).toBeTruthy();
    expect(faucet).toBeTruthy();
    expect(
      vanity!.compareDocumentPosition(faucet!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("does not render price, URL, retailer, SKU, model, or backups", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const block = screen.getByTestId("summary-includes-faucet");
    const text = block.textContent || "";
    const faucet = getPrimaryFaucetForTier("balanced")!;
    expect(text).not.toContain(String(faucet.priceUSDObserved));
    expect(text).not.toContain(String(faucet.priceUSDRegular));
    expect(text).not.toContain(faucet.retailer);
    if (faucet.sku) expect(text).not.toContain(faucet.sku);
    if (faucet.modelNumber) expect(text).not.toContain(faucet.modelNumber);
    expect(text).not.toContain(faucet.productUrl);
    if (faucet.warrantyText) expect(text).not.toContain(faucet.warrantyText);
    if (faucet.qualityNotes) expect(text).not.toContain(faucet.qualityNotes);
    if (faucet.whyFitsThisTier)
      expect(text).not.toContain(faucet.whyFitsThisTier);
    if (faucet.replacementReason)
      expect(text).not.toContain(faucet.replacementReason);
    if (faucet.caveats) expect(text).not.toContain(faucet.caveats);
    expect(block.querySelectorAll("a").length).toBe(0);
    // No spec leakage
    expect(text).not.toContain("GPM");
    expect(text).not.toContain("hole pattern");
  });

  it("renders only one faucet block (no backups)", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    expect(screen.getAllByTestId("summary-includes-faucet")).toHaveLength(1);
  });

  it("does not contain forbidden customer-visible copy", () => {
    for (const tier of TIERS) {
      const { unmount, container } = render(
        <SummaryIncludesCue tier={tier} />,
      );
      const text = (container.textContent || "").toLowerCase();
      for (const phrase of FORBIDDEN) {
        expect(text, `tier=${tier} forbidden="${phrase}"`).not.toContain(
          phrase,
        );
      }
      unmount();
    }
  });

  it("renders updated vanity caveat (faucet and floor tile included)", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    expect(
      screen.getByText(
        "Countertop and sink included with vanity. Faucet and floor tile included in this package.",
      ),
    ).toBeInTheDocument();
  });
});
