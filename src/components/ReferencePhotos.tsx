import { useState } from "react";
import { ImageIcon, FileImage, Loader2, Trash2 } from "lucide-react";
import { usePhotoSignedUrls } from "@/hooks/usePhotoSignedUrls";
import { useDeletePhoto } from "@/hooks/useDeletePhoto";
import type { PhotoMeta } from "@/contexts/ProjectContext";
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

interface Props {
  metadata: PhotoMeta[];
  notes?: string;
  variant?: "full" | "compact";
  /** When true, render a small delete affordance per photo (with confirmation). */
  allowDelete?: boolean;
}

/**
 * On-screen "Reference Photos" section used in ProjectSummary and Subcontractors.
 * Honest framing: builder/sub-friendly reference, not an inspection.
 */
const ReferencePhotos = ({ metadata, notes, variant = "full", allowDelete = false }: Props) => {
  const { photos, isLoading } = usePhotoSignedUrls(metadata);
  const { deletePhoto, deletingId } = useDeletePhoto();
  const [pendingDelete, setPendingDelete] = useState<PhotoMeta | null>(null);

  if (metadata.length === 0 && !notes?.trim()) return null;

  const trimmedNotes = notes?.trim() || "";

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await deletePhoto(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <>
      <section
        aria-label="Reference photos"
        className="rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Site Reference
            </p>
            <h2 className="font-heading text-lg text-foreground mt-1">
              {variant === "compact" ? "Photos for your pros" : "Reference photos & notes"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Homeowner-supplied reference for builders. Not an inspection or site survey.
            </p>
          </div>
          {metadata.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {metadata.length} photo{metadata.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {metadata.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {photos.map((photo, i) => {
              const sourceMeta = metadata[i];
              const trackingId = sourceMeta?.id ?? sourceMeta?.storage_path ?? sourceMeta?.name;
              const isDeleting = deletingId === trackingId;
              return (
                <div
                  key={photo.id ?? i}
                  className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-secondary/40"
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <FileImage className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        Unavailable
                      </span>
                    </div>
                  )}

                  {allowDelete && sourceMeta && (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setPendingDelete(sourceMeta)}
                      aria-label={`Remove ${photo.name}`}
                      className="absolute top-1.5 right-1.5 rounded-full bg-foreground/75 backdrop-blur-sm p-1.5 text-background opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 hover:bg-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {trimmedNotes && (
          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ImageIcon className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Your notes
              </p>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {trimmedNotes}
            </p>
          </div>
        )}
      </section>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from your summary, agreement PDF, and subcontractor handoffs. Any
              risk-scan results for this photo will also be cleared. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReferencePhotos;
