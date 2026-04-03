import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PhotoMeta {
  name: string;
  size: number;
  type: string;
}

export interface SubcontractorInteraction {
  name: string;
  quote_requested?: boolean;
  summary_sent?: boolean;
}

export interface ProjectData {
  id?: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  bathroom_type: string;
  property_type: string;
  photos: {
    metadata: PhotoMeta[];
    notes: string;
  };
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
  selected_package: {
    name?: string;
    tier?: string;
  };
  customizations: {
    categories?: Array<{
      name: string;
      selected: string;
      price: number;
    }>;
  };
  workflow_progress: {
    current_step: string;
    completed_steps: string[];
  };
  subcontractor_interactions: SubcontractorInteraction[];
  agreement_data: Record<string, unknown>;
}

const defaultProject: ProjectData = {
  name: "Untitled Project",
  status: "draft",
  bathroom_type: "",
  property_type: "",
  photos: { metadata: [], notes: "" },
  dimensions: {},
  style_preferences: {},
  selected_package: {},
  customizations: {},
  workflow_progress: { current_step: "start", completed_steps: [] },
  subcontractor_interactions: [],
  agreement_data: {},
};

interface ProjectContextType {
  project: ProjectData;
  updateProject: (updates: Partial<ProjectData>) => void;
  saveProject: () => Promise<void>;
  loadLatestProject: () => Promise<void>;
  resetProject: () => void;
  markStepComplete: (step: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  isLoaded: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const LOCAL_STORAGE_KEY = "bobox_project_draft";

  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return { ...defaultProject, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return defaultProject;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const projectRef = useRef(project);
  projectRef.current = project;

  // Auto-persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
    } catch { /* ignore quota errors */ }
  }, [project]);

  const updateProject = useCallback((updates: Partial<ProjectData>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProject = useCallback(() => {
    setProject(defaultProject);
    setIsLoaded(false);
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const markStepComplete = useCallback((step: string) => {
    setProject((prev) => {
      const completed = prev.workflow_progress.completed_steps;
      if (completed.includes(step)) return prev;
      return {
        ...prev,
        status: "in_progress" as const,
        workflow_progress: {
          current_step: step,
          completed_steps: [...completed, step],
        },
      };
    });
  }, []);

  const loadLatestProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Extract photos and subcontractor_interactions from agreement_data blob (where save stores them)
        const agreementBlob = (data.agreement_data as Record<string, unknown>) || {};
        const photosFromBlob = agreementBlob.photos as ProjectData["photos"] | undefined;
        const subInteractionsFromBlob = agreementBlob.subcontractor_interactions as SubcontractorInteraction[] | undefined;

        // Clean agreement_data by removing the extracted fields
        const cleanAgreement = { ...agreementBlob };
        delete cleanAgreement.photos;
        delete cleanAgreement.subcontractor_interactions;

        setProject({
          id: data.id,
          name: data.name,
          status: data.status as ProjectData["status"],
          bathroom_type: data.bathroom_type || "",
          property_type: data.property_type || "",
          photos: photosFromBlob || { metadata: [], notes: "" },
          dimensions: (data.dimensions as ProjectData["dimensions"]) || {},
          style_preferences: (data.style_preferences as ProjectData["style_preferences"]) || {},
          selected_package: (data.selected_package as ProjectData["selected_package"]) || {},
          customizations: (data.customizations as ProjectData["customizations"]) || {},
          workflow_progress: (data.workflow_progress as ProjectData["workflow_progress"]) || { current_step: "start", completed_steps: [] },
          subcontractor_interactions: subInteractionsFromBlob || [],
          agreement_data: cleanAgreement,
        });
        setIsLoaded(true);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load on auth change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadLatestProject();
      } else if (event === "SIGNED_OUT") {
        resetProject();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadLatestProject();
    });

    return () => subscription.unsubscribe();
  }, [loadLatestProject, resetProject]);

  const saveProject = useCallback(async () => {
    const current = projectRef.current;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.success("Progress saved on this device", {
          description: "Create an account to save across devices and keep your project safe.",
        });
        setIsSaving(false);
        return;
      }

      const toJson = (v: unknown) => JSON.parse(JSON.stringify(v));

      const payload = {
        user_id: user.id,
        name: current.name,
        status: current.status,
        bathroom_type: current.bathroom_type || null,
        property_type: current.property_type || null,
        dimensions: toJson(current.dimensions),
        style_preferences: toJson(current.style_preferences),
        selected_package: toJson(current.selected_package),
        customizations: toJson(current.customizations),
        workflow_progress: toJson(current.workflow_progress),
        agreement_data: toJson({
          ...current.agreement_data,
          subcontractor_interactions: current.subcontractor_interactions,
          photos: current.photos,
        }),
      };

      if (current.id) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", current.id);
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
  }, []);

  return (
    <ProjectContext.Provider value={{ project, updateProject, saveProject, loadLatestProject, resetProject, markStepComplete, isSaving, isLoading, isLoaded }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};
