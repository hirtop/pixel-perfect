/**
 * BOBOX Remodel — Curated Faucets (Phase 2A)
 *
 * Modern bathroom sink faucets only.
 * Three tiers (Essential / Balanced / Premium), each with one primary and
 * two backups, totaling 9 entries. Data-only module — not surfaced to
 * customers yet.
 *
 * Hard rules enforced by tests:
 *  - 9 entries total, 3 per tier (1 primary + 1 backup1 + 1 backup2)
 *  - style = "modern", category = "faucet"
 *  - retailer URLs limited to homedepot.com / lowes.com
 *  - manufacturer sources are spec-only (moen/delta/kohler/etc.)
 *  - prices fall within tier bands
 *  - controlled values for faucetType / hole pattern / handle config
 *  - no forbidden BOBOX-facing copy
 */

export type CuratedFaucetTier = "essential" | "balanced" | "premium";
export type CuratedFaucetStyle = "modern";
export type CuratedFaucetCategory = "faucet";
export type FaucetBinRole = "primary" | "backup1" | "backup2";

export type FaucetType =
  | "single-hole"
  | "centerset"
  | "widespread"
  | "wall-mount"
  | "vessel";

export type CompatibleHolePattern =
  | "single-hole"
  | "three-hole"
  | "single-hole or three-hole"
  | "widespread"
  | "unknown";

export type HandleConfiguration =
  | "single-handle"
  | "double-handle"
  | "cross-handle"
  | "lever-handle"
  | "unknown";

export type TriBool = true | false | "unknown";

export type FaucetAvailabilityStatus =
  | "in_stock"
  | "limited"
  | "backordered"
  | "discontinued"
  | "unverified";

export type FaucetImageLicense =
  | "retailer"
  | "manufacturer"
  | "press-kit"
  | "unknown";

export interface CuratedFaucet {
  id: string;
  tier: CuratedFaucetTier;
  style: CuratedFaucetStyle;
  category: CuratedFaucetCategory;
  binRole: FaucetBinRole;

  productName: string;
  cleanedDisplayName: string;
  brand: string;
  retailer: string;
  productUrl: string;
  imageUrl: string;
  imageLicense: FaucetImageLicense;

  priceUSDObserved: number;
  priceUSDRegular: number;
  priceCapturedDate: string; // YYYY-MM-DD

  finish: string;
  faucetType: FaucetType;
  compatibleHolePattern: CompatibleHolePattern;
  handleConfiguration: HandleConfiguration;
  bodyMaterial: string | "unknown";
  cartridgeType: string | "unknown";
  flowRateGPM: number | "unknown";
  spoutHeightInches: number | "unknown";
  drainIncluded: TriBool;
  valveIncluded: TriBool;
  requiresDeckPlate: TriBool;

  warrantyText: string;
  installationNotes: string;
  styleTags: string[];
  qualityNotes: string;
  whyFitsThisTier: string;
  replacementReason: string | null;
  caveats: string;
  availabilityStatus: FaucetAvailabilityStatus;

  sku: string;
  modelNumber: string;
  retailerCategory: string;
  specSourceUrl: string;
  manufacturerSpecSource: string;

  isRealProduct: true;
  isPlaceholder: false;
}

// ─── Tier price bands ───────────────────────────────────────────────

export const TIER_PRICE_BANDS: Record<
  CuratedFaucetTier,
  { min: number; max: number }
> = {
  essential: { min: 80, max: 200 },
  balanced: { min: 200, max: 450 },
  premium: { min: 450, max: 900 },
};

// ─── Approved domains ───────────────────────────────────────────────

const APPROVED_RETAILER_DOMAINS = ["homedepot.com", "lowes.com"] as const;

export const APPROVED_FAUCET_MANUFACTURER_DOMAINS = [
  "moen.com",
  "deltafaucet.com",
  "kohler.com",
  "pfisterfaucets.com",
  "americanstandard-us.com",
  "kraususa.com",
] as const;

// ─── Controlled value arrays ────────────────────────────────────────

export const FAUCET_TYPE_VALUES: readonly FaucetType[] = [
  "single-hole",
  "centerset",
  "widespread",
  "wall-mount",
  "vessel",
];

export const COMPATIBLE_HOLE_PATTERN_VALUES: readonly CompatibleHolePattern[] = [
  "single-hole",
  "three-hole",
  "single-hole or three-hole",
  "widespread",
  "unknown",
];

export const HANDLE_CONFIGURATION_VALUES: readonly HandleConfiguration[] = [
  "single-handle",
  "double-handle",
  "cross-handle",
  "lever-handle",
  "unknown",
];

// ─── Curated faucets (9 entries) ────────────────────────────────────

export const curatedFaucets: CuratedFaucet[] = [
  // ROW 1 — Essential primary
  {
    id: "modern-essential-primary-delta-567lf-pp",
    tier: "essential",
    style: "modern",
    category: "faucet",
    binRole: "primary",
    productName:
      "Delta Modern Single Hole Single-Handle Bathroom Faucet in Chrome",
    cleanedDisplayName: "Delta Modern Single-Hole Bathroom Faucet, Chrome",
    brand: "Delta",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Delta-Modern-Single-Hole-Single-Handle-Bathroom-Faucet-in-Chrome-567LF-PP/205864148",
    imageUrl:
      "https://images.thdstatic.com/productImages/79cde56e-1ed8-4251-b91b-17393cdf4b93/svn/chrome-delta-single-hole-bathroom-faucets-567lf-pp-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 95.72,
    priceUSDRegular: 95.72,
    priceCapturedDate: "2025-05-09",
    finish: "Chrome",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: true,
    valveIncluded: false,
    requiresDeckPlate: false,
    warrantyText: "Faucet and Finish Lifetime Limited Warranty",
    installationNotes:
      "Single-hole installation. Optional deck plate sold separately for 3-hole vanities.",
    styleTags: ["modern", "minimalist", "square", "chrome"],
    qualityNotes:
      "4.3 stars from 420 reviews. ADA Compliant, CSA Certified per retailer spec.",
    whyFitsThisTier:
      "Entry-tier Modern square spout from a recognized brand within the Essential price band.",
    replacementReason: null,
    caveats:
      "Faucet not included with vanity; purchased separately. Drain included; valve not included.",
    availabilityStatus: "in_stock",
    sku: "205864148",
    modelNumber: "567LF-PP",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/Delta-Modern-Single-Hole-Single-Handle-Bathroom-Faucet-in-Chrome-567LF-PP/205864148",
    manufacturerSpecSource: "deltafaucet.com (model 567LF-PP)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 2 — Essential backup1
  {
    id: "modern-essential-backup1-moen-ws84760",
    tier: "essential",
    style: "modern",
    category: "faucet",
    binRole: "backup1",
    productName:
      "Moen Genta Single Handle Single Hole Bathroom Faucet with Drain Kit Included in Chrome",
    cleanedDisplayName: "Moen Genta Single-Hole Bathroom Faucet, Chrome",
    brand: "Moen",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/MOEN-Genta-Single-Handle-Single-Hole-Bathroom-Faucet-with-Drain-Kit-Included-in-Chrome-WS84760/206942731",
    imageUrl:
      "https://images.thdstatic.com/productImages/1fac65a9-9a83-42c5-8b22-c157582f0a74/svn/chrome-moen-single-hole-bathroom-faucets-ws84760-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 87.07,
    priceUSDRegular: 87.07,
    priceCapturedDate: "2025-05-09",
    finish: "Chrome",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole or three-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: true,
    valveIncluded: true,
    requiresDeckPlate: false,
    warrantyText: "Lifetime limited warranty",
    installationNotes:
      "Single-hole or 3-hole installation; deck plate and drain kit included.",
    styleTags: ["modern", "contemporary", "chrome", "versatile-install"],
    qualityNotes:
      "2,372 reviews. ADA Compliant, CSA Certified, EPA Approved per retailer spec.",
    whyFitsThisTier:
      "Entry-tier broad-compatibility option; deck plate included covers Essential vanities whose hole pattern is unverified.",
    replacementReason: null,
    caveats: "Faucet not included with vanity; purchased separately.",
    availabilityStatus: "in_stock",
    sku: "206942731",
    modelNumber: "WS84760",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/MOEN-Genta-Single-Handle-Single-Hole-Bathroom-Faucet-with-Drain-Kit-Included-in-Chrome-WS84760/206942731",
    manufacturerSpecSource: "moen.com (model WS84760)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 3 — Essential backup2
  {
    id: "modern-essential-backup2-delta-567lf-blgpm-pp",
    tier: "essential",
    style: "modern",
    category: "faucet",
    binRole: "backup2",
    productName:
      "Delta Modern Project-Pack Single Hole Single-Handle Bathroom Faucet in Matte Black",
    cleanedDisplayName:
      "Delta Modern Single-Hole Bathroom Faucet, Matte Black",
    brand: "Delta",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Delta-Modern-Project-Pack-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-567LF-BLGPM-PP/311585097",
    imageUrl:
      "https://images.thdstatic.com/productImages/aa3bdc05-6f21-4dfd-bc0a-27530f8916da/svn/matte-black-delta-single-hole-bathroom-faucets-567lf-blgpm-pp-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 176.24,
    priceUSDRegular: 176.24,
    priceCapturedDate: "2025-05-09",
    finish: "Matte Black",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: true,
    valveIncluded: false,
    requiresDeckPlate: false,
    warrantyText: "Faucet and Finish Lifetime Limited Warranty",
    installationNotes:
      "Single-hole installation. Optional deck plate sold separately for 3-hole vanities.",
    styleTags: ["modern", "minimalist", "square", "matte-black"],
    qualityNotes: "4.1 stars from 68 reviews.",
    whyFitsThisTier:
      "Same Modern square family as Essential primary; matte black variant adds finish diversity within Essential.",
    replacementReason: null,
    caveats:
      "Faucet not included with vanity; purchased separately. Drain included; valve not included.",
    availabilityStatus: "in_stock",
    sku: "311585097",
    modelNumber: "567LF-BLGPM-PP",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/Delta-Modern-Project-Pack-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-567LF-BLGPM-PP/311585097",
    manufacturerSpecSource: "deltafaucet.com (model 567LF-BLGPM-PP)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 4 — Balanced primary
  {
    id: "modern-balanced-primary-delta-559lf-bllpu",
    tier: "balanced",
    style: "modern",
    category: "faucet",
    binRole: "primary",
    productName:
      "Delta Trinsic Single Hole Single-Handle Bathroom Faucet in Matte Black",
    cleanedDisplayName:
      "Delta Trinsic Single-Hole Bathroom Faucet, Matte Black",
    brand: "Delta",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-559LF-BLLPU/301646776",
    imageUrl:
      "https://images.thdstatic.com/productImages/1ad3829c-9a9d-4ba8-84a2-b53ee9f259d9/svn/matte-black-delta-single-hole-bathroom-faucets-559lf-bllpu-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 329.0,
    priceUSDRegular: 329.0,
    priceCapturedDate: "2025-05-09",
    finish: "Matte Black",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole or three-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: 6.5,
    drainIncluded: "unknown",
    valveIncluded: "unknown",
    requiresDeckPlate: false,
    warrantyText: "Lifetime limited warranty",
    installationNotes:
      "Single-hole or 3-hole installation; optional deck plate included.",
    styleTags: ["modern", "minimalist", "matte-black", "cylindrical"],
    qualityNotes:
      "4.6 stars from 61 reviews. Trinsic is a Modern Delta line.",
    whyFitsThisTier:
      "Mid-tier Modern fixture; matte black matches Ariel Cambridge primary's brushed-brass-and-black-oak palette.",
    replacementReason: null,
    caveats:
      "Faucet not included with vanity; purchased separately. Drain inclusion not confirmed in retailer spec block; verify at install.",
    availabilityStatus: "in_stock",
    sku: "301646776",
    modelNumber: "559LF-BLLPU",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-559LF-BLLPU/301646776",
    manufacturerSpecSource: "deltafaucet.com (Trinsic 559LF-BLLPU)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 5 — Balanced backup1
  {
    id: "modern-balanced-backup1-delta-559lf-sslpu",
    tier: "balanced",
    style: "modern",
    category: "faucet",
    binRole: "backup1",
    productName:
      "Delta Trinsic Single Hole Single-Handle Bathroom Faucet in Stainless",
    cleanedDisplayName:
      "Delta Trinsic Single-Hole Bathroom Faucet, Stainless",
    brand: "Delta",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Stainless-559LF-SSLPU/204198529",
    imageUrl:
      "https://images.thdstatic.com/productImages/11ba1fd8-1c90-4901-a6b9-eb742dc9d649/svn/stainless-delta-single-hole-bathroom-faucets-559lf-sslpu-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 289.0,
    priceUSDRegular: 289.0,
    priceCapturedDate: "2026-05-09",
    finish: "Stainless",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole or three-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: 6.5,
    drainIncluded: false,
    valveIncluded: false,
    requiresDeckPlate: false,
    warrantyText: "Lifetime Limited Warranty",
    installationNotes:
      "Single-hole or 3-hole 4-in. installation; optional deck plate included. Drain assembly sold separately.",
    styleTags: ["modern", "minimalist", "stainless", "cylindrical"],
    qualityNotes:
      "4.4 stars from 98 reviews on manufacturer site. Same Trinsic line as Balanced primary; stainless finish adds Balanced-tier finish diversity beyond matte black.",
    whyFitsThisTier:
      "Mid-tier Modern single-hole from same Trinsic family as Balanced primary; stainless finish covers buyers preferring brushed/silver tones over matte black.",
    replacementReason:
      "Replaces Moen Doux S6910BL (Matte Black) so the Balanced tier offers at least one non-matte-black single-hole option.",
    caveats:
      "Faucet not included with vanity; purchased separately. LPU = Less Pop-Up: drain assembly is sold separately. Listing currently shown as Out of Stock at Home Depot at capture time.",
    availabilityStatus: "backordered",
    sku: "204198529",
    modelNumber: "559LF-SSLPU",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Stainless-559LF-SSLPU/204198529",
    manufacturerSpecSource:
      "deltafaucet.com (Trinsic 559LF-SSLPU; flow rate 1.2 gpm @ 60 psi, ceramic disc, 6-1/2 in. height)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 6 — Balanced backup2
  {
    id: "modern-balanced-backup2-delta-35899lf-bl",
    tier: "balanced",
    style: "modern",
    category: "faucet",
    binRole: "backup2",
    productName:
      "Delta Pierce 8 in. Widespread 2-Handle Bathroom Faucet in Matte Black",
    cleanedDisplayName:
      "Delta Pierce 8-in. Widespread Bathroom Faucet, Matte Black",
    brand: "Delta",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Delta-Pierce-8-in-Widespread-2-Handle-Bathroom-Faucet-in-Matte-Black-35899LF-BL/312734945",
    imageUrl:
      "https://images.thdstatic.com/productImages/abb58942-5755-4e06-8967-32bd08d8e5ab/svn/matte-black-delta-widespread-bathroom-faucets-35899lf-bl-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 207.18,
    priceUSDRegular: 207.18,
    priceCapturedDate: "2025-05-09",
    finish: "Matte Black",
    faucetType: "widespread",
    compatibleHolePattern: "three-hole",
    handleConfiguration: "double-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: 7.4375,
    drainIncluded: "unknown",
    valveIncluded: "unknown",
    requiresDeckPlate: false,
    warrantyText: "Faucet and Finish Lifetime Limited Warranty",
    installationNotes: "8-in. widespread / three-hole installation only.",
    styleTags: ["modern", "widespread", "matte-black"],
    qualityNotes: "4.5 stars from 434 reviews per retailer listing.",
    whyFitsThisTier:
      "Covers Wyndham Deborah backup2 three-hole vanity with a widespread Modern Matte Black option in the Balanced price band.",
    replacementReason: null,
    caveats:
      "Faucet not included with vanity; purchased separately. Three-hole installation only; not compatible with single-hole vanities.",
    availabilityStatus: "in_stock",
    sku: "312734945",
    modelNumber: "35899LF-BL",
    retailerCategory: "Bathroom Sink Faucets / Widespread",
    specSourceUrl:
      "https://www.homedepot.com/p/Delta-Pierce-8-in-Widespread-2-Handle-Bathroom-Faucet-in-Matte-Black-35899LF-BL/312734945",
    manufacturerSpecSource: "deltafaucet.com (Pierce 35899LF-BL)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 7 — Premium primary
  {
    id: "modern-premium-primary-kohler-k-14410-4-cp",
    tier: "premium",
    style: "modern",
    category: "faucet",
    binRole: "primary",
    productName:
      "Kohler Purist 8 in. Widespread 2-Handle Low-Arc Bathroom Faucet in Polished Chrome with Low Lever Handles",
    cleanedDisplayName:
      "Kohler Purist 8-in. Widespread Low-Arc Bathroom Faucet, Polished Chrome",
    brand: "Kohler",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-8-in-Widespread-2-Handle-Low-Arc-Bathroom-Faucet-in-Polished-Chrome-with-Low-Lever-Handles-K-14410-4-CP/100066218",
    imageUrl:
      "https://images.thdstatic.com/productImages/77435a22-8bcd-493d-ae6d-905a3dc605c4/svn/polished-chrome-kohler-widespread-bathroom-faucets-k-14410-4-cp-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 761.73,
    priceUSDRegular: 761.73,
    priceCapturedDate: "2025-05-09",
    finish: "Polished Chrome",
    faucetType: "widespread",
    compatibleHolePattern: "three-hole",
    handleConfiguration: "double-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: "unknown",
    valveIncluded: "unknown",
    requiresDeckPlate: false,
    warrantyText: "Lifetime Limited Warranty",
    installationNotes: "8-in. widespread / three-hole installation only.",
    styleTags: [
      "modern",
      "architectural",
      "minimalist",
      "polished-chrome",
      "lever",
    ],
    qualityNotes: "Kohler Purist line, lever variant.",
    whyFitsThisTier:
      "Higher-tier Modern widespread; covers Amberly primary three-hole and Breckenridge backup2 three-hole vanities. Lever handles preserve Modern aesthetic.",
    replacementReason:
      "Replaces K-14406-3-CP candidate. K-14406-3 has Cross Handle, which reads classic/transitional rather than Modern.",
    caveats:
      "Faucet not included with vanity; purchased separately. Three-hole installation only.",
    availabilityStatus: "in_stock",
    sku: "100066218",
    modelNumber: "K-14410-4-CP",
    retailerCategory: "Bathroom Sink Faucets / Widespread",
    specSourceUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-8-in-Widespread-2-Handle-Low-Arc-Bathroom-Faucet-in-Polished-Chrome-with-Low-Lever-Handles-K-14410-4-CP/100066218",
    manufacturerSpecSource: "kohler.com (Purist K-14410-4-CP)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 8 — Premium backup1
  {
    id: "modern-premium-backup1-kohler-k-14406-4-bl",
    tier: "premium",
    style: "modern",
    category: "faucet",
    binRole: "backup1",
    productName:
      "Kohler Purist 8 in. Widespread 2-Handle Bathroom Faucet with Lever Handles in Matte Black",
    cleanedDisplayName:
      "Kohler Purist 8-in. Widespread Bathroom Faucet, Matte Black",
    brand: "Kohler",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-8-in-Widespread-2-Handle-Bathroom-Faucet-with-Lever-Handles-in-Matte-Black-K-14406-4-BL/309564710",
    imageUrl:
      "https://images.thdstatic.com/productImages/4878bfcd-1239-43e5-8487-965b09c3cd9f/svn/matte-black-kohler-widespread-bathroom-faucets-k-14406-4-bl-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 820.12,
    priceUSDRegular: 820.12,
    priceCapturedDate: "2025-05-09",
    finish: "Matte Black",
    faucetType: "widespread",
    compatibleHolePattern: "three-hole",
    handleConfiguration: "double-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: "unknown",
    valveIncluded: "unknown",
    requiresDeckPlate: false,
    warrantyText: "Lifetime Limited Warranty",
    installationNotes: "8-in. widespread / three-hole installation only.",
    styleTags: ["modern", "matte-black", "widespread", "lever"],
    qualityNotes: "4.5 stars from 61 reviews. Same Purist line as primary.",
    whyFitsThisTier:
      "Same line as Premium primary in matte black; covers Premium buyers preferring darker palette. Within Premium band.",
    replacementReason: null,
    caveats:
      "Faucet not included with vanity; purchased separately. Three-hole installation only.",
    availabilityStatus: "in_stock",
    sku: "309564710",
    modelNumber: "K-14406-4-BL",
    retailerCategory: "Bathroom Sink Faucets / Widespread",
    specSourceUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-8-in-Widespread-2-Handle-Bathroom-Faucet-with-Lever-Handles-in-Matte-Black-K-14406-4-BL/309564710",
    manufacturerSpecSource: "kohler.com (Purist K-14406-4-BL)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 9 — Premium backup2
  {
    id: "modern-premium-backup2-kohler-k-14402-4a-2mb",
    tier: "premium",
    style: "modern",
    category: "faucet",
    binRole: "backup2",
    productName:
      "Kohler Purist Single Hole Single-Handle Bathroom Faucet in Vibrant Brushed Moderne Brass",
    cleanedDisplayName:
      "Kohler Purist Single-Hole Bathroom Faucet, Brushed Moderne Brass",
    brand: "Kohler",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-Single-Hole-Single-Handle-Bathroom-Faucet-in-Vibrant-Brushed-Moderne-Brass-K-14402-4A-2MB/315056942",
    imageUrl:
      "https://images.thdstatic.com/productImages/2c9e3ea3-1daa-4e15-83b9-e9705ed8b451/svn/vibrant-brushed-moderne-brass-kohler-single-hole-bathroom-faucets-k-14402-4a-2mb-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 687.22,
    priceUSDRegular: 687.22,
    priceCapturedDate: "2025-05-09",
    finish: "Vibrant Brushed Moderne Brass",
    faucetType: "single-hole",
    compatibleHolePattern: "single-hole",
    handleConfiguration: "single-handle",
    bodyMaterial: "unknown",
    cartridgeType: "ceramic disc",
    flowRateGPM: 1.2,
    spoutHeightInches: "unknown",
    drainIncluded: true,
    valveIncluded: true,
    requiresDeckPlate: false,
    warrantyText: "KOHLER Faucet Lifetime Limited Warranty",
    installationNotes:
      "Single-hole installation. Drain and required rough-in valve included.",
    styleTags: [
      "modern",
      "architectural",
      "brushed-brass",
      "single-hole",
      "lever",
    ],
    qualityNotes:
      "4.5 stars from 29 reviews. ADA Compliant, ASME Certified, CSA Certified, EPA Approved. Faucet height 7.75 in.",
    whyFitsThisTier:
      "Covers Wyndham Elan single-hole Premium vanity. Brushed brass finish complements warm-wood Premium vanity primaries (Amberly, Breckenridge).",
    replacementReason:
      "Replaces Delta Trinsic 559LF-CZMPU which observed at $379, below the Premium band of $450-$900.",
    caveats:
      "Faucet not included with vanity; purchased separately. Single-hole installation only.",
    availabilityStatus: "in_stock",
    sku: "315056942",
    modelNumber: "K-14402-4A-2MB",
    retailerCategory: "Bathroom Sink Faucets / Single Hole",
    specSourceUrl:
      "https://www.homedepot.com/p/KOHLER-Purist-Single-Hole-Single-Handle-Bathroom-Faucet-in-Vibrant-Brushed-Moderne-Brass-K-14402-4A-2MB/315056942",
    manufacturerSpecSource: "kohler.com (Purist K-14402-4A-2MB)",
    isRealProduct: true,
    isPlaceholder: false,
  },
];

// ─── Selectors ──────────────────────────────────────────────────────

export function getCuratedFaucetsByTier(
  tier: CuratedFaucetTier,
): CuratedFaucet[] {
  return curatedFaucets.filter((f) => f.tier === tier);
}

export function getPrimaryFaucetForTier(
  tier: CuratedFaucetTier,
): CuratedFaucet | undefined {
  return curatedFaucets.find(
    (f) => f.tier === tier && f.binRole === "primary",
  );
}

export function getBackupFaucetsForTier(
  tier: CuratedFaucetTier,
): CuratedFaucet[] {
  return curatedFaucets.filter(
    (f) => f.tier === tier && f.binRole !== "primary",
  );
}

export function isApprovedFaucetRetailerUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return APPROVED_RETAILER_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}

export const APPROVED_FAUCET_RETAILER_DOMAINS_LIST: readonly string[] =
  APPROVED_RETAILER_DOMAINS;
