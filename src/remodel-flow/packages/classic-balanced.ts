/**
 * Classic — Balanced Package (structured data)
 *
 * Source of truth: src/remodel-flow/package-specs/CLASSIC_BALANCED.md
 *
 * Documentation/data only. NOT wired into the UI or engine yet.
 * Do not import from production flow code until integration is planned.
 */

import type { Bin, BinProduct, ProductStyle } from "./modern-balanced";

// Re-export shared types for convenience.
export type { Bin, BinProduct, ProductStyle } from "./modern-balanced";

/** Styles allowed to render inside the Classic Balanced package. */
export const CLASSIC_BALANCED_ALLOWED_STYLES: ProductStyle[] = [
  "classic",
  "traditional",
];

/**
 * Returns true if a product is allowed to render in the Classic Balanced package.
 * Blocks modern-only / minimal-only / industrial-only products.
 * Untagged products are treated as not validated and excluded.
 */
export function isAllowedInClassicBalanced(product: BinProduct): boolean {
  const styles = product.style;
  if (!styles || styles.length === 0) return false;
  return styles.some((s) => CLASSIC_BALANCED_ALLOWED_STYLES.includes(s));
}

/**
 * Filter a bin's primary + backups down to products allowed in Classic Balanced.
 * Returns null if the primary is blocked AND no backup is allowed.
 */
export function filterBinForClassicBalanced(bin: Bin): Bin | null {
  const primaryOk = isAllowedInClassicBalanced(bin.primary);
  const allowedBackups = bin.backups.filter(isAllowedInClassicBalanced);
  if (!primaryOk && allowedBackups.length === 0) return null;
  const nextPrimary = primaryOk ? bin.primary : allowedBackups[0];
  const nextBackups = primaryOk ? allowedBackups : allowedBackups.slice(1);
  return { ...bin, primary: nextPrimary, backups: nextBackups };
}

/**
 * Allowed unit-price bands per bin for the Classic Balanced tier.
 * Used as a SOFT validation only — products outside this range are
 * highlighted with a warning, never hidden or blocked.
 *
 * Tile bins are priced per square foot, not per unit.
 */
export const CLASSIC_BALANCED_PRICE_BANDS = {
  vanity:          [1100, 2200] as [number, number],
  faucet:          [250, 500] as [number, number],
  mirror:          [200, 420] as [number, number],
  lighting:        [250, 520] as [number, number],
  showerWallTile:  [7, 14] as [number, number],   // per SF
  floorTile:       [7, 14] as [number, number],   // per SF
  showerFloorTile: [12, 50] as [number, number],  // per SF (mosaic sheet)
  showerTrim:      [280, 600] as [number, number],
  showerGlass:     [600, 1100] as [number, number],
  toilet:          [300, 700] as [number, number],
  accessories:     [80, 180] as [number, number],
};

export type ClassicBalancedBinKey = keyof typeof CLASSIC_BALANCED_PRICE_BANDS;

/**
 * Soft validation result for a product against its bin's band.
 * - inside  → ok
 * - below   → "under" (cheaper than expected for Balanced tier)
 * - above   → "over"  (pricier than expected for Balanced tier)
 * - unknown → null    (no unit price on product, e.g. range-only entries)
 */
export function checkBinPriceBandClassic(
  binKey: ClassicBalancedBinKey,
  product: BinProduct,
): { status: "ok" | "under" | "over"; band: [number, number] } | null {
  const band = CLASSIC_BALANCED_PRICE_BANDS[binKey];
  if (!band) return null;
  const unit =
    typeof product.price === "number"
      ? product.price
      : product.priceRange
        ? (product.priceRange[0] + product.priceRange[1]) / 2
        : null;
  if (unit == null || Number.isNaN(unit)) return null;
  if (unit < band[0]) return { status: "under", band };
  if (unit > band[1]) return { status: "over", band };
  return { status: "ok", band };
}

const CLASSIC: ProductStyle[] = ["classic", "traditional"];

export const CLASSIC_BALANCED = {
  id: "classic-balanced",
  style: "classic",
  tier: "balanced",
  name: "Classic — Balanced Package",

  positioning:
    "A timeless, warm Classic bathroom built around a furniture-style vanity, " +
    "marble-look porcelain, and a coordinated polished-chrome (or brushed-nickel) " +
    "fixture suite. Familiar, durable, and quietly elegant.",

  priceRange: {
    products: [3000, 6000] as [number, number],
    total: [12000, 20000] as [number, number],
  },

  crossBinRules: [
    "Vanity drives faucet compatibility — furniture-style deck dictates widespread (3-hole, 8\" centers) by default.",
    "Mirror + lighting are linked — large pivot/arched mirror can drop sconces in favor of overhead bar.",
    "Tile bins (wall, floor, shower floor) must share one marble/stone family, warm white-to-soft-grey palette.",
    "Metal finish family is unified across faucet, shower trim, lighting, mirror frame, and accessories (polished chrome default).",
    "Rough-in (valves, drains, supply, venting) is contractor scope, not a product bin.",
  ],

  contractorNotes: [
    "Rough-in valves, supply lines, drains, venting — contractor scope.",
    "Demolition, framing, waterproofing, electrical rough-in — contractor scope.",
    "Paint, baseboard, door — assumed existing or contractor scope.",
    "Ventilation fan — covered under contractor electrical, not a curated bin at MVP.",
    "Final shower-glass dimensions, valve-body model, and any wall blocking must be contractor-verified on-site.",
  ],

  bins: {
    vanity: {
      sourcing: "placeholder",
      intent:
        "Anchor the room with a furniture-style vanity in white shaker or warm wood, with stone or marble-look top and polished-chrome (or brushed-nickel) hardware.",
      primary: {
        name: '36" White Shaker Vanity, marble-look top, single undermount sink, polished chrome pulls',
        primary: true,
        style: CLASSIC,
        priceRange: [1100, 2200],
      },
      backups: [
        { name: '36" Warm Oak Shaker Vanity, marble-look top, single undermount sink', style: CLASSIC, priceRange: [1100, 2200] },
        { name: '36" Painted Grey Shaker Vanity, marble-look top, single undermount sink', style: CLASSIC, priceRange: [1100, 2200] },
        { name: '48" White Shaker Double-Drawer Vanity (upgrade), marble-look top', style: CLASSIC, priceRange: [1500, 2200], note: "Upgrade backup." },
      ],
      constraints: [
        "Floor-standing furniture-style only. No floating/wall-hung in default path.",
        "Width 30–48 inches only.",
        "Stone or marble-look top with integrated backsplash optional.",
        "Hardware: polished chrome or brushed nickel pulls/knobs only.",
      ],
      priceRange: [1100, 2200],
      customerText:
        "A furniture-style vanity that grounds the room and gives the space a finished, built-in feel.",
    } satisfies Bin,

    faucet: {
      sourcing: "placeholder",
      intent:
        "Widespread (3-hole) lever or cross-handle faucet in polished chrome. Refined, classic centerpiece on the vanity deck.",
      primary: {
        name: "Widespread Lever-Handle Bathroom Faucet, Polished Chrome",
        primary: true,
        style: CLASSIC,
        type: "widespread",
        priceRange: [250, 500],
      },
      backups: [
        { name: "Widespread Cross-Handle Bathroom Faucet, Polished Chrome", style: CLASSIC, type: "widespread", priceRange: [250, 500] },
        { name: "Widespread Lever-Handle Bathroom Faucet, Brushed Nickel", style: CLASSIC, type: "widespread", priceRange: [250, 500], note: "Alternate finish — only if lighting/trim/accessories swap to brushed nickel family." },
        { name: "Centerset Two-Handle Bathroom Faucet, Polished Chrome", style: CLASSIC, type: "centerset", priceRange: [200, 350], note: "Compact alt — only if vanity top is centerset-drilled." },
      ],
      constraints: [
        "Widespread (3-hole, 8\" centers) preferred; centerset only as compact backup.",
        "Classic/traditional styling only — no industrial or matte-black profiles in default path.",
        "Finish must coordinate with lighting, shower trim, and accessories.",
      ],
      priceRange: [200, 500],
      customerText:
        "A widespread chrome faucet that feels classic without being fussy.",
    } satisfies Bin,

    mirror: {
      sourcing: "placeholder",
      intent:
        "Framed rectangular or arched mirror sized to the vanity. Adds warmth and a subtle decorative beat against the tile.",
      primary: {
        name: 'Framed Rectangular Mirror, polished-chrome or warm-wood frame, 30–36" wide',
        primary: true,
        style: CLASSIC,
        type: "framed_rectangular",
        priceRange: [200, 420],
      },
      backups: [
        { name: "Arched Framed Mirror, polished-chrome frame", style: CLASSIC, type: "arched_framed", priceRange: [250, 420] },
        { name: "Beveled Frameless Rectangular Mirror with subtle edge detail", style: CLASSIC, type: "beveled_frameless", priceRange: [200, 380] },
        { name: 'Framed Mirror Pair (his/hers), for 48" double-drawer vanity upgrade', style: CLASSIC, type: "framed_pair", priceRange: [320, 420], note: "Pairs with 48\" vanity upgrade." },
      ],
      constraints: [
        "Classic/traditional styling only.",
        "Width 70–90% of vanity width (single mirror) or paired for 48\"+ vanities.",
        "Centered above the vanity.",
        "Frame finish must coordinate with faucet/lighting family.",
      ],
      priceRange: [200, 420],
      customerText:
        "A framed mirror that adds warmth and a quiet bit of detail above the vanity.",
    } satisfies Bin,

    lighting: {
      sourcing: "placeholder",
      intent:
        "Layered classic lighting — flanking sconces with fabric or seeded-glass shades, plus an overhead flush or semi-flush in the same metal family.",
      primary: {
        name: "Sconce Pair (polished chrome, seeded glass) + Semi-Flush overhead",
        primary: true,
        style: CLASSIC,
        priceRange: [250, 520],
      },
      backups: [
        { name: "3-Light Vanity Bar (polished chrome, fabric shades) + Flush LED", style: CLASSIC, priceRange: [250, 520] },
        { name: "2-Light Sconce Pair (brushed nickel, white glass) + Semi-Flush", style: CLASSIC, priceRange: [250, 520] },
        { name: "Single Overhead Pendant (chrome + glass) + Flush LED", style: CLASSIC, priceRange: [250, 480], note: "Compact alt." },
      ],
      constraints: [
        "Color temperature: 2700K–3000K only.",
        "Finish must match faucet/trim family.",
        "Glass shades preferred; no exposed-bulb industrial fixtures.",
      ],
      priceRange: [250, 520],
      customerText:
        "Warm sconces beside the mirror with a soft overhead — classic and flattering, never harsh.",
    } satisfies Bin,

    showerWallTile: {
      sourcing: "placeholder",
      intent:
        "Marble-look porcelain or classic 3\"×6\" subway in warm white. Clean, familiar, broadly appealing.",
      primary: {
        name: '12"×24" Marble-Look Porcelain, warm white with soft veining',
        primary: true,
        style: CLASSIC,
        priceRange: [7, 14],
        note: "Per SF.",
      },
      backups: [
        { name: '3"×6" Glossy White Subway Tile, classic stack or running bond', style: CLASSIC, priceRange: [7, 12], note: "Per SF. Glossy allowed as a classic exception." },
        { name: '4"×16" Honed Marble-Look Porcelain', style: CLASSIC, priceRange: [8, 14], note: "Per SF." },
        { name: '12"×24" Honed Travertine-Look Porcelain', style: CLASSIC, priceRange: [8, 14], note: "Per SF." },
      ],
      constraints: [
        "Must coordinate tonally with floor tile and shower floor tile (one stone family).",
        "Honed or matte preferred; glossy subway is allowed as a classic exception.",
        "No bold patterned or hand-made tile (zellige belongs to Spa).",
      ],
      priceRange: [7, 14],
      customerText:
        "Marble-look or classic subway walls — familiar, refined, and easy to live with.",
    } satisfies Bin,

    floorTile: {
      sourcing: "placeholder",
      intent:
        "Marble-look or warm-stone porcelain in a slip-rated finish. Reads continuous with the shower walls without competing.",
      primary: {
        name: '12"×24" Marble-Look Porcelain, warm white, matte finish',
        primary: true,
        style: CLASSIC,
        priceRange: [7, 14],
        note: "Per SF.",
      },
      backups: [
        { name: '12"×24" Warm Travertine-Look Porcelain', style: CLASSIC, priceRange: [8, 14], note: "Per SF." },
        { name: '12"×12" Classic Marble-Look Porcelain', style: CLASSIC, priceRange: [7, 12], note: "Per SF." },
        { name: "Hex Mosaic Marble-Look (small-format alt for compact baths)", style: CLASSIC, priceRange: [10, 14], note: "Per SF." },
      ],
      constraints: [
        "Matte finish only. Slip-rated for wet areas.",
        "Must coordinate tonally with shower wall tile.",
        "Floor tile must not overpower wall tile.",
      ],
      priceRange: [7, 14],
      customerText:
        "A warm marble-look floor that ties the whole room together without stealing the show.",
    } satisfies Bin,

    showerFloorTile: {
      sourcing: "placeholder",
      intent:
        "Small-format marble-look mosaic — classic hex or penny round — in the same stone family as the walls.",
      primary: {
        name: '2" Hex Marble-Look Mosaic, warm white',
        primary: true,
        style: CLASSIC,
        priceRange: [12, 50],
        note: "Per SF (mosaic sheet).",
      },
      backups: [
        { name: "Penny-Round Marble-Look Mosaic", style: CLASSIC, priceRange: [12, 45], note: "Per SF (mosaic sheet)." },
        { name: '1"×2" Marble-Look Brick Mosaic', style: CLASSIC, priceRange: [12, 40], note: "Per SF (mosaic sheet)." },
        { name: '2" Hex Warm Grey Marble-Look Mosaic', style: CLASSIC, priceRange: [12, 45], note: "Per SF (mosaic sheet)." },
      ],
      constraints: [
        "Small format, ideally 2\" or less.",
        "Matte or slip-appropriate finish only.",
        "Must coordinate tonally with wall and floor tile.",
        "No large-format tile allowed for shower floor.",
      ],
      priceRange: [12, 50],
      customerText:
        "A classic marble-look mosaic underfoot — same palette as the walls, with the grip you need.",
    } satisfies Bin,

    showerTrim: {
      sourcing: "placeholder",
      intent:
        "Classic two- or single-handle trim in polished chrome, with a fixed showerhead and matching handheld on a slide bar. Contractor handles rough-in valve.",
      primary: {
        name: "Single-Handle Shower Trim with Handheld Combo, Polished Chrome",
        primary: true,
        style: CLASSIC,
        type: "single_handle_combo",
        priceRange: [280, 600],
      },
      backups: [
        { name: "Two-Handle Shower & Tub Trim, Polished Chrome", style: CLASSIC, type: "two_handle_trim", priceRange: [280, 550] },
        { name: "Single-Handle Shower Trim, Brushed Nickel", style: CLASSIC, type: "single_handle_trim", priceRange: [280, 550], note: "Alternate finish family." },
        { name: "Thermostatic Shower Trim, Polished Chrome", style: CLASSIC, type: "thermostatic_trim", priceRange: [400, 600], note: "Upgrade backup." },
      ],
      constraints: [
        "Classic/traditional styling only.",
        "Finish must match faucet family.",
        "No smart/digital shower systems.",
        "Trim only — rough-in valve body is contractor scope.",
      ],
      priceRange: [280, 600],
      customerText:
        "A classic chrome shower trim with the controls and showerhead working as one set.",
    } satisfies Bin,

    showerGlass: {
      sourcing: "placeholder",
      intent:
        "Semi-frameless or framed clear-glass enclosure in chrome. Slightly heavier hardware than Modern, in keeping with a Classic palette.",
      primary: {
        name: "Semi-Frameless Hinged Shower Door, Polished Chrome hardware",
        primary: true,
        style: CLASSIC,
        type: "semi_frameless_hinged",
        priceRange: [600, 1100],
      },
      backups: [
        { name: "Framed Sliding Shower Door, Polished Chrome", style: CLASSIC, type: "framed_sliding", priceRange: [600, 950] },
        { name: "Frameless Fixed Glass Panel (walk-in alt), Polished Chrome clamps", style: CLASSIC, type: "fixed_panel", priceRange: [650, 1100] },
        { name: "Semi-Frameless Hinged Shower Door, Brushed Nickel", style: CLASSIC, type: "semi_frameless_hinged", priceRange: [600, 1100], note: "Alternate finish family." },
      ],
      constraints: [
        "Clear glass default.",
        "Hardware finish must coordinate with faucet/shower trim family.",
        "Final size must be contractor-verified to actual opening.",
      ],
      priceRange: [600, 1100],
      customerText:
        "A clear-glass enclosure with classic chrome hardware — open, but in keeping with the rest of the room.",
    } satisfies Bin,

    toilet: {
      sourcing: "placeholder",
      intent:
        "Two-piece comfort-height white toilet with a softly traditional profile. Quietly classic — never the focal point.",
      primary: {
        name: "Two-Piece Comfort-Height Elongated Toilet, white, classic profile",
        primary: true,
        style: CLASSIC,
        type: "two_piece_elongated",
        priceRange: [300, 700],
      },
      backups: [
        { name: "One-Piece Comfort-Height Elongated Toilet, white", style: CLASSIC, type: "one_piece_elongated", priceRange: [400, 700], note: "Cleaner profile." },
        { name: "Two-Piece Standard-Height Elongated Toilet, white", style: CLASSIC, type: "two_piece_elongated", priceRange: [300, 500], note: "Budget backup." },
        { name: "Skirted One-Piece Elongated Toilet, white", style: CLASSIC, type: "skirted_one_piece", priceRange: [500, 700], note: "Upgrade backup." },
      ],
      constraints: [
        "White finish only.",
        "Elongated bowl preferred.",
        "Comfort/chair height preferred.",
        "Classic, softly traditional profile — toilet should not be the focal point.",
      ],
      priceRange: [300, 700],
      customerText:
        "A clean, comfort-height white toilet that quietly fits in next to the vanity and shower.",
    } satisfies Bin,

    accessories: {
      sourcing: "placeholder",
      intent:
        "Polished-chrome 4-piece bath hardware set — towel bar, towel ring, robe hook, TP holder. Cohesive with faucet and shower trim family.",
      primary: {
        name: "4-Piece Bath Hardware Set, Polished Chrome",
        primary: true,
        style: CLASSIC,
        type: "polished_chrome_4pc_set",
        priceRange: [80, 180],
      },
      backups: [
        { name: "4-Piece Bath Hardware Set, Brushed Nickel", style: CLASSIC, type: "brushed_nickel_4pc_set", priceRange: [80, 180], note: "Alternate finish family." },
        { name: "4-Piece Bath Hardware Set, Polished Chrome (upgraded line)", style: CLASSIC, type: "polished_chrome_4pc_set", priceRange: [130, 180], note: "Upgraded backup." },
        { name: "4-Piece Bath Hardware Set, Polished Chrome (budget line)", style: CLASSIC, type: "polished_chrome_4pc_set", priceRange: [80, 130], note: "Budget backup." },
      ],
      constraints: [
        "Classic/traditional design only — no matte-black or industrial profiles in default path.",
        "Finish must coordinate with faucet and shower trim.",
        "Set must be from a single product line (no mixing brands/finishes).",
      ],
      priceRange: [80, 180],
      customerText:
        "A matched chrome hardware set — towel bar, ring, hook, and paper holder, all from one line.",
    } satisfies Bin,
  },
} as const;

export type ClassicBalancedPackage = typeof CLASSIC_BALANCED;
