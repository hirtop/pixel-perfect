---
name: BOBOX risk language & golden rule
description: Builder-honest tone rules for all bathroom risk surfaces — scan copy, prompts, Snapshot, agreement appendix, next-step guidance
type: preference
---

# BOBOX risk language (builder-honest, not inspector)

## Golden rule
**The most expensive bathroom decisions are usually the ones that move water.**
Apply this principle to: top cost drivers, next-step guidance, builder notes, all future scan copy.
**BUT** — only invoke water-moving language when there is visible evidence. Never jump from "old bathroom" to "moving water" based on age cues alone. Dated finishes ≠ failing systems.

## Be literal, not inferential
Describe what's actually visible in the photo. An old-looking toilet, dated tile, or aged fixtures are NOT plumbing-movement evidence — they're "older wet-area finishes" or "dated fixture configuration." Prefer visual descriptions ("visible staining around the toilet base") over diagnostic claims ("plumbing movement"). When in doubt, return "unclear."

## Risk themes (the only ones we surface from photos)
- Layout / flow
- Ventilation
- Electrical (visible only)
- Waterproofing (wet areas)
- Plumbing movement / age (visible only)
- Tile & grout condition

## Approved phrasing
- "possible layout concern"
- "visible ventilation concern"
- "visible electrical safety concern"
- "wet-area waterproofing concern"
- "worth verifying before committing"
- "likely cost driver"
- "worth a closer look on-site"

## FORBIDDEN — never use, in UI copy or prompts
- "Layout Non-Compliant" / non-compliant / compliant
- "Code requires…" / code violation / code approval
- "Electrical Safety Hazard" (use "visible electrical safety concern" instead)
- "Go/No-Go" badges
- "Inspection," "inspector," "must," "required," "mandatory"
- Anything that sounds like formal inspection or code enforcement from photos

## Why
BOBOX is a builder-honest product, not an inspection tool. Photos are partial.
We surface red-flag heuristics that help homeowners ask the right questions —
we never adjudicate code or safety. Over-claiming destroys trust.

## How to apply
- Edge function `scan-bathroom-photos` system prompt: enforce these rules.
- `BathroomRiskScan` UI: status chips read "concern / ok / unclear" — never "fail/pass."
- Snapshot integration (Layer 3): treat photo signals as soft heuristics, never as hard drivers.
- Agreement PDF appendix: prefix with "Builder early warnings — not an inspection."
- Cost-driver UX: rank water-moving decisions (relocating drain, moving shower, adding fixtures) as top drivers.
