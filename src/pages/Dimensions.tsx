import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProject } from "@/contexts/ProjectContext";
import type { ProjectData } from "@/contexts/ProjectContext";

type DimensionsState = {
  width_ft: string;
  width_in: string;
  length_ft: string;
  length_in: string;
  height_ft: string;
  height_in: string;
  door_notes: string;
  window_notes: string;
  layout_notes: string;
};

type DimensionsDraftRecord = {
  values: DimensionsState;
  updatedAt: number;
};

const emptyDims: DimensionsState = {
  width_ft: "",
  width_in: "",
  length_ft: "",
  length_in: "",
  height_ft: "",
  height_in: "",
  door_notes: "",
  window_notes: "",
  layout_notes: "",
};

const DIMENSIONS_DRAFT_KEY = "bobox_dimensions_draft";
const LEGACY_DIMENSIONS_FALLBACK_KEY = "bobox_dimensions_draft_draft";

const parseDraftRecord = (stored: string | null): DimensionsDraftRecord | null => {
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<DimensionsDraftRecord> | Partial<DimensionsState>;

    if (
      parsed &&
      typeof parsed === "object" &&
      "values" in parsed &&
      parsed.values &&
      typeof parsed.updatedAt === "number"
    ) {
      return {
        values: { ...emptyDims, ...parsed.values } as DimensionsState,
        updatedAt: parsed.updatedAt,
      };
    }

    return {
      values: { ...emptyDims, ...(parsed as Partial<DimensionsState>) },
      updatedAt: 0,
    };
  } catch {
    return null;
  }
};

const fromProject = (dims: ProjectData["dimensions"]): DimensionsState => ({
  width_ft: dims.width_ft || "",
  width_in: dims.width_in || "",
  length_ft: dims.length_ft || "",
  length_in: dims.length_in || "",
  height_ft: dims.height_ft || "",
  height_in: dims.height_in || "",
  door_notes: dims.door_notes || "",
  window_notes: dims.window_notes || "",
  layout_notes: dims.layout_notes || "",
});

const dimsEqual = (a: DimensionsState, b: DimensionsState) =>
  (Object.keys(a) as Array<keyof DimensionsState>).every((k) => a[k] === b[k]);

const DimensionInput = ({
  label, ftValue, inValue, onFtChange, onInChange, onBlur,
}: {
  label: string; ftValue: string; inValue: string;
  onFtChange: (v: string) => void; onInChange: (v: string) => void;
  onBlur: () => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input type="number" placeholder="0" value={ftValue} onChange={(e) => onFtChange(e.target.value)} onBlur={onBlur} className="h-12 text-base pr-10" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">ft</span>
      </div>
      <div className="relative flex-1">
        <Input type="number" placeholder="0" value={inValue} onChange={(e) => onInChange(e.target.value)} onBlur={onBlur} className="h-12 text-base pr-10" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">in</span>
      </div>
    </div>
  </div>
);

const FloorDiagram = () => (
  <div className="flex items-center justify-center py-6">
    <svg viewBox="0 0 240 200" className="w-52 h-auto text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="160" height="120" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.3" />
      <rect x="40" y="40" width="160" height="120" rx="4" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="hsl(var(--primary))" fillOpacity="0.04" />
      <line x1="50" y1="28" x2="190" y2="28" stroke="hsl(var(--primary))" strokeWidth="1" />
      <polygon points="50,25 50,31 42,28" fill="hsl(var(--primary))" />
      <polygon points="190,25 190,31 198,28" fill="hsl(var(--primary))" />
      <text x="120" y="18" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--primary))">Width</text>
      <line x1="212" y1="50" x2="212" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" />
      <polygon points="209,50 215,50 212,42" fill="hsl(var(--primary))" />
      <polygon points="209,150 215,150 212,158" fill="hsl(var(--primary))" />
      <text x="226" y="104" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--primary))" transform="rotate(90 226 104)">Length</text>
      <line x1="28" y1="50" x2="28" y2="150" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 2" />
      <polygon points="25,50 31,50 28,42" fill="hsl(var(--accent))" />
      <polygon points="25,150 31,150 28,158" fill="hsl(var(--accent))" />
      <text x="14" y="104" textAnchor="middle" className="text-[10px] font-body font-medium" fill="hsl(var(--accent))" transform="rotate(-90 14 104)">Height</text>
      <rect x="130" y="153" width="30" height="7" rx="2" fill="hsl(var(--primary))" fillOpacity="0.15" stroke="hsl(var(--primary))" strokeWidth="1" />
      <text x="145" y="175" textAnchor="middle" className="text-[8px] font-body" fill="currentColor" opacity="0.4">door</text>
      <rect x="40" y="75" width="7" height="24" rx="2" fill="hsl(var(--accent))" fillOpacity="0.15" stroke="hsl(var(--accent))" strokeWidth="1" />
      <text x="20" y="90" textAnchor="middle" className="text-[8px] font-body" fill="currentColor" opacity="0.4">window</text>
    </svg>
  </div>
);

const Dimensions = () => {
  const { project, updateProject, saveProject, markStepComplete } = useProject();
  const navigate = useNavigate();

  const legacyProjectDraftKey = `bobox_dimensions_draft_${project.id ?? "draft"}`;

  const readLocalDraftSync = (): DimensionsState | null => {
    let latestDraft: DimensionsDraftRecord | null = null;

    for (const key of new Set([DIMENSIONS_DRAFT_KEY, legacyProjectDraftKey, LEGACY_DIMENSIONS_FALLBACK_KEY])) {
      const candidate = parseDraftRecord(localStorage.getItem(key));
      if (!candidate) continue;
      if (!latestDraft || candidate.updatedAt >= latestDraft.updatedAt) {
        latestDraft = candidate;
      }
    }

    return latestDraft?.values ?? null;
  };

  // Seed initial state from local draft if present — avoids any flash of stale server data.
  const [dims, setDims] = useState<DimensionsState>(() => {
    const draft = readLocalDraftSync();
    return draft ?? fromProject(project.dimensions);
  });

  // If we seeded from a local draft, mark as user-edited so server hydration can't clobber it.
  const userEditedRef = useRef<boolean>(readLocalDraftSync() !== null);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;
  const projectRef = useRef(project);
  projectRef.current = project;
  const latestPersistedRef = useRef<DimensionsState>(fromProject(project.dimensions));
  const saveInFlightRef = useRef<Promise<boolean> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeLocalDraft = useCallback((value: DimensionsState) => {
    try {
      localStorage.setItem(
        DIMENSIONS_DRAFT_KEY,
        JSON.stringify({ values: value, updatedAt: Date.now() } satisfies DimensionsDraftRecord),
      );
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const readLocalDraft = useCallback((): DimensionsState | null => {
    return readLocalDraftSync();
  }, [legacyProjectDraftKey]);

  const clearLocalDraft = useCallback(() => {
    try {
      localStorage.removeItem(DIMENSIONS_DRAFT_KEY);
      localStorage.removeItem(legacyProjectDraftKey);
      localStorage.removeItem(LEGACY_DIMENSIONS_FALLBACK_KEY);
    } catch {
      /* ignore storage errors */
    }
  }, [legacyProjectDraftKey]);

  // Hydrate from project ONLY if no local draft exists and user hasn't edited.
  // Local draft always wins because it represents edits not yet confirmed-persisted.
  useEffect(() => {
    if (userEditedRef.current) return;
    const draft = readLocalDraft();
    if (draft) {
      // A draft exists — adopt it and mark edited so server can't overwrite later.
      userEditedRef.current = true;
      if (!dimsEqual(draft, dimsRef.current)) {
        setDims(draft);
      }
      return;
    }
    const next = fromProject(project.dimensions);
    if (!dimsEqual(next, dimsRef.current)) {
      setDims(next);
      latestPersistedRef.current = next;
    }
  }, [project.dimensions, readLocalDraft]);

  const persistDims = useCallback(
    async (value: DimensionsState) => {
      // Avoid redundant writes
      if (dimsEqual(value, latestPersistedRef.current)) return;

      // Wait for any in-flight save to settle to avoid races.
      if (saveInFlightRef.current) {
        try { await saveInFlightRef.current; } catch { /* ignore */ }
      }

      const nextDimensions = { ...projectRef.current.dimensions, ...value };
      updateProject({ dimensions: nextDimensions });

      const overrideProject: ProjectData = {
        ...projectRef.current,
        dimensions: nextDimensions,
      };

      saveInFlightRef.current = saveProject({ silent: true, projectOverride: overrideProject });
      try {
        const ok = await saveInFlightRef.current;
        if (ok) {
          latestPersistedRef.current = value;
          const storedDraft = readLocalDraft();
          if (storedDraft && dimsEqual(storedDraft, value)) {
            clearLocalDraft();
          }
        }
      } finally {
        saveInFlightRef.current = null;
      }
    },
    [clearLocalDraft, readLocalDraft, saveProject, updateProject],
  );

  const scheduleSave = useCallback(
    (value: DimensionsState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void persistDims(value);
      }, 600);
    },
    [persistDims],
  );

  const handleField = useCallback(
    (key: keyof DimensionsState, value: string) => {
      userEditedRef.current = true;
      const next = { ...dimsRef.current, [key]: value };
      dimsRef.current = next;
      writeLocalDraft(next);
      updateProject({ dimensions: { ...projectRef.current.dimensions, ...next } });
      setDims(next);
      scheduleSave(next);
    },
    [scheduleSave, updateProject, writeLocalDraft],
  );

  const flushNow = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    void persistDims(dimsRef.current);
  }, [persistDims]);

  // Flush on tab hide / refresh / navigation away.
  useEffect(() => {
    const onBeforeUnload = () => { flushNow(); };
    const onPageHide = () => { flushNow(); };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      flushNow();
    };
  }, [flushNow]);

  const handleContinue = async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    await persistDims(dimsRef.current);
    markStepComplete("dimensions");
    navigate("/style-budget");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/upload" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Photos
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Enter Bathroom Dimensions</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              These basic measurements help BOBOX generate remodel options that better fit your space.
            </p>
          </div>

          <FloorDiagram />

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DimensionInput
                label="Room Width"
                ftValue={dims.width_ft}
                inValue={dims.width_in}
                onFtChange={(v) => handleField("width_ft", v)}
                onInChange={(v) => handleField("width_in", v)}
                onBlur={flushNow}
              />
              <DimensionInput
                label="Room Length"
                ftValue={dims.length_ft}
                inValue={dims.length_in}
                onFtChange={(v) => handleField("length_ft", v)}
                onInChange={(v) => handleField("length_in", v)}
                onBlur={flushNow}
              />
              <DimensionInput
                label="Ceiling Height"
                ftValue={dims.height_ft}
                inValue={dims.height_in}
                onFtChange={(v) => handleField("height_ft", v)}
                onInChange={(v) => handleField("height_in", v)}
                onBlur={flushNow}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Additional Notes</p>
                <p className="text-xs text-muted-foreground">Optional — anything that might affect layout or planning.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Door location / notes</Label>
                  <Input
                    placeholder="e.g. door on the left wall"
                    value={dims.door_notes}
                    onChange={(e) => handleField("door_notes", e.target.value)}
                    onBlur={flushNow}
                    className="h-11 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Window notes</Label>
                  <Input
                    placeholder="e.g. one window above the tub"
                    value={dims.window_notes}
                    onChange={(e) => handleField("window_notes", e.target.value)}
                    onBlur={flushNow}
                    className="h-11 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Awkward corners or layout details</Label>
                <Textarea
                  placeholder="e.g. small alcove behind the door, sloped ceiling on one side"
                  value={dims.layout_notes}
                  onChange={(e) => handleField("layout_notes", e.target.value)}
                  onBlur={flushNow}
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" onClick={handleContinue}>
                Continue
              </Button>
              <Link to="/upload" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Photos
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dimensions;
