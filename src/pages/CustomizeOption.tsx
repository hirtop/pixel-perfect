import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import {
  balancedProducts,
  balancedAlternatives,
  formatPrice,
  type ProductCategory,
  type ProductAlternative,
} from "@/data/products";

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

const formatImpact = (v: number) =>
  v > 0 ? `+ $${v.toLocaleString()}` : v < 0 ? `- $${Math.abs(v).toLocaleString()}` : "No change";

const initialCategories: Category[] = balancedProducts.map((product) => {
  const alts: ProductAlternative[] = balancedAlternatives[product.category] || [];
  return {
    name: product.category,
    selected: product.name,
    reason: product.description,
    price: product.price,
    alternatives: alts.map((a) => ({
      name: a.name,
      desc: a.description,
      impact: formatImpact(a.priceImpact),
      impactValue: a.priceImpact,
    })),
  };
});

const baseLaborRate = 5800;
const baseShipping = 650;

const CustomizeOption = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // Restore from context if previously saved
  const savedCats = project.customizations.categories;
  const [categories, setCategories] = useState<Category[]>(
    savedCats && Array.isArray(savedCats) && savedCats.length > 0
      ? initialCategories.map((ic) => {
          const saved = savedCats.find((s) => s.name === ic.name);
          return saved ? { ...ic, selected: saved.selected, price: saved.price } : ic;
        })
      : initialCategories
  );
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
    toast.success(`${alt.name} selected`, { description: `${catName} updated in your package` });
  };

  // Persist customizations on changes, skip initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const simplified = categories.map((c) => ({ name: c.name, selected: c.selected, price: c.price }));
    updateProject({ customizations: { categories: simplified } });
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    const simplified = categories.map((c) => ({ name: c.name, selected: c.selected, price: c.price }));
    updateProject({ customizations: { categories: simplified } });
    markStepComplete("customize");
    navigate("/workflow");
  };

  const toggleExpand = (name: string) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
  };

  const fmt = formatPrice;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to={`/package/${project.selected_package.tier || "balanced"}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{project.selected_package.name || "Balanced"} Package</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Customize This Option</h1>
            <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
              Refine your package by exploring product alternatives and watching your budget update in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {categories.map((cat) => {
                const isExpanded = expandedCategory === cat.name;
                return (
                  <div key={cat.name} className={`rounded-xl border-2 transition-all duration-200 ${isExpanded ? "border-primary/40 bg-card" : "border-border bg-card"}`}>
                    <div className="flex items-center justify-between p-5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{cat.name}</p>
                        <p className="text-sm font-medium text-foreground truncate">{cat.selected}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{cat.reason}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">{fmt(cat.price)}</span>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-3 rounded-lg" onClick={() => toggleExpand(cat.name)}>
                          {isExpanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Close</> : <>Change</>}
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                            <p className="text-sm font-medium text-foreground">Compare {cat.name} Options</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {cat.alternatives.map((alt) => (
                                <div key={alt.name} className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
                                  <div className="w-full aspect-[3/2] rounded-lg bg-secondary flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground font-medium tracking-wide">{cat.name}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground leading-snug">{alt.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{alt.desc}</p>
                                  </div>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className={`text-xs font-semibold ${alt.impactValue > 0 ? "text-accent" : alt.impactValue < 0 ? "text-primary" : "text-muted-foreground"}`}>{alt.impact}</span>
                                    <Button size="sm" className="text-xs h-8 px-4 rounded-lg" onClick={() => selectAlternative(cat.name, alt)}>Select This Option</Button>
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

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-heading text-lg text-foreground">Live Budget</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span className="font-medium text-foreground">{fmt(materialsTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Est. Labor</span><span className="font-medium text-foreground">{fmt(laborTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping / Fees</span><span className="font-medium text-foreground">{fmt(shippingTotal)}</span></div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between"><span className="font-semibold text-foreground">Est. Total</span><span className="font-bold text-foreground text-base">{fmt(projectTotal)}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Totals update as you compare and swap products.</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary font-medium">Within your selected budget range</span>
                  </div>
                </div>

                <Button size="lg" className="w-full h-12 text-base font-semibold rounded-lg" onClick={handleContinue}>
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
