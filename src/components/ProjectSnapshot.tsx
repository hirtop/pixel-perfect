import { TrendingUp, Gauge, Layers, Compass, ArrowRight } from "lucide-react";
import type { ProjectSnapshot as Snapshot } from "@/data/project-snapshot";

interface Props {
  snapshot: Snapshot;
  onNextStepClick?: (tier?: "Budget" | "Balanced" | "Premium") => void;
}

const complexityDots = (level: Snapshot["complexity"]) => {
  const filled = level === "Simple" ? 1 : level === "Moderate" ? 2 : 3;
  return [0, 1, 2].map((i) => i < filled);
};

const SectionLabel = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-center gap-1.5 mb-2">
    <Icon className="h-3 w-3 text-primary" />
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{children}</p>
  </div>
);

const ProjectSnapshot = ({ snapshot, onNextStepClick }: Props) => {
  const dots = complexityDots(snapshot.complexity);

  return (
    <section
      aria-label="Project snapshot"
      data-testid="project-snapshot"
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/60">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Project Snapshot</p>
        <h2 className="font-heading text-lg text-foreground mt-1">Your remodel at a glance</h2>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {/* Estimated range */}
        <div className="p-6 md:border-b md:border-border/60">
          <SectionLabel icon={TrendingUp}>Estimated Range</SectionLabel>
          {snapshot.yourTierRange && snapshot.yourTierLabel ? (
            <>
              <p className="font-heading text-2xl text-foreground leading-tight">{snapshot.yourTierRange}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {snapshot.yourTierLabel} tier · all-in installed
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-2">
                Market range: <span className="text-foreground/70">{snapshot.marketRange}</span>
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-2xl text-foreground leading-tight">{snapshot.marketRange}</p>
              <p className="text-xs text-muted-foreground mt-1">All-in installed, across tiers</p>
            </>
          )}
        </div>

        {/* Complexity */}
        <div className="p-6 md:border-b md:border-border/60">
          <SectionLabel icon={Gauge}>Complexity</SectionLabel>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1" aria-hidden="true">
              {dots.map((filled, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    filled ? "bg-primary" : "border border-primary/40 bg-transparent"
                  }`}
                />
              ))}
            </div>
            <p className="font-heading text-2xl text-foreground leading-tight">{snapshot.complexity}</p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            {snapshot.complexity === "Simple" && "1–2 weeks · no plumbing moves · predictable cost"}
            {snapshot.complexity === "Moderate" && "2–4 weeks · some trade coordination needed"}
            {snapshot.complexity === "Complex" && "4–6+ weeks · plumbing or layout changes likely"}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{snapshot.complexityReason}</p>
        </div>

        {/* Cost drivers */}
        <div className="p-6">
          <SectionLabel icon={Layers}>Top Cost Drivers</SectionLabel>
          <ol className="space-y-2.5">
            {snapshot.drivers.map((d, i) => (
              <li key={d.label} className="flex gap-3">
                <span className="text-[11px] font-semibold text-primary/70 mt-0.5 tabular-nums">0{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{d.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Next step */}
        <div className="p-6 bg-secondary/20">
          <SectionLabel icon={Compass}>Recommended Next Step</SectionLabel>
          <p className="text-sm text-foreground leading-relaxed">{snapshot.nextStep.text}</p>
          {onNextStepClick && snapshot.nextStep.highlightTier && (
            <button
              type="button"
              onClick={() => onNextStepClick(snapshot.nextStep.highlightTier)}
              className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              Jump to {snapshot.nextStep.highlightTier}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectSnapshot;
