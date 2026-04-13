# Project Memory

## Core
BOBOX Remodel — bathroom remodel MVP. Premium minimal UI, dark-light themed.
Lovable Cloud (Supabase) enabled, US East region. Projects table with JSONB columns.
ProjectContext manages flow state; pages wire into it via useProject hook.
Do not redesign existing UI screens. Keep changes lightweight and MVP-oriented.
After every fix, tell user: (1) preview-only or live, (2) whether publish needed, (3) exact live URL, (4) exact test cases.

## Memories
- [Data model](mem://features/data-model) — Projects table schema with JSONB columns for all remodel data
- [Product data](mem://features/product-data) — Tiered catalog types, tier helpers, zone-based tile system
- [Internal catalog](mem://features/catalog) — catalog_products + project_saved_products tables for AI shopping assistant V1
