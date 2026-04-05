---
name: Product data model
description: Tiered catalog (36 products), TieredProduct type, tier-aware helpers, static items per tier, same-tier swapping
type: feature
---
- `src/data/tiered-catalog.ts` — 36-product catalog (4 categories × 3 tiers × 3 products each)
- `src/data/products.ts` — core types, formatPrice, getBathroomInsights, packagePricing, re-exports from tiered-catalog
- `TieredProduct` interface: id, name, category, tier, vendor, price, description, finish, spec, image?, isDefault, laborDelta, laborNote?, tag?, disclaimer?
- `ProductTier` = "Budget" | "Balanced" | "Premium"
- 4 customizable categories: Vanity, Tile, Faucet, Mirror
- 3 static (non-swappable) items per tier: Lighting, Toilet, Shower/Tub Hardware — defined in STATIC_ITEMS
- Tier base labor: Budget $3,500 / Balanced $5,500 / Premium $8,500
- Shipping estimate: $600 flat
- Helpers: getTierDefaults(), getTierAlternatives(), getStaticItemsTotal(), computeLaborTotal()
- Same-tier swapping only at MVP
- Tags: "Recommended" (defaults), "Budget Pick" (Budget only), "Value Pick" / "Upgrade" (Balanced/Premium), "Trending", "Designer Pick", "Modern Pick", "Classic Pick", "Most Storage"
- Budget/Balanced images exist in src/assets/products/; Budget and Premium products have no images yet (show placeholder)
- Prices are in USD dollars (not cents)
