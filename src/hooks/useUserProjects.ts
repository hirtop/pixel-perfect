import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { reportRemodelDesignsReadFailed } from "@/remodel-flow/package-engine/telemetry";

export interface SavedProject {
  id: string;
  name: string;
  status: string;
  bathroom_type: string | null;
  updated_at: string;
  workflow_progress: {
    current_step?: string;
    completed_steps?: string[];
  } | null;
  selected_package: {
    name?: string;
    tier?: string;
  } | null;
  style_preferences: {
    style?: string | null;
  } | null;
  /**
   * Pass 10 — Optional explicit identity fields. Populated for
   * `remodel_designs` rows; undefined for legacy `projects` rows.
   * Consumed by `normalizeSavedProjectIdentity` priority 1 / 2.
   */
  selected_package_id?: string | null;
  selected_legacy_tier_route?: string | null;
  /**
   * Pass 11 — Source marker so the UI / hydration layer can tell which
   * underlying table a row came from. We do NOT mutate `id` (consumers
   * still rely on the raw uuid) — use this field instead of id-prefix
   * heuristics.
   */
  source?: "projects" | "remodel_designs";
}

interface RemodelDesignRow {
  id: string;
  name: string | null;
  status: string | null;
  selected_style: string | null;
  selected_tier: string | null;
  selected_package_id: string | null;
  selected_legacy_tier_route: string | null;
  current_step: string | null;
  completed_steps: string[] | null;
  updated_at: string | null;
  last_active_at: string | null;
}

function mapDesignRowToSavedProject(d: RemodelDesignRow): SavedProject {
  const updated = d.last_active_at ?? d.updated_at ?? new Date(0).toISOString();
  return {
    id: d.id,
    name: d.name?.trim() || "Untitled design",
    status: d.status ?? "draft",
    bathroom_type: null,
    updated_at: updated,
    workflow_progress:
      d.current_step || (d.completed_steps && d.completed_steps.length > 0)
        ? {
            current_step: d.current_step ?? undefined,
            completed_steps: d.completed_steps ?? undefined,
          }
        : null,
    selected_package: d.selected_tier ? { tier: d.selected_tier } : null,
    style_preferences: d.selected_style ? { style: d.selected_style } : null,
    selected_package_id: d.selected_package_id ?? null,
    selected_legacy_tier_route: d.selected_legacy_tier_route ?? null,
    source: "remodel_designs",
  };
}

export function mergeSavedProjects(
  legacy: SavedProject[],
  designs: SavedProject[],
): SavedProject[] {
  // No reliable cross-table mapping key — keep both, sort desc by updated_at.
  // Do NOT dedupe by id (uuids do not collide across tables).
  const all = [...legacy, ...designs];
  return all.sort((a, b) => {
    const ta = Date.parse(a.updated_at) || 0;
    const tb = Date.parse(b.updated_at) || 0;
    return tb - ta;
  });
}

export function useUserProjects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProjects([]);
      setLoadedUserId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [legacyRes, designsRes] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, name, status, bathroom_type, updated_at, workflow_progress, selected_package, style_preferences",
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        (supabase as any)
          .from("remodel_designs")
          .select(
            "id, name, status, selected_style, selected_tier, selected_package_id, selected_legacy_tier_route, current_step, completed_steps, updated_at, last_active_at",
          )
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .order("last_active_at", { ascending: false }),
      ]);

      if (legacyRes.error) throw legacyRes.error;
      // remodel_designs read failures should NOT erase legacy rows.
      // Pass 12 — route degradation through centralized telemetry so a future
      // Sentry/PostHog hookup in telemetry.ts picks this up automatically.
      // We intentionally pass only a short error CODE (no raw Supabase message
      // — those can leak row data / PII).
      // TODO(observability): wire vendor inside telemetry.ts `emit()`.
      if (designsRes.error) {
        const code =
          (designsRes.error as { code?: string }).code ?? "unknown";
        reportRemodelDesignsReadFailed({
          code,
          route:
            typeof window !== "undefined" ? window.location?.pathname : undefined,
        });
      }

      const legacy: SavedProject[] = (legacyRes.data ?? []).map((d) => ({
        ...d,
        workflow_progress: d.workflow_progress as SavedProject["workflow_progress"],
        selected_package:
          (d.selected_package as SavedProject["selected_package"]) ?? null,
        style_preferences:
          (d.style_preferences as SavedProject["style_preferences"]) ?? null,
        source: "projects" as const,
      }));

      const designs: SavedProject[] = (
        (designsRes.data as RemodelDesignRow[] | null) ?? []
      ).map(mapDesignRowToSavedProject);

      setProjects(mergeSavedProjects(legacy, designs));
      setLoadedUserId(user.id);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
      setLoadedUserId(user.id);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading) {
      void fetchProjects();
    }
  }, [authLoading, fetchProjects]);

  const deleteProject = useCallback(
    async (id: string, sourceArg?: SavedProject["source"]) => {
      // Resolve source from current list when caller does not pass it,
      // so existing call sites (Index/ProjectPickerDialog) keep working
      // without signature changes.
      const source =
        sourceArg ?? projects.find((p) => p.id === id)?.source ?? "projects";
      if (source === "remodel_designs") {
        const { error } = await (supabase as any)
          .from("remodel_designs")
          .update({ deleted_at: new Date().toISOString(), status: "deleted" })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [projects],
  );

  const isHydratingCurrentUser = Boolean(user) && loadedUserId !== user.id;

  return {
    projects,
    loading: authLoading || loading || isHydratingCurrentUser,
    refetch: fetchProjects,
    deleteProject,
  };
}
