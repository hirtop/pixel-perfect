import { describe, it, expect } from "vitest";
import {
  resolvePackageIdFromUrl,
  urlIdToTier,
} from "../urlPackageRoute";

describe("urlPackageRoute.urlIdToTier", () => {
  it("aliases essential and budget to essential", () => {
    expect(urlIdToTier("essential")).toBe("essential");
    expect(urlIdToTier("budget")).toBe("essential");
    expect(urlIdToTier("BUDGET")).toBe("essential");
  });
  it("recognizes balanced and premium", () => {
    expect(urlIdToTier("balanced")).toBe("balanced");
    expect(urlIdToTier("premium")).toBe("premium");
  });
  it("returns null for unknown / missing", () => {
    expect(urlIdToTier("foo")).toBeNull();
    expect(urlIdToTier("")).toBeNull();
    expect(urlIdToTier(null)).toBeNull();
    expect(urlIdToTier(undefined)).toBeNull();
  });
});

describe("urlPackageRoute.resolvePackageIdFromUrl", () => {
  it("balanced + modern → modern-balanced (curated)", () => {
    expect(resolvePackageIdFromUrl("balanced", { style: "modern" })).toBe(
      "modern-balanced",
    );
  });

  it("balanced + spa → null (placeholder, not customer-ready)", () => {
    expect(resolvePackageIdFromUrl("balanced", { style: "spa" })).toBeNull();
  });

  it("balanced + classic → null (placeholder)", () => {
    expect(resolvePackageIdFromUrl("balanced", { style: "classic" })).toBeNull();
  });

  it("balanced + traditional → null (no curated package)", () => {
    expect(
      resolvePackageIdFromUrl("balanced", { style: "traditional" }),
    ).toBeNull();
  });

  it("essential + modern → null (no curated essential package yet)", () => {
    expect(resolvePackageIdFromUrl("essential", { style: "modern" })).toBeNull();
    expect(resolvePackageIdFromUrl("budget", { style: "modern" })).toBeNull();
  });

  it("premium + modern → null (no curated premium package yet)", () => {
    expect(resolvePackageIdFromUrl("premium", { style: "modern" })).toBeNull();
  });

  it("returns null when style is missing/ambiguous", () => {
    expect(resolvePackageIdFromUrl("balanced", {})).toBeNull();
    expect(resolvePackageIdFromUrl("balanced", { style: "" })).toBeNull();
    expect(resolvePackageIdFromUrl("balanced", { style: "futuristic" })).toBeNull();
  });

  it("returns null for unknown URL id", () => {
    expect(resolvePackageIdFromUrl("foo", { style: "modern" })).toBeNull();
    expect(resolvePackageIdFromUrl(null, { style: "modern" })).toBeNull();
  });
});
