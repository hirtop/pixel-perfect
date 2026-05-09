interface HomepageClarityCueProps {
  withSupportingLine?: boolean;
}

const HEADING = "BOBOX helps you plan a bathroom remodel by package.";
const BODY =
  "BOBOX helps you choose and adjust a curated bathroom remodel package before you review final scope, labor, and site details with a project professional.";
const SUPPORTING_LINE =
  "Use it to compare packages, organize your selections, and prepare a summary you can share.";

const HomepageClarityCue = ({ withSupportingLine = false }: HomepageClarityCueProps) => {
  return (
    <div data-testid="homepage-clarity-cue" className="space-y-2 mb-8 max-w-lg">
      <p className="text-sm md:text-base font-semibold text-primary-foreground/90 leading-relaxed">
        {HEADING}
      </p>
      <p className="text-sm md:text-base text-primary-foreground/70 leading-relaxed">
        {BODY}
      </p>
      {withSupportingLine && (
        <p className="text-sm text-primary-foreground/60 leading-relaxed">
          {SUPPORTING_LINE}
        </p>
      )}
    </div>
  );
};

export default HomepageClarityCue;
export { HEADING, BODY, SUPPORTING_LINE };
