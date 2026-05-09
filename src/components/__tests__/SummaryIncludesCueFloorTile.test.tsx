import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import SummaryIncludesCue, {
  getFloorTileLookMaterialLabel,
  getFloorTileSizeLabel,
  getFloorTileFinishLabel,
} from "../SummaryIncludesCue";
import {
  getPrimaryFloorTileForTier,
  type CuratedFloorTileTier,
} from "@/data/curatedFloorTiles";

const TIERS: CuratedFloorTileTier[] = ["essential", "balanced", "premium"];

const EXPECTED: Record<
  CuratedFloorTileTier,
  { name: string; lookMat: string; size: string; finish: string }
> = {
  essential: {
    name: "MSI Aria Ice 12x24 Matte Porcelain",
    lookMat: "Stone-look porcelain",
    size: "12 \u00D7 24 in.",
    finish: "Matte finish",
  },
  balanced: {
    name: "MSI Praia White 12x24 Matte Porcelain",
    lookMat: "Marble-look porcelain",
    size: "12 \u00D7 24 in.",
    finish: "Matte finish",
  },
  premium: {
    name: "Daltile Marble Attaché Lavish Statuary 24x24 Matte Porcelain",
    lookMat: "Marble-look porcelain",
    size: "24 \u00D7 24 in.",
    finish: "Matte finish",
  },
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
  "rethink the layout",
  "bespoke",
  "made-to-order",
  "build-to-order",
  "premium-grade",
  "top choice",
  "top-rated",
  "luxury",
  "designer",
  "iconic",
  "curated",
  "great price",
  "more durable",
  "longer-lasting",
  "better value",
  "matched to",
  "compatible with",
  "designed for",
  " covers ",
  "approximately",
  "with proper installation",
  "main floor tile",
  "bathroom floor tile",
  "floor tile selection",
  "shown as",
  "used for",
  "home depot",
  "lowe's",
  "lowes",
  "floor & decor",
  "floor and decor",
  "tilebar",
  "tile bar",
  "pei",
  "dcof",
  " cof ",
  "rectified",
  "sq ft",
  "thickness",
  "stone-look",
];
// Note: "stone-look" is allowed as part of the look label "Stone-look porcelain";
// remove from forbidden because it appears intentionally for essential tier.
const FORBIDDEN_FILTERED = FORBIDDEN.filter((p) => p !== "stone-look");

describe("SummaryIncludesCue — Phase 3B floor tile surfacing", () => {
  it("does not render floor tile block when tier is missing", () => {
    render(<SummaryIncludesCue />);
    expect(screen.queryByTestId("summary-includes-floor-tile")).toBeNull();
  });

  it("renders heading 'Floor tile in this package' exactly once", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const headings = screen.getAllByRole("heading", {
      name: /floor tile in this package/i,
    });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Floor tile in this package");
  });

  it.each(TIERS)("renders the primary floor tile for tier %s", (tier) => {
    render(<SummaryIncludesCue tier={tier} />);
    const tile = getPrimaryFloorTileForTier(tier)!;
    const block = screen.getByTestId("summary-includes-floor-tile");
    const text = block.textContent || "";
    expect(tile.cleanedDisplayName).toBe(EXPECTED[tier].name);
    expect(text).toContain(EXPECTED[tier].name);
    expect(text).toContain(EXPECTED[tier].lookMat);
    expect(text).toContain(EXPECTED[tier].size);
    expect(text).toContain(EXPECTED[tier].finish);
  });

  it("size label uses U+00D7 multiplication sign with spaces and period", () => {
    render(<SummaryIncludesCue tier="essential" />);
    const block = screen.getByTestId("summary-includes-floor-tile");
    expect(block.textContent).toContain("12 \u00D7 24 in.");
  });

  it("renders image with imageUrl when available", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const tile = getPrimaryFloorTileForTier("balanced")!;
    const block = screen.getByTestId("summary-includes-floor-tile");
    const img = within(block).getByAltText(
      tile.cleanedDisplayName,
    ) as HTMLImageElement;
    expect(img.src).toBe(tile.imageUrl);
  });

  it("falls back to placeholder text when image errors", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const tile = getPrimaryFloorTileForTier("balanced")!;
    const block = screen.getByTestId("summary-includes-floor-tile");
    const img = within(block).getByAltText(tile.cleanedDisplayName);
    fireEvent.error(img);
    const fallback = screen.getByTestId(
      "summary-includes-floor-tile-image-fallback",
    );
    expect(fallback).toBeInTheDocument();
    expect(fallback.textContent).toBe("Floor tile image unavailable.");
  });

  it("floor tile block sits directly below faucet block", () => {
    const { container } = render(<SummaryIncludesCue tier="balanced" />);
    const faucet = container.querySelector(
      '[data-testid="summary-includes-faucet"]',
    );
    const tile = container.querySelector(
      '[data-testid="summary-includes-floor-tile"]',
    );
    expect(faucet).toBeTruthy();
    expect(tile).toBeTruthy();
    expect(
      faucet!.compareDocumentPosition(tile!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders only one floor tile block (no backups)", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    expect(screen.getAllByTestId("summary-includes-floor-tile")).toHaveLength(
      1,
    );
  });

  it("does not render price, URL, retailer, SKU, model, or specs", () => {
    render(<SummaryIncludesCue tier="balanced" />);
    const block = screen.getByTestId("summary-includes-floor-tile");
    const text = block.textContent || "";
    const tile = getPrimaryFloorTileForTier("balanced")!;
    expect(text).not.toContain(String(tile.priceUSDObserved));
    expect(text).not.toContain(String(tile.priceUSDRegular));
    expect(text).not.toContain(String(tile.pricePerSqFtObserved));
    expect(text).not.toContain(tile.retailer);
    if (tile.sku) expect(text).not.toContain(tile.sku);
    if (tile.modelNumber) expect(text).not.toContain(tile.modelNumber);
    expect(text).not.toContain(tile.productUrl);
    if (tile.qualityNotes) expect(text).not.toContain(tile.qualityNotes);
    if (tile.whyFitsThisTier)
      expect(text).not.toContain(tile.whyFitsThisTier);
    if (tile.replacementReason)
      expect(text).not.toContain(tile.replacementReason);
    if (tile.caveats) expect(text).not.toContain(tile.caveats);
    if (tile.installationNotes)
      expect(text).not.toContain(tile.installationNotes);
    if (tile.maintenanceNotes)
      expect(text).not.toContain(tile.maintenanceNotes);
    expect(block.querySelectorAll("a").length).toBe(0);
  });

  it("does not contain forbidden customer-visible copy", () => {
    for (const tier of TIERS) {
      const { unmount, container } = render(
        <SummaryIncludesCue tier={tier} />,
      );
      const text = (container.textContent || "").toLowerCase();
      for (const phrase of FORBIDDEN_FILTERED) {
        expect(text, `tier=${tier} forbidden="${phrase}"`).not.toContain(
          phrase,
        );
      }
      unmount();
    }
  });

  it("renders all three product blocks in order: vanity → faucet → floor tile", () => {
    const { container } = render(<SummaryIncludesCue tier="premium" />);
    const ids = Array.from(
      container.querySelectorAll(
        '[data-testid^="summary-includes-"][data-testid$="vanity"], [data-testid="summary-includes-faucet"], [data-testid="summary-includes-floor-tile"]',
      ),
    ).map((n) => n.getAttribute("data-testid"));
    expect(ids).toEqual([
      "summary-includes-vanity",
      "summary-includes-faucet",
      "summary-includes-floor-tile",
    ]);
  });
});

describe("SummaryIncludesCue — floor tile display label helpers", () => {
  it("look/material label mapping", () => {
    expect(getFloorTileLookMaterialLabel("stone-look", "porcelain")).toBe(
      "Stone-look porcelain",
    );
    expect(getFloorTileLookMaterialLabel("marble-look", "porcelain")).toBe(
      "Marble-look porcelain",
    );
    expect(getFloorTileLookMaterialLabel("concrete-look", "porcelain")).toBe(
      "Concrete-look porcelain",
    );
    expect(getFloorTileLookMaterialLabel("wood-look", "porcelain")).toBe(
      "Wood-look porcelain",
    );
    expect(getFloorTileLookMaterialLabel("terrazzo-look", "porcelain")).toBe(
      "Terrazzo-look porcelain",
    );
    expect(getFloorTileLookMaterialLabel("solid", "porcelain")).toBe(
      "Porcelain",
    );
    expect(getFloorTileLookMaterialLabel("patterned", "porcelain")).toBe(
      "Patterned porcelain",
    );
    expect(getFloorTileLookMaterialLabel("stone-look", "ceramic")).toBe(
      "Stone-look ceramic",
    );
    expect(getFloorTileLookMaterialLabel("concrete-look", "ceramic")).toBe(
      "Concrete-look ceramic",
    );
    expect(getFloorTileLookMaterialLabel("solid", "ceramic")).toBe("Ceramic");
    expect(getFloorTileLookMaterialLabel("unknown", "porcelain")).toBe(
      "Porcelain",
    );
    expect(getFloorTileLookMaterialLabel("unknown", "ceramic")).toBe("Ceramic");
  });

  it("size label normalization to '12 × 24 in.'", () => {
    expect(getFloorTileSizeLabel("12 in. x 24 in.")).toBe("12 \u00D7 24 in.");
    expect(getFloorTileSizeLabel("12x24")).toBe("12 \u00D7 24 in.");
    expect(getFloorTileSizeLabel("12 x 24")).toBe("12 \u00D7 24 in.");
    expect(getFloorTileSizeLabel("24 in. x 48 in.")).toBe(
      "24 \u00D7 48 in.",
    );
  });

  it("finish label mapping", () => {
    expect(getFloorTileFinishLabel("matte")).toBe("Matte finish");
    expect(getFloorTileFinishLabel("honed")).toBe("Honed finish");
    expect(getFloorTileFinishLabel("textured")).toBe("Textured finish");
    expect(getFloorTileFinishLabel("lappato")).toBe("Polished matte finish");
    expect(getFloorTileFinishLabel("polished")).toBe("Polished finish");
  });
});
