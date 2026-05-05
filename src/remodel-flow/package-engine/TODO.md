# Package Engine — Outstanding Work

Tracks what is intentionally NOT yet wired up. Pass 2 normalized the
product/catalog foundation without touching routes, UI, Supabase, auth,
payments, checkout, or LK()/compatibility scoring.

## Status snapshot

### `PACKAGE_MANIFEST` (real packages only)

| Package id          | Status      | Notes                                          |
|---------------------|-------------|------------------------------------------------|
| `modern-balanced`   | curated     | Real sourced bins, used by curated renderer.   |
| `classic-balanced`  | placeholder | Spec only, all 11 bins are `placeholder`.      |

### `LEGACY_ROUTE_ALIASES` (tier-only routes, not packages)

| Alias key   | Tier      | Used by                                  |
|-------------|-----------|------------------------------------------|
| `essential` | essential | `/package/essential`, `/customize/essential` |
| `balanced`  | balanced  | `/package/balanced`,  `/customize/balanced`  |
| `premium`   | premium   | `/package/premium`,   `/customize/premium`   |

All other style-tier combinations (e.g. `spa-premium`, `coastal-balanced`)
are intentionally NOT registered. Do not pad the manifest with fake
placeholders.

## Foundation in place

- Canonical `Tier`, `CanonicalStyleId`, `PackageId`, `BinKey` types.
- `BinKey` reconciled to the **16 real catalog categories**:
  vanity, faucet, sink, mirror, lighting, toilet, bathtub, tubValve,
  showerValve, showerSystem, showerDoor, showerWallTile,
  showerFloorTile, mainFloorTile, accentTile, heatedFloor.
- `normalizeBinKey` accepts display strings (e.g. `"Shower Wall Tile"`,
  `"Bathtubs"`, `"Shower Systems"`) and aliases (`"shower glass"` →
  `showerDoor`, `"shower walls"` → `showerWallTile`). Ambiguous inputs
  (`"shower trim"`, `"shower niche"`, `"accessories"`) return
  `undefined` rather than guess.
- `normalizeTier` / `normalizeStyle` / `parsePackageId` / `makePackageId`.
- `productAdapter.normalizeProduct(raw)` returns a `NormalizedProduct`
  with `binKey`, `tier`, `styles: []` fallback, and untouched `raw`.

## Raw-data cleanup still needed

The product adapter is the canonical normalization layer. Raw catalog
data was NOT mutated in this pass. Remaining cleanup:

1. **Tiered catalog** (`src/data/tiered-catalog.ts`) still uses
   capitalized tier values (`"Budget" | "Balanced" | "Premium"`).
   Adapter handles this, but raw data should eventually be lowercased
   and `"Budget"` renamed to `"essential"`.
2. **No `binKey` on raw products** — adapter derives it from `category`.
   Acceptable for now.
3. **No `styles` on raw tiered products** — adapter returns `styles: []`.
   Real style tagging is required before any non-Modern style package
   can be promoted past `placeholder`.
4. **Modern Balanced / Classic Balanced** package files use a few bin
   names that are NOT in the 16-key canonical set
   (`showerTrim`, `showerGlass`, `accessories`, `floorTile`). These
   live inside legacy package files and are unaffected by this pass.
   They must be migrated when those packages are re-bound to the
   canonical bin keys.

## Not done yet (intentionally)

1. **Routing migration** — `/package/:id` and `/customize/:id` still
   accept tier-only ids via `LEGACY_ROUTE_ALIASES`. Route gating for
   `${style}-${tier}` ids is the next pass.
2. **Resume-route helper** — `src/lib/resumeRoute.ts` only knows about
   tier slugs.
3. **Persistence** — `RemodelFlowState.packageId` is still a free-form
   `string`. Cannot be narrowed to `PackageId` yet because legacy aliases
   (`"balanced"`, `"essential"`, `"premium"`) are still written into the
   field by the Tier flow. Narrow only after route gating lands.
4. **Curated renderer gating** — UI must check `isCurated(packageId)`
   before showing curated layout for non-Modern packages.
5. **Catalog unification** — `catalog.ts` still drives defaults via
   tier-only `STYLE_DEFAULTS`. Long-term, manifest entries should own
   their own bin data.
6. **Style coverage** — only 4 of the 9 canonical styles
   (`modern`, `classic`, `spa`, `minimal`) have any package presence.
   The other 5 are recognised by `normalizeStyle` but have no data.
7. **Tests** — added focused unit tests for normalize/parse/registry/
   adapter. Compatibility/scoring tests untouched.

## Hard rules

- Do not invent SKUs to promote a package out of `placeholder`.
- Do not invent style tags. Untagged products stay `styles: []`.
- Do not expose `partial` or `placeholder` packages as finished UI.
- Do not change LK() scoring or compatibility scoring.
- Do not register all 9 styles or 27 packages as fake placeholders.
- Preserve `/package/balanced` and `/customize/balanced` until new
  routing lands.
