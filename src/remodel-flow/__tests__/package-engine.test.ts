import { describe, it, expect } from "vitest";
import {
  normalizeTier,
  normalizeStyle,
  normalizeBinKey,
  parsePackageId,
  makePackageId,
  getPackageManifest,
  isCurated,
  isLegacyRouteAlias,
  PACKAGE_MANIFEST,
  LEGACY_ROUTE_ALIASES,
  normalizeProduct,
  BIN_KEYS,
} from "../package-engine";

describe("package-engine: normalizeTier", () => {
  it("Balanced → balanced", () => expect(normalizeTier("Balanced")).toBe("balanced"));
  it("budget → essential", () => expect(normalizeTier("budget")).toBe("essential"));
  it("Premium → premium", () => expect(normalizeTier("Premium")).toBe("premium"));
  it("garbage → undefined", () => expect(normalizeTier("garbage")).toBeUndefined());
  it("null → undefined", () => expect(normalizeTier(null)).toBeUndefined());
});

describe("package-engine: parsePackageId / makePackageId", () => {
  it("classic-balanced parses", () => {
    expect(parsePackageId("classic-balanced")).toEqual({ style: "classic", tier: "balanced" });
  });
  it("garbage → undefined", () => expect(parsePackageId("garbage")).toBeUndefined());
  it("makePackageId roundtrip", () => {
    expect(makePackageId("Modern", "Balanced")).toBe("modern-balanced");
  });
  it("normalizeStyle rejects unknown", () => expect(normalizeStyle("brutalist")).toBeUndefined());
});

describe("package-engine: normalizeBinKey", () => {
  it("Shower Wall Tile → showerWallTile", () =>
    expect(normalizeBinKey("Shower Wall Tile")).toBe("showerWallTile"));
  it("Bathtubs → bathtub", () => expect(normalizeBinKey("Bathtubs")).toBe("bathtub"));
  it("Shower Systems → showerSystem", () =>
    expect(normalizeBinKey("Shower Systems")).toBe("showerSystem"));
  it("Heated Floors → heatedFloor", () =>
    expect(normalizeBinKey("Heated Floors")).toBe("heatedFloor"));
  it("shower glass → showerDoor (alias)", () =>
    expect(normalizeBinKey("shower glass")).toBe("showerDoor"));
  it("shower niche → undefined", () =>
    expect(normalizeBinKey("shower niche")).toBeUndefined());
  it("shower trim → undefined (ambiguous)", () =>
    expect(normalizeBinKey("shower trim")).toBeUndefined());
  it("16 canonical bin keys", () => expect(BIN_KEYS).toHaveLength(16));
});

describe("package-engine: registry", () => {
  it("manifest has only real packages", () => {
    const ids = PACKAGE_MANIFEST.map((e) => e.id);
    expect(ids).not.toContain("essential");
    expect(ids).not.toContain("balanced");
    expect(ids).not.toContain("premium");
  });
  it("modern-balanced is curated", () => {
    expect(getPackageManifest("modern-balanced")?.status).toBe("curated");
    expect(isCurated("modern-balanced")).toBe(true);
  });
  it("classic-balanced not curated", () => expect(isCurated("classic-balanced")).toBe(false));
  it("does-not-exist returns undefined", () =>
    expect(getPackageManifest("does-not-exist")).toBeUndefined());
  it("legacy aliases recognised", () => {
    expect(isLegacyRouteAlias("balanced")).toBe(true);
    expect(LEGACY_ROUTE_ALIASES.balanced.tier).toBe("balanced");
  });
});

describe("package-engine: normalizeProduct", () => {
  it("preserves raw, normalizes tier, maps binKey", () => {
    const raw = { id: "x1", name: "X", category: "Bathtubs", tier: "Balanced", styles: ["modern"] };
    const n = normalizeProduct(raw);
    expect(n.raw).toBe(raw);
    expect(n.tier).toBe("balanced");
    expect(n.binKey).toBe("bathtub");
    expect(n.displayCategory).toBe("Bathtubs");
    expect(n.styles).toEqual(["modern"]);
  });
  it("untagged product returns styles: []", () => {
    const n = normalizeProduct({ id: "y", name: "Y", category: "Faucets" });
    expect(n.styles).toEqual([]);
    expect(n.binKey).toBe("faucet");
    expect(n.tier).toBeNull();
  });
  it("unmappable category → binKey null", () => {
    const n = normalizeProduct({ id: "z", name: "Z", category: "Shower Niche" });
    expect(n.binKey).toBeNull();
  });
  it("does not crash on empty input", () => {
    expect(() => normalizeProduct({})).not.toThrow();
    expect(() => normalizeProduct(null)).not.toThrow();
  });
});
