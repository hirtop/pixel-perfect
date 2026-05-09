interface PackagePersonaCueProps {
  tier: "Budget" | "Balanced" | "Premium";
}

const PERSONA_COPY: Record<PackagePersonaCueProps["tier"], string> = {
  Budget:
    "For homeowners doing a first remodel or working within a tighter budget.",
  Balanced:
    "For homeowners doing a real modern remodel without going custom-build.",
  Premium:
    "For homeowners planning a fully upgraded modern bathroom.",
};

const PackagePersonaCue = ({ tier }: PackagePersonaCueProps) => {
  return (
    <p
      data-testid={`package-persona-cue-${tier.toLowerCase()}`}
      className="text-xs text-muted-foreground leading-relaxed"
    >
      {PERSONA_COPY[tier]}
    </p>
  );
};

export default PackagePersonaCue;
export { PERSONA_COPY };
