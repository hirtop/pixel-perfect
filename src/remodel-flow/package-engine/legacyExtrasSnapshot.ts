/**
 * Pass 18 — Pure helper that builds a safe `legacy_extras` JSON snapshot
 * from a legacy `public.projects` row at resume-time.
 *
 * Stamped ONCE (alongside `legacy_project_id`) on the first INSERT of a
 * `remodel_designs` row that originated from a legacy projects row. NOT
 * used for backfill, NOT mutated on subsequent updates.
 *
 * Allowed fields (only included when meaningfully present):
 *   - agreement_data (signing-only; photos stripped)
 *   - subcontractor_interactions
 *   - bathroom_type
 *   - property_type
 *   - dimensions
 *   - assessment_data
 *   - notes
 *
 * Explicitly EXCLUDED (covered by next-gen schema or deferred):
 *   - customizations / customizations.categories  (→ selections)
 *   - style_preferences                           (→ selected_style/tier)
 *   - selected_package                            (→ selected_package_id)
 *   - agreement_data.photos                      (→ deferred photo pipeline)
 *   - workflow_progress                           (→ current_step/completed_steps)
 *   - user_id, email, names, image URLs, raw row
 *
 * Returns `null` when nothing meaningful remains. Never returns empty
 * objects/arrays.
 *
 * Pure function — no IO. Telemetry-only side effect when a field is
 * malformed and skipped (deduped per field/source per runtime).
 */
import type { Json } from "@/integrations/supabase/types";

export interface LegacyProjectRowForSnapshot {
  bathroom_type?: string | null;
  property_type?: string | null;
  dimensions?: unknown;
  agreement_data?: unknown;
  assessment_data?: unknown;
  notes?: unknown;
  // Legacy callers sometimes include subcontractor_interactions either at
  // the row top-level (runtime ProjectData) or nested inside agreement_data
  // (DB shape). Accept both.
  subcontractor_interactions?: unknown;
}

export interface LegacyExtras {
  agreement_data?: Record<string, unknown>;
  subcontractor_interactions?: unknown[];
  bathroom_type?: string;
  property_type?: string;
  dimensions?: Record<string, unknown>;
  assessment_data?: unknown;
  notes?: string;
}

// --- Telemetry --------------------------------------------------------------
export const LEGACY_EXTRAS_SNAPSHOT_SKIPPED_EVENT =
  "package_engine.legacy_extras_snapshot_skipped";

const skippedSeenMemory: Set<string> = new Set();

export interface LegacyExtrasSnapshotSkippedEvent {
  code: string;
  route?: string;
}

function emitSkipped(evt: LegacyExtrasSnapshotSkippedEvent): void {
  const key = `legacyExtrasSnapshot::${evt.code}`;
  if (skippedSeenMemory.has(key)) return;
  skippedSeenMemory.add(key);
  try {
    // eslint-disable-next-line no-console
    console.warn(LEGACY_EXTRAS_SNAPSHOT_SKIPPED_EVENT, {
      event: LEGACY_EXTRAS_SNAPSHOT_SKIPPED_EVENT,
      source: "legacyExtrasSnapshot",
      code: evt.code,
      route: evt.route,
    });
  } catch {
    /* ignore */
  }
}

/** Test-only. */
export function __resetLegacyExtrasSnapshotTelemetryForTests(): void {
  skippedSeenMemory.clear();
}

// --- Helpers ---------------------------------------------------------------
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// --- Main ------------------------------------------------------------------
export interface BuildLegacyExtrasOptions {
  route?: string;
}

export function buildLegacyExtrasSnapshot(
  row: LegacyProjectRowForSnapshot | null | undefined,
  opts: BuildLegacyExtrasOptions = {},
): LegacyExtras | null {
  if (!row || typeof row !== "object") return null;
  const out: LegacyExtras = {};

  // bathroom_type / property_type
  if (isNonEmptyString(row.bathroom_type)) out.bathroom_type = row.bathroom_type.trim();
  else if (row.bathroom_type != null && typeof row.bathroom_type !== "string") {
    emitSkipped({ code: "bathroom_type", route: opts.route });
  }

  if (isNonEmptyString(row.property_type)) out.property_type = row.property_type.trim();
  else if (row.property_type != null && typeof row.property_type !== "string") {
    emitSkipped({ code: "property_type", route: opts.route });
  }

  // dimensions
  if (isPlainObject(row.dimensions)) {
    if (Object.keys(row.dimensions).length > 0) {
      out.dimensions = row.dimensions;
    }
  } else if (row.dimensions != null) {
    emitSkipped({ code: "dimensions", route: opts.route });
  }

  // agreement_data — strip `photos` (deferred) and surface
  // `subcontractor_interactions` separately for clarity.
  let nestedSubs: unknown = undefined;
  if (isPlainObject(row.agreement_data)) {
    const ad = { ...row.agreement_data };
    if ("photos" in ad) delete ad.photos;
    if ("subcontractor_interactions" in ad) {
      nestedSubs = ad.subcontractor_interactions;
      delete ad.subcontractor_interactions;
    }
    if (Object.keys(ad).length > 0) {
      out.agreement_data = ad;
    }
  } else if (row.agreement_data != null) {
    emitSkipped({ code: "agreement_data", route: opts.route });
  }

  // subcontractor_interactions — top-level wins, fall back to the value
  // we extracted from agreement_data above.
  const subsRaw =
    row.subcontractor_interactions !== undefined
      ? row.subcontractor_interactions
      : nestedSubs;
  if (Array.isArray(subsRaw)) {
    if (subsRaw.length > 0) out.subcontractor_interactions = subsRaw;
  } else if (subsRaw != null) {
    emitSkipped({ code: "subcontractor_interactions", route: opts.route });
  }

  // assessment_data — opaque pass-through, only when present + non-empty.
  if (row.assessment_data !== undefined && row.assessment_data !== null) {
    if (isPlainObject(row.assessment_data)) {
      if (Object.keys(row.assessment_data).length > 0) {
        out.assessment_data = row.assessment_data;
      }
    } else if (Array.isArray(row.assessment_data)) {
      if (row.assessment_data.length > 0) {
        out.assessment_data = row.assessment_data;
      }
    } else {
      // Primitive — unexpected. Skip + telemetry.
      emitSkipped({ code: "assessment_data", route: opts.route });
    }
  }

  // notes — only a non-empty string.
  if (isNonEmptyString(row.notes)) {
    out.notes = row.notes.trim();
  } else if (row.notes != null && typeof row.notes !== "string") {
    emitSkipped({ code: "notes", route: opts.route });
  }

  if (Object.keys(out).length === 0) return null;
  return out;
}

/**
 * Convenience helper: cast the snapshot to the `Json` type expected by
 * the serializer / DB column. Returns null when there is nothing to stamp.
 */
export function legacyExtrasAsJson(
  extras: LegacyExtras | null,
): Json | null {
  if (extras == null) return null;
  return extras as unknown as Json;
}
