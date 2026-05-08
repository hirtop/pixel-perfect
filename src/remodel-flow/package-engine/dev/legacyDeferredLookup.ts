/**
 * Phase 2.10 — pure legacy lookup for deferred bins (Bathtubs, Tub Valve).
 *
 * Read-only. Only used by the dev-only EngineDiffConsole so we can
 * surface the legacy primary + alternatives count for bins that
 * MODERN_BALANCED defers to the legacy fallback path.
 */

import { tieredCatalog, type ProductTier } from "@/data/tiered-catalog";

export interface LegacyDeferredSummary {
  legacyCategoryName: string;
  legacyPrimary: {
    name: string;
    vendor: string;
    price: number;
    affiliateUrl?: string;
  } | null;
  legacyAlternativesCount: number;
}

export function lookupLegacyDeferredBin(
  legacyCategoryName: string,
  tier: ProductTier = "Balanced",
): LegacyDeferredSummary {
  const rows = tieredCatalog.filter(
    (p) => p.category === legacyCategoryName && p.tier === tier,
  );
  const primary = rows.find((p) => p.isDefault) ?? rows[0] ?? null;
  const altCount = primary ? rows.filter((p) => p.id !== primary.id).length : 0;
  return {
    legacyCategoryName,
    legacyPrimary: primary
      ? {
          name: primary.name,
          vendor: primary.vendor,
          price: primary.price,
          affiliateUrl: primary.affiliateUrl,
        }
      : null,
    legacyAlternativesCount: altCount,
  };
}
