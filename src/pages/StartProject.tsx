import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProject } from "@/contexts/ProjectContext";

const bathroomTypes = ["Primary Bathroom", "Guest Bathroom", "Powder Room", "Other"];
const propertyTypes = ["House", "Condo", "Apartment", "Other"];
const styleOptions = ["Modern", "Spa", "Traditional", "Minimal", "Luxury", "Transitional"];

const StartProject = () => {
  const { project, updateProject, saveProject, markStepComplete, isSaving } = useProject();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState(project.name === "Untitled Project" ? "" : project.name);
  const [bathroomType, setBathroomType] = useState(project.bathroom_type);
  const [propertyType, setPropertyType] = useState(project.property_type);
  const [budget, setBudget] = useState(project.style_preferences.budget || "");
  const [style, setStyle] = useState(project.style_preferences.style || "");

  useEffect(() => {
    setProjectName(project.name === "Untitled Project" ? "" : project.name);
    setBathroomType(project.bathroom_type);
    setPropertyType(project.property_type);
    setBudget(project.style_preferences.budget || "");
    setStyle(project.style_preferences.style || "");
  }, [
    project.name,
    project.bathroom_type,
    project.property_type,
    project.style_preferences.budget,
    project.style_preferences.style,
  ]);

  const syncToContext = () => {
    updateProject({
      name: projectName || "Untitled Project",
      bathroom_type: bathroomType,
      property_type: propertyType,
      style_preferences: { ...project.style_preferences, budget, style },
    });
  };

  const handleContinue = () => {
    syncToContext();
    markStepComplete("start");
    navigate("/upload");
  };

  const handleSaveLater = async () => {
    syncToContext();
    await saveProject();
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
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
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
              Start Your Bathroom Project
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Tell us a few basics so we can generate remodel options tailored to your space.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium text-foreground">
                Project Name
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. Main Bathroom Remodel"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Bathroom Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bathroomTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setBathroomType(type)}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      bathroomType === type
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Property Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      propertyType === type
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium text-foreground">
                Target Budget <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="15,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-12 text-base pl-8"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Style Preference</Label>
              <div className="flex flex-wrap gap-3">
                {styleOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      style === s
                        ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                        : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-5">
              <Button
                size="lg"
                className="w-full sm:w-auto px-10 h-12 text-base font-semibold rounded-lg"
                onClick={handleContinue}
              >
                Continue
              </Button>
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleSaveLater}
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save and finish later"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StartProject;
