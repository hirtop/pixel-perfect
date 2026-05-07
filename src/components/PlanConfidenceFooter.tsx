import { cn } from "@/lib/utils";

interface PlanConfidenceFooterProps {
  className?: string;
  context?: "customize" | "summary";
}

const COPY: Record<string, { line1: string; line2: string }> = {
  customize: {
    line1: "You're shaping a plan, not placing an order.",
    line2: "You can revisit and adjust any selection before sharing it with a contractor.",
  },
  summary: {
    line1: "You're shaping a plan, not placing an order.",
    line2: "Share this with a contractor to turn your draft into a firm quote.",
  },
};

export const PlanConfidenceFooter = ({
  className,
  context = "customize",
}: PlanConfidenceFooterProps) => {
  const copy = COPY[context] || COPY.customize;
  return (
    <div className={cn("text-center", className)}>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {copy.line1} {copy.line2}
      </p>
    </div>
  );
};
