/**
 * Dev-only Package Engine inspector.
 *
 * NOT wired into any route. Reachable only by manually importing
 * during local development. Renders nothing in production builds.
 *
 * Purpose: visually inspect manifest + resolveSlot output for
 * curated packages while iterating on Phase 2 (swap UI).
 */

import { PACKAGE_MANIFEST } from "@/remodel-flow/package-engine/registry";
import { resolveSlot } from "@/remodel-flow/package-engine/resolveSlot";
import { resolveImage } from "@/remodel-flow/package-engine/fallbacks";
import { MODERN_BALANCED } from "@/remodel-flow/packages/modern-balanced";
import type { BinKey } from "@/remodel-flow/package-engine/types";

export default function PackageDebugView() {
  // Defense-in-depth: there is intentionally no route and no nav link
  // to this view, but we also gate on the build-mode env so a stray
  // import in production code can never render it.
  if (import.meta.env.PROD) return null;
  if (!import.meta.env.DEV) return null;

  const modernBalancedSlots = Object.entries(MODERN_BALANCED.bins).map(
    ([key, bin]) => resolveSlot("modern-balanced", key as BinKey, bin as never),
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-sm">
      <header>
        <h1 className="font-heading text-2xl">Package Engine — Dev Inspector</h1>
        <p className="text-muted-foreground">
          Read-only view of registered packages and resolved slots.
          Not exposed in production.
        </p>
      </header>

      <section>
        <h2 className="font-medium mb-2">Registered packages ({PACKAGE_MANIFEST.length})</h2>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1 pr-3">id</th>
              <th className="py-1 pr-3">label</th>
              <th className="py-1 pr-3">status</th>
              <th className="py-1">notes</th>
            </tr>
          </thead>
          <tbody>
            {PACKAGE_MANIFEST.map((p) => (
              <tr key={p.id} className="border-b border-border/40">
                <td className="py-1 pr-3 font-mono">{p.id}</td>
                <td className="py-1 pr-3">{p.label}</td>
                <td className="py-1 pr-3">{p.status}</td>
                <td className="py-1 text-muted-foreground">{p.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-medium mb-2">
          Resolved slots — modern-balanced ({modernBalancedSlots.length})
        </h2>
        <ul className="space-y-2">
          {modernBalancedSlots.map((slot) => (
            <li key={slot.categoryId} className="border border-border rounded p-3">
              <div className="flex items-center gap-3">
                <img
                  src={resolveImage(slot.product)}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-mono text-xs text-muted-foreground">
                    {slot.categoryId}
                  </div>
                  <div>{slot.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    bin: {slot.product.bin} · price: {slot.product.price ?? "—"} ·
                    alts: {slot.alternatives.length} ·
                    fallback: {slot.isFallback ? "yes" : "no"}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
