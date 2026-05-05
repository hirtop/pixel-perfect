# Package Engine — Outstanding Work

Tracks what is intentionally NOT yet wired up. Pass 3 routed the live
catalog through `normalizeProduct` via `getNormalizedCatalog()` and
added safe `styles[]` hints for 6 visible Balanced rows. Raw catalog
exports are unchanged. Routes, UI, Supabase, auth, payments, checkout,
and LK()/compatibility scoring were not touched.

## Pass 3 additions

- `package-engine/catalogLoader.ts` — `getNormalizedCatalog()`,
  `getNormalizedByBinKey()`, `getNormalizedById()`. Raw `tieredCatalog`
  export is untouched.
- `PRODUCT_STYLE_HINTS` (loader-local) tags only `bal-vanity-01..03`
  and `bal-sink-01..03` with subsets of `classic | modern | spa | minimal`.
  No new style tags were invented and no other styles were used.
- Registry public API: `getPackage(id)` and `listPackages({ status? })`
  added so UI/future code does not read `PACKAGE_MANIFEST` directly.

## Pass 4 additions (pre-gating hardening)

- **Promoted NormalizedProduct fields**: `finish`, `faucet_holes`,
  `mount_type`, `width_inches`, `isDefault`, `laborDelta`, `laborNote`
  are now first-class on `NormalizedProduct`. `description`, `spec`,
  `vendor`, `disclaimer`, `estimatedProjectPrice` remain on `.raw` only.
- **`emptyBins.ts`** — exports `EMPTY_BINS = ["toilet", "heatedFloor"]`
  + `isEmptyBin()`. No package may declare a required slot for one of
  these bins until products are sourced.
- **`flowStateMigration.ts`** — pure helpers `splitPackageIdField()` /
  `joinPackageIdField()` that classify a stored `packageId` into
  `{ packageId: PackageId | null, legacyTierRoute: Tier | null }`.
  **NOT yet wired into `FlowContext` / `serializer.ts`** — see below.
- **Spa mismatch resolved (documented, not patched)**: the substring
  `"spa"` appears in raw catalog exactly once, inside a marketing
  `description` field ("spa-like experience from above"). It is NOT in
  any `tag` / `style` field, so `spa: 0` in the per-style count is the
  correct, expected outcome. Test `package-engine-pass4` asserts this.
- **Invariant tests** — symmetric check that BinKeys with zero products
  exactly equal `EMPTY_BINS`; binKey is always within canonical 16 or
  null; promoted fields are present on every row.
- **`@ts-expect-error` comment** — clarified to explain it guards
  against widening `PackageId` to `string`.

### Per-style hint counts (current)

| Style    | Count |
|----------|-------|
| classic  | 3     |
| modern   | 3     |
| minimal  | 3     |
| spa      | 0 (no product-level spa tags exist; substring is description-only) |

### BinKey distribution (16 canonical bins)

Counts derive from `getNormalizedCatalog()` over the live raw catalog.
Bins listed in `EMPTY_BINS` are intentionally zero. The invariant test
fails if any other bin drops to zero, or if a listed empty bin gains
products without `EMPTY_BINS` being updated.

### RemodelFlowState split — NOT applied in-place

`RemodelFlowState.packageId` was **not** narrowed/split in
`src/remodel-flow/types.ts` this pass. Reason: doing so requires
coordinated edits to `FlowContext.tsx` (setPackageId), `Tier.tsx`
(which currently writes legacy alias `"balanced"` etc.),
`persistence/serializer.ts`, and `Packages.tsx`, and the user explicitly
forbade route/UI changes in this pass.

The migration is implemented as a pure helper
(`splitPackageIdField`) that the next (route-gating) pass will call on
read. Callers of `state.packageId` today (do not change yet):
  - `FlowContext.tsx` (setPackageId, stableStringify, autosave)
  - `render.ts` (sends `selected_package_id` to AI render)
  - `persistence/serializer.ts` (`selected_package_id` column)
  - `engine.ts` (resolver returns it)
  - `Packages.tsx` (writes pkg.id)


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
