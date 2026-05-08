/**
 * Phase 2.1 dev-only feature flag — gates the package-engine data path
 * for `/customize`. Production builds MUST NOT enable this; the gate
 * is statically false outside DEV so Vite tree-shakes the engine path
 * out of production bundles.
 *
 * Hard rules (mirrored from Phase 2.1 plan):
 *  - Build-time only. Never read from URL query.
 *  - Never read from localStorage.
 *  - Defaults OFF when the env var is unset.
 *  - Set via `.env.local` (gitignored). Never edit `.env`.
 *
 * Usage:
 *   import { ENGINE_DRAWER_ENABLED } from "@/remodel-flow/package-engine/engineDrawerFlag";
 *   if (ENGINE_DRAWER_ENABLED) { ... }
 */

export const ENGINE_DRAWER_ENABLED: boolean =
  import.meta.env.DEV && import.meta.env.VITE_BOBOX_ENGINE_DRAWER === "true";

/**
 * Test-only helper. Mirrors the production gate's semantics so tests
 * can verify behavior without depending on Vite's static replacement.
 * NOT used by production code paths.
 */
export function computeEngineDrawerEnabled(env: {
  DEV?: boolean;
  VITE_BOBOX_ENGINE_DRAWER?: string;
}): boolean {
  return env.DEV === true && env.VITE_BOBOX_ENGINE_DRAWER === "true";
}
