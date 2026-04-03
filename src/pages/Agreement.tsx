import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="font-heading text-xl text-foreground border-b border-border pb-2">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, defaultValue = "", type = "text" }: { label: string; defaultValue?: string; type?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Input defaultValue={defaultValue} type={type} className="h-10 text-sm border-border/60 bg-background" />
  </div>
);

const Agreement = () => {
  const [scopeItems, setScopeItems] = useState([
    "Demolition and debris removal",
    "Plumbing modifications as needed",
    "Electrical modifications as needed",
    "Tile and flooring installation (large-format porcelain, warm gray)",
    "Vanity, sink, faucet, and toilet installation (floating oak vanity, brushed nickel fixtures)",
    "Shower hardware and glass installation",
    "Painting of walls and ceiling",
    "Final accessories, mirror, lighting, and cleanup",
  ]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to="/subcontractors" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Subcontractors
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Document</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Starter Remodel Agreement</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Use this as a simple starting agreement for your remodel project and review it before work begins.
            </p>
          </div>

          {/* Notice */}
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 mb-10 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is a general starter template for planning purposes only and may need review for local legal or licensing requirements.
            </p>
          </div>

          {/* Document */}
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 space-y-10 shadow-sm">

            <Section title="Client Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Client Name" />
                <Field label="Project Address" />
                <Field label="Room Type" defaultValue="Primary Bathroom" />
                <Field label="Project Name" defaultValue="Main Bathroom Remodel" />
              </div>
            </Section>

            <Section title="Contractor / Subcontractor Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Business Name" />
                <Field label="Trade Type" />
                <Field label="Phone" type="tel" />
                <Field label="Email" type="email" />
                <Field label="License Number (if applicable)" />
              </div>
            </Section>

            <Section title="Scope of Work">
              <p className="text-xs text-muted-foreground">Edit or remove items as needed for your project.</p>
              <div className="space-y-2">
                {scopeItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-primary font-bold w-5 text-right flex-shrink-0">{i + 1}.</span>
                    <Input
                      defaultValue={item}
                      className="h-9 text-sm border-border/60 bg-background"
                    />
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Materials">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Owner-Supplied Materials</Label>
                  <Textarea
                    defaultValue="All fixture and finish materials as specified in the BOBOX Balanced package (vanity, tile, faucet, lighting, mirror, toilet, shower hardware). Finish direction: Brushed Nickel."
                    className="min-h-[80px] text-sm resize-none border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Contractor-Supplied Materials</Label>
                  <Textarea
                    defaultValue="General construction materials including adhesives, grout, waterproofing membrane, backer board, fasteners, and other consumables required for installation."
                    className="min-h-[80px] text-sm resize-none border-border/60 bg-background"
                  />
                </div>
              </div>
            </Section>

            <Section title="Payment Terms">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Deposit" defaultValue="30% upon signing" />
                <Field label="Progress Payment" defaultValue="40% at midpoint" />
                <Field label="Final Payment" defaultValue="30% upon completion" />
              </div>
            </Section>

            <Section title="Timeline">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Estimated Start Date" type="date" />
                <Field label="Estimated Completion Date" type="date" />
              </div>
            </Section>

            <Section title="Change Orders">
              <Textarea
                defaultValue="Any additional work, material changes, or modifications to the agreed scope must be documented in writing and approved by both parties before work proceeds. Change orders may affect the project timeline and total cost."
                className="min-h-[80px] text-sm resize-none border-border/60 bg-background"
              />
            </Section>

            <Section title="Cleanup and Warranty">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Cleanup</Label>
                  <Textarea
                    defaultValue="Contractor will remove all debris and leave the work area in broom-clean condition upon project completion."
                    className="min-h-[60px] text-sm resize-none border-border/60 bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Warranty</Label>
                  <Textarea
                    defaultValue="Contractor warrants labor and workmanship for a period of one (1) year from the date of project completion. Manufacturer warranties on materials apply separately."
                    className="min-h-[60px] text-sm resize-none border-border/60 bg-background"
                  />
                </div>
              </div>
            </Section>

            <Section title="Signatures">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div className="border-b border-foreground/20 pb-1">
                    <Label className="text-xs text-muted-foreground">Client Signature</Label>
                  </div>
                  <Field label="Printed Name" />
                  <Field label="Date" type="date" />
                </div>
                <div className="space-y-6">
                  <div className="border-b border-foreground/20 pb-1">
                    <Label className="text-xs text-muted-foreground">Contractor Signature</Label>
                  </div>
                  <Field label="Printed Name" />
                  <Field label="Date" type="date" />
                </div>
              </div>
            </Section>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
            <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg"
              onClick={() => toast.success("Agreement saved", { description: "Your starter agreement has been saved to your project." })}
            >
              Save Agreement Template
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-lg gap-2"
              onClick={() => toast("Preparing PDF…", { description: "Your agreement will be ready to download shortly." })}
            >
              <Download className="h-4 w-4" /> Download as PDF
            </Button>
            <Link to="/subcontractors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Subcontractors
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Agreement;
