import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PhotoMeta {
  id?: string;
  name: string;
  size: number;
  type: string;
  storage_path?: string;
  preview_url?: string;
  upload_status?: "uploaded" | "preview_only" | "upload_failed";
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
  bathing_setup: string;
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
  assessment?: {
    activeLeaks?: "yes" | "no" | "unknown";
    crackedGrout?: "yes" | "no" | "unknown";
    visibleMold?: "yes" | "no" | "unknown";
    waterDamageSuspected?: "yes" | "no" | "unknown";
    waterproofingScope?: "None" | "Tub surround" | "Shower walls" | "Full shower system";
    demolitionItems?: Record<string, "keep" | "remove">;
    demolitionLevel?: "Light" | "Medium" | "Full Gut";
    plumbing?: {
      vanitySameLocation?: "yes" | "no" | "unknown";
      toiletSameLocation?: "yes" | "no" | "unknown";
      tubShowerSameLocation?: "yes" | "no" | "unknown";
      tubToShowerConversion?: "yes" | "no" | "unknown";
      addingSecondSink?: "yes" | "no" | "unknown";
      knownLeaks?: "yes" | "no" | "unknown";
      drainIssues?: "yes" | "no" | "unknown";
    };
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
  bathing_setup: "",
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
  saveProject: (options?: { silent?: boolean; projectOverride?: ProjectData }) => Promise<boolean>;
  loadLatestProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  resetProject: () => void;
  markStepComplete: (step: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  isLoaded: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const LOCAL_STORAGE_KEY = "bobox_project_draft";

  const getStoredProjectId = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return undefined;
      const parsed = JSON.parse(stored) as Partial<ProjectData>;
      return parsed.id;
    } catch {
      return undefined;
    }
  }, []);

  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return { ...defaultProject, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return defaultProject;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const projectRef = useRef(project);
  projectRef.current = project;

  const setProjectState = useCallback((nextProject: ProjectData) => {
    projectRef.current = nextProject;
    setProject(nextProject);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* ignore quota errors */
    }
  }, [project]);

  const updateProject = useCallback((updates: Partial<ProjectData>) => {
    const nextProject = { ...projectRef.current, ...updates };
    setProjectState(nextProject);
  }, [setProjectState]);

  const buildProjectFromRow = useCallback((data: any): ProjectData => {
    const agreementBlob = (data.agreement_data as Record<string, unknown>) || {};
    const photosFromBlob = agreementBlob.photos as ProjectData["photos"] | undefined;
    const subInteractionsFromBlob = agreementBlob.subcontractor_interactions as SubcontractorInteraction[] | undefined;

    const cleanAgreement = { ...agreementBlob };
    delete cleanAgreement.photos;
    delete cleanAgreement.subcontractor_interactions;

    return {
      id: data.id,
      name: data.name,
      status: data.status as ProjectData["status"],
      bathroom_type: data.bathroom_type || "",
      property_type: data.property_type || "",
      bathing_setup: ((data.dimensions as Record<string, unknown> | null)?.bathing_setup as string) || "",
      photos: photosFromBlob || { metadata: [], notes: "" },
      dimensions: (data.dimensions as ProjectData["dimensions"]) || {},
      style_preferences: (data.style_preferences as ProjectData["style_preferences"]) || {},
      selected_package: (data.selected_package as ProjectData["selected_package"]) || {},
      customizations: (data.customizations as ProjectData["customizations"]) || {},
      workflow_progress:
        (data.workflow_progress as ProjectData["workflow_progress"]) || { current_step: "start", completed_steps: [] },
      subcontractor_interactions: subInteractionsFromBlob || [],
      agreement_data: cleanAgreement,
    };
  }, []);

  const resetProject = useCallback(() => {
    setProjectState(defaultProject);
    setIsLoaded(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [setProjectState]);

  const saveProjectInternal = useCallback(async (silent = false, projectOverride?: ProjectData) => {
    let current = projectOverride ?? projectRef.current;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!silent) {
          toast.success("Your progress is saved on this device", {
            description: "Sign in anytime to sync your project across devices.",
          });
        }
        return true;
      }

      const toJson = (v: unknown) => JSON.parse(JSON.stringify(v));

      const payload = {
        user_id: user.id,
        name: current.name,
        status: current.status,
        bathroom_type: current.bathroom_type || null,
        property_type: current.property_type || null,
        dimensions: toJson({ ...current.dimensions, bathing_setup: current.bathing_setup }),
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

      const syncProjectId = (id: string) => {
        if (current.id === id) return;
        const nextProject = { ...current, id };
        current = nextProject;
        setProjectState(nextProject);
      };

      const updateProjectRow = async (targetId: string) => {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", targetId)
          .eq("user_id", user.id)
          .select("id");

        if (error) throw error;
        return data?.[0]?.id ?? null;
      };

      let persistedId: string | null = null;

      if (current.id) {
        persistedId = await updateProjectRow(current.id);
        if (!persistedId) {
          const nextProject = { ...current, id: undefined };
          current = nextProject;
          setProjectState(nextProject);
        }
      }

      if (!persistedId) {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        if (data) {
          syncProjectId(data.id);
        }
      }

      if (!silent) {
        toast.success("Project saved to your account", {
          description: "Your progress is backed up and ready when you return.",
        });
      }
      return true;
    } catch (err) {
      console.error("Save error:", err);
      if (!silent) {
        toast.error("Couldn't save project", {
          description: "Please try again.",
        });
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [setProjectState]);

  const saveProject = useCallback(
    (options?: { silent?: boolean; projectOverride?: ProjectData }) =>
      saveProjectInternal(options?.silent ?? false, options?.projectOverride),
    [saveProjectInternal],
  );

  const markStepComplete = useCallback((step: string) => {
    const current = projectRef.current;
    const completed = current.workflow_progress.completed_steps;
    const nextProject: ProjectData = {
      ...current,
      status: "in_progress",
      workflow_progress: {
        current_step: step,
        completed_steps: completed.includes(step) ? completed : [...completed, step],
      },
    };

    setProjectState(nextProject);
    void saveProjectInternal(true, nextProject);
  }, [saveProjectInternal, setProjectState]);

  const loadLatestProject = useCallback(async (knownUserId?: string) => {
    setIsLoading(true);
    try {
      let userId = knownUserId;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      if (!userId) {
        return;
      }

      const preferredProjectId = projectRef.current.id || getStoredProjectId();

      if (preferredProjectId) {
        const { data: preferredProject, error: preferredError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", preferredProjectId)
          .eq("user_id", userId)
          .maybeSingle();

        if (preferredError) throw preferredError;

        if (preferredProject) {
          setProjectState(buildProjectFromRow(preferredProject));
          setIsLoaded(true);
          return;
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProjectState(buildProjectFromRow(data));
      } else if (projectRef.current.id) {
        setProjectState({ ...projectRef.current, id: undefined });
      }

      setIsLoaded(true);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildProjectFromRow, getStoredProjectId, setProjectState]);

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProjectState(buildProjectFromRow(data));
      }

      setIsLoaded(true);
    } catch (err) {
      console.error("Load project error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildProjectFromRow, setProjectState]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (session?.user) {
          void loadLatestProject(session.user.id);
        } else {
          setIsLoaded(true);
        }
      } else if (event === "SIGNED_OUT") {
        resetProject();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadLatestProject, resetProject]);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        return loadLatestProject(session.user.id);
      }
      setIsLoaded(true);
      return undefined;
    });
  }, [loadLatestProject]);

  return (
    <ProjectContext.Provider value={{ project, updateProject, saveProject, loadLatestProject, loadProject, resetProject, markStepComplete, isSaving, isLoading, isLoaded }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
};
