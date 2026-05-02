import { supabase } from "@/integrations/supabase/client";
import type { RemodelFlowState } from "../types";
import { ensureIdentity } from "./identity";
import {
  serializeForDb,
  deserializeFromDb,
  type DesignRow,
  type SerializeContext,
} from "./serializer";

export interface SaveOpts extends SerializeContext {
  designId?: string;
  markSaved?: boolean;
}

export interface SaveResult {
  ok: boolean;
  designId?: string;
  error?: string;
}

export interface LoadResult {
  ok: boolean;
  state?: RemodelFlowState;
  meta?: ReturnType<typeof deserializeFromDb>["meta"];
  error?: string;
}

export interface ListItem {
  id: string;
  name: string;
  status: string;
  selected_style: string | null;
  selected_tier: string | null;
  selected_package_id: string | null;
  last_active_at: string | null;
  updated_at: string | null;
}

/**
 * Insert a new design or update an existing one (when designId is provided).
 */
export async function saveDesign(
  state: RemodelFlowState,
  opts: SaveOpts = {},
): Promise<SaveResult> {
  try {
    const { userId } = await ensureIdentity();
    if (!userId) return { ok: false, error: "no_identity" };

    const now = new Date().toISOString();
    const payload: DesignRow = {
      ...serializeForDb(state, opts),
      user_id: userId,
      last_active_at: now,
      ...(opts.markSaved ? { saved_at: now } : {}),
    };

    if (opts.designId) {
      const { data, error } = await (supabase as any)
        .from("remodel_designs")
        .update(payload)
        .eq("id", opts.designId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return { ok: true, designId: data?.id ?? opts.designId };
    }

    const { data, error } = await (supabase as any)
      .from("remodel_designs")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, designId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[persistence/client] saveDesign error:", message);
    return { ok: false, error: message };
  }
}

/**
 * Load a single design by id (RLS will scope to the current user).
 */
export async function loadDesign(designId: string): Promise<LoadResult> {
  try {
    const { data, error } = await (supabase as any)
      .from("remodel_designs")
      .select("*")
      .eq("id", designId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, error: "not_found" };
    const { state, meta } = deserializeFromDb(data as DesignRow);
    return { ok: true, state, meta };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[persistence/client] loadDesign error:", message);
    return { ok: false, error: message };
  }
}

/**
 * List the current user's non-deleted designs (most recent first).
 */
export async function listMyDesigns(): Promise<ListItem[]> {
  try {
    const { userId } = await ensureIdentity();
    if (!userId) return [];

    const { data, error } = await (supabase as any)
      .from("remodel_designs")
      .select("id, name, status, selected_style, selected_tier, selected_package_id, last_active_at, updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("last_active_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ListItem[];
  } catch (err) {
    console.error("[persistence/client] listMyDesigns error:", err);
    return [];
  }
}

/**
 * Soft-delete a design by stamping deleted_at. Row stays for recovery.
 */
export async function softDeleteDesign(designId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any)
      .from("remodel_designs")
      .update({ deleted_at: new Date().toISOString(), status: "deleted" })
      .eq("id", designId);
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[persistence/client] softDeleteDesign error:", message);
    return { ok: false, error: message };
  }
}

/**
 * Append a structured event row tied to a design.
 */
export async function appendEvent(
  designId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any)
      .from("remodel_design_events")
      .insert({ design_id: designId, event_type: eventType, payload });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[persistence/client] appendEvent error:", message);
    return { ok: false, error: message };
  }
}
