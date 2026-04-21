import { useMemo } from "react";
import { ScanLine, Sparkles, Loader2, AlertTriangle, CheckCircle2, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBathroomPhotoScans, SIGNAL_LABELS, type ScanSignal, type SignalKey } from "@/hooks/useBathroomPhotoScans";
import { usePhotoSignedUrls } from "@/hooks/usePhotoSignedUrls";
import type { PhotoMeta } from "@/contexts/ProjectContext";

interface Props {
  projectId: string | undefined;
  photos: PhotoMeta[];
}

const statusConfig: Record<ScanSignal["status"], { icon: typeof AlertTriangle; label: string; className: string }> = {
  concern: {
    icon: AlertTriangle,
    label: "Worth verifying",
    className: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900/50",
  },
  ok: {
    icon: CheckCircle2,
    label: "Looks ok in photo",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/50",
  },
  unclear: {
    icon: HelpCircle,
    label: "Unclear from photo",
    className: "text-muted-foreground bg-muted/50 border-border",
  },
};

const confidenceLabel = (c: ScanSignal["confidence"]) =>
  c === "high" ? "High confidence" : c === "medium" ? "Medium confidence" : "Low confidence";

const SIGNAL_ORDER: SignalKey[] = [
  "visible_water_damage",
  "ventilation_concern",
  "plumbing_age_or_condition",
  "tile_or_grout_condition",
  "layout_or_access_concern",
  "electrical_visible_concern",
];

const formatRelative = (iso?: string) => {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const BathroomRiskScan = ({ projectId, photos }: Props) => {
  const eligiblePhotos = useMemo(() => photos.filter((p) => p.id && p.storage_path), [photos]);
  const { scans, loading, scanningPhotoIds, error, scanPhoto, scanAll, rescanAll } = useBathroomPhotoScans(projectId, eligiblePhotos);
  const { photos: resolvedPhotos } = usePhotoSignedUrls(eligiblePhotos);

  const scannedCount = Object.values(scans).filter((s) => s.status === "completed").length;
  const failedCount = Object.values(scans).filter((s) => s.status === "failed").length;
  const totalCount = eligiblePhotos.length;
  const allScanned = totalCount > 0 && scannedCount === totalCount;
  const isAnyScanning = scanningPhotoIds.size > 0;
  const hasAnyScan = scannedCount > 0 || failedCount > 0;

  if (totalCount === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Photo Risk Scan</p>
        <h2 className="font-heading text-lg text-foreground mt-1">No photos to scan yet</h2>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          Upload bathroom photos first. Then BOBOX can flag things worth verifying before you commit to a scope.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary flex items-center gap-1.5">
            <ScanLine className="h-3 w-3" /> Photo Risk Scan
          </p>
          <h2 className="font-heading text-lg text-foreground mt-1">Things worth verifying before you commit</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            BOBOX flags red-flag heuristics a builder would want to look at on-site. Not an inspection, not a code review — just a heads-up based on what's visible in your photos.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {hasAnyScan && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {scannedCount} / {totalCount} reviewed
              {failedCount > 0 && (
                <span className="text-destructive ml-1">· {failedCount} failed</span>
              )}
            </span>
          )}
          <Button
            size="sm"
            onClick={() => void scanAll()}
            disabled={isAnyScanning || loading || allScanned}
            className="rounded-lg"
          >
            {isAnyScanning ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Reviewing…</>
            ) : allScanned ? (
              <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> All reviewed</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Review {scannedCount > 0 ? "remaining" : "photos"}</>
            )}
          </Button>
          {hasAnyScan && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void rescanAll()}
              disabled={isAnyScanning || loading}
              className="rounded-lg text-xs text-muted-foreground hover:text-foreground"
              title="Re-runs the AI review on every photo, replacing cached results. Useful after photo updates or scan tuning."
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isAnyScanning ? "animate-spin" : ""}`} />
              Re-review all
            </Button>
          )}
        </div>
      </div>

      {hasAnyScan && (
        <p className="text-[10px] text-muted-foreground/80 -mt-2">
          Re-review refreshes cached scan results — use after updating photos or when scan tone has been tuned.
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Per-photo results */}
      <div className="space-y-4">
        {eligiblePhotos.map((photo, i) => {
          const scan = photo.id ? scans[photo.id] : undefined;
          const isScanning = photo.id ? scanningPhotoIds.has(photo.id) : false;
          const resolved = resolvedPhotos[i];

          return (
            <div key={photo.id ?? i} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary/60 flex-shrink-0 border border-border">
                  {resolved?.url ? (
                    <img src={resolved.url} alt={photo.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{photo.name}</p>
                      {scan?.overall_summary && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{scan.overall_summary}</p>
                      )}
                      {!scan && !isScanning && (
                        <p className="text-xs text-muted-foreground mt-1">Not reviewed yet.</p>
                      )}
                      {isScanning && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" /> Reviewing photo…
                        </p>
                      )}
                      {scan?.status === "failed" && (
                        <p className="text-xs text-destructive mt-1">{scan.error_message || "Couldn't review this photo."}</p>
                      )}
                    </div>
                    {scan?.status === "completed" && photo.id && (
                      <button
                        type="button"
                        onClick={() => void scanPhoto(photo)}
                        disabled={isScanning}
                        className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 flex-shrink-0"
                        aria-label={`Re-review ${photo.name}`}
                      >
                        <RefreshCw className="h-3 w-3" /> Re-review
                      </button>
                    )}
                    {!scan && !isScanning && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void scanPhoto(photo)}
                        className="h-7 px-2.5 text-xs rounded-md flex-shrink-0"
                      >
                        Review
                      </Button>
                    )}
                  </div>

                  {/* Signal chips */}
                  {scan?.status === "completed" && scan.signals?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                      {SIGNAL_ORDER.map((key) => {
                        const sig = scan.signals.find((s) => s.key === key);
                        if (!sig) return null;
                        const cfg = statusConfig[sig.status];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={key}
                            className={`rounded-md border px-2.5 py-1.5 text-[11px] leading-snug ${cfg.className}`}
                            title={`${cfg.label} · ${confidenceLabel(sig.confidence)}`}
                          >
                            <div className="flex items-start gap-1.5">
                              <Icon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold">{SIGNAL_LABELS[key]}</p>
                                <p className="opacity-90 mt-0.5">{sig.note}</p>
                                <p className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">
                                  {cfg.label} · {confidenceLabel(sig.confidence)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
        These are red-flag heuristics based only on what's visible in your photos — not an inspection, not a code review, and not a substitute for an on-site visit by a licensed pro. Use them to ask better questions before you commit. Remember: the most expensive bathroom decisions are usually the ones that move water.
      </p>
    </section>
  );
};

export default BathroomRiskScan;
