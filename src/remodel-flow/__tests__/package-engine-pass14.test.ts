/**
 * Pass 14 — Legacy public.projects write-path telemetry + deprecation marker
 * guardrail.
 *
 * Audit-only behavior change: every legacy public.projects write call site
 * now emits `package_engine.legacy_write` (deduped per source+code) and is
 * tagged with the `@deprecated-legacy-write — Pass 14` marker. No runtime
 * behavior, schema, routes, auth, payments, checkout, LK, or curation
 * changes.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  reportLegacyWrite,
  LEGACY_WRITE_EVENT,
  __resetLegacyWriteTelemetryForTests,
} from "@/remodel-flow/package-engine/telemetry";

describe("Pass 14 — legacy public.projects write telemetry", () => {
  beforeEach(() => {
    __resetLegacyWriteTelemetryForTests();
  });

  it("emits once per (source, code)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportLegacyWrite({ source: "ProjectContext.saveProjectInternal", code: "insert" });
    reportLegacyWrite({ source: "ProjectContext.saveProjectInternal", code: "insert" });
    const ours = warn.mock.calls.filter((c) => c[0] === LEGACY_WRITE_EVENT);
    expect(ours.length).toBe(1);
    warn.mockRestore();
  });

  it("emits separately for distinct source or code", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportLegacyWrite({ source: "ProjectContext.saveProjectInternal", code: "insert" });
    reportLegacyWrite({ source: "ProjectContext.saveProjectInternal", code: "update" });
    reportLegacyWrite({ source: "useUserProjects.deleteProject", code: "delete" });
    reportLegacyWrite({ source: "BathroomAssessment", code: "update" });
    const ours = warn.mock.calls.filter((c) => c[0] === LEGACY_WRITE_EVENT);
    expect(ours.length).toBe(4);
    warn.mockRestore();
  });

  it("payload only contains allowed non-PII keys", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportLegacyWrite({
      source: "ProjectContext.saveProjectInternal",
      code: "insert",
      route: "/start",
    });
    const call = warn.mock.calls.find((c) => c[0] === LEGACY_WRITE_EVENT);
    expect(call).toBeTruthy();
    const payload = call![1] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ["code", "event", "route", "source"].sort(),
    );
    expect(payload.event).toBe(LEGACY_WRITE_EVENT);
    for (const k of [
      "email",
      "name",
      "user_id",
      "project_name",
      "row",
      "payload",
      "message",
      "photos",
    ]) {
      expect(payload[k]).toBeUndefined();
    }
    warn.mockRestore();
  });
});

describe("Pass 14 — @deprecated-legacy-write marker guardrail", () => {
  const root = process.cwd();
  const files = [
    "src/contexts/ProjectContext.tsx",
    "src/hooks/useUserProjects.ts",
    "src/pages/BathroomAssessment.tsx",
  ];

  for (const rel of files) {
    it(`every public.projects write in ${rel} has the marker nearby`, () => {
      const content = readFileSync(join(root, rel), "utf8");
      const lines = content.split("\n");
      const writeRegex = /\.from\(["']projects["']\)/;
      for (let i = 0; i < lines.length; i++) {
        if (!writeRegex.test(lines[i])) continue;
        // Look for the marker within the previous 10 lines.
        const window = lines.slice(Math.max(0, i - 10), i).join("\n");
        expect(window).toContain("@deprecated-legacy-write — Pass 14");
      }
    });
  }
});
