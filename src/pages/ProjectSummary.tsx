import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import balancedImg from "@/assets/package-balanced.jpg";

const summaryFields = [
  { label: "Project Name", value: "Main Bathroom Remodel" },
  { label: "Selected Package", value: "Balanced" },
  { label: "Style Direction", value: "Spa / Modern-inspired" },
  { label: "Finish Preference", value: "Brushed Nickel" },
  { label: "Budget Comfort", value: "Balanced" },
  { label: "Bathroom Type", value: "Primary Bathroom" },
];

const budgetLines = [
  { label: "Materials", value: "$8,400" },
  { label: "Estimated Labor", value: "$5,800" },
  { label: "Shipping / Fees", value: "$650" },
];

const packageItems = [
  { name: "Vanity", item: "Floating oak vanity with quartz top" },
  { name: "Tile", item: "Large-format porcelain in warm gray" },
  { name: "Faucet", item: "Single-handle brushed nickel faucet" },
  { name: "Lighting", item: "Dual wall sconces, frosted glass" },
  { name: "Mirror", item: "Frameless rectangular mirror with shelf ledge" },
  { name: "Toilet", item: "Elongated comfort-height toilet" },
  { name: "Shower / Tub", item: "Rain showerhead with handheld combo" },
];

const workflowPoints = [
  "11 typical remodel steps reviewed",
  "Tile, vanity, lighting, and hardware mapped to your plan",
  "Ready for next planning steps",
];

const ProjectSummary = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
          BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
        </Link>
        <Link to="/workflow" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Workflow
        </Link>
      </div>
    </nav>

    <main className="pt-28 pb-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Your Project</p>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Project Summary</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Here's your selected remodel direction, budget snapshot, and project overview so far.
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden aspect-[21/9] mb-12">
          <img src={balancedImg} alt="Selected bathroom remodel direction" className="w-full h-full object-cover" width={800} height={600} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Project details */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="font-heading text-lg text-foreground mb-1">Project Details</h2>
            {summaryFields.map((f) => (
              <div key={f.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium text-foreground">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Budget snapshot */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="font-heading text-lg text-foreground mb-1">Budget Snapshot</h2>
            {budgetLines.map((b) => (
              <div key={b.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-medium text-foreground">{b.value}</span>
              </div>
            ))}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-foreground">Estimated Total</span>
              <span className="font-bold text-foreground text-base">$14,850</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Final totals may vary based on selections, labor, and site conditions.
            </p>
          </div>
        </div>

        {/* Package includes */}
        <section className="mb-12">
          <h2 className="font-heading text-xl text-foreground mb-5">Your Selected Package Includes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packageItems.map((p) => (
              <div key={p.name} className="rounded-lg border border-border bg-secondary/20 px-4 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">{p.name}</p>
                <p className="text-sm text-foreground">{p.item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow overview */}
        <section className="mb-12">
          <h2 className="font-heading text-xl text-foreground mb-4">Workflow Overview</h2>
          <ul className="space-y-2.5">
            {workflowPoints.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" asChild>
            <Link to="/subcontractors">Continue to Subcontractors</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-lg">
            Save Project
          </Button>
          <Link to="/workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Workflow
          </Link>
        </div>
      </motion.div>
    </main>
  </div>
);

export default ProjectSummary;
