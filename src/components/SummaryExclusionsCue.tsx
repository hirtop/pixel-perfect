/**
 * Pass 14 — Quiet "Still to confirm" cue for /summary.
 *
 * Pure presentational. No fetches, no state, no chrome that implies
 * contractor approval, certification, or quote-readiness. Visually
 * secondary to the actual summary content.
 */

interface SummaryExclusionsCueProps {
  className?: string;
}

export default function SummaryExclusionsCue({ className }: SummaryExclusionsCueProps) {
  return (
    <section
      data-testid="summary-exclusions-cue"
      className={`rounded-xl border border-border bg-card/50 p-5 ${className ?? ""}`}
      aria-labelledby="summary-exclusions-cue-heading"
    >
      <h2
        id="summary-exclusions-cue-heading"
        className="text-sm font-medium text-foreground mb-2"
      >
        Still to confirm
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        Your BOBOX summary helps organize your selections, but some project details still need to be confirmed before work begins.
      </p>
      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
        <li>Demo, haul-away, and site preparation</li>
        <li>Permits, inspections, and local code requirements</li>
        <li>Plumbing, electrical, or structural changes</li>
        <li>Final labor scope, measurements, and installation details</li>
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        Review these items with your contractor or project professional.
      </p>
    </section>
  );
}
