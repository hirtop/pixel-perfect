/**
 * BOBOX Remodel — Project Snapshot
 *
 * Deterministic synthesis of project signals into a buyer-facing decision card.
 * v2: rules biased toward renovation friction (plumbing, wet areas, waterproofing,
 * footprint constraints, ventilation/electrical) over finish/package signals.
 *
 * Complexity is driven by project conditions; package tier influences budget,
 * not complexity (small +1 nudge for Premium when layout risk likely).
 */

import type { ProjectData } from "@/contexts/ProjectContext";
import { packagePricing } from "./products";

export type Complexity = "Simple" | "Moderate" | "Complex";

export interface CostDriver {
  label: string;
  detail: string;
}

export interface NextStep {
  text: string;
  /** Optional package tier to scroll/highlight when the inline link is clicked */
  highlightTier?: "Budget" | "Balanced" | "Premium";
}

export interface ProjectSnapshot {
  marketRange: string;
  yourTierRange: string | null;
  yourTierLabel: string | null;
  complexity: Complexity;
  complexityReason: string;
  drivers: CostDriver[];
  nextStep: NextStep;
}

/**
 * Soft, additive signals derived from bathroom photo scans.
 * Layer 3 — Step 1: photoLayoutRisk only. Cost-driver promotion + tier bumps come later.
 *
 * Rules baked in upstream by `summarizePhotoSignals`:
 *   - only "concern" status with medium/high confidence counts as credible
 *   - low-confidence concerns are ignored entirely
 *   - photo signals never replace existing logic — they only add a small nudge
 */
export interface PhotoSignalSummary {
  /** True if photos credibly show layout/access tightness or visible wet-area concerns. */
  layoutRiskFromPhotos: boolean;
  /** Short, builder-honest fragment for the complexity reason. */
  reasonFragment?: string;
}

const TIER_NAMES = ["Budget", "Balanced", "Premium"] as const;
type TierName = (typeof TIER_NAMES)[number];

const matchTier = (raw?: string): TierName | null => {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return TIER_NAMES.find((t) => lower.includes(t.toLowerCase())) ?? null;
};

export function deriveProjectSnapshot(
  project: ProjectData,
  photoSignals?: PhotoSignalSummary,
): ProjectSnapshot {
  // ── Signals ──────────────────────────────────────────────────────
  const width = Number(project.dimensions?.width_ft) || 0;
  const length = Number(project.dimensions?.length_ft) || 0;
  const sqft = width * length;

  const bathroomType = (project.bathroom_type || "").toLowerCase();
  const isPowder = bathroomType.includes("half") || bathroomType.includes("powder");
  const isPrimary = bathroomType.includes("primary") || bathroomType.includes("master");
  const isFullBath = bathroomType.includes("full") || isPrimary;
  const hasWetAreas = isFullBath || bathroomType.includes("bath"); // anything but pure powder

  const bathingSetup = (project.bathing_setup || "").toLowerCase();
  const hasTub = bathingSetup.includes("tub");
  const hasShower = bathingSetup.includes("shower");
  const hasTubShowerCombo = hasTub && hasShower;

  const layoutNotes = (project.dimensions?.layout_notes || "").toLowerCase();
  const layoutChangeHinted = /move|relocat|reconfigur|new layout|change.*layout|layout.*change|swap/.test(layoutNotes);

  const selectedTier = matchTier(project.selected_package?.name);
  const preferredTier = selectedTier ?? matchTier(project.style_preferences?.budget_level);

  // ── Range anchors ────────────────────────────────────────────────
  const marketRange = `${packagePricing.Budget.projectRange.split(" – ")[0]} – ${packagePricing.Premium.projectRange.split(" – ")[1]}`;
  const yourTierRange = preferredTier ? packagePricing[preferredTier].projectRange : null;
  const yourTierLabel = preferredTier;

  // ── Complexity (project-condition driven) ────────────────────────
  // Conditions dominate; tier is a small nudge only when layout risk likely.
  let score = 0;
  const conditionReasons: string[] = [];

  if (isPowder) {
    // Powder rooms default to Simple. Footprint and tier alone cannot push them up.
    // Only a layout-change hint may lift them to Moderate (handled below via floor).
    score -= 1;
    conditionReasons.push("powder room — no wet areas");
  } else if (isPrimary) {
    score += 2;
    conditionReasons.push("primary bath with multiple fixtures");
  } else if (isFullBath) {
    score += 1;
    conditionReasons.push("full bath with wet areas");
  }

  // Tub+shower combo is the standard American full bath — normal scope, not a
  // complexity multiplier. Still surfaced as a cost driver below, but no score bump.


  if (sqft > 0 && sqft < 35) {
    score += 2;
    conditionReasons.push("tight footprint limits substitutions");
  } else if (sqft > 0 && sqft < 50) {
    score += 1;
    conditionReasons.push("compact room — fitments matter");
  } else if (sqft > 80) {
    score += 1;
    conditionReasons.push("larger room means more surface scope");
  }

  if (layoutChangeHinted) {
    score += 2;
    conditionReasons.push("layout change implied by your notes");
  }

  // ── Layer 3 (Step 1): photo-derived layout/wet-area soft nudge ───
  // Additive only — never overrides existing logic, never moves Simple → Complex
  // on its own. Capped at +1 score, never used for powder rooms.
  const photoNudgeApplied =
    !!photoSignals?.layoutRiskFromPhotos && !isPowder;
  if (photoNudgeApplied) {
    score += 1;
    conditionReasons.push(
      photoSignals?.reasonFragment || "photos suggest a tight or wet-area layout",
    );
  }

  // Tier nudge — Premium only adds risk when layout change is plausible
  if (preferredTier === "Premium" && (isFullBath || sqft >= 50 || layoutChangeHinted)) {
    score += 1;
  }

  let complexity: Complexity;
  if (score <= 0) complexity = "Simple";
  else if (score <= 2) complexity = "Moderate";
  else complexity = "Complex";

  // Photo-only cap: a photo nudge alone cannot push from Simple to Complex.
  // If the ONLY thing pushing us above Moderate is the photo signal, hold at Moderate.
  if (photoNudgeApplied && complexity === "Complex" && score - 1 <= 2) {
    complexity = "Moderate";
  }

  // Powder room cap: footprint/tier alone can't push above Simple.
  // Only a layout-change hint may lift it to Moderate. Never Complex.
  if (isPowder) {
    complexity = layoutChangeHinted ? "Moderate" : "Simple";
  }

  const topReasons = conditionReasons.slice(0, 2);
  const complexityReason =
    complexity === "Simple"
      ? topReasons.length
        ? `${topReasons[0].charAt(0).toUpperCase() + topReasons[0].slice(1)} — predictable scope on existing plumbing.`
        : "Standard scope on existing plumbing — predictable timeline."
      : complexity === "Moderate"
        ? `${topReasons.join(", ") || "typical remodel scope"} — manageable with planning.`
        : `${topReasons.join(", ") || "premium scope"} — sequencing and trade coordination matter.`;

  // Capitalize first letter cleanly
  const finalComplexityReason = complexityReason.charAt(0).toUpperCase() + complexityReason.slice(1);

  // ── Top 3 cost drivers (renovation-friction first) ───────────────
  // Pool ordered by renovation risk; package/finish drivers go last.
  const allDrivers: CostDriver[] = [];

  // 1. Plumbing & water movement (highest friction)
  if (layoutChangeHinted) {
    allDrivers.push({
      label: "Plumbing relocation",
      detail: "Moving a drain or supply line typically adds meaningful plumbing and framing labor on top of the base scope.",
    });
  } else if (isFullBath || hasWetAreas) {
    allDrivers.push({
      label: "Plumbing layout",
      detail: "Keeping fixtures on existing supply and drain lines is one of the biggest cost levers in any bathroom remodel.",
    });
  }

  // 2. Wet-area scope (waterproofing is silent but expensive)
  if (hasTubShowerCombo) {
    allDrivers.push({
      label: "Tub + shower scope",
      detail: "Two wet zones means more waterproofing, pan work, and tile labor than a single shower or tub.",
    });
  } else if (hasShower || isFullBath) {
    allDrivers.push({
      label: "Shower waterproofing",
      detail: "Pan, curb, and membrane work is hidden behind the tile but a notable share of wet-area labor.",
    });
  } else if (hasTub) {
    allDrivers.push({
      label: "Tub surround",
      detail: "Tub deck, surround tile, and access panel work add labor beyond the tub fixture itself.",
    });
  }

  // 3. Tile + waterproofing scope
  if (sqft >= 60) {
    allDrivers.push({
      label: "Tile coverage area",
      detail: `~${sqft} sq ft of floor plus wet-wall tile means more material, more setting hours, and more grout maintenance later.`,
    });
  } else if (sqft > 0 && sqft < 35) {
    allDrivers.push({
      label: "Compact-room fit",
      detail: "Tight footprints force smaller (and often pricier) fixtures and limit substitution options.",
    });
  } else if (hasWetAreas) {
    allDrivers.push({
      label: "Wet-area tile",
      detail: "Shower walls and floor tile drive both material spend and skilled-trade hours.",
    });
  }

  // 4. Ventilation & electrical (commonly overlooked)
  if (isFullBath || hasShower) {
    allDrivers.push({
      label: "Ventilation & electrical",
      detail: "Code-compliant fan, GFCI circuits, and dedicated lighting are easy to under-budget.",
    });
  }

  // 5. Layout / footprint constraint
  if (sqft > 0 && sqft < 50 && !allDrivers.some((d) => d.label === "Compact-room fit")) {
    allDrivers.push({
      label: "Layout constraints",
      detail: "Limited wall length restricts vanity width and door swing — fewer off-the-shelf options.",
    });
  }

  // 6. Vanity & countertop (a real line item, but ranked lower)
  allDrivers.push({
    label: "Vanity & countertop",
    detail: "Width, drawer count, and stone choice are the largest single line on the materials list.",
  });

  // 7. Finish/fixture tier — lowest priority, only fills if room remains
  if (preferredTier === "Premium") {
    allDrivers.push({
      label: "Designer fixture tier",
      detail: "Premium faucets, lighting, and hardware carry a real premium over mid-tier equivalents.",
    });
  } else if (preferredTier === "Balanced") {
    allDrivers.push({
      label: "Coordinated finishes",
      detail: "Matching mid-tier finishes across vanity, shower, and lighting adds a modest premium.",
    });
  }

  // Cold-start padding: when the buyer hasn't entered enough signal, the pool can
  // be very thin. Backfill with general, defensible drivers so the card never
  // renders with only 1 item. Order kept stable; only used to reach 3.
  const fallbackDrivers: CostDriver[] = [
    {
      label: "Demolition & disposal",
      detail: "Tear-out, debris haul-away, and protecting adjacent rooms is a baseline cost on every remodel.",
    },
    {
      label: "Lighting & electrical",
      detail: "GFCI outlets, vanity lighting, and a code-compliant exhaust fan are easy to under-budget early on.",
    },
    {
      label: "Permits & inspections",
      detail: "Most jurisdictions require permits for plumbing or electrical work — fees and scheduling matter.",
    },
  ];
  for (const fb of fallbackDrivers) {
    if (allDrivers.length >= 3) break;
    if (!allDrivers.some((d) => d.label === fb.label)) allDrivers.push(fb);
  }

  const drivers = allDrivers.slice(0, 3);

  // ── Recommended next step (builder guidance tone) ────────────────
  let nextStep: NextStep;

  const layoutRisk = layoutChangeHinted || (isFullBath && sqft > 0 && sqft < 40);

  if (!preferredTier) {
    // No tier picked yet — point them at a sensible starting comparison
    nextStep = {
      text: layoutRisk
        ? "Before picking a tier, decide whether plumbing stays put — that single choice tends to move the project meaningfully up or down the range."
        : "Compare Balanced as your baseline; it usually delivers the visible upgrades buyers expect without moving plumbing.",
      highlightTier: "Balanced",
    };
  } else if (complexity === "Complex" && preferredTier !== "Premium" && layoutRisk) {
    // Only nudge toward Premium when there's a real layout/plumbing risk signal —
    // otherwise this reads as an upsell, not advice.
    nextStep = {
      text: `Your scope carries real layout and wet-area risk. ${preferredTier} can still work, but it's worth glancing at Premium for the budget cushion if surprises come up.`,
      highlightTier: "Premium",
    };
  } else if (complexity === "Simple" && preferredTier === "Premium") {
    nextStep = {
      text: "Your scope is clean and predictable — Balanced will likely deliver a very similar visible result for noticeably less.",
      highlightTier: "Balanced",
    };
  } else if (preferredTier === "Premium") {
    nextStep = layoutRisk
      ? {
          text: "Premium fits the scope. To stay near the lower end, lock in the existing fixture locations early and absorb upgrades in finishes, not in plumbing.",
          highlightTier: "Premium",
        }
      : {
          text: "Premium is well-matched here. To protect the lower end of the range, prioritize stone and tile upgrades over layout changes.",
          highlightTier: "Premium",
        };
  } else if (preferredTier === "Balanced") {
    nextStep = layoutRisk
      ? {
          text: "Balanced is a strong baseline. Validate your plumbing assumptions before committing — a single relocated drain can push you past the upper end of this tier.",
          highlightTier: "Balanced",
        }
      : {
          text: "Balanced lines up with your scope. Keep fixtures in their current spots and you'll likely land in the lower half of the range.",
          highlightTier: "Balanced",
        };
  } else {
    // Budget
    nextStep = layoutRisk
      ? {
          text: "Budget keeps costs predictable, but the layout risk in your space could erode that margin. Compare Balanced before deciding — the contingency may be worth it.",
          highlightTier: "Balanced",
        }
      : {
          text: "Budget keeps you predictable. Re-use existing tile substrate where sound, and put any savings toward the vanity — that's the piece you'll see every day.",
          highlightTier: "Budget",
        };
  }

  return {
    marketRange,
    yourTierRange,
    yourTierLabel,
    complexity,
    complexityReason: finalComplexityReason,
    drivers,
    nextStep,
  };
}
