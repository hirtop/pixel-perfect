# Package Engine — Outstanding Work

This file tracks what is intentionally NOT yet wired up. The goal of the
foundation pass was to introduce canonical types, normalization helpers,
and a package manifest WITHOUT redesigning the UI or breaking the
existing Balanced flow.

## Status snapshot

| Package id          | Status      | Notes                                          |
|---------------------|-------------|------------------------------------------------|
| `essential` (tier)  | legacy      | Powers `/package/essential`, `/customize/essential` |
| `balanced` (tier)   | legacy      | Powers `/package/balanced`, `/customize/balanced`   |
| `premium` (tier)    | legacy      | Powers `/package/premium`, `/customize/premium`     |
| `modern-balanced`   | curated     | Real sourced bins, used by curated renderer.   |
| `classic-balanced`  | placeholder | Spec only, all 11 bins are `placeholder`.      |

All other style-tier combinations (e.g. `spa-premium`, `coastal-balanced`)
are NOT registered yet.

## Foundation in place

- Canonical `Tier`, `CanonicalStyleId`, `PackageId`, `BinKey` types
  (`./types.ts`).
- Normalization helpers (`./normalize.ts`):
  - `normalizeTier` — handles `Balanced → balanced`, `budget → essential`.
  - `normalizeStyle` — narrows arbitrary strings to canonical styles.
  - `makePackageId`, `parsePackageId`.
  - `normalizeBinKey` — maps display category names (e.g.
    `"Shower Wall Tile"`) to canonical bin slugs.
- Package manifest (`./registry.ts`) with lifecycle status:
  `curated | partial | placeholder | legacy`.

## Not done yet (intentionally)

1. **Routing migration** — `/package/:id` and `/customize/:id` still
   accept tier-only ids (`balanced` etc). Future work: also accept
   `classic-balanced`-style ids and route them to a curated renderer.
2. **Resume-route helper** — `src/lib/resumeRoute.ts` only knows about
   tier slugs. Update once style-tier package routes ship.
3. **Persistence** — `RemodelFlowState.packageId` is a free-form string.
   Tighten to `PackageId | Tier` once the UI consistently writes
   canonical ids.
4. **Customize renderer for partial packages** — `classic-balanced`
   must NOT render in the finished UI until every bin has real product
   data (no invented SKUs). Gate via `isCurated(packageId)`.
5. **Catalog unification** — `src/remodel-flow/catalog.ts` still drives
   defaults via tier-only `STYLE_DEFAULTS`. Long-term we want manifest
   entries to own their own bin data and the catalog to derive from
   them, not the other way round.
6. **Style coverage** — only 4 of the 9 canonical styles
   (`modern`, `classic`, `spa`, `minimal`) appear in the legacy
   `StyleId` union. The other 5 (`coastal`, `farmhouse`,
   `transitional`, `contemporary`, `traditional`) are recognised by
   `normalizeStyle` but have no package data yet.
7. **Tests** — add unit tests for `normalizeTier`, `normalizeStyle`,
   `parsePackageId`, and manifest lookup invariants.

## Hard rules

- Do not invent SKUs to promote a package out of `placeholder`.
- Do not expose `partial` or `placeholder` packages as finished UI.
- Do not change LK() scoring or compatibility scoring as part of
  package-engine work.
- Preserve `/package/balanced` and `/customize/balanced` until the new
  routing lands.
