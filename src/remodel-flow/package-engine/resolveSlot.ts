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

/**
 * Build a stable id for synthesized products.
 *
 * Stability contract:
 *   Same BinProduct input → same Product.id across repeated calls,
 *   reloads, and process boundaries. Phase 2 swap UI relies on these
 *   ids as React keys and as primary keys in saved-selection state,
 *   so they MUST be deterministic and resilient to display-name edits.
 *
 * Canonical key precedence:
 *   1. retailer + sku-like tail extracted from `link`
 *   2. URL slug from `link`
 *   3. normalized product name slug
 *   4. numeric index (last-resort suffix only)
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function canonicalProductKey(bp: BinProduct, index: number): string {
  const link = bp.link?.trim();
  if (link) {
    try {
      const u = new URL(link);
      // Prefer the last meaningful path segment (often a SKU or slug).
      const segs = u.pathname.split("/").filter(Boolean);
      const tail = segs[segs.length - 1];
      const retailer = bp.retailer ? slugify(bp.retailer) : slugify(u.hostname);
      if (tail) return `${retailer}-${slugify(tail)}`;
      if (retailer) return retailer;
    } catch {
      // fall through to name-based slug
    }
  }
  if (bp.name) {
    const named = slugify(bp.name);
    if (named) return named;
  }
  return `idx-${index}`;
}

function synthesizeId(packageId: string, categoryId: BinKey, key: string): string {
  return `${packageId}:${categoryId}:${key}`;
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
    id: synthesizeId(packageId, categoryId, canonicalProductKey(bp, index)),
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
        isUnresolved: false,
        alternatives: remaining,
      };
    }
    // Primary unusable AND no usable alternative — explicit unresolved
    // state. Keep `product` as the primary so callers don't crash on a
    // missing field, but downstream UI must gate on `isUnresolved`.
    return {
      categoryId,
      product: primary,
      isFallback: true,
      isUnresolved: true,
      alternatives,
    };
  }

  return {
    categoryId,
    product: primary,
    isFallback: false,
    isUnresolved: false,
    alternatives,
  };
}
