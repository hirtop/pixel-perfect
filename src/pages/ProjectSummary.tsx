import { motion } from "framer-motion";
import ShoppingAssistantFab from "@/components/shopping-assistant/ShoppingAssistantFab";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";
import balancedImg from "@/assets/package-balanced.jpg";
import budgetImg from "@/assets/package-budget.jpg";
import premiumImg from "@/assets/package-premium.jpg";
import { useProject } from "@/contexts/ProjectContext";
import { useAuth } from "@/hooks/useAuth";
import ReferencePhotos from "@/components/ReferencePhotos";
import BathroomRiskScan from "@/components/BathroomRiskScan";
import { TIER_BASE_LABOR, SHIPPING_ESTIMATE } from "@/data/products";


const defaultPackageItems = [
  { name: "Vanity", item: "Floating oak vanity with quartz top" },
  { name: "Sink", item: "Undermount rectangular sink" },
  { name: "Faucet", item: "Single-handle brushed nickel faucet" },
  { name: "Mirror", item: "Frameless rectangular mirror with shelf ledge" },
  { name: "Shower Wall Tile", item: "Large-format porcelain in warm gray" },
  { name: "Shower Floor Tile", item: "Mosaic porcelain shower pan tile" },
  { name: "Main Floor Tile", item: "Porcelain floor tile" },
  { name: "Accent Tile", item: "Optional accent strip or feature tile" },
  { name: "Shower Glass", item: "Semi-frameless hinged shower door" },
  { name: "Shower Valve", item: "Thermostatic valve with volume control" },
  { name: "Shower Trim", item: "Rain + handheld combo showerhead" },
  { name: "Tub", item: "Freestanding acrylic tub" },
  { name: "Tub Valve", item: "Thermostatic tub/shower valve" },
  { name: "Shower Niche", item: "Tiled shower niche" },
  { name: "Lighting", item: "Dual wall sconces, frosted glass" },
  { name: "Toilet", item: "Elongated comfort-height toilet" },
];

const workflowPoints = [
  "11 typical remodel steps reviewed",
  "Tile, vanity, lighting, and hardware mapped to your plan",
  "Ready for next planning steps",
];

const ProjectSummary = () => {
  const { project, saveProject, markStepComplete, isSaving } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  const tierKey = project.selected_package.tier
    ? (project.selected_package.tier.charAt(0).toUpperCase() + 
       project.selected_package.tier.slice(1)) as keyof typeof TIER_BASE_LABOR
    : "Balanced";
  const baseLaborRate = TIER_BASE_LABOR[tierKey] ?? 5800;
  const baseShipping = SHIPPING_ESTIMATE;

  const tierImageMap: Record<string, string> = {
    budget: budgetImg,
    balanced: balancedImg,
    premium: premiumImg,
  };
  const summaryHeroImg = tierImageMap[
    project.selected_package.tier?.toLowerCase() || "balanced"
  ] || balancedImg;

  const targetBudgetRaw = project.style_preferences.budget;
  const targetBudgetNum = Number(targetBudgetRaw);
  const showTargetBudget =
    targetBudgetRaw !== undefined &&
    targetBudgetRaw !== null &&
    String(targetBudgetRaw).trim() !== "" &&
    Number.isFinite(targetBudgetNum) &&
    targetBudgetNum > 0;

  const rawPkgName = project.selected_package.name;
  const displayPkgName = rawPkgName && rawPkgName.toLowerCase() === "budget"
    ? "Essential"
    : (rawPkgName || "Not yet selected");

  // Resolve customize route, mapping internal "budget" → public "essential".
  const tierLower = project.selected_package.tier?.toLowerCase();
  const customizeTierSlug =
    tierLower === "budget"
      ? "essential"
      : tierLower === "balanced" || tierLower === "premium"
        ? tierLower
        : "balanced";
  const editSelectionsHref = `/customize/${customizeTierSlug}`;

  const summaryFields = [
    { label: "Project Name", value: project.name || "Untitled Project" },
    { label: "Selected Package", value: displayPkgName },
    { label: "Style Direction", value: project.style_preferences.style || "Not yet selected" },
    { label: "Finish Preference", value: project.style_preferences.finish || "Not yet selected" },
    { label: "Budget Comfort", value: project.style_preferences.budget_level || "Not yet selected" },
    ...(showTargetBudget
      ? [{ label: "Target Budget", value: `$${targetBudgetNum.toLocaleString()}` }]
      : []),
    { label: "Bathroom Type", value: project.bathroom_type || "Not yet selected" },
    { label: "Bathing Setup", value: project.bathing_setup || "Not yet selected" },
  ];

  const packageItems = project.customizations.categories && project.customizations.categories.length > 0
    ? defaultPackageItems.map((dp) => {
        const custom = project.customizations.categories!.find((c) => c.name === dp.name);
        if (custom) {
          return { ...dp, item: custom.selected };
        }
        return dp;
      })
    : defaultPackageItems;

  const materialsTotal = project.customizations.categories && project.customizations.categories.length > 0
    ? project.customizations.categories.reduce((sum, c) => sum + c.price, 0)
    : 8400;

  const budgetLines = [
    { label: "Materials", value: `$${materialsTotal.toLocaleString()}` },
    { label: "Estimated Labor", value: `$${baseLaborRate.toLocaleString()}` },
    { label: "Shipping / Fees", value: `$${baseShipping.toLocaleString()}` },
  ];

  const estimatedTotal = materialsTotal + baseLaborRate + baseShipping;

  const handleSave = async () => {
    markStepComplete("summary");
    await saveProject();
  };

  const handleContinue = async () => {
    markStepComplete("summary");
    await saveProject();
    navigate("/subcontractors");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <div className="flex items-center gap-4">
            <AccountMenu />
            <Link to="/workflow" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Workflow
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
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Your Project</p>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">Project Summary</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Here's your selected remodel direction, budget snapshot, and project overview so far.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden aspect-[21/9] mb-12">
            <img src={summaryHeroImg} alt="Selected bathroom remodel direction" className="w-full h-full object-cover" width={800} height={600} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-heading text-lg text-foreground mb-1">Project Details</h2>
              {summaryFields.map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className={`font-medium ${f.value.startsWith("Not yet") ? "text-muted-foreground italic" : "text-foreground"}`}>{f.value}</span>
                </div>
              ))}
            </div>

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
                <span className="font-bold text-foreground text-base">${estimatedTotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Final totals may vary based on selections, labor, and site conditions.
              </p>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                {user
                  ? "Your project is saved to your BOBOX account and available across devices."
                  : "Your progress is saved on this device. Sign in to access it anywhere."}
              </p>
            </div>
          </div>

          {project.assessment && (project.assessment.demolitionLevel || project.assessment.complexity) && (
            <section className="mb-12">
              <h2 className="font-heading text-xl text-foreground mb-5">Bathroom Assessment Scope</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.assessment.demolitionLevel && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Demolition</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.demolitionLevel}</p>
                  </div>
                )}
                {project.assessment.electricalScope && project.assessment.electricalScope !== "None" && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Electrical</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.electricalScope}</p>
                  </div>
                )}
                {project.assessment.framingScope && project.assessment.framingScope !== "None" && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Framing / Walls</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.framingScope}</p>
                  </div>
                )}
                {project.assessment.subfloorRisk && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Subfloor Risk</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.subfloorRisk}</p>
                  </div>
                )}
                {project.assessment.waterproofingScope && project.assessment.waterproofingScope !== "None" && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Waterproofing</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.waterproofingScope}</p>
                  </div>
                )}
                {project.assessment.complexity && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Overall Complexity</p>
                    <p className="font-heading text-base text-foreground">{project.assessment.complexity}</p>
                  </div>
                )}
                {project.assessment.plumbing && Object.values(project.assessment.plumbing).some(v => v === "yes") && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Plumbing Changes</p>
                    <p className="font-heading text-base text-foreground">Required</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {(() => {
            const photoMeta = project.photos?.metadata ?? [];
            const photoNotes = project.photos?.notes ?? "";
            const hasPhotos = photoMeta.length > 0;
            const hasNotes = photoNotes.trim().length > 0;
            if (!hasPhotos && !hasNotes) {
              return (
                <div className="mb-12">
                  <section
                    aria-label="Reference photos"
                    className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Site Reference
                    </p>
                    <h2 className="font-heading text-lg text-foreground mt-1">
                      No reference photos yet
                    </h2>
                    <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
                      Add bathroom photos to give your builders better context. They'll appear here, in your agreement PDF, and in subcontractor handoffs.
                    </p>
                    <Link
                      to="/upload"
                      className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      Upload photos →
                    </Link>
                  </section>
                </div>
              );
            }
            return (
              <div className="mb-12 space-y-6">
                <ReferencePhotos metadata={photoMeta} notes={photoNotes} allowDelete />
                <BathroomRiskScan projectId={project.id} photos={photoMeta} />
              </div>
            );
          })()}

          <section className="mb-12">
            <div className="flex items-center justify-between mb-5 gap-3">
              <h2 className="font-heading text-xl text-foreground">Your Selected Package Includes</h2>
              <Link
                to={editSelectionsHref}
                className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
              >
                Edit selections →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {packageItems.map((p) => (
                <div key={p.name} className="rounded-lg border border-border bg-secondary/20 px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">{p.name}</p>
                  <p className="text-sm text-foreground">{p.item}</p>
                </div>
              ))}
            </div>
          </section>

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

          <div className="rounded-xl border border-border bg-card/50 p-5 text-center mb-6">
            <p className="text-sm font-medium text-foreground mb-1">
              How are we doing?
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Help us improve BOBOX with 2 minutes of feedback.
            </p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc45Dog7h3bn0ybuLHBB2ccu9pdZfhBRrSX48H3dUfe34i3_w/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Share your feedback →
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg" onClick={handleContinue} disabled={isSaving}>
              Continue to Subcontractors
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base rounded-lg"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : user ? "Save to Account" : "Save Project"}
            </Button>
            {!user && (
              <Button size="lg" variant="ghost" className="w-full sm:w-auto px-6 h-12 text-sm" asChild>
                <Link to="/auth">Sign in for cross-device save</Link>
              </Button>
            )}
            <Link to="/workflow" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Workflow
            </Link>
          </div>
        </motion.div>
      </main>
      <ShoppingAssistantFab />
    </div>
  );
};

export default ProjectSummary;
