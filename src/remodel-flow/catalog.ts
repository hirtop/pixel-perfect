import type { CatalogCategory, CatalogPackage, PriceBin, TierId } from "./types";
import { MODERN_BALANCED } from "./packages/modern-balanced";

// Self-contained catalog. Engine metadata (material_tags, finish_tags, bin,
// swap_config, package slots, dynamic_pool) is consumed by the resolver engine.
// The UI continues to read only id/name/estPrice and is not affected.

export const CATEGORIES: CatalogCategory[] = [
  {
    id: "vanity",
    name: "Vanity",
    swap_config: {
      allowed_bins: ["budget", "mid", "high", "luxury"],
      backup_option_id: "vanity-std",
    },
    options: [
      {
        id: "vanity-std",
        name: 'Standard 30" Vanity',
        estPrice: 600,
        material_tags: ["laminate", "freestanding"],
        finish_tags: ["white"],
        bin: "budget",
      },
      {
        id: "vanity-floating",
        name: "Floating Oak Vanity",
        estPrice: 1450,
        material_tags: ["oak", "floating"],
        finish_tags: ["natural_wood"],
        bin: "mid",
      },
      {
        id: "vanity-double",
        name: "Double Stone-Top Vanity",
        estPrice: 2400,
        material_tags: ["walnut", "stone_top", "freestanding"],
        finish_tags: ["honed"],
        bin: "high",
      },
    ],
    dynamic_pool: [
      {
        id: "vanity-floating-walnut",
        name: "Floating Walnut Vanity",
        estPrice: 1850,
        material_tags: ["walnut", "floating"],
        finish_tags: ["natural_wood"],
        bin: "high",
      },
    ],
  },
  {
    id: "tile",
    name: "Wall Tile",
    swap_config: {
      allowed_bins: ["budget", "mid", "high", "luxury"],
      backup_option_id: "tile-subway",
    },
    options: [
      {
        id: "tile-subway",
        name: "Classic White Subway",
        estPrice: 480,
        material_tags: ["porcelain", "subway"],
        finish_tags: ["polished"],
        bin: "budget",
      },
      {
        id: "tile-zellige",
        name: "Handmade Zellige",
        estPrice: 1380,
        material_tags: ["zellige", "handmade"],
        finish_tags: ["honed"],
        bin: "mid",
      },
      {
        id: "tile-marble",
        name: "Honed Marble Slab Look",
        estPrice: 2100,
        material_tags: ["marble", "porcelain"],
        finish_tags: ["honed"],
        bin: "high",
      },
    ],
    dynamic_pool: [
      {
        id: "tile-marble-polished",
        name: "Polished Marble Slab",
        estPrice: 2800,
        material_tags: ["marble"],
        finish_tags: ["polished"],
        bin: "luxury",
      },
    ],
  },
  {
    id: "fixtures",
    name: "Fixtures",
    swap_config: {
      allowed_bins: ["budget", "mid", "high", "luxury"],
      backup_option_id: "fix-chrome",
    },
    options: [
      {
        id: "fix-chrome",
        name: "Chrome Essentials Set",
        estPrice: 320,
        material_tags: ["chrome"],
        finish_tags: ["polished"],
        bin: "budget",
      },
      {
        id: "fix-brushed",
        name: "Brushed Nickel Suite",
        estPrice: 720,
        material_tags: ["brushed_nickel"],
        finish_tags: ["brushed"],
        bin: "mid",
      },
      {
        id: "fix-matteblack",
        name: "Matte Black Designer Suite",
        estPrice: 1180,
        material_tags: ["matte_black"],
        finish_tags: ["matte"],
        bin: "high",
      },
    ],
    dynamic_pool: [
      {
        id: "fix-brass",
        name: "Unlacquered Brass Suite",
        estPrice: 1450,
        material_tags: ["brass"],
        finish_tags: ["natural"],
        bin: "high",
      },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    swap_config: {
      allowed_bins: ["budget", "mid", "high", "luxury"],
      backup_option_id: "light-flush",
    },
    options: [
      {
        id: "light-flush",
        name: "Flush LED",
        estPrice: 140,
        material_tags: ["flush"],
        finish_tags: ["white"],
        bin: "budget",
      },
      {
        id: "light-sconces",
        name: "Sconce Pair + Vanity",
        estPrice: 420,
        material_tags: ["sconce"],
        finish_tags: ["brushed"],
        bin: "mid",
      },
      {
        id: "light-layered",
        name: "Layered Designer Lighting",
        estPrice: 880,
        material_tags: ["layered", "sconce", "pendant"],
        finish_tags: ["matte"],
        bin: "high",
      },
    ],
    dynamic_pool: [
      {
        id: "light-pendant",
        name: "Statement Pendant",
        estPrice: 540,
        material_tags: ["pendant"],
        finish_tags: ["brushed"],
        bin: "mid",
      },
    ],
  },
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
    const backups = cat.options
      .filter((o) => o.id !== def)
      .map((o) => o.id);
    out[cat.id] = {
      preferred_bins: tierBins[tier],
      backup_option_ids: backups,
    };
  }
  return out;
};

// ---------------------------------------------------------------------
// 12-package matrix: 4 styles × 3 tiers.
// Defaults are tuned per style + tier so packages truly reflect both axes.
// ---------------------------------------------------------------------

import type { StyleId } from "./types";

type SlotDefaults = Record<string, string>;

const STYLE_DEFAULTS: Record<StyleId, Record<TierId, SlotDefaults>> = {
  modern: {
    essential: { vanity: "vanity-std",      tile: "tile-subway",  fixtures: "fix-matteblack",  lighting: "light-flush" },
    balanced:  { vanity: "vanity-floating", tile: "tile-marble",  fixtures: "fix-matteblack",  lighting: "light-sconces" },
    premium:   { vanity: "vanity-double",   tile: "tile-marble-polished", fixtures: "fix-matteblack", lighting: "light-layered" },
  },
  classic: {
    essential: { vanity: "vanity-std",      tile: "tile-subway",  fixtures: "fix-chrome",      lighting: "light-flush" },
    balanced:  { vanity: "vanity-floating", tile: "tile-subway",  fixtures: "fix-brushed",     lighting: "light-sconces" },
    premium:   { vanity: "vanity-double",   tile: "tile-marble",  fixtures: "fix-brushed",     lighting: "light-layered" },
  },
  spa: {
    essential: { vanity: "vanity-std",      tile: "tile-zellige", fixtures: "fix-brushed",     lighting: "light-flush" },
    balanced:  { vanity: "vanity-floating", tile: "tile-zellige", fixtures: "fix-brass",       lighting: "light-sconces" },
    premium:   { vanity: "vanity-floating-walnut", tile: "tile-marble", fixtures: "fix-brass", lighting: "light-layered" },
  },
  minimal: {
    essential: { vanity: "vanity-std",      tile: "tile-subway",  fixtures: "fix-chrome",      lighting: "light-flush" },
    balanced:  { vanity: "vanity-floating", tile: "tile-marble",  fixtures: "fix-matteblack",  lighting: "light-flush" },
    premium:   { vanity: "vanity-floating", tile: "tile-marble",  fixtures: "fix-matteblack",  lighting: "light-sconces" },
  },
};

const STYLE_LABEL: Record<StyleId, string> = {
  modern: "Modern",
  classic: "Classic",
  spa: "Spa",
  minimal: "Minimal",
};

const TIER_META: Record<TierId, { name: string; tagline: string; basePrice: number }> = {
  essential: { name: "Essential", tagline: "Clean refresh with reliable finishes.",     basePrice: 8900 },
  balanced:  { name: "Balanced",  tagline: "Designer materials, smart trade-offs.",     basePrice: 14500 },
  premium:   { name: "Premium",   tagline: "High-end materials, layered design.",       basePrice: 22500 },
};

/** Style-aware package builder. Falls back to `balanced` defaults shape. */
export function getPackageFor(style: StyleId | undefined, tier: TierId): CatalogPackage {
  const tierMeta = TIER_META[tier];
  const defaults = style
    ? STYLE_DEFAULTS[style][tier]
    : STYLE_DEFAULTS.modern[tier];
  const id = style ? `${style}-${tier}` : tier;
  const name = style ? `${STYLE_LABEL[style]} — ${tierMeta.name}` : tierMeta.name;
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
  return (
    cat.options.find((o) => o.id === optId) ||
    cat.dynamic_pool?.find((o) => o.id === optId)
  );
};

/** All candidate options the engine may consider for a category. */
export const getAllCandidates = (catId: string) => {
  const cat = getCategory(catId);
  if (!cat) return [];
  return [...cat.options, ...(cat.dynamic_pool ?? [])];
};
