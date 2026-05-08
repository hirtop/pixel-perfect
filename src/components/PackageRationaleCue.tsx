interface PackageRationaleCueProps {
  tier: "Budget" | "Balanced" | "Premium";
}

const RATIONALE_COPY: Record<PackageRationaleCueProps["tier"], string> = {
  Budget:
    "Clean modern refresh with streamlined finishes and fewer upgrades.",
  Balanced:
    "Shower-forward modern remodel with cohesive finishes and curated retailer-anchored selections.",
  Premium:
    "Modern look with upgraded fixtures, larger formats, and detailed finish work.",
};

const PackageRationaleCue = ({ tier }: PackageRationaleCueProps) => {
  return (
    <p
      data-testid={`package-rationale-cue-${tier.toLowerCase()}`}
      className="text-xs text-muted-foreground leading-relaxed"
    >
      {RATIONALE_COPY[tier]}
    </p>
  );
};

export default PackageRationaleCue;
export { RATIONALE_COPY };
