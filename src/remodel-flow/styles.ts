import type { StyleId } from "./types";

/**
 * Style system compatibility scores.
 * Each style declares how well it scores material/finish tags per category.
 * Score range: 0..1. Missing tag => 0 contribution from that tag.
 */
export interface StyleProfile {
  id: StyleId;
  name: string;
  // categoryId -> tag -> score
  compatibility_scores: Record<string, Record<string, number>>;
}

const COMMON = {
  vanity: {
    oak: 0.9,
    walnut: 0.85,
    laminate: 0.4,
    stone_top: 0.7,
    floating: 0.7,
    freestanding: 0.6,
  },
  tile: {
    subway: 0.7,
    zellige: 0.8,
    marble: 0.85,
    porcelain: 0.6,
    handmade: 0.75,
    honed: 0.7,
    polished: 0.6,
  },
  fixtures: {
    chrome: 0.6,
    brushed_nickel: 0.7,
    matte_black: 0.75,
    brass: 0.7,
  },
  lighting: {
    flush: 0.5,
    sconce: 0.75,
    layered: 0.85,
    pendant: 0.7,
  },
};

export const STYLES: Record<StyleId, StyleProfile> = {
  modern: {
    id: "modern",
    name: "Modern",
    compatibility_scores: {
      vanity: { ...COMMON.vanity, floating: 0.95, oak: 0.95, walnut: 0.9, stone_top: 0.85 },
      tile: { ...COMMON.tile, porcelain: 0.85, honed: 0.9, marble: 0.8, subway: 0.5 },
      fixtures: { ...COMMON.fixtures, matte_black: 0.95, brushed_nickel: 0.8, chrome: 0.4 },
      lighting: { ...COMMON.lighting, layered: 0.95, sconce: 0.85, flush: 0.4 },
    },
  },
  classic: {
    id: "classic",
    name: "Classic",
    compatibility_scores: {
      vanity: { ...COMMON.vanity, freestanding: 0.9, stone_top: 0.95, floating: 0.4 },
      tile: { ...COMMON.tile, subway: 0.95, marble: 0.9, polished: 0.85, zellige: 0.5 },
      fixtures: { ...COMMON.fixtures, chrome: 0.95, brushed_nickel: 0.85, matte_black: 0.4 },
      lighting: { ...COMMON.lighting, sconce: 0.9, pendant: 0.7, layered: 0.7 },
    },
  },
  spa: {
    id: "spa",
    name: "Spa",
    compatibility_scores: {
      vanity: { ...COMMON.vanity, oak: 0.9, walnut: 0.95, stone_top: 0.9 },
      tile: { ...COMMON.tile, zellige: 0.95, marble: 0.9, honed: 0.95, handmade: 0.95 },
      fixtures: { ...COMMON.fixtures, brass: 0.9, brushed_nickel: 0.85, matte_black: 0.7 },
      lighting: { ...COMMON.lighting, layered: 0.9, sconce: 0.9, flush: 0.5 },
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    compatibility_scores: {
      vanity: { ...COMMON.vanity, floating: 0.95, laminate: 0.7, oak: 0.8 },
      tile: { ...COMMON.tile, porcelain: 0.9, honed: 0.85, subway: 0.7, zellige: 0.5 },
      fixtures: { ...COMMON.fixtures, matte_black: 0.85, chrome: 0.7, brass: 0.4 },
      lighting: { ...COMMON.lighting, flush: 0.8, sconce: 0.7, layered: 0.6 },
    },
  },
};
