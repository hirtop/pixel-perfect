import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RemodelFlowState, StyleId, TierId } from "./types";

const STORAGE_KEY = "bobox_remodel_flow_v1";

const defaultState: RemodelFlowState = { selections: {} };

interface FlowContextValue {
  state: RemodelFlowState;
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

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
    () => ({ state, setStyle, setTier, setPackageId, setSelection, reset }),
    [state, setStyle, setTier, setPackageId, setSelection, reset],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside <FlowProvider>");
  return ctx;
};
