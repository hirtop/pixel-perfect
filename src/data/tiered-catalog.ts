/**
 * BOBOX Remodel — Tier-Specific Product Catalog
 *
 * 36 products: 4 categories × 3 tiers × (1 default + 2 alternatives)
 * Same-tier swapping only for MVP.
 */

import type { ProductCategory } from "./products";

// ─── Existing images (Balanced tier only for now) ───────────────────
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

// ─── Types ──────────────────────────────────────────────────────────

export type ProductTier = "Budget" | "Balanced" | "Premium";

export interface TieredProduct {
  id: string;
  name: string;
  category: ProductCategory;
  tier: ProductTier;
  vendor: string;
  price: number;
  description: string;
  finish: string;
  spec: string;
  image?: string;
  isDefault: boolean;
  laborDelta: number;
  laborNote?: string;
  tag?: string;
  disclaimer?: string;
}

// ─── Tier base labor (before product-specific deltas) ───────────────

export const TIER_BASE_LABOR: Record<ProductTier, number> = {
  Budget: 3500,
  Balanced: 5500,
  Premium: 8500,
};

export const SHIPPING_ESTIMATE = 600;

// ─── Non-customizable static items per tier ─────────────────────────
// Lighting + Toilet + Shower/Tub Hardware — not swappable at MVP

export interface StaticItem {
  category: string;
  name: string;
  vendor: string;
  price: number;
}

export const STATIC_ITEMS: Record<ProductTier, StaticItem[]> = {
  Budget: [
    { category: "Lighting", name: '24" LED Vanity Bar', vendor: "Hampton Bay", price: 280 },
    { category: "Toilet", name: "Cadet PRO Round-Front Toilet", vendor: "American Standard", price: 420 },
    { category: "Shower / Tub Hardware", name: "Adler Single Showerhead", vendor: "Moen", price: 180 },
  ],
  Balanced: [
    { category: "Lighting", name: "Dual Wall Sconces — Frosted Glass", vendor: "Kichler", price: 520 },
    { category: "Toilet", name: "Drake II Elongated Toilet", vendor: "TOTO", price: 650 },
    { category: "Shower / Tub Hardware", name: "Attract Magnetix Rain Combo", vendor: "Moen", price: 460 },
  ],
  Premium: [
    { category: "Lighting", name: "Brass Pendant Sconces (Pair)", vendor: "Schoolhouse Electric", price: 810 },
    { category: "Toilet", name: "Starck 3 Wall-Hung Toilet", vendor: "Duravit", price: 1050 },
    { category: "Shower / Tub Hardware", name: "Grohtherm Thermostatic Shower System", vendor: "Grohe", price: 1120 },
  ],
};

export const getStaticItemsTotal = (tier: ProductTier): number =>
  STATIC_ITEMS[tier].reduce((sum, item) => sum + item.price, 0);

// ─── Full Tiered Catalog (36 products) ──────────────────────────────

export const tieredCatalog: TieredProduct[] = [

  // ════════════════════════════════════════════════════════════════════
  // VANITY
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────
  {
    id: "bud-vanity-01",
    name: '36" Shaker Vanity with Cultured Marble Top',
    category: "Vanity",
    tier: "Budget",
    vendor: "Glacier Bay",
    price: 1080,
    description: "Solid wood frame with pre-mounted cultured marble top — ready to connect",
    finish: "White",
    spec: '36" W × 21" D, soft-close doors, pre-drilled for single-hole faucet',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bud-vanity-02",
    name: '30" Single-Door Vanity with Integrated Sink',
    category: "Vanity",
    tier: "Budget",
    vendor: "Style Selections",
    price: 890,
    description: "Compact with integrated ceramic sink — no separate top to seal",
    finish: "Gray",
    spec: '30" W × 19" D, integrated ceramic basin, single door + shelf',
    isDefault: false,
    laborDelta: 0,
    tag: "Budget Pick",
  },
  {
    id: "bud-vanity-03",
    name: '36" Freestanding Vanity — Oak Laminate',
    category: "Vanity",
    tier: "Budget",
    vendor: "Allen + Roth",
    price: 1340,
    description: "Warm wood-look laminate with engineered quartz top — resists moisture",
    finish: "Honey Oak Laminate",
    spec: '36" W × 22" D, soft-close drawers, pre-drilled single-hole',
    isDefault: false,
    laborDelta: 0,
  },

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-vanity-01",
    name: '48" Floating Vanity with Quartz Top',
    category: "Vanity",
    tier: "Balanced",
    vendor: "Home Decorators Collection",
    price: 1850,
    description: "Wall-mounted to keep floor visible — helps compact baths feel larger",
    finish: "Natural Oak / White Quartz",
    spec: '48" W × 22" D, soft-close drawers, pre-drilled for single-hole faucet',
    image: vanityImg,
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bal-vanity-02",
    name: '42" Freestanding Vanity — Engineered Stone Top',
    category: "Vanity",
    tier: "Balanced",
    vendor: "Avanity",
    price: 1620,
    description: "Solid birch frame with undermount sink — cleaner lines than a drop-in",
    finish: "Espresso / Gray Quartz",
    spec: '42" W × 22" D, solid birch frame, dovetail drawer, undermount sink',
    image: vanityAlt1Img,
    isDefault: false,
    laborDelta: 0,
    tag: "Value Pick",
  },
  {
    id: "bal-vanity-03",
    name: '48" Double-Drawer Vanity — Walnut',
    category: "Vanity",
    tier: "Balanced",
    vendor: "West Elm",
    price: 2380,
    description: "Dovetail walnut drawers with deeper storage — solid wood throughout",
    finish: "Walnut / White Quartz",
    spec: '48" W × 22" D, dovetail drawers, pre-drilled single-hole',
    image: vanityAlt2Img,
    isDefault: false,
    laborDelta: 0,
    tag: "Upgrade",
  },

  // ── Premium ───────────────────────────────────────────────────────
  {
    id: "pre-vanity-01",
    name: '60" Floating Double Vanity — White Oak',
    category: "Vanity",
    tier: "Premium",
    vendor: "James Martin",
    price: 3400,
    description: "Solid white oak with Carrara marble top — fits primary baths with double sinks",
    finish: "White Oak / Carrara Marble",
    spec: '60" W × 22" D, dual sinks, soft-close, wall-mount hardware included',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    disclaimer: "Marble top requires periodic sealing (every 6–12 months)",
  },
  {
    id: "pre-vanity-02",
    name: '48" Wall-Mounted Vanity — Matte Lacquer',
    category: "Vanity",
    tier: "Premium",
    vendor: "Restoration Hardware",
    price: 2850,
    description: "Clean-line lacquer finish with concealed hardware — modern architectural look",
    finish: "Matte White / Quartz",
    spec: '48" W × 21" D, wall-mount requires in-wall blocking',
    isDefault: false,
    laborDelta: 250,
    laborNote: "Wall-mount needs in-wall blocking — adds ~$250",
    tag: "Modern Pick",
  },
  {
    id: "pre-vanity-03",
    name: '48" Furniture-Style Vanity — Solid Walnut',
    category: "Vanity",
    tier: "Premium",
    vendor: "West Elm",
    price: 3200,
    description: "Furniture-grade walnut with exposed legs — reads more like a console than a cabinet",
    finish: "Natural Walnut / White Marble",
    spec: '48" W × 22" D, tapered legs, single-hole pre-drill',
    isDefault: false,
    laborDelta: 0,
    tag: "Designer Pick",
    disclaimer: "Marble top requires periodic sealing (every 6–12 months)",
  },

  // ════════════════════════════════════════════════════════════════════
  // FAUCET
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────
  {
    id: "bud-faucet-01",
    name: "Banbury Single-Handle Faucet",
    category: "Faucet",
    tier: "Budget",
    vendor: "Moen",
    price: 145,
    description: "Reliable single-handle with LifeShine finish — resists tarnish and corrosion",
    finish: "Chrome",
    spec: "Single-hole mount, Moen cartridge, 1.2 GPM WaterSense",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bud-faucet-02",
    name: "Ladera Single-Handle Faucet",
    category: "Faucet",
    tier: "Budget",
    vendor: "Pfister",
    price: 165,
    description: "Slim profile with Pforever Seal — no-drip ceramic disc valve",
    finish: "Brushed Nickel",
    spec: 'Single-hole, ceramic disc, 1.2 GPM, 4" deck plate included',
    isDefault: false,
    laborDelta: 0,
  },
  {
    id: "bud-faucet-03",
    name: "Constructor Single-Handle Faucet",
    category: "Faucet",
    tier: "Budget",
    vendor: "Glacier Bay",
    price: 120,
    description: "Basic single-handle — gets the job done, easy to replace",
    finish: "Chrome",
    spec: "Single-hole mount, brass body, 1.2 GPM",
    isDefault: false,
    laborDelta: 0,
    tag: "Budget Pick",
  },

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-faucet-01",
    name: "Trinsic Single-Handle Faucet",
    category: "Faucet",
    tier: "Balanced",
    vendor: "Delta",
    price: 385,
    description: "Minimal profile with ceramic cartridge rated for 500K cycles",
    finish: "Brushed Nickel",
    spec: "Single-hole mount, ceramic disc valve, 1.2 GPM WaterSense",
    image: faucetImg,
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bal-faucet-02",
    name: 'Purist 8" Widespread Faucet',
    category: "Faucet",
    tier: "Balanced",
    vendor: "Kohler",
    price: 520,
    description: 'Three-hole spread — check that your vanity top supports 8" centers',
    finish: "Brushed Nickel",
    spec: '8" center spread, ceramic disc valves, 1.2 GPM',
    image: faucetAlt1Img,
    isDefault: false,
    laborDelta: 120,
    laborNote: "Wider spread may need vanity top re-drill — adds ~$120",
    tag: "Upgrade",
  },
  {
    id: "bal-faucet-03",
    name: "Litze Pull-Down Faucet",
    category: "Faucet",
    tier: "Balanced",
    vendor: "Brizo",
    price: 485,
    description: "Pull-down sprayer adds utility; matte black resists fingerprints",
    finish: "Matte Black",
    spec: "Single-hole, pull-down sprayer, 1.5 GPM",
    image: faucetAlt2Img,
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
  },

  // ── Premium ───────────────────────────────────────────────────────
  {
    id: "pre-faucet-01",
    name: "Holborn Widespread Faucet",
    category: "Faucet",
    tier: "Premium",
    vendor: "Rohl",
    price: 740,
    description: "Traditional widespread with cross handles — solid brass throughout",
    finish: "Satin Nickel",
    spec: '8" widespread, ceramic disc, 1.2 GPM',
    isDefault: true,
    laborDelta: 120,
    laborNote: "Widespread needs 3-hole vanity top — adds ~$120 if drilling required",
    tag: "Recommended",
  },
  {
    id: "pre-faucet-02",
    name: "Purist Wall-Mount Faucet",
    category: "Faucet",
    tier: "Premium",
    vendor: "Kohler",
    price: 680,
    description: "Frees up counter space — spout comes from the wall, not the vanity",
    finish: "Polished Nickel",
    spec: "Wall-mount, ceramic disc valve, 1.2 GPM, requires in-wall rough-in",
    isDefault: false,
    laborDelta: 280,
    laborNote: "Wall-mount requires in-wall valve rough-in — adds ~$280",
    tag: "Modern Pick",
  },
  {
    id: "pre-faucet-03",
    name: "Litze Wall-Mount Faucet",
    category: "Faucet",
    tier: "Premium",
    vendor: "Brizo",
    price: 820,
    description: "Architectural wall-mount with articulating spout — hand-finished",
    finish: "Luxe Gold",
    spec: "Wall-mount, solid brass, 1.2 GPM",
    isDefault: false,
    laborDelta: 280,
    laborNote: "Wall-mount requires in-wall valve rough-in — adds ~$280",
    tag: "Designer Pick",
  },

  // ════════════════════════════════════════════════════════════════════
  // TILE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────
  {
    id: "bud-tile-01",
    name: '12×24" Ceramic Tile — Light Gray',
    category: "Tile",
    tier: "Budget",
    vendor: "Daltile",
    price: 1050,
    description: "Mid-size format balances fewer grout lines with easy handling",
    finish: "Matte Light Gray",
    spec: '12" × 24" ceramic, ~85 sq ft coverage, rated for wet areas',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bud-tile-02",
    name: '3×6" Subway Tile — Glossy White',
    category: "Tile",
    tier: "Budget",
    vendor: "Daltile",
    price: 880,
    description: "Classic pattern, easy to source for repairs — smaller format adds ~$150 in labor",
    finish: "Glossy White",
    spec: '3" × 6" ceramic, ~85 sq ft',
    isDefault: false,
    laborDelta: 150,
    laborNote: "Smaller tiles mean more grout lines — adds ~$150 labor",
    tag: "Classic Pick",
  },
  {
    id: "bud-tile-03",
    name: '12×12" Ceramic Floor & Wall Tile',
    category: "Tile",
    tier: "Budget",
    vendor: "MSI",
    price: 780,
    description: "Simple square format — lowest material cost, straightforward install",
    finish: "Warm Beige Matte",
    spec: '12" × 12" ceramic, ~85 sq ft',
    isDefault: false,
    laborDelta: 0,
    tag: "Budget Pick",
  },

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-tile-01",
    name: '24×48" Porcelain Panel — Warm Gray',
    category: "Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 2200,
    description: "Fewer grout lines means easier cleaning and a more seamless look",
    finish: "Warm Gray Matte",
    spec: '24" × 48" rectified panels, ~85 sq ft coverage, rated for wet areas',
    image: tileImg,
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bal-tile-02",
    name: '4×12" Ceramic Tile — Glossy White',
    category: "Tile",
    tier: "Balanced",
    vendor: "Bedrosians",
    price: 1500,
    description: "Taller format than standard subway — fewer grout lines, more modern proportion",
    finish: "Glossy White",
    spec: '4" × 12" ceramic, ~85 sq ft, stacked or offset pattern',
    image: tileAlt1Img,
    isDefault: false,
    laborDelta: 100,
    laborNote: "Mid-size tile — slightly more cuts than large-format, adds ~$100",
    tag: "Value Pick",
  },
  {
    id: "bal-tile-03",
    name: '12×24" Porcelain — Marble Look',
    category: "Tile",
    tier: "Balanced",
    vendor: "Bedrosians",
    price: 2600,
    description: "Marble aesthetic without the sealing — porcelain is lower maintenance",
    finish: "Calacatta Matte",
    spec: '12" × 24" rectified porcelain, ~85 sq ft, rated for wet areas',
    image: tileAlt2Img,
    isDefault: false,
    laborDelta: 0,
    tag: "Upgrade",
  },

  // ── Premium ───────────────────────────────────────────────────────
  {
    id: "pre-tile-01",
    name: "Zellige Tile — Weathered White",
    category: "Tile",
    tier: "Premium",
    vendor: "Clé",
    price: 3800,
    description: "Hand-cut Moroccan tile — each piece has unique color variation and texture",
    finish: "Weathered White (varies)",
    spec: '4" × 4" hand-cut, ~85 sq ft, slight size variation is expected',
    isDefault: true,
    laborDelta: 500,
    laborNote: "Hand-cut tiles require careful layout and more setting time — adds ~$500",
    tag: "Recommended",
    disclaimer: "Handmade — color and size vary slightly between tiles. Requires sealing.",
  },
  {
    id: "pre-tile-02",
    name: '2" Hex Carrara Mosaic — Honed',
    category: "Tile",
    tier: "Premium",
    vendor: "Ann Sacks",
    price: 3400,
    description: "Classic marble hex — timeless pattern with natural stone depth",
    finish: "Honed Carrara White",
    spec: '2" hex mosaic on mesh backing, ~85 sq ft',
    isDefault: false,
    laborDelta: 450,
    laborNote: "Mosaic setting is precision work — adds ~$450 labor",
    tag: "Classic Pick",
    disclaimer: "Natural stone requires sealing before grouting and annually after",
  },
  {
    id: "pre-tile-03",
    name: "Handmade Ceramic — Sea Glass",
    category: "Tile",
    tier: "Premium",
    vendor: "Heath Ceramics",
    price: 4800,
    description: "Kiln-fired in Sausalito — rich glaze variation that changes with the light",
    finish: "Sea Glass (varied glaze)",
    spec: '3" × 6" handmade, ~85 sq ft, glaze variation is intentional',
    isDefault: false,
    laborDelta: 600,
    laborNote: "Handmade tiles need careful sorting and slower setting — adds ~$600",
    tag: "Designer Pick",
    disclaimer: "Handmade — glaze color varies between tiles and production runs",
  },

  // ════════════════════════════════════════════════════════════════════
  // MIRROR
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────
  {
    id: "bud-mirror-01",
    name: '30" Frameless Rectangular Mirror',
    category: "Mirror",
    tier: "Budget",
    vendor: "Glacier Bay",
    price: 95,
    description: "Polished-edge frameless — clean look, simple wall mount",
    finish: "Polished Edge",
    spec: '30" W × 24" H, ¼" tempered glass, French cleat mount',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bud-mirror-02",
    name: '24" Round Mirror — Thin Metal Frame',
    category: "Mirror",
    tier: "Budget",
    vendor: "Project Source",
    price: 110,
    description: "Round shape softens angular vanity and tile lines",
    finish: "Matte Black Frame",
    spec: '24" diameter, thin steel frame, keyhole mount',
    isDefault: false,
    laborDelta: 0,
  },
  {
    id: "bud-mirror-03",
    name: '36" Beveled Rectangle Mirror',
    category: "Mirror",
    tier: "Budget",
    vendor: "Home Decorators Collection",
    price: 145,
    description: "Beveled edge catches light — slightly more refined than frameless",
    finish: "Beveled Edge",
    spec: '36" W × 28" H, 1" bevel, D-ring mount',
    isDefault: false,
    laborDelta: 0,
  },

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-mirror-01",
    name: '36" Frameless Mirror with Shelf',
    category: "Mirror",
    tier: "Balanced",
    vendor: "Glacier Bay",
    price: 340,
    description: "Tempered glass with polished edge — shelf holds everyday items",
    finish: "Polished Edge",
    spec: '36" W × 28" H, ½" tempered glass, 4" integrated shelf',
    image: mirrorImg,
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
  },
  {
    id: "bal-mirror-02",
    name: '30" Round Brass-Framed Mirror',
    category: "Mirror",
    tier: "Balanced",
    vendor: "CB2",
    price: 430,
    description: "Round shape softens angular tile and vanity lines",
    finish: "Antiqued Brass",
    spec: '30" diameter, solid brass frame, flush mount',
    image: mirrorAlt1Img,
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
  },
  {
    id: "bal-mirror-03",
    name: '30" Recessed Medicine Cabinet',
    category: "Mirror",
    tier: "Balanced",
    vendor: "Robern",
    price: 640,
    description: 'Mirror-front hides 4" of storage — keeps counter clear',
    finish: "Mirror Front",
    spec: '30" W × 26" H × 4" D, recessed mount, slow-close hinges',
    image: mirrorAlt2Img,
    isDefault: false,
    laborDelta: 350,
    laborNote: "Recessed install requires wall cavity cut — adds ~$350",
    tag: "Most Storage",
  },

  // ── Premium ───────────────────────────────────────────────────────
  {
    id: "pre-mirror-01",
    name: '36" Backlit LED Mirror — Frameless',
    category: "Mirror",
    tier: "Premium",
    vendor: "Robern",
    price: 880,
    description: "Edge-lit LED with defogger — no separate vanity light needed above",
    finish: "Frameless / LED Surround",
    spec: '36" W × 30" H, dimmable 3000K LED, built-in defogger, hardwired',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    disclaimer: "Requires hardwired electrical connection behind the mirror",
  },
  {
    id: "pre-mirror-02",
    name: '40" Round Mirror — Unlacquered Brass',
    category: "Mirror",
    tier: "Premium",
    vendor: "Restoration Hardware",
    price: 720,
    description: "Oversized round with unlacquered brass that develops a living patina",
    finish: "Unlacquered Brass",
    spec: '40" diameter, solid brass frame, French cleat mount',
    isDefault: false,
    laborDelta: 0,
    tag: "Designer Pick",
    disclaimer: "Unlacquered brass will patina over time — this is intentional",
  },
  {
    id: "pre-mirror-03",
    name: '30" Recessed Medicine Cabinet with Lighting',
    category: "Mirror",
    tier: "Premium",
    vendor: "Robern",
    price: 1100,
    description: "Combines recessed storage with integrated LED — two functions in one",
    finish: "Mirror Front / LED",
    spec: '30" W × 30" H × 4" D, recessed, dimmable LED, slow-close',
    isDefault: false,
    laborDelta: 400,
    laborNote: "Recessed install plus electrical for LED — adds ~$400",
    tag: "Most Storage",
    disclaimer: "Requires both wall cavity cut and hardwired electrical",
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

/** Get the 4 default customizable products for a tier */
export const getTierDefaults = (tier: ProductTier): TieredProduct[] =>
  tieredCatalog.filter((p) => p.tier === tier && p.isDefault);

/** Get same-tier alternatives (non-default) for a category */
export const getTierAlternatives = (tier: ProductTier, category: ProductCategory): TieredProduct[] =>
  tieredCatalog.filter((p) => p.tier === tier && p.category === category && !p.isDefault);

/** Sum of default material prices for customizable items in a tier */
export const getTierDefaultMaterialTotal = (tier: ProductTier): number =>
  getTierDefaults(tier).reduce((sum, p) => sum + p.price, 0);

/** Compute labor total from base + product deltas */
export const computeLaborTotal = (tier: ProductTier, productLaborDeltas: number[]): number =>
  TIER_BASE_LABOR[tier] + productLaborDeltas.reduce((sum, d) => sum + d, 0);
