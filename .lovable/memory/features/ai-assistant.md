---
name: AI Shopping Assistant V1
description: Edge function with tool-calling loop, chat drawer UI, FAB on project pages, Lovable AI (gemini-3-flash-preview)
type: feature
---
- Edge function: `supabase/functions/ai-shopping-assistant/index.ts`
  - Non-streaming, tool-calling loop (max 5 iterations)
  - Model: google/gemini-3-flash-preview via Lovable AI Gateway
  - Authenticates user via JWT, fetches project context via get_project_context RPC
  - Tools: search_catalog_products, get_catalog_product, save_product_to_project, list_saved_project_products
  - Returns { message, products[] } — products array for client-side card rendering
  - Handles 429/402 rate limit errors
- UI components in `src/components/shopping-assistant/`:
  - `ShoppingAssistantFab.tsx` — floating "Ask BOBOX AI" button
  - `ShoppingAssistant.tsx` — Sheet drawer with chat interface
  - `ChatMessage.tsx` — renders markdown + product cards
  - `ProductCard.tsx` — product display with save-to-project button
- Hook: `src/hooks/useShoppingAssistant.ts` — manages chat state, sends to edge function
- FAB added to: CustomizeOption, Workflow, ProjectSummary, StyleBudget pages
- Bathroom V1 only: Vanity, Mirror, Faucet, Light categories
- Deferred: streaming, conversation persistence, admin UI, external retailers
