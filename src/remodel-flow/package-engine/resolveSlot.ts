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
  // Last-resort fallback. NOTE: `idx-${index}` is dev-only and unstable
  // across reorderings of a bin's backups — never persist these ids.
  return `idx-${index}`;
}

function synthesizeId(packageId: string, categoryId: BinKey, key: string): string {
  return `${packageId}:${categoryId}:${key}`;
}

/* ─── Phase 2.5: intrinsic-field derivation ─────────────────────────
 * Engine `Product` now owns intrinsic properties (vendor, widthInches,
 * mountType, faucetHoles, unitPrice, estimatedProjectPrice). These are
 * derived from the source `BinProduct` (name, type, retailer, price,
 * priceRange) without consulting any external catalog.
 */

const VENDOR_FROM_NAME: Array<{ re: RegExp; vendor: string }> = [
  { re: /\bdelta\b/i, vendor: "Delta" },
  { re: /\bmoen\b/i, vendor: "Moen" },
  { re: /\bkohler\b/i, vendor: "Kohler" },
  { re: /\bdaltile\b/i, vendor: "Daltile" },
  { re: /\bbedrosians\b/i, vendor: "Bedrosians" },
  { re: /\bdreamline\b/i, vendor: "DreamLine" },
  { re: /\bsignature hardware\b/i, vendor: "Signature Hardware" },
  { re: /\bvigo\b/i, vendor: "VIGO" },
  { re: /\bkraus\b/i, vendor: "KRAUS" },
  { re: /\bfranklin brass\b/i, vendor: "Franklin Brass" },
  { re: /\bswiss madison\b/i, vendor: "Swiss Madison" },
  { re: /\bamerican standard\b/i, vendor: "American Standard" },
  { re: /\bmerola tile\b/i, vendor: "Merola Tile" },
];

function deriveVendor(bp: BinProduct): string | undefined {
  // Retailer is a storefront, not a vendor — only use it as a last resort
  // when the brand can't be parsed from the name.
  for (const { re, vendor } of VENDOR_FROM_NAME) {
    if (re.test(bp.name)) return vendor;
  }
  return undefined;
}

function deriveWidthInches(bp: BinProduct): number | undefined {
  // Match patterns like  36"   |  48 in.   |  48-inch
  const m = bp.name.match(/(\d{2,3})\s*(?:["”]|in\b|inch\b|-inch)/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return undefined;
  // Vanity-relevant widths only — ignore tile-format inches like 12 or 24.
  return n >= 24 && n <= 96 ? n : undefined;
}

function deriveFaucetHoles(bp: BinProduct): 0 | 1 | 3 | undefined {
  const t = (bp.type ?? "").toLowerCase();
  const n = bp.name.toLowerCase();
  if (t === "single_hole" || /single[\s-]?hole/.test(n)) return 1;
  if (t === "widespread" || /widespread/.test(n)) return 3;
  if (t === "centerset" || /centerset/.test(n)) return 3;
  if (t === "wall_mount" || /wall[\s-]?mount/.test(n)) return 0;
  return undefined;
}

function deriveMountType(
  categoryId: BinKey,
  bp: BinProduct,
  binIntent?: string,
): Product["mountType"] | undefined {
  const n = bp.name.toLowerCase();
  const intent = (binIntent ?? "").toLowerCase();
  if (categoryId === "vanity") {
    if (/floating|wall[\s-]?hung|wall[\s-]?mounted/.test(n)) return "wall";
    if (/floating|wall[\s-]?hung|wall[\s-]?mounted/.test(intent)) return "wall";
    if (/freestanding|free[\s-]?standing/.test(n)) return "floor";
  }
  if (categoryId === "sink") {
    if (/undermount/.test(n)) return "undermount";
    if (/drop[\s-]?in/.test(n)) return "drop-in";
    if (/wall[\s-]?mount/.test(n)) return "wall";
  }
  return undefined;
}

/** Adapt a single BinProduct to the canonical Product shape. */
export function adaptBinProduct(
  packageId: string,
  categoryId: BinKey,
  bp: BinProduct,
  index: number,
  sourcing: "ready" | "placeholder",
  binIntent?: string,
): Product {
  const unitPrice =
    typeof bp.price === "number" ? bp.price : bp.priceRange?.[0];
  // For SF-priced materials (tile bins), `bp.priceRange[1]` often carries
  // a project allowance (per the modern-balanced spec). We only treat the
  // upper bound as an estimated project price for tile bins.
  const isTileBin =
    categoryId === "showerWallTile" ||
    categoryId === "showerFloorTile" ||
    categoryId === "mainFloorTile" ||
    categoryId === "accentTile";
  const estimatedProjectPrice =
    isTileBin && bp.priceRange && bp.priceRange[1] !== unitPrice
      ? bp.priceRange[1]
      : undefined;
  const canonicalKey = canonicalProductKey(bp, index);
  return {
    id: synthesizeId(packageId, categoryId, canonicalKey),
    categoryId,
    name: bp.name,
    price: unitPrice,
    finish: bp.finish,
    styleTags: Array.isArray(bp.style) ? [...bp.style] : [],
    bin: inferBin(unitPrice ?? bp.priceRange?.[0]),
    image: bp.image,
    productUrl: bp.link,
    retailerSource: mapRetailer(bp.retailer),
    availability: sourcing === "ready" ? "active" : "unknown",
    // Phase 2.5 intrinsic fields
    vendor: deriveVendor(bp),
    widthInches: deriveWidthInches(bp),
    mountType: deriveMountType(categoryId, bp, binIntent),
    faucetHoles: deriveFaucetHoles(bp),
    unitPrice,
    estimatedProjectPrice,
    canonicalKey,
    // Curated-only flag: every modern-balanced product currently has no
    // tieredCatalog correspondent (different vendor mix). Marked by
    // default for the curated package; the parity layer reads this.
    isCuratedOnly: packageId === "modern-balanced",
  };
}

/**
 * Total price helper — mirrors `getProductTotalPrice` from the legacy
 * tieredCatalog so engine + legacy share one pricing semantic.
 */
export function getEngineProductTotalPrice(
  product: Pick<Product, "unitPrice" | "estimatedProjectPrice" | "price">,
): number {
  return (
    product.estimatedProjectPrice ??
    product.unitPrice ??
    product.price ??
    0
  );
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
