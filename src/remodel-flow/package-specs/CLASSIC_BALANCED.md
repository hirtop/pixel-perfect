# Classic — Balanced Package  *(LOCKED v1)*

Internal source-of-truth spec for the **Classic Balanced** curated package.
Structured mirror: `src/remodel-flow/packages/classic-balanced.ts`.

**Sourcing legend (per bin):**
- ✅ **Ready** — real products mapped, image-ready, included in pricing.
- 🟡 **Placeholder** — spec is locked but a real product / image is not yet sourced.
  UI shows "Product sourcing in progress"; bin is excluded from pricing until ready.

**Bin status (locked v1):**
| Bin | Status |
|---|---|
| Vanity | 🟡 Placeholder |
| Faucet | 🟡 Placeholder |
| Mirror | 🟡 Placeholder |
| Lighting | 🟡 Placeholder |
| Shower Wall Tile | 🟡 Placeholder |
| Floor Tile | 🟡 Placeholder |
| Shower Floor Tile | 🟡 Placeholder |
| Shower Trim | 🟡 Placeholder |
| Shower Glass | 🟡 Placeholder |
| Toilet | 🟡 Placeholder |
| Accessories | 🟡 Placeholder |

---

## Positioning

A timeless, warm Classic bathroom built around a furniture-style vanity, marble-look
porcelain, and a coordinated polished-chrome (or brushed nickel) fixture suite.
Familiar, durable, and quietly elegant — designed to age well with the home rather
than chase a trend.

- **Style:** Classic (furniture-style vanity, marble-look surfaces, polished metals, soft warm lighting)
- **Tier:** Balanced (designer-grade materials with smart trade-offs)
- **Audience:** Homeowners who want a refined, broadly appealing bathroom that
  reads as "well-built classic" — not period-traditional, not contemporary.

---

## Price model

- **Finish products budget:** $3,000–$6,000
- **Estimated remodel total (products + labor + shipping):** $12,000–$20,000

| Layer | Low | High |
|---|---|---|
| Finish products (sum of bin ranges) | ~$4,500 | ~$8,800 |
| Target product band | $3,000 | $6,000 |
| Labor (Balanced tier base) | $6,500 | $6,500 |
| Shipping (flat est.) | $600 | $600 |
| **Estimated remodel total** | **~$12,000** | **~$20,000** |

> Bin ranges intentionally extend slightly above the $6,000 product target so
> backups can flex up without breaking the package. Default selections (primaries)
> should land inside the $3,000–$6,000 band.

---

## Cross-bin compatibility rules

- **Vanity drives faucet compatibility** — furniture-style vanity deck dictates
  widespread (3-hole, 8" centers) by default; single-hole only when the vanity
  top is pre-drilled accordingly.
- **Mirror + lighting are linked** — sconces flank a framed mirror; if mirror is
  a large pivot/arched style, sconces can be downgraded to overhead bar only.
- **Tile must remain coordinated** — wall tile, floor tile, and shower floor tile
  share a single marble/stone family in a warm white-to-soft-grey palette.
  No mixing marble-look + concrete-look + zellige in the same package.
- **Metal finish family is unified** — faucet, shower trim, lighting, mirror frame,
  and accessories all read as one family (polished chrome default; brushed nickel
  alternate). No mixing chrome + matte black in the default path.
- **Rough-in (valve bodies, drains, supply lines, venting) is contractor scope** —
  not represented as a product bin here.

---

## Style validation

Every curated product carries a `style: ProductStyle[]` tag. The Classic Balanced
renderer only accepts products whose tags include **`classic`** or **`traditional`**.

- ✅ Allowed: `classic`, `traditional`
- 🚫 Blocked: `modern`-only, `minimal`-only, `industrial`-only products
- Untagged products are excluded (must be validated explicitly)

Helpers (in `src/remodel-flow/packages/classic-balanced.ts`):
- `isAllowedInClassicBalanced(product)`
- `filterBinForClassicBalanced(bin)` — drops blocked products and falls back to
  the next allowed backup if the primary is blocked.

---

## Bin: Vanity  *(Sourcing: 🟡 Placeholder)*

**Intent:** Anchor the room with a furniture-style vanity in white shaker or warm
wood, with stone or marble-look top and polished-chrome (or brushed-nickel) hardware.

- **Primary:** 36" White Shaker Vanity, marble-look top, single undermount sink, polished chrome pulls
- **Backups (max 3):**
  1. 36" Warm Oak Shaker Vanity, marble-look top, single undermount sink
  2. 36" Painted Grey Shaker Vanity, marble-look top, single undermount sink
  3. 48" White Shaker Double-Drawer Vanity (upgrade), marble-look top
- **Constraints:**
  - Floor-standing furniture-style only. No floating/wall-hung in default path.
  - Width 30–48" only.
  - Stone or marble-look top with integrated backsplash optional.
  - Hardware: polished chrome or brushed nickel pulls/knobs only.
- **Price range:** $1,100–$2,200
- **Customer-facing text:** "A furniture-style vanity that grounds the room and gives the space a finished, built-in feel."

---

## Bin: Faucet  *(Sourcing: 🟡 Placeholder)*

**Intent:** Widespread (3-hole) lever or cross-handle faucet in polished chrome.
Reads as a refined, classic centerpiece on the vanity deck.

- **Primary:** Widespread Lever-Handle Bathroom Faucet, Polished Chrome
- **Backups (max 3):**
  1. Widespread Cross-Handle Bathroom Faucet, Polished Chrome
  2. Widespread Lever-Handle Bathroom Faucet, Brushed Nickel
  3. Centerset Two-Handle Bathroom Faucet, Polished Chrome (compact alt)
- **Constraints:**
  - Widespread (3-hole, 8" centers) preferred; centerset only as compact backup.
  - Classic/traditional styling only — no industrial or matte-black profiles in default path.
  - Finish must coordinate with lighting, shower trim, and accessories.
- **Price range:** $250–$500
- **Customer-facing text:** "A widespread chrome faucet that feels classic without being fussy."

---

## Bin: Mirror  *(Sourcing: 🟡 Placeholder)*

**Intent:** Framed rectangular or arched mirror sized to the vanity. Adds warmth
and a subtle decorative beat against the tile.

- **Primary:** Framed Rectangular Mirror, polished-chrome or warm-wood frame, 30–36" wide
- **Backups (max 3):**
  1. Arched Framed Mirror, polished-chrome frame
  2. Beveled Frameless Rectangular Mirror with subtle edge detail
  3. Framed Mirror Pair (his/hers), for 48" double-drawer vanity upgrade
- **Constraints:**
  - Classic/traditional styling only.
  - Width 70–90% of vanity width (single mirror) or paired for 48"+ vanities.
  - Centered above the vanity.
  - Frame finish must coordinate with faucet/lighting family.
- **Price range:** $200–$420
- **Customer-facing text:** "A framed mirror that adds warmth and a quiet bit of detail above the vanity."

---

## Bin: Lighting  *(Sourcing: 🟡 Placeholder)*

**Intent:** Layered classic lighting — flanking sconces with fabric or seeded-glass
shades, plus an overhead flush or semi-flush in the same metal family.

- **Primary:** Sconce Pair (polished chrome, seeded glass) + Semi-Flush overhead
- **Backups (max 3):**
  1. 3-Light Vanity Bar (polished chrome, fabric shades) + Flush LED
  2. 2-Light Sconce Pair (brushed nickel, white glass) + Semi-Flush
  3. Single Overhead Pendant (chrome + glass) + Flush LED (compact alt)
- **Constraints:**
  - Color temperature: 2700K–3000K only.
  - Finish must match faucet/trim family.
  - Glass shades preferred; no exposed-bulb industrial fixtures.
- **Price range:** $250–$520
- **Customer-facing text:** "Warm sconces beside the mirror with a soft overhead — classic and flattering, never harsh."

---

## Bin: Shower Wall Tile  *(Sourcing: 🟡 Placeholder)*

**Intent:** Marble-look porcelain or classic 3"×6" subway in warm white. Clean,
familiar, broadly appealing.

- **Primary:** 12"×24" Marble-Look Porcelain, warm white with soft veining
- **Backups (max 3):**
  1. 3"×6" Glossy White Subway Tile, classic stack or running bond
  2. 4"×16" Honed Marble-Look Porcelain
  3. 12"×24" Honed Travertine-Look Porcelain
- **Constraints:**
  - Must coordinate tonally with floor tile and shower floor tile (one stone family).
  - Honed or matte preferred; glossy subway is allowed as a classic exception.
  - No bold patterned or hand-made tile (zellige belongs to Spa).
- **Price range:** $480–$1,000
- **Customer-facing text:** "Marble-look or classic subway walls — familiar, refined, and easy to live with."

---

## Bin: Floor Tile  *(Sourcing: 🟡 Placeholder)*

**Intent:** Marble-look or warm-stone porcelain in a slip-rated finish. Reads
continuous with the shower walls without competing.

- **Primary:** 12"×24" Marble-Look Porcelain, warm white, matte finish
- **Backups (max 3):**
  1. 12"×24" Warm Travertine-Look Porcelain
  2. 12"×12" Classic Marble-Look Porcelain
  3. Hex Mosaic Marble-Look (small-format alt for compact baths)
- **Constraints:**
  - Matte finish only. Slip-rated for wet areas.
  - Must coordinate tonally with shower wall tile.
  - Floor tile must not overpower wall tile.
- **Price range:** $7–$14 / SF
- **Customer-facing text:** "A warm marble-look floor that ties the whole room together without stealing the show."

---

## Bin: Shower Floor Tile  *(Sourcing: 🟡 Placeholder)*

**Intent:** Small-format marble-look mosaic — classic hex or penny round — in
the same stone family as the walls.

- **Primary:** 2" Hex Marble-Look Mosaic, warm white
- **Backups (max 3):**
  1. Penny-Round Marble-Look Mosaic
  2. 1"×2" Marble-Look Brick Mosaic
  3. 2" Hex Warm Grey Marble-Look Mosaic
- **Constraints:**
  - Small format, ideally 2" or less.
  - Matte or slip-appropriate finish only.
  - Must coordinate tonally with wall and floor tile.
  - No large-format tile allowed for shower floor.
- **Price range:** $12–$50 / SF (mosaic sheet)
- **Customer-facing text:** "A classic marble-look mosaic underfoot — same palette as the walls, with the grip you need."

---

## Bin: Shower Trim  *(Sourcing: 🟡 Placeholder)*

**Intent:** Classic two- or single-handle trim in polished chrome, with a fixed
showerhead and matching handheld on a slide bar. Contractor handles rough-in valve.

- **Primary:** Single-Handle Shower Trim with Handheld Combo, Polished Chrome
- **Backups (max 3):**
  1. Two-Handle Shower & Tub Trim, Polished Chrome
  2. Single-Handle Shower Trim, Brushed Nickel
  3. Thermostatic Shower Trim, Polished Chrome (upgrade)
- **Constraints:**
  - Classic/traditional styling only.
  - Finish must match faucet family.
  - No smart/digital shower systems.
  - Trim only — rough-in valve body is contractor scope.
- **Price range:** $280–$600
- **Customer-facing text:** "A classic chrome shower trim with the controls and showerhead working as one set."

---

## Bin: Shower Glass  *(Sourcing: 🟡 Placeholder)*

**Intent:** Semi-frameless or framed clear-glass enclosure in chrome. Slightly
heavier hardware than Modern, in keeping with a Classic palette.

- **Primary:** Semi-Frameless Hinged Shower Door, Polished Chrome hardware
- **Backups (max 3):**
  1. Framed Sliding Shower Door, Polished Chrome
  2. Frameless Fixed Glass Panel (walk-in alt), Polished Chrome clamps
  3. Semi-Frameless Hinged Shower Door, Brushed Nickel
- **Constraints:**
  - Clear glass default.
  - Hardware finish must coordinate with faucet/shower trim family.
  - Final size must be contractor-verified to actual opening.
- **Price range:** $600–$1,100
- **Customer-facing text:** "A clear-glass enclosure with classic chrome hardware — open, but in keeping with the rest of the room."

---

## Bin: Toilet  *(Sourcing: 🟡 Placeholder)*

**Intent:** Two-piece comfort-height white toilet with a softly traditional
profile. Quietly classic — never the focal point.

- **Primary:** Two-Piece Comfort-Height Elongated Toilet, white, classic profile
- **Backups (max 3):**
  1. One-Piece Comfort-Height Elongated Toilet, white (cleaner profile)
  2. Two-Piece Standard-Height Elongated Toilet, white (budget backup)
  3. Skirted One-Piece Elongated Toilet, white (upgrade backup)
- **Constraints:**
  - White finish only.
  - Elongated bowl preferred.
  - Comfort/chair height preferred.
  - Classic, softly traditional profile — toilet should not be the focal point.
- **Price range:** $300–$700
- **Customer-facing text:** "A clean, comfort-height white toilet that quietly fits in next to the vanity and shower."

---

## Bin: Accessories  *(Sourcing: 🟡 Placeholder)*

**Intent:** Polished-chrome 4-piece bath hardware set — towel bar, towel ring,
robe hook, TP holder. Cohesive with faucet and shower trim family.

- **Primary:** 4-Piece Bath Hardware Set, Polished Chrome
- **Backups (max 3):**
  1. 4-Piece Bath Hardware Set, Brushed Nickel
  2. 4-Piece Bath Hardware Set, Polished Chrome (upgraded line)
  3. 4-Piece Bath Hardware Set, Polished Chrome (budget line)
- **Constraints:**
  - Classic/traditional design only — no matte-black or industrial profiles in default path.
  - Finish must coordinate with faucet and shower trim.
  - Set must be from a single product line (no mixing brands/finishes).
- **Price range:** $80–$180
- **Customer-facing text:** "A matched chrome hardware set — towel bar, ring, hook, and paper holder, all from one line."

---

## Contractor notes (out of scope as product bins)

- Rough-in valves, supply lines, drains, venting — **contractor scope**.
- Demolition, framing, waterproofing, electrical rough-in — **contractor scope**.
- Paint, baseboard, door — assumed existing or contractor scope.
- Ventilation fan — covered under contractor electrical, not a curated bin at MVP.
- Final shower-glass dimensions, valve-body model, and any blocking required for
  wall-mount fixtures must be confirmed on-site by the installing contractor.
