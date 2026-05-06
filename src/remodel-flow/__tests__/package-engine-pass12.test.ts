/**
 * Pass 12 — Telemetry / observability hookup audit.
 *
 * No vendor (Sentry/PostHog/etc.) is installed today; this pass centralizes
 * the useUserProjects degradation warning through telemetry.ts so a future
 * vendor wired into `emit()` automatically picks it up.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  reportRemodelDesignsReadFailed,
  REMODEL_DESIGNS_READ_FAILED_EVENT,
  __resetRemodelDesignsReadFailedTelemetryForTests,
} from "@/remodel-flow/package-engine/telemetry";

describe("Pass 12 — remodel_designs read-failure telemetry", () => {
  beforeEach(() => {
    __resetRemodelDesignsReadFailedTelemetryForTests();
  });

  it("emits the stable event name once per code", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportRemodelDesignsReadFailed({ code: "PGRST301" });
    reportRemodelDesignsReadFailed({ code: "PGRST301" });
    const ours = warn.mock.calls.filter(
      (c) => c[0] === REMODEL_DESIGNS_READ_FAILED_EVENT,
    );
    expect(ours.length).toBe(1);
    warn.mockRestore();
  });

  it("emits separately for distinct codes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportRemodelDesignsReadFailed({ code: "PGRST301" });
    reportRemodelDesignsReadFailed({ code: "42P01" });
    const ours = warn.mock.calls.filter(
      (c) => c[0] === REMODEL_DESIGNS_READ_FAILED_EVENT,
    );
    expect(ours.length).toBe(2);
    warn.mockRestore();
  });

  it("payload contains only safe non-PII properties", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportRemodelDesignsReadFailed({ code: "PGRST301", route: "/" });
    const call = warn.mock.calls.find(
      (c) => c[0] === REMODEL_DESIGNS_READ_FAILED_EVENT,
    );
    expect(call).toBeTruthy();
    const payload = call![1] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ["code", "event", "route", "source"].sort(),
    );
    expect(payload.source).toBe("useUserProjects");
    expect(payload.event).toBe(REMODEL_DESIGNS_READ_FAILED_EVENT);
    // No PII keys allowed.
    for (const k of ["email", "name", "user_id", "row", "message"]) {
      expect(payload[k]).toBeUndefined();
    }
    warn.mockRestore();
  });

  it("missing code defaults to 'unknown' and still dedupes", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportRemodelDesignsReadFailed({});
    reportRemodelDesignsReadFailed({});
    const ours = warn.mock.calls.filter(
      (c) => c[0] === REMODEL_DESIGNS_READ_FAILED_EVENT,
    );
    expect(ours.length).toBe(1);
    expect((ours[0][1] as { code: string }).code).toBe("unknown");
    warn.mockRestore();
  });
});
