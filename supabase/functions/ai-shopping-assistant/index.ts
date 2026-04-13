import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Tool definitions for the AI model ──────────────────────────────

const tools = [
  {
    type: "function",
    function: {
      name: "search_catalog_products",
      description:
        "Search the BOBOX internal bathroom product catalog. Use this to find vanities, mirrors, faucets, and lights matching user criteria. All filters are optional.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["Vanity", "Mirror", "Faucet", "Light"],
            description: "Product category to search",
          },
          min_price: { type: "number", description: "Minimum price in USD" },
          max_price: { type: "number", description: "Maximum price in USD" },
          finish: {
            type: "string",
            description:
              "Finish to match (partial match, e.g. 'black', 'nickel', 'gold', 'chrome')",
          },
          style_tag: {
            type: "string",
            description:
              "Style tag (e.g. 'modern', 'warm-modern', 'transitional', 'classic', 'minimalist', 'bold')",
          },
          min_width: {
            type: "number",
            description: "Minimum width in inches (especially useful for vanities)",
          },
          max_width: {
            type: "number",
            description: "Maximum width in inches",
          },
          compatibility_tag: {
            type: "string",
            description:
              "Compatibility filter (e.g. 'single-sink', 'double-sink', '36-inch-vanity', 'widespread-faucet')",
          },
          limit: {
            type: "number",
            description: "Max results to return (default 10, max 50)",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_catalog_product",
      description: "Get full details for a specific catalog product by its ID.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "UUID of the product to look up",
          },
        },
        required: ["product_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_product_to_project",
      description:
        "Save a catalog product to the user's remodel project. Use when the user explicitly asks to save or add a product.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "UUID of the product to save",
          },
          notes: {
            type: "string",
            description: "Optional note about why this was recommended or saved",
          },
        },
        required: ["product_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_saved_project_products",
      description:
        "List all products already saved to the user's remodel project. Use to check what's already selected before making new recommendations.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
];

// ─── System prompt ──────────────────────────────────────────────────

function buildSystemPrompt(projectContext: Record<string, unknown> | null): string {
  const base = `You are the BOBOX Remodel Shopping Assistant — a concise, practical bathroom product advisor.

RULES:
- You ONLY recommend products from the BOBOX internal catalog. Never invent products, prices, or specs.
- You serve Bathroom V1 categories only: Vanity, Mirror, Faucet, Light.
- Always use search_catalog_products to find products before recommending. Never guess what's available.
- When recommending products, present them clearly with: title, brand, price, finish, key dimensions, and a short reason why it fits.
- If the user asks to save a product, use save_product_to_project with source "ai_recommended".
- Before recommending, check list_saved_project_products to avoid suggesting duplicates.
- Keep answers short, practical, and decision-oriented. You're a remodel advisor, not a chatbot.
- Ask one short clarifying question if the request is ambiguous (e.g. missing category or size preference).
- When suggesting multiple options, highlight trade-offs: price, size, style, finish compatibility.
- Match finishes across categories when possible (e.g. if the user has a matte black vanity, suggest matte black mirrors/faucets/lights).
- Use vanity width to inform mirror and light sizing recommendations.
- Never recommend products outside the current catalog results.
- Format product recommendations with the product name bolded and price clearly shown.`;

  if (!projectContext) {
    return base + "\n\nNo project context loaded — the user may be browsing without a saved project.";
  }

  const ctx = projectContext;
  let contextBlock = "\n\nCURRENT PROJECT CONTEXT:";
  if (ctx.name) contextBlock += `\n- Project: ${ctx.name}`;
  if (ctx.bathroom_type) contextBlock += `\n- Bathroom type: ${ctx.bathroom_type}`;
  if (ctx.property_type) contextBlock += `\n- Property: ${ctx.property_type}`;

  const dims = ctx.dimensions as Record<string, string> | null;
  if (dims) {
    const parts: string[] = [];
    if (dims.width_ft) parts.push(`${dims.width_ft}'${dims.width_in ? ` ${dims.width_in}"` : ""} wide`);
    if (dims.length_ft) parts.push(`${dims.length_ft}'${dims.length_in ? ` ${dims.length_in}"` : ""} long`);
    if (parts.length) contextBlock += `\n- Dimensions: ${parts.join(" × ")}`;
  }

  const style = ctx.style_preferences as Record<string, string> | null;
  if (style) {
    if (style.style) contextBlock += `\n- Style: ${style.style}`;
    if (style.budget_level) contextBlock += `\n- Budget level: ${style.budget_level}`;
    if (style.finish) contextBlock += `\n- Preferred finish: ${style.finish}`;
  }

  const pkg = ctx.selected_package as Record<string, string> | null;
  if (pkg?.name) contextBlock += `\n- Selected package tier: ${pkg.name}`;

  const saved = ctx.saved_products;
  if (Array.isArray(saved) && saved.length > 0) {
    contextBlock += `\n- Already saved products:`;
    for (const p of saved) {
      contextBlock += `\n  • ${p.category}: ${p.title} (${p.brand}, $${p.price}, ${p.finish})`;
    }
  }

  return base + contextBlock;
}

// ─── Tool execution ─────────────────────────────────────────────────

async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  projectId: string | null
): Promise<string> {
  try {
    switch (toolName) {
      case "search_catalog_products": {
        const filters: Record<string, unknown> = { room_type: "bathroom", active_only: true };
        if (args.category) filters.category = args.category;
        if (args.min_price != null) filters.min_price = args.min_price;
        if (args.max_price != null) filters.max_price = args.max_price;
        if (args.finish) filters.finish = args.finish;
        if (args.style_tag) filters.style_tag = args.style_tag;
        if (args.min_width != null) filters.min_width = args.min_width;
        if (args.max_width != null) filters.max_width = args.max_width;
        if (args.compatibility_tag) filters.compatibility_tag = args.compatibility_tag;
        if (args.limit) filters.limit = args.limit;

        const { data, error } = await supabase.rpc("search_catalog_products", { filters });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "get_catalog_product": {
        const { data, error } = await supabase.rpc("get_catalog_product", {
          p_product_id: args.product_id,
        });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "save_product_to_project": {
        if (!projectId) return JSON.stringify({ error: "No project loaded" });
        const { data, error } = await supabase.rpc("save_product_to_project", {
          p_project_id: projectId,
          p_product_id: args.product_id,
          p_source: "ai_recommended",
          p_notes: (args.notes as string) || null,
        });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      case "list_saved_project_products": {
        if (!projectId) return JSON.stringify({ error: "No project loaded" });
        const { data, error } = await supabase.rpc("list_saved_project_products", {
          p_project_id: projectId,
        });
        if (error) return JSON.stringify({ error: error.message });
        return JSON.stringify(data);
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Tool execution failed" });
  }
}

// ─── Main handler ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create supabase client with user's auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, project_id } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch project context if project_id provided
    let projectContext: Record<string, unknown> | null = null;
    if (project_id) {
      const { data, error } = await supabase.rpc("get_project_context", {
        p_project_id: project_id,
      });
      if (!error && data) {
        projectContext = data as Record<string, unknown>;
      }
    }

    const systemPrompt = buildSystemPrompt(projectContext);

    // Build conversation for AI
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Tool-calling loop (max 5 iterations)
    let finalContent = "";
    let productRecommendations: unknown[] = [];

    for (let i = 0; i < 5; i++) {
      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: aiMessages,
            tools,
            tool_choice: "auto",
          }),
        }
      );

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        const text = await aiResponse.text();
        console.error("AI gateway error:", status, text);

        if (status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();
      const choice = aiData.choices?.[0];

      if (!choice) {
        return new Response(
          JSON.stringify({ error: "No AI response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const message = choice.message;

      // If the model wants to call tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Add assistant message with tool calls to conversation
        aiMessages.push(message);

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, unknown> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            toolArgs = {};
          }

          console.log(`Executing tool: ${toolName}`, toolArgs);
          const toolResult = await executeTool(toolName, toolArgs, supabase, project_id);

          // Track product search results for client-side rendering
          if (toolName === "search_catalog_products") {
            try {
              const parsed = JSON.parse(toolResult);
              if (Array.isArray(parsed)) {
                productRecommendations = [...productRecommendations, ...parsed];
              }
            } catch { /* ignore */ }
          }

          // Add tool result to conversation
          aiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }

        // Continue the loop to get the next AI response
        continue;
      }

      // No tool calls — this is the final response
      finalContent = message.content || "";
      break;
    }

    return new Response(
      JSON.stringify({
        message: finalContent,
        products: productRecommendations,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
