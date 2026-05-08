/**
 * Pass 13 — Quiet "Your summary includes" cue for /summary.
 *
 * Pure presentational. No fetches, no state, no chrome that implies
 * contractor approval, certification, or quote-readiness. Visually
 * secondary to the actual summary content.
 */

interface SummaryIncludesCueProps {
  className?: string;
}

export default function SummaryIncludesCue({ className }: SummaryIncludesCueProps) {
  return (
    <section
      data-testid="summary-includes-cue"
      className={`rounded-xl border border-border bg-card/50 p-5 ${className ?? ""}`}
      aria-labelledby="summary-includes-cue-heading"
    >
      <h2
        id="summary-includes-cue-heading"
        className="text-sm font-medium text-foreground mb-2"
      >
        Your summary includes
      </h2>
      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
        <li>Selected package and style direction</li>
        <li>Saved product choices</li>
        <li>Project notes and dimensions, when provided</li>
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        Review everything before sharing this summary.
      </p>
    </section>
  );
}
