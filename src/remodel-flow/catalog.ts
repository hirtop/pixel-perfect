import type { CatalogCategory, CatalogPackage, TierId } from "./types";

// Minimal, self-contained catalog for the new flow. No dependency on legacy data.
export const CATEGORIES: CatalogCategory[] = [
  {
    id: "vanity",
    name: "Vanity",
    options: [
      { id: "vanity-std", name: "Standard 30\" Vanity", estPrice: 600 },
      { id: "vanity-floating", name: "Floating Oak Vanity", estPrice: 1450 },
      { id: "vanity-double", name: "Double Stone-Top Vanity", estPrice: 2400 },
    ],
  },
  {
    id: "tile",
    name: "Wall Tile",
    options: [
      { id: "tile-subway", name: "Classic White Subway", estPrice: 480 },
      { id: "tile-zellige", name: "Handmade Zellige", estPrice: 1380 },
      { id: "tile-marble", name: "Honed Marble Slab Look", estPrice: 2100 },
    ],
  },
  {
    id: "fixtures",
    name: "Fixtures",
    options: [
      { id: "fix-chrome", name: "Chrome Essentials Set", estPrice: 320 },
      { id: "fix-brushed", name: "Brushed Nickel Suite", estPrice: 720 },
      { id: "fix-matteblack", name: "Matte Black Designer Suite", estPrice: 1180 },
    ],
  },
  {
    id: "lighting",
    name: "Lighting",
    options: [
      { id: "light-flush", name: "Flush LED", estPrice: 140 },
      { id: "light-sconces", name: "Sconce Pair + Vanity", estPrice: 420 },
      { id: "light-layered", name: "Layered Designer Lighting", estPrice: 880 },
    ],
  },
];

export const PACKAGES: Record<TierId, CatalogPackage> = {
  essential: {
    id: "essential",
    name: "Essential",
    tagline: "Clean refresh with reliable finishes.",
    basePrice: 8900,
    defaults: {
      vanity: "vanity-std",
      tile: "tile-subway",
      fixtures: "fix-chrome",
      lighting: "light-flush",
    },
  },
  balanced: {
    id: "balanced",
    name: "Balanced",
    tagline: "Designer materials, smart trade-offs.",
    basePrice: 14500,
    defaults: {
      vanity: "vanity-floating",
      tile: "tile-zellige",
      fixtures: "fix-brushed",
      lighting: "light-sconces",
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "High-end materials, layered design.",
    basePrice: 22500,
    defaults: {
      vanity: "vanity-double",
      tile: "tile-marble",
      fixtures: "fix-matteblack",
      lighting: "light-layered",
    },
  },
};

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const getOption = (catId: string, optId: string) =>
  getCategory(catId)?.options.find((o) => o.id === optId);
