import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowRight, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import type { SavedProject } from "@/hooks/useUserProjects";
import { toast } from "sonner";

const STEP_LABELS: Record<string, string> = {
  start: "Getting Started",
  upload: "Upload Photos",
  dimensions: "Dimensions",
  "style-budget": "Style & Budget",
  options: "Remodel Options",
  customize: "Customizing",
  workflow: "Workflow",
  summary: "Summary",
  subcontractors: "Subcontractors",
  agreement: "Agreement",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: SavedProject[];
  onDelete: (id: string) => Promise<void>;
}

export default function ProjectPickerDialog({ open, onOpenChange, projects, onDelete }: Props) {
  const navigate = useNavigate();
  const { resetProject, loadProject } = useProject();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleResume = async (project: SavedProject) => {
    onOpenChange(false);
    const step = project.workflow_progress?.current_step || "start";
    const route = step === "start" ? "/start" : `/${step}`;
    await loadProject(project.id);
    navigate(route);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await onDelete(confirmDeleteId);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleStartNew = () => {
    onOpenChange(false);
    resetProject();
    navigate("/start");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Saved Projects</DialogTitle>
            <DialogDescription>
              Resume a project or start a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-72 overflow-y-auto py-2">
            {projects.map((p) => {
              const step = p.workflow_progress?.current_step || "start";
              const stepsComplete = p.workflow_progress?.completed_steps?.length ?? 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {STEP_LABELS[step] ?? step}
                      {p.bathroom_type ? ` · ${p.bathroom_type}` : ""}
                      {" · "}
                      {formatDate(p.updated_at)}
                    </p>
                    {stepsComplete > 0 && (
                      <div className="flex gap-0.5 mt-1.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < stepsComplete ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setConfirmDeleteId(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => handleResume(p)}>
                      Resume <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" className="w-full gap-2 mt-2" onClick={handleStartNew}>
            <Plus className="h-4 w-4" /> Start a New Project
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(v) => !v && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the project and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
