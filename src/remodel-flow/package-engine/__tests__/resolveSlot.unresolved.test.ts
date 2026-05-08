/**
 * Branch tests for resolveSlot's fallback + unresolved paths.
 *
 * These live in a separate file so we can mock `isProductUsable` without
 * affecting the happy-path / id-determinism tests in resolveSlot.test.ts.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../fallbacks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../fallbacks")>();
  return { ...actual, isProductUsable: vi.fn(actual.isProductUsable) };
});

import { resolveSlot } from "../resolveSlot";
import * as fallbacks from "../fallbacks";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import type { Bin } from "@/remodel-flow/packages/modern-balanced";

const usable = vi.mocked(fallbacks.isProductUsable);

beforeEach(() => {
  usable.mockReset();
});
afterEach(() => {
  usable.mockReset();
});

describe("resolveSlot — fallback to usable alternative", () => {
  it("isFallback=true, isUnresolved=false when primary is unusable but an alternative is usable", () => {
    // First call = primary check (false), then findIndex on alternatives.
    let call = 0;
    usable.mockImplementation(() => {
      call += 1;
      // 1: primary -> unusable, 2: first alt -> usable
      return call !== 1;
    });
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    expect(slot.isFallback).toBe(true);
    expect(slot.isUnresolved).toBe(false);
    expect(slot.product).toBeDefined();
    // The substituted product should NOT be the original primary.
    expect(slot.alternatives.length).toBe(bin.backups.length - 1);
  });
});

describe("resolveSlot — unresolved (nothing usable)", () => {
  it("isFallback=true, isUnresolved=true when primary and all alternatives are unusable", () => {
    usable.mockReturnValue(false);
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    expect(slot).toBeDefined();
    expect(slot.product).toBeDefined();
    expect(slot.isFallback).toBe(true);
    expect(slot.isUnresolved).toBe(true);
    // Alternatives are still surfaced safely even when unresolved.
    expect(slot.alternatives.length).toBe(bin.backups.length);
  });

  it("does not throw with thin synthetic bins where everything is unusable", () => {
    usable.mockReturnValue(false);
    const bin: Bin = {
      sourcing: "ready",
      primary: { name: "Gone A", priceRange: [10, 20] },
      backups: [{ name: "Gone B", priceRange: [10, 20] }],
    } as unknown as Bin;
    expect(() => resolveSlot("modern-balanced", "vanity", bin)).not.toThrow();
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    expect(slot.isUnresolved).toBe(true);
    expect(slot.isFallback).toBe(true);
  });
});

describe("resolveSlot — happy path under mock", () => {
  it("isFallback=false, isUnresolved=false when primary is usable", () => {
    usable.mockReturnValue(true);
    const bin = MODERN_BALANCED.bins.vanity as Bin;
    const slot = resolveSlot("modern-balanced", "vanity", bin);
    expect(slot.isFallback).toBe(false);
    expect(slot.isUnresolved).toBe(false);
  });
});
