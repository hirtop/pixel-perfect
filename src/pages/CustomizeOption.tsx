import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alternative {
  name: string;
  desc: string;
  impact: string;
  impactValue: number;
}

interface Category {
  name: string;
  selected: string;
  reason: string;
  price: number;
  alternatives: Alternative[];
}

const initialCategories: Category[] = [
  {
    name: "Vanity",
    selected: "Floating oak vanity with quartz top",
    reason: "Adds warmth while keeping the room feeling open",
    price: 1850,
    alternatives: [
      { name: "White shaker vanity with integrated sink", desc: "Classic look, easy to clean", impact: "- $200", impactValue: -200 },
      { name: "Walnut double-drawer vanity", desc: "Rich tone with extra storage", impact: "+ $450", impactValue: 450 },
      { name: "Minimal wall-mounted vanity", desc: "Ultra-clean, space-saving profile", impact: "- $350", impactValue: -350 },
    ],
  },
  {
    name: "Tile",
    selected: "Large-format porcelain in warm gray",
    reason: "Low-maintenance with a refined, modern feel",
    price: 2200,
    alternatives: [
      { name: "Subway tile in soft white", desc: "Timeless and budget-friendly", impact: "- $400", impactValue: -400 },
      { name: "Natural marble mosaic accent", desc: "Luxurious focal point", impact: "+ $800", impactValue: 800 },
    ],
  },
  {
    name: "Faucet",
    selected: "Single-handle brushed nickel faucet",
    reason: "Clean lines that complement the vanity hardware",
    price: 380,
    alternatives: [
      { name: "Widespread brushed nickel faucet", desc: "Traditional spread, same finish", impact: "+ $120", impactValue: 120 },
      { name: "Matte black single-handle faucet", desc: "Bold contrast, modern edge", impact: "No change", impactValue: 0 },
    ],
  },
  {
    name: "Lighting",
    selected: "Dual wall sconces, frosted glass",
    reason: "Even, flattering light without harsh overhead glare",
    price: 520,
    alternatives: [
      { name: "LED vanity light bar", desc: "Bright, even illumination", impact: "- $150", impactValue: -150 },
      { name: "Brass pendant sconces", desc: "Warm accent lighting", impact: "+ $280", impactValue: 280 },
    ],
  },
  {
    name: "Mirror",
    selected: "Frameless rectangular mirror with shelf ledge",
    reason: "Keeps the space feeling open and minimal",
    price: 340,
    alternatives: [
      { name: "Round brass-framed mirror", desc: "Soft shape, warm accent", impact: "+ $90", impactValue: 90 },
      { name: "Medicine cabinet with mirror front", desc: "Hidden storage, clean look", impact: "+ $180", impactValue: 180 },
    ],
  },
  {
    name: "Toilet",
    selected: "Elongated comfort-height toilet",
    reason: "Modern profile with easy-clean features",
    price: 650,
    alternatives: [
      { name: "Wall-hung toilet", desc: "Sleek, easy to clean underneath", impact: "+ $400", impactValue: 400 },
      { name: "Standard round-front toilet", desc: "Compact and budget-friendly", impact: "- $200", impactValue: -200 },
    ],
  },
  {
    name: "Shower / Tub Hardware",
    selected: "Rain showerhead with handheld combo",
    reason: "Spa-like feel without a full fixture overhaul",
    price: 460,
    alternatives: [
      { name: "Standard single showerhead", desc: "Simple and reliable", impact: "- $180", impactValue: -180 },
      { name: "Thermostatic shower system", desc: "Precise temp control, premium feel", impact: "+ $550", impactValue: 550 },
    ],
  },
];

const baseLaborRate = 5800;
const baseShipping = 650;

const CustomizeOption = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Vanity");

  const materialsTotal = categories.reduce((sum, c) => sum + c.price, 0);
  const laborTotal = baseLaborRate;
  const shippingTotal = baseShipping;
  const projectTotal = materialsTotal + laborTotal + shippingTotal;

  const selectAlternative = (catName: string, alt: Alternative) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.name === catName
          ? { ...c, selected: alt.name, reason: alt.desc, price: c.price + alt.impactValue }
          : c
      )
    );
    setExpandedCategory(null);
  };

  const toggleExpand = (name: string) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to="/package/balanced" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Package Detail
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Balanced Package</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">
              Customize This Option
            </h1>
            <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
              Refine your package by exploring product alternatives and watching your budget update in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — categories */}
            <div className="lg:col-span-2 space-y-4">
              {categories.map((cat) => {
                const isExpanded = expandedCategory === cat.name;
                return (
                  <div
                    key={cat.name}
                    className={`rounded-xl border-2 transition-all duration-200 ${
                      isExpanded ? "border-primary/40 bg-card" : "border-border bg-card"
                    }`}
                  >
                    {/* Category header */}
                    <div className="flex items-center justify-between p-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{cat.name}</p>
                        <p className="text-sm font-medium text-foreground truncate">{cat.selected}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cat.reason}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">{fmt(cat.price)}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 px-3 rounded-lg"
                          onClick={() => toggleExpand(cat.name)}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3 w-3 mr-1" /> Close</>
                          ) : (
                            <>Change</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Alternatives */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                            <p className="text-sm font-medium text-foreground">Compare {cat.name} Options</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {cat.alternatives.map((alt) => (
                                <div
                                  key={alt.name}
                                  className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors"
                                >
                                  <div className="w-full aspect-[3/2] rounded-lg bg-secondary flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground font-medium tracking-wide">{cat.name}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground leading-snug">{alt.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{alt.desc}</p>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className={`text-xs font-semibold ${
                                      alt.impactValue > 0
                                        ? "text-accent"
                                        : alt.impactValue < 0
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                    }`}>
                                      {alt.impact}
                                    </span>
                                    <Button
                                      size="sm"
                                      className="text-xs h-8 px-4 rounded-lg"
                                      onClick={() => selectAlternative(cat.name, alt)}
                                    >
                                      Select This Option
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Right — live budget */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-heading text-lg text-foreground">Live Budget</h3>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materials</span>
                      <span className="font-medium text-foreground">{fmt(materialsTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Labor</span>
                      <span className="font-medium text-foreground">{fmt(laborTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping / Fees</span>
                      <span className="font-medium text-foreground">{fmt(shippingTotal)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Est. Total</span>
                      <span className="font-bold text-foreground text-base">{fmt(projectTotal)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Totals update as you compare and swap products.
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary font-medium">Within your selected budget range</span>
                  </div>
                </div>

                <Button size="lg" className="w-full h-12 text-base font-semibold rounded-lg">
                  Continue with This Package
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CustomizeOption;
