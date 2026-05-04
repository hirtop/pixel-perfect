/**
 * Modern — Balanced Package (structured data)
 *
 * Source of truth: src/remodel-flow/package-specs/MODERN_BALANCED.md
 *
 * Documentation/data only. NOT wired into the UI or engine yet.
 * Do not import from production flow code until integration is planned.
 */

export type BinProduct = {
  name: string;
  /** Inclusive price range in USD for this specific product/option. */
  priceRange: [number, number];
  /** Optional notes/customer text or qualifier (e.g. "budget fallback"). */
  note?: string;
};

/**
 * Sourcing status for a bin:
 *  - "ready"       — real products mapped + image-ready, safe to show & price.
 *  - "placeholder" — spec is locked but real product/imagery isn't sourced yet.
 *                    UI shows "Product sourcing in progress"; excluded from pricing.
 */
export type BinSourcing = "ready" | "placeholder";

export type Bin = {
  /** Short design intent for this bin. */
  intent: string;
  /** Whether real, image-ready products back this bin yet. */
  sourcing: BinSourcing;
  /** The default selection for the package. */
  primary: BinProduct;
  /** Up to 3 ranked fallbacks. */
  backups: BinProduct[];
  /** Hard rules the resolver must respect. */
  constraints: string[];
  /** Aggregate price band for the bin (covers primary + backups). */
  priceRange: [number, number];
  /** Customer-facing one-liner. */
  customerText: string;
};

export const MODERN_BALANCED = {
  id: "modern-balanced",
  style: "modern",
  tier: "balanced",
  name: "Modern — Balanced Package",

  priceRange: {
    products: [3000, 6000] as [number, number],
    total: [12000, 20000] as [number, number],
  },

  crossBinRules: [
    "Vanity drives faucet compatibility (deck cutout, single-hole vs widespread).",
    "Mirror + lighting are linked — backlit LED mirror drops sconces.",
    "Tile bins (wall, floor, shower floor) must share one stone family/tone.",
    "Rough-in (valves, drains, supply, venting) is contractor scope, not a product bin.",
  ],

  bins: {
    vanity: {
      intent:
        "Anchor the room with a wall-hung floating vanity in natural oak or matte white.",
      primary: {
        name: 'Floating Oak Vanity, 36" single sink, integrated drawer, matte black pulls',
        priceRange: [1200, 2200],
      },
      backups: [
        { name: 'Floating Walnut Vanity, 36" single sink', priceRange: [1200, 2200] },
        { name: 'Floating Matte White Vanity, 36" single sink', priceRange: [1200, 2200] },
        { name: 'Wall-hung Concrete-Top Vanity, 36"', priceRange: [1200, 2200] },
      ],
      constraints: [
        "Must be wall-hung (floating). No freestanding legs.",
        "Single-hole deck cutout to match Modern faucet primary.",
        "Width 30–42 inches only.",
        "Hardware: matte black or none (push-to-open).",
      ],
      priceRange: [1200, 2200],
      customerText:
        "A floating oak vanity that keeps the floor visible and the room feeling open.",
    } satisfies Bin,

    faucet: {
      intent:
        "Single-hole, tall-spout, matte black. Reads as one continuous line with the vanity.",
      primary: {
        name: "Matte Black Single-Hole Faucet, tall spout",
        priceRange: [220, 480],
      },
      backups: [
        { name: "Brushed Gunmetal Single-Hole Faucet", priceRange: [220, 480] },
        {
          name: "Matte Black Widespread Faucet",
          priceRange: [220, 480],
          note: "Only if vanity primary swapped to 3-hole deck.",
        },
        {
          name: "Chrome Single-Hole Faucet",
          priceRange: [220, 480],
          note: "Fallback if matte black out of stock.",
        },
      ],
      constraints: [
        "Must match vanity deck configuration (single-hole default).",
        "Finish must match shower trim and accessories (matte black family).",
      ],
      priceRange: [220, 480],
      customerText:
        "A tall matte-black faucet sized for everyday use without crowding the sink.",
    } satisfies Bin,

    mirror: {
      intent:
        "Frameless or thin-frame rectangular mirror, sized to the vanity. Visual quiet space.",
      primary: { name: 'Frameless Rectangular Mirror, 30"×36"', priceRange: [180, 420] },
      backups: [
        { name: 'Thin Matte Black Frame Mirror, 30"×36"', priceRange: [180, 420] },
        {
          name: 'Backlit LED Mirror, 30"×36"',
          priceRange: [180, 420],
          note: "Linked with lighting bin — drops sconces.",
        },
        {
          name: 'Round Frameless Mirror, 30"',
          priceRange: [180, 420],
          note: "Only if vanity primary < 32 inches wide.",
        },
      ],
      constraints: [
        "Width must be ≤ vanity width.",
        "If backlit LED mirror is selected, lighting bin must drop sconces.",
      ],
      priceRange: [180, 420],
      customerText:
        "A clean rectangular mirror that lets the vanity and tile do the talking.",
    } satisfies Bin,

    lighting: {
      intent:
        "Layered but restrained — overhead + flanking sconces in matte black, warm white bulbs.",
      primary: {
        name: "Sconce Pair (matte black, warm white) + Flush LED overhead",
        priceRange: [260, 520],
      },
      backups: [
        { name: "Linear Vanity Bar (matte black) + Flush LED", priceRange: [260, 520] },
        { name: "Single Overhead Pendant (matte black) + Flush LED", priceRange: [260, 520] },
        {
          name: "Flush LED only",
          priceRange: [260, 520],
          note: "Paired with backlit LED mirror.",
        },
      ],
      constraints: [
        "Color temperature: 2700K–3000K only.",
        "Finish must match faucet/trim family (matte black).",
        "If mirror = backlit LED, drop sconces (avoid over-lighting).",
      ],
      priceRange: [260, 520],
      customerText:
        "Warm sconces beside the mirror with a soft overhead — flattering without feeling staged.",
    } satisfies Bin,

    showerWallTile: {
      intent:
        "Large-format warm-grey or warm-white porcelain, stone or honed marble look. Minimal grout.",
      primary: {
        name: '12"×24" Honed Marble-Look Porcelain, warm white',
        priceRange: [480, 960],
      },
      backups: [
        { name: '12"×24" Warm Grey Stone-Look Porcelain', priceRange: [480, 960] },
        { name: '24"×48" Slab-Look Porcelain, warm white', priceRange: [480, 960] },
        {
          name: 'Stacked 4"×12" Matte White Porcelain',
          priceRange: [480, 960],
          note: "Budget fallback.",
        },
      ],
      constraints: [
        "Must coordinate tonally with floor tile and shower floor tile (one stone family).",
        "No glossy finish — honed/matte only.",
        "No patterned or hand-made tile (zellige belongs to Spa).",
      ],
      priceRange: [480, 960],
      customerText:
        "Large-format stone-look tile that keeps walls calm and grout lines minimal.",
    } satisfies Bin,

    floorTile: {
      intent:
        "Matte porcelain in the same warm-neutral family as shower walls. Reads continuous.",
      primary: { name: '12"×24" Warm Grey Matte Porcelain', priceRange: [380, 780] },
      backups: [
        { name: '24"×24" Warm Grey Matte Porcelain', priceRange: [380, 780] },
        { name: '12"×24" Warm White Stone-Look Porcelain', priceRange: [380, 780] },
        {
          name: '6"×36" Natural Oak-Look Porcelain',
          priceRange: [380, 780],
          note: "Only if vanity = matte white.",
        },
      ],
      constraints: [
        "Must share tonal family with shower wall tile.",
        "Matte/honed only. Slip-rated for wet areas.",
      ],
      priceRange: [380, 780],
      customerText: "A warm-neutral floor tile that ties the whole room together.",
    } satisfies Bin,

    showerFloorTile: {
      intent:
        "Smaller-format mosaic in the same stone family as walls — drainage slope and grip.",
      primary: { name: '2"×2" Warm Grey Stone-Look Mosaic', priceRange: [140, 320] },
      backups: [
        { name: '2"×2" Warm White Marble-Look Mosaic', priceRange: [140, 320] },
        { name: '1"×1" Penny Round, Matte Warm Grey', priceRange: [140, 320] },
        {
          name: '2"×2" Pebble Mosaic, Warm Grey',
          priceRange: [140, 320],
          note: "Budget fallback.",
        },
      ],
      constraints: [
        "Must tonally match shower wall tile.",
        "Mosaic format required for drainage slope.",
        "No high-contrast or patterned mosaics.",
      ],
      priceRange: [140, 320],
      customerText:
        "A small-format stone mosaic underfoot — same palette as the walls, with the grip you need.",
    } satisfies Bin,

    showerTrim: {
      intent:
        "Matte black trim kit — single-handle valve, fixed showerhead, optional handheld on slide bar.",
      primary: {
        name: 'Matte Black Trim Kit — single-handle, 8" rain head + handheld on slide bar',
        priceRange: [360, 720],
      },
      backups: [
        {
          name: 'Matte Black Trim Kit — single-handle, 8" rain head only',
          priceRange: [360, 720],
        },
        {
          name: "Brushed Gunmetal Trim Kit — single-handle, rain head + handheld",
          priceRange: [360, 720],
        },
        {
          name: "Chrome Trim Kit — single-handle",
          priceRange: [360, 720],
          note: "Fallback if matte black out of stock.",
        },
      ],
      constraints: [
        "Trim only — rough-in valve body is contractor scope.",
        "Must match faucet finish family.",
        "Single-handle only (Modern intent).",
      ],
      priceRange: [360, 720],
      customerText:
        "A matte-black shower trim with a rain head and handheld — clean lines, real function.",
    } satisfies Bin,

    showerGlass: {
      intent: "Frameless clear glass enclosure or fixed panel. Maximizes visual openness.",
      primary: {
        name: 'Frameless Fixed Glass Panel, 3/8" clear, matte black hardware',
        priceRange: [700, 1400],
      },
      backups: [
        {
          name: 'Frameless Hinged Glass Door, 3/8" clear, matte black hardware',
          priceRange: [700, 1400],
        },
        {
          name: 'Frameless Sliding Glass Door, 3/8" clear, matte black track',
          priceRange: [700, 1400],
        },
        {
          name: "Semi-Frameless Fixed Panel, matte black frame",
          priceRange: [700, 1400],
          note: "Budget fallback.",
        },
      ],
      constraints: [
        "Hardware finish must match shower trim (matte black).",
        "Clear glass only — no frosted, no rain-pattern.",
        "Layout (panel vs door) determined by contractor based on opening.",
      ],
      priceRange: [700, 1400],
      customerText: "A frameless clear-glass panel that keeps the shower visually open.",
    } satisfies Bin,

    toilet: {
      intent:
        "One-piece elongated, skirted trapway, matte white. Reads as a single clean form.",
      primary: {
        name: "One-Piece Elongated Skirted Toilet, matte white, soft-close seat",
        priceRange: [480, 960],
      },
      backups: [
        {
          name: "One-Piece Elongated Skirted Toilet, gloss white, soft-close seat",
          priceRange: [480, 960],
        },
        {
          name: "Two-Piece Elongated Skirted Toilet, matte white",
          priceRange: [480, 960],
          note: "Budget fallback.",
        },
        {
          name: "Wall-Hung Toilet, matte white",
          priceRange: [480, 960],
          note: "Only if in-wall carrier already present.",
        },
      ],
      constraints: [
        "Skirted trapway required (no exposed bolts/curves).",
        "Elongated bowl only.",
        "Wall-hung option requires existing carrier — not a default upgrade.",
      ],
      priceRange: [480, 960],
      customerText: "A skirted one-piece toilet — easier to clean and visually quiet.",
    } satisfies Bin,

    accessories: {
      intent:
        "Matte black hardware set — towel bar, hand towel ring, robe hook, TP holder. Cohesive with faucet/trim.",
      primary: {
        name: 'Matte Black 4-Piece Accessory Set (24" towel bar, ring, hook, TP holder)',
        priceRange: [120, 280],
      },
      backups: [
        { name: "Brushed Gunmetal 4-Piece Accessory Set", priceRange: [120, 280] },
        {
          name: "Matte Black 3-Piece Set (no robe hook)",
          priceRange: [120, 280],
          note: "Budget fallback.",
        },
        {
          name: "Chrome 4-Piece Set",
          priceRange: [120, 280],
          note: "Fallback if matte black out of stock.",
        },
      ],
      constraints: [
        "Finish must match faucet + shower trim family.",
        "Set must be from a single product line (no mixing brands/finishes).",
      ],
      priceRange: [120, 280],
      customerText:
        "A matched matte-black hardware set — towel bar, ring, hook, and paper holder.",
    } satisfies Bin,
  },

  outOfScope: [
    "Rough-in valves, supply lines, drains, venting (contractor).",
    "Demolition, framing, waterproofing, electrical rough-in (contractor).",
    "Paint, baseboard, door (existing or contractor).",
    "Ventilation fan (contractor electrical, not a curated bin at MVP).",
  ],
} as const;

export type ModernBalancedPackage = typeof MODERN_BALANCED;
export default MODERN_BALANCED;
