import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import BathroomInsights from "@/components/BathroomInsights";
import {
  formatPrice,
  getBathroomInsights,
  CUSTOMIZABLE_CATEGORIES,
  CATEGORY_GROUPS,
  getTierDefaults,
  getTierAlternatives,
  getStaticItemsTotal,
  TIER_BASE_LABOR,
  SHIPPING_ESTIMATE,
  type ProductTier,
  type TieredProduct,
} from "@/data/products";

// ─── Local types for component state ────────────────────────────────

interface Alternative {
  id: string;
  name: string;
  desc: string;
  vendor: string;
  finish: string;
  image?: string;
  tag?: string;
  spec?: string;
  laborNote?: string;
  disclaimer?: string;
  price: number;
  laborDelta: number;
}

interface Category {
  name: string;
  selected: string;
  selectedId: string;
  reason: string;
  price: number;
  vendor: string;
  image?: string;
  tag?: string;
  spec?: string;
  finish?: string;
  disclaimer?: string;
  alternatives: Alternative[];
  laborDelta: number;
  laborNote?: string;
  basePrice: number;
}

const tierNameMap: Record<string, ProductTier> = {
  budget: "Budget",
  balanced: "Balanced",
  premium: "Premium",
};

const buildCategoriesForTier = (tier: ProductTier): Category[] => {
  const defaults = getTierDefaults(tier);
  return defaults
    .filter((p) => CUSTOMIZABLE_CATEGORIES.includes(p.category))
    .map((product) => {
      const alts = getTierAlternatives(tier, product.category);
      return {
        name: product.category,
        selected: product.name,
        selectedId: product.id,
        reason: product.description,
        price: product.price,
        basePrice: product.price,
        vendor: product.vendor,
        image: product.image,
        tag: product.tag,
        spec: product.spec,
        finish: product.finish,
        disclaimer: product.disclaimer,
        laborDelta: 0,
        alternatives: alts.map((a) => ({
          id: a.id,
          name: a.name,
          desc: a.description,
          vendor: a.vendor,
          finish: a.finish,
          image: a.image,
          tag: a.tag,
          spec: a.spec,
          laborNote: a.laborNote,
          disclaimer: a.disclaimer,
          price: a.price,
          laborDelta: a.laborDelta,
        })),
      };
    });
};

const budgetCeilings: Record<string, number> = { Budget: 12000, Balanced: 19000, Premium: 32000 };

const CustomizeOption = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const insights = getBathroomInsights(project);

  const budgetLevel = project.style_preferences?.budget_level || "Balanced";
  const pkgTier = project.selected_package.tier || "balanced";
  const tier: ProductTier = tierNameMap[pkgTier] || "Balanced";

  const initialCategories = useMemo(() => buildCategoriesForTier(tier), [tier]);

  const otherItemsTotal = useMemo(() => getStaticItemsTotal(tier), [tier]);
  const baseLaborForTier = TIER_BASE_LABOR[tier];

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
  const [lastSwapNote, setLastSwapNote] = useState<string | null>(null);

  const customizableMaterials = categories.reduce((sum, c) => sum + c.price, 0);
  const materialsTotal = customizableMaterials + otherItemsTotal;
  const laborAdjustment = categories.reduce((sum, c) => sum + c.laborDelta, 0);
  const laborTotal = baseLaborForTier + laborAdjustment;
  const projectTotal = materialsTotal + laborTotal + SHIPPING_ESTIMATE;

  const ceiling = budgetCeilings[budgetLevel] || budgetCeilings[tier] || 19000;
  const isOverBudget = projectTotal > ceiling;

  const selectAlternative = (catName: string, alt: Alternative) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.name === catName
          ? {
              ...c,
              selected: alt.name,
              selectedId: alt.id,
              reason: alt.desc,
              price: alt.price,
              vendor: alt.vendor,
              image: alt.image,
              tag: alt.tag,
              spec: alt.spec,
              finish: alt.finish,
              disclaimer: alt.disclaimer,
              laborDelta: alt.laborDelta,
              laborNote: alt.laborNote,
            }
          : c
      )
    );
    setExpandedCategory(null);
    setLastSwapNote(alt.laborNote || null);
    toast.success(`${alt.name} selected`, { description: `${catName} updated` });
  };

  const resetToDefault = (catName: string) => {
    const base = initialCategories.find((c) => c.name === catName);
    if (!base) return;
    setCategories((prev) =>
      prev.map((c) => (c.name === catName ? { ...base } : c))
    );
    setLastSwapNote(null);
    toast.success(`${catName} reset to default`);
  };

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
          <Link to={`/package/${pkgTier}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
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
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{tier} Package</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Customize Your Selections</h1>
            <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
              Swap products below and see how each change affects your estimate.
            </p>
          </div>

          {insights.length > 0 && (
            <div className="mb-8">
              <BathroomInsights insights={insights} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product cards — grouped by section */}
            <div className="lg:col-span-2 space-y-8">
              {CATEGORY_GROUPS.map((group) => {
                const groupCats = categories.filter((c) => group.categories.includes(c.name as any));
                if (groupCats.length === 0) return null;
                return (
                  <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{group.label}</p>
                    <div className="space-y-4">
              {groupCats.map((cat) => {
                const isExpanded = expandedCategory === cat.name;
                const isSwapped = cat.selected !== initialCategories.find((ic) => ic.name === cat.name)?.selected;
                const priceDiff = cat.price - cat.basePrice;
                return (
                  <div key={cat.name} className={`rounded-xl border-2 transition-all duration-200 ${isExpanded ? "border-primary/40 bg-card" : "border-border bg-card"}`}>
                    <div className="flex items-start gap-4 p-5">
                      {cat.image ? (
                        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                          <img src={cat.image} alt={cat.selected} className="w-full h-full object-cover" width={640} height={512} loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-20 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground font-medium">{cat.name}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{cat.name}</p>
                          {cat.tag && (
                            <span className="text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">{cat.tag}</span>
                          )}
                          {isSwapped && (
                            <span className="text-[10px] font-medium bg-secondary text-muted-foreground rounded-full px-2 py-0.5">Changed</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">{cat.selected}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{cat.vendor}</span>
                          {cat.finish && (
                            <>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground">{cat.finish}</span>
                            </>
                          )}
                        </div>
                        {cat.spec && <p className="text-[11px] text-muted-foreground mt-1">{cat.spec}</p>}
                        {cat.disclaimer && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{cat.disclaimer}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{fmt(cat.price)}</span>
                          {priceDiff !== 0 && (
                            <p className={`text-[10px] font-medium ${priceDiff > 0 ? "text-destructive" : "text-primary"}`}>
                              {priceDiff > 0 ? "+" : ""}{fmt(priceDiff)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="outline" size="sm" className="text-xs h-8 px-3 rounded-lg" onClick={() => toggleExpand(cat.name)}>
                            {isExpanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Close</> : <>Change</>}
                          </Button>
                          {isSwapped && (
                            <button onClick={() => resetToDefault(cat.name)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                            <p className="text-sm font-medium text-foreground">Compare {cat.name} Options</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {cat.alternatives.map((alt) => {
                                const materialDiff = alt.price - cat.basePrice;
                                return (
                                  <div key={alt.id} className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
                                    {alt.image ? (
                                      <div className="w-full aspect-[3/2] rounded-lg overflow-hidden bg-secondary">
                                        <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" width={640} height={512} loading="lazy" />
                                      </div>
                                    ) : (
                                      <div className="w-full aspect-[3/2] rounded-lg bg-secondary flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground font-medium tracking-wide">{cat.name}</span>
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      {alt.tag && (
                                        <span className="text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5 inline-block mb-1">{alt.tag}</span>
                                      )}
                                      <p className="text-sm font-medium text-foreground leading-snug">{alt.name}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{alt.vendor}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{alt.desc}</p>
                                      {alt.finish && (
                                        <p className="text-[11px] text-muted-foreground mt-1">Finish: {alt.finish}</p>
                                      )}
                                      {alt.spec && (
                                        <p className="text-[11px] text-muted-foreground">{alt.spec}</p>
                                      )}
                                      {alt.disclaimer && (
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{alt.disclaimer}</p>
                                      )}
                                      <div className="mt-2">
                                        <p className="text-sm font-semibold text-foreground">{fmt(alt.price)}</p>
                                        {(materialDiff !== 0 || alt.laborDelta !== 0) && (
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {materialDiff !== 0 && <span className={materialDiff > 0 ? "text-destructive" : "text-primary"}>{materialDiff > 0 ? "+" : ""}{fmt(materialDiff)} material</span>}
                                            {materialDiff !== 0 && alt.laborDelta !== 0 && " · "}
                                            {alt.laborDelta > 0 && <span className="text-destructive">+{fmt(alt.laborDelta)} labor</span>}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="pt-1">
                                      <Button size="sm" className="w-full text-xs h-8 px-4 rounded-lg" onClick={() => selectAlternative(cat.name, alt)}>Select</Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget panel */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <h3 className="font-heading text-lg text-foreground">Estimate</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your selections ({categories.length} items)</span>
                      <span className="font-medium text-foreground">{fmt(customizableMaterials)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other included items ({STATIC_ITEMS[tier].length})</span>
                      <span className="font-medium text-muted-foreground">{fmt(otherItemsTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All materials</span>
                      <span className="font-medium text-foreground">{fmt(materialsTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. labor</span>
                      <div className="text-right">
                        <span className="font-medium text-foreground">{fmt(laborTotal)}</span>
                        {laborAdjustment > 0 && (
                          <p className="text-[10px] text-destructive">+{fmt(laborAdjustment)} from install complexity</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping (est.)</span>
                      <span className="font-medium text-foreground">~{fmt(SHIPPING_ESTIMATE)}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Est. Total</span>
                      <span className="font-bold text-foreground text-base">{fmt(projectTotal)}</span>
                    </div>
                  </div>

                  {/* Cost change explanation */}
                  <AnimatePresence mode="wait">
                    {lastSwapNote && (
                      <motion.div
                        key={lastSwapNote}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="rounded-lg bg-secondary/50 border border-border px-3 py-2.5"
                      >
                        <p className="text-xs text-muted-foreground leading-relaxed">{lastSwapNote}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isOverBudget ? (
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive font-medium">Above {budgetLevel} range ({fmt(ceiling)})</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary font-medium">Within {budgetLevel} range</span>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Actual costs depend on your contractor and region. Lighting and toilet are included at default pricing.
                  </p>
                </div>

                <Button size="lg" className="w-full h-12 text-base font-semibold rounded-lg" onClick={handleContinue}>
                  Continue with These Selections
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
