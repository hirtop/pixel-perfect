import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { RemodelFlowState, StyleId, TierId } from "./types";
import { ensureIdentity } from "./persistence/identity";
import { saveDesign } from "./persistence/client";

const STORAGE_KEY = "bobox_remodel_flow_v1";
const META_STORAGE_KEY = "bobox_remodel_flow_meta_v1";
const AUTOSAVE_DEBOUNCE_MS = 2000;

const defaultState: RemodelFlowState = { selections: {} };

interface FlowMeta {
  designId?: string;
  pendingSync: boolean;
  lastSyncedAt: string | null;
}

const defaultMeta: FlowMeta = {
  designId: undefined,
  pendingSync: false,
  lastSyncedAt: null,
};

interface FlowContextValue {
  state: RemodelFlowState;
  userId: string | null;
  identityReady: boolean;
  designId: string | undefined;
  pendingSync: boolean;
  lastSyncedAt: string | null;
  setStyle: (style: StyleId) => void;
  setTier: (tier: TierId) => void;
  setPackageId: (pkg: string) => void;
  setSelection: (categoryId: string, optionId: string) => void;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

const stableStringify = (s: RemodelFlowState) => {
  const selections = s.selections ?? {};
  const sortedSel = Object.keys(selections)
    .sort()
    .reduce<Record<string, string>>((acc, k) => {
      acc[k] = selections[k];
      return acc;
    }, {});
  return JSON.stringify({
    style: s.style ?? null,
    tier: s.tier ?? null,
    packageId: s.packageId ?? null,
    selections: sortedSel,
  });
};

export const FlowProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<RemodelFlowState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultState, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultState;
  });

  const [meta, setMeta] = useState<FlowMeta>(() => {
    try {
      const raw = localStorage.getItem(META_STORAGE_KEY);
      if (raw) return { ...defaultMeta, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultMeta;
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);

  // Persist state to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // Persist meta (designId, pendingSync, lastSyncedAt) to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
    } catch {
      /* ignore */
    }
  }, [meta]);

  // Bootstrap (anonymous) Supabase identity once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { userId: id } = await ensureIdentity();
        if (cancelled) return;
        if (!id) {
          console.warn("[FlowContext] identity unavailable; flow will continue without persistence");
        }
        setUserId(id);
      } catch (err) {
        if (!cancelled) {
          console.warn("[FlowContext] ensureIdentity failed:", err);
        }
      } finally {
        if (!cancelled) setIdentityReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Debounced background autosave -----------------------------------
  const lastSavedHashRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const designIdRef = useRef<string | undefined>(meta.designId);
  designIdRef.current = meta.designId;

  useEffect(() => {
    if (!identityReady || !userId) return;

    const hash = stableStringify(state);
    if (hash === lastSavedHashRef.current) return;

    const handle = window.setTimeout(async () => {
      if (inFlightRef.current) return;
      // Re-check the hash at fire-time to avoid racing with later edits.
      const fireHash = stableStringify(state);
      if (fireHash === lastSavedHashRef.current) return;

      inFlightRef.current = true;
      try {
        const result = await saveDesign(state, { designId: designIdRef.current });
        if (result.ok) {
          lastSavedHashRef.current = fireHash;
          setMeta((m) => ({
            designId: result.designId ?? m.designId,
            pendingSync: false,
            lastSyncedAt: new Date().toISOString(),
          }));
        } else {
          console.warn("[FlowContext] autosave failed:", result.error);
          setMeta((m) => ({ ...m, pendingSync: true }));
        }
      } catch (err) {
        console.warn("[FlowContext] autosave threw:", err);
        setMeta((m) => ({ ...m, pendingSync: true }));
      } finally {
        inFlightRef.current = false;
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [state, identityReady, userId]);
  // ---------------------------------------------------------------------

  const setStyle = useCallback((style: StyleId) => setState((s) => ({ ...s, style })), []);
  const setTier = useCallback(
    (tier: TierId) =>
      setState((s) => (s.tier === tier ? s : { ...s, tier, packageId: undefined })),
    [],
  );
  const setPackageId = useCallback((packageId: string) => setState((s) => ({ ...s, packageId })), []);
  const setSelection = useCallback(
    (categoryId: string, optionId: string) =>
      setState((s) => ({ ...s, selections: { ...s.selections, [categoryId]: optionId } })),
    [],
  );
  const reset = useCallback(() => {
    setState(defaultState);
    setMeta(defaultMeta);
    lastSavedHashRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      state,
      userId,
      identityReady,
      designId: meta.designId,
      pendingSync: meta.pendingSync,
      lastSyncedAt: meta.lastSyncedAt,
      setStyle,
      setTier,
      setPackageId,
      setSelection,
      reset,
    }),
    [state, userId, identityReady, meta, setStyle, setTier, setPackageId, setSelection, reset],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
};
