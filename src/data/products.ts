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
    description: "Adds warmth while keeping the room feeling open",
    finish: "Natural Oak",
    image: vanityImg,
    tag: "Recommended",
    spec: "48\" W × 22\" D, soft-close drawers",
  },
  {
    id: "bal-tile-01",
    name: "Large-Format Porcelain in Warm Gray",
    category: "Tile",
    vendor: "Centura Surfaces",
    price: 2200,
    description: "Low-maintenance with a refined, modern feel",
    finish: "Warm Gray Matte",
    image: tileImg,
    tag: "Best Value",
    spec: "24\" × 48\" panels, ~85 sq ft coverage",
  },
  {
    id: "bal-faucet-01",
    name: "Single-Handle Brushed Nickel Faucet",
    category: "Faucet",
    vendor: "Delta",
    price: 380,
    description: "Clean lines that complement the vanity hardware",
    finish: "Brushed Nickel",
    image: faucetImg,
    spec: "Single-hole mount, ceramic valve",
  },
  {
    id: "bal-lighting-01",
    name: "Dual Wall Sconces, Frosted Glass",
    category: "Lighting",
    vendor: "Visual Comfort",
    price: 520,
    description: "Even, flattering light without harsh overhead glare",
    finish: "Brushed Nickel",
    spec: "Dimmable, 2700K warm white",
  },
  {
    id: "bal-mirror-01",
    name: "Frameless Rectangular Mirror with Shelf",
    category: "Mirror",
    vendor: "Restoration Modern",
    price: 340,
    description: "Keeps the space feeling open and minimal",
    image: mirrorImg,
    spec: '36" W × 28" H, tempered glass',
  },
  {
    id: "bal-toilet-01",
    name: "Elongated Comfort-Height Toilet",
    category: "Toilet",
    vendor: "TOTO",
    price: 650,
    description: "Modern profile with easy-clean features",
    spec: "ADA-compliant, 1.28 GPF",
  },
  {
    id: "bal-shower-01",
    name: "Rain Showerhead with Handheld Combo",
    category: "Shower / Tub Hardware",
    vendor: "Moen",
    price: 460,
    description: "Spa-like feel without a full fixture overhaul",
    finish: "Brushed Nickel",
    spec: '10" rain head + handheld wand',
  },
];

// ─── Alternative Products (for customization swaps) ─────────────────

export interface ProductAlternative extends Product {
  priceImpact: number;
  /** Explanation of how this swap affects labor/budget */
  laborNote?: string;
}

export const balancedAlternatives: Record<ProductCategory, ProductAlternative[]> = {
  Vanity: [
    {
      id: "alt-vanity-01",
      name: "White Shaker Vanity with Integrated Sink",
      category: "Vanity",
      vendor: "Home Decorators",
      price: 1650,
      description: "Classic look, easy to clean",
      finish: "White",
      image: vanityAlt1Img,
      priceImpact: -200,
      tag: "Budget Pick",
      spec: '36" W × 21" D, solid wood frame',
      laborNote: "Same plumbing footprint — no added labor",
    },
    {
      id: "alt-vanity-02",
      name: "Walnut Double-Drawer Vanity",
      category: "Vanity",
      vendor: "West Elm",
      price: 2300,
      description: "Rich tone with extra storage",
      finish: "Walnut",
      image: vanityAlt2Img,
      priceImpact: 450,
      tag: "Premium Pick",
      spec: '48" W × 22" D, dovetail drawers',
      laborNote: "Same plumbing footprint — no added labor",
    },
    {
      id: "alt-vanity-03",
      name: "Minimal Wall-Mounted Vanity",
      category: "Vanity",
      vendor: "AllModern",
      price: 1500,
      description: "Ultra-clean, space-saving profile",
      finish: "Matte White",
      image: vanityAlt3Img,
      priceImpact: -350,
      tag: "Space Saver",
      spec: '30" W × 18" D, wall-hung install',
      laborNote: "Wall-mount requires blocking — minor labor increase",
    },
  ],
  Tile: [
    {
      id: "alt-tile-01",
      name: "Subway Tile in Soft White",
      category: "Tile",
      vendor: "Daltile",
      price: 1800,
      description: "Timeless and budget-friendly",
      finish: "Glossy White",
      image: tileAlt1Img,
      priceImpact: -400,
      tag: "Budget Pick",
      spec: '3" × 6", ~85 sq ft coverage',
      laborNote: "Smaller tile means more grout lines — labor stays similar",
    },
    {
      id: "alt-tile-02",
      name: "Natural Marble Mosaic Accent",
      category: "Tile",
      vendor: "Ann Sacks",
      price: 3000,
      description: "Luxurious focal point",
      finish: "Carrara White",
      image: tileAlt2Img,
      priceImpact: 800,
      tag: "Premium Pick",
      spec: "2\" hex mosaic, ~85 sq ft",
      laborNote: "Labor increased due to mosaic pattern precision work",
    },
  ],
  Faucet: [
    {
      id: "alt-faucet-01",
      name: "Widespread Brushed Nickel Faucet",
      category: "Faucet",
      vendor: "Kohler",
      price: 500,
      description: "Traditional spread, same finish",
      finish: "Brushed Nickel",
      image: faucetAlt1Img,
      priceImpact: 120,
      spec: "8\" spread, ceramic disc valves",
      laborNote: "Wider spread may need vanity top modification",
    },
    {
      id: "alt-faucet-02",
      name: "Matte Black Single-Handle Faucet",
      category: "Faucet",
      vendor: "Brizo",
      price: 380,
      description: "Bold contrast, modern edge",
      finish: "Matte Black",
      image: faucetAlt2Img,
      priceImpact: 0,
      tag: "Trending",
      spec: "Single-hole, pull-down sprayer",
      laborNote: "Premium faucet finish — material cost only",
    },
  ],
  Lighting: [
    {
      id: "alt-lighting-01",
      name: "LED Vanity Light Bar",
      category: "Lighting",
      vendor: "Kichler",
      price: 370,
      description: "Bright, even illumination",
      finish: "Chrome",
      priceImpact: -150,
      spec: "36\" wide, 3000K, dimmable",
      laborNote: "Simple swap — same wiring as sconces",
    },
    {
      id: "alt-lighting-02",
      name: "Brass Pendant Sconces",
      category: "Lighting",
      vendor: "Schoolhouse",
      price: 800,
      description: "Warm accent lighting",
      finish: "Antique Brass",
      priceImpact: 280,
      tag: "Designer Pick",
      spec: "Pair, 8\" shade, E26 base",
      laborNote: "May need junction box repositioning — slight labor increase",
    },
  ],
  Mirror: [
    {
      id: "alt-mirror-01",
      name: "Round Brass-Framed Mirror",
      category: "Mirror",
      vendor: "CB2",
      price: 430,
      description: "Soft shape, warm accent",
      finish: "Brass",
      image: mirrorAlt1Img,
      priceImpact: 90,
      tag: "Trending",
      spec: '30" diameter, solid brass frame',
      laborNote: "Simple hang — no labor impact",
    },
    {
      id: "alt-mirror-02",
      name: "Medicine Cabinet with Mirror Front",
      category: "Mirror",
      vendor: "Robern",
      price: 520,
      description: "Hidden storage, clean look",
      image: mirrorAlt2Img,
      priceImpact: 180,
      tag: "Editor's Choice",
      spec: '30" W × 26" H, recessed mount',
      laborNote: "Recessed mount requires wall cavity — moderate labor add",
    },
  ],
  Toilet: [
    {
      id: "alt-toilet-01",
      name: "Wall-Hung Toilet",
      category: "Toilet",
      vendor: "Duravit",
      price: 1050,
      description: "Sleek, easy to clean underneath",
      priceImpact: 400,
      tag: "Premium Pick",
      spec: "In-wall carrier required",
      laborNote: "Wall carrier installation adds significant labor",
    },
    {
      id: "alt-toilet-02",
      name: "Standard Round-Front Toilet",
      category: "Toilet",
      vendor: "American Standard",
      price: 450,
      description: "Compact and budget-friendly",
      priceImpact: -200,
      tag: "Budget Pick",
      spec: "1.6 GPF, compact bowl",
      laborNote: "Direct swap — no added labor",
    },
  ],
  "Shower / Tub Hardware": [
    {
      id: "alt-shower-01",
      name: "Standard Single Showerhead",
      category: "Shower / Tub Hardware",
      vendor: "Moen",
      price: 280,
      description: "Simple and reliable",
      finish: "Chrome",
      priceImpact: -180,
      spec: '6" fixed head, 2.5 GPM',
      laborNote: "Direct swap — no added labor",
    },
    {
      id: "alt-shower-02",
      name: "Thermostatic Shower System",
      category: "Shower / Tub Hardware",
      vendor: "Grohe",
      price: 1010,
      description: "Precise temp control, premium feel",
      finish: "Brushed Nickel",
      priceImpact: 550,
      tag: "Premium Pick",
      spec: "Thermostatic valve + rain head",
      laborNote: "Thermostatic valve requires dedicated rough-in — labor increase",
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
  const hasPhotos = (project.photos?.metadata?.length || 0) > 0;

  // Layout insight
  if (bathroomType.toLowerCase().includes("full")) {
    insights.push({ icon: "layout", label: "Full bathroom layout", detail: "Tub/shower combo likely — fixture relocation adds cost" });
  } else if (bathroomType.toLowerCase().includes("half") || bathroomType.toLowerCase().includes("powder")) {
    insights.push({ icon: "layout", label: "Half bath / powder room", detail: "Smaller footprint means faster install and lower labor" });
  } else if (bathroomType.toLowerCase().includes("primary") || bathroomType.toLowerCase().includes("master")) {
    insights.push({ icon: "layout", label: "Primary suite bathroom", detail: "Likely double vanity with separate shower and tub" });
  } else {
    insights.push({ icon: "layout", label: "Single-vanity layout detected", detail: "Keeping the current plumbing footprint saves labor costs" });
  }

  // Size insight
  if (sqft > 0) {
    if (sqft < 40) {
      insights.push({ icon: "scope", label: `Compact space (~${sqft} sq ft)`, detail: "Space-saving products prioritized for comfort" });
    } else if (sqft < 70) {
      insights.push({ icon: "scope", label: `Mid-size bathroom (~${sqft} sq ft)`, detail: "Good candidate for layout-neutral upgrades" });
    } else {
      insights.push({ icon: "scope", label: `Spacious layout (~${sqft} sq ft)`, detail: "Room for feature upgrades like double vanity or freestanding tub" });
    }
  }

  // Style insight
  if (style) {
    insights.push({ icon: "style", label: `${style} style preference`, detail: `Products curated around ${style.toLowerCase()} design direction` });
  } else if (finish) {
    insights.push({ icon: "style", label: `${finish} finish direction`, detail: "Hardware and fixtures coordinated to this finish" });
  } else {
    insights.push({ icon: "style", label: "Warm-neutral style inferred", detail: "Recommendations lean toward modern comfort and warmth" });
  }

  // Budget insight
  insights.push({
    icon: "scope",
    label: `${budget} budget priority`,
    detail: budget === "Budget"
      ? "Focused on essential upgrades with maximum value"
      : budget === "Premium"
        ? "Quality-first materials with designer-grade finishes"
        : "Balanced quality and value for long-term satisfaction",
  });

  // Photo insight
  if (hasPhotos) {
    insights.push({ icon: "fixture", label: "Room photos analyzed", detail: "Existing finishes and layout factored into recommendations" });
  }

  return insights.slice(0, 4);
}

// ─── Package fit reasons ────────────────────────────────────────────

export const packageFitReasons: Record<string, string> = {
  Budget: "Best value upgrade for outdated finishes",
  Balanced: "Best for brightening your bath without moving fixtures",
  Premium: "Best for a full design transformation with premium materials",
};
