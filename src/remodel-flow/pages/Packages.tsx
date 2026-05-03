import { useEffect } from "react";
import { useFlow } from "../FlowContext";
import { CATEGORIES, getOption, getPackageFor, PACKAGES } from "../catalog";
import { PrimaryNav, StepHeader } from "../ui";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_LABEL = { essential: "Essential", balanced: "Balanced", premium: "Premium" } as const;
const STYLE_LABEL = { modern: "Modern", classic: "Classic", spa: "Spa", minimal: "Minimal" } as const;

const Packages = () => {
  const { state, setPackageId } = useFlow();
  const pkg = state.tier ? getPackageFor(state.style, state.tier) : undefined;

  // Persist explicit package selection in flow state when this page is reached
  // with a confirmed tier. Keeps state.packageId aligned with the resolver.
  useEffect(() => {
    if (pkg && state.packageId !== pkg.id) {
      setPackageId(pkg.id);
    }
  }, [pkg, state.packageId, setPackageId]);

  if (!pkg || !state.tier) {
    return (
      <div>
        <StepHeader title="Pick a tier first" />
        <PrimaryNav back="/remodel-flow/tier" />
      </div>
    );
  }

  const styleLabel = state.style ? STYLE_LABEL[state.style] : "";
  const tierLabel = TIER_LABEL[state.tier];
  const title = styleLabel ? `${styleLabel} — ${tierLabel} Package` : `${tierLabel} Package`;
  const description = styleLabel
    ? `Designed in your selected ${styleLabel} style`
    : PACKAGES[state.tier].tagline;

  return (
    <div>
      {styleLabel && (
        <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          You selected: <span className="text-foreground">{styleLabel}</span>
        </p>
      )}
      <StepHeader eyebrow="Step 03" title={title} description={description} />
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
