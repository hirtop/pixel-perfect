import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, AlertTriangle, Check, Hammer } from "lucide-react";
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

interface AssessmentState {
  demolitionItems: Record<DemoItem, KeepRemove>;
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

const defaultState: AssessmentState = {
  demolitionItems: defaultDemo,
  activeLeaks: "no",
  crackedGrout: "no",
  visibleMold: "no",
  waterDamageSuspected: "no",
  waterproofingScope: "",
};

const computeDemolitionLevel = (items: Record<DemoItem, KeepRemove>): DemolitionLevel => {
  const removed = Object.values(items).filter((v) => v === "remove").length;
  if (removed >= 5) return "Full Gut";
  if (removed >= 3) return "Medium";
  return "Light";
};

type StepDef =
  | { kind: "demo"; title: string; subtitle?: string }
  | { key: keyof Omit<AssessmentState, "demolitionItems" | "waterproofingScope">; kind: "yesno"; title: string; subtitle?: string }
  | { kind: "scope"; title: string; subtitle?: string };

const STEPS: StepDef[] = [
  {
    kind: "demo",
    title: "What stays and what goes?",
    subtitle: "Tap each item to mark it Keep or Remove. This sets your demolition scope.",
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

  const initial = (project?.assessment as Partial<AssessmentState>) || {};
  const [state, setState] = useState<AssessmentState>({
    ...defaultState,
    ...initial,
    demolitionItems: { ...defaultDemo, ...(initial.demolitionItems as Record<DemoItem, KeepRemove> | undefined) },
  });
  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = STEPS.length;
  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  const demolitionLevel = useMemo(
    () => computeDemolitionLevel(state.demolitionItems),
    [state.demolitionItems],
  );

  const remediationAlert = useMemo(
    () =>
      state.visibleMold === "yes" ||
      state.waterDamageSuspected === "yes" ||
      state.demolitionItems["Suspected mold or water damage"] === "remove",
    [state.visibleMold, state.waterDamageSuspected, state.demolitionItems],
  );

  const set = <K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

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
      const { waterproofingScope, ...rest } = state;
      updateProject({
        assessment: {
          ...rest,
          demolitionLevel,
          ...(waterproofingScope ? { waterproofingScope } : {}),
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
