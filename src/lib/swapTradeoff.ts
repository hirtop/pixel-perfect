/**
 * Swap tradeoff copy helper — Value Pass 5.
 *
 * Pure mapping from category + tag → short "you gain / you give up" copy
 * shown on alternative product cards in /customize/:id.
 *
 * No AI, no scoring, no catalog data. Existing tag/category strings only.
 */

export type TradeoffDirection = "value" | "upgrade" | null;

export interface TradeoffCopy {
  gain: string;
  /** "You give up" line (value picks) or "Adds to" line (upgrades). */
  cost: string;
  costLabel: "give-up" | "adds-to";
}

export const tagDirection = (tag?: string): TradeoffDirection => {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes("recommended") || t.includes("best")) return null;
  if (t.includes("value") || t.includes("budget") || t.includes("essential")) return "value";
  if (t.includes("upgrade") || t.includes("premium")) return "upgrade";
  return null;
};

const CATEGORY_COPY: Record<string, { value?: Omit<TradeoffCopy, "costLabel">; upgrade?: Omit<TradeoffCopy, "costLabel"> }> = {
  Vanities: {
    value: { gain: "lower material cost", cost: "storage or finish detail" },
    upgrade: { gain: "more storage or stronger finish presence", cost: "your material estimate." },
  },
  Faucets: {
    value: { gain: "lower fixture cost", cost: "premium profile or features" },
    upgrade: { gain: "stronger profile or extra features", cost: "your material estimate." },
  },
  "Shower Wall Tile": {
    value: { gain: "simpler material cost", cost: "larger-format look or texture" },
    upgrade: { gain: "stronger visual impact", cost: "your material estimate." },
  },
  "Shower Doors": {
    value: { gain: "lower glass/door cost", cost: "frameless or premium profile" },
    upgrade: { gain: "cleaner, more open look", cost: "your material estimate." },
  },
};

const FALLBACK = {
  value: { gain: "lower material cost", cost: "some finish detail" },
  upgrade: { gain: "higher finish or feature level", cost: "your material estimate." },
};

export const getTradeoffCopy = (category: string, tag?: string): TradeoffCopy | null => {
  const dir = tagDirection(tag);
  if (!dir) return null;
  const entry = CATEGORY_COPY[category]?.[dir] ?? FALLBACK[dir];
  return {
    gain: entry.gain,
    cost: entry.cost,
    costLabel: dir === "value" ? "give-up" : "adds-to",
  };
};
