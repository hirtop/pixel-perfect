import { cn } from "@/lib/utils";

interface PlanConfidenceFooterProps {
  className?: string;
  context?: "customize" | "summary";
}

const COPY: Record<string, string> = {
  customize:
    "You can revisit and adjust any selection before sharing this with a contractor.",
  summary:
    "You can revisit and update this plan from your account at any time.",
};

export const PlanConfidenceFooter = ({
  className,
  context = "customize",
}: PlanConfidenceFooterProps) => {
  const text = COPY[context] || COPY.customize;
  return (
    <div className={cn("text-center", className)}>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {text}
      </p>
    </div>
  );
};
