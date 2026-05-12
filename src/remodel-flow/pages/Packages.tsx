import { useEffect } from "react";
import { useFlow } from "../FlowContext";
import { CATALOG_GROUPS, getOption, getPackageFor, getPackageStartingPrice, PACKAGES } from "../catalog";
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
    ? `A complete bathroom package designed in your selected ${styleLabel} style.`
    : PACKAGES[state.tier].tagline;
  const startingAt = getPackageStartingPrice(state.style, state.tier);

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
          <p className="text-3xl font-semibold text-foreground">{fmt(startingAt)}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Includes products + estimated labor. You can swap items in the next step.
        </p>

        <div className="mt-6 space-y-6">
          {CATALOG_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{group.label}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {group.categoryIds.map((catId) => {
                  const optId = pkg.defaults[catId];
                  const opt = optId ? getOption(catId, optId) : undefined;
                  return (
                    <div key={catId} className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{labelFor(catId)}</p>
                        <p className="text-sm text-foreground mt-0.5">{opt?.name ?? "Included"}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{opt ? fmt(opt.estPrice) : ""}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <PrimaryNav back="/remodel-flow/tier" next="/remodel-flow/customize" nextLabel="Customize" />
    </div>
  );
};

// Display-only labels for the package page (we keep canonical cat.name for
// the customize cards but show user-friendlier labels in the summary list).
const LABEL_OVERRIDES: Record<string, string> = {
  fixtures: "Faucet",
  tile: "Shower Wall Tile",
};
import { getCategory } from "../catalog";
function labelFor(catId: string): string {
  return LABEL_OVERRIDES[catId] ?? getCategory(catId)?.name ?? catId;
}

export default Packages;
