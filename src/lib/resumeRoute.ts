/**
 * Centralised mapping from a project's saved workflow step to the
 * route the user should land on when resuming.
 *
 * Pass 5 ordering when resolving package-scoped steps (package-detail,
 * customize):
 *
 *   A. real `packageId` AND status === "curated"   → curated route
 *      (today this is `/customize/<tier>` for the legacy curated UI;
 *      kept on existing tier paths for backward compatibility — the
 *      route segment is a stable tier slug).
 *   B. real `packageId` but status === "placeholder" → safe fallback
 *      to /options. Do NOT render an incomplete curated UI.
 *   C. `legacyTierRoute` only → existing legacy tier flow
 *      (/package/<tier> or /customize/<tier>).
 *   D. neither → /options or /start per current behavior.
 *
 * `LEGACY_ROUTE_ALIASES` is intentionally NOT removed.
 */

import { getPackage, isLegacyRouteAlias } from "@/remodel-flow/package-engine/registry";
import { parsePackageId } from "@/remodel-flow/package-engine/normalize";
import { splitPackageIdField } from "@/remodel-flow/package-engine/flowStateMigration";

export type ResumeStep =
  | "start"
  | "upload"
  | "dimensions"
  | "style-budget"
  | "package-select"
  | "package-detail"
  | "customize"
  | "workflow"
  | "summary"
  | "subcontractors"
  | "agreement"
  | (string & {});

export interface ResumeContext {
  step?: string | null;
  /** Legacy field — may be a tier alias OR a real packageId for older callers. */
  tier?: string | null;
  /** Preferred new fields. */
  packageId?: string | null;
  legacyTierRoute?: string | null;
}

const STATIC_STEP_ROUTES: Record<string, string> = {
  start: "/start",
  upload: "/upload",
  dimensions: "/dimensions",
  "style-budget": "/style-budget",
  "package-select": "/options",
  options: "/options",
  workflow: "/workflow",
  summary: "/summary",
  subcontractors: "/subcontractors",
  agreement: "/agreement",
};

const VALID_TIERS = new Set(["budget", "balanced", "premium", "essential"]);

function normaliseTier(tier?: string | null): string | null {
  if (!tier) return null;
  const lower = tier.toLowerCase();
  return VALID_TIERS.has(lower) ? lower : null;
}

interface ResolvedIdentity {
  /** Real PackageId, if any. */
  packageId: string | null;
  /** Whether the real packageId is curated and safe to render. */
  curated: boolean;
  /** Legacy tier alias, if any. */
  legacyTier: string | null;
}

/**
 * Classify the package identity from the available context fields. Falls
 * back through `legacyTierRoute` and finally the legacy `tier` field for
 * backwards compatibility with existing callers.
 */
function resolveIdentity(ctx: ResumeContext): ResolvedIdentity {
  // Prefer explicit packageId, run it through the migration helper to
  // catch the legacy-alias-stored-as-packageId case.
  const splitFromPkg = splitPackageIdField(ctx.packageId ?? null);
  let packageId = splitFromPkg.packageId;
  let legacyTier = splitFromPkg.legacyTierRoute;

  // Explicit legacyTierRoute wins over implied legacy.
  if (!legacyTier && ctx.legacyTierRoute && isLegacyRouteAlias(ctx.legacyTierRoute)) {
    legacyTier = ctx.legacyTierRoute;
  }

  // Last-resort: the old `tier` field. Could be tier alias OR a real packageId.
  if (!packageId && !legacyTier && ctx.tier) {
    if (parsePackageId(ctx.tier)) {
      const split = splitPackageIdField(ctx.tier);
      packageId = split.packageId;
    } else if (isLegacyRouteAlias(ctx.tier) || normaliseTier(ctx.tier)) {
      legacyTier = (ctx.tier ?? "").toLowerCase();
    }
  }

  let curated = false;
  if (packageId) {
    curated = getPackage(packageId)?.status === "curated";
  }

  return { packageId, curated, legacyTier };
}

/**
 * Resolve the route to navigate to when resuming a saved project.
 * Falls back to /start when nothing else matches.
 */
export function resolveResumeRoute(ctx: ResumeContext): string {
  const safeStep = (ctx.step || "start").toString();
  const identity = resolveIdentity(ctx);

  // Tier-scoped steps require a package or legacy tier identity.
  if (safeStep === "package-detail" || safeStep === "customize") {
    const verb = safeStep === "package-detail" ? "package" : "customize";

    // A. curated real package
    if (identity.packageId && identity.curated) {
      // Curated UI today still lives on the tier-scoped route. Use the
      // tier suffix from the parsed packageId so curated rendering picks
      // up the curated package via state, not via URL.
      const parsed = parsePackageId(identity.packageId);
      const tier = parsed?.tier ?? "balanced";
      return `/${verb}/${tier}`;
    }
    // B. placeholder packageId — NEVER render incomplete curated UI
    if (identity.packageId && !identity.curated) {
      return "/options";
    }
    // C. legacy tier route
    if (identity.legacyTier) {
      const tier = normaliseTier(identity.legacyTier);
      return tier ? `/${verb}/${tier}` : "/options";
    }
    // D. nothing
    return "/options";
  }

  return STATIC_STEP_ROUTES[safeStep] ?? "/start";
}
