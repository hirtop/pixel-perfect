import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, AlertTriangle, Check, Hammer, Wrench, Info, Zap, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";

type YesNoUnknown = "yes" | "no" | "unknown";
type WaterproofingScope = "None" | "Tub surround" | "Shower walls" | "Full shower system";
type KeepRemove = "keep" | "remove";
type DemolitionLevel = "Light" | "Medium" | "Full Gut";

const DEMO_ITEMS = [
  "Vanity",
  "Toilet",
  "Tub/Shower",
  "Floor Tile",
  "Wall Tile",
  "Drywall/Backer Board",
  "Ceiling",
  "Suspected mold or water damage",
] as const;
type DemoItem = (typeof DEMO_ITEMS)[number];

const PLUMBING_QUESTIONS = [
  { key: "vanitySameLocation", label: "Is the vanity staying in the same location?" },
  { key: "toiletSameLocation", label: "Is the toilet staying in the same location?" },
  { key: "tubShowerSameLocation", label: "Is the tub/shower staying in the same location?" },
  { key: "tubToShowerConversion", label: "Are you converting a tub to a shower?" },
  { key: "addingSecondSink", label: "Adding a second sink?" },
  { key: "knownLeaks", label: "Any known leaks?" },
  { key: "drainIssues", label: "Any drain issues?" },
] as const;
type PlumbingKey = (typeof PLUMBING_QUESTIONS)[number]["key"];

const ELECTRICAL_ITEMS = [
  "New vanity lights",
  "New recessed lights",
  "New outlets / GFCI",
  "Heated floor",
  "Smart mirror",
  "Bidet outlet",
  "Move switches",
] as const;
type ElectricalItem = (typeof ELECTRICAL_ITEMS)[number];
type ElectricalScope = "None" | "Minor" | "Moderate" | "Major";

const VENTILATION_QUESTIONS = [
  { key: "hasExhaustFan", label: "Does the bathroom have an exhaust fan?" },
  { key: "fanWorking", label: "Is it working?" },
  { key: "ventsOutside", label: "Does it vent outside (not into attic)?" },
  { key: "replaceOrAddFan", label: "Replace or add a new fan?" },
  { key: "addHumiditySensor", label: "Add a humidity sensor?" },
] as const;
type VentilationKey = (typeof VENTILATION_QUESTIONS)[number]["key"];
type VentilationScope = "None" | "Replace only" | "New install" | "Upgrade";

const FRAMING_ITEMS = [
  "Moving / removing a wall",
  "Adding shower niche",
  "Adding shower bench",
  "Enlarging shower",
  "Moving door",
  "Replacing door",
  "Replacing window",
  "Window inside / near shower",
  "Adding blocking for grab bars or glass door",
] as const;
type FramingItem = (typeof FRAMING_ITEMS)[number];
type FramingScope = "None" | "Minor blocking" | "Wall modification" | "Major layout change";

interface AssessmentState {
  demolitionItems: Record<DemoItem, KeepRemove>;
  plumbing: Record<PlumbingKey, YesNoUnknown>;
  electricalItems: Record<ElectricalItem, boolean>;
  ventilation: Record<VentilationKey, YesNoUnknown>;
  framingItems: Record<FramingItem, boolean>;
  activeLeaks: YesNoUnknown;
  crackedGrout: YesNoUnknown;
  visibleMold: YesNoUnknown;
  waterDamageSuspected: YesNoUnknown;
  waterproofingScope: WaterproofingScope | "";
}

const defaultDemo: Record<DemoItem, KeepRemove> = DEMO_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item]: "keep" }),
  {} as Record<DemoItem, KeepRemove>,
);

const defaultPlumbing: Record<PlumbingKey, YesNoUnknown> = PLUMBING_QUESTIONS.reduce(
  (acc, q) => ({ ...acc, [q.key]: "unknown" }),
  {} as Record<PlumbingKey, YesNoUnknown>,
);

const defaultElectrical: Record<ElectricalItem, boolean> = ELECTRICAL_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item]: false }),
  {} as Record<ElectricalItem, boolean>,
);

const defaultVentilation: Record<VentilationKey, YesNoUnknown> = VENTILATION_QUESTIONS.reduce(
  (acc, q) => ({ ...acc, [q.key]: "unknown" }),
  {} as Record<VentilationKey, YesNoUnknown>,
);

const defaultFraming: Record<FramingItem, boolean> = FRAMING_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item]: false }),
  {} as Record<FramingItem, boolean>,
);

const defaultState: AssessmentState = {
  demolitionItems: defaultDemo,
  plumbing: defaultPlumbing,
  electricalItems: defaultElectrical,
  ventilation: defaultVentilation,
  framingItems: defaultFraming,
  activeLeaks: "no",
  crackedGrout: "no",
  visibleMold: "no",
  waterDamageSuspected: "no",
  waterproofingScope: "",
};

const computeFramingScope = (items: Record<FramingItem, boolean>): FramingScope => {
  const wallMove = items["Moving / removing a wall"];
  const doorMove = items["Moving door"];
  const enlargeShower = items["Enlarging shower"];
  const wallMods =
    items["Adding shower niche"] || items["Adding shower bench"] || enlargeShower;
  const minorOnly =
    items["Adding blocking for grab bars or glass door"] ||
    items["Replacing door"] ||
    items["Replacing window"] ||
    items["Window inside / near shower"];
  if (wallMove || (doorMove && enlargeShower)) return "Major layout change";
  if (wallMods || doorMove) return "Wall modification";
  if (minorOnly) return "Minor blocking";
  return "None";
};

const computeElectricalScope = (items: Record<ElectricalItem, boolean>): ElectricalScope => {
  const n = Object.values(items).filter(Boolean).length;
  if (n >= 5) return "Major";
  if (n >= 3) return "Moderate";
  if (n >= 1) return "Minor";
  return "None";
};

const computeVentilationScope = (v: Record<VentilationKey, YesNoUnknown>): VentilationScope => {
  const hasFan = v.hasExhaustFan === "yes";
  const working = v.fanWorking === "yes";
  const replace = v.replaceOrAddFan === "yes";
  const humidity = v.addHumiditySensor === "yes";
  if (!hasFan && replace) return "New install";
  if (humidity || (replace && hasFan && working)) return "Upgrade";
  if (replace) return "Replace only";
  return "None";
};

const computeDemolitionLevel = (items: Record<DemoItem, KeepRemove>): DemolitionLevel => {
  const removed = Object.values(items).filter((v) => v === "remove").length;
  if (removed >= 5) return "Full Gut";
  if (removed >= 3) return "Medium";
  return "Light";
};

type YesNoStepKey = "activeLeaks" | "crackedGrout" | "visibleMold" | "waterDamageSuspected";

type StepDef =
  | { kind: "demo"; title: string; subtitle?: string }
  | { kind: "plumbing"; title: string; subtitle?: string }
  | { kind: "electrical"; title: string; subtitle?: string }
  | { kind: "framing"; title: string; subtitle?: string }
  | { key: YesNoStepKey; kind: "yesno"; title: string; subtitle?: string }
  | { kind: "scope"; title: string; subtitle?: string };

const STEPS: StepDef[] = [
  {
    kind: "demo",
    title: "What stays and what goes?",
    subtitle: "Tap each item to mark it Keep or Remove. This sets your demolition scope.",
  },
  {
    kind: "plumbing",
    title: "Plumbing changes",
    subtitle: "Moving fixtures or adding new ones can be a major cost driver. Quick check below.",
  },
  {
    kind: "electrical",
    title: "Electrical and ventilation",
    subtitle: "Tap any electrical work that applies, then answer a few quick ventilation questions.",
  },
  {
    kind: "framing",
    title: "Walls, framing, doors, and windows",
    subtitle: "Tap any structural or opening changes that apply.",
  },
  {
    key: "activeLeaks",
    kind: "yesno",
    title: "Any active leaks?",
    subtitle: "Drips, pooling water, stains under fixtures, or wet spots.",
  },
  {
    key: "crackedGrout",
    kind: "yesno",
    title: "Cracked or failing grout?",
    subtitle: "Look around the tub, shower walls, and floor tile joints.",
  },
  {
    key: "visibleMold",
    kind: "yesno",
    title: "Any visible mold?",
    subtitle: "Black, green, or pink discoloration around wet areas, caulk, or grout.",
  },
  {
    key: "waterDamageSuspected",
    kind: "yesno",
    title: "Water damage suspected behind walls?",
    subtitle: "Soft drywall, swelling baseboards, peeling paint, or musty smell.",
  },
  {
    kind: "scope",
    title: "Waterproofing scope likely needed",
    subtitle: "Best estimate of what wet-area work the existing bathroom needs.",
  },
];

const yesNoOptions: { value: YesNoUnknown; label: string; hint: string }[] = [
  { value: "no", label: "No", hint: "Looks clean and dry" },
  { value: "yes", label: "Yes", hint: "I can see signs of it" },
  { value: "unknown", label: "Not sure", hint: "Hard to tell" },
];

const scopeOptions: { value: WaterproofingScope; hint: string }[] = [
  { value: "None", hint: "No wet-area work needed" },
  { value: "Tub surround", hint: "Just around the tub" },
  { value: "Shower walls", hint: "Full shower wall waterproofing" },
  { value: "Full shower system", hint: "Pan, walls, and curb" },
];

const OptionButton = ({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group w-full text-left rounded-xl border-2 p-5 transition-all ${
      selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-base text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "border-primary bg-primary" : "border-border"
        }`}
      >
        {selected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
      </div>
    </div>
  </button>
);

const DemoCard = ({
  item,
  state,
  onToggle,
}: {
  item: DemoItem;
  state: KeepRemove;
  onToggle: () => void;
}) => {
  const isRemove = state === "remove";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isRemove
          ? "border-destructive bg-destructive/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-foreground leading-snug">{item}</p>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isRemove
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {isRemove ? "Remove" : "Keep"}
        </span>
      </div>
    </button>
  );
};

const BathroomAssessment = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();

  const initial = (project?.assessment ?? {}) as Record<string, unknown>;
  const initialElectricalArr = Array.isArray(initial.electricalItems)
    ? (initial.electricalItems as string[])
    : [];
  const hydratedElectrical: Record<ElectricalItem, boolean> = ELECTRICAL_ITEMS.reduce(
    (acc, item) => ({ ...acc, [item]: initialElectricalArr.includes(item) }),
    {} as Record<ElectricalItem, boolean>,
  );

  const [state, setState] = useState<AssessmentState>({
    ...defaultState,
    activeLeaks: (initial.activeLeaks as YesNoUnknown) ?? defaultState.activeLeaks,
    crackedGrout: (initial.crackedGrout as YesNoUnknown) ?? defaultState.crackedGrout,
    visibleMold: (initial.visibleMold as YesNoUnknown) ?? defaultState.visibleMold,
    waterDamageSuspected:
      (initial.waterDamageSuspected as YesNoUnknown) ?? defaultState.waterDamageSuspected,
    waterproofingScope: (initial.waterproofingScope as WaterproofingScope) ?? "",
    demolitionItems: {
      ...defaultDemo,
      ...((initial.demolitionItems as Record<DemoItem, KeepRemove> | undefined) ?? {}),
    },
    plumbing: {
      ...defaultPlumbing,
      ...((initial.plumbing as Record<PlumbingKey, YesNoUnknown> | undefined) ?? {}),
    },
    electricalItems: hydratedElectrical,
    ventilation: {
      ...defaultVentilation,
      ...((initial.ventilation as Record<VentilationKey, YesNoUnknown> | undefined) ?? {}),
    },
  });
  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = STEPS.length;
  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const demolitionLevel = useMemo(
    () => computeDemolitionLevel(state.demolitionItems),
    [state.demolitionItems],
  );

  const electricalScope = useMemo(
    () => computeElectricalScope(state.electricalItems),
    [state.electricalItems],
  );

  const ventilationScope = useMemo(
    () => computeVentilationScope(state.ventilation),
    [state.ventilation],
  );

  const remediationAlert = useMemo(
    () =>
      state.visibleMold === "yes" ||
      state.waterDamageSuspected === "yes" ||
      state.demolitionItems["Suspected mold or water damage"] === "remove",
    [state.visibleMold, state.waterDamageSuspected, state.demolitionItems],
  );

  const ventIntoAttic = state.ventilation.ventsOutside === "no";

  const toiletRelocated = state.plumbing.toiletSameLocation === "no";
  const tubToShower = state.plumbing.tubToShowerConversion === "yes";

  const set = <K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const setPlumbing = (key: PlumbingKey, value: YesNoUnknown) =>
    setState((s) => ({ ...s, plumbing: { ...s.plumbing, [key]: value } }));

  const setVentilation = (key: VentilationKey, value: YesNoUnknown) =>
    setState((s) => ({ ...s, ventilation: { ...s.ventilation, [key]: value } }));

  const toggleElectrical = (item: ElectricalItem) =>
    setState((s) => ({
      ...s,
      electricalItems: { ...s.electricalItems, [item]: !s.electricalItems[item] },
    }));

  const toggleDemo = (item: DemoItem) =>
    setState((s) => ({
      ...s,
      demolitionItems: {
        ...s.demolitionItems,
        [item]: s.demolitionItems[item] === "remove" ? "keep" : "remove",
      },
    }));

  const isLast = stepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      const electricalItemsArr = ELECTRICAL_ITEMS.filter((item) => state.electricalItems[item]);
      updateProject({
        assessment: {
          activeLeaks: state.activeLeaks,
          crackedGrout: state.crackedGrout,
          visibleMold: state.visibleMold,
          waterDamageSuspected: state.waterDamageSuspected,
          ...(state.waterproofingScope ? { waterproofingScope: state.waterproofingScope } : {}),
          demolitionItems: state.demolitionItems,
          demolitionLevel,
          plumbing: state.plumbing,
          electricalItems: electricalItemsArr,
          electricalScope,
          ventilation: state.ventilation,
          ventilationScope,
        },
      });
      markStepComplete("assessment");
      navigate("/style-budget");
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      navigate("/dimensions");
      return;
    }
    setStepIndex((i) => i - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX{" "}
            <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">
              Remodel
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dimensions"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dimensions
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Existing Bathroom Assessment
            </p>
            <h1 className="font-heading text-2xl md:text-3xl text-foreground">
              A quick check of what your bathroom needs
            </h1>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
            >
              <h2 className="font-heading text-xl md:text-2xl text-foreground mb-2">
                {step.title}
              </h2>
              {step.subtitle && (
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {step.subtitle}
                </p>
              )}

              {step.kind === "demo" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {DEMO_ITEMS.map((item) => (
                      <DemoCard
                        key={item}
                        item={item}
                        state={state.demolitionItems[item]}
                        onToggle={() => toggleDemo(item)}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-secondary/60 border border-border p-4">
                    <div className="flex items-center gap-2.5">
                      <Hammer className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Demolition level</span>
                    </div>
                    <span className="font-heading text-base text-foreground">
                      {demolitionLevel}
                    </span>
                  </div>
                </>
              )}

              {step.kind === "plumbing" && (
                <div className="space-y-5">
                  {PLUMBING_QUESTIONS.map((q) => (
                    <div key={q.key} className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{q.label}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["yes", "no", "unknown"] as YesNoUnknown[]).map((v) => {
                          const selected = state.plumbing[q.key] === v;
                          const label = v === "unknown" ? "Not sure" : v === "yes" ? "Yes" : "No";
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setPlumbing(q.key, v)}
                              className={`px-3 py-2.5 rounded-lg text-sm border-2 font-medium transition-colors ${
                                selected
                                  ? "border-primary bg-primary/10 text-foreground"
                                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-secondary/60 border border-border p-4">
                    <Wrench className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Moving water lines or drains is one of the largest hidden cost drivers in a remodel.
                    </span>
                  </div>
                </div>
              )}

              {step.kind === "electrical" && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Electrical work — tap any that apply
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {ELECTRICAL_ITEMS.map((item) => {
                        const selected = state.electricalItems[item];
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleElectrical(item)}
                            className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                              selected
                                ? "border-primary bg-primary/10"
                                : "border-border bg-card hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm text-foreground leading-snug">{item}</p>
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                  selected ? "border-primary bg-primary" : "border-border"
                                }`}
                              >
                                {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/60 border border-border p-3">
                      <span className="text-sm text-muted-foreground">Electrical scope</span>
                      <span className="font-heading text-base text-foreground">{electricalScope}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Wind className="h-4 w-4 text-primary" />
                      Ventilation
                    </p>
                    <div className="space-y-4">
                      {VENTILATION_QUESTIONS.map((q) => (
                        <div key={q.key} className="space-y-2">
                          <p className="text-sm font-medium text-foreground">{q.label}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {(["yes", "no", "unknown"] as YesNoUnknown[]).map((v) => {
                              const selected = state.ventilation[q.key] === v;
                              const label = v === "unknown" ? "Not sure" : v === "yes" ? "Yes" : "No";
                              return (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setVentilation(q.key, v)}
                                  className={`px-3 py-2.5 rounded-lg text-sm border-2 font-medium transition-colors ${
                                    selected
                                      ? "border-primary bg-primary/10 text-foreground"
                                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/60 border border-border p-3">
                      <span className="text-sm text-muted-foreground">Ventilation scope</span>
                      <span className="font-heading text-base text-foreground">{ventilationScope}</span>
                    </div>
                  </div>
                </div>
              )}

              {step.kind === "yesno" && (
                <div className="space-y-3">
                  {yesNoOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={state[step.key] === opt.value}
                      label={opt.label}
                      hint={opt.hint}
                      onClick={() => set(step.key, opt.value)}
                    />
                  ))}
                </div>
              )}

              {step.kind === "scope" && (
                <div className="space-y-3">
                  {scopeOptions.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={state.waterproofingScope === opt.value}
                      label={opt.value}
                      hint={opt.hint}
                      onClick={() => set("waterproofingScope", opt.value)}
                    />
                  ))}
                  <OptionButton
                    selected={state.waterproofingScope === ""}
                    label="Not sure"
                    hint="A pro can confirm during walkthrough"
                    onClick={() => set("waterproofingScope", "")}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {remediationAlert && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-5 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
            >
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive leading-relaxed">
                Visible mold or water damage requires professional remediation before work begins.
              </p>
            </motion.div>
          )}

          {toiletRelocated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-3 flex gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4"
            >
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                Toilet relocation often requires drain and vent changes — contractor verification required.
              </p>
            </motion.div>
          )}

          {tubToShower && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-3 flex gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4"
            >
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                Tub-to-shower requires waterproofing, new drain, and valve height review.
              </p>
            </motion.div>
          )}

          {ventIntoAttic && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mt-3 flex gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4"
            >
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                Venting into an attic instead of outside often causes moisture buildup — worth verifying with your contractor.
              </p>
            </motion.div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              className="px-8 h-12 text-base font-semibold rounded-lg"
            >
              {isLast ? "Continue to Style & Budget" : "Next"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BathroomAssessment;
