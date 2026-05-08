/**
 * Slot resolver — adapts the existing per-package `Bin`/`BinProduct`
 * data into the canonical `ResolvedSlot` shape used by future UI.
 *
 * Phase 1 contract:
 *  - Given a Bin and its categoryId, produce a primary Product +
 *    ordered alternatives.
 *  - If the primary is unusable (discontinued / missing), substitute
 *    silently from the alternatives chain and flag `isFallback`.
 *  - Pure, synchronous, no fetches.
 */

import type { Bin, BinProduct } from "@/remodel-flow/packages/modern-balanced";
import type {
  BinKey,
  Product,
  ProductBin,
  ResolvedSlot,
} from "./types";
import { isProductUsable } from "./fallbacks";

/** Map a Bin's overall sourcing + price to a coarse ProductBin band. */
function inferBin(price: number | undefined): ProductBin {
  if (price == null || Number.isNaN(price)) return "mid";
  if (price < 300) return "value";
  if (price < 1200) return "mid";
  if (price < 3000) return "high";
  return "luxury";
}

/** Build a stable id for synthesized products. */
function synthesizeId(packageId: string, categoryId: BinKey, index: number): string {
  return `${packageId}:${categoryId}:${index}`;
}

/** Adapt a single BinProduct to the canonical Product shape. */
export function adaptBinProduct(
  packageId: string,
  categoryId: BinKey,
  bp: BinProduct,
  index: number,
  sourcing: "ready" | "placeholder",
): Product {
  const price = typeof bp.price === "number" ? bp.price : undefined;
  return {
    id: synthesizeId(packageId, categoryId, index),
    categoryId,
    name: bp.name,
    price,
    finish: bp.finish,
    styleTags: Array.isArray(bp.style) ? [...bp.style] : [],
    bin: inferBin(price ?? bp.priceRange?.[0]),
    image: bp.image,
    productUrl: bp.link,
    retailerSource: mapRetailer(bp.retailer),
    availability: sourcing === "ready" ? "active" : "unknown",
  };
}

function mapRetailer(retailer?: string): Product["retailerSource"] {
  if (!retailer) return undefined;
  const r = retailer.toLowerCase();
  if (r.includes("home depot")) return "home_depot";
  if (r.includes("ferguson")) return "ferguson";
  if (r.includes("wayfair")) return "wayfair";
  if (r.includes("lowes") || r.includes("lowe's")) return "lowes";
  if (r.includes("build")) return "build_com";
  if (r.includes("signature")) return "signature_hardware";
  return "manual";
}

/**
 * Resolve a Bin into a ResolvedSlot. Substitutes fallback silently
 * when the primary is unusable.
 */
export function resolveSlot(
  packageId: string,
  categoryId: BinKey,
  bin: Bin,
): ResolvedSlot {
  const primary = adaptBinProduct(packageId, categoryId, bin.primary, 0, bin.sourcing);
  const alternatives = bin.backups.map((b, i) =>
    adaptBinProduct(packageId, categoryId, b, i + 1, bin.sourcing),
  );

  // Wire the fallback chain: primary -> first alternative.
  if (alternatives.length > 0) primary.fallbackProductId = alternatives[0].id;
  alternatives.forEach((alt, i) => {
    const next = alternatives[i + 1];
    if (next) alt.fallbackProductId = next.id;
  });

  // If the primary is unusable, swap in the first usable alternative.
  if (!isProductUsable(primary)) {
    const idx = alternatives.findIndex(isProductUsable);
    if (idx >= 0) {
      const fallback = alternatives[idx];
      const remaining = alternatives.filter((_, i) => i !== idx);
      return {
        categoryId,
        product: fallback,
        isFallback: true,
        alternatives: remaining,
      };
    }
  }

  return {
    categoryId,
    product: primary,
    isFallback: false,
    alternatives,
  };
}
