import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";
import { useProject } from "@/contexts/ProjectContext";
import { tieredCatalog, getProductTotalPrice, type TieredProduct, type ProductTier } from "@/data/tiered-catalog";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = [
  "Vanities",
  "Faucets",
  "Mirrors",
  "Sinks",
  "Main Floor Tile",
  "Shower Floor Tile",
  "Shower Wall Tile",
  "Accent Tile",
  "Shower Doors",
  "Shower Valve",
  "Shower Systems",
  "Bathtubs",
  "Tub Valve",
  "Lighting",
] as const;

const TIER_BADGE: Record<ProductTier, string> = {
  Budget: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Balanced: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Premium: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

// User-facing label only. Internal IDs/keys remain "Budget".
const TIER_DISPLAY_NAME: Record<ProductTier, string> = {
  Budget: "Essential",
  Balanced: "Balanced",
  Premium: "Premium",
};

interface CategorySelection {
  name: string;
  selected: string;
  price: number;
}

export default function Shop() {
  const navigate = useNavigate();
  const { project, updateProject, saveProject } = useProject();

  const grouped = useMemo(() => {
    const map: Record<string, TieredProduct[]> = {};
    for (const cat of CATEGORY_ORDER) {
      const items = tieredCatalog.filter((p) => p.category === cat);
      if (items.length > 0) map[cat] = items;
    }
    return map;
  }, []);

  const selections: CategorySelection[] = project.customizations.categories || [];
  const selectedByCategory = useMemo(() => {
    const m: Record<string, CategorySelection> = {};
    for (const s of selections) m[s.name] = s;
    return m;
  }, [selections]);

  const total = selections.reduce((sum, s) => sum + (s.price || 0), 0);

  // ─── User's chosen tier (from /style-budget) ──────────────────────
  const budgetLevelMap: Record<string, ProductTier> = {
    "Budget-Conscious": "Budget",
    "Balanced": "Balanced",
    "Premium": "Premium",
  };
  const userTier: ProductTier | null =
    budgetLevelMap[project.style_preferences?.budget_level ?? ""] ?? null;

  // ─── Target budget (parsed from style_preferences.budget) ─────────
  const targetBudget: number | null = project.style_preferences?.budget
    ? Number(project.style_preferences.budget)
    : null;

  // ─── Auto pre-selection on mount (runs once) ──────────────────────
  useEffect(() => {
    if (!userTier) return;
    if ((project.customizations.categories || []).length > 0) return;
    if (Object.keys(grouped).length === 0) return;
    const next: CategorySelection[] = [];
    for (const [category, items] of Object.entries(grouped)) {
      const product = items.find((p) => p.tier === userTier);
      if (!product) continue;
      next.push({ name: category, selected: product.id, price: getProductTotalPrice(product) });
    }
    if (next.length === 0) return;
    updateProject({
      customizations: { ...project.customizations, categories: next },
    });
    void saveProject({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (categoryName: string, product: TieredProduct) => {
    const others = selections.filter((s) => s.name !== categoryName);
    const next: CategorySelection[] = [
      ...others,
      { name: categoryName, selected: product.id, price: getProductTotalPrice(product) },
    ];
    updateProject({
      customizations: { ...project.customizations, categories: next },
    });
    void saveProject({ silent: true });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX{" "}
            <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">
              Remodel
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/shop" className="text-foreground">Shop</Link>
          </div>
          <AccountMenu />
        </div>
      </nav>

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-3">
            Build Your Bathroom
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select one product per category. Mix and match across any budget level.
          </p>
        </div>
      </header>

      {/* Categories */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {Object.entries(grouped).map(([category, products]) => {
          const sel = selectedByCategory[category];
          return (
            <section key={category}>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-heading text-2xl text-foreground">{category}</h2>
                {sel && (
                  <span className="text-xs text-muted-foreground">
                    Selected · {formatPrice(sel.price)}
                  </span>
                )}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-3 -mx-6 px-6 snap-x">
                {products.map((p) => {
                  const isSelected = sel?.selected === p.id;
                  return (
                    <article
                      key={p.id}
                      className={cn(
                        "snap-start shrink-0 w-64 rounded-2xl border bg-card flex flex-col overflow-hidden transition-all",
                        isSelected
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-border hover:border-muted-foreground/40",
                      )}
                    >
                      <div className="h-[200px] w-full bg-muted overflow-hidden">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <span
                          className={cn(
                            "self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2",
                            TIER_BADGE[p.tier],
                          )}
                        >
                          {TIER_DISPLAY_NAME[p.tier] || p.tier}
                        </span>

                        <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2 mb-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1">{p.vendor}</p>
                        {p.spec && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {p.spec}
                          </p>
                        )}
                        {p.affiliateUrl && p.affiliateUrl.trim() !== "" && (
                          <a
                            href={p.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground underline hover:text-foreground mb-3"
                          >
                            View product
                          </a>
                        )}

                        <p className="text-xl font-bold text-primary mb-3 mt-auto">
                          {formatPrice(p.price)}
                        </p>

                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={() => handleSelect(category, p)}
                        >
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Selected
                            </>
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Sticky total bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Materials Total
                </p>
                <p className="font-heading text-2xl text-foreground">{formatPrice(total)}</p>
              </div>
              {targetBudget !== null && targetBudget > 0 && (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {userTier ? `Target · ${userTier}` : "Target"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(targetBudget)}
                  </p>
                </div>
              )}
            </div>

            {targetBudget !== null && targetBudget > 0 ? (() => {
              const pct = Math.min(100, Math.round((total / targetBudget) * 100));
              const over = total > targetBudget;
              const remaining = targetBudget - total;
              return (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        over ? "bg-destructive" : "bg-primary",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      over ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {over
                      ? `Over budget by ${formatPrice(Math.abs(remaining))}`
                      : `${formatPrice(remaining)} remaining · ${selections.length} of ${Object.keys(grouped).length} categories selected`}
                  </p>
                </div>
              );
            })() : (
              <p className="text-xs text-muted-foreground mt-1">
                {selections.length} of {Object.keys(grouped).length} categories selected
              </p>
            )}
          </div>
          <Button size="lg" onClick={() => navigate("/summary")}>
            Continue to Summary →
          </Button>
        </div>
      </div>
    </div>
  );
}
