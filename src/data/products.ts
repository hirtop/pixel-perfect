/**
 * BOBOX Remodel — Product Data Foundation
 *
 * This module defines the canonical product type and standard categories
 * used across packages, customization, and detail views.
 *
 * Currently populated with curated mock data. When a real vendor/product
 * layer is introduced, swap the data source while keeping the same types.
 */

// ─── Standard Categories ────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "Vanity",
  "Tile",
  "Faucet",
  "Lighting",
  "Mirror",
  "Toilet",
  "Shower / Tub Hardware",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// ─── Product Type ───────────────────────────────────────────────────

export interface Product {
  /** Unique identifier — use a slug or SKU-style string */
  id: string;
  /** Human-readable product name */
  name: string;
  /** Standard category from PRODUCT_CATEGORIES */
  category: ProductCategory;
  /** Vendor or brand name */
  vendor: string;
  /** Price in USD cents for precision; display helpers convert to dollars */
  price: number;
  /** Short description shown in cards / tooltips */
  description: string;
  /** Finish direction (e.g. "Brushed Nickel", "Matte Black") */
  finish?: string;
  /** URL to product image — local asset path or remote URL */
  image?: string;
  /** Affiliate or outbound product link */
  link?: string;
  /** Optional legal / affiliate disclaimer */
  disclaimer?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Format a dollar-denominated number (NOT cents) for display */
export const formatPrice = (dollars: number) =>
  `$${dollars.toLocaleString()}`;

// ─── Default Package Products ───────────────────────────────────────
// Each package tier maps to a curated set of products per category.

export const balancedProducts: Product[] = [
  {
    id: "bal-vanity-01",
    name: "Floating oak vanity with quartz top",
    category: "Vanity",
    vendor: "BOBOX Curated",
    price: 1850,
    description: "Adds warmth while keeping the room feeling open",
    finish: "Natural Oak",
  },
  {
    id: "bal-tile-01",
    name: "Large-format porcelain in warm gray",
    category: "Tile",
    vendor: "BOBOX Curated",
    price: 2200,
    description: "Low-maintenance with a refined, modern feel",
    finish: "Warm Gray",
  },
  {
    id: "bal-faucet-01",
    name: "Single-handle brushed nickel faucet",
    category: "Faucet",
    vendor: "BOBOX Curated",
    price: 380,
    description: "Clean lines that complement the vanity hardware",
    finish: "Brushed Nickel",
  },
  {
    id: "bal-lighting-01",
    name: "Dual wall sconces, frosted glass",
    category: "Lighting",
    vendor: "BOBOX Curated",
    price: 520,
    description: "Even, flattering light without harsh overhead glare",
    finish: "Brushed Nickel",
  },
  {
    id: "bal-mirror-01",
    name: "Frameless rectangular mirror with shelf ledge",
    category: "Mirror",
    vendor: "BOBOX Curated",
    price: 340,
    description: "Keeps the space feeling open and minimal",
  },
  {
    id: "bal-toilet-01",
    name: "Elongated comfort-height toilet",
    category: "Toilet",
    vendor: "BOBOX Curated",
    price: 650,
    description: "Modern profile with easy-clean features",
  },
  {
    id: "bal-shower-01",
    name: "Rain showerhead with handheld combo",
    category: "Shower / Tub Hardware",
    vendor: "BOBOX Curated",
    price: 460,
    description: "Spa-like feel without a full fixture overhaul",
    finish: "Brushed Nickel",
  },
];

// ─── Alternative Products (for customization swaps) ─────────────────

export interface ProductAlternative extends Product {
  /** Price impact relative to the default product in this category */
  priceImpact: number;
}

export const balancedAlternatives: Record<ProductCategory, ProductAlternative[]> = {
  Vanity: [
    {
      id: "alt-vanity-01",
      name: "White shaker vanity with integrated sink",
      category: "Vanity",
      vendor: "BOBOX Curated",
      price: 1650,
      description: "Classic look, easy to clean",
      finish: "White",
      priceImpact: -200,
    },
    {
      id: "alt-vanity-02",
      name: "Walnut double-drawer vanity",
      category: "Vanity",
      vendor: "BOBOX Curated",
      price: 2300,
      description: "Rich tone with extra storage",
      finish: "Walnut",
      priceImpact: 450,
    },
    {
      id: "alt-vanity-03",
      name: "Minimal wall-mounted vanity",
      category: "Vanity",
      vendor: "BOBOX Curated",
      price: 1500,
      description: "Ultra-clean, space-saving profile",
      finish: "Matte White",
      priceImpact: -350,
    },
  ],
  Tile: [
    {
      id: "alt-tile-01",
      name: "Subway tile in soft white",
      category: "Tile",
      vendor: "BOBOX Curated",
      price: 1800,
      description: "Timeless and budget-friendly",
      finish: "Glossy White",
      priceImpact: -400,
    },
    {
      id: "alt-tile-02",
      name: "Natural marble mosaic accent",
      category: "Tile",
      vendor: "BOBOX Curated",
      price: 3000,
      description: "Luxurious focal point",
      finish: "Carrara White",
      priceImpact: 800,
    },
  ],
  Faucet: [
    {
      id: "alt-faucet-01",
      name: "Widespread brushed nickel faucet",
      category: "Faucet",
      vendor: "BOBOX Curated",
      price: 500,
      description: "Traditional spread, same finish",
      finish: "Brushed Nickel",
      priceImpact: 120,
    },
    {
      id: "alt-faucet-02",
      name: "Matte black single-handle faucet",
      category: "Faucet",
      vendor: "BOBOX Curated",
      price: 380,
      description: "Bold contrast, modern edge",
      finish: "Matte Black",
      priceImpact: 0,
    },
  ],
  Lighting: [
    {
      id: "alt-lighting-01",
      name: "LED vanity light bar",
      category: "Lighting",
      vendor: "BOBOX Curated",
      price: 370,
      description: "Bright, even illumination",
      finish: "Chrome",
      priceImpact: -150,
    },
    {
      id: "alt-lighting-02",
      name: "Brass pendant sconces",
      category: "Lighting",
      vendor: "BOBOX Curated",
      price: 800,
      description: "Warm accent lighting",
      finish: "Antique Brass",
      priceImpact: 280,
    },
  ],
  Mirror: [
    {
      id: "alt-mirror-01",
      name: "Round brass-framed mirror",
      category: "Mirror",
      vendor: "BOBOX Curated",
      price: 430,
      description: "Soft shape, warm accent",
      finish: "Brass",
      priceImpact: 90,
    },
    {
      id: "alt-mirror-02",
      name: "Medicine cabinet with mirror front",
      category: "Mirror",
      vendor: "BOBOX Curated",
      price: 520,
      description: "Hidden storage, clean look",
      priceImpact: 180,
    },
  ],
  Toilet: [
    {
      id: "alt-toilet-01",
      name: "Wall-hung toilet",
      category: "Toilet",
      vendor: "BOBOX Curated",
      price: 1050,
      description: "Sleek, easy to clean underneath",
      priceImpact: 400,
    },
    {
      id: "alt-toilet-02",
      name: "Standard round-front toilet",
      category: "Toilet",
      vendor: "BOBOX Curated",
      price: 450,
      description: "Compact and budget-friendly",
      priceImpact: -200,
    },
  ],
  "Shower / Tub Hardware": [
    {
      id: "alt-shower-01",
      name: "Standard single showerhead",
      category: "Shower / Tub Hardware",
      vendor: "BOBOX Curated",
      price: 280,
      description: "Simple and reliable",
      finish: "Chrome",
      priceImpact: -180,
    },
    {
      id: "alt-shower-02",
      name: "Thermostatic shower system",
      category: "Shower / Tub Hardware",
      vendor: "BOBOX Curated",
      price: 1010,
      description: "Precise temp control, premium feel",
      finish: "Brushed Nickel",
      priceImpact: 550,
    },
  ],
};

/**
 * Look up the default product for a given category in the balanced package.
 */
export const getDefaultProduct = (category: ProductCategory): Product | undefined =>
  balancedProducts.find((p) => p.category === category);

/**
 * Look up alternatives for a given category.
 */
export const getAlternatives = (category: ProductCategory): ProductAlternative[] =>
  balancedAlternatives[category] || [];
