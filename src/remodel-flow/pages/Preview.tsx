import { useEffect, useRef, useState } from "react";
import type { RenderMode } from "../render";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImagePlus, Copy, Check } from "lucide-react";
import { useFlow } from "../FlowContext";
import { CATEGORIES, PACKAGES } from "../catalog";
import { resolvePlan, styleScore, styleMatchLabel } from "../resolver";
import { buildRenderRequest } from "../render";
import { saveDesign } from "../persistence/client";
import { cn } from "@/lib/utils";
import heroBathroom from "../assets/hero-bathroom.jpg";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const styleHeadline = (
  pct: number,
): { line: string; tone: "good" | "balanced" | "mixed" } => {
  if (pct >= 85) return { line: "Strong, cohesive design", tone: "good" };
  if (pct >= 70) return { line: "Balanced, flexible design", tone: "balanced" };
  return { line: "Mixed design choices", tone: "mixed" };
};

const NARRATIVES: Record<string, string> = {
  modern: "A clean, modern space with warm contrast and minimal lines.",
  classic: "A timeless palette of bright tile and polished detail, balanced and refined.",
  spa: "A calm, spa-inspired retreat with soft textures and natural warmth.",
  minimal: "A quiet, minimal space — reduced to its most essential forms.",
};

const Preview = () => {
  const navigate = useNavigate();
  const { state, designId: ctxDesignId } = useFlow();
  const plan = resolvePlan(state);
  const pkg = state.tier ? PACKAGES[state.tier] : undefined;
  const ready = Boolean(state.tier && pkg);
  // Global style match (same logic as Customize page).
  const chosenScores = pkg
    ? CATEGORIES.map((cat) => {
        const id = state.selections[cat.id] ?? pkg.defaults[cat.id];
        const opt = cat.options.find((o) => o.id === id) ?? cat.dynamic_pool?.find((o) => o.id === id);
        return opt ? styleScore(state.style, cat.id, opt) : null;
      }).filter((v): v is number => v !== null)
    : [];
  const score01 = chosenScores.length ? chosenScores.reduce((a, b) => a + b, 0) / chosenScores.length : 0;
  const stylePct = Math.round(score01 * 100);
  const headline = styleHeadline(stylePct);
  const narrative = state.style ? NARRATIVES[state.style] : "A considered plan, ready to refine.";

  // Highlights: most cohesive 3–5 picks, deduped per category.
  const highlights = plan.items
    .map((it) => {
      const cat = CATEGORIES.find((c) => c.id === it.categoryId);
      const opt = cat?.options.find((o) => o.id === it.optionId) ?? cat?.dynamic_pool?.find((o) => o.id === it.optionId);
      const s = opt ? styleScore(state.style, it.categoryId, opt) : 0;
      return { categoryName: it.categoryName, optionName: it.optionName, score: s };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const [savedAt, setSavedAt] = useState(0);
  const hideTimer = useRef<number | null>(null);
  const [renderMode, setRenderMode] = useState<RenderMode>("template");
  const [savedDesignId, setSavedDesignId] = useState<string | undefined>(ctxDesignId);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ctxDesignId && ctxDesignId !== savedDesignId) setSavedDesignId(ctxDesignId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxDesignId]);

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);

  const continuationLink = savedDesignId
    ? `${window.location.origin}/remodel-flow?design=${savedDesignId}`
    : null;

  const handleCopyLink = async () => {
    if (!continuationLink) return;
    try {
      await navigator.clipboard.writeText(continuationLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await saveDesign(state, {
        designId: savedDesignId ?? ctxDesignId,
        name: pkg ? `${pkg.name} design` : "My design",
        markSaved: true,
      });
      if (result.ok) {
        if (result.designId) setSavedDesignId(result.designId);
        toast.success("Design saved", {
          description: "Your plan is backed up to your account.",
        });
        setSavedAt(Date.now());
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setSavedAt(0), 2000);
      } else {
        toast("Saved locally — will sync when online");
      }
    } catch {
      toast("Saved locally — will sync when online");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Step 05</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your design isn’t ready yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick a style and tier first to see your bathroom design.
        </p>
        <button
          type="button"
          onClick={() => navigate(state.style ? "/remodel-flow/tier" : "/remodel-flow/style")}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          {state.style ? "Choose a tier" : "Pick a style"} →
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Step 05</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          Your Bathroom Design
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Based on your selections</p>
      </div>

      {/* Hero image — minimal frame */}
      <div className="overflow-hidden rounded-3xl bg-muted/40">
        <img
          src={heroBathroom}
          alt="Your bathroom design preview"
          width={1600}
          height={900}
          className="w-full h-auto block"
        />
      </div>

      {/* Summary block */}
      <div className="mt-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-foreground tabular-nums">
          {fmt(plan.total)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Estimated total based on your selections
        </p>

        {state.style && (
          <div className="mt-5 inline-flex items-center gap-2 text-sm">
            <span className="tabular-nums text-foreground font-medium">{stylePct}%</span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                headline.tone === "good" && "border-foreground/30 bg-foreground/5 text-foreground",
                headline.tone === "balanced" && "border-border bg-muted/40 text-muted-foreground",
                headline.tone === "mixed" && "border-destructive/30 bg-destructive/5 text-destructive",
              )}
            >
              {headline.line}
            </span>
          </div>
        )}

        <p className="mt-6 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {narrative}
        </p>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mt-12 mx-auto max-w-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
            Highlights
          </p>
          <ul className="space-y-2.5">
            {highlights.map((h) => (
              <li
                key={h.categoryName}
                className="flex items-baseline justify-between gap-4 text-sm border-b border-border/50 pb-2.5 last:border-b-0"
              >
                <span className="text-muted-foreground">{h.categoryName}</span>
                <span className="text-foreground font-medium text-right">{h.optionName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors min-w-[180px]"
        >
          Save design
        </button>
        <button
          type="button"
          onClick={() => navigate("/remodel-flow/customize")}
          className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm text-foreground hover:bg-muted transition-colors min-w-[180px]"
        >
          Continue editing
        </button>
      </div>
      {/* Reserved confirmation row — fixed height prevents layout jump */}
      <div className="mt-3 h-5 text-center" aria-live="polite">
        <span
          className={cn(
            "text-xs text-muted-foreground transition-opacity duration-200",
            savedAt ? "opacity-100" : "opacity-0",
          )}
        >
          Design saved successfully
        </span>
      </div>

      {/* AI render request foundation — UI scaffold only */}
      <section className="mt-20 border-t border-border/60 pt-14">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Want to see this in your bathroom?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Upload a photo to generate a personalized concept preview based on your selections.
          </p>

          {/* Render mode selector — UI only */}
          <div className="mt-6 flex justify-center">
            <div
              role="radiogroup"
              aria-label="Render mode"
              className="inline-flex rounded-full border border-border bg-background p-1 text-xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={renderMode === "template"}
                onClick={() => setRenderMode("template")}
                className={cn(
                  "rounded-full px-4 py-1.5 transition-colors",
                  renderMode === "template"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Concept preview
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={false}
                aria-disabled="true"
                disabled
                className="rounded-full px-4 py-1.5 text-muted-foreground/60 cursor-not-allowed inline-flex items-center gap-1.5"
              >
                Photo-based preview
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  Coming soon
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const req = buildRenderRequest({
                  state,
                  resolvedState: plan.engine?.resolved_state,
                  mode: renderMode,
                });
                // Foundation only — no AI call yet.
                console.groupCollapsed("[render] request prepared");
                console.log(JSON.stringify(req, null, 2));
                console.groupEnd();
                toast("Personalized preview is coming soon", {
                  description: "We're preparing the AI rendering experience.",
                });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <ImagePlus className="h-4 w-4" />
              Generate concept preview
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Conceptual visualization — not an exact final result
          </p>

          {/* Render preview summary — what will be rendered */}
          {(() => {
            const slots = plan.engine?.resolved_state?.slots ?? [];
            const productNames = Array.from(
              new Set(
                slots
                  .map((s) => s.optionName)
                  .filter((v): v is string => Boolean(v)),
              ),
            ).slice(0, 5);
            const styleLabel = state.style
              ? state.style.charAt(0).toUpperCase() + state.style.slice(1)
              : "—";
            return (
              <div className="mt-8 text-xs text-muted-foreground space-y-1.5">
                <div>
                  <span className="opacity-70">Style: </span>
                  <span className="text-foreground">{styleLabel}</span>
                </div>
                <div>
                  <span className="opacity-70">Package: </span>
                  <span className="text-foreground">{pkg?.name ?? "—"}</span>
                </div>
                {productNames.length > 0 && (
                  <div>
                    <span className="opacity-70">Includes: </span>
                    <span className="text-foreground">{productNames.join(" · ")}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
};

export default Preview;
