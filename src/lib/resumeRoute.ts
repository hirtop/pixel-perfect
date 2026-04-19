/**
 * Centralised mapping from a project's saved workflow step to the
 * route the user should land on when resuming.
 *
 * Some steps require the selected package tier (lowercase: "budget" |
 * "balanced" | "premium") to construct a tier-scoped route such as
 * /package/balanced or /customize/balanced.
 */

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
  tier?: string | null;
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

const VALID_TIERS = new Set(["budget", "balanced", "premium"]);

function normaliseTier(tier?: string | null): string | null {
  if (!tier) return null;
  const lower = tier.toLowerCase();
  return VALID_TIERS.has(lower) ? lower : null;
}

/**
 * Resolve the route to navigate to when resuming a saved project.
 * Falls back to /start when nothing else matches.
 */
export function resolveResumeRoute({ step, tier }: ResumeContext): string {
  const normalisedTier = normaliseTier(tier);
  const safeStep = (step || "start").toString();

  // Tier-scoped steps — only valid if we have a tier on the project.
  if (safeStep === "package-detail") {
    return normalisedTier ? `/package/${normalisedTier}` : "/options";
  }
  if (safeStep === "customize") {
    return normalisedTier ? `/customize/${normalisedTier}` : "/options";
  }

  return STATIC_STEP_ROUTES[safeStep] ?? "/start";
}
