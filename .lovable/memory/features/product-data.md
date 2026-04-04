---
name: Product data model
description: Shared Product type, standard categories, and curated mock data in src/data/products.ts
type: feature
---
- `src/data/products.ts` — canonical product types and mock data
- `Product` interface: id, name, category, vendor, price, description, finish, image, link, disclaimer
- `ProductAlternative` extends Product with priceImpact
- 7 standard categories: Vanity, Tile, Faucet, Lighting, Mirror, Toilet, Shower / Tub Hardware
- `balancedProducts` and `balancedAlternatives` hold curated mock data
- PackageDetail and CustomizeOption now derive their data from this shared layer
- Prices are in USD dollars (not cents) — keep consistent when adding real products
