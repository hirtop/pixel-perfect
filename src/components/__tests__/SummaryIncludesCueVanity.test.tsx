import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SummaryIncludesCue from "../SummaryIncludesCue";
import {
  getPrimaryVanityForTier,
  type CuratedVanityTier,
} from "@/data/curatedVanities";

const TIERS: CuratedVanityTier[] = ["essential", "balanced", "premium"];

const APPROVED_CAVEAT =
  "Countertop and sink included with vanity. Faucet included in this package.";
const OLD_CAVEAT = "Faucet selected separately";

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
  "faucet not included",
];

describe("SummaryIncludesCue — Phase 1C vanity surfacing", () => {
  it("does not render vanity block when tier is missing", () => {
    render(<SummaryIncludesCue />);
    expect(screen.queryByTestId("summary-includes-vanity")).toBeNull();
  });

  it("renders heading 'Vanity in this package' exactly once", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const headings = screen.getAllByRole("heading", {
      name: /vanity in this package/i,
    });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Vanity in this package");
  });

  it.each(TIERS)("renders the primary vanity for tier %s", (tier) => {
    render(<SummaryIncludesCue tier={tier} />);
    const primary = getPrimaryVanityForTier(tier)!;
    const block = screen.getByTestId("summary-includes-vanity");
    const text = block.textContent || "";
    expect(text).toContain(primary.cleanedDisplayName);
    expect(text).toContain(`Finish: ${primary.colorFinish}`);
    expect(text).toContain(`Countertop: ${primary.countertopMaterial}`);
    expect(text).toContain("Sink:");
    expect(text).toContain(APPROVED_CAVEAT);
  });

  it("renders image with imageUrl when available", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const primary = getPrimaryVanityForTier("balanced")!;
    const img = screen.getByAltText(primary.cleanedDisplayName) as HTMLImageElement;
    expect(img.src).toBe(primary.imageUrl);
  });

  it("falls back to placeholder text when image errors", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const primary = getPrimaryVanityForTier("balanced")!;
    const img = screen.getByAltText(primary.cleanedDisplayName);
    fireEvent.error(img);
    expect(
      screen.getByTestId("summary-includes-vanity-image-fallback"),
    ).toBeInTheDocument();
  });

  it("does not render price, URL, retailer, SKU, or backups", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const block = screen.getByTestId("summary-includes-vanity");
    const text = block.textContent || "";
    const primary = getPrimaryVanityForTier("balanced")!;
    expect(text).not.toContain(String(primary.priceUSD));
    expect(text).not.toContain(String(primary.priceUSDObserved));
    expect(text).not.toContain(String(primary.priceUSDRegular));
    expect(text).not.toContain(primary.retailer);
    if (primary.sku) expect(text).not.toContain(primary.sku);
    if (primary.modelNumber) expect(text).not.toContain(primary.modelNumber);
    expect(text).not.toContain(primary.priceCapturedDate);
    expect(text).not.toContain(primary.qualityNotes);
    expect(text).not.toContain(primary.whyFitsThisTier);
    expect(text).not.toContain(primary.replacementReason);
    expect(text).not.toContain(primary.caveats);
    // No anchors / outbound links
    expect(block.querySelectorAll("a").length).toBe(0);
    if (primary.productUrl) expect(text).not.toContain(primary.productUrl);
  });

  it("does not contain forbidden customer-visible copy", () => {
    render(<SummaryIncludesCue tier="premium" />);
    const block = screen.getByTestId("summary-includes-vanity");
    const text = (block.textContent || "").toLowerCase();
    for (const phrase of FORBIDDEN) {
      expect(text, `forbidden phrase "${phrase}"`).not.toContain(phrase);
    }
    // standalone "best"
    expect(/\bbest\b/i.test(text)).toBe(false);
  });
});
