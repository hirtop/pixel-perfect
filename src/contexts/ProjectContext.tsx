import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProjectData {
  id?: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  bathroom_type: string;
  property_type: string;
  dimensions: {
    width_ft?: string;
    width_in?: string;
    length_ft?: string;
    length_in?: string;
    height_ft?: string;
    height_in?: string;
    door_notes?: string;
    window_notes?: string;
    layout_notes?: string;
  };
  style_preferences: {
    style?: string;
    budget?: string;
    budget_level?: string;
    finish?: string;
  };
  selected_package: Record<string, unknown>;
  customizations: Record<string, unknown>;
  workflow_progress: {
    current_step: string;
    completed_steps: string[];
  };
  agreement_data: Record<string, unknown>;
}

const defaultProject: ProjectData = {
  name: "Untitled Project",
  status: "draft",
  bathroom_type: "",
  property_type: "",
  dimensions: {},
  style_preferences: {},
  selected_package: {},
  customizations: {},
  workflow_progress: { current_step: "start", completed_steps: [] },
  agreement_data: {},
};

interface ProjectContextType {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  saveProject: () => Promise<void>;
  markStepComplete: (step: string) => void;
  isSaving: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [project, setProject] = useState<ProjectData>(defaultProject);
  const [isSaving, setIsSaving] = useState(false);

  const updateProject = useCallback((updates: Partial<ProjectData>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  }, []);

  const markStepComplete = useCallback((step: string) => {
    setProject((prev) => {
      const completed = prev.workflow_progress.completed_steps;
      if (completed.includes(step)) return prev;
      return {
        ...prev,
        workflow_progress: {
          current_step: step,
          completed_steps: [...completed, step],
        },
      };
    });
  }, []);

  const saveProject = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.info("Sign in to save your project", {
          description: "Your progress is saved locally for now.",
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        user_id: user.id,
        name: project.name,
        status: project.status,
        bathroom_type: project.bathroom_type || null,
        property_type: project.property_type || null,
        dimensions: project.dimensions as Record<string, unknown>,
        style_preferences: project.style_preferences as Record<string, unknown>,
        selected_package: project.selected_package,
        customizations: project.customizations,
        workflow_progress: project.workflow_progress as Record<string, unknown>,
        agreement_data: project.agreement_data,
      };

      if (project.id) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", project.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data) setProject((prev) => ({ ...prev, id: data.id }));
      }

      toast.success("Project saved", {
        description: "Your progress has been saved.",
      });
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Couldn't save project", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [project]);

  return (
    <ProjectContext.Provider value={{ project, updateProject, saveProject, markStepComplete, isSaving }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};
