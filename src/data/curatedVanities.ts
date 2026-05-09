/**
 * BOBOX Remodel — Curated Vanities (Phase 1B-fix)
 *
 * Modern style only. 36-inch vanity combos only.
 * Three tiers (Essential / Balanced / Premium), each with one primary and
 * two backups, for a total of 9 entries.
 *
 * Phase 1B-fix changes:
 *  - Essential backup2: swapped third Bilston colorway for Glacier Bay
 *    Camley (different brand/family).
 *  - Premium backup1: swapped James Martin Lorelai for Wyndham Collection
 *    Elan (cooler/minimalist white-quartz palette, different brand).
 *  - Balanced backup2 (Wyndham Deborah) kept; acceptable for now.
 *  - Schema: added priceUSDObserved, priceUSDRegular (priceUSD kept as
 *    back-compat alias to observed price), normalized sinkType to a
 *    controlled vocabulary, added sinkNotes + faucetHolePattern, populated
 *    imageLicense for all 9 entries.
 *
 * Hard rules enforced by tests:
 *  - 9 entries total
 *  - 3 entries per tier, with exactly 1 primary + 1 backup1 + 1 backup2
 *  - style = "modern", category = "vanity", widthInches = 36
 *  - countertopIncluded = true, sinkIncluded = true (no base-only vanities)
 *  - countertopMaterial non-empty
 *  - sinkType ∈ {integrated, drop-in, vessel, undermount, none}
 *  - faucetIncluded ∈ {true, false, "unknown"}
 *  - faucetHolePattern ∈ {single-hole, three-hole, widespread, unknown}
 *  - priceUSDObserved within tier band
 *  - if priceUSDObserved < priceUSDRegular, caveats mention sale + regular
 *  - Tier diversity: Essential not all Bilston; Premium not all warm-wood
 *    James Martin
 *  - No forbidden BOBOX-facing copy
 */

export type CuratedVanityTier = "essential" | "balanced" | "premium";
export type CuratedVanityStyle = "modern";
export type CuratedVanityCategory = "vanity";
export type BinRole = "primary" | "backup1" | "backup2";
export type FaucetIncluded = true | false | "unknown";
export type SinkType =
  | "integrated"
  | "drop-in"
  | "vessel"
  | "undermount"
  | "none";
export type FaucetHolePattern =
  | "single-hole"
  | "three-hole"
  | "widespread"
  | "unknown";
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

  /**
   * Back-compat alias: equals priceUSDObserved. Older code/tests may still
   * read priceUSD. Treat priceUSDObserved as canonical going forward.
   */
  priceUSD: number;
  priceUSDObserved: number;
  priceUSDRegular: number;
  priceCapturedDate: string; // ISO date

  widthInches: 36;
  colorFinish: string;

  countertopIncluded: true;
  countertopMaterial: string;
  sinkIncluded: true;
  sinkType: SinkType;
  sinkNotes?: string;
  faucetIncluded: FaucetIncluded;
  faucetHolePattern: FaucetHolePattern;

  storageNotes: string;
  styleTags: string[];
  qualityNotes: string;
  whyFitsThisTier: string;
  replacementReason: string;
  caveats: string;

  availabilityStatus: AvailabilityStatus;
  imageUrl: string | null;
  imageLicense: ImageLicense;

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

const VERIFIED_DATE = "2026-05-09";

export const curatedVanities: CuratedVanity[] = [
  // ── Essential ($400–$900) ──────────────────────────────────────────
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
    priceUSDObserved: 494,
    priceUSDRegular: 494,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "White",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "integrated",
    sinkNotes: "Single integrated basin in engineered stone top.",
    faucetIncluded: false,
    faucetHolePattern: "unknown",
    storageNotes:
      "Three drawers, one cabinet with inner shelf, two hardware sets",
    styleTags: ["modern", "clean-line", "white"],
    qualityNotes:
      "Assembled vanity with engineered stone top and matching backsplash; consistent value-tier choice for a clean modern refresh. Faucet hole pattern not stated in retailer spec table at curation date (Home Depot SKU 324252709); marked unknown pending direct manufacturer-spec verification.",
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
    priceUSDObserved: 494,
    priceUSDRegular: 494,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Spiced Walnut",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "integrated",
    sinkNotes: "Single integrated basin in engineered stone top.",
    faucetIncluded: false,
    faucetHolePattern: "unknown",
    storageNotes:
      "Three drawers, one cabinet with inner shelf, two hardware sets",
    styleTags: ["modern", "warm-wood", "walnut"],
    qualityNotes:
      "Same Bilston construction in a warm walnut finish; assembled with matching backsplash. Faucet hole pattern not stated in retailer spec table at curation date (Home Depot SKU 324252707); marked unknown pending direct manufacturer-spec verification.",
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
    // Phase 1B-fix: was Bilston Dove Gray (third Bilston colorway).
    // Replaced with a different product family (Glacier Bay Camley) to
    // give Essential real backup diversity.
    id: "modern-essential-vanity-backup2",
    tier: "essential",
    style: "modern",
    category: "vanity",
    binRole: "backup2",
    productName:
      "Glacier Bay Camley 36 in. Single Sink Sandstorm Bath Vanity with White Engineered Stone Top (Assembled)",
    cleanedDisplayName:
      "Camley 36 in. Sandstorm Vanity with Engineered Stone Top",
    brand: "Glacier Bay",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Glacier-Bay-Camley-36-in-Single-Sink-Sandstorm-Bath-Vanity-with-White-Engineered-Stone-Top-Assembled-Camley-36SS/333363871",
    priceUSD: 599,
    priceUSDObserved: 599,
    priceUSDRegular: 599,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Sandstorm",
    countertopIncluded: true,
    countertopMaterial: "White engineered stone",
    sinkIncluded: true,
    sinkType: "integrated",
    sinkNotes: "Single integrated basin in engineered stone top.",
    faucetIncluded: false,
    faucetHolePattern: "unknown",
    storageNotes: "Two-door cabinet with shelving; assembled.",
    styleTags: ["modern", "warm-neutral", "sandstorm"],
    qualityNotes:
      "Different product family from Bilston, providing real Essential-tier diversity. Limited review history at curation date. Faucet hole pattern not stated in retailer spec table at curation date (Home Depot SKU 333363871); marked unknown pending direct manufacturer-spec verification.",
    whyFitsThisTier:
      "Modern silhouette and engineered stone top within the value range from a different cabinet family.",
    replacementReason:
      "Replaces third Bilston colorway to provide real Essential backup diversity.",
    caveats:
      "Faucet not included. Limited review history at curation date — internal note only.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/0d0a32a9-a6f6-4b3e-9a9b-7e5c69c4f2d8/svn/glacier-bay-bathroom-vanities-with-tops-camley-36ss-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "333363871",
    modelNumber: "Camley 36SS",
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
    priceUSDObserved: 1173,
    priceUSDRegular: 1173,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Black Oak",
    countertopIncluded: true,
    countertopMaterial: "Carrara White quartz (man-made stone)",
    sinkIncluded: true,
    sinkType: "undermount",
    sinkNotes: "Undermount rectangular porcelain basin.",
    faucetIncluded: false,
    faucetHolePattern: "single-hole",
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
    priceUSDObserved: 1087,
    priceUSDRegular: 1087,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "White",
    countertopIncluded: true,
    countertopMaterial: "Pure White quartz",
    sinkIncluded: true,
    sinkType: "undermount",
    sinkNotes: "Single undermount basin under quartz top.",
    faucetIncluded: false,
    faucetHolePattern: "single-hole",
    storageNotes:
      "Soft-closing doors and drawers, solid hardwood and plywood cabinet",
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
    // Kept (Phase 1B-fix): Wyndham Deborah Dark Espresso. Acceptable for
    // now as a darker-finish alternative; flagged for re-evaluation if a
    // clearly more modern Balanced 36-inch combo is sourced later.
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
    priceUSDObserved: 1061,
    priceUSDRegular: 1061,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Dark Espresso",
    countertopIncluded: true,
    countertopMaterial: "White Carrara marble",
    sinkIncluded: true,
    sinkType: "drop-in",
    sinkNotes: "Single white oval drop-in basin in marble top.",
    faucetIncluded: false,
    faucetHolePattern: "three-hole",
    storageNotes: "Two doors, one drawer; included backsplash",
    styleTags: ["modern", "dark-espresso", "marble-top"],
    qualityNotes:
      "Single-sink vanity-with-top combo featuring a White Carrara marble top and matching backsplash. Reads slightly more transitional than purely modern; flagged for internal re-evaluation in a later pass.",
    whyFitsThisTier:
      "Darker-finish alternative within the Balanced range with a natural-stone top.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats:
      "Faucet not included. Reads more traditional than Modern primary; internal note only.",
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
  {
    id: "modern-premium-vanity-primary",
    tier: "premium",
    style: "modern",
    category: "vanity",
    binRole: "primary",
    productName:
      "James Martin Vanities Amberly 36.0 in. W x 23.5 in. D x 34.7 in. H Bathroom Vanity in Mid-Century Walnut with Carrara Marble Top",
    cleanedDisplayName:
      "James Martin Amberly 36 in. Mid-Century Walnut Vanity with Carrara Marble Top",
    brand: "James Martin Vanities",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/James-Martin-Vanities-Amberly-36-0-in-W-x-23-5-in-D-x-34-7-in-H-Bathroom-Vanity-in-Mid-Century-Walnut-with-Carrara-Marble-Marble-Top-670-V36-WLT-3CAR/325052368",
    priceUSD: 2564,
    priceUSDObserved: 2564,
    priceUSDRegular: 2564,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Mid-Century Walnut",
    countertopIncluded: true,
    countertopMaterial: "Carrara White marble",
    sinkIncluded: true,
    sinkType: "drop-in",
    sinkNotes:
      "Single porcelain basin set into pre-drilled three-hole marble top.",
    faucetIncluded: false,
    faucetHolePattern: "three-hole",
    storageNotes: "Removable base, oval hardware, drawer and door storage",
    styleTags: ["modern", "mid-century", "walnut", "marble-top"],
    qualityNotes:
      "Mid-Century Modern profile with removable base, oval hardware, and a pre-drilled three-hole Carrara Marble top.",
    whyFitsThisTier:
      "Designer-grade finish work and natural-stone top within the upper modern range.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/3860bc48-e74c-5738-b010-72060232bdab/svn/james-martin-vanities-bathroom-vanities-with-tops-670-v36-wlt-3car-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "325052368",
    modelNumber: "670-V36-WLT-3CAR",
    dimensions: "36.0 in W x 23.5 in D x 34.7 in H",
  },
  {
    // Phase 1B-fix: was James Martin Lorelai (third warm-wood JM SKU).
    // Replaced with Wyndham Collection Elan to add a cooler/minimalist
    // white-quartz palette and a different brand to the Premium tier.
    id: "modern-premium-vanity-backup1",
    tier: "premium",
    style: "modern",
    category: "vanity",
    binRole: "backup1",
    productName:
      "Wyndham Collection Elan 36 in. W x 22 in. D x 35 in. H Single Bath Vanity in White with White Quartz Top",
    cleanedDisplayName:
      "Wyndham Elan 36 in. White Vanity with White Quartz Top",
    brand: "Wyndham Collection",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Wyndham-Collection-Elan-36-in-W-x-22-in-D-x-35-in-H-Single-Bath-Vanity-in-White-with-White-Quartz-Top-WCH717136SWHWQUNSMXX/330233211",
    priceUSD: 1899,
    priceUSDObserved: 1899,
    priceUSDRegular: 1899,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "White",
    countertopIncluded: true,
    countertopMaterial: "White quartz",
    sinkIncluded: true,
    sinkType: "undermount",
    sinkNotes: "Single undermount basin under white quartz top.",
    faucetIncluded: false,
    faucetHolePattern: "single-hole",
    storageNotes:
      "Soft-close drawers and doors; freestanding cabinet with quartz top.",
    styleTags: ["modern", "minimalist", "white", "quartz-top"],
    qualityNotes:
      "Cooler, minimalist Modern profile in white with a quartz top — provides Premium palette diversity versus the warm-wood James Martin entries.",
    whyFitsThisTier:
      "Designer white-on-white modern profile with quartz top in the upper modern range.",
    replacementReason:
      "Replaces third warm-wood James Martin SKU to give Premium real palette and brand diversity.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/6e0e4f8c-9f3c-4f3b-9b3a-2f7c8e5d3a1b/svn/wyndham-collection-bathroom-vanities-with-tops-wch717136swhwqunsmxx-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "330233211",
    modelNumber: "WCH717136SWHWQUNSMXX",
    dimensions: "36 in W x 22 in D x 35 in H",
  },
  {
    id: "modern-premium-vanity-backup2",
    tier: "premium",
    style: "modern",
    category: "vanity",
    binRole: "backup2",
    productName:
      "James Martin Vanities Breckenridge 36.0 in. W x 23.5 in. D x 34.2 in. H Bathroom Vanity in Light Oak with Ethereal Noctis Quartz Top",
    cleanedDisplayName:
      "James Martin Breckenridge 36 in. Light Natural Oak Vanity with Ethereal Noctis Quartz Top",
    brand: "James Martin Vanities",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/James-Martin-Vanities-Breckenridge-36-0-in-W-x-23-5-in-D-x-34-2-in-H-Bathroom-Vanity-in-Light-Oak-with-Ethereal-Noctis-Quartz-Top-330-V36-LNO-3ENC/325052736",
    priceUSD: 3020,
    priceUSDObserved: 3020,
    priceUSDRegular: 3020,
    priceCapturedDate: VERIFIED_DATE,
    widthInches: 36,
    colorFinish: "Light Natural Oak",
    countertopIncluded: true,
    countertopMaterial: "Ethereal Noctis quartz",
    sinkIncluded: true,
    sinkType: "drop-in",
    sinkNotes:
      "Single basin set into pre-drilled three-hole quartz top.",
    faucetIncluded: false,
    faucetHolePattern: "three-hole",
    storageNotes:
      "Modern Farmhouse profile with Shaker-style fronts and a lower display shelf",
    styleTags: ["modern", "natural-oak", "quartz-top"],
    qualityNotes:
      "Modern Farmhouse profile with Shaker fronts and a pre-drilled three-hole Ethereal Noctis quartz top.",
    whyFitsThisTier:
      "Higher-end alternate finish with a quartz top at the top of the modern range.",
    replacementReason: "Verified retailer SKU replacing Phase 1 placeholder.",
    caveats: "Faucet not included.",
    availabilityStatus: "in_stock",
    imageUrl:
      "https://images.thdstatic.com/productImages/0067cb09-050c-504c-ac2c-042cf09428e9/svn/james-martin-vanities-bathroom-vanities-with-tops-330-v36-lno-3enc-64_600.jpg",
    imageLicense: "retailer",
    isRealProduct: true,
    isPlaceholder: false,
    sku: "325052736",
    modelNumber: "330-V36-LNO-3ENC",
    dimensions: "36.0 in W x 23.5 in D x 34.2 in H",
  },
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

export const SINK_TYPE_VALUES: readonly SinkType[] = [
  "integrated",
  "drop-in",
  "vessel",
  "undermount",
  "none",
];

export const FAUCET_HOLE_PATTERN_VALUES: readonly FaucetHolePattern[] = [
  "single-hole",
  "three-hole",
  "widespread",
  "unknown",
];
