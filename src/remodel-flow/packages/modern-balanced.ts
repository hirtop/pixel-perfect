/**
 * Modern — Balanced Package (structured data)
 *
 * Source of truth: src/remodel-flow/package-specs/MODERN_BALANCED.md
 *
 * Documentation/data only. NOT wired into the UI or engine yet.
 * Do not import from production flow code until integration is planned.
 *
 * ─── Phase 2.9: Shower-forward posture (locked) ───────────────────────
 * MODERN_BALANCED is intentionally a SHOWER-FORWARD package. The curated
 * bins form a complete walk-in shower posture (showerWallTile,
 * showerFloorTile, showerDoor, showerValve, showerSystem) with no
 * curated bathtub deck, tub filler, or tub-surround track.
 *
 *   - `bathtub` is intentionally DEFERRED to the legacy fallback path
 *     and MUST NOT be added to MODERN_BALANCED.bins in this phase.
 *   - `tubValve` is intentionally DEFERRED and is COUPLED to `bathtub`.
 *     Do NOT open `tubValve` without also opening `bathtub` with a
 *     compatible rough-in / spout / diverter / matched-finish decision.
 *     Do NOT open `bathtub` without `tubValve`.
 *   - Neither bin is an EMPTY_BIN — legacy catalog products exist for
 *     both. EMPTY_BINS is reserved for genuinely empty catalog
 *     categories, not deferred package-specific curation choices.
 *   - A future tub-forward package variant may revisit this.
 */

export type BinProduct = {
  name: string;
  /** Inclusive price range in USD for this specific product/option. */
  priceRange: [number, number];
  /** Optional notes/customer text or qualifier (e.g. "budget fallback"). */
  note?: string;
  /** Optional real product details (present on "ready" bins). */
  finish?: string;
  price?: number;
  retailer?: string;
  link?: string;
  image?: string;
  /** Faucet/fixture deck type, e.g. "single_hole", "widespread", "centerset". */
  type?: string;
  /** Recommended/curated pick for this bin. True only on the bin's primary. */
  primary?: boolean;
  /**
   * Style tags this product is compatible with.
   * Used by curated package renderers to block wrong-style products
   * (e.g. traditional/ornate/classic-only items in a Modern package).
   */
  style?: ProductStyle[];

  /* ─── Phase 2.6: explicit intrinsic fields (preferred over regex) ─
   * These take priority over name/url derivation in adaptBinProduct.
   * Keep additive — leave undefined to fall back to regex derivation.
   */
  vendor?: string;
  widthInches?: number;
  mountType?: "wall" | "floor" | "undermount" | "drop-in";
  faucetHoles?: 0 | 1 | 3;
  unitPrice?: number;
  estimatedProjectPrice?: number;
  canonicalKey?: string;
  isCuratedOnly?: boolean;

  /* ─── Phase 2.7: pricing source-of-truth ───────────────────────
   * Tracks origin/confidence of unitPrice / estimatedProjectPrice.
   *  - "retailer"          confirmed retailer/affiliate unit price
   *  - "project-allowance" confirmed material allowance (SF-priced)
   *  - "estimated"         best current estimate; refresh later
   *  - "pending"           TODO — needs confirmation, do NOT show to customers
   */
  pricingSource?: "retailer" | "project-allowance" | "estimated" | "pending";
  pricingNote?: string;
};

/** Allowed style tags for curated product validation. */
export type ProductStyle =
  | "modern"
  | "minimal"
  | "spa"
  | "classic"
  | "traditional"
  | "ornate"
  | "industrial"
  | "transitional";

/** Styles allowed to render inside the Modern Balanced package. */
export const MODERN_BALANCED_ALLOWED_STYLES: ProductStyle[] = ["modern", "minimal"];

/**
 * Returns true if a product is allowed to render in the Modern Balanced package.
 * Blocks traditional / ornate / classic-only products.
 * Untagged products are treated as not validated and excluded.
 */
export function isAllowedInModernBalanced(product: BinProduct): boolean {
  const styles = product.style;
  if (!styles || styles.length === 0) return false;
  return styles.some((s) => MODERN_BALANCED_ALLOWED_STYLES.includes(s));
}

/**
 * Filter a bin's primary + backups down to products allowed in Modern Balanced.
 * Returns null if the primary is blocked AND no backup is allowed.
 */
export function filterBinForModernBalanced(bin: Bin): Bin | null {
  const primaryOk = isAllowedInModernBalanced(bin.primary);
  const allowedBackups = bin.backups.filter(isAllowedInModernBalanced);
  if (!primaryOk && allowedBackups.length === 0) return null;
  const nextPrimary = primaryOk ? bin.primary : allowedBackups[0];
  const nextBackups = primaryOk
    ? allowedBackups
    : allowedBackups.slice(1);
  return { ...bin, primary: nextPrimary, backups: nextBackups };
}

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

/**
 * Allowed unit-price bands per bin for the Modern Balanced tier.
 * Used as a SOFT validation only — products outside this range are
 * highlighted with a warning, never hidden or blocked.
 *
 * Tile bins are priced per square foot, not per unit.
 */
export const MODERN_BALANCED_PRICE_BANDS: Record<
  keyof typeof MODERN_BALANCED.bins,
  [number, number]
> = {
  vanity:          [1200, 2200],
  faucet:          [250, 450],
  sink:            [80, 200],
  mirror:          [200, 400],
  lighting:        [150, 400],
  showerWallTile:  [6, 14],   // per SF
  floorTile:       [6, 14],   // per SF
  showerFloorTile: [10, 50],  // per SF (mosaic sheet)
  showerTrim:      [250, 600],
  showerSystem:    [240, 700],
  showerGlass:     [600, 1100],
  toilet:          [300, 700],
  accentTile:      [10, 30],  // per SF (allowance)
  accessories:     [80, 170],
};

export type ModernBalancedBinKey = keyof typeof MODERN_BALANCED_PRICE_BANDS;

/**
 * Returns a soft validation result for a product against its bin's band.
 * - inside  → ok
 * - below   → "under" (cheaper than expected for Balanced tier)
 * - above   → "over"  (pricier than expected for Balanced tier)
 * - unknown → null    (no unit price on product, e.g. range-only entries)
 */
export function checkBinPriceBand(
  binKey: ModernBalancedBinKey,
  product: BinProduct,
): { status: "ok" | "under" | "over"; band: [number, number] } | null {
  const band = MODERN_BALANCED_PRICE_BANDS[binKey];
  if (!band) return null;
  // Prefer explicit unit price; fall back to product's own priceRange midpoint.
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
      sourcing: "ready",
      intent:
        "Anchor the room with a wall-hung floating vanity in natural oak or matte white.",
      primary: {
        name: 'Floating Oak Vanity, 36" single sink, integrated drawer, matte black pulls',
        primary: true,
        style: ["modern", "minimal"],
        priceRange: [1200, 2200],
        // Phase 2.6 explicit intrinsics
        vendor: "BOBOX Curated",
        unitPrice: 1700,
        widthInches: 36,
        mountType: "wall",
        faucetHoles: 1,
        canonicalKey: "modern-balanced-vanity-floating-oak-36",
        isCuratedOnly: true,
        pricingSource: "estimated",
        pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
      },
      backups: [
        {
          name: 'Floating Walnut Vanity, 36" single sink',
          priceRange: [1200, 2200],
          vendor: "BOBOX Curated",
          unitPrice: 1700,
          widthInches: 36,
          mountType: "wall",
          faucetHoles: 1,
          canonicalKey: "modern-balanced-vanity-floating-walnut-36",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
        },
        {
          name: 'Floating Matte White Vanity, 36" single sink',
          priceRange: [1200, 2200],
          vendor: "BOBOX Curated",
          unitPrice: 1700,
          widthInches: 36,
          mountType: "wall",
          faucetHoles: 1,
          canonicalKey: "modern-balanced-vanity-floating-matte-white-36",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
        },
        {
          name: 'Wall-hung Concrete-Top Vanity, 36"',
          priceRange: [1200, 2200],
          vendor: "BOBOX Curated",
          unitPrice: 1800,
          widthInches: 36,
          mountType: "wall",
          faucetHoles: 1,
          canonicalKey: "modern-balanced-vanity-concrete-top-36",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
        },
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
      sourcing: "ready",
      intent:
        "Single-hole, tall-spout, matte black. Reads as one continuous line with the vanity.",
      primary: {
        name: "Delta Trinsic Single Hole Single-Handle Bathroom Faucet",
        primary: true,
        style: ["modern", "minimal"],
        finish: "Matte Black",
        price: 329,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-559LF-BLLPU/301646776",
        image:
          "https://images.thdstatic.com/productImages/1ad3829c-9a9d-4ba8-84a2-b53ee9f259d9/svn/matte-black-delta-single-hole-bathroom-faucets-559lf-bllpu-64_1000.jpg",
        type: "single_hole",
        priceRange: [329, 329],
        vendor: "Delta",
        unitPrice: 329,
        faucetHoles: 1,
        canonicalKey: "delta-trinsic-559lf-bllpu",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "Moen Doux Single Hole Single-Handle Bathroom Faucet",
          style: ["modern", "minimal"],
          finish: "Matte Black",
          price: 318.99,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/MOEN-Doux-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-S6910BL/306756408",
          image:
            "https://images.thdstatic.com/productImages/b20adebe-2e81-4992-8e64-0ae9b59f3b38/svn/matte-black-moen-single-hole-bathroom-faucets-s6910bl-64_1000.jpg",
          type: "single_hole",
          priceRange: [318.99, 318.99],
          vendor: "Moen",
          unitPrice: 318.99,
          faucetHoles: 1,
          canonicalKey: "moen-doux-s6910bl",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Delta Trinsic Single Hole Bathroom Faucet",
          style: ["modern", "minimal"],
          finish: "Champagne Bronze",
          price: 379,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Delta-Trinsic-Gold-Single-Hole-Single-Handle-Bathroom-Faucet-with-Metal-Drain-Assembly-in-Champagne-Bronze-559LF-CZMPU/203897768",
          image:
            "https://images.thdstatic.com/productImages/c899073e-b62b-42d6-8e4f-cb3cb1d590b7/svn/champagne-bronze-delta-single-hole-bathroom-faucets-559lf-czmpu-64_1000.jpg",
          type: "single_hole",
          priceRange: [379, 379],
          note: "Alternate finish — only if lighting/trim/accessories swap to champagne bronze family.",
          vendor: "Delta",
          unitPrice: 379,
          faucetHoles: 1,
          canonicalKey: "delta-trinsic-559lf-czmpu",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Single-hole only.",
        "Modern/minimal styling only.",
        "Finish must coordinate with lighting, shower trim, and accessories.",
        "No centerset faucet in Modern Balanced default path.",
      ],
      priceRange: [318.99, 379],
      customerText:
        "A tall matte-black faucet sized for everyday use without crowding the sink.",
    } satisfies Bin,

    mirror: {
      sourcing: "ready",
      intent:
        "Thin-frame or frameless rectangular mirror, sized to the vanity. Visual quiet space.",
      primary: {
        name: 'Kohler Essential 36" Rectangular Metal Framed Mirror',
        primary: true,
        style: ["modern", "minimal"],
        price: 339,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/kohler-k-31364/1897338.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-31364-bnl-8211481.jpg",
        type: "thin_frame_rectangular",
        priceRange: [339, 339],
        vendor: "Kohler",
        unitPrice: 339,
        canonicalKey: "kohler-essential-k-31364",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "Kohler Castia Rectangular Mirror (Studio McGee)",
          style: ["modern", "minimal"],
          price: 320,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/kohler-k-34969/1950628.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-34969-2mb-2351648.jpg",
          type: "warm_frame_rectangular",
          priceRange: [320, 320],
          vendor: "Kohler",
          unitPrice: 320,
          canonicalKey: "kohler-castia-k-34969",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Signature Hardware Curie LED Mirror",
          style: ["modern", "minimal"],
          price: 340,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/signature-hardware-946559-32/1652473.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-442983-1508143.jpg",
          type: "led_backlit",
          priceRange: [340, 340],
          note: "LED upgrade — not default. Linked with lighting bin (drop sconces).",
          vendor: "Signature Hardware",
          unitPrice: 340,
          canonicalKey: "signature-hardware-curie-946559-32",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Modern/minimal styling only.",
        "Width must be 70–90% of vanity width.",
        "Centered above the vanity.",
        "LED mirror is an upgrade, not the default.",
      ],
      priceRange: [320, 340],
      customerText:
        "A clean rectangular mirror that lets the vanity and tile do the talking.",
    } satisfies Bin,

    lighting: {
      sourcing: "ready",
      intent:
        "Layered but restrained — overhead + flanking sconces in matte black, warm white bulbs.",
      primary: {
        name: "Sconce Pair (matte black, warm white) + Flush LED overhead",
        primary: true,
        style: ["modern", "minimal"],
        priceRange: [260, 520],
        vendor: "BOBOX Curated",
        unitPrice: 390,
        canonicalKey: "modern-balanced-lighting-sconce-pair-flush",
        isCuratedOnly: true,
        pricingSource: "estimated",
        pricingNote: "Curated BOBOX estimate; refresh when SKUs are finalized.",
      },
      backups: [
        {
          name: "Linear Vanity Bar (matte black) + Flush LED",
          priceRange: [260, 520],
          vendor: "BOBOX Curated",
          unitPrice: 390,
          canonicalKey: "modern-balanced-lighting-linear-bar-flush",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKUs are finalized.",
        },
        {
          name: "Single Overhead Pendant (matte black) + Flush LED",
          priceRange: [260, 520],
          vendor: "BOBOX Curated",
          unitPrice: 390,
          canonicalKey: "modern-balanced-lighting-single-pendant-flush",
          isCuratedOnly: true,
          pricingSource: "pending",
          pricingNote: "TODO: confirm retailer price / project allowance.",
        },
        {
          name: "Flush LED only",
          style: ["modern", "minimal"],
          priceRange: [260, 520],
          note: "Paired with backlit LED mirror.",
          vendor: "BOBOX Curated",
          unitPrice: 280,
          canonicalKey: "modern-balanced-lighting-flush-led-only",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKUs are finalized.",
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
      sourcing: "ready",
      intent:
        "Large-format warm-grey or warm-white porcelain, stone or honed marble look. Minimal grout.",
      primary: {
        name: '12"×24" Honed Marble-Look Porcelain, warm white',
        primary: true,
        style: ["modern", "minimal"],
        priceRange: [480, 960],
        vendor: "BOBOX Curated",
        unitPrice: 10,
        estimatedProjectPrice: 720,
        canonicalKey: "modern-balanced-shower-wall-marble-look-12x24",
        isCuratedOnly: true,
        pricingSource: "project-allowance",
      },
      backups: [
        {
          name: '12"×24" Warm Grey Stone-Look Porcelain',
          priceRange: [480, 960],
          vendor: "BOBOX Curated",
          unitPrice: 10,
          estimatedProjectPrice: 720,
          canonicalKey: "modern-balanced-shower-wall-warm-grey-12x24",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
        },
        {
          name: '24"×48" Slab-Look Porcelain, warm white',
          priceRange: [480, 960],
          vendor: "BOBOX Curated",
          unitPrice: 12,
          estimatedProjectPrice: 860,
          canonicalKey: "modern-balanced-shower-wall-slab-24x48",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
        },
        {
          name: 'Stacked 4"×12" Matte White Porcelain',
          style: ["modern", "minimal"],
          priceRange: [480, 960],
          note: "Budget fallback.",
          vendor: "BOBOX Curated",
          unitPrice: 7,
          estimatedProjectPrice: 520,
          canonicalKey: "modern-balanced-shower-wall-stacked-4x12",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote: "Curated BOBOX estimate; refresh when SKU is finalized.",
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
      sourcing: "ready",
      intent:
        "Large-format matte porcelain in the same warm-neutral family as shower walls. Reads continuous, never overpowers.",
      primary: {
        name: 'Daltile Dignitary 12"×24" Warm Gray Porcelain',
        primary: true,
        style: ["modern", "minimal"],
        price: 10.11,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/daltile-dr1224p/1319445.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-dr1224p-1319445.jpg",
        type: "large_format_porcelain",
        priceRange: [10.11, 10.11],
        note: "Per SF.",
        vendor: "Daltile",
        unitPrice: 10.11,
        estimatedProjectPrice: 720,
        canonicalKey: "daltile-dignitary-dr1224p",
        isCuratedOnly: true,
        pricingSource: "project-allowance",
      },
      backups: [
        {
          name: 'Daltile Florentine 12"×24" Carrara Look Porcelain',
          style: ["modern", "minimal"],
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-fl1224fp/1318054.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-fl1224fp-1318054.jpg",
          type: "marble_look",
          priceRange: [10, 10],
          vendor: "Daltile",
          unitPrice: 10,
          estimatedProjectPrice: 720,
          canonicalKey: "daltile-florentine-fl1224fp",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
        },
        {
          name: 'Daltile Slate 12"×12" Tile',
          style: ["modern", "minimal"],
          price: 9.8,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-s1212p1s/1318811.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-s1212p1s-1318811.jpg",
          type: "darker_stone",
          priceRange: [9.8, 9.8],
          note: "Darker stone option — only if shower wall tile leans warm grey/stone.",
          vendor: "Daltile",
          unitPrice: 9.8,
          estimatedProjectPrice: 700,
          canonicalKey: "daltile-slate-s1212p1s",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
        },
      ],
      constraints: [
        "Large format preferred (12×24 or larger).",
        "Matte finish only. Slip-rated for wet areas.",
        "Must coordinate tonally with shower wall tile.",
        "Floor tile must not overpower wall tile.",
      ],
      priceRange: [9.8, 10.11],
      customerText:
        "A large-format warm-neutral floor tile that ties the whole room together without stealing the show.",
    } satisfies Bin,

    showerFloorTile: {
      sourcing: "ready",
      intent:
        "Small-format mosaic in the same stone family as walls — drainage slope and grip.",
      primary: {
        name: 'Bedrosians 2" Round Matte Mosaic',
        primary: true,
        style: ["modern", "minimal"],
        price: 47.35,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/bedrosians-decmak2rmom/1903359.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/bedrosians/bedrosians-decmak2rmom-1903359.jpg",
        type: "round_mosaic",
        priceRange: [47.35, 47.35],
        note: "Project estimate: $568.",
        vendor: "Bedrosians",
        unitPrice: 47.35,
        estimatedProjectPrice: 568,
        canonicalKey: "bedrosians-round-mosaic-decmak2rmom",
        isCuratedOnly: true,
        pricingSource: "project-allowance",
      },
      backups: [
        {
          name: 'Daltile 2" Hex Warm Gray Mosaic',
          style: ["modern", "minimal"],
          price: 14.84,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-d2hexgmsp/1293678.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-d2hexgmsp-1293678.jpg",
          type: "hex_mosaic",
          priceRange: [14.84, 14.84],
          note: "Project estimate: $178.",
          vendor: "Daltile",
          unitPrice: 14.84,
          estimatedProjectPrice: 178,
          canonicalKey: "daltile-hex-mosaic-d2hexgmsp",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
        },
        {
          name: 'Merola Tile 2" Hex White Marble Look Mosaic',
          style: ["modern", "minimal"],
          price: 12.54,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/merola-tile-ftc2f/1976818.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/merolatile/merolatile-ftc2f-1976818.jpg",
          type: "marble_hex_mosaic",
          priceRange: [12.54, 12.54],
          note: "Project estimate: $150.",
          vendor: "Merola Tile",
          unitPrice: 12.54,
          estimatedProjectPrice: 150,
          canonicalKey: "merola-tile-ftc2f",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
        },
      ],
      constraints: [
        "Must be small format, ideally 2\" or less.",
        "Matte or slip-appropriate finish only.",
        "Must coordinate tonally with wall and floor tile.",
        "No large-format tile allowed for shower floor.",
      ],
      priceRange: [12.54, 47.35],
      customerText:
        "A small-format stone mosaic underfoot — same palette as the walls, with the grip you need.",
    } satisfies Bin,

    showerTrim: {
      sourcing: "ready",
      intent:
        "Single-handle shower trim in matte black/chrome family — clean, modern, no smart/digital controls.",
      primary: {
        name: "Delta Trinsic 17T Thermostatic Shower Trim",
        primary: true,
        style: ["modern", "minimal"],
        price: 559,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/delta-t17t059/1128453.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/delta/delta-t17t059-1128453.jpg",
        type: "thermostatic_trim",
        priceRange: [559, 559],
        vendor: "Delta",
        unitPrice: 559,
        canonicalKey: "delta-trinsic-17t-t17t059",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "Kohler Purist Diverter Valve Trim",
          style: ["modern", "minimal"],
          price: 293,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/kohler-k-t14491-4/566115.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-t14491-4-566115.jpg",
          type: "modern_trim",
          priceRange: [293, 293],
          vendor: "Kohler",
          unitPrice: 293,
          canonicalKey: "kohler-purist-k-t14491-4",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Moen Engage Shower Head + Handheld Combo",
          style: ["modern", "minimal"],
          price: 280,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/summary/1439827",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/moen/26009.jpg",
          type: "combo_system",
          priceRange: [280, 280],
          vendor: "Moen",
          unitPrice: 280,
          canonicalKey: "moen-engage-1439827",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Single-handle preferred.",
        "Modern/minimal styling only.",
        "Finish must match faucet family.",
        "No smart/digital shower systems.",
        "Trim only — rough-in valve body is contractor scope.",
        "Must have a valid product image.",
      ],
      priceRange: [280, 559],
      customerText:
        "A clean modern shower trim with the controls and showerhead working as one set.",
    } satisfies Bin,

    showerGlass: {
      sourcing: "ready",
      intent:
        "Frameless or semi-frameless clear-glass enclosure. Minimal hardware, maximum visual openness.",
      primary: {
        name: 'DreamLine Lumen 40-41" W × 72" H Semi-Frameless Hinged Shower Door',
        primary: true,
        style: ["modern", "minimal"],
        price: 700,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/dreamline-shdr-5340720/s1693693",
        image:
          "https://res.cloudinary.com/american-bath-group/image/upload/v1714590388/abg-graphics/original-images/dreamline/shared/lumen/jpeg/lumen-shower-door-rs76-30d-b-01.jpg",
        type: "hinged_door",
        priceRange: [700, 700],
        vendor: "DreamLine",
        unitPrice: 700,
        widthInches: 40,
        canonicalKey: "dreamline-lumen-shdr-5340720",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: 'DreamLine Linea 34" W × 72" H Frameless Open-Entry Shower Screen',
          style: ["modern", "minimal"],
          price: 650,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/dreamline-shdr-3234721/s1159178",
          image:
            "https://res.cloudinary.com/american-bath-group/image/upload/v1714590964/abg-graphics/original-images/dreamline/shower-screens/linea/jpeg/linea-shower-door-rs393-30d-01.jpg",
          type: "fixed_panel",
          priceRange: [650, 650],
          vendor: "DreamLine",
          unitPrice: 650,
          widthInches: 34,
          canonicalKey: "dreamline-linea-shdr-3234721",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: 'DreamLine French Linea 34" W × 72" H Patterned-Glass Shower Screen',
          style: ["modern", "minimal"],
          price: 690,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/dreamline-shdr-3234721-89/s1319707",
          image: "https://ferguson.dreamline.com/img/p/2/0/8/6/7/4/208674-large_default.jpg",
          type: "privacy_panel",
          priceRange: [690, 690],
          note: "Patterned glass option — only when added privacy is desired.",
          vendor: "DreamLine",
          unitPrice: 690,
          widthInches: 34,
          canonicalKey: "dreamline-french-linea-shdr-3234721-89",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Clear glass default.",
        "Minimal hardware — frameless or semi-frameless only.",
        "Hardware finish must coordinate with faucet/shower trim family.",
        "Final size must be contractor-verified to actual opening.",
      ],
      priceRange: [650, 700],
      customerText:
        "A frameless clear-glass enclosure that keeps the shower visually open with minimal hardware.",
    } satisfies Bin,

    toilet: {
      sourcing: "ready",
      intent:
        "Clean modern white toilet — elongated, comfort height, visually quiet. Should not be a focal point.",
      primary: {
        name: "Kohler Santa Rosa Comfort Height One-Piece Elongated Toilet (White)",
        primary: true,
        style: ["modern", "minimal"],
        price: 549,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/KOHLER-Santa-Rosa-1-Piece-1-28-GPF-Single-Flush-Elongated-Toilet-in-White-Seat-Included-K-3810-0/202188170",
        image:
          "https://images.thdstatic.com/productImages/3d8c2a7e-3a4b-4f6a-9c4f-8b8b8b8b8b8b/svn/white-kohler-one-piece-toilets-k-3810-0-64_1000.jpg",
        type: "one_piece_elongated",
        priceRange: [450, 600],
        vendor: "Kohler",
        unitPrice: 549,
        canonicalKey: "kohler-santa-rosa-k-3810-0",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "American Standard Cadet 3 Comfort Height Two-Piece Elongated Toilet (White)",
          style: ["modern", "minimal"],
          price: 348,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/American-Standard-Cadet-3-Tall-Height-2-piece-1-28-GPF-Single-Flush-Elongated-Toilet-in-White-Seat-Not-Included-215AA104-020/202050147",
          image:
            "https://images.thdstatic.com/productImages/3d2e0e67-6e1f-4c1a-9c0a-4f1c4f1c4f1c/svn/white-american-standard-two-piece-toilets-215aa104-020-64_1000.jpg",
          type: "two_piece_elongated",
          priceRange: [300, 400],
          note: "Budget backup.",
          vendor: "American Standard",
          unitPrice: 348,
          canonicalKey: "american-standard-cadet-3-215aa104-020",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Swiss Madison St. Tropez One-Piece Elongated Skirted Toilet (White)",
          style: ["modern", "minimal"],
          price: 469,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Swiss-Madison-St-Tropez-1-Piece-1-1-1-6-GPF-Dual-Flush-Elongated-Toilet-in-Glossy-White-Seat-Included-SM-1T254/313516552",
          image:
            "https://images.thdstatic.com/productImages/2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a/svn/glossy-white-swiss-madison-one-piece-toilets-sm-1t254-64_1000.jpg",
          type: "skirted_one_piece",
          priceRange: [400, 600],
          note: "Modern skirted backup.",
          vendor: "Swiss Madison",
          unitPrice: 469,
          canonicalKey: "swiss-madison-st-tropez-sm-1t254",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          // TODO: confirm retailer price / project allowance — link points to a
          // category landing page, not a specific SKU.
          name: "Bidet-Ready Modern One-Piece Elongated Toilet (White)",
          style: ["modern", "minimal"],
          price: 599,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/b/Bath-Toilets/Bidet-Toilet/N-5yc1vZbzbtZ1z1ku2x",
          image:
            "https://images.thdstatic.com/productImages/1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b/svn/white-bidet-ready-toilets-64_1000.jpg",
          type: "bidet_ready",
          priceRange: [500, 700],
          note: "Upgrade backup — bidet-ready rough-in.",
          vendor: "BOBOX Curated",
          unitPrice: 599,
          canonicalKey: "modern-balanced-toilet-bidet-ready-placeholder",
          isCuratedOnly: true,
          pricingSource: "pending",
          pricingNote: "TODO: confirm retailer price / project allowance — category link only.",
        },
      ],
      constraints: [
        "White finish only.",
        "Elongated bowl preferred.",
        "Comfort/chair height preferred.",
        "Modern, clean profile — toilet should not be the focal point.",
        "Real, image-backed product required.",
      ],
      priceRange: [300, 700],
      customerText:
        "A clean, comfort-height white toilet that quietly disappears next to the vanity and shower.",
    } satisfies Bin,

    /* ─── Phase 2.8: opened bins ──────────────────────────────────────
     * sink / showerSystem / accentTile — added per Phase 2.8 to close
     * customize-drawer coverage gaps. Each new bin satisfies the
     * Phase 2.7 + 2.8 standard: primary has confirmed pricing
     * (retailer or project-allowance), explicit vendor + canonicalKey
     * + isCuratedOnly, plus ≥1 alternative. Estimated/pending
     * alternatives carry a TODO pricingNote and are surfaced by
     * engine diagnostics.
     */

    sink: {
      sourcing: "ready",
      intent:
        "Undermount white vitreous-china sink, sized to the 36\" floating vanity. Visually quiet, easy to clean.",
      primary: {
        name: "Kohler Caxton Vitreous China Undermount Bathroom Sink (White)",
        primary: true,
        style: ["modern", "minimal"],
        finish: "White",
        price: 132,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/KOHLER-Caxton-Vitreous-China-Undermount-Bathroom-Sink-with-Overflow-Drain-in-White-K-2210-0/100379015",
        image:
          "https://images.thdstatic.com/productImages/0a09cba8-dd29-4f70-9f9e-9f9e9f9e9f9e/svn/white-kohler-undermount-bathroom-sinks-k-2210-0-64_1000.jpg",
        type: "undermount_oval",
        priceRange: [132, 132],
        vendor: "Kohler",
        unitPrice: 132,
        mountType: "undermount",
        canonicalKey: "kohler-caxton-k-2210-0",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "American Standard Aqualyn Self-Rimming/Undermount Bathroom Sink (White)",
          style: ["modern", "minimal"],
          finish: "White",
          price: 99,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/American-Standard-Aqualyn-Self-Rimming-Drop-in-Bathroom-Sink-in-White-0476028020/100069556",
          image:
            "https://images.thdstatic.com/productImages/1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b/svn/white-american-standard-drop-in-bathroom-sinks-0476028020-64_1000.jpg",
          type: "undermount_oval",
          priceRange: [99, 99],
          note: "Budget undermount alternative.",
          vendor: "American Standard",
          unitPrice: 99,
          mountType: "undermount",
          canonicalKey: "american-standard-aqualyn-0476028020",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "KRAUS Elavo Undermount Vitreous China Bathroom Sink (White)",
          style: ["modern", "minimal"],
          finish: "White",
          price: 135,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/KRAUS-Elavo-Small-Round-Ceramic-Undermount-Bathroom-Sink-in-White-with-Overflow-KCU-241/304392321",
          image:
            "https://images.thdstatic.com/productImages/2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a/svn/white-kraus-undermount-bathroom-sinks-kcu-241-64_1000.jpg",
          type: "undermount_round",
          priceRange: [135, 135],
          note: "Round-bowl alternative — coordinates with round-mosaic shower floor.",
          vendor: "KRAUS",
          unitPrice: 135,
          mountType: "undermount",
          canonicalKey: "kraus-elavo-kcu-241",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Undermount only — no drop-in or vessel sinks in default Modern Balanced path.",
        "White vitreous china only.",
        "Single-hole faucet deck cutout to match faucet primary.",
        "Sink width must fit inside vanity cutout (≤ vanity width − 4\").",
      ],
      priceRange: [99, 135],
      customerText:
        "An undermount white sink that sits flush with the vanity top — clean lines, easy upkeep.",
    } satisfies Bin,

    showerSystem: {
      sourcing: "ready",
      intent:
        "Matte black wall-mount tub/shower trim set — handle, spout, showerhead. Reads as one coordinated set with the faucet family.",
      primary: {
        name: "Delta Trinsic 1-Handle Wall-Mount Tub and Shower Trim Kit (Matte Black, Valve Not Included)",
        primary: true,
        style: ["modern", "minimal"],
        finish: "Matte Black",
        price: 653,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/Delta-Trinsic-1-Handle-Wall-Mount-Tub-and-Shower-Trim-Kit-in-Matte-Black-Valve-Not-Included-T17T259-BL/308218878",
        image:
          "https://images.thdstatic.com/productImages/3a3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a/svn/matte-black-delta-shower-faucets-t17t259-bl-64_1000.jpg",
        type: "tub_shower_trim_kit",
        priceRange: [653, 653],
        vendor: "Delta",
        unitPrice: 653,
        canonicalKey: "delta-trinsic-t17t259-bl",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "Moen Doux 1-Handle Posi-Temp Tub and Shower Faucet Trim Kit (Matte Black, Valve Not Included)",
          style: ["modern", "minimal"],
          finish: "Matte Black",
          price: 245,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/MOEN-Doux-1-Handle-Posi-Temp-Tub-and-Shower-Faucet-Trim-Kit-in-Matte-Black-Valve-Not-Included-T2473BL/305800566",
          image:
            "https://images.thdstatic.com/productImages/4a4a4a4a-4a4a-4a4a-4a4a-4a4a4a4a4a4a/svn/matte-black-moen-shower-faucets-t2473bl-64_1000.jpg",
          type: "tub_shower_trim_kit",
          priceRange: [245, 245],
          note: "Coordinates with Moen Doux faucet alternative.",
          vendor: "Moen",
          unitPrice: 245,
          canonicalKey: "moen-doux-t2473bl",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Kohler Purist 1-Handle Tub and Shower Trim Kit (Matte Black, Valve Not Included)",
          style: ["modern", "minimal"],
          finish: "Matte Black",
          price: 480,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/kohler-k-tlsht14422-4/2010505.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-tlsht14422-4-2010505.jpg",
          type: "tub_shower_trim_kit",
          priceRange: [480, 480],
          note: "Higher-end Kohler alternative; same matte-black family.",
          vendor: "Kohler",
          unitPrice: 480,
          canonicalKey: "kohler-purist-tlsht14422-4",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Wall-mount only — no smart/digital shower systems.",
        "Finish must match faucet bin family (matte black default).",
        "Trim kit only — rough-in valve body is contractor scope.",
        "Single-handle preferred for visual coherence with faucet.",
      ],
      priceRange: [245, 653],
      customerText:
        "A matte-black trim set — one handle, spout, and showerhead — that quietly matches the rest of the room's hardware.",
    } satisfies Bin,

    accentTile: {
      sourcing: "ready",
      intent:
        "Small accent tile feature — niche back, vanity backsplash, or shower band — in the same warm-neutral family as walls and floor.",
      primary: {
        name: 'Bedrosians Cloé Zellige-Look Ceramic 4"×4" (Off-White, Matte)',
        primary: true,
        style: ["modern", "minimal"],
        priceRange: [180, 320],
        vendor: "BOBOX Curated",
        estimatedProjectPrice: 240,
        canonicalKey: "modern-balanced-accent-tile-zellige-4x4",
        isCuratedOnly: true,
        pricingSource: "project-allowance",
        pricingNote:
          "Project allowance covers ~12–18 SF accent area (niche back + vanity backsplash band).",
      },
      backups: [
        {
          name: 'Marble Hex Mosaic 2" (Carrara, Honed)',
          style: ["modern", "minimal"],
          priceRange: [200, 360],
          note: "Hex marble accent — pairs with marble-look wall tile.",
          vendor: "BOBOX Curated",
          estimatedProjectPrice: 280,
          canonicalKey: "modern-balanced-accent-tile-marble-hex-2",
          isCuratedOnly: true,
          pricingSource: "project-allowance",
          pricingNote:
            "Project allowance covers ~12–18 SF accent area; refresh when SKU is finalized.",
        },
        {
          name: '1"×4" Stacked Matte Porcelain (Warm Grey)',
          style: ["modern", "minimal"],
          priceRange: [150, 280],
          note: "Linear stacked accent — pairs with warm-grey floor.",
          vendor: "BOBOX Curated",
          estimatedProjectPrice: 200,
          canonicalKey: "modern-balanced-accent-tile-stacked-1x4",
          isCuratedOnly: true,
          pricingSource: "estimated",
          pricingNote:
            "TODO: confirm SKU and per-SF retailer price; allowance assumes ~12–18 SF accent area.",
        },
      ],
      constraints: [
        "Must coordinate tonally with shower wall + floor tile (one stone family).",
        "Matte / honed finish only — no glossy accent.",
        "Accent area capped at vanity backsplash + niche back (≤ ~18 SF) in default scope.",
        "No bold patterned tile — accent stays in the warm-neutral family.",
      ],
      priceRange: [150, 360],
      customerText:
        "A small accent moment — niche back or vanity backsplash — in the same warm palette as the rest of the tile.",
    } satisfies Bin,

    accessories: {
      sourcing: "ready",
      intent:
        "Matte black 4-piece bath hardware set — towel bar, towel ring, robe hook, TP holder. Cohesive with faucet/trim family.",
      primary: {
        name: "VIGO Cass 4-Piece Bath Hardware Set (Matte Black)",
        primary: true,
        style: ["modern", "minimal"],
        price: 119,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/VIGO-Cass-4-Piece-Bath-Hardware-Set-with-24-in-Towel-Bar-Toilet-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-VG09040MB4PSet/318242178",
        image:
          "https://images.thdstatic.com/productImages/8f8a3c5d-2b6f-4a3e-9d6e-1b1f2a8c8d8a/svn/matte-black-vigo-bathroom-hardware-sets-vg09040mb4pset-64_1000.jpg",
        type: "matte_black_4pc_set",
        priceRange: [80, 150],
        vendor: "VIGO",
        unitPrice: 119,
        canonicalKey: "vigo-cass-vg09040mb4pset",
        isCuratedOnly: true,
        pricingSource: "retailer",
      },
      backups: [
        {
          name: "Moen Genta 4-Piece Bath Hardware Set (Matte Black)",
          style: ["modern", "minimal"],
          price: 139,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/MOEN-Genta-LX-4-Piece-Bath-Hardware-Set-with-24-in-Towel-Bar-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-Y5294BL/313512311",
          image:
            "https://images.thdstatic.com/productImages/9f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8b/svn/matte-black-moen-bathroom-hardware-sets-y5294bl-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [120, 160],
          note: "Branded backup — Moen finish family pairs with Moen faucet/trim.",
          vendor: "Moen",
          unitPrice: 139,
          canonicalKey: "moen-genta-y5294bl",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "KRAUS Elie 4-Piece Bath Hardware Set (Matte Black)",
          style: ["modern", "minimal"],
          price: 149,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/KRAUS-Elie-4-Piece-Bath-Hardware-Set-with-Towel-Bar-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-KEA-18843MB/318242179",
          image:
            "https://images.thdstatic.com/productImages/7f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8c/svn/matte-black-kraus-bathroom-hardware-sets-kea-18843mb-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [130, 170],
          note: "Upgraded backup — heavier-gauge construction.",
          vendor: "KRAUS",
          unitPrice: 149,
          canonicalKey: "kraus-elie-kea-18843mb",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
        {
          name: "Franklin Brass Maxted 4-Piece Bath Hardware Set (Matte Black)",
          style: ["modern", "minimal"],
          price: 89,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Franklin-Brass-Maxted-4-Piece-Bath-Hardware-Set-with-Towel-Bar-Toilet-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-MAX4PC-MB/313091237",
          image:
            "https://images.thdstatic.com/productImages/6f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8d/svn/matte-black-franklin-brass-bathroom-hardware-sets-max4pc-mb-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [80, 110],
          note: "Budget backup.",
          vendor: "Franklin Brass",
          unitPrice: 89,
          canonicalKey: "franklin-brass-maxted-max4pc-mb",
          isCuratedOnly: true,
          pricingSource: "retailer",
        },
      ],
      constraints: [
        "Modern/minimal design only — no ornate or rustic profiles.",
        "Finish must coordinate with faucet and shower trim (matte black default).",
        "Set must be from a single product line (no mixing brands/finishes).",
        "No chrome-default accessories in Modern Balanced path.",
        "Real, image-backed product required.",
      ],
      priceRange: [80, 170],
      customerText:
        "A matched matte-black hardware set — towel bar, ring, hook, and paper holder, all from one line.",
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
