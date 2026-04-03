import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const styles = [
  { name: "Modern", desc: "Clean lines and contemporary finishes" },
  { name: "Spa", desc: "Soft, calming, resort-inspired" },
  { name: "Traditional", desc: "Timeless details and classic warmth" },
  { name: "Minimal", desc: "Simple, refined, and uncluttered" },
  { name: "Luxury", desc: "High-end finishes and elevated details" },
  { name: "Transitional", desc: "A balanced blend of classic and modern" },
];

const budgetLevels = [
  { name: "Budget-Conscious", desc: "Focused on value and essential upgrades" },
  { name: "Balanced", desc: "A mix of quality, function, and style" },
  { name: "Premium", desc: "More flexibility for finishes and upgrades" },
];

const finishes = ["Chrome", "Matte Black", "Brushed Nickel", "Brass", "Mixed / Open"];

const StyleBudget = () => {
  const [selectedStyle, setSelectedStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetLevel, setBudgetLevel] = useState("");
  const [finish, setFinish] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              Choose Your Style and Budget
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Help BOBOX understand your design taste and budget range so we can generate better remodel options.
            </p>
          </div>

          <div className="space-y-12">
            {/* Style Direction */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Style Direction</p>
                <p className="text-sm text-muted-foreground">Select the look that best matches your vision.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {styles.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedStyle(s.name)}
                    className={`group text-left rounded-xl border-2 p-5 transition-all duration-200 ${
                      selectedStyle === s.name
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/40 hover:bg-secondary/70 hover:border-primary/20"
                    }`}
                  >
                    <p className={`text-sm font-semibold mb-1 ${
                      selectedStyle === s.name ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {s.name}
                    </p>
                    <p className={`text-xs leading-relaxed ${
                      selectedStyle === s.name ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {s.desc}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Budget Preference */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Budget Preference</p>
                <p className="text-sm text-muted-foreground">Set a target and choose your comfort level.</p>
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="budget" className="text-sm font-medium text-foreground">
                  Target Budget <span className="text-muted-foreground font-normal">(optional)</span>
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
                    <p className={`text-sm font-semibold mb-1 ${
                      budgetLevel === b.name ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {b.name}
                    </p>
                    <p className={`text-xs leading-relaxed ${
                      budgetLevel === b.name ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {b.desc}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Finish Preference */}
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Finish Preference</p>
                <p className="text-sm text-muted-foreground">Choose a hardware finish direction.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {finishes.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      finish === f
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" asChild>
                <Link to="/options">Generate Remodel Options</Link>
              </Button>
              <Link to="/dimensions" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dimensions
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StyleBudget;
