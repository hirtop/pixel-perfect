/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Phase 2.1 dev-only flag. When `"true"` AND `import.meta.env.DEV` is
   * `true`, the `/customize` drawer sources covered Modern + Balanced
   * categories from the package engine. Production builds ignore this
   * flag entirely (the gate is statically false → tree-shaken).
   *
   * Set in `.env.local` (gitignored). Never set in production.
   */
  readonly VITE_BOBOX_ENGINE_DRAWER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
