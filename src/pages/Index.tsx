import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Camera, Layers, DollarSign, TrendingUp, ShoppingBag, ListChecks, Users, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/contexts/ProjectContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import ProjectPickerDialog from "@/components/ProjectPickerDialog";
import { resolveResumeRoute } from "@/lib/resumeRoute";
import heroImg from "@/assets/hero-bathroom.jpg";
import beforeImg from "@/assets/before-bathroom.jpg";
import afterImg from "@/assets/after-bathroom.jpg";
import ShopProducts from "@/components/ShopProducts";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const steps = [
  {
    icon: Camera,
    title: "Upload Your Bathroom",
    desc: "Add photos of your current bathroom and enter simple dimensions.",
  },
  {
    icon: Layers,
    title: "Compare Remodel Packages",
    desc: "Review budget, balanced, and premium remodel options tailored to your style.",
  },
  {
    icon: DollarSign,
    title: "Track Budget and Shop",
    desc: "See live pricing updates as you explore products and build your remodel plan.",
  },
];

const whyItems = [
  {
    icon: TrendingUp,
    title: "Live Budget Updates",
    desc: "Watch your remodel total update as you compare products.",
  },
  {
    icon: ShoppingBag,
    title: "Real Product Options",
    desc: "Explore curated products from trusted vendors.",
  },
  {
    icon: ListChecks,
    title: "Simple Remodel Workflow",
    desc: "Understand the typical project sequence step by step.",
  },
  {
    icon: Users,
    title: "Help When Needed",
    desc: "Connect with verified pros when you're ready.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "1 bathroom project",
      "3 remodel package options",
      "Live budget estimate",
      "AI photo risk scan",
      "AI shopping assistant",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49/mo",
    features: [
      "Unlimited projects",
      "PDF project summary export",
      "Subcontractor handoff tools",
      "Agreement templates",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Join Pro Waitlist",
    highlighted: true,
  },
];

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const { resetProject, loadProject } = useProject();
  const { projects, loading: projectsLoading, deleteProject } = useUserProjects();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);

  const projectCount = projects.length;
  const isProjectStateLoading = authLoading || (Boolean(user) && projectsLoading);
  const hasSavedProject = Boolean(user && !isProjectStateLoading && projectCount > 0);
  const hasMultiple = projectCount > 1;

  const singleProject = projectCount === 1 ? projects[0] : null;
  const singleRoute = singleProject
    ? resolveResumeRoute({
        step: singleProject.workflow_progress?.current_step,
        tier: singleProject.selected_package?.tier,
      })
    : "/start";

  const handlePrimaryCta = async () => {
    if (isProjectStateLoading) {
      return;
    }

    if (!hasSavedProject) {
      if (user) {
        resetProject();
      }
      navigate("/start");
    } else if (hasMultiple) {
      setPickerOpen(true);
    } else {
      if (singleProject) {
        await loadProject(singleProject.id);
      }
      navigate(singleRoute);
    }
  };

  const ctaText = isProjectStateLoading
    ? "Loading Your Projects..."
    : !hasSavedProject
      ? "Start Your Bathroom Project"
      : hasMultiple
        ? "View Your Projects"
        : "Continue Your Project";

  const navCtaText = isProjectStateLoading
    ? "Loading..."
    : !hasSavedProject
      ? "Start Your Bathroom Project"
      : hasMultiple
        ? "Your Projects"
        : "Continue Your Project";

  return (
    <div className="min-h-screen bg-background">
      <div style={{ width: '100%', backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', textAlign: 'center', padding: '10px 16px', position: 'relative', zIndex: 60 }}>
        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
          🏠 Kitchen Remodel Planning — coming soon.{" "}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScacp6SFiJA0ZJZtE5hcrgIfHV19KA6E-JuunztHox29tqz1w/viewform"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 700, textDecoration: 'underline' }}
          >
            Join the waitlist →
          </a>
        </p>
      </div>
      {/* Nav */}
      <nav className="fixed top-10 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <span className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#transform" className="hover:text-foreground transition-colors">Before & After</a>
            <a href="#why" className="hover:text-foreground transition-colors">Why BOBOX</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu />
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handlePrimaryCta} disabled={isProjectStateLoading}>
              {navCtaText}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Beautiful modern bathroom remodel"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </div>
        <div className="relative container mx-auto px-6 py-32 md:py-44">
          <motion.div
            className="max-w-xl"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl md:text-5xl lg:text-[3.25rem] leading-snug md:leading-[1.2] text-primary-foreground mb-6 max-w-lg"
            >
              Upload your bathroom photos.
              <br />
              Compare remodel options.
              <br />
              <span className="text-accent">Shop with confidence.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 font-body leading-relaxed max-w-lg"
            >
              BOBOX Remodel helps you turn a bathroom photo into visual remodel
              packages with live budgets, real product suggestions, and a simple
              project plan.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8" asChild>
                <Link to="/remodel-flow/start">Start Your Bathroom Design</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/90 border-foreground/30 text-foreground hover:bg-white hover:border-foreground/50 backdrop-blur-sm text-base px-8" onClick={handlePrimaryCta} disabled={isProjectStateLoading}>
                {ctaText}
              </Button>
              {hasSavedProject ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/90 border-foreground/30 text-foreground hover:bg-white hover:border-foreground/50 backdrop-blur-sm text-base px-8 gap-2"
                  onClick={() => { resetProject(); navigate("/start"); }}
                >
                  <Plus className="h-4 w-4" /> Start a New Project
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/90 border-foreground/30 text-foreground hover:bg-white hover:border-foreground/50 backdrop-blur-sm text-base px-8"
                  onClick={() => document.getElementById("transform")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  See a Sample Remodel
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground">
              Three steps to your remodel plan
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After */}
      <section id="transform" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Transformation
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              See the difference
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              See how BOBOX turns a dated bathroom into a visual remodel direction.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeUp} custom={0} className="relative rounded-2xl overflow-hidden">
              <img src={beforeImg} alt="Bathroom before remodel" width={800} height={600} loading="lazy" className="w-full h-80 object-cover" />
              <div className="absolute top-4 left-4 bg-foreground/70 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">Before</div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="relative rounded-2xl overflow-hidden">
              <img src={afterImg} alt="Bathroom after remodel" width={800} height={600} loading="lazy" className="w-full h-80 object-cover" />
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">After</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why BOBOX */}
      <section id="why" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Why BOBOX
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Built for real remodel decisions
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              BOBOX combines visual planning, product guidance, live budget tracking, and simple project workflow in one clean experience.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {whyItems.map((item, i) => (
              <motion.div
                key={item.title}
                className="p-8 rounded-2xl bg-card border border-border"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop teaser */}
      <section id="shop-teaser" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Shop Products
            </p>
            <h2 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Curated Products for Your Remodel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Handpicked fixtures and finishes from trusted brands.
            </p>
          </div>
        </div>
        <ShopProducts limit={3} hideFilters hideHeader className="py-0 bg-transparent" />
        <div className="text-center mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link to="/shop">Browse All Products →</Link>
          </Button>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Pricing
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Free to plan, pro to optimize
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start free, then unlock deeper planning tools as your project gets more detailed.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <h3 className="font-heading text-2xl mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.highlighted ? "bg-primary-foreground" : "bg-primary"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  onClick={() => plan.highlighted ? window.open("https://docs.google.com/forms/d/e/1FAIpQLSfK1F5seSe_XQkkM7S53eLP6-D8bYV2KGaLR8u3IguVGUHv9Q/viewform", "_blank", "noopener,noreferrer") : handlePrimaryCta()}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Coming Soon
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">
                Kitchen Remodel Planning — join the waitlist to get early access
              </span>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScacp6SFiJA0ZJZtE5hcrgIfHV19KA6E-JuunztHox29tqz1w/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Join waitlist →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground/70 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="font-heading text-2xl text-primary-foreground">
              BOBOX<span className="text-primary"> Remodel</span>
            </span>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                Contact
              </Link>
              <Link to="/disclaimer" className="hover:text-primary-foreground transition-colors">
                Affiliate Disclosure
              </Link>
            </nav>
            <p className="text-sm">
              © {new Date().getFullYear()} BOBOX Remodel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>


      <ProjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        projects={projects}
        onDelete={deleteProject}
      />
    </div>
  );
}
