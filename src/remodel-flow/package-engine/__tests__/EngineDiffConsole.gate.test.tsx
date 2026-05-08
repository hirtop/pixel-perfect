/**
 * Phase 2.10 — EngineDiffConsole render-gate test.
 *
 * In the vitest env, `import.meta.env.DEV` is true but neither
 * VITE_BOBOX_ENGINE_DRAWER nor VITE_BOBOX_ENGINE_DIFF are set, so
 * ENGINE_DRAWER_ENABLED and ENGINE_DIFF_ENABLED are both false. The
 * component must render nothing.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import EngineDiffConsole from "../dev/EngineDiffConsole";

describe("Phase 2.10 — EngineDiffConsole render gate", () => {
  it("returns null when ENGINE_DRAWER + ENGINE_DIFF flags are disabled", () => {
    const { container } = render(
      <EngineDiffConsole urlId="balanced" style="modern" />,
    );
    expect(container.innerHTML).toBe("");
  });
});
