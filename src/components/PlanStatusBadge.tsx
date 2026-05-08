import { derivePlanStatus, type PlanStatusInput } from "@/lib/derivePlanStatus";

const STATUS_LABEL: Record<NonNullable<ReturnType<typeof derivePlanStatus>>, string> = {
  exploring: "Exploring",
  shaping: "Shaping",
  "ready-to-share": "Ready to share",
};

interface PlanStatusBadgeProps {
  project: PlanStatusInput | null | undefined;
  className?: string;
}

/**
 * Pass 12 — Quiet text-only status cue. No pill chrome, no color coding,
 * no progress styling. Suppresses entirely when status is null.
 */
export default function PlanStatusBadge({ project, className }: PlanStatusBadgeProps) {
  const status = derivePlanStatus(project);
  if (!status) return null;
  return (
    <span
      aria-label="Plan status"
      className={`text-[11px] text-muted-foreground ${className || ""}`}
    >
      Status: {STATUS_LABEL[status]}.
    </span>
  );
}
