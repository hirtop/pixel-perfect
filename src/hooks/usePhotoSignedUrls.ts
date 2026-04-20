import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PhotoMeta } from "@/contexts/ProjectContext";

export interface ResolvedPhoto {
  id?: string;
  name: string;
  size: number;
  type: string;
  url: string | null;
  status: "ready" | "missing" | "error";
}

/**
 * Resolves project photos into displayable signed URLs.
 * Falls back to preview_url (data URL) when storage_path is missing or signing fails.
 * Used by ProjectSummary, Agreement, and Subcontractor handoff so photos provide
 * operational value beyond the upload screen.
 */
export const usePhotoSignedUrls = (metadata: PhotoMeta[], expiresInSeconds = 60 * 60 * 24) => {
  const [photos, setPhotos] = useState<ResolvedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (metadata.length === 0) {
      setPhotos([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    setPhotos(
      metadata.map((p) => ({
        id: p.id,
        name: p.name,
        size: p.size,
        type: p.type,
        url: p.preview_url ?? null,
        status: p.storage_path || p.preview_url ? "ready" : "missing",
      })),
    );

    (async () => {
      const resolved = await Promise.all(
        metadata.map(async (photo): Promise<ResolvedPhoto> => {
          const base = { id: photo.id, name: photo.name, size: photo.size, type: photo.type };

          if (!photo.storage_path) {
            return {
              ...base,
              url: photo.preview_url ?? null,
              status: photo.preview_url ? "ready" : "missing",
            };
          }

          const { data, error } = await supabase.storage
            .from("bathroom-photos")
            .createSignedUrl(photo.storage_path, expiresInSeconds);

          if (error || !data?.signedUrl) {
            return {
              ...base,
              url: photo.preview_url ?? null,
              status: photo.preview_url ? "ready" : "error",
            };
          }

          return { ...base, url: data.signedUrl, status: "ready" };
        }),
      );

      if (!cancelled) {
        setPhotos(resolved);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [metadata, expiresInSeconds]);

  return { photos, isLoading };
};
