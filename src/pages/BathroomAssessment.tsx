import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";

type YesNoUnknown = "yes" | "no" | "unknown";
type WaterproofingScope = "None" | "Tub surround" | "Shower walls" | "Full shower system";

interface AssessmentState {
  activeLeaks: YesNoUnknown;
  crackedGrout: YesNoUnknown;
  visibleMold: YesNoUnknown;
  waterDamageSuspected: YesNoUnknown;
  waterproofingScope: WaterproofingScope;
}

const defaultState: AssessmentState = {
  activeLeaks: "no",
  crackedGrout: "no",
  visibleMold: "no",
  waterDamageSuspected: "no",
  waterproofingScope: "None",
};

const yesNoOptions: { value: YesNoUnknown; label: string }[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
  { value: "unknown", label: "Not sure" },
];

const scopeOptions: WaterproofingScope[] = [
  "None",
  "Tub surround",
  "Shower walls",
  "Full shower system",
];

const ChoiceRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNoUnknown;
  onChange: (v: YesNoUnknown) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <div className="flex gap-2">
      {yesNoOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const BathroomAssessment = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();

  const initial = (project?.assessment as Partial<AssessmentState>) || {};
  const [state, setState] = useState<AssessmentState>({ ...defaultState, ...initial });

  const remediationAlert = useMemo(
    () => state.visibleMold === "yes" || state.waterDamageSuspected === "yes",
    [state.visibleMold, state.waterDamageSuspected],
  );

  const set = <K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const handleContinue = () => {
    updateProject({ assessment: state });
    markStepComplete("assessment");
    navigate("/style-budget");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dimensions" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Step 3 of 5</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Existing Bathroom Assessment</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              A quick check of what your existing bathroom needs before we recommend a design direction. Honest answers here keep the budget realistic.
            </p>
          </div>

          <div className="space-y-7 bg-card border border-border rounded-2xl p-6 md:p-8">
            <ChoiceRow label="Any active leaks?" value={state.activeLeaks} onChange={(v) => set("activeLeaks", v)} />
            <ChoiceRow label="Cracked or failing grout?" value={state.crackedGrout} onChange={(v) => set("crackedGrout", v)} />
            <ChoiceRow label="Visible mold?" value={state.visibleMold} onChange={(v) => set("visibleMold", v)} />
            <ChoiceRow
              label="Water damage suspected behind walls?"
              value={state.waterDamageSuspected}
              onChange={(v) => set("waterDamageSuspected", v)}
            />

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-sm font-medium text-foreground">Waterproofing scope needed</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Best estimate of what wet-area work the existing bathroom likely needs.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("waterproofingScope", opt)}
                    className={`px-3 py-2.5 rounded-lg text-sm border transition-colors text-left ${
                      state.waterproofingScope === opt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {remediationAlert && (
              <div
                role="alert"
                className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
              >
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive leading-relaxed">
                  Visible mold or water damage requires professional remediation before work begins.
                </p>
              </div>
            )}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg"
              onClick={handleContinue}
            >
              Continue to Style & Budget
            </Button>
            <Link to="/dimensions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Dimensions
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BathroomAssessment;
