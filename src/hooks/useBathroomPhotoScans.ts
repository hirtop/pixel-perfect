import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PhotoMeta } from "@/contexts/ProjectContext";

export type SignalKey =
  | "visible_water_damage"
  | "ventilation_concern"
  | "plumbing_age_or_condition"
  | "tile_or_grout_condition"
  | "layout_or_access_concern"
  | "electrical_visible_concern";

export interface ScanSignal {
  key: SignalKey;
  status: "concern" | "ok" | "unclear";
  confidence: "low" | "medium" | "high";
  note: string;
}

export interface PhotoScanRow {
  id: string;
  project_id: string;
  photo_id: string;
  storage_path: string;
  status: "pending" | "completed" | "failed";
  model: string | null;
  signals: ScanSignal[];
  overall_summary: string | null;
  error_message: string | null;
  updated_at: string;
}

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  visible_water_damage: "Wet-area waterproofing",
  ventilation_concern: "Ventilation",
  plumbing_age_or_condition: "Plumbing movement / age",
  tile_or_grout_condition: "Tile & grout",
  layout_or_access_concern: "Layout & flow",
  electrical_visible_concern: "Electrical (visible)",
};

/**
 * Fetches and triggers on-demand vision scans for a project's bathroom photos.
 * Builder-style early warnings — never inspection language.
 */
export const useBathroomPhotoScans = (projectId: string | undefined, photos: PhotoMeta[]) => {
  const [scans, setScans] = useState<Record<string, PhotoScanRow>>({});
  const [loading, setLoading] = useState(false);
  const [scanningPhotoIds, setScanningPhotoIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId) {
      setScans({});
      return;
    }
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("bathroom_photo_scans")
      .select("*")
      .eq("project_id", projectId);
    setLoading(false);
    if (fetchErr) {
      console.error("Failed to load scans", fetchErr);
      return;
    }
    const map: Record<string, PhotoScanRow> = {};
    (data || []).forEach((row) => {
      map[row.photo_id] = row as unknown as PhotoScanRow;
    });
    setScans(map);
  }, [projectId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const scanPhoto = useCallback(
    async (photo: PhotoMeta) => {
      if (!projectId || !photo.id || !photo.storage_path) {
        setError("This photo can't be scanned (missing storage path).");
        return;
      }
      setError(null);
      setScanningPhotoIds((prev) => new Set(prev).add(photo.id!));

      try {
        const { data, error: invokeErr } = await supabase.functions.invoke("scan-bathroom-photos", {
          body: {
            project_id: projectId,
            photo_id: photo.id,
            storage_path: photo.storage_path,
          },
        });

        if (invokeErr) {
          console.error("Scan invoke error", invokeErr);
          const msg = invokeErr.message?.includes("429")
            ? "Rate limit reached. Please try again in a moment."
            : invokeErr.message?.includes("402")
              ? "AI credits exhausted. Add credits to continue."
              : "Couldn't run scan. Please try again.";
          setError(msg);
          return;
        }

        if (data?.scan) {
          setScans((prev) => ({ ...prev, [photo.id!]: data.scan }));
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (e) {
        console.error("Scan failed", e);
        setError(e instanceof Error ? e.message : "Scan failed");
      } finally {
        setScanningPhotoIds((prev) => {
          const next = new Set(prev);
          next.delete(photo.id!);
          return next;
        });
      }
    },
    [projectId],
  );

  const scanAll = useCallback(async () => {
    const eligible = photos.filter((p) => p.id && p.storage_path && !scans[p.id]?.signals?.length);
    for (const p of eligible) {
      // Sequential to be gentle with rate limits + give nice progressive UI
      // eslint-disable-next-line no-await-in-loop
      await scanPhoto(p);
    }
  }, [photos, scans, scanPhoto]);

  const rescanAll = useCallback(async () => {
    const eligible = photos.filter((p) => p.id && p.storage_path);
    for (const p of eligible) {
      // eslint-disable-next-line no-await-in-loop
      await scanPhoto(p);
    }
  }, [photos, scanPhoto]);

  return {
    scans,
    loading,
    scanningPhotoIds,
    error,
    scanPhoto,
    scanAll,
    rescanAll,
    refetch,
  };
};
