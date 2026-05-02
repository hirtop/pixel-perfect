// Edge function: generate-remodel-render
// Concept-only AI image generation for the BOBOX remodel flow.
// v1: mode=template, render_intent=concept, single image, low/preview quality.
// The image is returned as base64 to the caller (no storage yet).

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface SlotIn {
  slotId?: string;
  categoryId?: string;
  categoryName?: string;
  optionId?: string;
  optionName?: string;
  optionDescription?: string;
}

interface RenderRequestIn {
  render_session_id?: string;
  mode?: string;
  render_intent?: string;
  variation_index?: number;
  selected_package_id?: string;
  selected_style?: string;
  selected_tier?: string;
  resolved_state?: { slots?: SlotIn[] };
  style_profile?: { style?: string; descriptors?: string[] };
  bathroom_size_template?: string;
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  modern:
    "modern aesthetic — clean rectilinear lines, warm contrast, minimal hardware, matte black or brushed nickel accents",
  classic:
    "classic aesthetic — timeless white subway or marble tile, polished chrome fixtures, refined trim and balanced symmetry",
  spa:
    "spa-inspired aesthetic — natural stone and warm wood textures, soft layered lighting, calm neutral palette",
  minimal:
    "minimal aesthetic — reduced palette, large-format tile, integrated fixtures, almost no visible hardware, generous negative space",
};

const TIER_QUALITY: Record<string, string> = {
  essential: "well-built mid-range finishes, tasteful and clean",
  balanced: "upgraded finishes with attention to material quality and proportion",
  premium: "premium materials, elevated craftsmanship, designer-level detailing",
};

// Build a rich, sentence-level description for a single product slot
// covering material, placement, and visual style — instead of a flat
// "Category: Option" line. Uses the option name as the anchor and
// derives placement/style hints from the category.
function describeSlot(category: string, option: string, optionDescription?: string): string {
  const cat = category.toLowerCase();
  const opt = option.trim();
  const desc = optionDescription?.trim();

  const placement = (() => {
    if (cat.includes("vanity")) return "wall-mounted along the main wall, anchoring the room";
    if (cat.includes("sink")) return "set into the vanity top, centered and proportionate";
    if (cat.includes("faucet")) return "mounted above the sink, aligned with the basin";
    if (cat.includes("mirror")) return "centered above the vanity at eye level";
    if (cat.includes("shower wall tile")) return "covering the shower walls from floor to ceiling";
    if (cat.includes("shower floor tile")) return "covering the shower pan with subtle slope to the drain";
    if (cat.includes("main floor tile") || cat === "floor tile") return "covering the bathroom floor wall-to-wall";
    if (cat.includes("accent tile")) return "as a focused accent feature within the shower or behind the vanity";
    if (cat.includes("shower glass")) return "as a frameless or minimally framed glass enclosure for the shower";
    if (cat.includes("shower valve") || cat.includes("shower trim")) return "mounted on the shower wall at standard height";
    if (cat.includes("tub valve")) return "mounted at the tub deck or wall, aligned with the tub";
    if (cat.includes("tub")) return "placed against the wall as the bathing focal point";
    if (cat.includes("niche")) return "recessed into the shower wall at shoulder height";
    if (cat.includes("light") || cat.includes("sconce")) return "wall-mounted on both sides of the mirror, casting warm even light";
    if (cat.includes("toilet")) return "placed discreetly to the side, not as a focal point";
    return "placed naturally in the scene, appropriate to its function";
  })();

  const style = (() => {
    if (cat.includes("vanity")) return "with clean horizontal grain or refined cabinetry detailing";
    if (cat.includes("faucet") || cat.includes("valve") || cat.includes("trim"))
      return "with a minimalist silhouette and consistent metal finish";
    if (cat.includes("tile")) return "with realistic grout lines and subtle surface texture";
    if (cat.includes("mirror")) return "with a clean edge profile that complements the vanity";
    if (cat.includes("glass")) return "with crisp, transparent glass and slim hardware";
    if (cat.includes("tub")) return "with a balanced silhouette and smooth surface";
    if (cat.includes("light") || cat.includes("sconce")) return "with a warm color temperature and refined fixture body";
    return "with materials and finish that read clearly in the image";
  })();

  // Compose: "<Option> — <placement>, <style>." + optional description tail.
  const tail = desc ? ` ${desc}` : "";
  return `${opt} — ${placement}, ${style}.${tail}`;
}

function composePrompt(req: RenderRequestIn): string {
  // Layer 1 — base room
  const baseLayer =
    "Photorealistic interior render of a residential bathroom, eye-level wide-angle composition, neutral daylight from a window, no people, no text, no watermarks, no logos.";

  // Layer 2 — style
  const styleKey = (req.selected_style ?? "modern").toLowerCase();
  const styleLayer = `Design style: ${STYLE_DESCRIPTIONS[styleKey] ?? STYLE_DESCRIPTIONS.modern}.`;

  // Layer 2b — tier (quality bias)
  const tierKey = (req.selected_tier ?? "balanced").toLowerCase();
  const tierLayer = `Quality tier: ${TIER_QUALITY[tierKey] ?? TIER_QUALITY.balanced}.`;

  // Layer 3 — selected product slots (richly described: material, placement, visual style)
  const slots = req.resolved_state?.slots ?? [];
  const slotLines = slots
    .map((s) => {
      const cat = (s.categoryName ?? s.categoryId ?? "item").toString();
      const opt = (s.optionName ?? s.optionId ?? "selection").toString();
      return describeSlot(cat, opt, s.optionDescription);
    })
    .filter(Boolean);
  const slotLayer = slotLines.length
    ? `Featured selections (each item must be clearly visible, with the described material, placement, and visual style):\n${slotLines.map((l) => `- ${l}`).join("\n")}`
    : "Featured selections: a coherent set of fixtures and finishes consistent with the chosen style, each clearly visible in the scene.";

  // Optional descriptors from style_profile
  const descriptors = (req.style_profile?.descriptors ?? []).filter(Boolean);
  const descriptorLayer = descriptors.length
    ? `Material/finish keywords: ${descriptors.slice(0, 12).join(", ")}.`
    : "";

  // Layer 3b — composition + realism + camera
  const compositionLayer =
    "All selected elements must be clearly visible and realistically placed in the scene.";
  const realismLayer =
    "Maintain accurate scale, spacing, and proportions. Do not exaggerate room size.";
  const cameraLayer =
    "Eye-level camera angle, centered composition, professional interior photography.";

  // Layer 3c — product identity reinforcement
  const emphasisLayer =
    "Each selected product must be clearly distinguishable and visually dominant in the scene.";
  const materialLayer =
    "For each item, emphasize its material, finish, and texture so it is clearly recognizable.";
  const uniquenessLayer =
    "Do not replace or generalize selected items — render them as distinct design elements.";
  const contrastLayer =
    "Ensure sufficient contrast between materials so different elements do not blend together.";

  // Layer 3d — material specificity and focus control
  const tileLayer =
    "Any tile work should read as handmade zellige tile with subtle irregular edges, varied glaze, and visible texture.";
  const fixtureFinishLayer =
    "Metal fixtures should have a brushed nickel finish with a soft satin sheen — not chrome or polished.";
  const deemphasisLayer =
    "Toilet should be present but not a focal point.";
  const focusLayer =
    "Primary focus should be the vanity and wall composition.";

  // Layer 3e — real-world imperfections and photographic realism
  const tileRealismLayer =
    "Handmade zellige tile with slight variation in color, uneven glaze, subtle imperfections, and visible grout irregularity.";
  const nickelRealismLayer =
    "Brushed nickel with soft satin finish, low reflectivity, visible subtle grain, not mirror-like.";
  const imperfectionLayer =
    "Introduce subtle real-world imperfections: slight material variation, minor asymmetry, natural lighting falloff, non-uniform surfaces.";
  const photoRealismLayer =
    "Soft natural light with realistic shadows, slight lens imperfection, depth of field, and non-perfect symmetry.";

  // Layer 4 — constraints / disclaimer
  const constraintLayer =
    "Constraints: realistic proportions, plausible plumbing layout, no surreal elements, no brand logos, no on-image text, no people. This is a CONCEPTUAL visualization for inspiration only — not an exact representation of final products, finishes, dimensions, or installation.";

  return [
    baseLayer,
    styleLayer,
    tierLayer,
    slotLayer,
    descriptorLayer,
    compositionLayer,
    realismLayer,
    cameraLayer,
    emphasisLayer,
    materialLayer,
    uniquenessLayer,
    contrastLayer,
    tileLayer,
    fixtureFinishLayer,
    deemphasisLayer,
    focusLayer,
    tileRealismLayer,
    nickelRealismLayer,
    imperfectionLayer,
    photoRealismLayer,
    constraintLayer,
  ]
    .filter(Boolean)
    .join("\n\n");
}

interface ValidationError {
  field: string;
  message: string;
}

function validateRequest(req: RenderRequestIn): ValidationError[] {
  const errs: ValidationError[] = [];
  if (req.mode !== "template") {
    errs.push({ field: "mode", message: "v1 only supports mode='template'" });
  }
  if (req.render_intent !== "concept") {
    errs.push({ field: "render_intent", message: "v1 only supports render_intent='concept'" });
  }
  if (!req.selected_style) {
    errs.push({ field: "selected_style", message: "selected_style is required" });
  }
  if (!req.selected_tier) {
    errs.push({ field: "selected_tier", message: "selected_tier is required" });
  }
  if (!req.selected_package_id) {
    errs.push({ field: "selected_package_id", message: "selected_package_id is required" });
  }
  if (!req.resolved_state?.slots || !Array.isArray(req.resolved_state.slots) || req.resolved_state.slots.length === 0) {
    errs.push({ field: "resolved_state.slots", message: "resolved_state.slots must be a non-empty array" });
  }
  return errs;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: { render_request?: RenderRequestIn } | null = null;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const renderRequest = body?.render_request;
  if (!renderRequest || typeof renderRequest !== "object") {
    return jsonResponse({ error: "missing_render_request" }, 400);
  }

  const errs = validateRequest(renderRequest);
  if (errs.length > 0) {
    return jsonResponse({ error: "validation_failed", details: errs }, 400);
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    console.error("[generate-remodel-render] OPENAI_API_KEY missing in env");
    return jsonResponse({ error: "server_misconfigured" }, 500);
  }

  const prompt = composePrompt(renderRequest);
  console.log(
    "[generate-remodel-render] generating",
    JSON.stringify({
      session: renderRequest.render_session_id,
      style: renderRequest.selected_style,
      tier: renderRequest.selected_tier,
      package: renderRequest.selected_package_id,
      slots: renderRequest.resolved_state?.slots?.length ?? 0,
      promptChars: prompt.length,
    }),
  );

  try {
    const oaiResp = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "low", // v1 preview quality
      }),
    });

    if (!oaiResp.ok) {
      const text = await oaiResp.text();
      console.error("[generate-remodel-render] OpenAI error", oaiResp.status, text);
      if (oaiResp.status === 401) {
        return jsonResponse({ error: "openai_unauthorized" }, 502);
      }
      if (oaiResp.status === 429) {
        return jsonResponse({ error: "openai_rate_limited" }, 429);
      }
      if (oaiResp.status === 400) {
        return jsonResponse({ error: "openai_bad_request", details: text.slice(0, 500) }, 502);
      }
      return jsonResponse({ error: "openai_failed", status: oaiResp.status }, 502);
    }

    const data = await oaiResp.json();
    const b64 = data?.data?.[0]?.b64_json as string | undefined;
    const url = data?.data?.[0]?.url as string | undefined;

    if (!b64 && !url) {
      console.error("[generate-remodel-render] no image in OpenAI response", JSON.stringify(data).slice(0, 500));
      return jsonResponse({ error: "no_image_returned" }, 502);
    }

    return jsonResponse({
      ok: true,
      render_session_id: renderRequest.render_session_id,
      mode: renderRequest.mode,
      render_intent: renderRequest.render_intent,
      variation_index: renderRequest.variation_index ?? 0,
      image: b64
        ? { format: "base64", mime: "image/png", b64_json: b64 }
        : { format: "url", url },
      prompt_preview: prompt.slice(0, 400),
    });
  } catch (err) {
    console.error("[generate-remodel-render] unexpected error", err);
    return jsonResponse({ error: "unexpected_error" }, 500);
  }
});
