---
name: Product data model
description: Tiered catalog (14 customizable + 2 static categories), TieredProduct type, tier-aware helpers, zone-based tile system
type: feature
---
- `src/data/tiered-catalog.ts` — full product catalog (15 categories × 3 tiers × 3 products each + static items)
- `src/data/products.ts` — core types, formatPrice, getBathroomInsights, packagePricing, CATEGORY_GROUPS, re-exports from tiered-catalog
- `TieredProduct` interface: id, name, category, tier, vendor, price, description, finish, spec, image?, isDefault, laborDelta, laborNote?, tag?, disclaimer?
- `ProductTier` = "Budget" | "Balanced" | "Premium"
- 15 customizable categories: Vanity, Sink, Faucet, Mirror, Shower Wall Tile, Shower Floor Tile, Main Floor Tile, Accent Tile, Shower Glass, Shower Valve, Shower Trim, Tub, Tub Valve, Shower Niche
- Accent Tile defaults to "No Accent Tile" ($0) — optional category
- 2 static (non-swappable) items per tier: Lighting, Toilet — defined in STATIC_ITEMS
- CATEGORY_GROUPS for UI grouping: "Vanity & Sink", "Shower" (includes Shower Floor Tile), "Tub", "Flooring & Accent"
- Tier base labor: Budget $4,500 / Balanced $6,500 / Premium $9,000
- Shipping estimate: $600 flat
- Helpers: getTierDefaults(), getTierAlternatives(), getStaticItemsTotal(), computeLaborTotal()
- Same-tier swapping only at MVP
- Prices are in USD dollars (not cents)
