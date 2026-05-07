export interface RecencyResult {
  text: string | null;
}

/**
 * Format an ISO timestamp into a human-readable recency string.
 *
 * Rules:
 *  - < 1 hour  -> "Last edited just now."
 *  - < 24 hours -> "Last edited X hours ago."
 *  - < 7 days  -> "Last edited X days ago."
 *  - >= 7 days -> null (suppressed to avoid highlighting stale plans)
 *  - invalid/missing -> null
 */
export function formatRecency(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (!then || Number.isNaN(then)) return null;

  const now = Date.now();
  const diffMs = now - then;
  if (diffMs < 0) return null; // future date

  const diffMins = diffMs / (1000 * 60);
  const diffHrs = diffMins / 60;

  if (diffHrs < 1) {
    return "Last edited just now.";
  }

  if (diffHrs < 24) {
    const hours = Math.floor(diffHrs);
    return `Last edited ${hours} ${hours === 1 ? "hour" : "hours"} ago.`;
  }

  const diffDays = diffHrs / 24;
  if (diffDays < 7) {
    const days = Math.floor(diffDays);
    return `Last edited ${days} ${days === 1 ? "day" : "days"} ago.`;
  }

  return null;
}

interface RecencyHintProps {
  updatedAt: string | undefined | null;
  className?: string;
}

/**
 * Small muted recency cue. Renders nothing when the plan is 7+ days old
 * or the date is missing/invalid.
 */
export default function RecencyHint({ updatedAt, className }: RecencyHintProps) {
  const text = formatRecency(updatedAt);
  if (!text) return null;
  return (
    <span
      aria-label="Plan recency"
      className={`text-[11px] text-muted-foreground ${className || ""}`}
    >
      {text}
    </span>
  );
}
