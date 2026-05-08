/**
 * Canonical package-engine types.
 *
 * Additive — does NOT replace `src/remodel-flow/types.ts`.
 */

/** Canonical tier slugs. Always lowercase. */
export type Tier = "essential" | "balanced" | "premium";

export const TIERS: readonly Tier[] = ["essential", "balanced", "premium"] as const;

/**
 * Canonical style ids. Superset of the legacy 4-style flow `StyleId`.
 */
export type CanonicalStyleId =
  | "classic"
  | "modern"
  | "spa"
  | "minimal"
  | "coastal"
  | "farmhouse"
  | "transitional"
  | "contemporary"
  | "traditional";

export const CANONICAL_STYLES: readonly CanonicalStyleId[] = [
  "classic",
  "modern",
  "spa",
  "minimal",
  "coastal",
  "farmhouse",
  "transitional",
  "contemporary",
  "traditional",
] as const;

/** Canonical PackageId, formatted as `${style}-${tier}`. */
export type PackageId = `${CanonicalStyleId}-${Tier}`;

/**
 * Stable product-bin slugs. Reconciled to the 16 real catalog categories
 * (see `src/data/products.ts#PRODUCT_CATEGORIES`).
 *
 * Aliases like "showerWalls", "showerGlass", "showerTrim", "showerNiche",
 * "accessories" are NOT canonical outputs. They may only appear as input
 * aliases in `normalizeBinKey`.
 */
export type BinKey =
  | "vanity"
  | "faucet"
  | "sink"
  | "mirror"
  | "lighting"
  | "toilet"
  | "bathtub"
  | "tubValve"
  | "showerValve"
  | "showerSystem"
  | "showerDoor"
  | "showerWallTile"
  | "showerFloorTile"
  | "mainFloorTile"
  | "accentTile"
  | "heatedFloor";

export const BIN_KEYS: readonly BinKey[] = [
  "vanity",
  "faucet",
  "sink",
  "mirror",
  "lighting",
  "toilet",
  "bathtub",
  "tubValve",
  "showerValve",
  "showerSystem",
  "showerDoor",
  "showerWallTile",
  "showerFloorTile",
  "mainFloorTile",
  "accentTile",
  "heatedFloor",
] as const;

/**
 * Lifecycle status of a package in the registry.
 *
 *  - `curated`     — fully sourced, real SKUs, safe to expose in finished UI.
 *  - `partial`     — some bins curated, others placeholder. Internal only.
 *  - `placeholder` — spec exists but no real SKUs. Internal only.
 *
 * Note: legacy generic-tier ids (essential/balanced/premium) are NOT
 * package statuses anymore — they live in `LEGACY_ROUTE_ALIASES`.
 */
export type PackageStatus = "curated" | "partial" | "placeholder";

/* ─── Phase 1: Canonical Package / Slot / Product shape ──────────────
 *
 * Additive layer over the existing per-package `Bin`/`BinProduct` data
 * (see src/remodel-flow/packages/*.ts). The resolver adapts those rich
 * specs into this canonical shape so the rest of the app can read a
 * single uniform interface regardless of source (local seed today,
 * Supabase tomorrow). No existing types are renamed or removed.
 */

/** Coarse price/quality band, decoupled from package tier. */
export type ProductBin = "value" | "mid" | "high" | "luxury";

/** Availability lifecycle for a single product. */
export type ProductAvailability = "active" | "discontinued" | "unknown";

/** Where the product was sourced — useful for future affiliate work. */
export type RetailerSource =
  | "home_depot"
  | "wayfair"
  | "lowes"
  | "build_com"
  | "ferguson"
  | "signature_hardware"
  | "manual"
  | "unknown";

/** Canonical product record consumed by UI. Pure presentation data. */
export interface Product {
  /** Stable id within the catalog. May be synthesized from package + bin. */
  id: string;
  /** Bin/category this product belongs to. */
  categoryId: BinKey;
  name: string;
  brand?: string;
  /**
   * Legacy unit price field. Kept for backward compatibility with code that
   * read `product.price` before Phase 2.5. New code should use `unitPrice`
   * (vendor unit price) and `estimatedProjectPrice` (project allowance for
   * SF-priced materials), then call `getEngineProductTotalPrice()`.
   */
  price?: number;
  finish?: string;
  /** Free-form style tags. Compatible with `ProductStyle` from packages. */
  styleTags: string[];
  bin: ProductBin;
  /** Primary image URL. UI must still pass through the fallback chain. */
  image?: string;
  /** Optional retailer link. */
  productUrl?: string;
  retailerSource?: RetailerSource;
  /** Id of the product to silently substitute when this one is unavailable. */
  fallbackProductId?: string;
  availability: ProductAvailability;
  /** ISO date string. > 90d old should trigger a re-check (Phase 2). */
  lastVerifiedAt?: string;
  /** Optional customer-facing one-liner inherited from the source bin. */
  customerText?: string;

  /* ─── Phase 2.5 intrinsic fields ─────────────────────────────────
   * Promoted out of the legacy `tieredCatalog` join so the engine owns
   * its own intrinsic product properties. Joined enrichment (vendor
   * marketing copy, tags, disclaimers) still happens via productAdapter.
   */
  /** Vendor / brand label, e.g. "Delta", "Kohler". */
  vendor?: string;
  /** Vanity width in inches when applicable. */
  widthInches?: number;
  /** Mounting style. Affects faucet/vanity compatibility gating. */
  mountType?: "wall" | "floor" | "undermount" | "drop-in";
  /** Faucet deck-hole count: 0 (wall-mount), 1 (single hole), or 3 (widespread). */
  faucetHoles?: 0 | 1 | 3;
  /** Vendor unit price in USD. */
  unitPrice?: number;
  /** Estimated project allowance — only set for SF-priced materials. */
  estimatedProjectPrice?: number;
  /**
   * Stable, deterministic join key. Derivation precedence:
   *   1. tail of productUrl path (SKU-like)
   *   2. retailer + URL slug
   *   3. normalized name slug
   * Never derived from numeric array index.
   */
  canonicalKey: string;
  /**
   * True when this product intentionally has no `tieredCatalog`
   * correspondent. Parity tests must NOT treat missing enrichment for
   * curated-only products as a failure.
   */
  isCuratedOnly?: boolean;
}

/** A single category slot inside a Package (e.g. "vanity"). */
export interface PackageSlot {
  categoryId: BinKey;
  /** Id of the product chosen as the package default. */
  primaryProductId: string;
  /** Ordered ids of acceptable swap alternatives (same/adjacent bin). */
  alternativeIds: string[];
  /** Whether the slot must be filled for the package to be valid. */
  required: boolean;
  /** Sourcing status passed through from the underlying bin spec. */
  sourcing: "ready" | "placeholder";
}

/** Canonical Package record. */
export interface Package {
  id: PackageId;
  tierId: Tier;
  styleId: CanonicalStyleId;
  name: string;
  description?: string;
  heroImage?: string;
  status: PackageStatus;
  slots: PackageSlot[];
}

/**
 * Result of resolving a slot — what the UI should actually render.
 *
 * State matrix:
 *  - happy path (usable primary):       isFallback=false, isUnresolved=false
 *  - fell back to usable alternative:   isFallback=true,  isUnresolved=false
 *  - primary + all alternatives unusable: isFallback=true, isUnresolved=true
 *
 * UI MUST treat `isUnresolved=true` as "no renderable product"; do not
 * present `product` as a normal selection in that state.
 */
export interface ResolvedSlot {
  categoryId: BinKey;
  product: Product;
  /** True when `product` was substituted via fallbackProductId chain OR
   *  when the primary is unusable and no alternative could substitute. */
  isFallback: boolean;
  /** True when no usable product (primary or alternative) was found. */
  isUnresolved: boolean;
  /** Ordered alternatives the user can swap to. */
  alternatives: Product[];
}

/** Lightweight swap relationship for future swap-UI work. */
export interface SwapRelationship {
  fromProductId: string;
  toProductId: string;
  priceDelta: number;
  /** 0–1 score of how well the alternative matches the original style. */
  styleMatchScore: number;
}
