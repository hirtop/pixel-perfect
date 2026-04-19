import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, bathroom_type, updated_at, workflow_progress, selected_package")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(
        (data ?? []).map((d) => ({
          ...d,
          workflow_progress: d.workflow_progress as SavedProject["workflow_progress"],
          selected_package: (d.selected_package as SavedProject["selected_package"]) ?? null,
        }))
      );
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
    async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  const isHydratingCurrentUser = Boolean(user) && loadedUserId !== user.id;

  return {
    projects,
    loading: authLoading || loading || isHydratingCurrentUser,
    refetch: fetchProjects,
    deleteProject,
  };
}
