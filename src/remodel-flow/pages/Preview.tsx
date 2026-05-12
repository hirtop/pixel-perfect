import { useEffect, useRef, useState } from "react";
import type { RenderMode } from "../render";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImagePlus, Copy, Check } from "lucide-react";
import { useFlow } from "../FlowContext";
import { CATEGORIES, PACKAGES, CATALOG_GROUPS, getPackageFor } from "../catalog";
import { resolvePlan, styleScore, styleMatchLabel } from "../resolver";
import { buildRenderRequest } from "../render";
import { saveDesign } from "../persistence/client";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
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
  const [generating, setGenerating] = useState(false);
  const [renderedB64, setRenderedB64] = useState<string | null>(null);

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
        toast(user ? "Saved locally — will sync when online" : "Sign in to save this project to your account.");
      }
    } catch {
      toast(user ? "Saved locally — will sync when online" : "Sign in to save this project to your account.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Step 05</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your package preview is not ready yet
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Choose a package tier first, then review your planning summary.
        </p>
        <button
          type="button"
          onClick={() => navigate("/options")}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          Choose a package →
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
          Your Bathroom Plan
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Concept preview based on your selections</p>
      </div>

      {/* Hero image — minimal frame */}
      <div className="overflow-hidden rounded-3xl bg-muted/40">
        <img
          src={heroBathroom}
          alt="Bathroom planning visual"
          width={1600}
          height={900}
          className="w-full h-auto block"
        />
        <p className="px-4 py-2 text-center text-[11px] text-muted-foreground">
          Planning visual — inspired by your selected package, not an exact rendering of your bathroom.
        </p>
      </div>

      {/* Summary block */}
      <div className="mt-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Estimated material range + labor anchor</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-foreground tabular-nums">
          {fmt(plan.total)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Planning estimate only — final pricing, scope, and labor require professional review.
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

      {/* ─────────────────── Package Overview ─────────────────── */}
      {(() => {
        const styleLabel = state.style ? state.style.charAt(0).toUpperCase() + state.style.slice(1) : "—";
        const tierLabel = state.tier ? state.tier.charAt(0).toUpperCase() + state.tier.slice(1) : "—";
        const stylePkg = state.tier ? getPackageFor(state.style, state.tier) : pkg;
        return (
          <section className="mt-14 mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
              Package Overview
            </p>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-3">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Style</span>
                <span className="text-foreground text-right font-medium">{styleLabel}</span>
                <span className="text-muted-foreground">Tier</span>
                <span className="text-foreground text-right font-medium">{tierLabel}</span>
                <span className="text-muted-foreground">Package</span>
                <span className="text-foreground text-right font-medium">{stylePkg?.name ?? pkg?.name ?? "—"}</span>
              </div>
              {stylePkg?.tagline && (
                <p className="pt-2 border-t border-border/50 text-sm text-muted-foreground leading-relaxed">
                  {stylePkg.tagline}
                </p>
              )}
              {state.style && (
                <p className="text-xs text-muted-foreground/90">
                  Cohesion match: <span className="text-foreground tabular-nums">{stylePct}%</span> — {headline.line.toLowerCase()}.
                </p>
              )}
            </div>
          </section>
        );
      })()}

      {/* ─────────────────── Estimated Materials ─────────────────── */}
      {(() => {
        const itemsTotal = plan.items.reduce((s, i) => s + (i.estPrice || 0), 0);
        return (
          <section className="mt-10 mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
              Estimated Materials
            </p>
            <div className="rounded-2xl border border-border/60 p-6 space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Material allowance (products)</span>
                <span className="text-foreground tabular-nums font-medium">{fmt(itemsTotal)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Labor anchor (planning estimate)</span>
                <span className="text-foreground tabular-nums font-medium">{fmt(plan.basePrice)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm pt-2 border-t border-border/50">
                <span className="text-foreground">Planning total</span>
                <span className="text-foreground tabular-nums font-semibold">{fmt(plan.total)}</span>
              </div>
              <p className="pt-2 text-xs text-muted-foreground leading-relaxed">
                This is a planning estimate, not a full installed remodel cost. Demo, site conditions,
                permits, plumbing/electrical changes, finish labor, and professional review will affect final pricing.
              </p>
            </div>
          </section>
        );
      })()}

      {/* ─────────────────── Selected Products ─────────────────── */}
      <section className="mt-10 mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
          Selected Products
        </p>
        <div className="space-y-6">
          {CATALOG_GROUPS.map((group) => {
            const groupItems = group.categoryIds
              .map((cid) => plan.items.find((i) => i.categoryId === cid))
              .filter((i): i is NonNullable<typeof i> => Boolean(i));
            if (!groupItems.length) return null;
            return (
              <div key={group.label}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 mb-2">
                  {group.label}
                </p>
                <ul className="rounded-2xl border border-border/60 divide-y divide-border/50">
                  {groupItems.map((it) => (
                    <li key={it.categoryId} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{it.optionName}</p>
                        <p className="text-xs text-muted-foreground">{it.categoryName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-foreground tabular-nums">{fmt(it.estPrice)}</p>
                        {it.source === "user-selection" && (
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Swapped</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Prices shown are planning allowances based on representative products. Confirm exact models, dimensions,
          and availability with your project professional before purchase.
        </p>
      </section>

      {/* ─────────────────── Selected Swaps ─────────────────── */}
      {(() => {
        const swaps = plan.items.filter((i) => i.source === "user-selection");
        if (!swaps.length) return null;
        return (
          <section className="mt-10 mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
              Your Swaps
            </p>
            <ul className="rounded-2xl border border-border/60 divide-y divide-border/50">
              {swaps.map((s) => (
                <li key={s.categoryId} className="px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{s.categoryName}: </span>
                  <span className="text-foreground">upgraded to {s.optionName}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {/* ─────────────────── Planning Notes / Professional Review ─────────────────── */}
      <section className="mt-10 mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center mb-5">
          Professional Review Checklist
        </p>
        <ul className="rounded-2xl border border-border/60 p-6 space-y-2 text-sm text-muted-foreground">
          {[
            "Confirm product dimensions against bathroom layout",
            "Confirm vanity width, plumbing rough-in, and clearances",
            "Confirm plumbing and electrical requirements",
            "Confirm tile quantities, pattern layout, and waste factor",
            "Confirm shower waterproofing system and substrate",
            "Confirm labor, demo, and installation pricing with a licensed pro",
            "Confirm product availability and lead times before purchase",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="text-foreground/60">□</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          BOBOX is a planning tool. A licensed remodeling professional should review this plan before any work begins.
        </p>
      </section>


      {/* Actions */}
      <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save design"}
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

      {/* Continuation link — subtle, only visible after a successful save */}
      {continuationLink && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleCopyLink}
            className="group inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={continuationLink}
            aria-label={`Copy continuation link: ${continuationLink}`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-70 group-hover:opacity-100" />}
            <span className="underline-offset-2 group-hover:underline">
              {copied ? "Link copied" : "Copy link to continue later"}
            </span>
          </button>
        </div>
      )}

      {/* Planning disclaimer */}
      <p className="mt-10 text-center text-xs text-muted-foreground/90 max-w-xl mx-auto leading-relaxed">
        BOBOX provides planning estimates and curated product concepts. Final pricing, fit, installation, code compliance, product availability, and labor costs require professional review.
      </p>

      {/* AI render request foundation — UI scaffold only */}
      <section className="mt-16 border-t border-border/60 pt-14">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            See a concept preview of your plan
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Generate a concept preview inspired by your selected package. This is a planning visual, not an exact construction rendering.
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
              disabled={generating}
              onClick={async () => {
                const req = buildRenderRequest({
                  state,
                  resolvedState: plan.engine?.resolved_state,
                  mode: renderMode,
                });
                setGenerating(true);
                setRenderedB64(null);
                try {
                  const { data, error } = await supabase.functions.invoke(
                    "generate-remodel-render",
                    { body: { render_request: req } },
                  );
                  if (error) throw error;
                  const b64 = (data as any)?.image?.b64_json;
                  if (!b64) throw new Error("No image returned");
                  setRenderedB64(b64);
                } catch (e) {
                  console.error("[render] failed", e);
                  toast.error("Unable to generate preview. Please try again.");
                } finally {
                  setGenerating(false);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-7 py-3 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ImagePlus className="h-4 w-4" />
              {generating ? "Generating…" : "Generate concept preview"}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Conceptual visualization — not an exact final result
          </p>

          {renderedB64 && (
            <>
              <div className="mt-8 overflow-hidden rounded-3xl bg-muted/40">
                <img
                  src={`data:image/png;base64,${renderedB64}`}
                  alt="AI-generated bathroom concept preview"
                  className="w-full h-auto block"
                />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                AI concept preview. Final materials, dimensions, colors, and installation may vary.
              </p>
            </>
          )}

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
