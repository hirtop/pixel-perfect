# Project Memory

## Core
BOBOX Remodel — bathroom remodel MVP. Premium minimal UI, dark-light themed.
Lovable Cloud (Supabase) enabled, US East region. Projects table with JSONB columns.
ProjectContext manages flow state; pages wire into it via useProject hook.
Do not redesign existing UI screens. Keep changes lightweight and MVP-oriented.

## Memories
- [Data model](mem://features/data-model) — Single projects table with JSONB columns for dimensions, style, package, customizations, workflow, agreement
- [Product data](mem://features/product-data) — Tiered catalog (36 products), TieredProduct type, tier-aware helpers, static items per tier, same-tier swapping
