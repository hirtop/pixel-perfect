import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";

type YesNoUnknown = "yes" | "no" | "unknown";
type WaterproofingScope = "None" | "Tub surround" | "Shower walls" | "Full shower system";

interface AssessmentState {
  activeLeaks: YesNoUnknown;
  crackedGrout: YesNoUnknown;
  visibleMold: YesNoUnknown;
  waterDamageSuspected: YesNoUnknown;
  waterproofingScope: WaterproofingScope | "";
}

const defaultState: AssessmentState = {
  activeLeaks: "no",
  crackedGrout: "no",
  visibleMold: "no",
  waterDamageSuspected: "no",
  waterproofingScope: "",
};

type StepDef =
  | {
      key: keyof AssessmentState;
      kind: "yesno";
      title: string;
      subtitle?: string;
    }
  | {
      key: "waterproofingScope";
      kind: "scope";
      title: string;
      subtitle?: string;
    };

const STEPS: StepDef[] = [
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
    key: "waterproofingScope",
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
    className={`group w-full text-left rounded-xl border-2 p-5 transition-all hover-scale ${
      selected
        ? "border-primary bg-primary/10"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p
          className={`font-semibold text-base ${
            selected ? "text-foreground" : "text-foreground"
          }`}
        >
          {label}
        </p>
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
  