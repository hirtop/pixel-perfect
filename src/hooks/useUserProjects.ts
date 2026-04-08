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
}

export function useUserProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, status, bathroom_type, updated_at, workflow_progress")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(
        (data ?? []).map((d) => ({
          ...d,
          workflow_progress: d.workflow_progress as SavedProject["workflow_progress"],
        }))
      );
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  return { projects, loading, refetch: fetchProjects, deleteProject };
}
