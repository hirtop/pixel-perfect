/**
 * BOBOX Remodel — Product Data Foundation
 *
 * Core types, formatting, bathroom insights, and package metadata.
 * Tier-specific catalog lives in ./tiered-catalog.ts
 */

// ─── Standard Categories ────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "Vanity",
  "Tile",
  "Faucet",
  "Lighting",
  "Mirror",
  "Toilet",
  "Shower / Tub Hardware",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** The 4 categories users can actively customize */
export const CUSTOMIZABLE_CATEGORIES: ProductCategory[] = ["Vanity", "Tile", "Faucet", "Mirror"];

// ─── Formatting ─────────────────────────────────────────────────────

export const formatPrice = (dollars: number) => {
  if (dollars < 0) return `-$${Math.abs(dollars).toLocaleString()}`;
  return `$${dollars.toLocaleString()}`;
};

// ─── Re-export tiered catalog ───────────────────────────────────────

export {
  type ProductTier,
  type TieredProduct,
  type StaticItem,
  tieredCatalog,
  getTierDefaults,
  getTierAlternatives,
  getTierDefaultMaterialTotal,
  computeLaborTotal,
  getStaticItemsTotal,
  TIER_BASE_LABOR,
  SHIPPING_ESTIMATE,
  STATIC_ITEMS,
} from "./tiered-catalog";

// ─── Bathroom Analysis (simulated inference) ────────────────────────

export interface BathroomInsight {
  icon: "layout" | "style" | "fixture" | "scope";
  label: string;
  detail: string;
}

export function getBathroomInsights(project: {
  bathroom_type?: string;
  dimensions?: { width_ft?: string; length_ft?: string };
  style_preferences?: { style?: string; budget_level?: string; finish?: string };
  photos?: { metadata?: { name: string }[] };
}): BathroomInsight[] {
  const insights: BathroomInsight[] = [];
  const bathroomType = project.bathroom_type || "";
  const width = Number(project.dimensions?.width_ft) || 0;
  const length = Number(project.dimensions?.length_ft) || 0;
  const sqft = width && length ? width * length : 0;
  const finish = project.style_preferences?.finish || "";
  const hasBathroomType = bathroomType.length > 0;

  if (bathroomType.toLowerCase().includes("full")) {
    insights.push({ icon: "layout", label: "Full bath with tub/shower combo", detail: "Keeping existing tub avoids $2,000+ in plumbing relocation" });
  } else if (bathroomType.toLowerCase().includes("half") || bathroomType.toLowerCase().includes("powder")) {
    insights.push({ icon: "layout", label: "Powder room — vanity + toilet only", detail: "No wet-area tile needed — lowers material and labor scope" });
  } else if (bathroomType.toLowerCase().includes("primary") || bathroomType.toLowerCase().includes("master")) {
    insights.push({ icon: "layout", label: "Primary bath — likely dual fixtures", detail: "Products sized for double vanity and separate shower" });
  } else if (hasBathroomType) {
    insights.push({ icon: "layout", label: "Single-vanity layout", detail: "Products sized for one sink, one mirror footprint" });
  }

  if (sqft > 0) {
    if (sqft < 40) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — compact bath`, detail: "Space-saving products prioritized to avoid crowding" });
    } else if (sqft < 70) {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — standard size`, detail: 'Fits a 48" vanity and standard tub/shower — no layout constraints' });
    } else {
      insights.push({ icon: "scope", label: `~${sqft} sq ft — spacious layout`, detail: "Room for upgrades like a double vanity or freestanding tub" });
    }
  }

  if (finish) {
    insights.push({ icon: "style", label: `${finish} finish selected`, detail: "Faucet, lighting, and hardware coordinated to this finish" });
  }

  return insights;
}

// ─── Package fit reasons ────────────────────────────────────────────

export const packageFitReasons: Record<string, string> = {
  Budget: "Refreshes all visible surfaces on your existing plumbing — least disruption, fastest install.",
  Balanced: "Upgrades materials and finishes without moving plumbing — keeps labor costs predictable.",
  Premium: "Designer-grade materials with flexibility to change the layout if needed.",
};

// ─── Package tier pricing ───────────────────────────────────────────

export const packagePricing: Record<string, {
  materialRange: string;
  laborRange: string;
  projectRange: string;
  description: string;
}> = {
  Budget: {
    materialRange: "$3,000 – $5,500",
    laborRange: "$4,000 – $5,500",
    projectRange: "$8,000 – $12,000",
    description: "New vanity, updated tile, modern fixtures — all on existing plumbing. No layout changes.",
  },
  Balanced: {
    materialRange: "$6,000 – $10,000",
    laborRange: "$6,000 – $8,000",
    projectRange: "$13,000 – $19,000",
    description: "Better materials and coordinated finishes that noticeably upgrade how the room looks and feels. Plumbing stays in place.",
  },
  Premium: {
    materialRange: "$11,000 – $18,000",
    laborRange: "$8,500 – $12,000",
    projectRange: "$22,000 – $32,000",
    description: "Designer-grade materials with the option to relocate fixtures, add niches, or change the tub/shower layout.",
  },
};
