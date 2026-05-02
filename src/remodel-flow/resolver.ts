import { CATEGORIES, PACKAGES, getOption } from "./catalog";
import type { RemodelFlowState, TierId } from "./types";

export interface ResolvedLineItem {
  categoryId: string;
  categoryName: string;
  optionId: string;
  optionName: string;
  estPrice: number;
  source: "package-default" | "user-selection";
}

export interface ResolvedPlan {
  tier?: TierId;
  packageName?: string;
  basePrice: number;
  items: ResolvedLineItem[];
  upgradeDelta: number;
  total: number;
}

/**
 * Resolver merges package defaults with user selections.
 * User selections always win. Unknown selections are ignored.
 */
export function resolvePlan(state: RemodelFlowState): ResolvedPlan {
  const tier = state.tier;
  const pkg = tier ? PACKAGES[tier] : undefined;
  const basePrice = pkg?.basePrice ?? 0;

  const items: ResolvedLineItem[] = CATEGORIES.map((cat) => {
    const userOptId = state.selections[cat.id];
    const defaultOptId = pkg?.defaults[cat.id];
    const chosenId = userOptId || defaultOptId;
    if (!chosenId) return null;
    const opt = getOption(cat.id, chosenId);
    if (!opt) return null;
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      optionId: opt.id,
      optionName: opt.name,
      estPrice: opt.estPrice,
      source: userOptId ? "user-selection" : "package-default",
    } satisfies ResolvedLineItem;
  }).filter((x): x is ResolvedLineItem => Boolean(x));

  const defaultsTotal = CATEGORIES.reduce((sum, cat) => {
    const defId = pkg?.defaults[cat.id];
    const opt = defId ? getOption(cat.id, defId) : undefined;
    return sum + (opt?.estPrice ?? 0);
  }, 0);
  const itemsTotal = items.reduce((sum, i) => sum + i.estPrice, 0);
  const upgradeDelta = itemsTotal - defaultsTotal;

  return {
    tier,
    packageName: pkg?.name,
    basePrice,
    items,
    upgradeDelta,
    total: basePrice + upgradeDelta,
  };
}
