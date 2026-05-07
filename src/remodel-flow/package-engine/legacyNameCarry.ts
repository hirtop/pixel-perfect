/**
 * Pass 20 — Pure helper that decides whether the legacy project name
 * should be carried into the first-INSERT autosave for a stamped
 * remodel_designs row.
 *
 * Rules:
 *   - Only fires on the first INSERT (caller's responsibility to gate).
 *   - Returns the trimmed legacyName when it is non-empty AND the
 *     current design name is missing/empty/the literal default
 *     ("Untitled Design").
 *   - Returns null when legacyName is empty/whitespace/null/undefined,
 *     OR when the design already has a non-default user-owned name.
 *   - Never used on UPDATE; subsequent autosaves do not pass ctx.name.
 */
export const DEFAULT_DESIGN_NAME = "Untitled Design";

export function resolveLegacyNameCarry(
  currentName: string | null | undefined,
  legacyName: string | null | undefined,
): string | null {
  const legacy = typeof legacyName === "string" ? legacyName.trim() : "";
  if (!legacy) return null;
  const current = typeof currentName === "string" ? currentName.trim() : "";
  if (current && current !== DEFAULT_DESIGN_NAME) return null;
  return legacy;
}
