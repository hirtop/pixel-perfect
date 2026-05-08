import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SavedProject } from "@/hooks/useUserProjects";
import { formatRecency } from "@/components/RecencyHint";
import { isDefaultLikePlanName } from "@/components/PlanNameEditor";
import { buildMetadataLine } from "@/components/ResumePlanBanner";

const NAME_TRUNCATE_AT = 32;

function formatDateAbsolute(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!t || Number.isNaN(t)) return null;
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function truncateName(name: string): { display: string; full: string; truncated: boolean } {
  const trimmed = name.trim();
  if (trimmed.length <= NAME_TRUNCATE_AT) {
    return { display: trimmed, full: trimmed, truncated: false };
  }
  return { display: `${trimmed.slice(0, NAME_TRUNCATE_AT - 1)}…`, full: trimmed, truncated: true };
}

export interface ResumePlanTooltipContent {
  nameDisplay: string;
  nameFull: string;
  nameTruncated: boolean;
  recencyLine: string | null;
  metadataLine: string | null;
}

export function buildTooltipContent(project: SavedProject): ResumePlanTooltipContent {
  const rawName = project.name || "";
  const isDefault = isDefaultLikePlanName(rawName);
  const baseName = isDefault ? "Your project" : rawName;
  const { display, full, truncated } = truncateName(baseName);

  const recency = formatRecency(project.updated_at);
  const recencyLine =
    recency ?? (formatDateAbsolute(project.updated_at)
      ? `Updated ${formatDateAbsolute(project.updated_at)}`
      : null);

  // Optional metadata: reuse banner builder, then strip the redundant "Updated …" tail.
  const meta = buildMetadataLine(project);
  const metaParts = meta ? meta.split(" · ").filter((p) => !p.startsWith("Updated ")) : [];
  const metadataLine = metaParts.length > 0 ? metaParts.join(" · ") : null;

  return { nameDisplay: display, nameFull: full, nameTruncated: truncated, recencyLine, metadataLine };
}

interface ResumePlanTooltipProps {
  project: SavedProject;
}

export default function ResumePlanTooltip({ project }: ResumePlanTooltipProps) {
  const content = buildTooltipContent(project);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="View saved plan details"
          className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-64 p-3 text-xs"
        role="dialog"
        aria-label="Saved plan details"
      >
        <p
          className="font-medium text-foreground truncate"
          title={content.nameTruncated ? content.nameFull : undefined}
        >
          {content.nameDisplay}
        </p>
        {content.recencyLine && (
          <p className="mt-1 text-muted-foreground">{content.recencyLine}</p>
        )}
        {content.metadataLine && (
          <p className="mt-1 text-muted-foreground">{content.metadataLine}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
