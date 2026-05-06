/**
 * Predicate + storage keys for the "we upgraded the project flow" banner
 * shown on /remodel-flow/start. Reads localStorage DIRECTLY (no React /
 * FlowContext dep) so a fresh-default FlowContext mount cannot defeat it.
 *
 * Show when ALL true:
 *   - user has NOT dismissed (BANNER_DISMISSED_KEY !== "1")
 *   - LEGACY_DRAFT_KEY exists and contains meaningful legacy fields
 *   - FLOW_KEY has no meaningful progress (missing, empty, or default-only)
 */
export const FLOW_KEY = "bobox_remodel_flow_v1";
export const LEGACY_DRAFT_KEY = "bobox_project_draft";
export const BANNER_DISMISSED_KEY = "bobox_legacy_upgrade_banner_dismissed_v1";

const LEGACY_MEANINGFUL_TOP_LEVEL_FIELDS = [
  "packageId",
  "legacyTierRoute",
  "style",
  "tier",
  "name",
  "assessment",
  "workflow",
  "progress",
  "dimensions",
  "photos",
  "selections",
] as const;

function isNonEmptyObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && Object.keys(v as object).length > 0;
}

export function hasMeaningfulLegacyDraft(parsed: unknown): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const obj = parsed as Record<string, unknown>;
  if (
    obj.selected_package &&
    typeof obj.selected_package === "object" &&
    Object.keys(obj.selected_package as object).length > 0
  ) {
    return true;
  }
  for (const k of LEGACY_MEANINGFUL_TOP_LEVEL_FIELDS) {
    const v = obj[k];
    if (v == null) continue;
    if (typeof v === "string" && v.length > 0) return true;
    if (typeof v === "number" || typeof v === "boolean") return true;
    if (Array.isArray(v) && v.length > 0) return true;
    if (isNonEmptyObject(v)) return true;
  }
  return false;
}

export function hasMeaningfulFlowProgress(parsed: unknown): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const s = parsed as Record<string, unknown>;
  if (typeof s.style === "string" && s.style) return true;
  if (typeof s.tier === "string" && s.tier) return true;
  if (typeof s.packageId === "string" && s.packageId) return true;
  if (typeof s.legacyTierRoute === "string" && s.legacyTierRoute) return true;
  if (s.selections && typeof s.selections === "object" && Object.keys(s.selections as object).length > 0) {
    return true;
  }
  return false;
}

export function shouldShowLegacyDraftBanner(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    if (localStorage.getItem(BANNER_DISMISSED_KEY) === "1") return false;
    const legacyRaw = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!legacyRaw) return false;
    let legacyParsed: unknown;
    try {
      legacyParsed = JSON.parse(legacyRaw);
    } catch {
      return false;
    }
    if (!hasMeaningfulLegacyDraft(legacyParsed)) return false;

    const flowRaw = localStorage.getItem(FLOW_KEY);
    if (flowRaw) {
      try {
        const flowParsed = JSON.parse(flowRaw);
        if (hasMeaningfulFlowProgress(flowParsed)) return false;
      } catch {
        /* unreadable flow state — treat as no progress */
      }
    }
    return true;
  } catch {
    return false;
  }
}
