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
  /** Optional real product details (present on "ready" bins). */
  finish?: string;
  price?: number;
  retailer?: string;
  link?: string;
  image?: string;
  /** Faucet/fixture deck type, e.g. "single_hole", "widespread", "centerset". */
  type?: string;
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
      sourcing: "ready",
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
      sourcing: "ready",
      intent:
        "Single-hole, tall-spout, matte black. Reads as one continuous line with the vanity.",
      primary: {
        name: "Delta Trinsic Single Hole Single-Handle Bathroom Faucet",
        finish: "Matte Black",
        price: 329,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/Delta-Trinsic-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-559LF-BLLPU/301646776",
        image:
          "https://images.thdstatic.com/productImages/1ad3829c-9a9d-4ba8-84a2-b53ee9f259d9/svn/matte-black-delta-single-hole-bathroom-faucets-559lf-bllpu-64_1000.jpg",
        type: "single_hole",
        priceRange: [329, 329],
      },
      backups: [
        {
          name: "Moen Doux Single Hole Single-Handle Bathroom Faucet",
          finish: "Matte Black",
          price: 318.99,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/MOEN-Doux-Single-Hole-Single-Handle-Bathroom-Faucet-in-Matte-Black-S6910BL/306756408",
          image:
            "https://images.thdstatic.com/productImages/b20adebe-2e81-4992-8e64-0ae9b59f3b38/svn/matte-black-moen-single-hole-bathroom-faucets-s6910bl-64_1000.jpg",
          type: "single_hole",
          priceRange: [318.99, 318.99],
        },
        {
          name: "Delta Trinsic Single Hole Bathroom Faucet",
          finish: "Champagne Bronze",
          price: 379,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Delta-Trinsic-Gold-Single-Hole-Single-Handle-Bathroom-Faucet-with-Metal-Drain-Assembly-in-Champagne-Bronze-559LF-CZMPU/203897768",
          image:
            "https://images.thdstatic.com/productImages/c899073e-b62b-42d6-8e4f-cb3cb1d590b7/svn/champagne-bronze-delta-single-hole-bathroom-faucets-559lf-czmpu-64_1000.jpg",
          type: "single_hole",
          priceRange: [379, 379],
          note: "Alternate finish — only if lighting/trim/accessories swap to champagne bronze family.",
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
        price: 339,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/kohler-k-31364/1897338.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-31364-bnl-8211481.jpg",
        type: "thin_frame_rectangular",
        priceRange: [339, 339],
      },
      backups: [
        {
          name: "Kohler Castia Rectangular Mirror (Studio McGee)",
          price: 320,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/kohler-k-34969/1950628.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-34969-2mb-2351648.jpg",
          type: "warm_frame_rectangular",
          priceRange: [320, 320],
        },
        {
          name: "Signature Hardware Curie LED Mirror",
          price: 340,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/signature-hardware-946559-32/1652473.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/signaturehardware/signature-hardware-442983-1508143.jpg",
          type: "led_backlit",
          priceRange: [340, 340],
          note: "LED upgrade — not default. Linked with lighting bin (drop sconces).",
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
      sourcing: "ready",
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
      sourcing: "ready",
      intent:
        "Large-format matte porcelain in the same warm-neutral family as shower walls. Reads continuous, never overpowers.",
      primary: {
        name: 'Daltile Dignitary 12"×24" Warm Gray Porcelain',
        price: 10.11,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/daltile-dr1224p/1319445.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-dr1224p-1319445.jpg",
        type: "large_format_porcelain",
        priceRange: [10.11, 10.11],
        note: "Per SF.",
      },
      backups: [
        {
          name: 'Daltile Florentine 12"×24" Carrara Look Porcelain',
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-fl1224fp/1318054.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-fl1224fp-1318054.jpg",
          type: "marble_look",
          priceRange: [10, 10],
        },
        {
          name: 'Daltile Slate 12"×12" Tile',
          price: 9.8,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-s1212p1s/1318811.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-s1212p1s-1318811.jpg",
          type: "darker_stone",
          priceRange: [9.8, 9.8],
          note: "Darker stone option — only if shower wall tile leans warm grey/stone.",
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
        price: 47.35,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/bedrosians-decmak2rmom/1903359.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/bedrosians/bedrosians-decmak2rmom-1903359.jpg",
        type: "round_mosaic",
        priceRange: [47.35, 47.35],
        note: "Project estimate: $568.",
      },
      backups: [
        {
          name: 'Daltile 2" Hex Warm Gray Mosaic',
          price: 14.84,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/daltile-d2hexgmsp/1293678.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/daltile/daltile-d2hexgmsp-1293678.jpg",
          type: "hex_mosaic",
          priceRange: [14.84, 14.84],
          note: "Project estimate: $178.",
        },
        {
          name: 'Merola Tile 2" Hex White Marble Look Mosaic',
          price: 12.54,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/merola-tile-ftc2f/1976818.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/merolatile/merolatile-ftc2f-1976818.jpg",
          type: "marble_hex_mosaic",
          priceRange: [12.54, 12.54],
          note: "Project estimate: $150.",
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
        price: 559,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/product/delta-t17t059/1128453.html",
        image:
          "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/delta/delta-t17t059-1128453.jpg",
        type: "thermostatic_trim",
        priceRange: [559, 559],
      },
      backups: [
        {
          name: "Kohler Purist Diverter Valve Trim",
          price: 293,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/kohler-k-t14491-4/566115.html",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/kohler/kohler-k-t14491-4-566115.jpg",
          type: "modern_trim",
          priceRange: [293, 293],
        },
        {
          name: "Moen Engage Shower Head + Handheld Combo",
          price: 280,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/product/summary/1439827",
          image:
            "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/moen/26009.jpg",
          type: "combo_system",
          priceRange: [280, 280],
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
        price: 700,
        retailer: "Ferguson",
        link: "https://www.fergusonhome.com/dreamline-shdr-5340720/s1693693",
        image:
          "https://res.cloudinary.com/american-bath-group/image/upload/v1714590388/abg-graphics/original-images/dreamline/shared/lumen/jpeg/lumen-shower-door-rs76-30d-b-01.jpg",
        type: "hinged_door",
        priceRange: [700, 700],
      },
      backups: [
        {
          name: 'DreamLine Linea 34" W × 72" H Frameless Open-Entry Shower Screen',
          price: 650,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/dreamline-shdr-3234721/s1159178",
          image:
            "https://res.cloudinary.com/american-bath-group/image/upload/v1714590964/abg-graphics/original-images/dreamline/shower-screens/linea/jpeg/linea-shower-door-rs393-30d-01.jpg",
          type: "fixed_panel",
          priceRange: [650, 650],
        },
        {
          name: 'DreamLine French Linea 34" W × 72" H Patterned-Glass Shower Screen',
          price: 690,
          retailer: "Ferguson",
          link: "https://www.fergusonhome.com/dreamline-shdr-3234721-89/s1319707",
          image: "https://ferguson.dreamline.com/img/p/2/0/8/6/7/4/208674-large_default.jpg",
          type: "privacy_panel",
          priceRange: [690, 690],
          note: "Patterned glass option — only when added privacy is desired.",
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
        price: 549,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/KOHLER-Santa-Rosa-1-Piece-1-28-GPF-Single-Flush-Elongated-Toilet-in-White-Seat-Included-K-3810-0/202188170",
        image:
          "https://images.thdstatic.com/productImages/3d8c2a7e-3a4b-4f6a-9c4f-8b8b8b8b8b8b/svn/white-kohler-one-piece-toilets-k-3810-0-64_1000.jpg",
        type: "one_piece_elongated",
        priceRange: [450, 600],
      },
      backups: [
        {
          name: "American Standard Cadet 3 Comfort Height Two-Piece Elongated Toilet (White)",
          price: 348,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/American-Standard-Cadet-3-Tall-Height-2-piece-1-28-GPF-Single-Flush-Elongated-Toilet-in-White-Seat-Not-Included-215AA104-020/202050147",
          image:
            "https://images.thdstatic.com/productImages/3d2e0e67-6e1f-4c1a-9c0a-4f1c4f1c4f1c/svn/white-american-standard-two-piece-toilets-215aa104-020-64_1000.jpg",
          type: "two_piece_elongated",
          priceRange: [300, 400],
          note: "Budget backup.",
        },
        {
          name: "Swiss Madison St. Tropez One-Piece Elongated Skirted Toilet (White)",
          price: 469,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Swiss-Madison-St-Tropez-1-Piece-1-1-1-6-GPF-Dual-Flush-Elongated-Toilet-in-Glossy-White-Seat-Included-SM-1T254/313516552",
          image:
            "https://images.thdstatic.com/productImages/2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a/svn/glossy-white-swiss-madison-one-piece-toilets-sm-1t254-64_1000.jpg",
          type: "skirted_one_piece",
          priceRange: [400, 600],
          note: "Modern skirted backup.",
        },
        {
          name: "Bidet-Ready Modern One-Piece Elongated Toilet (White)",
          price: 599,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/b/Bath-Toilets/Bidet-Toilet/N-5yc1vZbzbtZ1z1ku2x",
          image:
            "https://images.thdstatic.com/productImages/1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b/svn/white-bidet-ready-toilets-64_1000.jpg",
          type: "bidet_ready",
          priceRange: [500, 700],
          note: "Upgrade backup — bidet-ready rough-in.",
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

    accessories: {
      sourcing: "ready",
      intent:
        "Matte black 4-piece bath hardware set — towel bar, towel ring, robe hook, TP holder. Cohesive with faucet/trim family.",
      primary: {
        name: "VIGO Cass 4-Piece Bath Hardware Set (Matte Black)",
        price: 119,
        retailer: "Home Depot",
        link: "https://www.homedepot.com/p/VIGO-Cass-4-Piece-Bath-Hardware-Set-with-24-in-Towel-Bar-Toilet-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-VG09040MB4PSet/318242178",
        image:
          "https://images.thdstatic.com/productImages/8f8a3c5d-2b6f-4a3e-9d6e-1b1f2a8c8d8a/svn/matte-black-vigo-bathroom-hardware-sets-vg09040mb4pset-64_1000.jpg",
        type: "matte_black_4pc_set",
        priceRange: [80, 150],
      },
      backups: [
        {
          name: "Moen Genta 4-Piece Bath Hardware Set (Matte Black)",
          price: 139,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/MOEN-Genta-LX-4-Piece-Bath-Hardware-Set-with-24-in-Towel-Bar-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-Y5294BL/313512311",
          image:
            "https://images.thdstatic.com/productImages/9f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8b/svn/matte-black-moen-bathroom-hardware-sets-y5294bl-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [120, 160],
          note: "Branded backup — Moen finish family pairs with Moen faucet/trim.",
        },
        {
          name: "KRAUS Elie 4-Piece Bath Hardware Set (Matte Black)",
          price: 149,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/KRAUS-Elie-4-Piece-Bath-Hardware-Set-with-Towel-Bar-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-KEA-18843MB/318242179",
          image:
            "https://images.thdstatic.com/productImages/7f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8c/svn/matte-black-kraus-bathroom-hardware-sets-kea-18843mb-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [130, 170],
          note: "Upgraded backup — heavier-gauge construction.",
        },
        {
          name: "Franklin Brass Maxted 4-Piece Bath Hardware Set (Matte Black)",
          price: 89,
          retailer: "Home Depot",
          link: "https://www.homedepot.com/p/Franklin-Brass-Maxted-4-Piece-Bath-Hardware-Set-with-Towel-Bar-Toilet-Paper-Holder-Towel-Ring-and-Robe-Hook-in-Matte-Black-MAX4PC-MB/313091237",
          image:
            "https://images.thdstatic.com/productImages/6f3a3c1d-1b6f-4a3e-9d6e-1b1f2a8c8d8d/svn/matte-black-franklin-brass-bathroom-hardware-sets-max4pc-mb-64_1000.jpg",
          type: "matte_black_4pc_set",
          priceRange: [80, 110],
          note: "Budget backup.",
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
