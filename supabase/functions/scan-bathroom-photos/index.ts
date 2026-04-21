// Edge function: on-demand bathroom photo risk scan via Lovable AI vision.
// Conservative builder-style "early warnings" — never inspection or code-approval language.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SignalKey =
  | "visible_water_damage"
  | "ventilation_concern"
  | "plumbing_age_or_condition"
  | "tile_or_grout_condition"
  | "layout_or_access_concern"
  | "electrical_visible_concern";

const SIGNAL_KEYS: SignalKey[] = [
  "visible_water_damage",
  "ventilation_concern",
  "plumbing_age_or_condition",
  "tile_or_grout_condition",
  "layout_or_access_concern",
  "electrical_visible_concern",
];

const SYSTEM_PROMPT = `You are BOBOX's bathroom photo reviewer. You surface BUILDER-HONEST RED-FLAG HEURISTICS from homeowner-supplied bathroom photos — things a builder would want to verify on-site before committing to a scope.

You are NOT an inspector. You do NOT determine code compliance, safety, or pass/fail. Photos are partial and often poorly lit.

CORE DISCIPLINE — BE LITERAL, NOT INFERENTIAL:
- Describe what you can LITERALLY SEE in the photo. Do not infer hidden conditions from age cues alone.
- An "old-looking bathroom" is NOT evidence of plumbing movement, hidden leaks, or water damage. Dated finishes ≠ failing systems.
- When in doubt, return "unclear" with low confidence. Under-claiming is always safer than over-claiming.
- Prefer visual descriptions ("visible staining around the toilet base," "grout looks discolored near the tub") over diagnostic claims.

GOLDEN RULE: The most expensive bathroom decisions are usually the ones that move water. When you can LITERALLY SEE evidence that water-moving work may be needed (visible drain relocation cues, failed wet-area finishes, fixture crowding that would force a layout change), say so plainly. Do NOT invoke this rule from age alone.

APPROVED PHRASING — use this style consistently:
- "possible layout concern" / "visible ventilation concern" / "visible electrical safety concern" / "wet-area waterproofing concern" / "tile & grout worth a closer look"
- "older wet-area finishes" / "dated fixture configuration" / "awkward existing layout"
- "worth verifying before committing" / "worth a closer look on-site"
- "likely cost driver" (only for water-moving work backed by visible evidence)

FORBIDDEN PHRASING — never use, in any field:
- "inspection," "inspector," "code requires," "non-compliant," "compliant," "code violation," "code approval"
- "hazard," "safety hazard," "must," "required," "mandatory," "fail," "pass," "go/no-go"
- "early warning" / "early warnings" — use "worth a closer look" or "worth verifying" instead
- "water damage" as a finding — use "wet-area waterproofing concern," "visible staining," or "possible moisture-related wear" instead
- "plumbing movement" UNLESS you can literally see corroded supply lines, visible leaks, or shifted/disconnected fittings. Old fixtures alone do NOT justify this label.

PER-SIGNAL DISCIPLINE:
- visible_water_damage (label: wet-area waterproofing): only flag if you can literally see staining, peeling paint, failed caulk, efflorescence, or visible discoloration in a wet area. Phrase visually: "visible staining/discoloration in the wet area is worth verifying on-site." Otherwise "unclear."
- ventilation_concern: only flag if you see no visible vent fan in a shower/tub area, or visible mildew suggesting poor ventilation.
- plumbing_age_or_condition (label: plumbing movement / age): VERY HIGH BAR. Only flag if you can clearly see corrosion on visible supply lines, active leaks, deteriorated fittings, or disconnected/shifted plumbing. An old-looking toilet, dated tile, or aged fixtures are NOT plumbing-movement evidence — return "unclear" or "ok" for those cases. If you only see "old fixtures," consider whether layout_or_access_concern (dated fixture configuration) is the better label.
- tile_or_grout_condition: only flag if grout is visibly cracked, missing, or stained, or tile is chipped/loose. "Older wet-area finishes" is appropriate here when finishes look dated.
- layout_or_access_concern: only flag if you can literally see tight clearances, awkward door swings, fixture crowding, or a dated fixture configuration. Frame as "possible layout concern" or "awkward existing configuration."
- electrical_visible_concern: only flag if you can see something specific (outlet near water with no visible GFCI, exposed wiring, scorched cover). Never assume. Frame as "visible electrical safety concern."

For each of the 6 signals, return:
- status: "concern" | "ok" | "unclear"
- confidence: "low" | "medium" | "high"
- note: 1 short homeowner-friendly sentence using approved phrasing (max ~140 chars). Be literal and visual. If status is "concern" and the issue involves moving water with visible evidence, end the note with "— likely cost driver."

Then a 1-2 sentence overall_summary that is LITERAL, not speculative. Lead with what's visibly worth verifying (e.g., "This bathroom shows a few visible items worth verifying before budgeting confidently: older wet-area finishes, a tight-looking layout, and possible moisture-related wear."). Do not jump from "old bathroom" to "moving water" unless visible evidence supports it. Never use forbidden phrasing.`;

const TOOL_SCHEMA = {
  type: "function" as const,
  function: {
    name: "report_bathroom_photo_scan",
    description: "Return a structured builder-style review of the bathroom photo.",
    parameters: {
      type: "object",
      properties: {
        signals: {
          type: "array",
          description: "One entry per signal key. Always include all 6 keys.",
          items: {
            type: "object",
            properties: {
              key: { type: "string", enum: SIGNAL_KEYS },
              status: { type: "string", enum: ["concern", "ok", "unclear"] },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
              note: { type: "string" },
            },
            required: ["key", "status", "confidence", "note"],
            additionalProperties: false,
          },
        },
        overall_summary: {
          type: "string",
          description: "1-2 sentence builder-facing summary. Plain language. No alarmism.",
        },
      },
      required: ["signals", "overall_summary"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "AI gateway not configured" }, 500);
    }

    // Verify caller
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const projectId = typeof body.project_id === "string" ? body.project_id : "";
    const photoId = typeof body.photo_id === "string" ? body.photo_id : "";
    const storagePath = typeof body.storage_path === "string" ? body.storage_path : "";

    if (!projectId || !photoId || !storagePath) {
      return jsonResponse({ error: "Missing project_id, photo_id, or storage_path" }, 400);
    }

    // Service-role client for ownership check + persistence
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: projectRow, error: projectErr } = await adminClient
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .maybeSingle();

    if (projectErr || !projectRow || projectRow.user_id !== userId) {
      return jsonResponse({ error: "Project not found or access denied" }, 403);
    }

    // Mark pending
    await adminClient.from("bathroom_photo_scans").upsert(
      {
        project_id: projectId,
        photo_id: photoId,
        storage_path: storagePath,
        status: "pending",
        error_message: null,
      },
      { onConflict: "project_id,photo_id" },
    );

    // Sign URL for the model
    const { data: signed, error: signErr } = await adminClient.storage
      .from("bathroom-photos")
      .createSignedUrl(storagePath, 600);

    if (signErr || !signed?.signedUrl) {
      await markFailed(adminClient, projectId, photoId, "Could not sign photo URL");
      return jsonResponse({ error: "Could not sign photo URL" }, 500);
    }

    // Fetch + base64 (Gemini handles remote URLs poorly through OpenAI-compat; inline is safest)
    const imgResp = await fetch(signed.signedUrl);
    if (!imgResp.ok) {
      await markFailed(adminClient, projectId, photoId, `Photo fetch failed: ${imgResp.status}`);
      return jsonResponse({ error: "Photo fetch failed" }, 500);
    }
    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await imgResp.arrayBuffer());
    const b64 = base64Encode(buf);
    const dataUrl = `data:${contentType};base64,${b64}`;

    // Call Lovable AI Gateway with vision + tool calling
    const model = "google/gemini-2.5-flash";
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Review this homeowner-supplied bathroom photo using BOBOX's builder-honest red-flag heuristics. Use the report_bathroom_photo_scan tool. Be LITERAL — describe what you can actually see. Do NOT infer plumbing movement, hidden leaks, or water damage from age cues alone. Prefer 'unclear' over weak guesses. Use only approved phrasing.",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "report_bathroom_photo_scan" } },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error", aiResp.status, errText);
      let userMessage = "AI scan failed";
      if (aiResp.status === 429) userMessage = "Rate limit reached. Please try again in a moment.";
      else if (aiResp.status === 402) userMessage = "AI credits exhausted. Add credits to continue.";
      await markFailed(adminClient, projectId, photoId, userMessage);
      return jsonResponse({ error: userMessage }, aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500);
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    if (!argsRaw) {
      await markFailed(adminClient, projectId, photoId, "Model returned no structured output");
      return jsonResponse({ error: "Model returned no structured output" }, 502);
    }

    let parsed: { signals: Array<{ key: string; status: string; confidence: string; note: string }>; overall_summary: string };
    try {
      parsed = JSON.parse(argsRaw);
    } catch (e) {
      console.error("Failed to parse tool args", argsRaw);
      await markFailed(adminClient, projectId, photoId, "Could not parse model output");
      return jsonResponse({ error: "Could not parse model output" }, 502);
    }

    // Normalize: ensure all 6 keys present, default to unclear/low if missing
    const signalsByKey = new Map(parsed.signals.map((s) => [s.key, s]));
    const normalized = SIGNAL_KEYS.map((key) => {
      const found = signalsByKey.get(key);
      return found ?? { key, status: "unclear", confidence: "low", note: "Not visible in this photo." };
    });

    const { data: saved, error: saveErr } = await adminClient
      .from("bathroom_photo_scans")
      .upsert(
        {
          project_id: projectId,
          photo_id: photoId,
          storage_path: storagePath,
          status: "completed",
          model,
          signals: normalized,
          overall_summary: parsed.overall_summary || "",
          raw_response: aiJson,
          error_message: null,
        },
        { onConflict: "project_id,photo_id" },
      )
      .select()
      .single();

    if (saveErr) {
      console.error("Save scan error", saveErr);
      return jsonResponse({ error: "Could not persist scan" }, 500);
    }

    return jsonResponse({ scan: saved }, 200);
  } catch (e) {
    console.error("scan-bathroom-photos error", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function markFailed(
  client: ReturnType<typeof createClient>,
  projectId: string,
  photoId: string,
  message: string,
) {
  await client
    .from("bathroom_photo_scans")
    .update({ status: "failed", error_message: message })
    .eq("project_id", projectId)
    .eq("photo_id", photoId);
}

// Standard library base64 — chunked to avoid call-stack overflow on large images
function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}
