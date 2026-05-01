/**
 * BOBOX Remodel — Tier-Specific Product Catalog
 *
 * 12 customizable categories × 3 tiers × 3 products each = 108 products
 * Plus static items (Lighting, Toilet) per tier.
 * Same-tier swapping only for MVP.
 */

import type { ProductCategory } from "./products";

// ─── Product images ─────────────────────────────────────────────────h
// Budget defaults
// Balanced defaults
// Premium defaults
// Budget alternatives
// Balanced alternatives
// Premium alternatives

// ─── Types ──────────────────────────────────────────────────────────

export type ProductTier = "Budget" | "Balanced" | "Premium";

export interface TieredProduct {
  id: string;
  name: string;
  category: ProductCategory;
  tier: ProductTier;
  vendor: string;
  price: number;
  /**
   * Optional. When present, this is the estimated material allowance for the
   * typical project size (e.g. ~12 sq ft of shower floor tile) and should be
   * used for project totals. `price` remains the vendor unit price shown on
   * the product card. Use `getProductTotalPrice()` to pick the right value.
   */
  estimatedProjectPrice?: number;
  description: string;
  finish: string;
  spec: string;
  image?: string;
  isDefault: boolean;
  laborDelta: number;
  laborNote?: string;
  tag?: string;
  disclaimer?: string;
  affiliateUrl?: string;
  width_inches?: number;
  faucet_holes?: 'single-hole' | 'centerset' | 'widespread';
  mount_type?: 'single-hole' | 'centerset' | 'widespread' | 'wall-mount';
}

// ─── Tier base labor (before product-specific deltas) ───────────────

export const TIER_BASE_LABOR: Record<ProductTier, number> = {
  Budget: 4500,
  Balanced: 6500,
  Premium: 9000,
};

/**
 * Returns the price to use for project totals (Materials Total, package totals).
 * Falls back to vendor unit price when no estimated allowance is defined.
 */
export const getProductTotalPrice = (
  product: Pick<TieredProduct, "price" | "estimatedProjectPrice">,
): number => product.estimatedProjectPrice ?? product.price;

export const SHIPPING_ESTIMATE = 600;

// ─── Non-customizable static items per tier ─────────────────────────
// Lighting + Toilet — not swappable at MVP

export interface StaticItem {
  category: string;
  name: string;
  vendor: string;
  price: number;
    image?: string;
}

export const STATIC_ITEMS: Record<ProductTier, StaticItem[]> = {
  Budget: [
    { category: "Toilet", name: "Cadet PRO Round-Front Toilet", vendor: "American Standard", price: 420 },
  ],
  Balanced: [
    { category: "Toilet", name: "Drake II Elongated Toilet", vendor: "TOTO", price: 650 },
  ],
  Premium: [
    { category: "Toilet", name: "Starck 3 Wall-Hung Toilet", vendor: "Duravit", price: 1050 },
  ],
};

export const getStaticItemsTotal = (tier: ProductTier): number =>
  STATIC_ITEMS[tier].reduce((sum, item) => sum + item.price, 0);

// ─── Full Tiered Catalog ────────────────────────────────────────────

export const tieredCatalog: TieredProduct[] = [

  // ════════════════════════════════════════════════════════════════════
  // VANITY
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────

  {
    id: "bal-vanity-01",
    name: 'Emmeline 48" Single Basin Ash Wood Vanity Cabinet Only',
    category: "Vanities",
    tier: "Balanced",
    vendor: "James Martin",
    price: 2450,
    description: "Wall-mounted to keep floor visible — helps compact baths feel larger",
    finish: "Natural Oak / White Quartz",
    spec: '48" W × 22" D, soft-close drawers, pre-drilled for single-hole faucet',
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/jamesmartinvanities/james-martin-vanities-d100-v48-pbo-8134424.jpg",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/james-martin-vanities-d100-v48/s1997936?uid=4727863",
    width_inches: 48,
    faucet_holes: 'widespread',
  },
  {
    id: "bal-vanity-02",
    name: 'Breckenridge 48" Free Standing Single Basin Poplar Wood Vanity Set',
    category: "Vanities",
    tier: "Balanced",
    vendor: "James Martin",
    price: 3202,
    description: "Solid birch frame with undermount sink — cleaner lines than a drop-in",
    finish: "Espresso / Gray Quartz",
    spec: '42" W × 22" D, solid birch frame, dovetail drawer, undermount sink',
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/jamesmartinvanities/james-martin-vanities-330-v48-srb-3wz-7989618.jpg",
    isDefault: false,
    laborDelta: 0,
    tag: "Value Pick",
    affiliateUrl: "https://www.fergusonhome.com/james-martin-vanities-330-v48-3wz/s1963933?uid=4938910",
    width_inches: 42,
    faucet_holes: 'centerset',
  },
  {
    id: "bal-vanity-03",
    name: 'Breckenridge 72" Free Standing Double Basin Poplar Wood Vanity Set',
    category: "Vanities",
    tier: "Balanced",
    vendor: "James Martin",
    price: 4607,
    description: "Dovetail walnut drawers with deeper storage — solid wood throughout",
    finish: "Walnut / White Quartz",
    spec: '48" W × 22" D, dovetail drawers, pre-drilled single-hole',
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/jamesmartinvanities/james_martin_vanities_330_v72_bw_3wz.jpg",
    isDefault: false,
    laborDelta: 0,
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/james-martin-vanities-330-v72-3wz/s1925137?uid=4549287",
    width_inches: 48,
    faucet_holes: 'widespread',
  },
  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SINK
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-sink-01",
    name: 'Caxton 21-1/4" x 17-1/4" Undermount Bathroom Sink with Overflow',
    category: "Sinks",
    tier: "Balanced",
    vendor: "Kohler",
    price: 116,
    description: "Caxton line — smooth contours, easy-clean glazed surface",
    finish: "White",
    spec: '21-1/4" x 17-1/4" undermount, scratch-resistant glaze',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-2211/s560195?uid=163516",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-2211-0.jpg",
  },
  {
    id: "bal-sink-02",
    name: 'Myers 23" Porcelain Undermount Bathroom Sink',
    category: "Sinks",
    tier: "Balanced",
    vendor: "Signature Hardware",
    price: 252,
    description: "Porcelain undermount with clean rectangular lines — versatile sizing",
    finish: "White",
    spec: '23" x 15" undermount porcelain',
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/signature-hardware-948178/s1707148?uid=4027609",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/sh-447959-myers-sink-wh-18-beauty08.jpg",
  },
  {
    id: "bal-sink-03",
    name: 'Archer 19-7/8" Undermount Bathroom Sink with Overflow',
    category: "Sinks",
    tier: "Balanced",
    vendor: "Kohler",
    price: 219.60,
    description: "Timeless Archer profile — oval basin with built-in overflow",
    finish: "White",
    spec: '22" × 16" semi-recessed, overflow included',
    isDefault: false,
    laborDelta: 0,
    tag: "Value Pick",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-2355/s560600?uid=165124",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-2355-0-1864588.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // FAUCET
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-faucet-01",
    name: "Provincetown Centerset Bathroom Faucet",
    category: "Faucets",
    tier: "Balanced",
    vendor: "Signature Hardware",
    price: 186,
    description: "Minimal profile with ceramic cartridge rated for 500K cycles",
    finish: "Brushed Nickel",
    spec: "Single-hole mount, ceramic disc valve, 1.2 GPM WaterSense",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    mount_type: "centerset",
    affiliateUrl: "https://www.fergusonhome.com/signature-hardware-948569/s1707269?uid=4027790",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-447833-5129969.jpg",
  },
  {
    id: "bal-faucet-02",
    name: "Cassidy Centerset Bathroom Faucet with Pop-Up Drain Assembly",
    category: "Faucets",
    tier: "Balanced",
    vendor: "Delta",
    price: 469,
    description: "Three-hole spread — check that your vanity top supports 8 inch centers",
    finish: "Brushed Nickel",
    spec: "8 inch center spread, ceramic disc valves, 1.2 GPM",
    isDefault: false,
    laborDelta: 120,
    laborNote: "Wider spread may need vanity top re-drill — adds ~$120",
    tag: "Upgrade",
    mount_type: "single-hole",
    affiliateUrl: "https://www.fergusonhome.com/delta-2597lf-mpu/s776562?uid=2003601",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/delta/delta-2597lf-czmpu-320.jpg",
  },
  {
    id: "bal-faucet-03",
    name: "Purist 1.2 GPM Single Hole Bathroom Faucet with Pop-Up Drain Assembly",
    category: "Faucets",
    tier: "Balanced",
    vendor: "Kohler",
    price: 687,
    description: "Pull-down sprayer adds utility; matte black resists fingerprints",
    finish: "Matte Black",
    spec: "Single-hole, pull-down sprayer, 1.5 GPM",
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    mount_type: "single-hole",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-14402-4a/s559752?uid=4126511",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-14402-4a-2mb-3092463.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // MIRROR
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-mirror-01",
    name: "36 inch Essential Rectangular Metal Framed Bathroom Wall Mirror",
    category: "Mirrors",
    tier: "Balanced",
    vendor: "Kohler",
    price: 339,
    description: "Clean lines and brushed nickel finish — pairs with any vanity style",
    finish: "Brushed Nickel",
    spec: "24 inch W x 36 inch H, metal frame, ready to hang",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-31364/s1897338?uid=4508897",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-31364-bnl-8211481.jpg",
  },
  {
    id: "bal-mirror-02",
    name: "Castia by Studio McGee Transitional Rectangular Frameless Bathroom Wall Mirror",
    category: "Mirrors",
    tier: "Balanced",
    vendor: "Kohler",
    price: 320,
    description: "Studio McGee collaboration — warm brass accent, minimal frameless design",
    finish: "Vibrant Brushed Moderne Brass",
    spec: "19.5 inch W x 29.5 inch H, frameless tempered glass",
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-34969/s1950628?uid=4601346",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-34969-2mb-2351648.jpg",
  },
  {
    id: "bal-mirror-03",
    name: "Curie Modern Rectangular Frameless Bathroom Wall Mirror with LED Lighting",
    category: "Mirrors",
    tier: "Balanced",
    vendor: "Signature Hardware",
    price: 340,
    description: "Mirror-front hides 4 inches of storage — keeps counter clear",
    finish: "Brushed Nickel",
    spec: "32 inch W x 24 inch H, touch LED, frameless aluminum",
    isDefault: false,
    laborDelta: 350,
    laborNote: "Recessed install requires wall cavity cut — adds ~$350",
    tag: "Most Storage",
    affiliateUrl: "https://www.fergusonhome.com/signature-hardware-946559-32/s1652473?uid=3912765",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-442983-1508143.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER WALL TILE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-swtile-01",
    name: "Dignitary 12x24 Rectangle Floor and Wall Tile",
    category: "Shower Wall Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 2200,
    description: "Fewer grout lines means easier cleaning and a more seamless look",
    finish: "Warm Gray Matte",
    spec: "12 x 24 rectified panels, approx 60 sq ft coverage, rated for wet areas",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/daltile-dr1224p/s1319445?uid=3135067",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-dr1012241p-712.jpg",
  },
  {
    id: "bal-swtile-02",
    name: "Cloe 2.5x8 Rectangle Wall Tile",
    category: "Shower Wall Tile",
    tier: "Balanced",
    vendor: "Bedrosians",
    price: 1800,
    description: "Glossy white ceramic subway tile — bright, clean classic look",
    finish: "Glossy White",
    spec: "2.5 x 8 ceramic wall tile, 10.64 SF per carton",
    isDefault: false,
    laborDelta: 100,
    laborNote: "Mid-size tile — slightly more cuts than large-format, adds ~$100",
    tag: "Value Pick",
    affiliateUrl: "https://www.fergusonhome.com/bedrosians-decclo28g/s1903313?uid=4495816",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/bedrosians/bedrosians-decclowhi28g-8497430.jpg",
  },
  {
    id: "bal-swtile-03",
    name: "Florentine 12x24 Rectangle Wall and Floor Tile",
    category: "Shower Wall Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 2400,
    description: "Marble-look porcelain — elegant veining without the maintenance",
    finish: "Carrara Marble Look",
    spec: "12 x 24 unpolished marble visual, 17.02 SF per carton",
    isDefault: false,
    laborDelta: 0,
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/daltile-fl1224fp/s1318054?uid=3126874",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-fl061224f1pk-1300.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // MAIN FLOOR TILE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-ftile-01",
    name: 'Dignitary 12" x 24" Rectangle Floor and Wall Tile',
    category: "Main Floor Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 10.11,
    description: "Rectified edges for tight grout lines — clean modern look on the floor",
    finish: "Warm Gray Matte",
    spec: '12" x 24" rectified porcelain, ~40 sq ft, slip-rated',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/daltile-dr1224p/s1319445?uid=3135067",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-dr1012241p-712.jpg",
  },
  {
    id: "bal-ftile-02",
    name: 'Slate 12" x 12" Square Floor and Wall Tile',
    category: "Main Floor Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 9.80,
    description: "Natural slate texture in a durable porcelain — great for heated floors",
    finish: "Slate Gray Unpolished",
    spec: '12" x 12" unpolished visual, 5.82 SF/carton',
    isDefault: false,
    laborDelta: 0,
    tag: "Value Pick",
    affiliateUrl: "https://www.fergusonhome.com/daltile-s1212p1s/s1318811?uid=3131210",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-s7621212x1p-5297.jpg",
  },
  {
    id: "bal-ftile-03",
    name: 'Florentine 12" x 24" Rectangle Wall & Floor Tile',
    category: "Main Floor Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 4.62,
    description: "Marble-look floor tile — timeless visual with easy maintenance",
    finish: "Carrara Marble Look",
    spec: '12" x 24" unpolished marble visual, 17.02 SF/carton',
    isDefault: false,
    laborDelta: 150,
    laborNote: "Pattern alignment adds ~$150 labor",
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/daltile-fl1224fp/s1318054?uid=3126874",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-fl061224f1pk-1300.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER FLOOR TILE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-sftile-01",
    name: '2" Hex Porcelain Mosaic — Warm Gray',
    category: "Shower Floor Tile",
    tier: "Balanced",
    vendor: "Daltile",
    price: 29.98,
    estimatedProjectPrice: 178,
    description: "Hexagonal mosaic conforms well to shower slopes",
    finish: "Warm Gray Matte",
    spec: 'Sold by sheet (2.02 sq ft) at $14.84/sq ft · estimated ~$178 for 12 sq ft shower floor',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/daltile-d2hexgmsp/s1293678",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-480976-8134424.jpg",
  },
  {
    id: "bal-sftile-02",
    name: '2" Round Mosaic — Matte Finish',
    category: "Shower Floor Tile",
    tier: "Balanced",
    vendor: "Bedrosians",
    price: 161.95,
    estimatedProjectPrice: 568,
    description: "Round mosaic conforms to shower slopes and adds visual contrast",
    finish: "Matte",
    spec: 'Sold by carton (3.42 sq ft) at $47.35/sq ft · estimated ~$568 for 12 sq ft shower floor (Bedrosians Makoto)',
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/bedrosians-decmak2rmom/s1903359",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-480976-8134424.jpg",
  },
  {
    id: "bal-sftile-03",
    name: '2" Hex Mosaic — White Marble Look',
    category: "Shower Floor Tile",
    tier: "Balanced",
    vendor: "Merola",
    price: 125.35,
    estimatedProjectPrice: 150,
    description: "Marble-look hex mosaic — bright, classic shower floor pattern",
    finish: "Polished White Marble Visual",
    spec: 'Sold by carton (10 sq ft) at $12.54/sq ft · estimated ~$150 for 12 sq ft shower floor (Merola Flo)',
    isDefault: false,
    laborDelta: 0,
    laborNote: undefined,
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/merola-tile-ftc2f/s1976818",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-480976-8134424.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // ACCENT TILE (optional)
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-accent-02",
    name: 'Arabescato Carrara Marble Pencil Rail — 12" × ¾"',
    category: "Accent Tile",
    tier: "Balanced",
    vendor: "MSI",
    price: 12,
    estimatedProjectPrice: 320,
    description: "Slim marble pencil rail adds a refined border to a niche or shower edge",
    finish: "Honed Arabescato Carrara",
    spec: '12" × ¾" honed marble pencil rail, sold per piece (~10 linear ft project allowance)',
    isDefault: false,
    laborDelta: 80,
    laborNote: "Liner placement adds ~$80 labor",
    tag: "Elegant Detail",
    affiliateUrl: "https://www.fergusonhome.com/msi-smot-pencil-ara/s1661244",
  },
  {
    id: "bal-accent-03",
    name: 'Greecian White Herringbone Marble Mosaic — 12" × 12"',
    category: "Accent Tile",
    tier: "Balanced",
    vendor: "MSI",
    price: 95,
    estimatedProjectPrice: 480,
    description: "Feature panel behind the vanity or inside the niche",
    finish: "Polished Greecian White Marble",
    spec: '12" × 12" herringbone mosaic, sold by carton (9.4 SF/carton; ~6 sq ft feature area allowance)',
    isDefault: false,
    laborDelta: 150,
    laborNote: "Feature panel layout adds ~$150 labor",
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/msi-smot-gre-hbp/s1661192",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER GLASS
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-sglass-01",
    name: 'DreamLine Lumen 40-41" W × 72" H Semi-Frameless Hinged Shower Door',
    category: "Shower Doors",
    tier: "Balanced",
    vendor: "DreamLine",
    price: 700,
    description: "Hinged door with minimal frame — clean, modern look",
    finish: "Brushed Nickel",
    spec: '40"–41" W × 72" H, ¼" tempered clear glass, semi-frameless',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/dreamline-shdr-5340720/s1693693",
  },
  {
    id: "bal-sglass-02",
    name: 'DreamLine Linea 34" W × 72" H Frameless Open-Entry Shower Screen',
    category: "Shower Doors",
    tier: "Balanced",
    vendor: "DreamLine",
    price: 650,
    description: "Walk-in style fixed glass screen — no door to open, just splash protection",
    finish: "Brushed Nickel",
    spec: '34" W × 72" H, frameless, ⅜" tempered clear glass, wall-mount bracket',
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/dreamline-shdr-3234721/s1159178",
  },
  {
    id: "bal-sglass-03",
    name: 'DreamLine French Linea 34" W × 72" H Patterned-Glass Shower Screen',
    category: "Shower Doors",
    tier: "Balanced",
    vendor: "DreamLine",
    price: 690,
    description: "Frameless fixed screen with French-style patterned glass — bold, modern accent",
    finish: "Matte Black Hardware",
    spec: '34" W × 72" H, frameless, patterned tempered glass, wall-mount bracket',
    isDefault: false,
    laborDelta: 0,
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/dreamline-shdr-3234721-89/s1319707",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER VALVE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-svalve-01",
    name: "Delta Trinsic 17T Thermostatic Shower Valve Trim",
    category: "Shower Valve",
    tier: "Balanced",
    vendor: "Delta",
    price: 559,
    description: "Maintains exact temperature — separate handle for volume control. Trim only; rough-in valve sold separately.",
    finish: "Brilliance Polished Nickel",
    spec: "Trinsic 17T Series thermostatic mixing valve trim with integrated volume control (less rough-in valve)",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/delta-t17t059/s1128453",
  },
  {
    id: "bal-svalve-02",
    name: "Kohler Purist 2- or 3-Function Diverter Valve Trim",
    category: "Shower Valve",
    tier: "Balanced",
    vendor: "Kohler",
    price: 293,
    description: "Routes water between up to three outlets — showerhead, handheld, and tub spout. Trim only; rough-in valve sold separately.",
    finish: "Brushed Bronze",
    spec: "Purist single-handle 2- or 3-function diverter valve trim (less valve)",
    isDefault: false,
    laborDelta: 80,
    laborNote: "3-way diverter requires additional rough-in — adds ~$80",
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-t14491-4/s566115",
  },
  {
    id: "bal-svalve-03",
    name: "Moen Smart Shower 2-Outlet Digital Controller",
    category: "Shower Valve",
    tier: "Balanced",
    vendor: "Moen",
    price: 1399,
    description: "Set exact temperature digitally — Wi-Fi enabled, controllable from your phone or voice.",
    finish: "Matte Black",
    spec: 'Moen Smart Shower 2-outlet digital controller, ½" connections, Wi-Fi',
    isDefault: false,
    laborDelta: 150,
    laborNote: "Digital valve requires electrical connection — adds ~$150",
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/moen-ts3302/s1247218",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER TRIM
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-strim-01",
    name: "Moen Engage Magnetix Rain Head + Handheld Combo",
    category: "Shower Systems",
    tier: "Balanced",
    vendor: "Moen",
    price: 280,
    description: "Magnetic docking — handheld snaps back into place with one hand",
    finish: "Spot Resist Brushed Nickel",
    spec: 'Engage Magnetix multi-function rain head + handheld combo, 2.5 GPM',
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/product/summary/1439827",
  },
  {
    id: "bal-strim-02",
    name: "Kohler Awaken Multi-Function Shower Head",
    category: "Shower Systems",
    tier: "Balanced",
    vendor: "Kohler",
    price: 120,
    description: "Toggle between full spray, massage, and rain — all from the same head",
    finish: "Brushed Nickel",
    spec: 'Awaken multi-function shower head, 1.75 GPM',
    isDefault: false,
    laborDelta: 0,
    tag: "Value Pick",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-72419-g/s1526776",
  },
  {
    id: "bal-strim-03",
    name: 'Delta Modern Rain Shower Head + 10" Ceiling Arm',
    category: "Shower Systems",
    tier: "Balanced",
    vendor: "Delta",
    price: 380,
    estimatedProjectPrice: 480,
    description: "Square rain head paired with a 10\" ceiling arm — spa-like experience from above",
    finish: "Champagne Bronze (head) / Brushed Nickel (arm available)",
    spec: 'Modern 1.75 GPM single-function rain square shower head + Delta U4999 10" ceiling-mount shower arm (sold separately, ~$100)',
    isDefault: false,
    laborDelta: 200,
    laborNote: "Ceiling mount requires rerouting supply pipe — adds ~$200",
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/delta-rp103699/s1978747",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // TUB
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-tub-01",
    name: 'Torben 69 inch Acrylic Soaking Tub',
    category: "Bathtubs",
    tier: "Balanced",
    vendor: "Signature Hardware",
    price: 1679,
    description: "Freestanding oval — becomes the focal point of the bathroom",
    finish: "Glossy White",
    spec: '60" × 29" × 23" deep, freestanding, drain included',
    isDefault: true,
    laborDelta: 200,
    laborNote: "Freestanding requires floor drain relocation — adds ~$200",
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/signature-hardware-948784/s1845818?uid=4374432",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-480976-8134424.jpg",
  },
  {
    id: "bal-tub-02",
    name: 'Irvine 67-7/8" x 31-7/16" Free Standing Acrylic Soaking Tub',
    category: "Bathtubs",
    tier: "Balanced",
    vendor: "Kohler",
    price: 3150,
    description: "Cast iron retains heat longer — feels warmer during long soaks",
    finish: "White Enamel",
    spec: '60" × 32", cast iron with porcelain enamel',
    isDefault: false,
    laborDelta: 100,
    laborNote: "Cast iron is heavy — may need floor reinforcement, adds ~$100",
    tag: "Classic Pick",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-26080/s1879206?uid=4443527",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-26080-0-9611322.jpg",
  },
  {
    id: "bal-tub-03",
    name: 'Cheshire 69 inch Free Standing Clawfoot Bathtub',
    category: "Bathtubs",
    tier: "Balanced",
    vendor: "Victoria and Albert",
    price: 4551,
    description: "Deeper than wide — designed for a seated, fully submerged soak",
    finish: "Matte White",
    spec: '48" × 28" × 25" deep, acrylic, freestanding',
    isDefault: false,
    laborDelta: 250,
    laborNote: "Deep tub may need higher-capacity drain — adds ~$250",
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/victoria-and-albert-che-n-of+ft-che/s1763389?uid=4163828",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/victoriaandalbert/victoria-and-albert-che-n-sw-of-ft-che-pb-5743830.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // TUB VALVE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-tvalve-01",
    name: "Delta Trinsic 17T Thermostatic Tub & Shower Trim",
    category: "Tub Valve",
    tier: "Balanced",
    vendor: "Delta",
    price: 639,
    description: "Maintains exact temperature for tub and shower — separate handle for volume control. Trim only; rough-in valve sold separately.",
    finish: "Brilliance Polished Nickel",
    spec: "Trinsic Tempassure 17T dual-function thermostatic tub & shower trim with H2Okinetic shower head and integrated volume control (less rough-in valve)",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/delta-t17t459-h2o/s1128451",
  },
  {
    id: "bal-tvalve-02",
    name: "Signature Hardware Cooper Freestanding Tub Filler",
    category: "Tub Valve",
    tier: "Balanced",
    vendor: "Signature Hardware",
    price: 1029,
    description: "Floor-mounted filler with handheld sprayer — pairs with freestanding tubs",
    finish: "Brushed Nickel",
    spec: "Floor-mount freestanding tub filler, single-handle, includes 1.8 GPM hand shower",
    isDefault: false,
    laborDelta: 300,
    laborNote: "Floor-mount requires concealed supply lines — adds ~$300",
    tag: "Upgrade",
    affiliateUrl: "https://www.fergusonhome.com/signature-hardware-950732/s1773629",
  },
  {
    id: "bal-tvalve-03",
    name: "Kohler Purist Wall-Mount Roman Tub Filler Trim",
    category: "Tub Valve",
    tier: "Balanced",
    vendor: "Kohler",
    price: 730,
    description: "Minimal wall-mount tub filler — clean lines, no deck holes needed. Trim only; rough-in valve sold separately.",
    finish: "Brushed Bronze",
    spec: "Purist deck or wall-mounted lever-handle tub filler trim (less rough-in valve)",
    isDefault: false,
    laborDelta: 150,
    laborNote: "Wall-mount requires in-wall valve rough-in — adds ~$150",
    tag: "Trending",
    affiliateUrl: "https://www.fergusonhome.com/kohler-k-t14429-4/s567514",
  },

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // SHOWER NICHE
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────

  // ── Premium ───────────────────────────────────────────────────────

  // ════════════════════════════════════════════════════════════════════
  // LIGHTING
  // ════════════════════════════════════════════════════════════════════

  // ── Budget ────────────────────────────────────────────────────────

  // ── Balanced ──────────────────────────────────────────────────────
  {
    id: "bal-light-01",
    name: "Redondo 4 Light 33 inch Wide Bathroom Vanity Light",
    category: "Lighting",
    tier: "Balanced",
    vendor: "Millennium Lighting",
    price: 273.60,
    description: "Four globe vanity light in modern gold — warm, diffused glow for bath tasks",
    finish: "Modern Gold",
    spec: "33 inch W, 4 lights, E26 bulbs, UL listed for damp locations",
    isDefault: true,
    laborDelta: 0,
    tag: "Recommended",
    affiliateUrl: "https://www.fergusonhome.com/millennium-lighting-30304/s2008976?uid=4764569",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/millenniumlighting/millennium-lighting-30304-mg-8134424.jpg",
  },
  {
    id: "bal-light-02",
    name: "4 Light Bathroom Vanity Light from the Agilis Collection",
    category: "Lighting",
    tier: "Balanced",
    vendor: "Minka Lavery",
    price: 215.79,
    description: "Classic 4-light bar in matte black — timeless style for any bath",
    finish: "Matte Black",
    spec: "27 inch W, 4 lights, E26 bulbs, UL listed for damp locations",
    isDefault: false,
    laborDelta: 0,
    tag: "Popular",
    affiliateUrl: "https://www.fergusonhome.com/minka-lavery-ml-6814/s614304?uid=347812",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/minkalavery/4_Light_Bath_6814-66.jpg",
  },
  {
    id: "bal-light-03",
    name: "Spec 24 inch Wide LED Bath Bar ADA Compliant",
    category: "Lighting",
    tier: "Balanced",
    vendor: "Maxim",
    price: 109.80,
    description: "Slim integrated LED bar — efficient, bright, and ADA-compliant",
    finish: "Polished Chrome",
    spec: "24 inch W, integrated LED, 3000K, ADA compliant",
    isDefault: false,
    laborDelta: 0,
    tag: "Best Value",
    affiliateUrl: "https://www.fergusonhome.com/maxim-52002/s1511390?uid=3543914",
    image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/maxim/maxim_52002pc.jpg",
  },

  // ── Premium ───────────────────────────────────────────────────────
];

// ─── Helpers ────────────────────────────────────────────────────────

/** Get the default customizable products for a tier */
export const getTierDefaults = (tier: ProductTier): TieredProduct[] =>
  tieredCatalog.filter((p) => p.tier === tier && p.isDefault);

/** Get same-tier alternatives (non-default) for a category */
export const getTierAlternatives = (tier: ProductTier, category: ProductCategory): TieredProduct[] =>
  tieredCatalog.filter((p) => p.tier === tier && p.category === category && !p.isDefault);

/** Sum of default material prices for customizable items in a tier */
export const getTierDefaultMaterialTotal = (tier: ProductTier): number =>
  getTierDefaults(tier).reduce((sum, p) => sum + getProductTotalPrice(p), 0);

/** Compute labor total from base + product deltas */
export const computeLaborTotal = (tier: ProductTier, productLaborDeltas: number[]): number =>
  TIER_BASE_LABOR[tier] + productLaborDeltas.reduce((sum, d) => sum + d, 0);
