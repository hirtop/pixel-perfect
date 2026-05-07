import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { formatRecency } from "../RecencyHint";

describe("formatRecency", () => {
  let now: Date;
  const mockDate = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  beforeAll(() => {
    now = new Date("2026-05-07T12:00:00.000Z");
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns null for missing/invalid date", () => {
    expect(formatRecency(null)).toBeNull();
    expect(formatRecency(undefined)).toBeNull();
    expect(formatRecency("")).toBeNull();
    expect(formatRecency("not-a-date")).toBeNull();
  });

  it('returns "just now" for under 1 hour', () => {
    mockDate("2026-05-07T12:00:00.000Z");
    expect(formatRecency("2026-05-07T11:30:00.000Z")).toBe("Last edited just now.");
    expect(formatRecency("2026-05-07T11:05:00.000Z")).toBe("Last edited just now.");
    vi.useRealTimers();
  });

  it('returns "X hours ago" for 1–23 hours', () => {
    mockDate("2026-05-07T12:00:00.000Z");
    expect(formatRecency("2026-05-07T10:00:00.000Z")).toBe("Last edited 2 hours ago.");
    expect(formatRecency("2026-05-06T13:00:00.000Z")).toBe("Last edited 23 hours ago.");
    expect(formatRecency("2026-05-07T11:00:00.000Z")).toBe("Last edited 1 hour ago.");
    vi.useRealTimers();
  });

  it('returns "X days ago" for 1–6 days', () => {
    mockDate("2026-05-07T12:00:00.000Z");
    expect(formatRecency("2026-05-06T12:00:00.000Z")).toBe("Last edited 1 day ago.");
    expect(formatRecency("2026-05-01T12:00:00.000Z")).toBe("Last edited 6 days ago.");
    expect(formatRecency("2026-05-05T12:00:00.000Z")).toBe("Last edited 2 days ago.");
    vi.useRealTimers();
  });

  it("returns null for 7+ days", () => {
    mockDate("2026-05-07T12:00:00.000Z");
    expect(formatRecency("2026-04-30T12:00:00.000Z")).toBeNull(); // 7 days
    expect(formatRecency("2026-04-01T12:00:00.000Z")).toBeNull(); // 36 days
    vi.useRealTimers();
  });

  it("returns null for future dates", () => {
    mockDate("2026-05-07T12:00:00.000Z");
    expect(formatRecency("2026-05-08T12:00:00.000Z")).toBeNull();
    vi.useRealTimers();
  });
});
