/**
 * Pass 13 — Quiet "Your summary includes" cue for /summary.
 *
 * Phase 1C: surfaces the curated primary vanity for the selected tier.
 * Phase 2B: surfaces the curated primary faucet for the selected tier
 * directly below the vanity block. No new top-level section.
 */

import { useState } from "react";
import {
  getPrimaryVanityForTier,
  type CuratedVanityTier,
} from "@/data/curatedVanities";
import {
  getPrimaryFaucetForTier,
  type CuratedFaucetTier,
  type FaucetType,
} from "@/data/curatedFaucets";

interface SummaryIncludesCueProps {
  className?: string;
  /**
   * Optional selected-tier key. When provided and matches a curated tier,
   * the primary vanity and primary faucet for that tier are rendered as
   * compact blocks. Backups, price, link, retailer, SKU are never shown.
   */
  tier?: string;
}

const VANITY_CAVEAT =
  "Countertop and sink included with vanity. Faucet included in this package.";

const SINK_TYPE_LABEL: Record<string, string> = {
  integrated: "Integrated sink",
  "drop-in": "Drop-in sink",
  vessel: "Vessel sink",
  undermount: "Undermount sink",
  none: "No sink",
};

const FAUCET_TYPE_LABEL: Record<FaucetType, string> = {
  "single-hole": "Single-hole faucet",
  centerset: "Centerset faucet",
  widespread: "Widespread faucet",
  "wall-mount": "Wall-mount faucet",
  vessel: "Vessel faucet",
};

function normalizeTier(
  tier: string | undefined,
): CuratedVanityTier | null {
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
          <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
            <div>Finish: {vanity.colorFinish}</div>
            <div>Countertop: {vanity.countertopMaterial}</div>
            <div>Sink: {sinkLabel}</div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {VANITY_CAVEAT}
          </p>
        </div>
      </div>
    </div>
  );
}

function FaucetBlock({ tier }: { tier: CuratedFaucetTier }) {
  const faucet = getPrimaryFaucetForTier(tier);
  const [imgFailed, setImgFailed] = useState(false);
  if (!faucet) return null;

  const typeLabel = FAUCET_TYPE_LABEL[faucet.faucetType];
  const showImage = !!faucet.imageUrl && !imgFailed;

  return (
    <div
      data-testid="summary-includes-faucet"
      className="mt-5 pt-5 border-t border-border"
    >
      <h3 className="text-sm font-medium text-foreground mb-3">
        Faucet in this package
      </h3>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {showImage ? (
            <img
              src={faucet.imageUrl}
              alt={faucet.cleanedDisplayName}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              data-testid="summary-includes-faucet-image-fallback"
              className="text-[10px] text-muted-foreground text-center px-1"
            >
              Faucet image unavailable.
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-foreground">
            {faucet.cleanedDisplayName}
          </p>
          <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
            <div>Finish: {faucet.finish}</div>
            <div>{typeLabel}</div>
          </div>
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
      {normalizedTier && (
        <>
          <VanityBlock tier={normalizedTier} />
          <FaucetBlock tier={normalizedTier} />
        </>
      )}
    </section>
  );
}
