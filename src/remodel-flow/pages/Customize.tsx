import { useEffect, useRef, useState } from "react";
import { useFlow } from "../FlowContext";
import { CATEGORIES, PACKAGES, TIER_BINS, getOption } from "../catalog";
import { rank_candidates, resolvePlan, styleScore, styleMatchLabel } from "../resolver";
import { FlowCard, PrimaryNav, StepHeader } from "../ui";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Star } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const badgeClasses = (label: "Best match" | "Good match" | "Mismatch") =>
  cn(
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide",
    label === "Best match" && "border-foreground/30 bg-foreground/5 text-foreground",
    label === "Good match" && "border-border bg-muted/40 text-muted-foreground",
    label === "Mismatch" && "border-destructive/30 bg-destructive/5 text-destructive",
  );

/**
 * Tracks previous value and produces a direction signal that auto-clears.
 * direction: "up" | "down" | null
 */
function useChangeDirection(value: number, ms = 1200) {
  const prev = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (value === prev.current) return;
    setDirection(value > prev.current ? "up" : "down");
    setPulseKey((k) => k + 1);
    prev.current = value;
    const t = window.setTimeout(() => setDirection(null), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);

  return { direction, pulseKey };
}

const Customize = () => {
  const { state, setSelection } = useFlow();
  const pkg = state.tier ? PACKAGES[state.tier] : undefined;
  const plan = resolvePlan(state);

  // Global Style Match: average per-slot style fit of currently chosen options.
  // Computed unconditionally so hooks below stay stable across renders.
  const chosenScores = pkg
    ? CATEGORIES.map((cat) => {
        const id = state.selections[cat.id] ?? pkg.defaults[cat.id];
        const opt = cat.options.find((o) => o.id === id) ?? cat.dynamic_pool?.find((o) => o.id === id);
        return opt ? styleScore(state.style, cat.id, opt) : null;
      }).filter((v): v is number => v !== null)
    : [];
  const globalScore01 =
    chosenScores.length > 0 ? chosenScores.reduce((a, b) => a + b, 0) / chosenScores.length : 0;
  const globalPct = Math.round(globalScore01 * 100);
  const globalLabel = styleMatchLabel(globalScore01);

  // Live feedback: track direction of change for total and style match.
  const totalChange = useChangeDirection(plan.total);
  const styleChange = useChangeDirection(globalPct);

  if (!pkg) {
    return (
      <div>
        <StepHeader title="Pick a tier first" />
        <PrimaryNav back="/remodel-flow/tier" />
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        eyebrow="Step 04"
        title="Customize your plan."
        description="Tap a category to swap finishes. The plan recalculates instantly."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            const currentId = state.selections[cat.id] ?? pkg.defaults[cat.id];

            // Engine-ranked best candidate among the visible options for this slot.
            const allowedBins =
              pkg.slots?.[cat.id]?.preferred_bins ??
              cat.swap_config?.allowed_bins ??
              (state.tier ? TIER_BINS[state.tier] : undefined);
            const defaultId = pkg.defaults[cat.id];
            const anchorPrice = defaultId ? getOption(cat.id, defaultId)?.estPrice ?? 0 : 0;
            const ranked = rank_candidates({
              categoryId: cat.id,
              style: state.style,
              allowedBins,
              anchorPrice,
              userOverrideId: state.selections[cat.id],
            });
            // Restrict "best" highlight to the visible option set (not dynamic pool).
            const visibleIds = new Set(cat.options.map((o) => o.id));
            const bestVisible = ranked.find((r) => visibleIds.has(r.option.id));
            const bestId = bestVisible?.option.id;

            // Price delta baseline: currently-selected option in this slot.
            const currentPrice = getOption(cat.id, currentId)?.estPrice ?? 0;

            return (
              <section key={cat.id}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{cat.name}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {cat.options.map((opt) => {
                    const s01 = styleScore(state.style, cat.id, opt);
                    const pct = Math.round(s01 * 100);
                    const label = styleMatchLabel(s01);
                    const isBest = opt.id === bestId;
                    const delta = opt.estPrice - currentPrice;
                    const isCurrent = opt.id === currentId;
                    return (
                      <FlowCard
                        key={opt.id}
                        selected={currentId === opt.id}
                        onClick={() => setSelection(cat.id, opt.id)}
                        className={cn(
                          isBest && "border-foreground/40 bg-foreground/[0.02]",
                        )}
                      >
                        {isBest && (
                          <span
                            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-foreground/20 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground"
                            title="Engine's top-ranked option for your style, tier, and budget"
                          >
                            <Star size={10} className="fill-foreground" strokeWidth={0} />
                            Best match
                          </span>
                        )}
                        <p className="text-sm font-medium text-foreground pr-16">{opt.name}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {fmt(opt.estPrice)}
                          <span
                            className={cn(
                              "ml-2 text-[10px] font-medium tabular-nums",
                              isCurrent || delta === 0
                                ? "text-muted-foreground"
                                : delta > 0
                                  ? "text-destructive"
                                  : "text-emerald-600 dark:text-emerald-500",
                            )}
                          >
                            {isCurrent || delta === 0
                              ? "Included"
                              : `${delta > 0 ? "+" : "−"}${fmt(Math.abs(delta))}`}
                          </span>
                        </p>
                        {state.style && (
                          <p className="mt-2">
                            <span className={badgeClasses(label)} title={`${label} for ${state.style}`}>
                              {pct}% · {label}
                            </span>
                          </p>
                        )}
                      </FlowCard>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{plan.packageName} estimate</p>
              <p className="mt-2 text-3xl font-semibold text-foreground flex items-baseline gap-1.5 tabular-nums">
                <span key={`total-${totalChange.pulseKey}`} className="animate-fade-in">
                  {fmt(plan.total)}
                </span>
                {totalChange.direction && (
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex items-center text-xs font-medium animate-fade-in",
                      totalChange.direction === "up" ? "text-destructive" : "text-emerald-600 dark:text-emerald-500",
                    )}
                  >
                    {totalChange.direction === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  </span>
                )}
              </p>
            </div>
            {state.style && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Style Match</p>
                <p className="mt-1 text-lg font-semibold text-foreground leading-none flex items-baseline justify-end gap-1 tabular-nums">
                  <span key={`style-${styleChange.pulseKey}`} className="animate-fade-in">
                    {globalPct}%
                  </span>
                  {styleChange.direction && (
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex items-center text-[10px] font-medium animate-fade-in",
                        styleChange.direction === "up" ? "text-emerald-600 dark:text-emerald-500" : "text-destructive",
                      )}
                    >
                      {styleChange.direction === "up" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    </span>
                  )}
                </p>
                <span className={cn(badgeClasses(globalLabel), "mt-1")}>{globalLabel}</span>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Base {fmt(plan.basePrice)} {plan.upgradeDelta !== 0 && (
              <span>· {plan.upgradeDelta > 0 ? "+" : ""}{fmt(plan.upgradeDelta)} adjustments</span>
            )}
          </p>
          {state.style && globalPct < 70 ? (
            <p className="mt-3 text-xs text-destructive/90 animate-fade-in">
              This reduces design cohesion.
            </p>
          ) : state.style && styleChange.direction === "up" ? (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Better alignment with your style.
            </p>
          ) : state.style && styleChange.direction === "down" ? (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Slightly less cohesive.
            </p>
          ) : null}
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
            {plan.items.map((it) => (
              <div key={it.categoryId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{it.categoryName}</span>
                <span className="text-foreground">{it.optionName}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <PrimaryNav back="/remodel-flow/packages" next="/remodel-flow/preview" nextLabel="Preview plan" />
    </div>
  );
};

export default Customize;
