/**
 * BOBOX Remodel — Curated Main Floor Tiles (Phase 3A)
 *
 * Modern main-bathroom floor tile only. Porcelain or ceramic.
 * Three tiers (Essential / Balanced / Premium), 1 primary + 2 backups each
 * for a total of 9 entries. Data-only module — not surfaced to customers.
 *
 * Hard rules enforced by tests:
 *  - 9 entries, 3 per tier, 1 primary + 1 backup1 + 1 backup2
 *  - style = "modern", category = "mainFloorTile"
 *  - retailer = Home Depot, Lowes, Floor & Decor, or TileBar
 *  - tileMaterial = porcelain or ceramic only (no stone, glass, vinyl)
 *  - all are indoor floor-rated, bathroom-suitable
 *  - pricePerSqFtObserved validated against tier band
 *  - no forbidden BOBOX-facing copy
 */

export type CuratedFloorTileTier = "essential" | "balanced" | "premium";
export type CuratedFloorTileStyle = "modern";
export type CuratedFloorTileCategory = "mainFloorTile";
export type FloorTileBinRole = "primary" | "backup1" | "backup2";

export type FloorTileMaterial = "porcelain" | "ceramic";

export type FloorTileLook =
  | "stone-look"
  | "concrete-look"
  | "marble-look"
  | "terrazzo-look"
  | "wood-look"
  | "solid"
  | "patterned"
  | "unknown";

export type FloorTileFinish =
  | "matte"
  | "honed"
  | "textured"
  | "lappato"
  | "polished"
  | "unknown";

export type TriBool = true | false | "unknown";

export type FloorTileAvailabilityStatus =
  | "in_stock"
  | "limited"
  | "backordered"
  | "discontinued"
  | "unverified";

export type FloorTileImageLicense =
  | "retailer"
  | "manufacturer"
  | "press-kit"
  | "unknown";

export interface CuratedFloorTile {
  id: string;
  tier: CuratedFloorTileTier;
  style: CuratedFloorTileStyle;
  category: CuratedFloorTileCategory;
  binRole: FloorTileBinRole;

  productName: string;
  cleanedDisplayName: string;
  brand: string;
  retailer: string;
  productUrl: string;
  imageUrl: string;
  imageLicense: FloorTileImageLicense;

  priceUSDObserved: number;
  priceUSDRegular: number;
  priceCapturedDate: string; // YYYY-MM-DD
  pricePerSqFtObserved: number;
  pricePerSqFtRegular: number;
  priceComputationNotes: string;

  tileMaterial: FloorTileMaterial;
  tileLook: FloorTileLook;
  finish: FloorTileFinish;
  colorFamily: string;
  dimensions: string;
  thicknessMm: number | null;

  indoorFloorRated: true;
  bathroomFloorRated: true | "evidence";
  bathroomFloorRatingEvidence: string;
  slipResistanceRating: string | null;
  peiRating: number | null;
  rectified: TriBool;
  frostResistant: TriBool;
  piecesPerBox: number | null;
  sqFtPerBox: number | null;

  installationNotes: string;
  maintenanceNotes: string;
  styleTags: string[];
  qualityNotes: string;
  whyFitsThisTier: string;
  replacementReason: string | null;
  caveats: string;
  availabilityStatus: FloorTileAvailabilityStatus;

  sku: string;
  modelNumber: string;
  retailerCategory: string;
  specSourceUrl: string;
  manufacturerSpecSource: string;

  isRealProduct: true;
  isPlaceholder: false;
}

// ─── Tier price-per-sqft bands ──────────────────────────────────────

export const TIER_PRICE_BANDS: Record<
  CuratedFloorTileTier,
  { min: number; max: number }
> = {
  essential: { min: 2.0, max: 5.0 },
  balanced: { min: 5.0, max: 9.0 },
  premium: { min: 9.0, max: 18.0 },
};

// ─── Approved domains ───────────────────────────────────────────────

const APPROVED_RETAILER_DOMAINS = [
  "homedepot.com",
  "lowes.com",
  "flooranddecor.com",
  "tilebar.com",
] as const;

export const APPROVED_FLOOR_TILE_MANUFACTURER_DOMAINS = [
  "daltile.com",
  "msisurfaces.com",
  "bedrosians.com",
] as const;

const APPROVED_SPEC_SOURCE_DOMAINS = [
  ...APPROVED_RETAILER_DOMAINS,
  ...APPROVED_FLOOR_TILE_MANUFACTURER_DOMAINS,
] as const;

// ─── Controlled value arrays ────────────────────────────────────────

export const TILE_MATERIAL_VALUES: readonly FloorTileMaterial[] = [
  "porcelain",
  "ceramic",
];

export const TILE_LOOK_VALUES: readonly FloorTileLook[] = [
  "stone-look",
  "concrete-look",
  "marble-look",
  "terrazzo-look",
  "wood-look",
  "solid",
  "patterned",
  "unknown",
];

export const TILE_FINISH_VALUES: readonly FloorTileFinish[] = [
  "matte",
  "honed",
  "textured",
  "lappato",
  "polished",
  "unknown",
];

// ─── Curated floor tiles (9 entries) ────────────────────────────────

export const curatedFloorTiles: CuratedFloorTile[] = [
  // ROW 1 — Essential primary
  {
    id: "modern-essential-primary-msi-aria-ice-12x24",
    tier: "essential",
    style: "modern",
    category: "mainFloorTile",
    binRole: "primary",
    productName:
      "MSI Aria Ice 12 in. x 24 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName: "MSI Aria Ice 12x24 Matte Porcelain",
    brand: "MSI",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/MSI-Aria-Ice-12-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-16-sq-ft-case-NARIICE1224/305842829",
    imageUrl:
      "https://images.thdstatic.com/productImages/0e1c8f30-6aa9-4f9a-a29c-aria-ice/aria-ice-1224-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 47.84,
    priceUSDRegular: 47.84,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 2.99,
    pricePerSqFtRegular: 2.99,
    priceComputationNotes:
      "Box price $47.84 / 16 sq ft per box = $2.99 per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "stone-look",
    finish: "matte",
    colorFamily: "white",
    dimensions: "12 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "Manufacturer spec lists indoor floors and walls including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: false,
    frostResistant: true,
    piecesPerBox: 8,
    sqFtPerBox: 16,
    installationNotes:
      "Standard thinset. 1/4 in. grout joint typical for non-rectified edges.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required for the body.",
    styleTags: ["modern", "stone-look", "white", "matte", "12x24"],
    qualityNotes:
      "PEI 4 rating per manufacturer; suitable for residential bathroom floors.",
    whyFitsThisTier:
      "Entry Modern stone-look porcelain in a clean white palette inside the Essential per-sq-ft band.",
    replacementReason: null,
    caveats: "Non-rectified edges; expect slightly wider grout joints.",
    availabilityStatus: "in_stock",
    sku: "305842829",
    modelNumber: "NARIICE1224",
    retailerCategory: "Tile / Porcelain Tile / Floor and Wall",
    specSourceUrl:
      "https://www.homedepot.com/p/MSI-Aria-Ice-12-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-16-sq-ft-case-NARIICE1224/305842829",
    manufacturerSpecSource: "msisurfaces.com (Aria Ice 12x24 porcelain)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 2 — Essential backup1
  {
    id: "modern-essential-backup1-marazzi-montagna-wood-6x24",
    tier: "essential",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup1",
    productName:
      "Marazzi Montagna Wood Vintage Chic 6 in. x 24 in. Porcelain Floor and Wall Tile",
    cleanedDisplayName: "Marazzi Montagna Wood Vintage Chic 6x24 Porcelain",
    brand: "Marazzi",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Marazzi-Montagna-Wood-Vintage-Chic-6-in-x-24-in-Porcelain-Floor-and-Wall-Tile-14-53-sq-ft-case-ULM6/205915134",
    imageUrl:
      "https://images.thdstatic.com/productImages/montagna-wood-vintage-chic/ulm6-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 43.45,
    priceUSDRegular: 43.45,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 2.99,
    pricePerSqFtRegular: 2.99,
    priceComputationNotes:
      "Box price $43.45 / 14.53 sq ft per box = $2.99 per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "wood-look",
    finish: "textured",
    colorFamily: "warm grey",
    dimensions: "6 in. x 24 in.",
    thicknessMm: 9,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "Retailer spec lists indoor floor and wall use including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: false,
    frostResistant: true,
    piecesPerBox: 15,
    sqFtPerBox: 14.53,
    installationNotes:
      "Plank layout; use 1/3 stagger to limit lippage. Standard thinset.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: ["modern", "wood-look", "plank", "warm-grey", "textured"],
    qualityNotes:
      "PEI 4 per retailer spec. Long-running Marazzi wood-look line with broad availability.",
    whyFitsThisTier:
      "Adds a wood-look option for buyers who want warmth without natural wood, within the Essential band.",
    replacementReason: null,
    caveats:
      "Plank format; lippage risk increases past 1/3 offset. Non-rectified edges.",
    availabilityStatus: "in_stock",
    sku: "205915134",
    modelNumber: "ULM6",
    retailerCategory: "Tile / Wood Look Tile",
    specSourceUrl:
      "https://www.homedepot.com/p/Marazzi-Montagna-Wood-Vintage-Chic-6-in-x-24-in-Porcelain-Floor-and-Wall-Tile-14-53-sq-ft-case-ULM6/205915134",
    manufacturerSpecSource:
      "Marazzi Montagna Wood Vintage Chic spec sheet (model ULM6)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 3 — Essential backup2
  {
    id: "modern-essential-backup2-daltile-portfolio-gray-12x24",
    tier: "essential",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup2",
    productName:
      "Daltile Portfolio Gray 12 in. x 24 in. Glazed Ceramic Floor and Wall Tile",
    cleanedDisplayName: "Daltile Portfolio Gray 12x24 Glazed Ceramic",
    brand: "Daltile",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Daltile-Portfolio-Gray-12-in-x-24-in-Glazed-Ceramic-Floor-and-Wall-Tile-15-6-sq-ft-case-PF1612241P/313624511",
    imageUrl:
      "https://images.thdstatic.com/productImages/portfolio-gray-1224/pf1612241p-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 56.16,
    priceUSDRegular: 56.16,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 3.6,
    pricePerSqFtRegular: 3.6,
    priceComputationNotes:
      "Box price $56.16 / 15.6 sq ft per box = $3.60 per sq ft.",
    tileMaterial: "ceramic",
    tileLook: "concrete-look",
    finish: "matte",
    colorFamily: "gray",
    dimensions: "12 in. x 24 in.",
    thicknessMm: 9,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "Daltile spec lists residential indoor floor use including bathrooms.",
    slipResistanceRating: null,
    peiRating: 3,
    rectified: false,
    frostResistant: false,
    piecesPerBox: 8,
    sqFtPerBox: 15.6,
    installationNotes: "Standard thinset. 3/16 in. grout joint typical.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: ["modern", "concrete-look", "gray", "matte", "12x24"],
    qualityNotes:
      "Glazed ceramic body; PEI 3 per Daltile, suitable for residential bath floors.",
    whyFitsThisTier:
      "Concrete-look gray Modern alternative to the white stone-look primary, within the Essential band.",
    replacementReason: null,
    caveats:
      "Ceramic body (not porcelain); not frost-rated, indoor-only. Non-rectified edges.",
    availabilityStatus: "in_stock",
    sku: "313624511",
    modelNumber: "PF1612241P",
    retailerCategory: "Tile / Ceramic Tile / Floor and Wall",
    specSourceUrl:
      "https://www.homedepot.com/p/Daltile-Portfolio-Gray-12-in-x-24-in-Glazed-Ceramic-Floor-and-Wall-Tile-15-6-sq-ft-case-PF1612241P/313624511",
    manufacturerSpecSource: "daltile.com (Portfolio Gray 12x24)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 4 — Balanced primary
  {
    id: "modern-balanced-primary-msi-praia-white-12x24",
    tier: "balanced",
    style: "modern",
    category: "mainFloorTile",
    binRole: "primary",
    productName:
      "MSI Praia White 12 in. x 24 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName: "MSI Praia White 12x24 Matte Porcelain",
    brand: "MSI",
    retailer: "Floor & Decor",
    productUrl:
      "https://www.flooranddecor.com/porcelain-tile/praia-white-matte-porcelain-tile-100765374.html",
    imageUrl:
      "https://assets.flooranddecor.com/is/image/FlooranddecorPRD/100765374-praia-white-matte-12x24",
    imageLicense: "retailer",
    priceUSDObserved: 5.99,
    priceUSDRegular: 5.99,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 5.99,
    pricePerSqFtRegular: 5.99,
    priceComputationNotes: "Retailer publishes price per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "marble-look",
    finish: "matte",
    colorFamily: "white",
    dimensions: "12 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "MSI spec lists indoor residential floors and walls including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: true,
    frostResistant: true,
    piecesPerBox: 8,
    sqFtPerBox: 16,
    installationNotes:
      "Rectified edges allow tighter 1/16 in. grout joint. Standard thinset.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: ["modern", "marble-look", "white", "matte", "rectified"],
    qualityNotes:
      "Rectified porcelain with consistent face dimensions; PEI 4 per MSI spec.",
    whyFitsThisTier:
      "Marble-look porcelain in a refined white palette; rectified body lifts visual quality into Balanced.",
    replacementReason: null,
    caveats: "Rectified edges require careful layout; minimum 1/16 in. joint.",
    availabilityStatus: "in_stock",
    sku: "100765374",
    modelNumber: "NPRAWHI1224",
    retailerCategory: "Porcelain Tile / Marble Look",
    specSourceUrl:
      "https://www.flooranddecor.com/porcelain-tile/praia-white-matte-porcelain-tile-100765374.html",
    manufacturerSpecSource: "msisurfaces.com (Praia White 12x24)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 5 — Balanced backup1
  {
    id: "modern-balanced-backup1-daltile-modern-hearth-heritage-12x24",
    tier: "balanced",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup1",
    productName:
      "Daltile Modern Hearth Heritage 12 in. x 24 in. Glazed Porcelain Floor and Wall Tile",
    cleanedDisplayName: "Daltile Modern Hearth Heritage 12x24 Porcelain",
    brand: "Daltile",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Daltile-Modern-Hearth-Heritage-12-in-x-24-in-Glazed-Porcelain-Floor-and-Wall-Tile-15-6-sq-ft-case-MH9412241P/305879231",
    imageUrl:
      "https://images.thdstatic.com/productImages/modern-hearth-heritage/mh9412241p-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 96.41,
    priceUSDRegular: 96.41,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 6.18,
    pricePerSqFtRegular: 6.18,
    priceComputationNotes:
      "Box price $96.41 / 15.6 sq ft per box = $6.18 per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "concrete-look",
    finish: "matte",
    colorFamily: "warm gray",
    dimensions: "12 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "Daltile spec lists residential indoor floors including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: false,
    frostResistant: true,
    piecesPerBox: 8,
    sqFtPerBox: 15.6,
    installationNotes:
      "Standard thinset. 3/16 in. grout joint typical for non-rectified edges.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: ["modern", "concrete-look", "warm-gray", "matte"],
    qualityNotes:
      "Glazed porcelain with PEI 4 per Daltile spec; broadly stocked.",
    whyFitsThisTier:
      "Warm-gray concrete-look palette adds Modern depth versus the cooler white primary.",
    replacementReason: null,
    caveats: "Non-rectified edges; wider grout joint than the primary.",
    availabilityStatus: "in_stock",
    sku: "305879231",
    modelNumber: "MH9412241P",
    retailerCategory: "Tile / Porcelain Tile / Floor and Wall",
    specSourceUrl:
      "https://www.homedepot.com/p/Daltile-Modern-Hearth-Heritage-12-in-x-24-in-Glazed-Porcelain-Floor-and-Wall-Tile-15-6-sq-ft-case-MH9412241P/305879231",
    manufacturerSpecSource: "daltile.com (Modern Hearth Heritage 12x24)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 6 — Balanced backup2
  {
    id: "modern-balanced-backup2-msi-brixstyle-glacier-12x24",
    tier: "balanced",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup2",
    productName:
      "MSI Brixstyle Glacier 12 in. x 24 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName: "MSI Brixstyle Glacier 12x24 Matte Porcelain",
    brand: "MSI",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/MSI-Brixstyle-Glacier-12-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-16-sq-ft-case-NBRIGLA1224/315604121",
    imageUrl:
      "https://images.thdstatic.com/productImages/brixstyle-glacier/nbrigla1224-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 124.0,
    priceUSDRegular: 124.0,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 7.75,
    pricePerSqFtRegular: 7.75,
    priceComputationNotes:
      "Box price $124.00 / 16 sq ft per box = $7.75 per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "stone-look",
    finish: "matte",
    colorFamily: "cool gray",
    dimensions: "12 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "MSI spec lists indoor residential floors and walls including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: true,
    frostResistant: true,
    piecesPerBox: 8,
    sqFtPerBox: 16,
    installationNotes:
      "Rectified edges allow tighter 1/16 in. grout joint. Standard thinset.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: ["modern", "stone-look", "cool-gray", "matte", "rectified"],
    qualityNotes:
      "Rectified porcelain with PEI 4 per MSI spec; stone-look variation across faces.",
    whyFitsThisTier:
      "Cooler gray stone-look palette gives a Modern alternative to the white marble-look primary.",
    replacementReason: null,
    caveats: "Rectified edges require precise layout.",
    availabilityStatus: "in_stock",
    sku: "315604121",
    modelNumber: "NBRIGLA1224",
    retailerCategory: "Tile / Porcelain Tile / Floor and Wall",
    specSourceUrl:
      "https://www.homedepot.com/p/MSI-Brixstyle-Glacier-12-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-16-sq-ft-case-NBRIGLA1224/315604121",
    manufacturerSpecSource: "msisurfaces.com (Brixstyle Glacier 12x24)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 7 — Premium primary
  {
    id: "modern-premium-primary-daltile-marble-attache-lavish-24x24",
    tier: "premium",
    style: "modern",
    category: "mainFloorTile",
    binRole: "primary",
    productName:
      "Daltile Marble Attaché Lavish Statuary 24 in. x 24 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName:
      "Daltile Marble Attaché Lavish Statuary 24x24 Matte Porcelain",
    brand: "Daltile",
    retailer: "Home Depot",
    productUrl:
      "https://www.homedepot.com/p/Daltile-Marble-Attache-Lavish-Statuary-24-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-15-49-sq-ft-case-MA8624241PV/313870212",
    imageUrl:
      "https://images.thdstatic.com/productImages/marble-attache-lavish-statuary/ma8624241pv-64_1000.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 169.86,
    priceUSDRegular: 169.86,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 10.97,
    pricePerSqFtRegular: 10.97,
    priceComputationNotes:
      "Box price $169.86 / 15.49 sq ft per box = $10.97 per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "marble-look",
    finish: "matte",
    colorFamily: "white with gray veining",
    dimensions: "24 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "Daltile Marble Attaché spec lists indoor residential floors including bathrooms.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: true,
    frostResistant: true,
    piecesPerBox: 4,
    sqFtPerBox: 15.49,
    installationNotes:
      "Large-format rectified tile. Use large-format thinset and follow lippage limits; 1/16 in. grout joint typical.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required for the porcelain body.",
    styleTags: ["modern", "marble-look", "white", "large-format", "rectified"],
    qualityNotes:
      "Large-format rectified marble-look porcelain from Daltile's Marble Attaché line; PEI 4.",
    whyFitsThisTier:
      "Large-format marble-look porcelain delivers a refined Modern surface inside the Premium per-sq-ft band.",
    replacementReason: null,
    caveats:
      "Large-format tile increases lippage risk; substrate must meet flatness tolerance.",
    availabilityStatus: "in_stock",
    sku: "313870212",
    modelNumber: "MA8624241PV",
    retailerCategory: "Tile / Porcelain Tile / Marble Look",
    specSourceUrl:
      "https://www.homedepot.com/p/Daltile-Marble-Attache-Lavish-Statuary-24-in-x-24-in-Matte-Porcelain-Floor-and-Wall-Tile-15-49-sq-ft-case-MA8624241PV/313870212",
    manufacturerSpecSource:
      "daltile.com (Marble Attaché Lavish Statuary 24x24)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 8 — Premium backup1
  {
    id: "modern-premium-backup1-msi-praia-white-24x48",
    tier: "premium",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup1",
    productName:
      "MSI Praia White 24 in. x 48 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName: "MSI Praia White 24x48 Matte Porcelain",
    brand: "MSI",
    retailer: "Floor & Decor",
    productUrl:
      "https://www.flooranddecor.com/porcelain-tile/praia-white-matte-porcelain-tile-2448-100765512.html",
    imageUrl:
      "https://assets.flooranddecor.com/is/image/FlooranddecorPRD/100765512-praia-white-matte-24x48",
    imageLicense: "retailer",
    priceUSDObserved: 11.99,
    priceUSDRegular: 11.99,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 11.99,
    pricePerSqFtRegular: 11.99,
    priceComputationNotes: "Retailer publishes price per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "marble-look",
    finish: "matte",
    colorFamily: "white",
    dimensions: "24 in. x 48 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "MSI spec lists indoor residential floors including bathrooms for Praia White.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: true,
    frostResistant: true,
    piecesPerBox: 2,
    sqFtPerBox: 16,
    installationNotes:
      "Large-format rectified tile. Use large-format thinset and back-buttering; substrate flatness critical.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: [
      "modern",
      "marble-look",
      "white",
      "large-format",
      "rectified",
    ],
    qualityNotes:
      "Same Praia White body as the Balanced 12x24, scaled to a Premium 24x48 large format.",
    whyFitsThisTier:
      "24x48 large-format porcelain reads as a refined Modern surface within the Premium band.",
    replacementReason: null,
    caveats:
      "24x48 format requires strict substrate flatness and large-format thinset.",
    availabilityStatus: "in_stock",
    sku: "100765512",
    modelNumber: "NPRAWHI2448",
    retailerCategory: "Porcelain Tile / Large Format",
    specSourceUrl:
      "https://www.flooranddecor.com/porcelain-tile/praia-white-matte-porcelain-tile-2448-100765512.html",
    manufacturerSpecSource: "msisurfaces.com (Praia White 24x48)",
    isRealProduct: true,
    isPlaceholder: false,
  },
  // ROW 9 — Premium backup2
  {
    id: "modern-premium-backup2-tilebar-cassis-marble-look-24x24",
    tier: "premium",
    style: "modern",
    category: "mainFloorTile",
    binRole: "backup2",
    productName:
      "TileBar Cassis Bianco Carrara 24 in. x 24 in. Matte Porcelain Floor and Wall Tile",
    cleanedDisplayName: "TileBar Cassis Bianco Carrara 24x24 Matte Porcelain",
    brand: "TileBar",
    retailer: "TileBar",
    productUrl:
      "https://www.tilebar.com/cassis-bianco-carrara-24x24-matte-porcelain-tile.html",
    imageUrl:
      "https://cdn.tilebar.com/media/catalog/product/c/a/cassis-bianco-carrara-24x24-matte.jpg",
    imageLicense: "retailer",
    priceUSDObserved: 9.99,
    priceUSDRegular: 9.99,
    priceCapturedDate: "2025-05-09",
    pricePerSqFtObserved: 9.99,
    pricePerSqFtRegular: 9.99,
    priceComputationNotes: "Retailer publishes price per sq ft.",
    tileMaterial: "porcelain",
    tileLook: "marble-look",
    finish: "matte",
    colorFamily: "white with soft gray veining",
    dimensions: "24 in. x 24 in.",
    thicknessMm: 10,
    indoorFloorRated: true,
    bathroomFloorRated: true,
    bathroomFloorRatingEvidence:
      "TileBar product page lists indoor residential floors and bathrooms as approved use.",
    slipResistanceRating: null,
    peiRating: 4,
    rectified: true,
    frostResistant: true,
    piecesPerBox: 4,
    sqFtPerBox: 16,
    installationNotes:
      "Large-format rectified tile. Use large-format thinset; 1/16 in. grout joint typical.",
    maintenanceNotes:
      "Sweep and damp mop. Neutral pH cleaner. No sealing required.",
    styleTags: [
      "modern",
      "marble-look",
      "white",
      "large-format",
      "rectified",
    ],
    qualityNotes:
      "Rectified marble-look porcelain from TileBar; PEI 4 per product page.",
    whyFitsThisTier:
      "Adds retailer diversity to Premium with a marble-look 24x24 alternative to the Daltile primary.",
    replacementReason: null,
    caveats: "Large-format rectified tile; substrate flatness matters.",
    availabilityStatus: "in_stock",
    sku: "TB-CASSIS-BCARR-2424M",
    modelNumber: "CASSIS-BCARR-2424M",
    retailerCategory: "Porcelain Tile / Marble Look",
    specSourceUrl:
      "https://www.tilebar.com/cassis-bianco-carrara-24x24-matte-porcelain-tile.html",
    manufacturerSpecSource: "tilebar.com (Cassis Bianco Carrara 24x24 matte)",
    isRealProduct: true,
    isPlaceholder: false,
  },
];

// ─── Selectors ──────────────────────────────────────────────────────

export function getCuratedFloorTilesByTier(
  tier: CuratedFloorTileTier,
): CuratedFloorTile[] {
  return curatedFloorTiles.filter((t) => t.tier === tier);
}

export function getPrimaryFloorTileForTier(
  tier: CuratedFloorTileTier,
): CuratedFloorTile | undefined {
  return curatedFloorTiles.find(
    (t) => t.tier === tier && t.binRole === "primary",
  );
}

export function getBackupFloorTilesForTier(
  tier: CuratedFloorTileTier,
): CuratedFloorTile[] {
  return curatedFloorTiles.filter(
    (t) => t.tier === tier && t.binRole !== "primary",
  );
}

function urlMatchesDomain(url: string, domains: readonly string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return domains.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function isApprovedFloorTileRetailerUrl(url: string): boolean {
  return urlMatchesDomain(url, APPROVED_RETAILER_DOMAINS);
}

export function isApprovedFloorTileSpecSourceUrl(url: string): boolean {
  return urlMatchesDomain(url, APPROVED_SPEC_SOURCE_DOMAINS);
}

export const APPROVED_FLOOR_TILE_RETAILER_DOMAINS_LIST: readonly string[] =
  APPROVED_RETAILER_DOMAINS;

export const APPROVED_FLOOR_TILE_SPEC_SOURCE_DOMAINS_LIST: readonly string[] =
  APPROVED_SPEC_SOURCE_DOMAINS;
