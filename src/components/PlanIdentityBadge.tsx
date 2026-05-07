import type { ProjectData } from "@/contexts/ProjectContext";

function formatDate(iso: string): string | null {
  const t = Date.parse(iso);
  if (!t) return null;
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isDefaultLikeName(name: string): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  if (n === "") return true;
  if (n === "untitled project") return true;
  if (n === "untitled design") return true;
  return false;
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
}

export default function PlanIdentityBadge({ project }: PlanIdentityBadgeProps) {
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
