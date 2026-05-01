/**
 * Catalog product link verification.
 *
 * A "verified" link points directly to a vendor product page, not a category,
 * search, or filter page. Used to gate the public "View Product" button so we
 * never send users to a misleading destination.
 *
 * Heuristic for Ferguson / Build.com:
 *   - /{slug}/s{digits}   → product page  ✅
 *   - /product/summary/{digits} → product page ✅
 *   - /c{digits}, ?facets=, ?f{digits}=, ?q=, /search → category/filter ❌
 *
 * Anything that is not a confidently-shaped product URL is treated as
 * UNVERIFIED so the UI hides the link and shows an allowance note instead.
 */
export const isVerifiedProductLink = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  const path = parsed.pathname;
  const search = parsed.search;

  // Disqualify obvious category/search/filter pages
  if (/\/c\d+(?:\/|$)/i.test(path)) return false;
  if (/\/search(?:\/|$)/i.test(path)) return false;
  if (/facets?=/i.test(search)) return false;
  if (/[?&]f\d+=/i.test(search)) return false;
  if (/[?&]q=/i.test(search)) return false;
  if (path === "/" || path === "") return false;

  // Accept clear product page shapes
  if (/\/s\d{4,}(?:[/?#]|$)/i.test(path)) return true; // /brand-slug/s123456
  if (/\/product\/summary\/\d{4,}/i.test(path)) return true;

  return false;
};

export const ESTIMATED_PRICE_DISCLAIMER =
  "Prices are planning estimates. Final vendor pricing may vary by location, availability, quantity, and account status.";

export const ALLOWANCE_LINK_NOTE =
  "Estimated allowance — product link coming soon.";
