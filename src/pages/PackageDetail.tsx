import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import balancedImg from "@/assets/package-balanced.jpg";
import budgetImg from "@/assets/package-budget.jpg";
import premiumImg from "@/assets/package-premium.jpg";

const categories = [
  { name: "Vanity", item: "Floating oak vanity with quartz top", reason: "Adds warmth while keeping the room feeling open" },
  { name: "Tile", item: "Large-format porcelain in warm gray", reason: "Low-maintenance with a refined, modern feel" },
  { name: "Faucet", item: "Single-handle brushed nickel faucet", reason: "Clean lines that complement the vanity hardware" },
  { name: "Lighting", item: "Dual wall sconces, frosted glass", reason: "Even, flattering light without harsh overhead glare" },
  { name: "Mirror", item: "Frameless rectangular mirror with shelf ledge", reason: "Keeps the space feeling open and minimal" },
  { name: "Toilet", item: "Elongated comfort-height toilet", reason: "Modern profile with easy-clean features" },
  { name: "Shower / Tub Hardware", item: "Rain showerhead with handheld combo", reason: "Spa-like feel without a full fixture overhaul" },
];

const whyFits = [
  "Balances quality materials with a realistic budget range",
  "Matches a modern, spa-inspired design direction",
  "Works well for everyday functionality and long-term value",
];

const PackageDetail = () => (
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
        {/* Two-column hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left — images */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={balancedImg} alt="Balanced bathroom remodel" className="w-full h-full object-cover" width={800} height={600} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[balancedImg, budgetImg, premiumImg].map((src, i) => (
                <div key={i} className={`rounded-lg overflow-hidden aspect-[4/3] border-2 transition-colors ${i === 0 ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" width={800} height={600} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* Right — summary */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Balanced Package</p>
              <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3">Balanced</h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                A polished mix of quality, function, and style tailored to your bathroom.
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-xl border border-border bg-secondary/30 p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materials</span>
                <span className="font-medium text-foreground">$7,500 – $10,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Labor</span>
                <span className="font-medium text-foreground">$5,000 – $7,500</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-foreground font-semibold">Est. Project Total</span>
                <span className="font-bold text-foreground">$14,000 – $19,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Budget Comfort</span>
                <span className="font-medium text-primary">Balanced</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Finish Direction</span>
                <span className="font-medium text-foreground">Brushed Nickel</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Final totals may vary based on selections, labor, and site conditions.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg" asChild>
                <Link to="/customize/balanced">Customize This Option</Link>
              </Button>
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base rounded-lg" asChild>
                <Link to="/options">Compare Other Packages</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Included categories */}
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">What's Included</p>
            <h2 className="font-heading text-2xl text-foreground">Included in this package</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{cat.name}</p>
                <p className="text-sm font-medium text-foreground">{cat.item}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why this fits */}
        <section className="max-w-2xl">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Fit Summary</p>
            <h2 className="font-heading text-2xl text-foreground">Why this package fits</h2>
          </div>
          <ul className="space-y-3">
            {whyFits.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      </motion.div>
    </main>
  </div>
);

export default PackageDetail;
