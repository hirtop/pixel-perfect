/**
 * Layer 3 — Step 1 helper.
 *
 * Distills bathroom_photo_scans rows into a conservative, additive signal
 * usable by ProjectSnapshot. Builder-honest rules:
 *   - only "concern" status counts (never "ok" or "unclear")
 *   - only medium/high confidence counts (low-confidence concerns are noise)
 *   - only the two layout/wet-area signals feed Step 1
 *     (cost-driver promotion + tier bumps come in later steps)
 *   - we never claim any specific defect — only that a closer look is warranted
 */
import type { PhotoScanRow, ScanSignal } from "@/hooks/useBathroomPhotoScans";
import type { PhotoSignalSummary } from "@/data/project-snapshot";

const CREDIBLE_CONFIDENCES: ScanSignal["confidence"][] = ["medium", "high"];

const isCredibleConcern = (sig: ScanSignal | undefined): sig is ScanSignal =>
  !!sig && sig.status === "concern" && CREDIBLE_CONFIDENCES.includes(sig.confidence);

export function summarizePhotoSignals(
  scans: Record<string, PhotoScanRow>,
): PhotoSignalSummary {
  const completed = Object.values(scans).filter((s) => s.status === "completed");

  let layoutHits = 0;
  let wetAreaHits = 0;

  for (const scan of completed) {
    const layoutSig = scan.signals?.find((s) => s.key === "layout_or_access_concern");
    const wetSig = scan.signals?.find((s) => s.key === "visible_water_damage");
    if (isCredibleConcern(layoutSig)) layoutHits += 1;
    if (isCredibleConcern(wetSig)) wetAreaHits += 1;
  }

  const layoutRiskFromPhotos = layoutHits > 0 || wetAreaHits > 0;

  let reasonFragment: string | undefined;
  if (layoutRiskFromPhotos) {
    if (layoutHits > 0 && wetAreaHits > 0) {
      reasonFragment = "photos suggest a tight layout and wet-area concerns worth verifying";
    } else if (layoutHits > 0) {
      reasonFragment = "photos suggest a tight or awkward layout worth verifying";
    } else {
      reasonFragment = "photos show wet-area concerns worth verifying";
    }
  }

  return { layoutRiskFromPhotos, reasonFragment };
}
