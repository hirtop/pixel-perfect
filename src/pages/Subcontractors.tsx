import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, ShieldCheck, BadgeCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pro {
  name: string;
  trade: string;
  location: string;
  rating: number;
  reviews: number;
  badges: string[];
  desc: string;
  sponsored?: boolean;
}

const verifiedPros: Pro[] = [
  { name: "Clearwater Plumbing Co.", trade: "Plumber", location: "Austin, TX", rating: 4.9, reviews: 127, badges: ["Licensed", "Insured", "Verified"], desc: "Full-service residential plumbing with bathroom remodel expertise." },
  { name: "Bright Line Electric", trade: "Electrician", location: "Austin, TX", rating: 4.8, reviews: 94, badges: ["Licensed", "Insured", "Verified"], desc: "Specializing in bathroom lighting upgrades and code-compliant wiring." },
  { name: "Stone & Surface Tile", trade: "Tile Installer", location: "Round Rock, TX", rating: 4.9, reviews: 68, badges: ["Insured", "Verified"], desc: "Precision tile work for floors, walls, and shower surrounds." },
  { name: "Apex Shower Glass", trade: "Shower Glass Installer", location: "Cedar Park, TX", rating: 4.7, reviews: 53, badges: ["Licensed", "Insured"], desc: "Custom frameless shower enclosures and hardware installation." },
  { name: "Fresh Coat Painters", trade: "Painter", location: "Austin, TX", rating: 4.8, reviews: 112, badges: ["Insured", "Verified"], desc: "Clean, efficient interior painting with low-VOC finishes." },
];

const sponsoredPros: Pro[] = [
  { name: "ProBath Solutions", trade: "General Contractor", location: "Austin, TX", rating: 4.6, reviews: 41, badges: ["Licensed", "Insured"], desc: "Full bathroom renovations from design to completion.", sponsored: true },
  { name: "LuxeFinish Interiors", trade: "Design & Build", location: "Austin, TX", rating: 4.5, reviews: 29, badges: ["Insured"], desc: "Turnkey bathroom remodel services with in-house design.", sponsored: true },
];

const BadgePill = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
    <ShieldCheck className="h-2.5 w-2.5" />
    {label}
  </span>
);

const ProCard = ({ pro }: { pro: Pro }) => (
  <div className={`rounded-xl border bg-card p-5 space-y-3 transition-colors ${
    pro.sponsored ? "border-accent/30" : "border-border"
  }`}>
    {pro.sponsored && (
      <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-accent">Sponsored</span>
    )}
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{pro.name}</p>
        <p className="text-xs text-muted-foreground">{pro.trade} · {pro.location}</p>
      </div>
      <div className="flex items-center gap-1 text-xs flex-shrink-0">
        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
        <span className="font-semibold text-foreground">{pro.rating}</span>
        <span className="text-muted-foreground">({pro.reviews})</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {pro.badges.map((b) => <BadgePill key={b} label={b} />)}
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{pro.desc}</p>
    <div className="flex gap-2 pt-1">
      <Button size="sm" className="text-xs h-8 px-4 rounded-lg">Request Quote</Button>
      <Button size="sm" variant="outline" className="text-xs h-8 px-3 rounded-lg gap-1.5">
        <FileText className="h-3 w-3" /> Send Summary
      </Button>
    </div>
  </div>
);

const Subcontractors = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
          BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
        </Link>
        <Link to="/summary" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Summary
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
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Connect</p>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Find Subcontractors</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Connect your remodel plan with the right professionals for each step of the project.
          </p>
        </div>

        {/* Trust block */}
        <div className="rounded-xl border border-border bg-secondary/20 p-5 mb-8 flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span><strong className="text-foreground">Verified Pros</strong> are shown with ratings, service area, and license or insurance status where applicable.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="inline-block w-4 h-4 rounded-sm bg-accent/20 flex-shrink-0 mt-0.5 text-center leading-4 text-accent font-bold text-[9px]">S</span>
            <span><strong className="text-foreground">Sponsored Pros</strong> are clearly labeled promotional placements from partner professionals.</span>
          </div>
        </div>

        {/* Trade context */}
        <p className="text-sm text-muted-foreground mb-8">
          Based on your workflow, you may need help with <span className="text-foreground font-medium">plumbing, electrical, tile, shower hardware, and finishing</span>.
        </p>

        {/* Verified Pros */}
        <section className="mb-12">
          <h2 className="font-heading text-xl text-foreground mb-5">Verified Pros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifiedPros.map((pro) => <ProCard key={pro.name} pro={pro} />)}
          </div>
        </section>

        {/* Sponsored Pros */}
        <section className="mb-12">
          <h2 className="font-heading text-xl text-foreground mb-5">Sponsored Pros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsoredPros.map((pro) => <ProCard key={pro.name} pro={pro} />)}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg">
            Continue to Agreement Template
          </Button>
          <Link to="/summary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Project Summary
          </Link>
        </div>
      </motion.div>
    </main>
  </div>
);

export default Subcontractors;
