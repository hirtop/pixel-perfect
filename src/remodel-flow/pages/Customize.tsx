import { useFlow } from "../FlowContext";
import { CATEGORIES, PACKAGES } from "../catalog";
import { resolvePlan } from "../resolver";
import { FlowCard, PrimaryNav, StepHeader } from "../ui";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Customize = () => {
  const { state, setSelection } = useFlow();
  const pkg = state.tier ? PACKAGES[state.tier] : undefined;
  const plan = resolvePlan(state);

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
            return (
              <section key={cat.id}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{cat.name}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {cat.options.map((opt) => (
                    <FlowCard
                      key={opt.id}
                      selected={currentId === opt.id}
                      onClick={() => setSelection(cat.id, opt.id)}
                    >
                      <p className="text-sm font-medium text-foreground">{opt.name}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{fmt(opt.estPrice)}</p>
                    </FlowCard>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{plan.packageName} estimate</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{fmt(plan.total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Base {fmt(plan.basePrice)} {plan.upgradeDelta !== 0 && (
              <span>· {plan.upgradeDelta > 0 ? "+" : ""}{fmt(plan.upgradeDelta)} adjustments</span>
            )}
          </p>
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
