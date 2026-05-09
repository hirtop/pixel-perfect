const HEADING = "How to choose";
const BODY =
  "The three packages differ in how much of the bathroom you want to change. Read the per-package summaries below to see which fits your project.";

const PackageComparisonCue = () => {
  return (
    <section
      data-testid="package-comparison-cue"
      aria-label="How to choose"
      className="w-full rounded-xl border border-border bg-secondary/30 px-5 py-4"
    >
      <h2 className="font-heading text-sm font-semibold text-foreground mb-1">
        {HEADING}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {BODY}
      </p>
    </section>
  );
};

export default PackageComparisonCue;
export { HEADING as COMPARISON_HEADING, BODY as COMPARISON_BODY };
