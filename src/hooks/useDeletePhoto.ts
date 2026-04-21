import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProject, type PhotoMeta } from "@/contexts/ProjectContext";

/**
 * Deletes a bathroom photo end-to-end:
 *  1. Removes the file from the `bathroom-photos` storage bucket (if uploaded)
 *  2. Removes any persisted Layer-2 risk scan rows for that photo_id
 *  3. Removes the photo from project.photos.metadata and saves the project
 *
 * Used by both UploadPhotos (primary management) and ProjectSummary (lightweight cleanup).
 */
export const useDeletePhoto = () => {
  const { project, updateProject, saveProject } = useProject();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletePhoto = useCallback(
    async (photo: PhotoMeta) => {
      const trackingId = photo.id ?? photo.storage_path ?? photo.name;
      setDeletingId(trackingId);

      try {
        // 1. Storage cleanup (best-effort)
        if (photo.storage_path) {
          const { error: storageErr } = await supabase.storage
            .from("bathroom-photos")
            .remove([photo.storage_path]);
          if (storageErr) {
            console.error("Storage delete error:", storageErr);
          }
        }

        // 2. Risk-scan cleanup (best-effort, RLS scoped to the user's project)
        if (photo.id && project.id) {
          const { error: scanErr } = await supabase
            .from("bathroom_photo_scans")
            .delete()
            .eq("project_id", project.id)
            .eq("photo_id", photo.id);
          if (scanErr) {
            console.error("Scan delete error:", scanErr);
          }
        }

        // 3. Remove from project metadata + persist
        const nextMetadata = project.photos.metadata.filter((p) => {
          if (photo.id && p.id) return p.id !== photo.id;
          if (photo.storage_path && p.storage_path) return p.storage_path !== photo.storage_path;
          return p.name !== photo.name || p.size !== photo.size;
        });
        const nextPhotos = { ...project.photos, metadata: nextMetadata };
        updateProject({ photos: nextPhotos });

        await saveProject({
          silent: true,
          projectOverride: { ...project, photos: nextPhotos },
        });

        toast.success("Photo removed");
        return true;
      } catch (err) {
        console.error("Failed to delete photo", err);
        toast.error("Couldn't remove photo", { description: "Please try again." });
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [project, updateProject, saveProject],
  );

  return { deletePhoto, deletingId };
};
