/**
 * EMPTY_BINS — canonical BinKeys that have ZERO products in the live
 * catalog right now. Documented explicitly so invariant tests can
 * distinguish "intentionally empty" from "accidentally empty".
 *
 * Hard rule: no package may declare a required slot for a bin in this
 * list until products are sourced for it.
 *
 * Update this list (and the matching invariant test) any time the
 * underlying catalog gains real products in one of these bins.
 */

import type { BinKey } from "./types";

export const EMPTY_BINS: readonly BinKey[] = ["toilet", "heatedFloor"] as const;

export function isEmptyBin(key: BinKey): boolean {
  return (EMPTY_BINS as readonly string[]).includes(key);
}
