/**
 * Layer 3 — Step 1 + Step 2 helper.
 *
 * Distills bathroom_photo_scans rows into a conservative, additive signal
 * usable by ProjectSnapshot. Builder-honest rules:
 *   - only "concern" status counts (never "ok" or "unclear")
 *   - only medium/high confidence counts (low-confidence concerns are noise)
 *   - Step 1: layout/wet-area concerns feed a soft layout-risk nudge
 *   - Step 2: credible concerns can promote ONE photo-derived cost driver
 *     into the pool (never replaces dimensions/notes-derived drivers)
 *   - we never claim any specific defect — only that a closer look is warranted
 *   - no inspection/code language
 */
import type { PhotoScanRow, ScanSignal, SignalKey } from "@/hooks/useBathroomPhotoScans";
import type { PhotoSignalSummary, PromotedDriver } from "@/data/project-snapshot";

const CREDIBLE_CONFIDENCES: ScanSignal["confidence"][] = ["medium", "high"];

const isCredibleConcern = (sig: ScanSignal | undefined): sig is ScanSignal =>
  !!sig && sig.status === "concern" && CREDIBLE_CONFIDENCES.includes(sig.confidence);

/**
 * Builder-honest driver copy for each promotable signal.
 * Carefully phrased: "photos suggest" / "worth verifying" — never definitive.
 * Plumbing age intentionally omitted — earlier review flagged it as filler.
 */
const DRIVER_COPY: Partial<Record<SignalKey, { label: string; detail: string }>> = {
  visible_water_damage: {
    label: "Wet-area waterproofing",
    detail:
      "Photos suggest existing wet-area wear worth verifying — pan, membrane, or surround work tends to add hidden labor.",
  },
  ventilation_concern: {
    label: "Ventilation upgrade",
    detail:
      "Photos suggest the existing fan or venting may need attention — a code-compliant exhaust path is easy to under-budget.",
  },
  tile_or_grout_condition: {
    label: "Tile & grout scope",
    detail:
      "Photos suggest the existing tile or grout is at end of life — fuller tear-out and re-set is a meaningful labor line.",
  },
  electrical_visible_concern: {
    label: "Electrical updates",
    detail:
      "Photos suggest visible electrical worth verifying — GFCI circuits and dedicated lighting often need refresh in older baths.",
  },
};

/** Priority order when more than one signal is credible — only the top one is promoted. */
const PROMOTION_PRIORITY: SignalKey[] = [
  "visible_water_damage",
  "tile_or_grout_condition",
  "ventilation_concern",
  "electrical_visible_concern",
];

export function summarizePhotoSignals(
  scans: Record<string, PhotoScanRow>,
): PhotoSignalSummary {
  const completed = Object.values(scans).filter((s) => s.status === "completed");

  // Step 1 — layout-risk hits
  let layoutHits = 0;
  let wetAreaHits = 0;

  // Step 2 — count credible hits per promotable signal across all scans
  const hitsByKey: Partial<Record<SignalKey, number>> = {};

  for (const scan of completed) {
    for (const sig of scan.signals ?? []) {
      if (!isCredibleConcern(sig)) continue;
      if (sig.key === "layout_or_access_concern") layoutHits += 1;
      if (sig.key === "visible_water_damage") wetAreaHits += 1;
      hitsByKey[sig.key] = (hitsByKey[sig.key] ?? 0) + 1;
    }
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

  // Step 2 — pick at most ONE driver to promote, by priority order.
  // Cap of 1 keeps the photo signal additive, not dominant.
  const promotedDrivers: PromotedDriver[] = [];
  for (const key of PROMOTION_PRIORITY) {
    if ((hitsByKey[key] ?? 0) > 0 && DRIVER_COPY[key]) {
      promotedDrivers.push({
        key,
        label: DRIVER_COPY[key]!.label,
        detail: DRIVER_COPY[key]!.detail,
      });
      break;
    }
  }

  return { layoutRiskFromPhotos, reasonFragment, promotedDrivers };
}
