/**
 * Catalog loader — funnels the live raw catalog through the package-engine
 * `normalizeProduct` adapter without mutating the source data.
 *
 * The raw `tieredCatalog` export remains the source of truth and is
 * intentionally NOT modified. This loader is additive and read-only.
 */

import { tieredCatalog, type TieredProduct } from "@/data/tiered-catalog";
import { normalizeProduct, type NormalizedProduct } from "./productAdapter";
import type { BinKey, CanonicalStyleId } from "./types";

/**
 * Optional, additive style hints applied during normalization.
 *
 * Hard rules:
 *  - Only `classic | modern | spa | minimal` are allowed here.
 *  - Tags must be obvious from the existing product data (vendor, finish,
 *    spec, name). When in doubt, leave the product untagged so it falls
 *    back to `styles: []` in the normalized view.
 *  - Do NOT invent style tags for products we have not seen.
 */
const PRODUCT_STYLE_HINTS: Record<string, CanonicalStyleId[]> = {
  // Vanities — Balanced (visible/curated)
  "bal-vanity-01": ["modern", "minimal"], // Wall-mounted natural oak, clean lines
  "bal-vanity-02": ["classic"],            // Espresso freestanding, traditional profile
  "bal-vanity-03": ["classic"],            // Walnut double-basin freestanding

  // Sinks — undermount white porcelain reads as both modern + classic
  "bal-sink-01": ["modern", "classic", "minimal"],
  "bal-sink-02": ["modern", "minimal"],   // Rectangular clean lines
  "bal-sink-03": ["classic"],              // Archer oval, traditional profile
};

/**
 * Returns the live catalog mapped through `normalizeProduct`, with optional
 * additive style tags applied for the small set of products we can tag
 * safely. The raw object is preserved untouched on `.raw`.
 */
export function getNormalizedCatalog(): NormalizedProduct[] {
  return tieredCatalog.map((row: TieredProduct) => {
    const normalized = normalizeProduct(row);
    const hints = PRODUCT_STYLE_HINTS[row.id];
    if (hints && hints.length && normalized.styles.length === 0) {
      return { ...normalized, styles: [...hints] };
    }
    return normalized;
  });
}

/** Lookup helpers (pure, derived from `getNormalizedCatalog`). */
export function getNormalizedByBinKey(binKey: BinKey): NormalizedProduct[] {
  return getNormalizedCatalog().filter((p) => p.binKey === binKey);
}

export function getNormalizedById(id: string): NormalizedProduct | undefined {
  return getNormalizedCatalog().find((p) => p.id === id);
}
