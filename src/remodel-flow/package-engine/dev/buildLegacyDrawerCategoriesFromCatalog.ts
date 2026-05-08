/**
 * Phase 2.11 — dev-only helper that builds an EngineCategory-shaped
 * minimal array from the legacy `tieredCatalog`, restricted to the
 * categories MODERN_BALANCED currently opens. This is the "legacy
 * source of truth" the shadow hook diffs engine output against.
 *
 * Read-only. Never imported by customer-facing code paths.
 *
 * Only fills the fields needed by `classifyEngineLegacyDelta`
 * (name, vendor, price). Other EngineCategory fields are stub-filled
 * because the shadow diff never reads them.
 */

import { tieredCatalog, type ProductTier } from "@/data/tiered-catalog";
import type { EngineCategory } from "../buildEngineCategoriesForCustomize";
import type { BinKey } from "../types";

/**
 * Map engine-side BinKey → legacy display category label.
 * Mirrors `BIN_TO_LEGACY_CATEGORY` in buildEngineCategoriesForCustomize.
 */
const BIN_TO_LEGACY_CATEGORY: Partial<Record<BinKey, string>> = {
  vanity: "Vanities",
  sink: "Sinks",
  faucet: "Faucets",
  mirror: "Mirrors",
  showerWallTile: "Shower Wall Tile",
  showerFloorTile: "Shower Floor Tile",
  mainFloorTile: "Main Floor Tile",
  accentTile: "Accent Tile",
  showerDoor: "Shower Doors",
  showerValve: "Shower Valve",
  showerSystem: "Shower Systems",
  bathtub: "Bathtubs",
  tubValve: "Tub Valve",
};

export function buildLegacyDrawerCategoriesFromCatalog(
  binKeys: readonly BinKey[],
  tier: ProductTier = "Balanced",
): EngineCategory[] {
  const out: EngineCategory[] = [];
  for (const binKey of binKeys) {
    const categoryName = BIN_TO_LEGACY_CATEGORY[binKey];
    if (!categoryName) continue;
    const rows = tieredCatalog.filter(
      (p) => p.category === categoryName && p.tier === tier,
    );
    if (rows.length === 0) continue;
    const primary = rows.find((p) => p.isDefault) ?? rows[0];
    const alts = rows.filter((p) => p.id !== primary.id);
    out.push({
      name: categoryName,
      selected: primary.name,
      selectedId: primary.id,
      reason: "",
      price: primary.price,
      basePrice: primary.price,
      vendor: primary.vendor,
      affiliateUrl: primary.affiliateUrl,
      laborDelta: 0,
      alternatives: alts.map((a) => ({
        id: a.id,
        name: a.name,
        desc: "",
        vendor: a.vendor,
        price: a.price,
        laborDelta: 0,
        affiliateUrl: a.affiliateUrl,
      })),
      _engine: {
        binKey,
        isFallback: false,
        isUnresolved: false,
        enrichedFromLegacyId: null,
        isCuratedOnly: false,
      },
    });
  }
  return out;
}
