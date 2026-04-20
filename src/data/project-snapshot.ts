/**
 * BOBOX Remodel — Project Snapshot
 *
 * Deterministic synthesis of project signals into a buyer-facing decision card:
 * realistic range, complexity, top cost drivers, recommended next step.
 *
 * v1: pure rules, no AI. Swap this helper to upgrade later.
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
  /** Widest realistic market range across all tiers, e.g. "$8,000 – $32,000" */
  marketRange: string;
  /** Range anchored to the user's selected/preferred tier, or null if none picked */
  yourTierRange: string | null;
  /** Label for the user's tier, e.g. "Balanced" */
  yourTierLabel: string | null;
  complexity: Complexity;
  complexityReason: string;
  drivers: CostDriver[];
  nextStep: NextStep;
}

const TIER_NAMES = ["Budget", "Balanced", "Premium"] as const;
type TierName = (typeof TIER_NAMES)[number];

const matchTier = (raw?: string): TierName | null => {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  return TIER_NAMES.find((t) => lower.includes(t.toLowerCase())) ?? null;
};

export function deriveProjectSnapshot(project: ProjectData): ProjectSnapshot {
  const width = Number(project.dimensions?.width_ft) || 0;
  const length = Number(project.dimensions?.length_ft) || 0;
  const sqft = width * length;
  const bathroomType = (project.bathroom_type || "").toLowerCase();
  const isFullBath = bathroomType.includes("full") || bathroomType.includes("primary") || bathroomType.includes("master");
  const isPowder = bathroomType.includes("half") || bathroomType.includes("powder");

  const selectedTier = matchTier(project.selected_package?.name);
  const preferredTier = selectedTier ?? matchTier(project.style_preferences?.budget_level);

  // ── Range anchors ────────────────────────────────────────────────
  const marketRange = `${packagePricing.Budget.projectRange.split(" – ")[0]} – ${packagePricing.Premium.projectRange.split(" – ")[1]}`;
  const yourTierRange = preferredTier ? packagePricing[preferredTier].projectRange : null;
  const yourTierLabel = preferredTier;

  // ── Complexity scoring ───────────────────────────────────────────
  let score = 0;
  const reasons: string[] = [];

  if (isPowder) {
    score -= 1;
    reasons.push("powder room scope");
  } else if (isFullBath) {
    score += 1;
    reasons.push("full bath with wet areas");
  }

  if (sqft > 0 && sqft < 35) {
    score += 1;
    reasons.push("tight footprint");
  } else if (sqft > 70) {
    score += 1;
    reasons.push("larger room with more surface area");
  }

  if (preferredTier === "Premium") {
    score += 2;
    reasons.push("premium-tier finishes");
  } else if (preferredTier === "Balanced") {
    score += 1;
  }

  let complexity: Complexity;
  if (score <= 0) complexity = "Simple";
  else if (score <= 2) complexity = "Moderate";
  else complexity = "Complex";

  const complexityReason =
    complexity === "Simple"
      ? "Standard scope on existing plumbing — predictable timeline."
      : complexity === "Moderate"
        ? `Typical remodel scope — ${reasons.slice(0, 2).join(", ") || "standard install"}.`
        : `Higher coordination needed — ${reasons.slice(0, 2).join(", ") || "premium scope"}.`;

  // ── Top 3 cost drivers (ranked) ─────────────────────────────────
  const allDrivers: CostDriver[] = [];

  if (isFullBath) {
    allDrivers.push({
      label: "Tub & shower scope",
      detail: "Wet areas drive the largest tile and labor share.",
    });
  }

  if (sqft >= 50) {
    allDrivers.push({
      label: "Tile coverage",
      detail: `~${sqft || "—"} sq ft means more material and install hours.`,
    });
  } else if (sqft > 0 && sqft < 35) {
    allDrivers.push({
      label: "Compact-room fitments",
      detail: "Smaller fixtures cost more per unit and limit substitutions.",
    });
  } else {
    allDrivers.push({
      label: "Tile coverage",
      detail: "Floor and wall tile drive both material and labor.",
    });
  }

  if (preferredTier === "Premium") {
    allDrivers.push({
      label: "Fixture & finish tier",
      detail: "Designer faucets, lighting, and hardware can swing $2k–$5k.",
    });
  } else if (preferredTier === "Balanced") {
    allDrivers.push({
      label: "Fixture coordination",
      detail: "Matching mid-tier finishes across vanity, shower, and lighting.",
    });
  } else {
    allDrivers.push({
      label: "Fixture choices",
      detail: "Faucet, lighting, and hardware tier sets the visual ceiling.",
    });
  }

  allDrivers.push({
    label: "Vanity & countertop",
    detail: "Width and stone choice are the single largest single-line cost.",
  });

  if (isFullBath || preferredTier === "Premium") {
    allDrivers.push({
      label: "Plumbing layout",
      detail: "Keeping fixtures in place avoids $2,000+ in relocation labor.",
    });
  }

  const drivers = allDrivers.slice(0, 3);

  // ── Recommended next step ───────────────────────────────────────
  let nextStep: NextStep;

  if (!preferredTier) {
    nextStep = {
      text: "Compare the three packages below to see which scope fits your goals.",
      highlightTier: "Balanced",
    };
  } else if (complexity === "Complex" && preferredTier !== "Premium") {
    nextStep = {
      text: `Your scope leans complex — review ${preferredTier} carefully and consider Premium if layout changes are likely.`,
      highlightTier: "Premium",
    };
  } else if (complexity === "Simple" && preferredTier === "Premium") {
    nextStep = {
      text: "Your scope is simple — Balanced may deliver the look you want for less.",
      highlightTier: "Balanced",
    };
  } else if (preferredTier === "Premium") {
    nextStep = {
      text: "Premium fits your vision — keep the existing layout to stay near the lower end of the range.",
      highlightTier: "Premium",
    };
  } else if (preferredTier === "Balanced") {
    nextStep = {
      text: "Balanced is a strong fit — open it to see exactly what's included before committing.",
      highlightTier: "Balanced",
    };
  } else {
    nextStep = {
      text: "Budget keeps costs predictable — open it to confirm the finishes match your taste.",
      highlightTier: "Budget",
    };
  }

  return {
    marketRange,
    yourTierRange,
    yourTierLabel,
    complexity,
    complexityReason,
    drivers,
    nextStep,
  };
}
