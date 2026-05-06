import { describe, it, expect, beforeEach } from "vitest";
import {
  shouldShowLegacyDraftBanner,
  FLOW_KEY,
  LEGACY_DRAFT_KEY,
  BANNER_DISMISSED_KEY,
  hasMeaningfulLegacyDraft,
  hasMeaningfulFlowProgress,
} from "@/remodel-flow/legacyDraftBanner";

beforeEach(() => {
  localStorage.clear();
});

describe("shouldShowLegacyDraftBanner", () => {
  it("renders when legacy draft exists and no flow progress", () => {
    localStorage.setItem(
      LEGACY_DRAFT_KEY,
      JSON.stringify({ selected_package: { tier: "balanced" } }),
    );
    expect(shouldShowLegacyDraftBanner()).toBe(true);
  });

  it("does not render when dismissed", () => {
    localStorage.setItem(
      LEGACY_DRAFT_KEY,
      JSON.stringify({ selected_package: { tier: "balanced" } }),
    );
    localStorage.setItem(BANNER_DISMISSED_KEY, "1");
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("does not render when legacy draft missing", () => {
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("does not render when meaningful flow progress exists", () => {
    localStorage.setItem(
      LEGACY_DRAFT_KEY,
      JSON.stringify({ selected_package: { tier: "balanced" } }),
    );
    localStorage.setItem(
      FLOW_KEY,
      JSON.stringify({ style: "modern", selections: {} }),
    );
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("renders when flow state is fresh/default-only", () => {
    localStorage.setItem(
      LEGACY_DRAFT_KEY,
      JSON.stringify({ selected_package: { tier: "balanced" } }),
    );
    localStorage.setItem(FLOW_KEY, JSON.stringify({ selections: {} }));
    expect(shouldShowLegacyDraftBanner()).toBe(true);
  });

  it("dismissal persists across re-evaluation", () => {
    localStorage.setItem(
      LEGACY_DRAFT_KEY,
      JSON.stringify({ selected_package: { tier: "balanced" } }),
    );
    expect(shouldShowLegacyDraftBanner()).toBe(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "1");
    expect(shouldShowLegacyDraftBanner()).toBe(false);
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("ignores empty {} legacy draft", () => {
    localStorage.setItem(LEGACY_DRAFT_KEY, JSON.stringify({}));
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("ignores malformed legacy JSON", () => {
    localStorage.setItem(LEGACY_DRAFT_KEY, "not-json");
    expect(shouldShowLegacyDraftBanner()).toBe(false);
  });

  it("recognizes various meaningful legacy fields", () => {
    for (const seed of [
      { style: "modern" },
      { tier: "balanced" },
      { packageId: "modern-balanced" },
      { legacyTierRoute: "balanced" },
      { name: "My project" },
      { assessment: { score: 7 } },
      { workflow: { step: 2 } },
      { progress: 0.5 },
    ]) {
      expect(hasMeaningfulLegacyDraft(seed)).toBe(true);
    }
  });

  it("hasMeaningfulFlowProgress is false for fresh defaults", () => {
    expect(hasMeaningfulFlowProgress({ selections: {} })).toBe(false);
    expect(hasMeaningfulFlowProgress({})).toBe(false);
  });
});
