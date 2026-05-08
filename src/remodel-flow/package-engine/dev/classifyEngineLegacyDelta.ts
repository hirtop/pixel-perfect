/**
 * Phase 2.10 — pure delta classifier for the dev-only EngineDiffConsole.
 *
 * Read-only. Never imported by customer-facing code.
 *
 * Classifications:
 *   - "identical"                    name + vendor + price all match
 *   - "curated-only-vendor-mismatch" engine product is curated-only AND
 *                                    the only meaningful differences are
 *                                    vendor / product-family identity
 *   - "pricing-per-Option-A"         only the price differs and the
 *                                    engine carries a confirmed pricing
 *                                    source (retailer / project-allowance)
 *                                    explaining the Option-A reality gap
 *   - "unexplained"                  any other delta
 */

export interface ClassifyInput {
  /** Engine primary fields. */
  engine: {
    name?: string;
    vendor?: string;
    price?: number;
    isCuratedOnly?: boolean;
    pricingSource?: "retailer" | "project-allowance" | "estimated" | "pending";
    enrichedFromLegacyId?: string | null;
  };
  /** Legacy primary fields (may be undefined if no legacy row). */
  legacy?: {
    name?: string;
    vendor?: string;
    price?: number;
  };
}

export type DeltaClassification =
  | "identical"
  | "curated-only-vendor-mismatch"
  | "pricing-per-Option-A"
  | "unexplained";

const norm = (s: string | undefined | null): string =>
  (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

const CONFIRMED_SOURCES = new Set(["retailer", "project-allowance"]);

export function classifyEngineLegacyDelta(input: ClassifyInput): DeltaClassification {
  const e = input.engine ?? {};
  const l = input.legacy ?? {};

  const nameSame = norm(e.name) === norm(l.name);
  const vendorSame = norm(e.vendor) === norm(l.vendor);
  const priceSame = (e.price ?? 0) === (l.price ?? 0);

  if (nameSame && vendorSame && priceSame) return "identical";

  // Curated-only product with no legacy enrichment — vendor/name divergence
  // is expected by design.
  if (e.isCuratedOnly && (e.enrichedFromLegacyId == null)) {
    if (!priceSame && !CONFIRMED_SOURCES.has(String(e.pricingSource))) {
      return "unexplained";
    }
    return "curated-only-vendor-mismatch";
  }

  // Only price differs and pricing source is confirmed (Option A).
  if (nameSame && vendorSame && !priceSame &&
      CONFIRMED_SOURCES.has(String(e.pricingSource))) {
    return "pricing-per-Option-A";
  }

  return "unexplained";
}
