import { useFlow } from "../FlowContext";
import { resolvePlan } from "../resolver";
import { PrimaryNav, StepHeader } from "../ui";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Preview = () => {
  const { state, reset } = useFlow();
  const plan = resolvePlan(state);

  return (
    <div>
      <StepHeader
        eyebrow="Step 05"
        title="Your plan preview."
        description="A clean summary of every choice. Estimates only — final pricing depends on local labor and final scope."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Style</p>
          <p className="mt-2 text-lg font-medium text-foreground capitalize">{state.style ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Tier</p>
          <p className="mt-2 text-lg font-medium text-foreground">{plan.packageName ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-foreground bg-foreground text-background p-5">
          <p className="text-xs uppercase tracking-widest opacity-70">Estimated total</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(plan.total)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card divide-y divide-border/60">
        {plan.items.map((it) => (
          <div key={it.categoryId} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{it.categoryName}</p>
              <p className="text-sm text-foreground mt-0.5">{it.optionName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground">{fmt(it.estPrice)}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {it.source === "user-selection" ? "Custom" : "Default"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
        >
          Start over
        </button>
      </div>

      <PrimaryNav back="/remodel-flow/customize" />
    </div>
  );
};

export default Preview;
