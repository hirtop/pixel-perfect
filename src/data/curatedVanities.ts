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
    caveats: "Internal placeholder — not surfaced to customers.",
    availabilityStatus: "unverified",
    imageUrl: null,
    imageLicense: "unknown",
    isRealProduct: false,
    isPlaceholder: true,
  };
}

export const curatedVanities: CuratedVanity[] = [
  // ── Essential ($400–$900) ──────────────────────────────────────────
  placeholderSlot({
    id: "modern-essential-vanity-primary",
    tier: "essential",
    binRole: "primary",
    priceUSD: 650,
    colorFinish: "Matte white",
    countertopMaterial: "Cultured marble",
    sinkType: "Integrated single basin",
    storageNotes: "Two soft-close doors, one drawer",
    styleTags: ["modern", "clean-line", "value"],
    qualityNotes: "Clean modern profile suited to a value refresh.",
    whyFitsThisTier:
      "Simple modern vanity at value pricing while keeping a tidy finish.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-essential-vanity-backup1",
    tier: "essential",
    binRole: "backup1",
    priceUSD: 720,
    colorFinish: "Light oak",
    countertopMaterial: "Cultured marble",
    sinkType: "Integrated single basin",
    storageNotes: "Two doors, interior shelf",
    styleTags: ["modern", "warm-wood"],
    qualityNotes: "Warm wood-tone alternative for the same value tier.",
    whyFitsThisTier:
      "Backup option preserving the clean modern look in a wood-tone finish.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-essential-vanity-backup2",
    tier: "essential",
    binRole: "backup2",
    priceUSD: 820,
    colorFinish: "Charcoal grey",
    countertopMaterial: "Cultured marble",
    sinkType: "Integrated single basin",
    storageNotes: "Two doors, two drawers",
    styleTags: ["modern", "dark-finish"],
    qualityNotes: "Darker finish for a higher-contrast modern look.",
    whyFitsThisTier:
      "Alternate finish keeping value pricing and modern lines.",
    faucetIncluded: false,
  }),

  // ── Balanced ($900–$1,800) ─────────────────────────────────────────
  placeholderSlot({
    id: "modern-balanced-vanity-primary",
    tier: "balanced",
    binRole: "primary",
    priceUSD: 1295,
    colorFinish: "Natural oak",
    countertopMaterial: "Engineered quartz",
    sinkType: "Undermount rectangular porcelain",
    storageNotes: "Soft-close doors and drawers, full interior storage",
    styleTags: ["modern", "warm-wood", "quartz-top"],
    qualityNotes:
      "Stronger material presence than Essential with a quartz top and undermount sink.",
    whyFitsThisTier:
      "Complete modern upgrade with cohesive finishes and improved storage.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-balanced-vanity-backup1",
    tier: "balanced",
    binRole: "backup1",
    priceUSD: 1490,
    colorFinish: "Matte black",
    countertopMaterial: "Engineered quartz",
    sinkType: "Undermount rectangular porcelain",
    storageNotes: "Soft-close drawers, organized interior",
    styleTags: ["modern", "matte-black"],
    qualityNotes: "High-contrast modern look with a quartz top.",
    whyFitsThisTier:
      "Backup with the same upgraded material story in a darker finish.",
    faucetIncluded: false,
  }),
  placeholderSlot({
    id: "modern-balanced-vanity-backup2",
    tier: "balanced",
    binRole: "backup2",
    priceUSD: 1675,
    colorFinish: "Walnut veneer",
    countertopMaterial: "Engineered quartz",
    sinkType: "Undermount oval porcelain",
    storageNotes: "Soft-close drawers, full-extension glides",
    styleTags: ["modern", "walnut", "quartz-top"],
    qualityNotes: "Walnut alternative with comparable material quality.",
    whyFitsThisTier:
      "Alternate wood tone preserving the upgraded Balanced material story.",
    faucetIncluded: false,
  }),

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
