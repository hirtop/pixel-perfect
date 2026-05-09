import { describe, it, expect } from "vitest";
import {
  curatedFaucets,
  getCuratedFaucetsByTier,
  getPrimaryFaucetForTier,
  getBackupFaucetsForTier,
  isApprovedFaucetRetailerUrl,
  TIER_PRICE_BANDS,
  FAUCET_TYPE_VALUES,
  COMPATIBLE_HOLE_PATTERN_VALUES,
  HANDLE_CONFIGURATION_VALUES,
  APPROVED_FAUCET_MANUFACTURER_DOMAINS,
  type CuratedFaucetTier,
} from "../curatedFaucets";

const TIERS: CuratedFaucetTier[] = ["essential", "balanced", "premium"];
const APPROVED_RETAILERS = ["homedepot.com", "lowes.com"];

const FORBIDDEN_PHRASES = [
  "luxury",
  "designer",
  "premium-grade",
  "professional-grade",
  "recommended",
  "most popular",
  "guaranteed",
  "savings",
  "roi",
  "final quote",
  "fixed quote",
  "contractor-approved",
  "ready to build",
  "water-saving",
  "eco-friendly",
];
const FORBIDDEN_WORD_REGEXES = [/\bbest\b/i, /\btop\b/i];

// warrantyText is a carve-out — manufacturer wording allowed there.
const COPY_FIELDS: (keyof typeof curatedFaucets[number])[] = [
  "productName",
  "cleanedDisplayName",
  "qualityNotes",
  "whyFitsThisTier",
  "caveats",
  "installationNotes",
];

describe("curatedFaucets — structure", () => {
  it("has exactly 9 entries", () => {
    expect(curatedFaucets).toHaveLength(9);
  });

  it("has 3 entries per tier with 1 primary + 1 backup1 + 1 backup2", () => {
    for (const tier of TIERS) {
      const rows = getCuratedFaucetsByTier(tier);
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
      const p = getPrimaryFaucetForTier(tier);
      expect(p).toBeDefined();
      expect(p!.binRole).toBe("primary");
      expect(p!.tier).toBe(tier);
      const backups = getBackupFaucetsForTier(tier);
      expect(backups).toHaveLength(2);
      expect(backups.every((b) => b.binRole !== "primary")).toBe(true);
    }
  });

  it("ids are unique", () => {
    const ids = curatedFaucets.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("productUrls are unique", () => {
    const urls = curatedFaucets.map((f) => f.productUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("curatedFaucets — required fields & shape", () => {
  it.each(curatedFaucets)("$id has correct fixed shape", (f) => {
    expect(f.style).toBe("modern");
    expect(f.category).toBe("faucet");
    expect(f.isRealProduct).toBe(true);
    expect(f.isPlaceholder).toBe(false);
    expect(f.imageLicense).toBe("retailer");
    expect(f.productUrl.startsWith("https://")).toBe(true);
    expect(f.imageUrl.startsWith("https://")).toBe(true);
    expect(f.priceCapturedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(f.productName.trim().length).toBeGreaterThan(0);
    expect(f.cleanedDisplayName.trim().length).toBeGreaterThan(0);
    expect(f.brand.trim().length).toBeGreaterThan(0);
    expect(f.sku.trim().length).toBeGreaterThan(0);
    expect(f.modelNumber.trim().length).toBeGreaterThan(0);
    expect(f.warrantyText.trim().length).toBeGreaterThan(0);
    expect(Array.isArray(f.styleTags)).toBe(true);
    expect(typeof f.priceUSDObserved).toBe("number");
    expect(typeof f.priceUSDRegular).toBe("number");
    expect(f.priceUSDObserved).toBeLessThanOrEqual(f.priceUSDRegular);
    expect(FAUCET_TYPE_VALUES).toContain(f.faucetType);
    expect(COMPATIBLE_HOLE_PATTERN_VALUES).toContain(f.compatibleHolePattern);
    expect(HANDLE_CONFIGURATION_VALUES).toContain(f.handleConfiguration);
    expect([true, false, "unknown"]).toContain(f.drainIncluded);
    expect([true, false, "unknown"]).toContain(f.valveIncluded);
    expect([true, false, "unknown"]).toContain(f.requiresDeckPlate);
    if (typeof f.flowRateGPM !== "number") expect(f.flowRateGPM).toBe("unknown");
    if (typeof f.spoutHeightInches !== "number")
      expect(f.spoutHeightInches).toBe("unknown");
  });

  it("observed price is within tier band", () => {
    for (const f of curatedFaucets) {
      const band = TIER_PRICE_BANDS[f.tier];
      expect(f.priceUSDObserved).toBeGreaterThanOrEqual(band.min);
      expect(f.priceUSDObserved).toBeLessThanOrEqual(band.max);
    }
  });
});

describe("curatedFaucets — retailer / source", () => {
  it("all productUrls are Home Depot or Lowes", () => {
    for (const f of curatedFaucets) {
      expect(isApprovedFaucetRetailerUrl(f.productUrl)).toBe(true);
    }
  });

  it("all specSourceUrl values are Home Depot or Lowes", () => {
    for (const f of curatedFaucets) {
      expect(isApprovedFaucetRetailerUrl(f.specSourceUrl)).toBe(true);
    }
  });

  it("all manufacturerSpecSource values reference approved manufacturer domains", () => {
    for (const f of curatedFaucets) {
      const text = f.manufacturerSpecSource.toLowerCase();
      const ok = APPROVED_FAUCET_MANUFACTURER_DOMAINS.some((d) =>
        text.includes(d),
      );
      expect(ok, `${f.id} manufacturerSpecSource: ${text}`).toBe(true);
    }
  });

  it("isApprovedFaucetRetailerUrl rejects unapproved domains", () => {
    expect(isApprovedFaucetRetailerUrl("https://www.homedepot.com/p/x")).toBe(
      true,
    );
    expect(isApprovedFaucetRetailerUrl("https://lowes.com/pd/x")).toBe(true);
    expect(isApprovedFaucetRetailerUrl("https://kohler.com/x")).toBe(false);
    expect(isApprovedFaucetRetailerUrl("not-a-url")).toBe(false);
  });

  it("retailer field is one of the approved retailers", () => {
    for (const f of curatedFaucets) {
      const host = new URL(f.productUrl).hostname
        .toLowerCase()
        .replace(/^www\./, "");
      expect(APPROVED_RETAILERS).toContain(host);
    }
  });
});

describe("curatedFaucets — compatibility expectations", () => {
  it("Essential primary is single-hole", () => {
    const p = getPrimaryFaucetForTier("essential")!;
    expect(p.faucetType).toBe("single-hole");
  });

  it("Balanced primary and backup1 are single-hole", () => {
    const balanced = getCuratedFaucetsByTier("balanced");
    const primary = balanced.find((f) => f.binRole === "primary")!;
    const backup1 = balanced.find((f) => f.binRole === "backup1")!;
    expect(primary.faucetType).toBe("single-hole");
    expect(backup1.faucetType).toBe("single-hole");
  });

  it("Balanced backup2 is widespread / three-hole", () => {
    const b2 = getCuratedFaucetsByTier("balanced").find(
      (f) => f.binRole === "backup2",
    )!;
    expect(b2.faucetType).toBe("widespread");
    expect(b2.compatibleHolePattern).toBe("three-hole");
  });

  it("Premium primary and backup1 are widespread / three-hole", () => {
    const premium = getCuratedFaucetsByTier("premium");
    const primary = premium.find((f) => f.binRole === "primary")!;
    const backup1 = premium.find((f) => f.binRole === "backup1")!;
    for (const row of [primary, backup1]) {
      expect(row.faucetType).toBe("widespread");
      expect(row.compatibleHolePattern).toBe("three-hole");
    }
  });

  it("Premium backup2 is single-hole", () => {
    const b2 = getCuratedFaucetsByTier("premium").find(
      (f) => f.binRole === "backup2",
    )!;
    expect(b2.faucetType).toBe("single-hole");
    expect(b2.compatibleHolePattern).toBe("single-hole");
  });
});

describe("curatedFaucets — accepted replacements preserved", () => {
  it("Premium primary is Kohler Purist K-14410-4-CP", () => {
    const p = getPrimaryFaucetForTier("premium")!;
    expect(p.brand).toBe("Kohler");
    expect(p.modelNumber).toBe("K-14410-4-CP");
  });

  it("Premium backup2 is Kohler Purist K-14402-4A-2MB", () => {
    const b2 = getCuratedFaucetsByTier("premium").find(
      (f) => f.binRole === "backup2",
    )!;
    expect(b2.brand).toBe("Kohler");
    expect(b2.modelNumber).toBe("K-14402-4A-2MB");
  });
});

describe("curatedFaucets — forbidden BOBOX-facing copy", () => {
  it("no forbidden phrases in copy fields (warrantyText carve-out)", () => {
    for (const f of curatedFaucets) {
      for (const field of COPY_FIELDS) {
        const text = String(f[field] ?? "").toLowerCase();
        for (const phrase of FORBIDDEN_PHRASES) {
          expect(
            text.includes(phrase),
            `faucet ${f.id} field "${String(field)}" contains "${phrase}"`,
          ).toBe(false);
        }
        for (const re of FORBIDDEN_WORD_REGEXES) {
          expect(
            re.test(text),
            `faucet ${f.id} field "${String(field)}" matches ${re}`,
          ).toBe(false);
        }
      }
    }
  });
});
