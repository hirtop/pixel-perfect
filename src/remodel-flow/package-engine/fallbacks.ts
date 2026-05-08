/**
 * Image + product fallback helpers for the Package Engine.
 *
 * Pure utilities. No fetches, no DOM access. Safe to call from
 * resolvers, tests, and SSR/SSG contexts alike.
 */

import type { BinKey, Product } from "./types";

/** Generic neutral placeholder used when no category default is set. */
export const GENERIC_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'>` +
      `<rect width='4' height='3' fill='%23eaeaea'/></svg>`,
  );

/**
 * Optional per-category default image. Intentionally empty for Phase 1 —
 * categories fall through directly to the generic placeholder. Phase 2
 * can populate category-specific fallback assets here without touching
 * any call sites (resolveImage already reads from this map).
 */
export const CATEGORY_DEFAULT_IMAGES: Partial<Record<BinKey, string>> = {};

/**
 * Build the ordered image fallback chain for a product. Returns the
 * first defined entry of:
 *   1. product.image
 *   2. category default image
 *   3. generic placeholder
 *
 * Always returns a non-empty string.
 */
export function resolveImage(product: Pick<Product, "image" | "categoryId">): string {
  if (product.image && product.image.length > 0) return product.image;
  const fallback = CATEGORY_DEFAULT_IMAGES[product.categoryId];
  if (fallback && fallback.length > 0) return fallback;
  return GENERIC_IMAGE_PLACEHOLDER;
}

/**
 * Returns true when a product should be considered usable for rendering.
 *
 * Phase 1 scope: this only checks `availability !== "discontinued"`. It
 * intentionally does NOT verify link health, live stock, price freshness,
 * or retailer reachability — those belong to Phase 2+ enrichment.
 */
export function isProductUsable(product: Pick<Product, "availability">): boolean {
  return product.availability !== "discontinued";
}
