/**
 * Flow-state migration helpers (Pass 4).
 *
 * Splits the current free-form `RemodelFlowState.packageId` field into two
 * conceptually separate values WITHOUT mutating the flow state shape used
 * by the live UI yet:
 *
 *   - `packageId`        → real PackageId like "modern-balanced"
 *   - `legacyTierRoute`  → tier-only alias like "balanced" / "essential" / "premium"
 *
 * This module is read-only and pure. It does not edit FlowContext,
 * resumeRoute.ts, or persistence/serializer.ts. Route gating in the next
 * pass will consume `splitPackageIdField()` to migrate stored values
 * on read.
 *
 * See TODO.md — RemodelFlowState was NOT split in-place this pass because
 * doing so requires touching FlowContext.tsx, persistence/serializer.ts,
 * and several pages. Those edits are deferred until route gating.
 */

import { isLegacyRouteAlias } from "./registry";
import { parsePackageId } from "./normalize";
import type { PackageId, Tier } from "./types";

export type LegacyTierRoute = Tier; // "essential" | "balanced" | "premium"

export interface SplitPackageId {
  packageId: PackageId | null;
  legacyTierRoute: LegacyTierRoute | null;
}

/**
 * Read-side migration. Given whatever was stored in
 * `RemodelFlowState.packageId`, classify it.
 *
 *  - "modern-balanced"  → { packageId: "modern-balanced", legacyTierRoute: null }
 *  - "balanced"         → { packageId: null, legacyTierRoute: "balanced" }
 *  - undefined / junk   → { packageId: null, legacyTierRoute: null }
 */
export function splitPackageIdField(
  stored: string | null | undefined,
): SplitPackageId {
  if (!stored) return { packageId: null, legacyTierRoute: null };

  const parsed = parsePackageId(stored);
  if (parsed) {
    return {
      packageId: `${parsed.style}-${parsed.tier}` as PackageId,
      legacyTierRoute: null,
    };
  }

  if (isLegacyRouteAlias(stored)) {
    return {
      packageId: null,
      legacyTierRoute: stored as LegacyTierRoute,
    };
  }

  return { packageId: null, legacyTierRoute: null };
}

/**
 * Inverse — collapse the split shape back into a single string for
 * legacy storage. Real PackageId wins; otherwise emit the legacy alias.
 */
export function joinPackageIdField(s: SplitPackageId): string | null {
  if (s.packageId) return s.packageId;
  if (s.legacyTierRoute) return s.legacyTierRoute;
  return null;
}
