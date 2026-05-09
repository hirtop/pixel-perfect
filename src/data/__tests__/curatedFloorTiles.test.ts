import { describe, it, expect } from "vitest";
import {
  curatedFloorTiles,
  getCuratedFloorTilesByTier,
  getPrimaryFloorTileForTier,
  getBackupFloorTilesForTier,
  isApprovedFloorTileRetailerUrl,
  isApprovedFloorTileSpecSourceUrl,
  TIER_PRICE_BANDS,
  TILE_MATERIAL_VALUES,
  TILE_LOOK_VALUES,
  TILE_FINISH_VALUES,
  APPROVED_FLOOR_TILE_RETAILER_DOMAINS_LIST,
  APPROVED_FLOOR_TILE_SPEC_SOURCE_DOMAINS_LIST,
  type CuratedFloorTileTier,
  type CuratedFloorTile,
} from "../curatedFloorTiles";

const TIERS: CuratedFloorTileTier[] = ["essential", "balanced", "premium"];

const APPROVED_RETAILERS = [
  "Home Depot",
  "Lowes",
  "Lowe's",
  "Floor & Decor",
  "TileBar",
];

const FORBIDDEN_PHRASES = [
  "luxury",
  "designer",
  "premium-grade",
  "professional-grade",
  "recommended",
  "guaranteed",
  "savings",
  "roi",
  "contractor-approved",
  "ready to build",
  "lifetime",
  "iconic",
  "curated",
  "custom",
  "more durable",
  "longer-lasting",
  "better value",
  "great price",
  "deal",
];
const FORBIDDEN_WORD_REGEXES = [/\bbest\b/i];

const COPY_FIELDS: (keyof CuratedFloorTile)[] = [
  "cleanedDisplayName",
  "qualityNotes",
  "whyFitsThisTier",
  "replacementReason",
  "caveats",
  "installationNotes",
  "maintenanceNotes",
];

describe("curatedFloorTiles — structure", () => {
  it("has exactly 9 entries", () => {
    expect(curatedFloorTiles).toHaveLength(9);
  });

  it("has 3 entries per tier with 1 primary + 1 backup1 + 1 backup2", () => {
    for (const tier of TIERS) {
      const rows = getCuratedFloorTilesByTier(tier);
      expect(rows).toHaveLength(3);
      expect(rows.map((r) => r.binRole).sort()).toEqual([
        "backup1",
        "backup2",
        "primary",
      ]);
    }
  });

  it("selectors return correct entries", () => {
    for (const tier of TIERS) {
      const p = getPrimaryFloorTileForTier(tier);
      expect(p).toBeDefined();
      expect(p!.binRole).toBe("primary");
      expect(p!.tier).toBe(tier);
      const backups = getBackupFloorTilesForTier(tier);
      expect(backups).toHaveLength(2);
      expect(backups.every((b) => b.binRole !== "primary")).toBe(true);
    }
  });

  it("ids are unique", () => {
    const ids = curatedFloorTiles.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("productUrls are unique", () => {
    const urls = curatedFloorTiles.map((t) => t.productUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("curatedFloorTiles — required fields & shape", () => {
  it.each(curatedFloorTiles)("$id has correct fixed shape", (t) => {
    expect(t.style).toBe("modern");
    expect(t.category).toBe("mainFloorTile");
    expect(t.isRealProduct).toBe(true);
    expect(t.isPlaceholder).toBe(false);
    expect(t.productUrl.startsWith("https://")).toBe(true);
    expect(t.imageUrl.startsWith("https://")).toBe(true);
    expect(t.specSourceUrl.startsWith("https://")).toBe(true);
    expect(t.priceCapturedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(t.productName.trim().length).toBeGreaterThan(0);
    expect(t.cleanedDisplayName.trim().length).toBeGreaterThan(0);
    expect(t.brand.trim().length).toBeGreaterThan(0);
    expect(t.sku.trim().length).toBeGreaterThan(0);
    expect(t.modelNumber.trim().length).toBeGreaterThan(0);
    expect(t.priceComputationNotes.trim().length).toBeGreaterThan(0);
    expect(typeof t.priceUSDObserved).toBe("number");
    expect(typeof t.priceUSDRegular).toBe("number");
    expect(typeof t.pricePerSqFtObserved).toBe("number");
    expect(typeof t.pricePerSqFtRegular).toBe("number");
    expect(t.priceUSDObserved).toBeLessThanOrEqual(t.priceUSDRegular);
    expect(t.pricePerSqFtObserved).toBeLessThanOrEqual(t.pricePerSqFtRegular);
    expect(TILE_MATERIAL_VALUES).toContain(t.tileMaterial);
    expect(TILE_LOOK_VALUES).toContain(t.tileLook);
    expect(TILE_FINISH_VALUES).toContain(t.finish);
    expect(t.colorFamily.trim().length).toBeGreaterThan(0);
    expect(t.dimensions.trim().length).toBeGreaterThan(0);
    expect(t.indoorFloorRated).toBe(true);
    expect([true, "evidence"]).toContain(t.bathroomFloorRated);
    expect(t.bathroomFloorRatingEvidence.trim().length).toBeGreaterThan(0);
    expect([true, false, "unknown"]).toContain(t.rectified);
    expect([true, false, "unknown"]).toContain(t.frostResistant);
  });

  it("pricePerSqFtObserved is within tier band", () => {
    for (const t of curatedFloorTiles) {
      const band = TIER_PRICE_BANDS[t.tier];
      expect(t.pricePerSqFtObserved).toBeGreaterThanOrEqual(band.min);
      expect(t.pricePerSqFtObserved).toBeLessThanOrEqual(band.max);
    }
  });

  it("computed-from-box prices include sqFtPerBox and a computation note", () => {
    for (const t of curatedFloorTiles) {
      const note = t.priceComputationNotes.toLowerCase();
      if (note.includes("box price")) {
        expect(t.sqFtPerBox).not.toBeNull();
        expect(typeof t.sqFtPerBox).toBe("number");
      }
    }
  });
});

describe("curatedFloorTiles — retailer / source", () => {
  it("all productUrls are on approved retailer domains", () => {
    for (const t of curatedFloorTiles) {
      expect(isApprovedFloorTileRetailerUrl(t.productUrl)).toBe(true);
    }
  });

  it("all specSourceUrl values are on approved retailer or manufacturer domains", () => {
    for (const t of curatedFloorTiles) {
      expect(isApprovedFloorTileSpecSourceUrl(t.specSourceUrl)).toBe(true);
    }
  });

  it("retailer field is one of the approved retailers", () => {
    for (const t of curatedFloorTiles) {
      expect(APPROVED_RETAILERS).toContain(t.retailer);
    }
  });

  it("isApprovedFloorTileRetailerUrl rejects unapproved domains", () => {
    expect(
      isApprovedFloorTileRetailerUrl("https://www.homedepot.com/p/x"),
    ).toBe(true);
    expect(isApprovedFloorTileRetailerUrl("https://lowes.com/pd/x")).toBe(true);
    expect(
      isApprovedFloorTileRetailerUrl("https://www.flooranddecor.com/x"),
    ).toBe(true);
    expect(isApprovedFloorTileRetailerUrl("https://tilebar.com/x")).toBe(true);
    expect(isApprovedFloorTileRetailerUrl("https://daltile.com/x")).toBe(false);
    expect(isApprovedFloorTileRetailerUrl("https://amazon.com/x")).toBe(false);
    expect(isApprovedFloorTileRetailerUrl("not-a-url")).toBe(false);
  });

  it("approved domain lists expose expected hosts", () => {
    expect(APPROVED_FLOOR_TILE_RETAILER_DOMAINS_LIST).toEqual([
      "homedepot.com",
      "lowes.com",
      "flooranddecor.com",
      "tilebar.com",
    ]);
    for (const d of APPROVED_FLOOR_TILE_RETAILER_DOMAINS_LIST) {
      expect(APPROVED_FLOOR_TILE_SPEC_SOURCE_DOMAINS_LIST).toContain(d);
    }
    for (const d of ["daltile.com", "msisurfaces.com", "bedrosians.com"]) {
      expect(APPROVED_FLOOR_TILE_SPEC_SOURCE_DOMAINS_LIST).toContain(d);
    }
  });
});

describe("curatedFloorTiles — material and floor-rating rules", () => {
  it("tileMaterial is porcelain or ceramic only (no stone/glass/vinyl)", () => {
    for (const t of curatedFloorTiles) {
      expect(["porcelain", "ceramic"]).toContain(t.tileMaterial);
    }
  });

  it("no entry mentions natural stone, marble (real), travertine, slate, glass, or vinyl as the body", () => {
    const FORBIDDEN_MATERIALS = [
      "natural stone",
      "travertine",
      "slate body",
      "limestone",
      "glass tile",
      "vinyl",
      "lvp",
      "lvt",
    ];
    for (const t of curatedFloorTiles) {
      const haystack = (
        t.productName +
        " " +
        t.cleanedDisplayName +
        " " +
        t.qualityNotes
      ).toLowerCase();
      for (const word of FORBIDDEN_MATERIALS) {
        expect(haystack.includes(word), `${t.id} contains "${word}"`).toBe(
          false,
        );
      }
    }
  });

  it("no wall-only / shower-wall-only / accent-only / backsplash-only tiles", () => {
    const FORBIDDEN_CATEGORIES = [
      "wall-only",
      "wall only",
      "shower wall only",
      "accent only",
      "backsplash only",
    ];
    for (const t of curatedFloorTiles) {
      const haystack = (
        t.retailerCategory +
        " " +
        t.productName +
        " " +
        t.cleanedDisplayName
      ).toLowerCase();
      for (const word of FORBIDDEN_CATEGORIES) {
        expect(haystack.includes(word)).toBe(false);
      }
    }
  });

  it("all entries are indoor floor-rated and bathroom-suitable", () => {
    for (const t of curatedFloorTiles) {
      expect(t.indoorFloorRated).toBe(true);
      expect([true, "evidence"]).toContain(t.bathroomFloorRated);
      if (t.bathroomFloorRated !== true) {
        expect(t.bathroomFloorRatingEvidence.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("polished finishes require slip-resistance or strong floor-suitability evidence", () => {
    for (const t of curatedFloorTiles) {
      if (t.finish === "polished") {
        const hasSlip =
          t.slipResistanceRating !== null &&
          t.slipResistanceRating.trim().length > 0;
        const evidence = t.bathroomFloorRatingEvidence.toLowerCase();
        const hasEvidence =
          evidence.includes("bathroom") || evidence.includes("wet");
        expect(
          hasSlip || hasEvidence,
          `${t.id} polished but lacks slip rating or bathroom/wet evidence`,
        ).toBe(true);
      }
    }
  });
});

describe("curatedFloorTiles — Premium look diversity", () => {
  it("Premium tier does not have all 3 marble-look SKUs", () => {
    const premium = getCuratedFloorTilesByTier("premium");
    const marbleLook = premium.filter((t) => t.tileLook === "marble-look");
    expect(marbleLook.length).toBeLessThan(3);
  });

  it("Premium backup2 is not marble-look", () => {
    const backups = getBackupFloorTilesForTier("premium");
    const backup2 = backups.find((b) => b.binRole === "backup2");
    expect(backup2).toBeDefined();
    expect(backup2!.tileLook).not.toBe("marble-look");
  });

  it("at least 4 distinct brands across the 9 SKUs", () => {
    const brands = new Set(curatedFloorTiles.map((t) => t.brand));
    expect(brands.size).toBeGreaterThanOrEqual(4);
  });

  it("at least 3 distinct retailers across the 9 SKUs", () => {
    const retailers = new Set(curatedFloorTiles.map((t) => t.retailer));
    expect(retailers.size).toBeGreaterThanOrEqual(3);
  });
});

describe("curatedFloorTiles — forbidden BOBOX-facing copy", () => {
  it("no forbidden phrases in copy fields", () => {
    for (const t of curatedFloorTiles) {
      for (const field of COPY_FIELDS) {
        const text = String(t[field] ?? "").toLowerCase();
        for (const phrase of FORBIDDEN_PHRASES) {
          expect(
            text.includes(phrase),
            `floor tile ${t.id} field "${String(field)}" contains "${phrase}"`,
          ).toBe(false);
        }
        for (const re of FORBIDDEN_WORD_REGEXES) {
          expect(
            re.test(text),
            `floor tile ${t.id} field "${String(field)}" matches ${re}`,
          ).toBe(false);
        }
      }
    }
  });
});
