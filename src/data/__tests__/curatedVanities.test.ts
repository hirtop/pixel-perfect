import { describe, it, expect } from "vitest";
import {
  curatedVanities,
  getCuratedVanitiesByTier,
  getPrimaryVanityForTier,
  getBackupVanitiesForTier,
  isApprovedRetailerUrl,
  TIER_PRICE_BANDS,
  SINK_TYPE_VALUES,
  FAUCET_HOLE_PATTERN_VALUES,
  type CuratedVanityTier,
} from "../curatedVanities";

const TIERS: CuratedVanityTier[] = ["essential", "balanced", "premium"];

const FORBIDDEN_PHRASES = [
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
  "custom layout",
  "custom-build",
  "custom vanity",
  "bespoke",
  "made-to-order",
  "build-to-order",
  "premium-grade",
  "custom",
];

const BEST_REGEX = /\bbest\b/i;

describe("curatedVanities — structure", () => {
  it("has exactly 9 entries", () => {
    expect(curatedVanities).toHaveLength(9);
  });

  it("has exactly 3 entries per tier with 1 primary + 1 backup1 + 1 backup2", () => {
    for (const tier of TIERS) {
      const rows = getCuratedVanitiesByTier(tier);
      expect(rows).toHaveLength(3);
      const roles = rows.map((r) => r.binRole).sort();
      expect(roles).toEqual(["backup1", "backup2", "primary"]);
    }
  });

  it("getPrimaryVanityForTier returns one primary per tier", () => {
    for (const tier of TIERS) {
      const p = getPrimaryVanityForTier(tier);
      expect(p).toBeDefined();
      expect(p!.binRole).toBe("primary");
      expect(p!.tier).toBe(tier);
    }
  });

  it("getBackupVanitiesForTier returns 2 backups per tier", () => {
    for (const tier of TIERS) {
      const backups = getBackupVanitiesForTier(tier);
      expect(backups).toHaveLength(2);
      expect(backups.every((b) => b.binRole !== "primary")).toBe(true);
    }
  });

  it("ids are unique", () => {
    const ids = curatedVanities.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("productUrls are unique", () => {
    const urls = curatedVanities.map((v) => v.productUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("curatedVanities — required fields", () => {
  it.each(curatedVanities)("$id has correct fixed shape", (v) => {
    expect(v.style).toBe("modern");
    expect(v.category).toBe("vanity");
    expect(v.widthInches).toBe(36);
    expect(v.countertopIncluded).toBe(true);
    expect(v.sinkIncluded).toBe(true);
    expect(v.countertopMaterial.trim().length).toBeGreaterThan(0);
    expect(SINK_TYPE_VALUES).toContain(v.sinkType);
    expect(FAUCET_HOLE_PATTERN_VALUES).toContain(v.faucetHolePattern);
    expect([true, false, "unknown"]).toContain(v.faucetIncluded);
    expect(v.priceCapturedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(v.productName.trim().length).toBeGreaterThan(0);
    expect(v.cleanedDisplayName.trim().length).toBeGreaterThan(0);
    expect(v.brand.trim().length).toBeGreaterThan(0);
    expect(v.retailer.trim().length).toBeGreaterThan(0);
    expect(typeof v.priceUSD).toBe("number");
    expect(typeof v.priceUSDObserved).toBe("number");
    expect(typeof v.priceUSDRegular).toBe("number");
    expect(v.priceUSD).toBe(v.priceUSDObserved);
    expect(v.colorFinish.trim().length).toBeGreaterThan(0);
    expect(Array.isArray(v.styleTags)).toBe(true);
    expect(typeof v.isRealProduct).toBe("boolean");
    expect(typeof v.isPlaceholder).toBe("boolean");
    expect(v.imageLicense).toBeTruthy();
  });

  it("observed price falls within tier band for every entry", () => {
    for (const v of curatedVanities) {
      const band = TIER_PRICE_BANDS[v.tier];
      expect(v.priceUSDObserved).toBeGreaterThanOrEqual(band.min);
      expect(v.priceUSDObserved).toBeLessThanOrEqual(band.max);
    }
  });

  it("if observed < regular, caveats mention sale and regular price", () => {
    for (const v of curatedVanities) {
      if (v.priceUSDObserved < v.priceUSDRegular) {
        const c = v.caveats.toLowerCase();
        expect(c).toMatch(/sale/);
        expect(c).toMatch(/regular/);
      }
    }
  });

  it("all entries are real verified products with approved retailer URLs and image URLs", () => {
    for (const v of curatedVanities) {
      expect(v.isRealProduct).toBe(true);
      expect(v.isPlaceholder).toBe(false);
      expect(v.productUrl).toBeTruthy();
      expect(v.imageUrl).toBeTruthy();
      expect(isApprovedRetailerUrl(v.productUrl as string)).toBe(true);
    }
  });

  it("no placeholder slots remain", () => {
    expect(curatedVanities.some((v) => v.isPlaceholder)).toBe(false);
    expect(curatedVanities.every((v) => v.isRealProduct)).toBe(true);
  });
});

describe("curatedVanities — countertop/sink validation", () => {
  it("no entry mentions 'sold separately' in caveats", () => {
    for (const v of curatedVanities) {
      expect(v.caveats.toLowerCase()).not.toContain("sold separately");
    }
  });
});

describe("curatedVanities — tier diversity", () => {
  it("Essential is not three Bilston entries", () => {
    const essential = getCuratedVanitiesByTier("essential");
    const bilstonCount = essential.filter((v) =>
      v.productName.toLowerCase().includes("bilston"),
    ).length;
    expect(bilstonCount).toBeLessThan(3);
  });

  it("Essential has at least one non-Bilston backup", () => {
    const backups = getBackupVanitiesForTier("essential");
    const hasNonBilston = backups.some(
      (v) => !v.productName.toLowerCase().includes("bilston"),
    );
    expect(hasNonBilston).toBe(true);
  });

  it("Premium is not three James Martin warm-wood SKUs", () => {
    const premium = getCuratedVanitiesByTier("premium");
    const jmCount = premium.filter((v) =>
      v.brand.toLowerCase().includes("james martin"),
    ).length;
    expect(jmCount).toBeLessThan(3);
  });

  it("Premium has at least one non-James-Martin entry providing palette diversity", () => {
    const premium = getCuratedVanitiesByTier("premium");
    const hasOther = premium.some(
      (v) => !v.brand.toLowerCase().includes("james martin"),
    );
    expect(hasOther).toBe(true);
  });
});

describe("curatedVanities — forbidden BOBOX-facing copy", () => {
  const fields: (keyof typeof curatedVanities[number])[] = [
    "productName",
    "cleanedDisplayName",
    "qualityNotes",
    "whyFitsThisTier",
    "replacementReason",
    "caveats",
    "storageNotes",
  ];

  it("no forbidden phrases appear in BOBOX-facing fields", () => {
    for (const v of curatedVanities) {
      for (const f of fields) {
        const text = String(v[f] ?? "").toLowerCase();
        for (const phrase of FORBIDDEN_PHRASES) {
          expect(
            text.includes(phrase),
            `vanity ${v.id} field "${String(f)}" contains forbidden phrase "${phrase}"`,
          ).toBe(false);
        }
        expect(
          BEST_REGEX.test(text),
          `vanity ${v.id} field "${String(f)}" contains forbidden word "best"`,
        ).toBe(false);
      }
    }
  });
});

describe("isApprovedRetailerUrl", () => {
  it("accepts approved domains and rejects others", () => {
    expect(isApprovedRetailerUrl("https://www.homedepot.com/p/123")).toBe(true);
    expect(isApprovedRetailerUrl("https://lowes.com/pd/abc")).toBe(true);
    expect(isApprovedRetailerUrl("https://example.com/x")).toBe(false);
    expect(isApprovedRetailerUrl("not-a-url")).toBe(false);
  });
});
