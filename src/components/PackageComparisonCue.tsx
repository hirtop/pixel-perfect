const HEADING = "How to choose";
const BODY =
  "The three packages differ in how much of the bathroom you want to change. Read the per-package summaries below to see which fits your project.";

const PackageComparisonCue = () => {
  return (
    <section
      data-testid="package-comparison-cue"
      aria-label="How to choose"
      className="w-full rounded-lg border border-border/50 bg-secondary/15 px-4 py-3 sm:px-5 sm:py-3.5"
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

export default PackageComparisonCue;
export { HEADING as COMPARISON_HEADING, BODY as COMPARISON_BODY };
