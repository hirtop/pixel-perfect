/**
 * BOBOX Remodel — Curated Vanities (Phase 1)
 *
 * Modern style only. 36-inch vanity combos only.
 * Three tiers (Essential / Balanced / Premium), each with one primary and
 * two backups, for a total of 9 entries.
 *
 * IMPORTANT — Phase 1 sourcing posture:
 * Real retailer SKUs (with verified product URLs, prices, and images) have
 * NOT yet been sourced for this bin. Per spec, this module ships typed
 * PLACEHOLDER SLOTS only. Placeholders are internal scaffolding and MUST
 * NOT be surfaced to customers. Customer-visible surfacing on /summary is
 * gated by `isRealProduct === true` and will only happen once real,
 * verified products replace these slots.
 *
 * Hard rules enforced by tests:
 *  - 9 entries total
 *  - 3 entries per tier, with exactly 1 primary + 1 backup1 + 1 backup2
 *  - style = "modern", category = "vanity", widthInches = 36
 *  - countertopIncluded = true, sinkIncluded = true (no base-only vanities)
 *  - countertopMaterial + sinkType non-empty
 *  - faucetIncluded explicitly true | false | unknown
 *  - priceUSD within tier band
 *  - no forbidden BOBOX-facing copy ("custom", "best", "recommended", etc.)
 */

export type CuratedVanityTier = "essential" | "balanced" | "premium";
export type CuratedVanityStyle = "modern";
export type CuratedVanityCategory = "vanity";
export type BinRole = "primary" | "backup1" | "backup2";
export type FaucetIncluded = true | false | "unknown";
export type AvailabilityStatus =
  | "in_stock"
  | "limited"
  | "backordered"
  | "discontinued"
  | "unverified";
export type ImageLicense =
  | "retailer"
  | "manufacturer"
  | "press-kit"
  | "unknown";

export interface CuratedVanity {
  id: string;
  tier: CuratedVanityTier;
  style: CuratedVanityStyle;
  category: CuratedVanityCategory;
  binRole: BinRole;

  productName: string;
  cleanedDisplayName: string;
  brand: string;
  retailer: string;
  productUrl: string | null;
  priceUSD: number;
  priceCapturedDate: string; // ISO date

  widthInches: 36;
  colorFinish: string;

  countertopIncluded: true;
  countertopMaterial: string;
  sinkIncluded: true;
  sinkType: string;
  faucetIncluded: FaucetIncluded;

  storageNotes: string;
  styleTags: string[];
  qualityNotes: string;
  whyFitsThisTier: string;
  replacementReason: string;
  caveats: string;

  availabilityStatus: AvailabilityStatus;
  imageUrl: string | null;
  imageLicense: ImageLicense;

  /**
   * False until a real, verified retailer SKU + URL + price + image are
   * captured and reviewed. Customer-visible surfacing is gated on this.
   */
  isRealProduct: boolean;
  isPlaceholder: boolean;

  // Optional fields
  sku?: string;
  modelNumber?: string;
  dimensions?: string;
  assemblyRequired?: boolean;
  shippingNotes?: string;
  reviewSignal?: string;
  retailerCategory?: string;
  backsplashIncluded?: true | false | "unknown";
}

const APPROVED_RETAILER_DOMAINS = [
  "homedepot.com",
  "lowes.com",
  "build.com",
  "ferguson.com",
  "costco.com",
  "wayfair.com",
] as const;

export const TIER_PRICE_BANDS: Record<
  CuratedVanityTier,
  { min: number; max: number }
> = {
  essential: { min: 400, max: 900 },
  balanced: { min: 900, max: 1800 },
  premium: { min: 1800, max: 3500 },
};

const PLACEHOLDER_DATE = "2026-05-09";

/**
 * Placeholder slot factory. Produces a typed entry that satisfies all
 * structural requirements while making it obvious this is internal-only
 * scaffolding. Prices are mid-band sentinels. No real URLs/images.
 */
function placeholderSlot(args: {
  id: string;
  tier: CuratedVanityTier;
  binRole: BinRole;
  priceUSD: number;
  colorFinish: string;
  countertopMaterial: string;
  sinkType: string;
  storageNotes: string;
  styleTags: string[];
  qualityNotes: string;
  whyFitsThisTier: string;
  faucetIncluded: FaucetIncluded;
}): CuratedVanity {
  return {
    id: args.id,
    tier: args.tier,
    style: "modern",
    category: "vanity",
    binRole: args.binRole,
    productName: `Placeholder ${args.tier} ${args.binRole} 36in vanity combo`,
    cleanedDisplayName: `36-inch Modern Vanity (placeholder)`,
    brand: "TBD",
    retailer: "TBD",
    productUrl: null,
    priceUSD: args.priceUSD,
    priceCapturedDate: PLACEHOLDER_DATE,
    widthInches: 36,
    colorFinish: args.colorFinish,
    countertopIncluded: true,
    countertopMaterial: args.countertopMaterial,
    sinkIncluded: true,
    sinkType: args.sinkType,
    faucetIncluded: args.faucetIncluded,
    storageNotes: args.storageNotes,
    styleTags: args.styleTags,
    qualityNotes: args.qualityNotes,
    whyFitsThisTier: args.whyFitsThisTier,
    replacementReason:
      "Placeholder slot pending verified retailer SKU sourcing.",
    caveats: "Internal placeholder — internal-only scaffolding.",
    availabilityStatus: "unverified",
    imageUrl: null,
    imageLicense: "unknown",
    isRealProduct: false,
    isPlaceholder: true,
  };
}

// Verified-product captured date for Phase 1B sourcing pass.
const VERIFIED_DATE = "2026-05-09";

export const curatedVanities: CuratedVanity[] = [
  // ── Essential ($400–$900) — Home Decorators Collection Bilston (Home Depot) ──
  {
    id: "modern-essential-vanity-primary",
    tier: "essential",
    style: "modern",
    category: "vanity",
    binRole: "primary",
    productName:
      "Home Decorators Collection Bilston 36 in. Single Sink White Bath Vanity with White Engineered Stone Top (Assembled)",
    cleanedDisplayName: "Bilston 36 in. White Vanity with Engineered Stone Top",
    brand: "Home Decorators Collection",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Home-Decorators-Collection-Bilston-36-in-Single-Sink-White-Bath-Vanity-with-White-Engineered-Stone-Top-Assembled-Bilston-36W/324252709",
    priceUSD: 494,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "White",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "Single integrated basin",
    faucetIncluded: false,
    storageNotes: "Three drawers, one cabinet with inner shelf, two hardware sets",
    styleTags: ["modern", "clean-line", "white"],
    qualityNotes:
      "Assembled vanity with engineered stone top and matching backsplash; consistent value-tier choice for a clean modern refresh.",
    whyFitsThisTier:
      "Clean modern profile at value pricing with a stone-look top and integrated sink.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/b88f4142-acf9-40b5-893e-451f5e166269/svn/home-decorators-collection-bathroom-vanities-with-tops-bilston-36w-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "324252709",
    modelNumber: "Bilston 36W",
    dimensions: "36 in W x 19 in D x 34.5 in H",
    backsplashIncluded: true,
  },
  {
    id: "modern-essential-vanity-backup1",
    tier: "essential",
    style: "modern",
    category: "vanity",
    binRole: "backup1",
    productName:
      "Home Decorators Collection Bilston 36 in. Single Sink Spiced Walnut Bath Vanity with White Engineered Stone Top (Assembled)",
    cleanedDisplayName:
      "Bilston 36 in. Spiced Walnut Vanity with Engineered Stone Top",
    brand: "Home Decorators Collection",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Home-Decorators-Collection-Bilston-36-in-Single-Sink-Spiced-Walnut-Bath-Vanity-with-White-Engineered-Stone-Top-Assembled-Bilston-36SW/324252707",
    priceUSD: 494,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Spiced Walnut",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "Single integrated basin",
    faucetIncluded: false,
    storageNotes: "Three drawers, one cabinet with inner shelf, two hardware sets",
    styleTags: ["modern", "warm-wood", "walnut"],
    qualityNotes:
      "Same Bilston construction in a warm walnut finish; assembled with matching backsplash.",
    whyFitsThisTier:
      "Wood-tone alternative within the same value tier and material story.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/7d2d7762-05ec-4f0a-8c9c-a92938fdd191/svn/home-decorators-collection-bathroom-vanities-with-tops-bilston-36sw-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "324252707",
    modelNumber: "Bilston 36SW",
    dimensions: "36 in W x 19 in D x 34.5 in H",
    backsplashIncluded: true,
  },
  {
    id: "modern-essential-vanity-backup2",
    tier: "essential",
    style: "modern",
    category: "vanity",
    binRole: "backup2",
    productName:
      "Home Decorators Collection Bilston 36 in. Single Sink Dove Gray Bath Vanity with White Engineered Stone Top (Assembled)",
    cleanedDisplayName:
      "Bilston 36 in. Dove Gray Vanity with Engineered Stone Top",
    brand: "Home Decorators Collection",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Home-Decorators-Collection-Bilston-36-in-Single-Sink-Dove-Gray-Bath-Vanity-with-White-Engineered-Stone-Top-Assembled-Bilston-36G/324252196",
    priceUSD: 549,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Dove Gray",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "Single integrated basin",
    faucetIncluded: false,
    storageNotes: "Three drawers, one cabinet with inner shelf, two hardware sets",
    styleTags: ["modern", "soft-grey"],
    qualityNotes:
      "Same Bilston construction in a soft grey finish; assembled with matching backsplash.",
    whyFitsThisTier:
      "Cool-tone alternative within the same value tier and material story.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/607962d6-ba9c-4f85-84d7-0a30d6a247c4/svn/home-decorators-collection-bathroom-vanities-with-tops-bilston-36g-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "324252196",
    modelNumber: "Bilston 36G",
    dimensions: "36 in W x 19 in D x 34.5 in H",
    backsplashIncluded: true,
  },

  // ── Balanced ($900–$1,800) ─────────────────────────────────────────
  {
    id: "modern-balanced-vanity-primary",
    tier: "balanced",
    style: "modern",
    category: "vanity",
    binRole: "primary",
    productName:
      "ARIEL Cambridge 36 in. Single Sink Freestanding Bathroom Vanity in Black Oak with Carrara Quartz Top",
    cleanedDisplayName:
      "Ariel Cambridge 36 in. Black Oak Vanity with Carrara White Quartz Top",
    brand: "Ariel",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/ARIEL-Cambridge-36-in-W-x-22-in-D-x-36-in-H-Single-Sink-Freestanding-Bath-Vanity-in-Black-Oak-with-Carrara-Quartz-Top-A036SLCQOVOBLO/338266303",
    priceUSD: 1173,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Black Oak",
    countertopIncluded: true,
    countertopMaterial: "Carrara White quartz (man-made stone)",
    sinkIncluded: true,
    sinkType: "Undermount rectangular porcelain",
    faucetIncluded: false,
    storageNotes:
      "Soft-closing doors and drawers, American Oak solid wood and plywood cabinet",
    styleTags: ["modern", "black-oak", "quartz-top"],
    qualityNotes:
      "Cabinet handcrafted from American Oak solid wood and plywood with a Carrara White quartz top and matching backsplash. Soft-closing doors and drawers.",
    whyFitsThisTier:
      "Cohesive upgrade in materials and storage versus Essential while staying within the Balanced band.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/ab94c896-7742-4694-87e2-2f80dc7c8ac3/svn/ariel-bathroom-vanities-with-tops-a036slcqovoblo-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "338266303",
    modelNumber: "A036SLCQOVOBLO",
    dimensions: "36 in W x 22 in D x 36 in H",
    backsplashIncluded: true,
  },
  {
    id: "modern-balanced-vanity-backup1",
    tier: "balanced",
    style: "modern",
    category: "vanity",
    binRole: "backup1",
    productName:
      "ARIEL Hepburn 36 in. Single Sink Freestanding Bathroom Vanity in White with Pure White Quartz Top",
    cleanedDisplayName:
      "Ariel Hepburn 36 in. White Vanity with Pure White Quartz Top",
    brand: "Ariel",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/ARIEL-Hepburn-36-in-W-x-22-in-D-x-36-in-H-Single-Freestanding-in-White-Bath-Vanity-with-Pure-White-Quartz-Top-T037SLWQOVOWHT/323469737",
    priceUSD: 1087,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "White",
    countertopIncluded: true,
    countertopMaterial: "Pure White quartz",
    sinkIncluded: true,
    sinkType: "Single sink (freestanding vanity-with-top combo)",
    faucetIncluded: false,
    storageNotes: "Soft-closing doors and drawers, solid hardwood and plywood cabinet",
    styleTags: ["modern", "white", "quartz-top"],
    qualityNotes:
      "Solid hardwood and plywood construction with a Pure White quartz top; soft-closing doors and drawers.",
    whyFitsThisTier:
      "White quartz finish alternative in the Balanced range with similar material story.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/08920e2d-e77f-4332-99d8-a21a5ffd2c04/svn/ariel-bathroom-vanities-with-tops-t037slwqovowht-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "323469737",
    modelNumber: "T037SLWQOVOWHT",
    dimensions: "36 in W x 22 in D x 36 in H",
  },
  {
    id: "modern-balanced-vanity-backup2",
    tier: "balanced",
    style: "modern",
    category: "vanity",
    binRole: "backup2",
    productName:
      "Wyndham Collection Deborah 36 in. Single Bathroom Vanity in Dark Espresso with Marble Vanity Top in White Carrara with White Basin",
    cleanedDisplayName:
      "Wyndham Deborah 36 in. Dark Espresso Vanity with White Carrara Marble Top",
    brand: "Wyndham Collection",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Wyndham-Collection-Deborah-36-in-Single-Bathroom-Vanity-in-Dark-Espresso-with-Marble-Vanity-Top-in-White-Carrara-with-White-Basin-WCS202036SDECMUNOMXX/306934727",
    priceUSD: 1061,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Dark Espresso",
    countertopIncluded: true,
    countertopMaterial: "White Carrara marble",
    sinkIncluded: true,
    sinkType: "Single white basin (oval)",
    faucetIncluded: false,
    storageNotes: "Two doors, one drawer; included backsplash",
    styleTags: ["modern", "dark-espresso", "marble-top"],
    qualityNotes:
      "Single-sink vanity-with-top combo featuring a White Carrara marble top and matching backsplash.",
    whyFitsThisTier:
      "Darker-finish alternative within the Balanced range with a natural-stone top.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/89343a0f-0697-491d-a1fe-2ac52ad74bdf/svn/wyndham-collection-bathroom-vanities-with-tops-wcs202036sdecmunomxx-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "306934727",
    modelNumber: "WCS202036SDECMUNOMXX",
    backsplashIncluded: true,
  },

  // ── Premium ($1,800–$3,500) ────────────────────────────────────────
  placeholderSlot({
    id: "modern-premium-vanity-primary",
    tier: "premium",
    binRole: "primary",
    priceUSD: 2495,
    colorFinish: "Rift-cut white oak",
    countertopMaterial: "Natural stone (marble-look)",
    sinkType: "Undermount porcelain rectangular",
    storageNotes: "Soft-close drawers, dovetail joinery, interior organizers",
    styleTags: ["modern", "designer", "stone-top"],
    qualityNotes:
      "Designer-grade finish work and a natural-stone-style top with refined hardware.",
    whyFitsThisTier:
      "Highest visual quality of the modern set with refined materials and hardware.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-premium-vanity-backup1",
    tier: "premium",
    binRole: "backup1",
    priceUSD: 2890,
    colorFinish: "Matte navy",
    countertopMaterial: "Natural stone (marble-look)",
    sinkType: "Undermount porcelain rectangular",
    storageNotes: "Soft-close drawers, organized interior, brushed pulls",
    styleTags: ["modern", "designer", "deep-tone"],
    qualityNotes: "Deep-tone alternative with refined finish work.",
    whyFitsThisTier:
      "Backup keeping the upgraded modern feel in a darker palette.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-premium-vanity-backup2",
    tier: "premium",
    binRole: "backup2",
    priceUSD: 3250,
    colorFinish: "Smoked oak",
    countertopMaterial: "Natural stone slab",
    sinkType: "Undermount porcelain oval",
    storageNotes: "Soft-close drawers, integrated organizers",
    styleTags: ["modern", "designer", "stone-top"],
    qualityNotes:
      "Top of the modern range with stone slab top and detailed finish work.",
    whyFitsThisTier:
      "Alternate finish at the upper end of the modern range.",
    faucetIncluded: false,
  }),
];

// ─── Selectors ──────────────────────────────────────────────────────

export function getCuratedVanitiesByTier(
  tier: CuratedVanityTier,
): CuratedVanity[] {
  return curatedVanities.filter((v) => v.tier === tier);
}

export function getPrimaryVanityForTier(
  tier: CuratedVanityTier,
): CuratedVanity | undefined {
  return curatedVanities.find(
    (v) => v.tier === tier && v.binRole === "primary",
  );
}

export function getBackupVanitiesForTier(
  tier: CuratedVanityTier,
): CuratedVanity[] {
  return curatedVanities.filter(
    (v) => v.tier === tier && v.binRole !== "primary",
  );
}

export function isApprovedRetailerUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return APPROVED_RETAILER_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}

export const APPROVED_RETAILER_DOMAINS_LIST: readonly string[] =
  APPROVED_RETAILER_DOMAINS;
