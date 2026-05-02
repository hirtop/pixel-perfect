import { useEffect } from "react";
import { useFlow } from "../FlowContext";
import { PACKAGES, CATEGORIES, getOption } from "../catalog";
import { PrimaryNav, StepHeader } from "../ui";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Packages = () => {
  const { state, setPackageId } = useFlow();
  const pkg = state.tier ? PACKAGES[state.tier] : undefined;

  // Persist explicit package selection in flow state when this page is reached
  // with a confirmed tier. Keeps state.packageId aligned with the resolver.
  useEffect(() => {
    if (pkg && state.packageId !== pkg.id) {
      setPackageId(pkg.id);
    }
  }, [pkg, state.packageId, setPackageId]);

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
        eyebrow="Step 03"
        title={`${pkg.name} package`}
        description={pkg.tagline}
      />
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">Starting at</p>
          <p className="text-3xl font-semibold text-foreground">{fmt(pkg.basePrice)}</p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const optId = pkg.defaults[cat.id];
            const opt = optId ? getOption(cat.id, optId) : undefined;
            return (
              <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{cat.name}</p>
                  <p className="text-sm text-foreground mt-0.5">{opt?.name ?? "—"}</p>
                </div>
                <p className="text-sm text-muted-foreground">{opt ? fmt(opt.estPrice) : ""}</p>
              </div>
            );
          })}
        </div>
      </div>
      <PrimaryNav back="/remodel-flow/tier" next="/remodel-flow/customize" nextLabel="Customize" />
    </div>
  );
};

export default Packages;
