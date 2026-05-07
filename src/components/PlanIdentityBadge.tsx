import type { ProjectData } from "@/contexts/ProjectContext";
import PlanNameEditor, { isDefaultLikePlanName } from "@/components/PlanNameEditor";

function formatDate(iso: string): string | null {
  const t = Date.parse(iso);
  if (!t) return null;
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isDefaultLikeName(name: string): boolean {
  return isDefaultLikePlanName(name);
}

function buildBadgeCopy(project: ProjectData): string | null {
  const parts: string[] = [];
  const name = isDefaultLikeName(project.name) ? "Your project" : project.name.trim();
  parts.push(`Project: ${name}`);
  const date = project.updated_at ? formatDate(project.updated_at) : null;
  if (date) parts.push(`Updated ${date}`);
  return parts.join(" · ");
}

interface PlanIdentityBadgeProps {
  project: ProjectData;
  editable?: boolean;
  onRename?: (next: string) => Promise<boolean> | boolean;
}

export default function PlanIdentityBadge({ project, editable, onRename }: PlanIdentityBadgeProps) {
  const date = project.updated_at ? formatDate(project.updated_at) : null;

  if (editable && onRename) {
    return (
      <p aria-label="Plan identity" className="text-[11px] text-muted-foreground flex items-center gap-1 max-w-full">
        <span className="shrink-0">Project:</span>
        <PlanNameEditor
          name={project.name || ""}
          fallbackLabel="Your project"
          onSave={onRename}
          className="max-w-[14rem] truncate text-[11px] text-muted-foreground"
        />
        {date && <span className="shrink-0">· Updated {date}</span>}
      </p>
    );
  }

  const copy = buildBadgeCopy(project);
  if (!copy) return null;
  return (
    <p
      aria-label="Plan identity"
      className="text-[11px] text-muted-foreground truncate"
      title={copy}
    >
      {copy}
    </p>
  );
}

export { buildBadgeCopy };
