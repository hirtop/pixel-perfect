import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { getBathroomInsights, packageFitReasons } from "@/data/products";
import BathroomInsights from "@/components/BathroomInsights";
import budgetImg from "@/assets/package-budget.jpg";
import balancedImg from "@/assets/package-balanced.jpg";
import premiumImg from "@/assets/package-premium.jpg";

const packages = [
  {
    name: "Budget",
    image: budgetImg,
    summary: "A smart refresh focused on value and essential upgrades",
    materialRange: "$4,200 – $5,800",
    projectRange: "$8,500 – $12,000",
    highlights: ["Vanity & sink", "Ceramic tile", "Chrome faucet", "Updated lighting"],
    fit: packageFitReasons.Budget,
  },
  {
    name: "Balanced",
    image: balancedImg,
    summary: "A polished mix of quality, function, and style",
    materialRange: "$7,500 – $10,200",
    projectRange: "$14,000 – $19,000",
    highlights: ["Floating vanity", "Porcelain tile", "Brushed nickel fixtures", "Sconce lighting"],
    featured: true,
    fit: packageFitReasons.Balanced,
  },
  {
    name: "Premium",
    image: premiumImg,
    summary: "An elevated design direction with more finish flexibility",
    materialRange: "$13,000 – $18,500",
    projectRange: "$22,000 – $32,000",
    highlights: ["Custom vanity", "Natural stone tile", "Brass fixtures", "Designer lighting"],
    fit: packageFitReasons.Premium,
  },
];

const RemodelOptions = () => {
  const { project, updateProject, markStepComplete } = useProject();
  const navigate = useNavigate();
  const insights = getBathroomInsights(project);

  const selectPackage = (pkgName: string) => {
    updateProject({
      selected_package: { name: pkgName, tier: pkgName.toLowerCase() },
    });
    markStepComplete("package-select");
    navigate(`/package/${pkgName.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to="/style-budget" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Style & Budget
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
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Your Remodel Options</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Three curated directions based on your space, style, and budget.
            </p>
          </div>

          {/* Bathroom Insights */}
          <div className="mb-8 max-w-3xl mx-auto">
            <BathroomInsights insights={insights} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-xl bg-secondary/40 border border-border px-6 py-4 mb-12 text-sm">
            <div>
              <span className="text-muted-foreground">Materials Range </span>
              <span className="font-semibold text-foreground">$4,200 – $18,500</span>
            </div>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <div>
              <span className="text-muted-foreground">Project Range </span>
              <span className="font-semibold text-foreground">$8,500 – $32,000</span>
            </div>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <div>
              <span className="text-muted-foreground">Preference </span>
              <span className="font-semibold text-primary">{project.style_preferences.budget_level || "Balanced"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => {
              const isSelected = project.selected_package.name === pkg.name;
              return (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className={`group rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : pkg.featured
                        ? "border-primary shadow-md ring-1 ring-primary/10"
                        : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={pkg.image} alt={`${pkg.name} bathroom remodel`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width={800} height={600} loading={i === 0 ? undefined : "lazy"} />
                    {pkg.featured && !isSelected && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Recommended</div>
                    )}
                    {isSelected && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selected
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h2 className="font-heading text-xl text-foreground mb-1">{pkg.name}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pkg.summary}</p>
                    </div>

                    {/* Why this fits */}
                    <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground leading-relaxed">{pkg.fit}</p>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Materials</span>
                        <span className="font-medium text-foreground">{pkg.materialRange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Project</span>
                        <span className="font-semibold text-foreground">{pkg.projectRange}</span>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full h-11 text-sm font-semibold rounded-lg ${
                        pkg.featured || isSelected ? "" : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                      variant={pkg.featured || isSelected ? "default" : "secondary"}
                      onClick={() => selectPackage(pkg.name)}
                    >
                      {isSelected ? "View Selected Option" : "View Option"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RemodelOptions;
