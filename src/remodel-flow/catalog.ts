import type { CatalogCategory, CatalogPackage, PriceBin, TierId } from "./types";
import { MODERN_BALANCED } from "./packages/modern-balanced";

// Self-contained catalog. Engine metadata (material_tags, finish_tags, bin,
// swap_config, package slots, dynamic_pool) is consumed by the resolver engine.
// The UI continues to read only id/name/estPrice and is not affected.
//
// Phase 4D — Curation pass: expanded from 4 to 13 categories so package
// pages feel complete. Each category exposes the included default plus
// up to 2 strong alternatives (no overwhelming swap walls).

export const CATEGORIES: CatalogCategory[] = [
  // ── Vanity Area ────────────────────────────────────────────────────
  {
    id: "vanity",
    name: "Vanity",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "vanity-std" },
    options: [
      { id: "vanity-std", name: '30 in. White Shaker Vanity with Quartz Top', estPrice: 600, material_tags: ["laminate", "freestanding"], finish_tags: ["white"], bin: "budget" },
      { id: "vanity-floating", name: '36 in. Floating Oak Vanity, Single Sink', estPrice: 1450, material_tags: ["oak", "floating"], finish_tags: ["natural_wood"], bin: "mid" },
      { id: "vanity-double", name: '60 in. Double Vanity with Honed Stone Top', estPrice: 2400, material_tags: ["walnut", "stone_top", "freestanding"], finish_tags: ["honed"], bin: "high" },
    ],
    dynamic_pool: [
      { id: "vanity-floating-walnut", name: '36 in. Floating Walnut Vanity', estPrice: 1850, material_tags: ["walnut", "floating"], finish_tags: ["natural_wood"], bin: "high" },
    ],
  },
  {
    id: "fixtures",
    name: "Faucet",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "fix-chrome" },
    options: [
      { id: "fix-chrome", name: "Chrome Single-Handle Faucet", estPrice: 180, material_tags: ["chrome"], finish_tags: ["polished"], bin: "budget" },
      { id: "fix-brushed", name: "Brushed Nickel Widespread", estPrice: 380, material_tags: ["brushed_nickel"], finish_tags: ["brushed"], bin: "mid" },
      { id: "fix-matteblack", name: "Matte Black Designer Faucet", estPrice: 720, material_tags: ["matte_black"], finish_tags: ["matte"], bin: "high" },
    ],
    dynamic_pool: [
      { id: "fix-brass", name: "Unlacquered Brass Faucet", estPrice: 880, material_tags: ["brass"], finish_tags: ["natural"], bin: "high" },
    ],
  },
  {
    id: "mirror",
    name: "Mirror",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "mirror-frameless" },
    options: [
      { id: "mirror-frameless", name: "Frameless Wall Mirror", estPrice: 90, material_tags: ["frameless"], finish_tags: ["clear"], bin: "budget" },
      { id: "mirror-framed", name: "Black Framed Vanity Mirror", estPrice: 220, material_tags: ["framed", "matte_black"], finish_tags: ["matte"], bin: "mid" },
      { id: "mirror-led", name: "LED Backlit Mirror", estPrice: 420, material_tags: ["led", "frameless"], finish_tags: ["clear"], bin: "high" },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "light-flush" },
    options: [
      { id: "light-flush", name: "Flush LED Ceiling Light", estPrice: 140, material_tags: ["flush"], finish_tags: ["white"], bin: "budget" },
      { id: "light-sconces", name: "Sconce Pair + Vanity Bar", estPrice: 420, material_tags: ["sconce"], finish_tags: ["brushed"], bin: "mid" },
      { id: "light-layered", name: "Layered Designer Lighting", estPrice: 880, material_tags: ["layered", "sconce", "pendant"], finish_tags: ["matte"], bin: "high" },
    ],
    dynamic_pool: [
      { id: "light-pendant", name: "Statement Pendant", estPrice: 540, material_tags: ["pendant"], finish_tags: ["brushed"], bin: "mid" },
    ],
  },

  // ── Shower & Tub Area ──────────────────────────────────────────────
  {
    id: "tile",
    name: "Shower Wall Tile",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "tile-subway" },
    options: [
      { id: "tile-subway", name: "Classic White Subway", estPrice: 480, material_tags: ["porcelain", "subway"], finish_tags: ["polished"], bin: "budget" },
      { id: "tile-zellige", name: "Handmade Zellige", estPrice: 1380, material_tags: ["zellige", "handmade"], finish_tags: ["honed"], bin: "mid" },
      { id: "tile-marble", name: "Honed Marble Slab Look", estPrice: 2100, material_tags: ["marble", "porcelain"], finish_tags: ["honed"], bin: "high" },
    ],
    dynamic_pool: [
      { id: "tile-marble-polished", name: "Polished Marble Slab", estPrice: 2800, material_tags: ["marble"], finish_tags: ["polished"], bin: "luxury" },
    ],
  },
  {
    id: "shower-floor-tile",
    name: "Shower Floor Tile",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "sft-mosaic" },
    options: [
      { id: "sft-mosaic", name: '2" Hex Porcelain Mosaic', estPrice: 220, material_tags: ["porcelain", "mosaic"], finish_tags: ["matte"], bin: "budget" },
      { id: "sft-pebble", name: "Honed Pebble Mosaic", estPrice: 480, material_tags: ["stone", "mosaic"], finish_tags: ["honed"], bin: "mid" },
      { id: "sft-marble-hex", name: "Marble Hex Mosaic", estPrice: 780, material_tags: ["marble", "mosaic"], finish_tags: ["honed"], bin: "high" },
    ],
  },
  {
    id: "shower-trim",
    name: "Shower Trim & Valve",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "st-chrome" },
    options: [
      { id: "st-chrome", name: "Chrome Single-Function Trim", estPrice: 240, material_tags: ["chrome"], finish_tags: ["polished"], bin: "budget" },
      { id: "st-brushed", name: "Brushed Nickel Trim Kit", estPrice: 480, material_tags: ["brushed_nickel"], finish_tags: ["brushed"], bin: "mid" },
      { id: "st-rainhand", name: "Matte Black Rain + Handheld", estPrice: 880, material_tags: ["matte_black"], finish_tags: ["matte"], bin: "high" },
    ],
  },
  {
    id: "shower-glass",
    name: "Shower Glass",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "sg-curtain" },
    options: [
      { id: "sg-curtain", name: "Tension Rod + Liner", estPrice: 80, material_tags: ["fabric"], finish_tags: ["white"], bin: "budget" },
      { id: "sg-sliding", name: "Frameless Sliding Door", estPrice: 780, material_tags: ["glass", "framed"], finish_tags: ["brushed"], bin: "mid" },
      { id: "sg-fixed", name: "Fixed Frameless Glass Panel", estPrice: 1280, material_tags: ["glass", "frameless"], finish_tags: ["matte"], bin: "high" },
    ],
  },
  {
    id: "tub",
    name: "Tub",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "tub-alcove" },
    options: [
      { id: "tub-alcove", name: 'Standard 60" Alcove Tub', estPrice: 480, material_tags: ["acrylic", "alcove"], finish_tags: ["white"], bin: "budget" },
      { id: "tub-drop", name: "Drop-In Soaking Tub", estPrice: 880, material_tags: ["acrylic", "drop_in"], finish_tags: ["white"], bin: "mid" },
      { id: "tub-freestanding", name: "Freestanding Soaking Tub", estPrice: 1480, material_tags: ["acrylic", "freestanding"], finish_tags: ["matte"], bin: "high" },
    ],
  },
  {
    id: "tub-fixtures",
    name: "Tub Fixtures",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "tf-chrome" },
    options: [
      { id: "tf-chrome", name: "Chrome Tub Spout + Valve", estPrice: 220, material_tags: ["chrome"], finish_tags: ["polished"], bin: "budget" },
      { id: "tf-brushed", name: "Brushed Nickel Tub Filler", estPrice: 420, material_tags: ["brushed_nickel"], finish_tags: ["brushed"], bin: "mid" },
      { id: "tf-floor", name: "Matte Black Floor-Mount Filler", estPrice: 780, material_tags: ["matte_black"], finish_tags: ["matte"], bin: "high" },
    ],
  },

  // ── Surfaces ───────────────────────────────────────────────────────
  {
    id: "floor-tile",
    name: "Floor Tile",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "ft-porcelain" },
    options: [
      { id: "ft-porcelain", name: "Wood-Look Porcelain Plank", estPrice: 480, material_tags: ["porcelain"], finish_tags: ["matte"], bin: "budget" },
      { id: "ft-hex", name: 'Large-Format 12" Porcelain', estPrice: 880, material_tags: ["porcelain"], finish_tags: ["honed"], bin: "mid" },
      { id: "ft-marble", name: "Marble-Look Slab Porcelain", estPrice: 1450, material_tags: ["marble", "porcelain"], finish_tags: ["honed"], bin: "high" },
    ],
  },

  // ── Finishing Touches ──────────────────────────────────────────────
  {
    id: "toilet",
    name: "Toilet",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "toilet-twopiece" },
    options: [
      { id: "toilet-twopiece", name: "Two-Piece Elongated Toilet", estPrice: 220, material_tags: ["porcelain"], finish_tags: ["white"], bin: "budget" },
      { id: "toilet-onepiece", name: "One-Piece Skirted Toilet", estPrice: 380, material_tags: ["porcelain"], finish_tags: ["white"], bin: "mid" },
      { id: "toilet-smart", name: "Smart Bidet Toilet", estPrice: 620, material_tags: ["porcelain", "smart"], finish_tags: ["white"], bin: "high" },
    ],
  },
  {
    id: "accessories",
    name: "Accessories",
    swap_config: { allowed_bins: ["budget", "mid", "high", "luxury"], backup_option_id: "acc-basic" },
    options: [
      { id: "acc-basic", name: "Towel Bar + Hook + TP Holder", estPrice: 110, material_tags: ["chrome"], finish_tags: ["polished"], bin: "budget" },
      { id: "acc-coordinated", name: "Coordinated Hardware Set", estPrice: 220, material_tags: ["brushed_nickel"], finish_tags: ["brushed"], bin: "mid" },
      { id: "acc-designer", name: "Designer Hardware + Niche Shelf", estPrice: 380, material_tags: ["matte_black"], finish_tags: ["matte"], bin: "high" },
    ],
  },
];

/** Visual groupings for package + customize pages. */
export const CATALOG_GROUPS: { label: string; categoryIds: string[] }[] = [
  { label: "Vanity Area", categoryIds: ["vanity", "fixtures", "mirror", "lighting"] },
  { label: "Shower & Tub", categoryIds: ["tile", "shower-floor-tile", "shower-trim", "shower-glass", "tub", "tub-fixtures"] },
  { label: "Surfaces", categoryIds: ["floor-tile"] },
  { label: "Finishing Touches", categoryIds: ["toilet", "accessories"] },
];

const tierBins: Record<TierId, PriceBin[]> = {
  essential: ["budget", "mid"],
  balanced: ["mid", "high"],
  premium: ["high", "luxury"],
};

const buildSlots = (defaults: Record<string, string>, tier: TierId) => {
  const out: NonNullable<CatalogPackage["slots"]> = {};
  for (const cat of CATEGORIES) {
    const def = defaults[cat.id];
    const backups = cat.options.filter((o) => o.id !== def).map((o) => o.id);
    out[cat.id] = { preferred_bins: tierBins[tier], backup_option_ids: backups };
  }
  return out;
};

// ---------------------------------------------------------------------
// 12-package matrix: 4 styles × 3 tiers.
// Defaults are tuned per style + tier so packages truly reflect both axes.
// ---------------------------------------------------------------------

import type { StyleId } from "./types";

type SlotDefaults = Record<string, string>;

// Default helpers — reused so we don't repeat identical IDs across styles
// for categories that don't yet have style-specific options.
const SHARED_ESS: SlotDefaults = {
  mirror: "mirror-frameless",
  "shower-floor-tile": "sft-mosaic",
  "shower-trim": "st-chrome",
  "shower-glass": "sg-curtain",
  tub: "tub-alcove",
  "tub-fixtures": "tf-chrome",
  "floor-tile": "ft-porcelain",
  toilet: "toilet-twopiece",
  accessories: "acc-basic",
};
const SHARED_BAL: SlotDefaults = {
  mirror: "mirror-framed",
  "shower-floor-tile": "sft-pebble",
  "shower-trim": "st-brushed",
  "shower-glass": "sg-sliding",
  tub: "tub-drop",
  "tub-fixtures": "tf-brushed",
  "floor-tile": "ft-hex",
  toilet: "toilet-onepiece",
  accessories: "acc-coordinated",
};
const SHARED_PRE: SlotDefaults = {
  mirror: "mirror-led",
  "shower-floor-tile": "sft-marble-hex",
  "shower-trim": "st-rainhand",
  "shower-glass": "sg-fixed",
  tub: "tub-freestanding",
  "tub-fixtures": "tf-floor",
  "floor-tile": "ft-marble",
  toilet: "toilet-smart",
  accessories: "acc-designer",
};

const STYLE_DEFAULTS: Record<StyleId, Record<TierId, SlotDefaults>> = {
  modern: {
    essential: { vanity: "vanity-std",      tile: "tile-subway",          fixtures: "fix-matteblack", lighting: "light-flush",   ...SHARED_ESS },
    balanced:  { vanity: "vanity-floating", tile: "tile-marble",          fixtures: "fix-matteblack", lighting: "light-sconces", ...SHARED_BAL },
    premium:   { vanity: "vanity-double",   tile: "tile-marble-polished", fixtures: "fix-matteblack", lighting: "light-layered", ...SHARED_PRE },
  },
  classic: {
    essential: { vanity: "vanity-std",      tile: "tile-subway",          fixtures: "fix-chrome",    lighting: "light-flush",   ...SHARED_ESS },
    balanced:  { vanity: "vanity-floating", tile: "tile-subway",          fixtures: "fix-brushed",   lighting: "light-sconces", ...SHARED_BAL },
    premium:   { vanity: "vanity-double",   tile: "tile-marble",          fixtures: "fix-brushed",   lighting: "light-layered", ...SHARED_PRE },
  },
  spa: {
    essential: { vanity: "vanity-std",          tile: "tile-zellige",     fixtures: "fix-brushed", lighting: "light-flush",   ...SHARED_ESS },
    balanced:  { vanity: "vanity-floating",     tile: "tile-zellige",     fixtures: "fix-brass",   lighting: "light-sconces", ...SHARED_BAL },
    premium:   { vanity: "vanity-floating-walnut", tile: "tile-marble",   fixtures: "fix-brass",   lighting: "light-layered", ...SHARED_PRE },
  },
  minimal: {
    essential: { vanity: "vanity-std",      tile: "tile-subway", fixtures: "fix-chrome",    lighting: "light-flush",   ...SHARED_ESS },
    balanced:  { vanity: "vanity-floating", tile: "tile-marble", fixtures: "fix-matteblack", lighting: "light-flush",   ...SHARED_BAL },
    premium:   { vanity: "vanity-floating", tile: "tile-marble", fixtures: "fix-matteblack", lighting: "light-sconces", ...SHARED_PRE },
  },
};

const STYLE_LABEL: Record<StyleId, string> = {
  modern: "Modern", classic: "Classic", spa: "Spa", minimal: "Minimal",
};

// Tier metadata — labor anchor only; product totals are layered on top
// by compute_pricing so the "Starting at" estimate is the real number.
const TIER_META: Record<TierId, { name: string; tagline: string; basePrice: number }> = {
  essential: { name: "Essential", tagline: "Clean refresh with reliable finishes.", basePrice: 5200 },
  balanced:  { name: "Balanced",  tagline: "Designer materials, smart trade-offs.", basePrice: 6200 },
  premium:   { name: "Premium",   tagline: "High-end materials, layered design.",   basePrice: 11700 },
};

export function getPackageId(style: StyleId | undefined, tier: TierId): string {
  return style ? `${style}-${tier}` : tier;
}

/** Sum of all default item prices for a (style, tier). */
export function getDefaultsTotal(style: StyleId | undefined, tier: TierId): number {
  const defaults = (style ? STYLE_DEFAULTS[style] : STYLE_DEFAULTS.modern)[tier];
  let sum = 0;
  for (const cat of CATEGORIES) {
    const id = defaults[cat.id];
    const opt = id ? cat.options.find((o) => o.id === id) ?? cat.dynamic_pool?.find((o) => o.id === id) : undefined;
    sum += opt?.estPrice ?? 0;
  }
  return sum;
}

/** Style-aware package builder. */
export function getPackageFor(style: StyleId | undefined, tier: TierId): CatalogPackage {
  const tierMeta = TIER_META[tier];
  const defaults = style ? STYLE_DEFAULTS[style][tier] : STYLE_DEFAULTS.modern[tier];
  const id = getPackageId(style, tier);
  const name = style ? `${STYLE_LABEL[style]} — ${tierMeta.name}` : tierMeta.name;

  // Modern Balanced overlay — keep curated spec naming/tagline; basePrice is
  // chosen so basePrice + defaultsTotal lands in the spec's stated range.
  if (style === "modern" && tier === "balanced") {
    try {
      const spec = MODERN_BALANCED;
      const [lo, hi] = spec.priceRange.total;
      const target = Math.round((lo + hi) / 2);
      const itemsTotal = getDefaultsTotal("modern", "balanced");
      const base = Math.max(0, target - itemsTotal);
      return {
        id,
        name: spec.name,
        tagline: spec.bins.vanity.customerText,
        basePrice: base,
        defaults,
        slots: buildSlots(defaults, tier),
      };
    } catch {
      // fall through
    }
  }

  return {
    id,
    name,
    tagline: tierMeta.tagline,
    basePrice: tierMeta.basePrice,
    defaults,
    slots: buildSlots(defaults, tier),
  };
}

// Backwards-compatible tier-only PACKAGES map (used by Tier.tsx for pricing).
export const PACKAGES: Record<TierId, CatalogPackage> = {
  essential: getPackageFor(undefined, "essential"),
  balanced:  getPackageFor(undefined, "balanced"),
  premium:   getPackageFor(undefined, "premium"),
};

export const TIER_BINS = tierBins;

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getOption = (catId: string, optId: string) => {
  const cat = getCategory(catId);
  if (!cat) return undefined;
  return cat.options.find((o) => o.id === optId) || cat.dynamic_pool?.find((o) => o.id === optId);
};

/** All candidate options the engine may consider for a category. */
export const getAllCandidates = (catId: string) => {
  const cat = getCategory(catId);
  if (!cat) return [];
  return [...cat.options, ...(cat.dynamic_pool ?? [])];
};

/** "Starting at" estimate = labor anchor + sum of default item prices. */
export function getPackageStartingPrice(style: StyleId | undefined, tier: TierId): number {
  return getPackageFor(style, tier).basePrice + getDefaultsTotal(style, tier);
}
