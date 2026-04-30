import { useState } from "react";
import ShoppingAssistantFab from "@/components/shopping-assistant/ShoppingAssistantFab";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";

const budgetLevels = [
  { name: "Budget-Conscious", tier: "budget", desc: "Focused on value and essential upgrades" },
  { name: "Balanced", tier: "balanced", desc: "A mix of quality, function, and style" },
  { name: "Premium", tier: "premium", desc: "More flexibility for finishes and upgrades" },
];

const StyleBudget = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const prefs = project.style_preferences;
  const [budget, setBudget] = useState(prefs.budget || "");
  const [budgetLevel, setBudgetLevel] = useState(prefs.budget_level || "");

  const handleContinue = () => {
    const selected = budgetLevels.find((b) => b.name === budgetLevel);
    const tier = selected?.tier || "balanced";
    updateProject({
      style_preferences: {
        style: prefs.style || "",
        budget,
        budget_level: budgetLevel,
        finish: prefs.finish || "",
      },
      selected_package: { name: undefined, tier: undefined },
      customizations: {},
    });
    markStepComplete("style-budget");
    navigate(`/customize/${tier}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dimensions" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dimensions
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
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Choose Your Budget</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Select a budget level to see curated product options for your remodel.
            </p>
          </div>
          <div className="space-y-10">
            <section className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Target Budget</p>
                <p className="text-sm text-muted-foreground">Enter an approximate budget for your project.</p>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="budget" className="text-sm font-medium text-foreground">
                  Budget Amount <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="15,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-12 text-base pl-8"
                  />
                </div>
              </div>
            </section>
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Budget Level</p>
                <p className="text-sm text-muted-foreground">Choose your comfort level for materials and finishes.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {budgetLevels.map((b) => (
                  <button
                    key={b.name}
                    onClick={() => setBudgetLevel(b.name)}
                    className={`text-left rounded-xl border-2 p-5 transition-all duration-200 ${
                      budgetLevel === b.name
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/40 hover:bg-secondary/70 hover:border-primary/20"
                    }`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${budgetLevel === b.name ? "text-primary-foreground" : "text-foreground"}`}>
                      {b.name}
                    </p>
                    <p className={`text-xs leading-relaxed ${budgetLevel === b.name ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {b.desc}
                    </p>
                  </button>
                ))}
              </div>
            </section>
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button
                size="lg"
                className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg"
                onClick={handleContinue}
                disabled={!budgetLevel}
              >
                View Remodel Options
              </Button>
              <Link to="/dimensions" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dimensions
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <ShoppingAssistantFab />
    </div>
  );
};

export default StyleBudget;
