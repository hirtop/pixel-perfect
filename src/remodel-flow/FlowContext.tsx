import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RemodelFlowState, StyleId, TierId } from "./types";
import { ensureIdentity } from "./persistence/identity";

const STORAGE_KEY = "bobox_remodel_flow_v1";

const defaultState: RemodelFlowState = { selections: {} };

interface FlowContextValue {
  state: RemodelFlowState;
  userId: string | null;
  identityReady: boolean;
  setStyle: (style: StyleId) => void;
  setTier: (tier: TierId) => void;
  setPackageId: (pkg: string) => void;
  setSelection: (categoryId: string, optionId: string) => void;
  reset: () => void;
}

const FlowContext = createContext<FlowContextValue | undefined>(undefined);

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

  const [userId, setUserId] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // Bootstrap (anonymous) Supabase identity once on mount.
  // No autosave, no DB writes — just make sure we have a userId available.
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
  const reset = useCallback(() => setState(defaultState), []);

  const value = useMemo(
    () => ({ state, userId, identityReady, setStyle, setTier, setPackageId, setSelection, reset }),
    [state, userId, identityReady, setStyle, setTier, setPackageId, setSelection, reset],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside <FlowProvider>");
  return ctx;
};
