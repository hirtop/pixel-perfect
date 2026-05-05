import { describe, it, expect } from "vitest";
import { serializeForDb, deserializeFromDb, type DesignRow } from "@/remodel-flow/persistence/serializer";
import { resolveResumeRoute } from "@/lib/resumeRoute";
import { buildRenderRequest } from "@/remodel-flow/render";
import {
  EMPTY_BINS,
  PACKAGE_MANIFEST,
  getPackage,
  parsePackageId,
} from "@/remodel-flow/package-engine";
import type { RemodelFlowState } from "@/remodel-flow/types";
import type { PackageId } from "@/remodel-flow/package-engine/types";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";

const baseState = (overrides: Partial<RemodelFlowState> = {}): RemodelFlowState => ({
  selections: {},
  ...overrides,
});

describe("Pass 5 — RemodelFlowState split", () => {
  it("packageId accepts only PackageId | null (compile-time)", () => {
    const a: RemodelFlowState["packageId"] = "modern-balanced";
    const b: RemodelFlowState["packageId"] = null;
    expect(a).toBe("modern-balanced");
    expect(b).toBeNull();
    // @ts-expect-error — bare tier alias is not a PackageId
    const bad: RemodelFlowState["packageId"] = "balanced";
    expect(bad).toBe("balanced");
  });

  it("legacyTierRoute accepts tier values", () => {
    const a: RemodelFlowState["legacyTierRoute"] = "balanced";
    const b: RemodelFlowState["legacyTierRoute"] = null;
    expect(a).toBe("balanced");
    expect(b).toBeNull();
  });
});

describe("Pass 5 — serializer migration fixtures", () => {
  it("legacy alias only: packageId='balanced' → moved to legacyTierRoute on read", () => {
    const row: DesignRow = {
      selected_package_id: "balanced",
      selections: {},
    };
    const { state } = deserializeFromDb(row);
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBe("balanced");
  });

  it("real packageId only: packageId='modern-balanced' → kept in packageId", () => {
    const row: DesignRow = {
      selected_package_id: "modern-balanced",
      selections: {},
    };
    const { state } = deserializeFromDb(row);
    expect(state.packageId).toBe("modern-balanced");
    expect(state.legacyTierRoute).toBeNull();
  });

  it("both fields present: explicit legacy column wins for legacyTierRoute", () => {
    const row: DesignRow = {
      selected_package_id: "modern-balanced",
      selected_legacy_tier_route: "balanced",
      selections: {},
    };
    const { state } = deserializeFromDb(row);
    expect(state.packageId).toBe("modern-balanced");
    expect(state.legacyTierRoute).toBe("balanced");
  });

  it("neither present: both null", () => {
    const { state } = deserializeFromDb({ selections: {} });
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBeNull();
  });

  it("invalid value: both null", () => {
    const { state } = deserializeFromDb({ selected_package_id: "garbage", selections: {} });
    expect(state.packageId).toBeNull();
    expect(state.legacyTierRoute).toBeNull();
  });

  it("write: legacy alias accidentally in packageId is split out", () => {
    const row = serializeForDb(
      baseState({ packageId: "balanced" as unknown as PackageId, tier: "balanced" }),
    );
    expect(row.selected_package_id).toBeNull();
    expect(row.selected_legacy_tier_route).toBe("balanced");
  });

  it("write: real packageId persists; legacy stays null", () => {
    const row = serializeForDb(
      baseState({ packageId: "modern-balanced", style: "modern", tier: "balanced" }),
    );
    expect(row.selected_package_id).toBe("modern-balanced");
    expect(row.selected_legacy_tier_route).toBeNull();
  });

  it("write: both fields explicit", () => {
    const row = serializeForDb(
      baseState({ packageId: "modern-balanced", legacyTierRoute: "balanced" }),
    );
    expect(row.selected_package_id).toBe("modern-balanced");
    expect(row.selected_legacy_tier_route).toBe("balanced");
  });
});

describe("Pass 5 — resolveResumeRoute four cases", () => {
  it("A. curated packageId → /customize/<tier>", () => {
    const route = resolveResumeRoute({
      step: "customize",
      packageId: "modern-balanced",
    });
    expect(route).toBe("/customize/balanced");
  });

  it("A. curated packageId → /package/<tier> for package-detail", () => {
    const route = resolveResumeRoute({
      step: "package-detail",
      packageId: "modern-balanced",
    });
    expect(route).toBe("/package/balanced");
  });

  it("B. placeholder packageId → /options (never curated UI)", () => {
    const route = resolveResumeRoute({
      step: "customize",
      packageId: "classic-balanced",
    });
    expect(route).toBe("/options");
  });

  it("C. legacyTierRoute only → legacy tier flow", () => {
    expect(resolveResumeRoute({ step: "customize", legacyTierRoute: "balanced" })).toBe(
      "/customize/balanced",
    );
    expect(resolveResumeRoute({ step: "package-detail", legacyTierRoute: "premium" })).toBe(
      "/package/premium",
    );
  });

  it("C. backwards-compat: legacy `tier` field still works", () => {
    expect(resolveResumeRoute({ step: "customize", tier: "balanced" })).toBe(
      "/customize/balanced",
    );
  });

  it("D. neither → /options for package steps", () => {
    expect(resolveResumeRoute({ step: "customize" })).toBe("/options");
    expect(resolveResumeRoute({ step: "package-detail" })).toBe("/options");
  });

  it("static steps still resolve correctly", () => {
    expect(resolveResumeRoute({ step: "start" })).toBe("/start");
    expect(resolveResumeRoute({ step: "summary" })).toBe("/summary");
  });

  it("legacy alias accidentally passed as packageId is treated as legacy", () => {
    const route = resolveResumeRoute({
      step: "customize",
      packageId: "balanced",
    });
    expect(route).toBe("/customize/balanced");
  });
});

describe("Pass 5 — render payload sanitization", () => {
  it("never sends a legacy alias as selected_package_id", () => {
    const req = buildRenderRequest({
      state: baseState({
        packageId: "balanced" as unknown as PackageId, // simulate corrupt state
        tier: "balanced",
        style: "modern",
      }),
    });
    expect(req.selected_package_id).toBeNull();
    expect(req.selected_tier).toBe("balanced");
  });

  it("forwards real PackageId untouched", () => {
    const req = buildRenderRequest({
      state: baseState({ packageId: "modern-balanced", style: "modern", tier: "balanced" }),
    });
    expect(req.selected_package_id).toBe("modern-balanced");
  });

  it("emits null when no packageId is set", () => {
    const req = buildRenderRequest({ state: baseState({ tier: "balanced" }) });
    expect(req.selected_package_id).toBeNull();
  });

  it("never sends 'essential' or 'premium' as packageId", () => {
    for (const alias of ["essential", "premium"] as const) {
      const req = buildRenderRequest({
        state: baseState({ packageId: alias as unknown as PackageId, tier: alias }),
      });
      expect(req.selected_package_id).toBeNull();
    }
  });
});

describe("Pass 5 — curated-bin invariant", () => {
  // Modern Balanced is the only curated package today. Build a list of its
  // bin keys and verify none collides with EMPTY_BINS and all are sane.
  const curatedPackages = PACKAGE_MANIFEST.filter((p) => p.status === "curated");

  it("at least one curated package exists", () => {
    expect(curatedPackages.length).toBeGreaterThan(0);
    expect(curatedPackages.find((p) => p.id === "modern-balanced")).toBeTruthy();
  });

  it("modern-balanced has no PLACEHOLDER bin that lives in EMPTY_BINS", () => {
    // EMPTY_BINS reflects raw-catalog gaps. A curated package may still
    // declare a bin in that set IF it ships its own inline product data
    // (sourcing: "ready"). The invariant only fails when a curated bin
    // is BOTH in EMPTY_BINS AND has sourcing !== "ready" (i.e. it has
    // nowhere to source products from).
    const offenders: string[] = [];
    for (const [key, bin] of Object.entries(MODERN_BALANCED.bins) as [
      string,
      { sourcing: string },
    ][]) {
      if ((EMPTY_BINS as readonly string[]).includes(key) && bin.sourcing !== "ready") {
        offenders.push(`${key} (sourcing=${bin.sourcing})`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("classic-balanced is placeholder and is NOT exposed as curated", () => {
    expect(getPackage("classic-balanced")?.status).toBe("placeholder");
  });

  it("every curated PackageId parses correctly", () => {
    for (const p of curatedPackages) {
      expect(parsePackageId(p.id)).toBeTruthy();
    }
  });
});
