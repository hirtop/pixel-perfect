/**
 * Phase 2.6 — dev-only diagnostics for the engine drawer.
 *
 * Two utilities:
 *   1. `warnOnDerivedIntrinsicFields(product)` — emits a console.warn
 *      in DEV when an engine product still relies on regex-derived
 *      fields. Pure utility; not wired globally.
 *   2. `diffEngineVsLegacy(legacy, engine)` — pure field-level diff
 *      between an engine and legacy category row.
 *
 * Plus the `ENGINE_DIFF_ENABLED` flag for gating console output.
 *
 * No customer-facing UI. Never runs in production.
 */

import type { Product } from "./types";
import { ENGINE_DRAWER_ENABLED } from "./engineDrawerFlag";

/* ─── Flag ───────────────────────────────────────────────────────── */

export const ENGINE_DIFF_ENABLED: boolean =
  ENGINE_DRAWER_ENABLED &&
  import.meta.env.DEV &&
  import.meta.env.VITE_BOBOX_ENGINE_DIFF === "true";

export function computeEngineDiffEnabled(env: {
  DEV?: boolean;
  ENGINE_DRAWER_ENABLED?: boolean;
  VITE_BOBOX_ENGINE_DIFF?: string;
}): boolean {
  return (
    env.ENGINE_DRAWER_ENABLED === true &&
    env.DEV === true &&
    env.VITE_BOBOX_ENGINE_DIFF === "true"
  );
}

/* ─── Derived-fields warning helper ──────────────────────────────── */

const FIELDS_TO_CHECK = [
  "vendor",
  "widthInches",
  "mountType",
  "faucetHoles",
  "unitPrice",
  "estimatedProjectPrice",
  "canonicalKey",
] as const;

export interface DerivedFieldReport {
  productId: string;
  derivedFields: string[];
}

/**
 * Returns a list of intrinsic fields that fell back to derivation.
 * Pure — does not log. Use `warnOnDerivedIntrinsicFields` to also emit.
 */
export function getDerivedIntrinsicFields(product: Product): DerivedFieldReport {
  const sources = product._engineFieldSources ?? {};
  const derived: string[] = [];
  for (const field of FIELDS_TO_CHECK) {
    const origin = sources[field];
    if (origin === "regex" || origin === "derived") derived.push(field);
  }
  return { productId: product.id, derivedFields: derived };
}

/**
 * DEV-only: warns if a product used regex/derived fallback for any
 * intrinsic field. No-op in production. Returns the report.
 */
export function warnOnDerivedIntrinsicFields(
  product: Product,
): DerivedFieldReport {
  const report = getDerivedIntrinsicFields(product);
  if (!ENGINE_DIFF_ENABLED) return report;
  if (report.derivedFields.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "[engine-diagnostics] product still using derived intrinsic fields",
      report,
    );
  }
  return report;
}

/* ─── Phase 2.7: pricing uncertainty diagnostics ─────────────────── */

export interface PricingDiagnosticReport {
  productId: string;
  pricingSource: Product["pricingSource"];
  isPending: boolean;
  isEstimated: boolean;
  isConfirmed: boolean;
  pricingNote?: string;
}

/** Pure — classify a product's pricing source for diagnostics. */
export function getPricingDiagnostic(product: Product): PricingDiagnosticReport {
  const src = product.pricingSource;
  return {
    productId: product.id,
    pricingSource: src,
    isPending: src === "pending",
    isEstimated: src === "estimated",
    isConfirmed: src === "retailer" || src === "project-allowance",
    pricingNote: product.pricingNote,
  };
}

/**
 * DEV-only: warn when a product's pricing is "pending" or "estimated".
 * No-op when ENGINE_DIFF flag is off. Returns the report regardless.
 */
export function warnOnPricingUncertainty(product: Product): PricingDiagnosticReport {
  const r = getPricingDiagnostic(product);
  if (!ENGINE_DIFF_ENABLED) return r;
  if (r.isPending || r.isEstimated) {
    // eslint-disable-next-line no-console
    console.warn(
      "[engine-diagnostics] product has uncertain pricing",
      r,
    );
  }
  return r;
}

/* ─── Phase 2.7: completeness helper ─────────────────────────────── */

export interface EngineDataCompleteness {
  total: number;
  explicitVendor: number;
  explicitCanonicalKey: number;
  explicitPrice: number;          // unitPrice or estimatedProjectPrice explicit
  pricingSourceSet: number;
  regexDerivedFieldCount: number; // tracked field instances marked regex/derived
  pendingPricingCount: number;
  estimatedPricingCount: number;
  confirmedPricingCount: number;
}

export function getEngineDataCompleteness(
  products: Product[],
): EngineDataCompleteness {
  const out: EngineDataCompleteness = {
    total: products.length,
    explicitVendor: 0,
    explicitCanonicalKey: 0,
    explicitPrice: 0,
    pricingSourceSet: 0,
    regexDerivedFieldCount: 0,
    pendingPricingCount: 0,
    estimatedPricingCount: 0,
    confirmedPricingCount: 0,
  };
  for (const p of products) {
    const s = p._engineFieldSources ?? {};
    if (s.vendor === "explicit") out.explicitVendor++;
    if (s.canonicalKey === "explicit") out.explicitCanonicalKey++;
    if (s.unitPrice === "explicit" || s.estimatedProjectPrice === "explicit") {
      out.explicitPrice++;
    }
    if (p.pricingSource) out.pricingSourceSet++;
    for (const f of FIELDS_TO_CHECK) {
      const v = s[f];
      if (v === "regex" || v === "derived") out.regexDerivedFieldCount++;
    }
    if (p.pricingSource === "pending") out.pendingPricingCount++;
    else if (p.pricingSource === "estimated") out.estimatedPricingCount++;
    else if (
      p.pricingSource === "retailer" ||
      p.pricingSource === "project-allowance"
    ) {
      out.confirmedPricingCount++;
    }
  }
  return out;
}

/* ─── Field-level engine vs legacy diff ──────────────────────────── */

export type DiffStatus = "same" | "different" | "engine-only" | "legacy-only" | "missing";

export interface FieldDiff {
  field: string;
  legacyValue: unknown;
  engineValue: unknown;
  status: DiffStatus;
}

export interface CategoryDiffReport {
  categoryName: string;
  source: "engine" | "legacy";
  differences: FieldDiff[];
  fieldSources?: Product["_engineFieldSources"];
  isCuratedOnlyWithoutLegacy?: boolean;
}

const COMPARED_FIELDS = [
  "selected",
  "price",
  "vendor",
  "finish",
  "image",
  "tag",
  "spec",
  "disclaimer",
  "affiliateUrl",
] as const;

interface MinimalRow {
  name: string;
  selected?: string;
  price?: number;
  vendor?: string;
  finish?: string;
  image?: string;
  tag?: string;
  spec?: string;
  disclaimer?: string;
  affiliateUrl?: string;
  alternatives?: unknown[];
  _engine?: { enrichedFromLegacyId: string | null };
  _engineFieldSources?: Product["_engineFieldSources"];
}

function classify(legacyV: unknown, engineV: unknown): DiffStatus {
  const lEmpty = legacyV == null || legacyV === "";
  const eEmpty = engineV == null || engineV === "";
  if (lEmpty && eEmpty) return "missing";
  if (lEmpty && !eEmpty) return "engine-only";
  if (!lEmpty && eEmpty) return "legacy-only";
  return legacyV === engineV ? "same" : "different";
}

/**
 * Compare a legacy category row to an engine category row. Returns the
 * field-level diff. Pure — does not log. Either side may be null/undefined.
 */
export function diffEngineVsLegacy(
  legacy: MinimalRow | null | undefined,
  engine: MinimalRow | null | undefined,
): CategoryDiffReport {
  const categoryName = engine?.name ?? legacy?.name ?? "(unknown)";
  const source: "engine" | "legacy" = engine ? "engine" : "legacy";
  const legacyRecord = legacy as unknown as Record<string, unknown> | null | undefined;
  const engineRecord = engine as unknown as Record<string, unknown> | null | undefined;
  const differences: FieldDiff[] = [];
  for (const f of COMPARED_FIELDS) {
    const lv = legacyRecord?.[f];
    const ev = engineRecord?.[f];
    differences.push({
      field: f,
      legacyValue: lv,
      engineValue: ev,
      status: classify(lv, ev),
    });
  }
  // Alternatives count
  const lAlts = legacy?.alternatives?.length ?? 0;
  const eAlts = engine?.alternatives?.length ?? 0;
  differences.push({
    field: "alternativesCount",
    legacyValue: lAlts,
    engineValue: eAlts,
    status: lAlts === eAlts ? "same" : "different",
  });
  const isCuratedOnlyWithoutLegacy =
    !!engine && engine._engine?.enrichedFromLegacyId == null;
  return {
    categoryName,
    source,
    differences,
    fieldSources: engine?._engineFieldSources,
    isCuratedOnlyWithoutLegacy,
  };
}

/**
 * DEV-only: when both engine drawer + diff flags are enabled, log the
 * per-category diff via console.info. No-op otherwise.
 */
export function logCategoryDiffs(reports: CategoryDiffReport[]): void {
  if (!ENGINE_DIFF_ENABLED) return;
  // eslint-disable-next-line no-console
  console.info("[engine-diagnostics] per-category diff", reports);
}
