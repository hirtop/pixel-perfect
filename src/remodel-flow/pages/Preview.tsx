import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFlow } from "../FlowContext";
import { CATEGORIES, PACKAGES } from "../catalog";
import { resolvePlan, styleScore, styleMatchLabel } from "../resolver";
import { cn } from "@/lib/utils";
import heroBathroom from "../assets/hero-bathroom.jpg";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const styleHeadline = (
  pct: number,
): { line: string; tone: "good" | "balanced" | "mixed" } => {
  if (pct >= 85) return { line: "Strong design match", tone: "good" };
  if (pct >= 70) return { line: "Balanced design", tone: "balanced" };
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
  const { state } = useFlow();
  const plan = resolvePlan(state);
  const pkg = state.tier ? PACKAGES[state.tier] : undefined;

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

  const handleSave = () => {
    toast.success("Design saved", { description: "Your plan is stored on this device." });
  };

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
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Estimated total</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-foreground tabular-nums">
          {fmt(plan.total)}
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
    </div>
  );
};

export default Preview;
