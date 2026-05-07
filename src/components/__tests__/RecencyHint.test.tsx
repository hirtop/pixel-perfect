import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRecency, willRecencyRender } from "../RecencyHint";

const NOW = "2026-05-07T12:00:00.000Z";
const nowMs = Date.parse(NOW);
const iso = (offsetMs: number) => new Date(nowMs - offsetMs).toISOString();

const useNow = () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
};

afterEach(() => {
  vi.useRealTimers();
});

describe("formatRecency", () => {
  it("returns null for missing/invalid date", () => {
    expect(formatRecency(null)).toBeNull();
    expect(formatRecency(undefined)).toBeNull();
    expect(formatRecency("")).toBeNull();
    expect(formatRecency("not-a-date")).toBeNull();
  });

  describe("boundaries", () => {
    it("0 minutes -> just now", () => {
      useNow();
      expect(formatRecency(iso(0))).toBe("Last edited just now.");
    });
    it("59 minutes -> just now", () => {
      useNow();
      expect(formatRecency(iso(59 * 60 * 1000))).toBe("Last edited just now.");
    });
    it("60 minutes -> 1 hour ago", () => {
      useNow();
      expect(formatRecency(iso(60 * 60 * 1000))).toBe("Last edited 1 hour ago.");
    });
    it("23 hours -> 23 hours ago", () => {
      useNow();
      expect(formatRecency(iso(23 * 60 * 60 * 1000))).toBe("Last edited 23 hours ago.");
    });
    it("24 hours -> 1 day ago", () => {
      useNow();
      expect(formatRecency(iso(24 * 60 * 60 * 1000))).toBe("Last edited 1 day ago.");
    });
    it("6 days 23 hours -> 6 days ago", () => {
      useNow();
      expect(formatRecency(iso((6 * 24 + 23) * 60 * 60 * 1000))).toBe("Last edited 6 days ago.");
    });
    it("7 days -> null", () => {
      useNow();
      expect(formatRecency(iso(7 * 24 * 60 * 60 * 1000))).toBeNull();
    });
  });

  describe("plurals", () => {
    it("1 hour (singular)", () => {
      useNow();
      expect(formatRecency(iso(60 * 60 * 1000))).toBe("Last edited 1 hour ago.");
    });
    it("2 hours (plural)", () => {
      useNow();
      expect(formatRecency(iso(2 * 60 * 60 * 1000))).toBe("Last edited 2 hours ago.");
    });
    it("1 day (singular)", () => {
      useNow();
      expect(formatRecency(iso(24 * 60 * 60 * 1000))).toBe("Last edited 1 day ago.");
    });
    it("6 days (plural)", () => {
      useNow();
      expect(formatRecency(iso(6 * 24 * 60 * 60 * 1000))).toBe("Last edited 6 days ago.");
    });
    it("never renders awkward 1 hours / 1 days / hour(s) / day(s)", () => {
      useNow();
      const samples = [
        formatRecency(iso(60 * 60 * 1000)),
        formatRecency(iso(2 * 60 * 60 * 1000)),
        formatRecency(iso(24 * 60 * 60 * 1000)),
        formatRecency(iso(3 * 24 * 60 * 60 * 1000)),
      ].join(" | ");
      expect(samples).not.toMatch(/1 hours/);
      expect(samples).not.toMatch(/1 days/);
      expect(samples).not.toMatch(/hour\(s\)/);
      expect(samples).not.toMatch(/day\(s\)/);
    });
  });

  describe("future tolerance", () => {
    it("0–60s in the future renders just now", () => {
      useNow();
      expect(formatRecency(iso(-1_000))).toBe("Last edited just now.");
      expect(formatRecency(iso(-60_000))).toBe("Last edited just now.");
    });
    it(">60s in the future renders null", () => {
      useNow();
      expect(formatRecency(iso(-61_000))).toBeNull();
      expect(formatRecency(iso(-5 * 60_000))).toBeNull();
    });
  });

  it("willRecencyRender mirrors formatRecency", () => {
    useNow();
    expect(willRecencyRender(iso(0))).toBe(true);
    expect(willRecencyRender(iso(7 * 24 * 60 * 60 * 1000))).toBe(false);
    expect(willRecencyRender(null)).toBe(false);
  });
});
