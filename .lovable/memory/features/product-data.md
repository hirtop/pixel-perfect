---
name: Product data model
description: Shared Product type, standard categories, curated mock data with images, bathroom insights engine, and package fit reasons in src/data/products.ts
type: feature
---
- `src/data/products.ts` — canonical product types, mock data, and inference helpers
- `Product` interface: id, name, category, vendor, price, description, finish, image, link, disclaimer, tag, spec
- `ProductAlternative` extends Product with priceImpact and laborNote
- 7 standard categories: Vanity, Tile, Faucet, Lighting, Mirror, Toilet, Shower / Tub Hardware
- Customize screen focuses on 4 categories: Vanity, Faucet, Tile, Mirror
- Product images in src/assets/products/ — generated for balanced defaults + all alternatives
- `getBathroomInsights()` — generates believable analysis from project data (layout, size, style, budget, photos)
- `packageFitReasons` — per-package personalized microcopy
- `BathroomInsights` component in src/components/BathroomInsights.tsx — full and compact variants
- Vendors use real-sounding brand names (Delta, Kohler, West Elm, Ann Sacks, etc.)
- Prices are in USD dollars (not cents)
