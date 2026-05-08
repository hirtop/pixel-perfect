import { describe, it, expect } from "vitest";
import {
  PACKAGE_MANIFEST,
  getPackage,
  isPackageRegistered,
  listPackages,
} from "../registry";
import { CANONICAL_STYLES, TIERS } from "../types";

describe("Package Engine — registry / 9-package matrix", () => {
  it("registers all 9 tier×style combos for the canonical 3 styles", () => {
    const wantedStyles = ["modern", "classic", "spa"] as const;
    for (const style of wantedStyles) {
      for (const tier of TIERS) {
        const id = `${style}-${tier}` as const;
        expect(isPackageRegistered(id), `expected ${id} registered`).toBe(true);
      }
    }
  });

  it("each manifest entry has a non-empty label and a known status", () => {
    for (const entry of PACKAGE_MANIFEST) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(["curated", "partial", "placeholder"]).toContain(entry.status);
    }
  });

  it("ids use canonical style + tier slugs", () => {
    const styleSet = new Set<string>(CANONICAL_STYLES);
    const tierSet = new Set<string>(TIERS);
    for (const entry of PACKAGE_MANIFEST) {
      const [style, tier] = entry.id.split("-");
      expect(styleSet.has(style), `unknown style: ${style}`).toBe(true);
      expect(tierSet.has(tier), `unknown tier: ${tier}`).toBe(true);
    }
  });

  it("listPackages({ status }) filters correctly", () => {
    const placeholders = listPackages({ status: "placeholder" });
    const curated = listPackages({ status: "curated" });
    expect(placeholders.length + curated.length).toBeLessThanOrEqual(
      PACKAGE_MANIFEST.length,
    );
    expect(curated.find((p) => p.id === "modern-balanced")).toBeDefined();
  });

  it("getPackage returns undefined for unknown ids", () => {
    expect(getPackage("doesnt-exist")).toBeUndefined();
  });
});
