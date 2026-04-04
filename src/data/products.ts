/**
 * BOBOX Remodel — Product Data Foundation
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
  id: string;
  name: string;
  category: ProductCategory;
  vendor: string;
  price: number;
  description: string;
  finish?: string;
  image?: string;
  link?: string;
  disclaimer?: string;
  /** e.g. "Best Value", "Premium Pick", "Editor's Choice" */
  tag?: string;
  /** Material or dimensions spec */
  spec?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

export const formatPrice = (dollars: number) =>
  `$${dollars.toLocaleString()}`;

// ─── Product images ─────────────────────────────────────────────────
import vanityImg from "@/assets/products/vanity-balanced.jpg";
import tileImg from "@/assets/products/tile-balanced.jpg";
import faucetImg from "@/assets/products/faucet-balanced.jpg";
import mirrorImg from "@/assets/products/mirror-balanced.jpg";
import vanityAlt1Img from "@/assets/products/vanity-alt1.jpg";
import vanityAlt2Img from "@/assets/products/vanity-alt2.jpg";
import vanityAlt3Img from "@/assets/products/vanity-alt3.jpg";
import tileAlt1Img from "@/assets/products/tile-alt1.jpg";
import tileAlt2Img from "@/assets/products/tile-alt2.jpg";
import faucetAlt1Img from "@/assets/products/faucet-alt1.jpg";
import faucetAlt2Img from "@/assets/products/faucet-alt2.jpg";
import mirrorAlt1Img from "@/assets/products/mirror-alt1.jpg";
import mirrorAlt2Img from "@/assets/products/mirror-alt2.jpg";

// ─── Default Package Products ───────────────────────────────────────

export const balancedProducts: Product[] = [
  {
    id: "bal-vanity-01",
    name: "Floating Oak Vanity with Quartz Top",
    category: "Vanity",
    vendor: "Stonewood Home",
    price: 1850,
    description: "Wall-mounted to keep floor visible — makes compact baths feel larger",
    finish: "Natural Oak / White Quartz",
    image: vanityImg,
    tag: "Recommended",
    spec: '48" W × 22" D, soft-close drawers, pre-drilled for single-hole faucet',
  },
  {
    id: "bal-tile-01",
    name: "Large-Format Porcelain in Warm Gray",
    category: "Tile",
    vendor: "Centura Surfaces",
    price: 2200,
    description: "Fewer grout lines = easier cleaning and a more seamless wall look",
    finish: "Warm Gray Matte",
    image: tileImg,
    tag: "Best Value",
    spec: '24" × 48" rectified panels, ~85 sq ft coverage, rated for wet areas',
  },
  {
    id: "bal-faucet-01",
    name: "Trinsic Single-Handle Faucet",
    category: "Faucet",
    vendor: "Delta",
    price: 385,
    description: "Minimal profile pairs with any vanity; ceramic cartridge rated 500K cycles",
    finish: "Brushed Nickel",
    image: faucetImg,
    spec: "Single-hole mount, ceramic disc valve, 1.2 GPM WaterSense",
  },
  {
    id: "bal-lighting-01",
    name: "Lyric Dual Wall Sconces",
    category: "Lighting",
    vendor: "Visual Comfort",
    price: 520,
    description: "Flanking sconces eliminate under-eye shadows that overhead lights create",
    finish: "Brushed Nickel",
    spec: "Dimmable LED, 2700K warm white, ADA-compliant projection",
  },
  {
    id: "bal-mirror-01",
    name: "Frameless Rectangular Mirror with Shelf",
    category: "Mirror",
    vendor: "Restoration Modern",
    price: 340,
    description: "Tempered glass with polished edge — shelf holds everyday essentials",
    image: mirrorImg,
    spec: '36" W × 28" H, ½" tempered glass, 4" integrated shelf',
  },
  {
    id: "bal-toilet-01",
    name: "Drake II Elongated Toilet",
    category: "Toilet",
    vendor: "TOTO",
    price: 650,
    description: "Tornado flush uses 1.28 GPF — saves ~4,000 gal/year over older models",
    spec: 'ADA comfort height, CEFIONTECT glaze, 12" rough-in',
  },
  {
    id: "bal-shower-01",
    name: "Attract Magnetix Rain Combo",
    category: "Shower / Tub Hardware",
    vendor: "Moen",
    price: 460,
    description: "Magnetic dock keeps handheld in place — no sagging bracket over time",
    finish: "Brushed Nickel",
    spec: '8" rain head + handheld wand, 2.5 GPM, connects to standard ½" arm',
  },
];

// ─── Alternative Products (for customization swaps) ─────────────────

export interface ProductAlternative extends Product {
  /** Absolute labor adjustment in dollars (positive = more labor) */
  laborDelta: number;
  /** Explanation of how this swap affects labor/budget */
  laborNote?: string;
}

export const balancedAlternatives: Record<ProductCategory, ProductAlternative[]> = {
  Vanity: [
    {
      id: "alt-vanity-01",
      name: "Hampton 36\" Shaker Vanity",
      category: "Vanity",
      vendor: "Home Decorators Collection",
      price: 1420,
      description: "Freestanding with integrated ceramic sink — no separate top to seal",
      finish: "White",
      image: vanityAlt1Img,
      laborDelta: 0,
      tag: "Budget Pick",
      spec: '36" W × 21" D, solid birch frame, soft-close doors',
      laborNote: "Same plumbing rough-in — no added labor",
    },
    {
      id: "alt-vanity-02",
      name: "Mid-Century 48\" Double-Drawer Vanity",
      category: "Vanity",
      vendor: "West Elm",
      price: 2380,
      description: "Dovetail walnut drawers add storage depth without widening footprint",
      finish: "Walnut / White Quartz",
      image: vanityAlt2Img,
      laborDelta: 0,
      tag: "Premium Pick",
      spec: '48" W × 22" D, dovetail drawers, pre-drilled single-hole',
      laborNote: "Same counter-top mount — no added labor",
    },
    {
      id: "alt-vanity-03",
      name: "Modway 30\" Wall-Mounted Vanity",
      category: "Vanity",
      vendor: "AllModern",
      price: 1280,
      description: "Compact wall-hung design frees floor space in tight layouts",
      finish: "Matte White",
      image: vanityAlt3Img,
      laborDelta: 250,
      tag: "Space Saver",
      spec: '30" W × 18" D, wall-mount hardware included',
      laborNote: "Wall-mount requires in-wall blocking — adds ~$250 labor",
    },
  ],
  Tile: [
    {
      id: "alt-tile-01",
      name: "Classic 3×6 Subway Tile",
      category: "Tile",
      vendor: "Daltile",
      price: 1400,
      description: "Timeless pattern, widely available for easy future repairs",
      finish: "Glossy White",
      image: tileAlt1Img,
      laborDelta: 150,
      tag: "Budget Pick",
      spec: '3" × 6" ceramic, ~85 sq ft, ⅛" grout joint recommended',
      laborNote: "Smaller tiles = more grout lines — adds ~$150 labor",
    },
    {
      id: "alt-tile-02",
      name: "Carrara Hex Marble Mosaic",
      category: "Tile",
      vendor: "Ann Sacks",
      price: 3200,
      description: "Natural veining makes each installation unique — sealing required annually",
      finish: "Honed Carrara White",
      image: tileAlt2Img,
      laborDelta: 450,
      tag: "Premium Pick",
      spec: '2" hex mosaic on mesh backing, ~85 sq ft',
      laborNote: "Mosaic patterns require precision setting — adds ~$450 labor",
    },
  ],
  Faucet: [
    {
      id: "alt-faucet-01",
      name: "Purist 8\" Widespread Faucet",
      category: "Faucet",
      vendor: "Kohler",
      price: 520,
      description: "Three-hole spread requires wider counter punch — check vanity compatibility",
      finish: "Brushed Nickel",
      image: faucetAlt1Img,
      laborDelta: 120,
      spec: '8" center spread, ceramic disc valves, 1.2 GPM',
      laborNote: "Wider spread may need vanity top re-drill — adds ~$120 labor",
    },
    {
      id: "alt-faucet-02",
      name: "Litze Pull-Down Faucet",
      category: "Faucet",
      vendor: "Brizo",
      price: 485,
      description: "Pull-down sprayer adds utility — matte black is fingerprint-resistant",
      finish: "Matte Black",
      image: faucetAlt2Img,
      laborDelta: 0,
      tag: "Trending",
      spec: "Single-hole, pull-down sprayer, MagneDock",
      laborNote: "Same single-hole mount — material cost change only",
    },
  ],
  Lighting: [
    {
      id: "alt-lighting-01",
      name: "Integrity 36\" LED Vanity Bar",
      category: "Lighting",
      vendor: "Kichler",
      price: 370,
      description: "Single bar fixture replaces dual sconces with even horizontal wash",
      finish: "Chrome",
      laborDelta: 0,
      spec: '36" wide, 3000K, dimmable, 1700 lumens',
      laborNote: "Simple swap — same junction box and wiring",
    },
    {
      id: "alt-lighting-02",
      name: "Otis Brass Pendant Sconces (Pair)",
      category: "Lighting",
      vendor: "Schoolhouse Electric",
      price: 810,
      description: "Cast brass with exposed bulb — adds warmth in modern or transitional baths",
      finish: "Antique Brass",
      laborDelta: 180,
      tag: "Designer Pick",
      spec: '8" shade diameter, E26 base, pair included',
      laborNote: "May need junction box repositioning — adds ~$180 labor",
    },
  ],
  Mirror: [
    {
      id: "alt-mirror-01",
      name: "Gerald 30\" Round Brass Mirror",
      category: "Mirror",
      vendor: "CB2",
      price: 430,
      description: "Round shape softens angular tile and vanity lines",
      finish: "Antiqued Brass",
      image: mirrorAlt1Img,
      laborDelta: 0,
      tag: "Trending",
      spec: '30" diameter, solid brass frame, D-ring mount',
      laborNote: "Simple wall hang — no labor impact",
    },
    {
      id: "alt-mirror-02",
      name: "M-Series 30\" Recessed Medicine Cabinet",
      category: "Mirror",
      vendor: "Robern",
      price: 640,
      description: "Mirror-front hides 4\" deep storage — keeps counter clutter-free",
      image: mirrorAlt2Img,
      laborDelta: 350,
      tag: "Editor's Choice",
      spec: '30" W × 26" H × 4" D, recessed mount, slow-close hinges',
      laborNote: "Recessed install requires wall cavity cut — adds ~$350 labor",
    },
  ],
  Toilet: [
    {
      id: "alt-toilet-01",
      name: "Starck 3 Wall-Hung Toilet",
      category: "Toilet",
      vendor: "Duravit",
      price: 1050,
      description: "Exposes floor for easy cleaning — requires in-wall carrier frame",
      laborDelta: 800,
      tag: "Premium Pick",
      spec: "In-wall carrier required, Rimless flush, 1.28 GPF",
      laborNote: "In-wall carrier frame adds ~$800 labor (framing + tile patching)",
    },
    {
      id: "alt-toilet-02",
      name: "Cadet PRO Round-Front Toilet",
      category: "Toilet",
      vendor: "American Standard",
      price: 420,
      description: "Compact round bowl saves 2\" depth in tight layouts",
      laborDelta: 0,
      tag: "Budget Pick",
      spec: "Round front, 1.28 GPF, 12\" rough-in, EverClean surface",
      laborNote: "Direct swap on existing flange — no added labor",
    },
  ],
  "Shower / Tub Hardware": [
    {
      id: "alt-shower-01",
      name: "Adler Single Showerhead",
      category: "Shower / Tub Hardware",
      vendor: "Moen",
      price: 180,
      description: "Fixed-mount, no-frills reliability — easy DIY swap",
      finish: "Chrome",
      laborDelta: 0,
      spec: '6" fixed head, 1.75 GPM WaterSense',
      laborNote: "Threads onto existing arm — no labor change",
    },
    {
      id: "alt-shower-02",
      name: "Grohtherm SmartControl Shower System",
      category: "Shower / Tub Hardware",
      vendor: "Grohe",
      price: 1120,
      description: "Thermostatic valve maintains temp within ±2°F — prevents scalding",
      finish: "Brushed Nickel",
      laborDelta: 550,
      tag: "Premium Pick",
      spec: "Thermostatic valve + 10\" rain head, ½\" connections",
      laborNote: "Thermostatic valve requires dedicated rough-in — adds ~$550 labor",
    },
  ],
};

export const getDefaultProduct = (category: ProductCategory): Product | undefined =>
  balancedProducts.find((p) => p.category === category);

export const getAlternatives = (category: ProductCategory): ProductAlternative[] =>
  balancedAlternatives[category] || [];

// ─── Bathroom Analysis (simulated inference) ────────────────────────

export interface BathroomInsight {
  icon: "layout" | "style" | "fixture" | "scope";
  label: string;
  detail: string;
}

export function getBathroomInsights(project: {
  bathroom_type?: string;
  dimensions?: { width_ft?: string; length_ft?: string };
  style_preferences?: { style?: string; budget_level?: string; finish?: string };
  photos?: { metadata?: { name: string }[] };
}): BathroomInsight[] {
  const insights: BathroomInsight[] = [];
  const bathroomType = project.bathroom_type || "";
  const width = Number(project.dimensions?.width_ft) || 0;
  const length = Number(project.dimensions?.length_ft) || 0;
  const sqft = width && length ? width * length : 0;
  const style = project.style_preferences?.style || "";
  const budget = project.style_preferences?.budget_level || "Balanced";
  const finish = project.style_preferences?.finish || "";
  const photoCount = project.photos?.metadata?.length || 0;

  // Layout insight — specific to bathroom type
  if (bathroomType.toLowerCase().includes("full")) {
    insights.push({ icon: "layout", label: "Full bath with tub/shower combo", detail: "Keeping existing tub position avoids $2,000+ in plumbing relocation" });
  } else if (bathroomType.toLowerCase().includes("half") || bathroomType.toLowerCase().includes("powder")) {
    insights.push({ icon: "layout", label: "Powder room — vanity + toilet only", detail: "No wet-area tile needed, which lowers material and labor scope" });
  } else if (bathroomType.toLowerCase().includes("primary") || bathroomType.toLowerCase().includes("master")) {
    insights.push({ icon: "layout", label: "Primary bath — likely dual fixtures", detail: "Double vanity and separate shower stall assumed for product sizing" });
  } else {
    insights.push({ icon: "layout", label: "Standard single-vanity layout", detail: "One sink, one mirror — products sized for single-fixture footprint" });
  }

  // Size insight with remodel-relevant detail
  if (sqft > 0) {
    if (sqft < 40) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — compact bath`, detail: "Prioritizing wall-mount and space-saving products to avoid crowding" });
    } else if (sqft < 70) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — standard size`, detail: "Room fits a 48\" vanity and standard tub/shower — no layout constraints" });
    } else {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — spacious layout`, detail: "Extra room opens options like a freestanding tub or double vanity upgrade" });
    }
  }

  // Finish / style insight — actionable, not fluffy
  if (finish) {
    insights.push({ icon: "style", label: `${finish} finish direction`, detail: `All hardware, faucets, and lighting matched to ${finish.toLowerCase()} for a coordinated look` });
  } else if (style) {
    insights.push({ icon: "style", label: `${style} design direction`, detail: `Product finishes and profiles selected to complement a ${style.toLowerCase()} aesthetic` });
  } else {
    insights.push({ icon: "style", label: "Brushed nickel finish assumed", detail: "Most versatile finish — pairs with warm and cool palettes. Change anytime in Style & Budget." });
  }

  // Photo insight — specific about what photos enable
  if (photoCount > 0) {
    insights.push({ icon: "fixture", label: `${photoCount} room photo${photoCount > 1 ? "s" : ""} reviewed`, detail: "Existing fixture positions and finish tones factored into product matches" });
  }

  return insights.slice(0, 4);
}

// ─── Package fit reasons ────────────────────────────────────────────

export const packageFitReasons: Record<string, string> = {
  Budget: "Preserves your existing plumbing footprint and refreshes all visible surfaces — least disruption, fastest install.",
  Balanced: "Upgrades fixtures and finishes without moving plumbing — brightens the space while keeping labor costs predictable.",
  Premium: "Full material upgrade with designer-grade finishes and optional layout changes — maximum visual transformation.",
};

// ─── Package tier pricing ───────────────────────────────────────────

export const packagePricing: Record<string, {
  materialRange: string;
  laborRange: string;
  projectRange: string;
  description: string;
}> = {
  Budget: {
    materialRange: "$4,200 – $5,800",
    laborRange: "$3,500 – $5,200",
    projectRange: "$8,500 – $12,000",
    description: "A focused refresh — new vanity, updated tile, modern fixtures — without moving any plumbing or altering the layout.",
  },
  Balanced: {
    materialRange: "$7,500 – $10,200",
    laborRange: "$5,000 – $7,500",
    projectRange: "$14,000 – $19,000",
    description: "Quality materials and coordinated finishes that transform how the room looks and feels, while keeping plumbing in place.",
  },
  Premium: {
    materialRange: "$13,000 – $18,500",
    laborRange: "$7,500 – $11,500",
    projectRange: "$22,000 – $32,000",
    description: "Designer-grade materials with flexibility to relocate fixtures, add niches, or upgrade to freestanding tub and frameless glass.",
  },
};
