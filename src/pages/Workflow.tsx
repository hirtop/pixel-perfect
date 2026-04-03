import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { title: "Planning and measurements", desc: "Confirm layout, finalize selections, and verify all dimensions before work begins.", product: null },
  { title: "Demo and debris removal", desc: "Remove existing fixtures, tile, and finishes to prepare a clean starting point.", product: null },
  { title: "Subfloor or framing repair", desc: "Inspect and repair any structural issues uncovered during demolition.", product: null },
  { title: "Plumbing modifications", desc: "Adjust water lines and drain positions to match your new layout and fixtures.", product: "Your selected faucet and shower hardware specs guide this step" },
  { title: "Electrical modifications", desc: "Update wiring for new lighting placement, outlets, or ventilation as needed.", product: "Your chosen lighting layout is planned here" },
  { title: "Waterproofing and wall prep", desc: "Seal wet areas and prepare surfaces for tile, paint, and new finishes.", product: null },
  { title: "Tile and flooring installation", desc: "Install floor and wall tile according to the design direction you selected.", product: "Your selected tile is installed during this step" },
  { title: "Painting", desc: "Apply paint to walls and ceiling areas not covered by tile or fixtures.", product: null },
  { title: "Vanity, sink, faucet, and toilet", desc: "Install your chosen vanity, countertop, sink, faucet, and toilet.", product: "Your selected vanity, faucet, and toilet come in here" },
  { title: "Shower glass and hardware", desc: "Mount shower doors or glass panels and install final shower hardware.", product: "Your selected shower hardware is installed now" },
  { title: "Final accessories and cleanup", desc: "Add mirrors, towel bars, lighting trim, and give everything a final clean.", product: "Your selected mirror and lighting finish the space" },
];

const Workflow = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
          BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
        </Link>
        <Link to="/customize/balanced" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Customization
        </Link>
      </div>
    </nav>

    <main className="pt-28 pb-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Your Project</p>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Typical Remodel Workflow
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Here's how a bathroom remodel like this usually comes together, from demolition to final finishing touches.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="relative flex gap-5 pb-8 last:pb-0"
              >
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-[39px] h-[39px] rounded-full flex items-center justify-center text-xs font-semibold ${
                    step.product
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}>
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-1.5 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                  {step.product && (
                    <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-primary" />
                      {step.product}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-12 flex flex-col sm:flex-row items-center gap-5">
          <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" asChild>
            <Link to="/summary">Continue to Project Summary</Link>
          </Button>
          <Link to="/customize/balanced" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Customization
          </Link>
        </div>
      </motion.div>
    </main>
  </div>
);

export default Workflow;
