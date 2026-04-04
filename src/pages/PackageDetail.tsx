import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { balancedProducts, PRODUCT_CATEGORIES, getBathroomInsights, packageFitReasons, packagePricing } from "@/data/products";
import BathroomInsights from "@/components/BathroomInsights";
import balancedImg from "@/assets/package-balanced.jpg";
import budgetImg from "@/assets/package-budget.jpg";
import premiumImg from "@/assets/package-premium.jpg";

const tierImages: Record<string, string> = {
  budget: budgetImg,
  balanced: balancedImg,
  premium: premiumImg,
};

const defaultCategories = PRODUCT_CATEGORIES.map((cat) => {
  const product = balancedProducts.find((p) => p.category === cat);
  return {
    name: cat,
    item: product?.name ?? cat,
    reason: product?.description ?? "",
    vendor: product?.vendor ?? "",
    price: product?.price ?? 0,
  };
});

const PackageDetail = () => {
  const { project } = useProject();
  const pkgName = project.selected_package.name || "Balanced";
  const pkgTier = project.selected_package.tier || "balanced";
  const finishDir = project.style_preferences.finish || "Brushed Nickel";
  const budgetComfort = project.style_preferences.budget_level || "Balanced";
  const insights = getBathroomInsights(project);
  const fitReason = packageFitReasons[pkgName] || packageFitReasons.Balanced;
  const pricing = packagePricing[pkgName] || packagePricing.Balanced;
  const heroImg = tierImages[pkgTier] || balancedImg;

  const categories = project.customizations.categories && project.customizations.categories.length > 0
    ? defaultCategories.map((dc) => {
        const custom = project.customizations.categories!.find((c) => c.name === dc.name);
        return custom ? { ...dc, item: custom.selected } : dc;
      })
    : defaultCategories;

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to="/options" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Options
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
          {/* Bathroom insights — compact on detail page */}
          <div className="mb-8">
            <BathroomInsights insights={insights} compact />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="space-y-3">
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img src={heroImg} alt={`${pkgName} bathroom remodel`} className="w-full h-full object-cover" width={800} height={600} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[budgetImg, balancedImg, premiumImg].map((src, i) => {
                  const isActive = src === heroImg;
                  return (
                    <div key={i} className={`rounded-lg overflow-hidden aspect-[4/3] border-2 transition-colors ${isActive ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" width={800} height={600} loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">{pkgName} Package</p>
                <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">{pkgName}</h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  {pricing.description}
                </p>
              </div>

              {/* Why this fits */}
              <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{fitReason}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on your uploaded room, dimensions, and preferences</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/30 p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-medium text-foreground">{pricing.materialRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Labor</span>
                  <span className="font-medium text-foreground">{pricing.laborRange}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="text-foreground font-semibold">Est. Project Total</span>
                  <span className="font-bold text-foreground">{pricing.projectRange}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Your Budget Comfort</span>
                  <span className="font-medium text-primary">{budgetComfort}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Finish Direction</span>
                  <span className="font-medium text-foreground">{finishDir}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Estimates based on national averages. Final totals vary by contractor, region, and site conditions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg" asChild>
                  <Link to={`/customize/${pkgTier}`}>Customize This Option</Link>
                </Button>
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base rounded-lg" asChild>
                  <Link to="/options">Compare Other Packages</Link>
                </Button>
              </div>
            </div>
          </div>

          <section className="mb-16">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">What's Included</p>
              <h2 className="font-heading text-2xl text-foreground">Included in this package</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.name} className="rounded-xl border border-border bg-card p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{cat.name}</p>
                    {cat.vendor && <span className="text-[10px] text-muted-foreground">{cat.vendor}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground">{cat.item}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.reason}</p>
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
