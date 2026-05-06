/**
 * Pass 7 / Pass 8A — Production-safe telemetry for unknown packageId cases.
 *
 * No new vendor / dependency. If a future pass wires Sentry/PostHog/etc.,
 * replace the body of `emit()` — the call sites stay the same.
 *
 * Behavior:
 *   - DEV: console.warn with full context.
 *   - PROD: console.warn with the stable event name + non-PII payload so
 *     it shows up in browser logs / RUM tools without spamming.
 *   - De-duped per browser tab/session per (source, value), persisted via
 *     sessionStorage so reloads in the same tab do NOT re-emit.
 *   - Never uses localStorage (must reset when tab/session ends).
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
const SESSION_KEY = "bobox_unknown_package_id_seen_v1";

// Per-runtime in-memory dedupe (fast path, also covers SSR / no-storage envs).
const seenMemory: Set<string> = new Set();

function readSessionSet(): Set<string> {
  try {
    if (typeof sessionStorage === "undefined") return new Set();
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((v) => typeof v === "string"));
  } catch {
    /* ignore */
  }
  return new Set();
}

function writeSessionSet(set: Set<string>): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * Pass 8B — Observability plug-point.
 *
 * No observability vendor (Sentry / PostHog / Datadog / Amplitude / Mixpanel)
 * is currently installed in this project — verified by package.json and
 * source scan. Until one is added we stay on console.warn.
 *
 * To wire a vendor later, do it INSIDE this function only. Keep:
 *   - the console.warn fallback
 *   - the (source, value) sessionStorage dedupe in reportUnknownPackageId
 *   - the safe-property allowlist below (no PII)
 *
 * Allowed properties: event, value, source, route, appVersion.
 * Forbidden: user email, name, project text, uploaded images, full localStorage.
 *
 * Example future wiring:
 *   if (window.Sentry) window.Sentry.captureMessage(payload.event, { extra: payload });
 *   if (window.posthog) window.posthog.capture(payload.event, payload);
 */
function emit(payload: {
  event: string;
  value: string;
  source: UnknownPackageIdSource;
  route?: string;
  appVersion?: string;
}): void {
  try {
    // eslint-disable-next-line no-console
    console.warn(payload.event, payload);
  } catch {
    /* ignore */
  }
}

/**
 * Report an unknown / unparseable packageId. Safe to call from anywhere.
 * Deduped per (source, value) per browser tab session, persisted across
 * reloads via sessionStorage.
 */
export function reportUnknownPackageId(evt: UnknownPackageIdEvent): void {
  const value = evt.value == null ? "" : String(evt.value);
  if (!value) return;
  const key = `${evt.source}::${value}`;

  if (seenMemory.has(key)) return;

  // Cross-reload dedupe via sessionStorage.
  const sessionSeen = readSessionSet();
  if (sessionSeen.has(key)) {
    seenMemory.add(key);
    return;
  }

  seenMemory.add(key);
  sessionSeen.add(key);
  writeSessionSet(sessionSeen);

  emit({
    event: UNKNOWN_PACKAGE_ID_EVENT,
    value,
    source: evt.source,
    route: evt.route,
  });
}

/** Test-only: clear in-memory + sessionStorage dedupe. */
export function __resetUnknownPackageIdTelemetryForTests(): void {
  seenMemory.clear();
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Test-only: clear ONLY the in-memory layer (simulates a tab reload). */
export function __simulateReloadForTests(): void {
  seenMemory.clear();
}
