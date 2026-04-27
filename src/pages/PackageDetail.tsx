import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams, Navigate } from "react-router-dom";
import { Check, ArrowLeft, Home, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const VALID_TIERS = new Set(["budget", "balanced", "premium"]);

const PRODUCT_PRICES: Record<string, string> = {
  "Vanity": "$649",
  "Sink": "$189",
  "Faucet": "$148",
  "Mirror": "$124",
  "Shower Wall Tile": "$3.49/sq ft",
  "Main Floor Tile": "$2.89/sq ft",
  "Shower Floor Tile": "$3.29/sq ft",
  "Accent Tile": "Not included",
  "Shower Glass": "$389",
  "Shower Valve": "$287",
  "Shower Trim": "$234",
  "Tub": "$899",
  "Tub Valve": "$198",
  "Shower Niche": "$89",
  "Lighting": "$178",
  "Toilet": "$449",
};

const PRODUCT_IMAGES: Record<string, string> = {
  "Vanity": "https://picsum.photos/id/314/400/300",
  "Sink": "https://picsum.photos/id/425/400/300",
  "Faucet": "https://picsum.photos/id/366/400/300",
  "Mirror": "https://picsum.photos/id/326/400/300",
  "Shower Wall Tile": "https://picsum.photos/id/401/400/300",
  "Main Floor Tile": "https://picsum.photos/id/412/400/300",
  "Shower Floor Tile": "https://picsum.photos/id/433/400/300",
  "Shower Glass": "https://picsum.photos/id/318/400/300",
  "Shower Valve": "https://picsum.photos/id/381/400/300",
  "Shower Trim": "https://picsum.photos/id/350/400/300",
  "Tub": "https://picsum.photos/id/338/400/300",
  "Tub Valve": "https://picsum.photos/id/392/400/300",
  "Shower Niche": "https://picsum.photos/id/355/400/300",
  "Lighting": "https://picsum.photos/id/378/400/300",
  "Toilet": "https://picsum.photos/id/430/400/300",
};

const PRODUCT_FIT_REASONS: Record<string, string> = {
  "Vanity": "Matches your Matte Black finish preference",
  "Sink": "Sized for standard vanity top cutouts",
  "Faucet": "Matte Black finish — matches your selection",
  "Mirror": "Sized for standard single-sink vanity width",
  "Shower Wall Tile": "Large format reduces grout lines",
  "Main Floor Tile": "Rectified edges for tight grout lines",
  "Shower Floor Tile": "Mosaic format conforms to shower pan slope",
  "Shower Glass": "Hinged door fits your bathroom layout",
  "Shower Valve": "Thermostatic — maintains exact temperature",
  "Shower Trim": "Magnetic docking handheld",
  "Tub": "Freestanding oval fits your square footage",
  "Tub Valve": "Thermostatic — pairs with your tub",
  "Shower Niche": "Waterproof prefab — sized to your tile format",
  "Lighting": "Frosted glass diffuses light evenly",
  "Toilet": "Elongated bowl — standard rough-in fit",
};

const PackageDetail = () => {
  const { project, updateProject, markStepComplete, isLoaded } = useProject();
  const { id: urlTierRaw } = useParams<{ id: string }>();
  const urlTier = (urlTierRaw || "").toLowerCase();
  const urlTierIsValid = VALID_TIERS.has(urlTier);

  // URL is the source of truth for which tier to render. Fall back to saved
  // package only when the URL is missing/invalid (defensive — should not happen
  // because the route requires :id).
  const savedTier = project.selected_package.tier?.toLowerCase();
  const pkgTier = urlTierIsValid ? urlTier : (savedTier || "balanced");
  const tier: ProductTier = tierNameMap[pkgTier] || "Balanced";
  const pkgName = tier; // capitalized name matches tier

  const finishDir = project.style_preferences.finish || "";
  const insights = getBathroomInsights(project);
  const fitReason = packageFitReasons[pkgName] || packageFitReasons.Balanced;
  const pricing = packagePricing[pkgName] || packagePricing.Balanced;
  const heroImg = tierImages[pkgTier] || balancedImg;

  // Sync URL tier into project state when it differs from the saved tier.
  // Wait for hydration to avoid clobbering an in-flight backend load with stale defaults.
  useEffect(() => {
    if (!isLoaded) return;
    if (!urlTierIsValid) return;
    if (savedTier !== urlTier) {
      updateProject({ selected_package: { name: tierNameMap[urlTier], tier: urlTier } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, urlTier, urlTierIsValid, savedTier]);

  // Persist that the user has reached the package detail step so resume
  // returns them here. Wait for hydration so we don't overwrite a freshly
  // loaded project with stale defaults.
  useEffect(() => {
    if (!isLoaded) return;
    if (!urlTierIsValid) return;
    markStepComplete("package-detail");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, urlTier, urlTierIsValid]);

  // If the URL is malformed (e.g. /package/foo), send the user to options
  // — but only after hydration so we don't bounce mid-load.
  if (isLoaded && !urlTierIsValid) {
    return <Navigate to="/options" replace />;
  }


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
                  <span className="text-muted-foreground">
                    Materials ({customizableProducts.length} items)
                  </span>
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
                <div key={item.category} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
                  {PRODUCT_IMAGES[item.category] ? (
                    <img
                      src={PRODUCT_IMAGES[item.category]}
                      alt={item.name}
                      className="h-[140px] w-full object-cover"
                      loading="lazy"
                      width={400}
                      height={140}
                    />
                  ) : (
                    <div className="h-[140px] w-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-5 space-y-2 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.category}</p>
                      <span className="text-[10px] text-muted-foreground">{item.vendor}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{PRODUCT_PRICES[item.category] || ""}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    <div className="flex-1" />
                    {PRODUCT_FIT_REASONS[item.category] && (
                      <p className="text-xs italic text-muted-foreground pt-1">{PRODUCT_FIT_REASONS[item.category]}</p>
                    )}
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-1 hover:cursor-not-allowed"
                            asChild
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>View Product →</a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Product links coming soon</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {staticItems.map((item) => (
                <div key={item.category} className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
                  {PRODUCT_IMAGES[item.category] ? (
                    <img
                      src={PRODUCT_IMAGES[item.category]}
                      alt={item.name}
                      className="h-[140px] w-full object-cover"
                      loading="lazy"
                      width={400}
                      height={140}
                    />
                  ) : (
                    <div className="h-[140px] w-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                    </div>
                  )}
                  <div className="p-5 space-y-2 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.category}</p>
                      <span className="text-[10px] text-muted-foreground">{item.vendor}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{PRODUCT_PRICES[item.category] || ""}</p>
                    <div className="flex-1" />
                    {PRODUCT_FIT_REASONS[item.category] && (
                      <p className="text-xs italic text-muted-foreground pt-1">{PRODUCT_FIT_REASONS[item.category]}</p>
                    )}
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-1 hover:cursor-not-allowed"
                            asChild
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>View Product →</a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Product links coming soon</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
