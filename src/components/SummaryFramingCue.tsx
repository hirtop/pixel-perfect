/**
 * Pass 22 — Compact top-of-page framing cue for /summary.
 *
 * Pure presentational. No fetches, no state, no CTA.
 * Tells buyers what the page is before they scroll.
 */

const HEADING = "Planning summary";
const BODY =
  "This is a planning summary, not a final contractor quote. Use it to review your direction; your contractor will confirm site-specific details.";

const SummaryFramingCue = () => {
  return (
    <section
      data-testid="summary-framing-cue"
      aria-label="Planning summary"
      className="w-full max-w-lg mx-auto rounded-lg border border-border/50 bg-secondary/15 px-4 py-3 sm:px-5 sm:py-3.5 mb-8"
    >
      <h2 className="font-heading text-sm font-semibold text-foreground mb-1">
        {HEADING}
      </h2>
      <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
        {BODY}
      </p>
    </section>
  );
};

export default SummaryFramingCue;
export { HEADING as FRAMING_HEADING, BODY as FRAMING_BODY };
