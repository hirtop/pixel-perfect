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

/** The 4 categories users can actively customize */
export const CUSTOMIZABLE_CATEGORIES: ProductCategory[] = ["Vanity", "Tile", "Faucet", "Mirror"];

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

export const formatPrice = (dollars: number) => {
  if (dollars < 0) return `-$${Math.abs(dollars).toLocaleString()}`;
  return `$${dollars.toLocaleString()}`;
};

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
    name: '48" Floating Vanity with Quartz Top',
    category: "Vanity",
    vendor: "Home Decorators Collection",
    price: 1850,
    description: "Wall-mounted to keep floor visible — helps compact baths feel larger",
    finish: "Natural Oak / White Quartz",
    image: vanityImg,
    tag: "Recommended",
    spec: '48" W × 22" D, soft-close drawers, pre-drilled for single-hole faucet',
  },
  {
    id: "bal-tile-01",
    name: "Large-Format Porcelain in Warm Gray",
    category: "Tile",
    vendor: "Daltile",
    price: 2200,
    description: "Fewer grout lines means easier cleaning and a more seamless look",
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
    description: "Minimal profile with ceramic cartridge rated for 500K cycles",
    finish: "Brushed Nickel",
    image: faucetImg,
    spec: "Single-hole mount, ceramic disc valve, 1.2 GPM WaterSense",
  },
  {
    id: "bal-lighting-01",
    name: "Dual Wall Sconces — Frosted Glass",
    category: "Lighting",
    vendor: "Kichler",
    price: 520,
    description: "Flanking sconces reduce under-eye shadows from overhead lighting",
    finish: "Brushed Nickel",
    spec: "Dimmable LED, 2700K warm white",
  },
  {
    id: "bal-mirror-01",
    name: '36" Frameless Mirror with Shelf',
    category: "Mirror",
    vendor: "Glacier Bay",
    price: 340,
    description: "Tempered glass with polished edge — shelf holds everyday items",
    image: mirrorImg,
    spec: '36" W × 28" H, ½" tempered glass, 4" integrated shelf',
  },
  {
    id: "bal-toilet-01",
    name: "Drake II Elongated Toilet",
    category: "Toilet",
    vendor: "TOTO",
    price: 650,
    description: "1.28 GPF Tornado flush — saves ~4,000 gal/year vs older toilets",
    spec: 'Comfort height, CEFIONTECT glaze, 12" rough-in',
  },
  {
    id: "bal-shower-01",
    name: "Attract Magnetix Rain Combo",
    category: "Shower / Tub Hardware",
    vendor: "Moen",
    price: 460,
    description: "Magnetic dock keeps handheld in place — no sagging bracket",
    finish: "Brushed Nickel",
    spec: '8" rain head + handheld wand, 2.5 GPM',
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
      name: '36" Shaker Vanity with Integrated Sink',
      category: "Vanity",
      vendor: "Glacier Bay",
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
      name: '48" Double-Drawer Vanity — Walnut',
      category: "Vanity",
      vendor: "West Elm",
      price: 2380,
      description: "Dovetail walnut drawers with extra storage depth",
      finish: "Walnut / White Quartz",
      image: vanityAlt2Img,
      laborDelta: 0,
      tag: "Premium Pick",
      spec: '48" W × 22" D, dovetail drawers, pre-drilled single-hole',
      laborNote: "Same counter-top mount — no added labor",
    },
    {
      id: "alt-vanity-03",
      name: '30" Wall-Mounted Vanity',
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
      name: '3×6" Subway Tile — Glossy White',
      category: "Tile",
      vendor: "Daltile",
      price: 1400,
      description: "Classic pattern, widely available for easy future repairs",
      finish: "Glossy White",
      image: tileAlt1Img,
      laborDelta: 150,
      tag: "Budget Pick",
      spec: '3" × 6" ceramic, ~85 sq ft',
      laborNote: "Smaller tiles mean more grout lines — adds ~$150 labor",
    },
    {
      id: "alt-tile-02",
      name: '2" Hex Marble Mosaic — Carrara',
      category: "Tile",
      vendor: "Ann Sacks",
      price: 3200,
      description: "Natural stone with unique veining — requires annual sealing",
      finish: "Honed Carrara White",
      image: tileAlt2Img,
      laborDelta: 450,
      tag: "Premium Pick",
      spec: '2" hex mosaic on mesh backing, ~85 sq ft',
      laborNote: "Mosaic setting is precision work — adds ~$450 labor",
    },
  ],
  Faucet: [
    {
      id: "alt-faucet-01",
      name: 'Purist 8" Widespread Faucet',
      category: "Faucet",
      vendor: "Kohler",
      price: 520,
      description: "Three-hole spread — check that your vanity top supports 8\" centers",
      finish: "Brushed Nickel",
      image: faucetAlt1Img,
      laborDelta: 120,
      spec: '8" center spread, ceramic disc valves, 1.2 GPM',
      laborNote: "Wider spread may need vanity top re-drill — adds ~$120",
    },
    {
      id: "alt-faucet-02",
      name: "Litze Pull-Down Faucet",
      category: "Faucet",
      vendor: "Brizo",
      price: 485,
      description: "Pull-down sprayer adds utility; matte black resists fingerprints",
      finish: "Matte Black",
      image: faucetAlt2Img,
      laborDelta: 0,
      tag: "Trending",
      spec: "Single-hole, pull-down sprayer",
      laborNote: "Same single-hole mount — material cost change only",
    },
  ],
  Lighting: [
    {
      id: "alt-lighting-01",
      name: '36" LED Vanity Bar',
      category: "Lighting",
      vendor: "Kichler",
      price: 370,
      description: "Single bar fixture with even horizontal wash",
      finish: "Chrome",
      laborDelta: 0,
      spec: '36" wide, 3000K, dimmable',
      laborNote: "Same wiring — simple swap",
    },
    {
      id: "alt-lighting-02",
      name: "Brass Pendant Sconces (Pair)",
      category: "Lighting",
      vendor: "Schoolhouse Electric",
      price: 810,
      description: "Cast brass with exposed bulb — warm accent lighting",
      finish: "Antique Brass",
      laborDelta: 180,
      tag: "Designer Pick",
      spec: '8" shade, E26 base, pair included',
      laborNote: "May need junction box repositioning — adds ~$180",
    },
  ],
  Mirror: [
    {
      id: "alt-mirror-01",
      name: '30" Round Brass-Framed Mirror',
      category: "Mirror",
      vendor: "CB2",
      price: 430,
      description: "Round shape softens angular tile and vanity lines",
      finish: "Antiqued Brass",
      image: mirrorAlt1Img,
      laborDelta: 0,
      tag: "Trending",
      spec: '30" diameter, solid brass frame',
      laborNote: "Simple wall hang — no labor change",
    },
    {
      id: "alt-mirror-02",
      name: '30" Recessed Medicine Cabinet',
      category: "Mirror",
      vendor: "Robern",
      price: 640,
      description: "Mirror-front hides 4\" of storage — keeps counter clear",
      image: mirrorAlt2Img,
      laborDelta: 350,
      tag: "Most Storage",
      spec: '30" W × 26" H × 4" D, recessed mount, slow-close hinges',
      laborNote: "Recessed install requires wall cavity cut — adds ~$350",
    },
  ],
  Toilet: [
    {
      id: "alt-toilet-01",
      name: "Starck 3 Wall-Hung Toilet",
      category: "Toilet",
      vendor: "Duravit",
      price: 1050,
      description: "Wall-hung for easy floor cleaning — requires in-wall carrier",
      laborDelta: 800,
      tag: "Premium Pick",
      spec: "In-wall carrier required, 1.28 GPF",
      laborNote: "In-wall carrier adds ~$800 labor (framing + patching)",
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
      spec: '1.28 GPF, 12" rough-in, EverClean surface',
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
      description: "Fixed-mount, straightforward — threads onto existing arm",
      finish: "Chrome",
      laborDelta: 0,
      spec: '6" fixed head, 1.75 GPM WaterSense',
      laborNote: "Threads onto existing arm — no labor change",
    },
    {
      id: "alt-shower-02",
      name: "Grohtherm Thermostatic Shower System",
      category: "Shower / Tub Hardware",
      vendor: "Grohe",
      price: 1120,
      description: "Maintains temp within ±2°F — prevents scalding",
      finish: "Brushed Nickel",
      laborDelta: 550,
      tag: "Premium Pick",
      spec: "Thermostatic valve + 10\" rain head",
      laborNote: "Thermostatic valve requires dedicated rough-in — adds ~$550",
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
  const finish = project.style_preferences?.finish || "";
  const hasBathroomType = bathroomType.length > 0;

  // Layout insight — only show if user actually provided bathroom type
  if (bathroomType.toLowerCase().includes("full")) {
    insights.push({ icon: "layout", label: "Full bath with tub/shower combo", detail: "Keeping existing tub avoids $2,000+ in plumbing relocation" });
  } else if (bathroomType.toLowerCase().includes("half") || bathroomType.toLowerCase().includes("powder")) {
    insights.push({ icon: "layout", label: "Powder room — vanity + toilet only", detail: "No wet-area tile needed — lowers material and labor scope" });
  } else if (bathroomType.toLowerCase().includes("primary") || bathroomType.toLowerCase().includes("master")) {
    insights.push({ icon: "layout", label: "Primary bath — likely dual fixtures", detail: "Products sized for double vanity and separate shower" });
  } else if (hasBathroomType) {
    insights.push({ icon: "layout", label: "Single-vanity layout", detail: "Products sized for one sink, one mirror footprint" });
  }

  // Size insight — only show if dimensions were provided
  if (sqft > 0) {
    if (sqft < 40) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — compact bath`, detail: "Space-saving products prioritized to avoid crowding" });
    } else if (sqft < 70) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — standard size`, detail: 'Fits a 48" vanity and standard tub/shower — no layout constraints' });
    } else {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — spacious layout`, detail: "Room for upgrades like a double vanity or freestanding tub" });
    }
  }

  // Finish insight — only show if user selected one
  if (finish) {
    insights.push({ icon: "style", label: `${finish} finish selected`, detail: "Faucet, lighting, and hardware coordinated to this finish" });
  }

  // Only return insights we can actually justify
  return insights;
}

// ─── Package fit reasons ────────────────────────────────────────────

export const packageFitReasons: Record<string, string> = {
  Budget: "Refreshes all visible surfaces on your existing plumbing — least disruption, fastest install.",
  Balanced: "Upgrades materials and finishes without moving plumbing — keeps labor costs predictable.",
  Premium: "Designer-grade materials with flexibility to change the layout if needed.",
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
    description: "New vanity, updated tile, modern fixtures — all on existing plumbing. No layout changes.",
  },
  Balanced: {
    materialRange: "$7,500 – $10,200",
    laborRange: "$5,000 – $7,500",
    projectRange: "$14,000 – $19,000",
    description: "Better materials and coordinated finishes that noticeably upgrade how the room looks and feels. Plumbing stays in place.",
  },
  Premium: {
    materialRange: "$13,000 – $18,500",
    laborRange: "$7,500 – $11,500",
    projectRange: "$22,000 – $32,000",
    description: "Designer-grade materials with the option to relocate fixtures, add niches, or change the tub/shower layout.",
  },
};
