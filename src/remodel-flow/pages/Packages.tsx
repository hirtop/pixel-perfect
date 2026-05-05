import { useEffect } from "react";
import { useFlow } from "../FlowContext";
import { CATEGORIES, getOption, getPackageFor, PACKAGES } from "../catalog";
import { PrimaryNav, StepHeader } from "../ui";
import { getPackage, isLegacyRouteAlias } from "../package-engine/registry";
import { parsePackageId } from "../package-engine/normalize";
import type { PackageId, Tier as CanonicalTier } from "../package-engine/types";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_LABEL = { essential: "Essential", balanced: "Balanced", premium: "Premium" } as const;
const STYLE_LABEL = { modern: "Modern", classic: "Classic", spa: "Spa", minimal: "Minimal" } as const;

const Packages = () => {
  const { state, setPackageId, setLegacyTierRoute } = useFlow();
  const pkg = state.tier ? getPackageFor(state.style, state.tier) : undefined;

  // Persist explicit package selection. Only write packageId when pkg.id is
  // a real PackageId registered in the manifest (curated or placeholder).
  // Bare tier aliases ("balanced", "essential", "premium") flow through the
  // legacyTierRoute field instead and never land in `state.packageId`.
  useEffect(() => {
    if (!pkg) return;
    const parsed = parsePackageId(pkg.id);
    const registered = getPackage(pkg.id);
    if (parsed && registered) {
      const real = pkg.id as PackageId;
      if (state.packageId !== real) setPackageId(real);
    } else if (isLegacyRouteAlias(pkg.id)) {
      const legacy = pkg.id as CanonicalTier;
      if (state.legacyTierRoute !== legacy) setLegacyTierRoute(legacy);
    }
  }, [pkg, state.packageId, state.legacyTierRoute, setPackageId, setLegacyTierRoute]);

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
