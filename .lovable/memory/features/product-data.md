---
name: Product data model
description: Tiered catalog (108 products), 12 customizable categories, TieredProduct type, tier-aware helpers, static items per tier, same-tier swapping
type: feature
---
- `src/data/tiered-catalog.ts` — 108-product catalog (12 categories × 3 tiers × 3 products each)
- `src/data/products.ts` — core types, formatPrice, getBathroomInsights, packagePricing, CATEGORY_GROUPS, re-exports from tiered-catalog
- `TieredProduct` interface: id, name, category, tier, vendor, price, description, finish, spec, image?, isDefault, laborDelta, laborNote?, tag?, disclaimer?
- `ProductTier` = "Budget" | "Balanced" | "Premium"
- 12 customizable categories: Vanity, Sink, Faucet, Mirror, Shower Wall Tile, Floor Tile, Shower Glass, Shower Valve, Shower Trim, Tub, Tub Valve, Shower Niche
- 2 static (non-swappable) items per tier: Lighting, Toilet — defined in STATIC_ITEMS
- CATEGORY_GROUPS for UI grouping: "Vanity & Sink", "Shower", "Tub", "Flooring"
- Tier base labor: Budget $4,500 / Balanced $6,500 / Premium $9,000
- Shipping estimate: $600 flat
- Helpers: getTierDefaults(), getTierAlternatives(), getStaticItemsTotal(), computeLaborTotal()
- Same-tier swapping only at MVP
- Prices are in USD dollars (not cents)
