/**
 * Pass 13 — Quiet "Your summary includes" cue for /summary.
 *
 * Phase 1C: surfaces the curated primary vanity for the selected tier.
 * Phase 2B: surfaces the curated primary faucet directly below vanity.
 * Phase 3B: surfaces the curated primary main floor tile directly below faucet.
 * No new top-level section.
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
import {
  getPrimaryFloorTileForTier,
  type CuratedFloorTileTier,
  type FloorTileLook,
  type FloorTileMaterial,
  type FloorTileFinish,
} from "@/data/curatedFloorTiles";

interface SummaryIncludesCueProps {
  className?: string;
  /**
   * Optional selected-tier key. When provided and matches a curated tier,
   * the primary vanity, primary faucet, and primary floor tile for that
   * tier are rendered as compact blocks. Backups, price, link, retailer,
   * SKU are never shown.
   */
  tier?: string;
}

const VANITY_CAVEAT =
  "Countertop and sink included with vanity. Faucet and floor tile included in this package.";

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

// ─── Floor tile display label helpers ──────────────────────────────

const LOOK_PREFIX: Record<FloorTileLook, string> = {
  "stone-look": "Stone-look",
  "marble-look": "Marble-look",
  "concrete-look": "Concrete-look",
  "wood-look": "Wood-look",
  "terrazzo-look": "Terrazzo-look",
  solid: "",
  patterned: "Patterned",
  unknown: "",
};

const MATERIAL_LABEL: Record<FloorTileMaterial, string> = {
  porcelain: "porcelain",
  ceramic: "ceramic",
};

export function getFloorTileLookMaterialLabel(
  look: FloorTileLook,
  material: FloorTileMaterial,
): string {
  const prefix = LOOK_PREFIX[look];
  const m = MATERIAL_LABEL[material];
  if (!prefix) {
    // "Porcelain" or "Ceramic" capitalized
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  return `${prefix} ${m}`;
}

export function getFloorTileSizeLabel(dimensions: string): string {
  // Match patterns like "12 in. x 24 in.", "12x24", "12 x 24"
  const m = dimensions.match(
    /(\d+(?:\.\d+)?)\s*(?:in\.?)?\s*[x×]\s*(\d+(?:\.\d+)?)/i,
  );
  if (!m) return dimensions;
  return `${m[1]} \u00D7 ${m[2]} in.`;
}

const FINISH_LABEL: Record<FloorTileFinish, string> = {
  matte: "Matte finish",
  honed: "Honed finish",
  textured: "Textured finish",
  lappato: "Polished matte finish",
  polished: "Polished finish",
  unknown: "Finish",
};

export function getFloorTileFinishLabel(finish: FloorTileFinish): string {
  return FINISH_LABEL[finish];
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

function FloorTileBlock({ tier }: { tier: CuratedFloorTileTier }) {
  const tile = getPrimaryFloorTileForTier(tier);
  const [imgFailed, setImgFailed] = useState(false);
  if (!tile) return null;

  const lookMaterialLabel = getFloorTileLookMaterialLabel(
    tile.tileLook,
    tile.tileMaterial,
  );
  const sizeLabel = getFloorTileSizeLabel(tile.dimensions);
  const finishLabel = getFloorTileFinishLabel(tile.finish);
  const showImage = !!tile.imageUrl && !imgFailed;

  return (
    <div
      data-testid="summary-includes-floor-tile"
      className="mt-5 pt-5 border-t border-border"
    >
      <h3 className="text-sm font-medium text-foreground mb-3">
        Floor tile in this package
      </h3>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {showImage ? (
            <img
              src={tile.imageUrl}
              alt={tile.cleanedDisplayName}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              data-testid="summary-includes-floor-tile-image-fallback"
              className="text-[10px] text-muted-foreground text-center px-1"
            >
              Floor tile image unavailable.
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-medium text-foreground">
            {tile.cleanedDisplayName}
          </p>
          <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
            <div>{lookMaterialLabel}</div>
            <div>{sizeLabel}</div>
            <div>{finishLabel}</div>
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
          <FloorTileBlock tier={normalizedTier} />
        </>
      )}
    </section>
  );
}
