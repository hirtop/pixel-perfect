import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import {
  getBathroomInsights,
  packageFitReasons,
  packagePricing,
  getTierDefaults,
  STATIC_ITEMS,
  CUSTOMIZABLE_CATEGORIES,
  type ProductTier,
} from "@/data/products";
import BathroomInsights from "@/components/BathroomInsights";
import balancedImg from "@/assets/package-balanced.jpg";
import budgetImg from "@/assets/package-budget.jpg";
import premiumImg from "@/assets/package-premium.jpg";

const tierImages: Record<string, string> = {
  budget: budgetImg,
  balanced: balancedImg,
  premium: premiumImg,
};

const tierNameMap: Record<string, ProductTier> = {
  budget: "Budget",
  balanced: "Balanced",
  premium: "Premium",
};

const PackageDetail = () => {
  const { project, markStepComplete } = useProject();
  const pkgName = project.selected_package.name || "Balanced";
  const pkgTier = project.selected_package.tier || "balanced";
  const tier: ProductTier = tierNameMap[pkgTier] || "Balanced";
  const finishDir = project.style_preferences.finish || "";
  const insights = getBathroomInsights(project);
  const fitReason = packageFitReasons[pkgName] || packageFitReasons.Balanced;
  const pricing = packagePricing[pkgName] || packagePricing.Balanced;
  const heroImg = tierImages[pkgTier] || balancedImg;

  // Persist that the user has reached the package detail step so
  // resume returns them here instead of jumping back to /options.
  useEffect(() => {
    if (project.selected_package?.tier) {
      markStepComplete("package-detail");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.selected_package?.tier]);


  // Pull tier-specific defaults for customizable categories
  const tierDefaults = getTierDefaults(tier);

  // Merge with any saved customizations
  const customizableProducts = tierDefaults
    .filter((p) => CUSTOMIZABLE_CATEGORIES.includes(p.category))
    .map((product) => {
      const custom = project.customizations.categories?.find((c) => c.name === product.category);
      return {
        category: product.category,
        name: custom?.selected || product.name,
        vendor: product.vendor,
        description: product.description,
      };
    });

  // Static (non-swappable) items for this tier
  const staticItems = STATIC_ITEMS[tier];

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/options" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Options
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
          className="max-w-6xl mx-auto"
        >
          {insights.length > 0 && (
            <div className="mb-8">
              <BathroomInsights insights={insights} compact />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div>
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={heroImg} alt={`${pkgName} package bathroom remodel`} className="w-full h-full object-cover" width={800} height={600} />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{pkgName} Package</p>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">{pkgName} Remodel</h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  {pricing.description}
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-foreground">{fitReason}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials (all 7 items)</span>
                  <span className="font-medium text-foreground">{pricing.materialRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Labor</span>
                  <span className="font-medium text-foreground">{pricing.laborRange}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-foreground font-semibold">Est. Project Total</span>
                  <span className="font-bold text-foreground">{pricing.projectRange}</span>
                </div>
                {finishDir && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Finish Direction</span>
                    <span className="font-medium text-foreground">{finishDir}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Ranges based on national averages. Actual costs depend on your contractor, region, and site conditions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg" asChild>
                  <Link to={`/customize/${pkgTier}`}>Customize This Option</Link>
                </Button>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base rounded-lg" asChild>
                  <Link to="/options">Compare Other Options</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Customizable categories */}
          <section className="mb-12">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Customizable</p>
              <h2 className="font-heading text-2xl text-foreground">Products you can swap</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customizableProducts.map((item) => (
                <div key={item.category} className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.category}</p>
                    <span className="text-[10px] text-muted-foreground">{item.vendor}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Other included items */}
          <section className="mb-16">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Also Included</p>
              <p className="text-sm text-muted-foreground">Included in every package. Not yet swappable — we're adding more options soon.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {staticItems.map((item) => (
                <div key={item.category} className="rounded-lg border border-border bg-card px-4 py-3 space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.category}</p>
                  <p className="text-sm text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.vendor}</p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default PackageDetail;
