/**
 * Pass 7 fix-pass — architectural guardrail.
 *
 * Asserts that next-gen entry points do NOT read `selected_package.tier`
 * directly. Centralized read sites (projectIdentity.ts, serializer.ts)
 * and explicitly-legacy pages are allow-listed.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "src");
const NEEDLE = /selected_package\s*[?.]?\.\s*tier/;

const ALLOW = new Set<string>([
  // Centralized normalizer — the only nextgen module allowed to read it.
  "remodel-flow/package-engine/projectIdentity.ts",
  // Persistence layer migrating legacy DesignRow shapes.
  "remodel-flow/persistence/serializer.ts",
  // Test fixtures + tests intentionally exercise the legacy shape.
  // Anything under __tests__ or fixtures/ is allowed.
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("architectural guardrail: selected_package.tier reads", () => {
  it("only allow-listed modules read selected_package.tier directly", () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (rel.includes("__tests__/")) continue;
      if (rel.includes("/fixtures/")) continue;
      // Legacy ProjectContext + legacy pages predating remodel-flow are
      // permitted to keep their legacy reads. Scope strictly to nextgen.
      if (!rel.startsWith("remodel-flow/")) continue;
      if (ALLOW.has(rel)) continue;
      const src = readFileSync(file, "utf8");
      if (NEEDLE.test(src)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });
});
