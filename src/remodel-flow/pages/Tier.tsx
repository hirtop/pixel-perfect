import { useFlow } from "../FlowContext";
import { PACKAGES } from "../catalog";
import { FlowCard, PrimaryNav, StepHeader } from "../ui";
import type { TierId } from "../types";

const TIERS: TierId[] = ["essential", "balanced", "premium"];

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Tier = () => {
  const { state, setTier } = useFlow();
  return (
    <div>
      <StepHeader eyebrow="Step 02" title="Choose a tier." description="Each tier comes pre-configured. You can fully customize next." />
      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((id) => {
          const p = PACKAGES[id];
          return (
            <FlowCard key={id} selected={state.tier === id} onClick={() => setTier(id)}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.name}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{fmt(p.basePrice)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
            </FlowCard>
          );
        })}
      </div>
      <PrimaryNav back="/remodel-flow/style" next="/remodel-flow/packages" disabled={!state.tier} />
    </div>
  );
};

export default Tier;
