/**
 * URL → package mapper.
 *
 * Maps the legacy `/customize/:id` and `/package/:id` route slugs plus
 * the project's selected style into a curated package-engine `PackageId`,
 * or `null` when no curated package can serve that combination.
 *
 * Hard rules:
 *  - Never returns a placeholder/partial package id — only `curated`.
 *  - Returns `null` when style is missing/ambiguous (no guessing).
 *  - Returns `null` for unknown URL ids.
 *  - This module is read-only and pure; it does not touch UI or state.
 */

import type { PackageId, Tier } from "./types";
import { normalizeStyle, normalizeTier } from "./normalize";
import { getPackageManifest, isCustomerReadyPackage } from "./registry";

/** Canonicalize a `/customize/:id` slug into a Tier, with `essential`/`budget` aliasing. */
export function urlIdToTier(urlId: string | null | undefined): Tier | null {
  if (!urlId) return null;
  const v = String(urlId).trim().toLowerCase();
  // `budget` is a legacy alias used by /customize/budget; treat as essential.
  if (v === "budget") return "essential";
  const t = normalizeTier(v);
  return t ?? null;
}

export interface ResolveOpts {
  /** Free-text style from `project.style_preferences.style`. */
  style?: string | null;
}

/**
 * Resolve a curated `PackageId` for the given URL slug + project style.
 * Returns `null` if no curated package matches.
 */
export function resolvePackageIdFromUrl(
  urlId: string | null | undefined,
  opts: ResolveOpts = {},
): PackageId | null {
  const tier = urlIdToTier(urlId);
  if (!tier) return null;

  const style = normalizeStyle(opts.style ?? undefined);
  if (!style) return null;

  const candidate = `${style}-${tier}` as PackageId;
  const entry = getPackageManifest(candidate);
  if (!entry) return null;
  if (!isCustomerReadyPackage(entry)) return null;
  return candidate;
}
