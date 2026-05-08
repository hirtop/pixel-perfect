import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { SavedProject } from "@/hooks/useUserProjects";
import ResumePlanTooltip from "@/components/ResumePlanTooltip";

interface ResumePlanBannerProps {
  project: SavedProject;
  onResume: () => void;
  loading?: boolean;
}

function formatDate(iso: string): string | null {
  const t = Date.parse(iso);
  if (!t) return null;
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildMetadataLine(project: SavedProject): string | null {
  const parts: string[] = [];
  const tier = project.selected_package?.tier || project.selected_package?.name;
  if (tier) parts.push(capitalize(tier));
  const style = project.style_preferences?.style;
  if (style) parts.push(capitalize(style));
  const date = formatDate(project.updated_at);
  if (date) parts.push(`Updated ${date}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function ResumePlanBanner({ project, onResume, loading }: ResumePlanBannerProps) {
  const meta = buildMetadataLine(project);
  return (
    <section
      aria-label="Resume your plan"
      className="container mx-auto px-6 pt-8"
    >
      <div className="max-w-4xl mx-auto rounded-xl border border-border bg-card px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-base sm:text-lg text-foreground">
            Welcome back. Your plan is saved.
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up exactly where you left off — your latest package, selections, and notes are ready.
          </p>
          {meta && (
            <p className="text-xs text-muted-foreground mt-2 truncate">{meta}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={onResume}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            Open my plan <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
