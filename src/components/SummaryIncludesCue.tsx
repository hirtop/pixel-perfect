/**
 * Pass 13 — Quiet "Your summary includes" cue for /summary.
 *
 * Phase 1C: optionally surfaces the curated primary vanity for the selected
 * tier inside this same Q1 area. No new top-level section is added.
 */

import { useState } from "react";
import {
  getPrimaryVanityForTier,
  type CuratedVanityTier,
} from "@/data/curatedVanities";

interface SummaryIncludesCueProps {
  className?: string;
  /**
   * Optional selected-tier key. When provided and matches a curated tier,
   * the primary vanity for that tier is rendered as a compact block below
   * the bullets. Backups, price, link, retailer, SKU are never shown.
   */
  tier?: string;
}

const VANITY_CAVEAT = "Countertop and sink included. Faucet selected separately.";

const SINK_TYPE_LABEL: Record<string, string> = {
  integrated: "Integrated sink",
  "drop-in": "Drop-in sink",
  vessel: "Vessel sink",
  undermount: "Undermount sink",
  none: "No sink",
};

function normalizeTier(tier: string | undefined): CuratedVanityTier | null {
  if (!tier) return null;
  const t = tier.toLowerCase();
  if (t === "essential" || t === "balanced" || t === "premium") return t;
  return null;
}

function VanityBlock({ tier }: { tier: CuratedVanityTier }) {
  const vanity = getPrimaryVanityForTier(tier);
  const [imgFailed, setImgFailed] = useState(false);
  if (!vanity) return null;

  const sinkLabel = SINK_TYPE_LABEL[vanity.sinkType] ?? "Sink";
  const showImage = !!vanity.imageUrl && !imgFailed;

  return (
    <div
      data-testid="summary-includes-vanity"
      className="mt-5 pt-5 border-t border-border"
    >
      <h3 className="text-sm font-medium text-foreground mb-3">
        Vanity in this package
      </h3>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {showImage ? (
            <img
              src={vanity.imageUrl as string}
              alt={vanity.cleanedDisplayName}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              data-testid="summary-includes-vanity-image-fallback"
              className="text-[10px] text-muted-foreground text-center px-1"
            >
              Vanity image unavailable.
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-foreground">
            {vanity.cleanedDisplayName}
          </p>
          <ul className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
            <li>Finish: {vanity.colorFinish}</li>
            <li>Countertop: {vanity.countertopMaterial}</li>
            <li>Sink: {sinkLabel}</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            {VANITY_CAVEAT}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SummaryIncludesCue({
  className,
  tier,
}: SummaryIncludesCueProps) {
  const normalizedTier = normalizeTier(tier);

  return (
    <section
      data-testid="summary-includes-cue"
      className={`rounded-xl border border-border bg-card/50 p-5 ${className ?? ""}`}
      aria-labelledby="summary-includes-cue-heading"
    >
      <h2
        id="summary-includes-cue-heading"
        className="text-sm font-medium text-foreground mb-2"
      >
        Your summary includes
      </h2>
      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
        <li>Selected package and style direction</li>
        <li>Saved product choices</li>
        <li>Project notes and dimensions, when provided</li>
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        Review everything before sharing this summary.
      </p>
      {normalizedTier && <VanityBlock tier={normalizedTier} />}
    </section>
  );
}
