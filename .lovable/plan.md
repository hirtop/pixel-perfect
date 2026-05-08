# BOBOX Package Engine — Implementation Plan

## 0. What already exists (anchor, do not rebuild)

- `src/remodel-flow/package-engine/` — engine, registry, normalizer, hydration, telemetry. **Solid base — extend, don't rewrite.**
- `src/remodel-flow/catalog.ts` + `packages/{modern-balanced, classic-balanced}.ts` — catalog with categories, options, **bins (budget/mid/high/luxury)**, swap_config with `backup_option_id`, package slot definitions.
- `src/data/tiered-catalog.ts` — 108-product tiered catalog (tiers `Budget | Balanced | Premium`).
- `src/data/products.ts` — `ProductCategory` enum + `TIER_BASE_LABOR`.
- DB: `catalog_products`, `project_saved_products`, RPCs `search_catalog_products`, `save_product_to_project`, `list_saved_project_products`. **Use as remote source-of-truth later.**

⚠️ **Naming inconsistency to resolve:** product wants tiers `Essential / Balanced / Premium`; codebase + DB use `Budget / Balanced / Premium`. Recommend keeping internal id `budget` and adding a display-name layer (`Essential`) to avoid a costly rename of data + saved projects.

---

## 1. Data model shape

```text
PackageTier         { id: 'budget'|'balanced'|'premium', displayName, basePrice, baseLabor }
Style               { id: 'modern'|'classic'|'spa', displayName, descriptors[] }
Package             { id, tierId, styleId, name, heroImage, description, slots: PackageSlot[] }
PackageSlot         { categoryId, primaryProductId, alternativeIds[], required: bool }
ProductCategory     { id, displayName, sortOrder, swap_config }
ProductBin          { id: 'value'|'mid'|'high'|'luxury', priceRange, qualityTier }
Product             { id, categoryId, name, brand, price, finish, styleTags[],
                      bin, image, productUrl, retailerSource, fallbackProductId,
                      availability: 'active'|'discontinued'|'unknown',
                      lastVerifiedAt }
SwapRelationship    { fromProductId, toProductId, priceDelta, styleMatchScore }
SavedSelection      { projectId, categoryId, productId, source: 'package'|'swap'|'manual' }
```

Key rules:
- **Every Product has `fallbackProductId`** → if image/link/availability fails, UI substitutes silently.
- **Every PackageSlot has `primaryProductId` + 2–5 `alternativeIds`** drawn from the same or adjacent bin.
- **Bins are price/quality bands**, decoupled from tier. A `balanced` package can mix `mid` + `high` bin items.

---

## 2. Local TS first, Supabase later → **Hybrid (recommended)**

**Phase 1 = local TS seed.** Reasons:
- Catalog scaffolding already lives in TS (`catalog.ts`, `packages/*.ts`).
- Avoids migration churn while shape is still settling.
- Gives instant dev velocity; no RLS/RPC overhead per iteration.
- Tests are pure unit tests.

**Phase 2 = mirror to Supabase.** Existing `catalog_products` table can host Products. Add new tables for `packages`, `package_slots`. Local seed file becomes the source for a one-time DB seed script. UI keeps reading from a single `getPackage()` adapter that can swap source.

---

## 3. Recommended Phase 1 (small + shippable)

**Phase 1: "Catalog & Package Definition Layer"** — read-only, no UI swaps yet.

Deliverables:
1. Type module `src/remodel-flow/package-engine/types.ts` (extend existing) with the 9 interfaces above.
2. Seed: 9 packages × ~10 categories, each slot with primary + 2–4 alternatives, reusing existing tiered-catalog products where possible.
3. `getPackage(tierId, styleId)` adapter — pure function, no fetches.
4. `resolveSlot(slot)` — returns primary, swaps in fallback if primary unavailable, returns alternatives sorted by styleMatchScore.
5. Unit tests covering: package loads, all 9 packages resolve, every slot has primary, every primary has fallback, no broken refs.
6. `<PackageDebugView>` page behind a dev-only route to visually inspect (no nav link, no public exposure).

**Out of Phase 1:** swap UI, summary integration, DB sync, AI rendering.

---

## 4. The 9 packages

| Tier (id / display) | Modern | Classic / Traditional | Spa |
|---|---|---|---|
| **budget / Essential** | Essential Modern | Essential Classic | Essential Spa |
| **balanced / Balanced** | Balanced Modern ✅ exists | Balanced Classic ✅ exists | Balanced Spa |
| **premium / Premium** | Premium Modern | Premium Classic | Premium Spa |

Two already exist (Modern Balanced, Classic Balanced) — fill in the remaining 7.

---

## 5. Required product categories

```text
1. vanity
2. faucet
3. mirror
4. lighting (sconce/vanity light)
5. toilet
6. tub or shower fixture (trim + valve as one slot, or split)
7. shower glass/door
8. floor tile
9. wall/shower tile
10. accessories/hardware (towel bar, hooks, TP holder)
```

10 categories balances completeness vs. tractability for 9 packages × ~10 slots = ~90 slot definitions.

---

## 6. Product bin rules

For each `(package, category)` slot:
- **primary**: 1 product from the bin matching the package tier (essential→value/mid, balanced→mid/high, premium→high/luxury).
- **alternatives**: 2–5 from same bin ± 1 adjacent bin, filtered by `styleTags` matching the package style.
- **styleTags**: `['modern','minimal','warm','spa','classic','traditional','transitional']`.
- **price band**: enforced by bin (`value: <$300`, `mid: $300–$1200`, `high: $1200–$3000`, `luxury: $3000+`) — adjustable per category.
- **retailerSource**: `'home_depot' | 'wayfair' | 'lowes' | 'build_com' | 'manual'` for future affiliate work.
- **image**: required; **fallback chain**: `image` → `category-default.jpg` → solid neutral placeholder.
- **productUrl**: optional; if missing, swap UI hides "View at retailer" link.
- **availability**: `'active' | 'discontinued' | 'unknown'`; `discontinued` triggers automatic fallback substitution.
- **lastVerifiedAt**: ISO date; > 90d stale → flag for re-check (Phase 2 cron).

---

## 7. Swap UX (Phase 2 spec, not Phase 1)

Card per slot shows:
- Included item (image, name, brand, price)
- Quiet "Swap" affordance → reveals 2–5 alternatives
- Each alt: image, name, **price delta** (`+$120` / `−$80`), **style match dot**, "Use this" button
- If primary unavailable → fallback substituted silently, small "alternative shown" hint
- Selecting a swap updates `SavedSelection` in ProjectContext, recalculates Budget Snapshot, reflects in /summary

No checkout, no affiliate redirect tracking, no real-time stock.

---

## 8. Out of scope for Phase 1

- Checkout / cart
- Affiliate click tracking / revenue attribution
- Live retailer APIs / inventory sync
- AI rendering of selections
- Contractor estimate logic changes
- Real-time price refresh
- Saving swaps to DB (still local context)
- Authenticated swap persistence
- Shopping assistant integration with new bins

---

## 9. Files likely touched (Phase 1)

**New:**
- `src/remodel-flow/package-engine/packageDefinitions.ts` — the 9 package seed
- `src/remodel-flow/package-engine/resolveSlot.ts`
- `src/remodel-flow/package-engine/fallbacks.ts`
- `src/remodel-flow/package-engine/__tests__/packageDefinitions.test.ts`
- `src/remodel-flow/package-engine/__tests__/resolveSlot.test.ts`
- `src/pages/__dev__/PackageDebugView.tsx` (dev-only, behind `import.meta.env.DEV`)

**Extended (additive only):**
- `src/remodel-flow/package-engine/types.ts` (add new interfaces; keep existing exports)
- `src/remodel-flow/catalog.ts` (extend categories list to 10)
- `src/remodel-flow/package-engine/registry.ts` (register the 9 packages)

**Untouched:** all confidence-layer files (Passes 11–15), all routes, all auth, all DB, ProjectContext shape, existing /summary.

---

## 10. Risks

| Domain | Risk | Mitigation |
|---|---|---|
| **Technical** | Naming drift `budget` vs `essential` causing saved-project regressions | Keep internal id `budget`; add `displayName: 'Essential'` layer; never rename DB enum |
| **Technical** | 90+ slots × 9 packages → seed file becomes unmaintainable | Composable per-style + per-tier modifiers; reuse products across packages |
| **UX** | Swap UI could feel like "BOBOX recommends this product" → liability | Stay in current copy guardrails; "Swap to alternative" not "BOBOX recommends" |
| **Legal/copy** | Product images/links from retailers without permission | Phase 1 uses only own/asset images + own descriptions; no retailer logos; no "approved by", "certified", "guaranteed" copy |
| **Data** | Broken images / dead links degrade UX | Mandatory `fallbackProductId` + `availability` flag with silent substitution |
| **Data** | Real prices drift from displayed prices | Footer disclaimer "Prices are estimates. Final pricing may vary." (already pattern in /summary) |

---

## 11. Phase 1 tests/smoke checklist

```text
□ All 9 packages load without throwing
□ Every PackageSlot resolves to a Product
□ Every primary Product has a valid fallback
□ Every alternative belongs to same or adjacent bin
□ No broken product id references across catalog
□ resolveSlot() returns fallback when primary marked discontinued
□ Image fallback chain returns a valid URL even if primary image missing
□ No new fetches added (component is pure)
□ Existing /summary, ProjectContext, ResumePlan tests still pass
□ Legal grep clean: no "approved", "certified", "guaranteed", "binding",
  "permit" (outside pre-existing contractor card), "ready to share",
  "BOBOX recommends", "make decisions", "everything you need", "complete"
□ No payment/checkout/affiliate code introduced
□ Build passes
```

---

## 12. Recommended next execution prompt (for Phase 1 only)

> **BOBOX Package Engine — Phase 1: Catalog & Package Definition Layer**
>
> Implement Phase 1 of the Package Engine plan. Read-only seed + resolver. No UI changes, no DB migrations, no route changes, no fetches.
>
> Scope:
> 1. Extend `src/remodel-flow/package-engine/types.ts` with: `PackageTier`, `Style`, `Package`, `PackageSlot`, `Product`, `ProductBin`, `SwapRelationship`. Keep all existing exports.
> 2. Create `src/remodel-flow/package-engine/packageDefinitions.ts` defining the 9 packages (Essential/Balanced/Premium × Modern/Classic/Spa). Internal tier ids stay `budget|balanced|premium`; expose `displayName: 'Essential'` for `budget`. Reuse existing `MODERN_BALANCED` and `CLASSIC_BALANCED` packages — adapt them to the new shape.
> 3. Create `src/remodel-flow/package-engine/resolveSlot.ts` exporting `resolveSlot(slot, opts)` that returns `{ product, isFallback, alternatives }`. Use `fallbackProductId` when primary is `discontinued` or missing.
> 4. Create `src/remodel-flow/package-engine/fallbacks.ts` exporting an image-fallback chain helper.
> 5. Add unit tests:
>    - `__tests__/packageDefinitions.test.ts` — all 9 load, every slot has primary + valid fallback, no dangling ids.
>    - `__tests__/resolveSlot.test.ts` — primary path, fallback path, alternatives ordering.
> 6. Add a dev-only inspector at `src/pages/__dev__/PackageDebugView.tsx` rendered only when `import.meta.env.DEV`. Do **not** add a route or nav link; it's reachable only by manual import during local dev.
>
> Do NOT touch:
> - migrations / Supabase schema / RLS / RPCs
> - auth / payments / checkout / LK scoring
> - routes / ProjectContext shape
> - confidence-layer files from Passes 11–15
> - /summary, /workflow, ResumePlan*, RecencyHint, PlanStatusBadge, SummaryIncludesCue
>
> Validate:
> - targeted package-engine tests
> - full test suite
> - build
> - legal-risk grep across new files for: approved, certified, guaranteed, binding, firm quote/bid/price, permit, licensed, BOBOX recommends, make decisions, everything you need, complete summary, construction-ready
>
> Report: files changed, test results, legal grep result, confirmation no forbidden areas touched, readiness for Phase 2 (swap UI).

---

**Do not implement yet — awaiting your go-ahead on this plan.**
