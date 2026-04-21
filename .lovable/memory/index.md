# Project Memory

## Core
BOBOX Remodel — bathroom remodel MVP. Premium minimal UI, dark-light themed.
Lovable Cloud (Supabase) enabled, US East region. Projects table with JSONB columns.
ProjectContext manages flow state; pages wire into it via useProject hook.
Do not redesign existing UI screens. Keep changes lightweight and MVP-oriented.
After every fix, tell user: (1) preview-only or live, (2) whether publish needed, (3) exact live URL, (4) exact test cases.
Builder-honest tone — NEVER use "non-compliant," "code requires," "hazard," "Go/No-Go," "inspection." Use "possible/visible … concern," "worth verifying," "likely cost driver." See risk-language memory.
Golden rule: the most expensive bathroom decisions are usually the ones that move water — rank water-moving work as top cost driver everywhere.

## Memories
- [Data model](mem://features/data-model) — Projects table schema with JSONB columns for all remodel data
- [Product data](mem://features/product-data) — Tiered catalog types, tier helpers, zone-based tile system
- [Internal catalog](mem://features/catalog) — catalog_products + project_saved_products tables for AI shopping assistant V1
- [AI shopping assistant](mem://features/ai-assistant) — Edge function + UI for project-aware product recommendations from internal catalog
- [Risk language & golden rule](mem://features/risk-language) — Approved/forbidden phrasing for all bathroom risk surfaces; water-moving = top cost driver
