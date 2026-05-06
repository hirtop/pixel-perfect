/**
 * Pass 7 — Production-safe telemetry for unknown packageId cases.
 *
 * No new vendor / dependency. If a future pass wires Sentry/PostHog/etc.,
 * replace the body of `emit()` — the call sites stay the same.
 *
 * Behavior:
 *   - DEV: console.warn with full context.
 *   - PROD: console.warn with the stable event name + non-PII payload so
 *     it shows up in browser logs / RUM tools without spamming.
 *   - De-duped per session per (source, value).
 */

export type UnknownPackageIdSource =
  | "localStorage"
  | "db-row"
  | "project-picker"
  | "serializer"
  | "saved-project"
  | "unknown";

export interface UnknownPackageIdEvent {
  value: string | null | undefined;
  source: UnknownPackageIdSource;
  route?: string;
}

export const UNKNOWN_PACKAGE_ID_EVENT = "package_engine.unknown_package_id";

const seen: Set<string> = new Set();

function emit(payload: {
  event: string;
  value: string;
  source: UnknownPackageIdSource;
  route?: string;
}): void {
  // Hook point for analytics vendors. Intentionally no-op by default
  // beyond a stable console line so production logs are searchable.
  try {
    // eslint-disable-next-line no-console
    console.warn(payload.event, payload);
  } catch {
    /* ignore */
  }
}

/**
 * Report an unknown / unparseable packageId. Safe to call from anywhere
 * (server-rendered, tests, prod, dev).
 */
export function reportUnknownPackageId(evt: UnknownPackageIdEvent): void {
  const value = evt.value == null ? "" : String(evt.value);
  if (!value) return; // empty / null is not "unknown", just absent
  const key = `${evt.source}::${value}`;
  if (seen.has(key)) return;
  seen.add(key);
  emit({
    event: UNKNOWN_PACKAGE_ID_EVENT,
    value,
    source: evt.source,
    route: evt.route,
  });
}

/** Test-only: clear the per-session dedupe set. */
export function __resetUnknownPackageIdTelemetryForTests(): void {
  seen.clear();
}
