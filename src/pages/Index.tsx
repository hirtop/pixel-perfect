import { motion, type Variants } from "framer-motion";
import { Camera, Layers, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-bathroom.jpg";
import beforeImg from "@/assets/before-bathroom.jpg";
import afterImg from "@/assets/after-bathroom.jpg";

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
    title: "Scan Your Room",
    desc: "Upload photos of your bathroom. We handle the rest.",
  },
  {
    icon: Layers,
    title: "Compare Options",
    desc: "Get three curated remodel packages — budget, balanced, and premium.",
  },
  {
    icon: DollarSign,
    title: "Shop With Confidence",
    desc: "Live budget updates as you swap products. No surprises.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["1 bathroom project", "3 remodel options", "Basic product list", "Budget estimate"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: [
      "Unlimited projects",
      "Premium product matching",
      "Exportable summaries",
      "Subcontractor access",
      "Priority support",
    ],
    cta: "Go Pro",
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <span className="font-heading text-2xl tracking-tight text-foreground">
            BOBOX<span className="text-primary"> Remodel</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#transform" className="hover:text-foreground transition-colors">Before & After</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start Your Room
          </Button>
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
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
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
              className="font-heading text-4xl md:text-6xl leading-tight text-primary-foreground mb-6"
            >
              Turn your bathroom into a{" "}
              <span className="text-accent">shoppable remodel plan</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 font-body leading-relaxed"
            >
              Scan your room. Compare three curated packages. Swap products
              with live budget updates — no guesswork, no surprises.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                Start Your Room
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8"
              >
                See How It Works
              </Button>
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
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground">
              See the difference
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeUp} custom={0} className="relative rounded-2xl overflow-hidden group">
              <img
                src={beforeImg}
                alt="Bathroom before remodel"
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-4 left-4 bg-foreground/70 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                Before
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="relative rounded-2xl overflow-hidden group">
              <img
                src={afterImg}
                alt="Bathroom after remodel"
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-80 object-cover"
              />
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                After
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-background">
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
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-5xl text-foreground">
              Free to plan, pro to optimize
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border"
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
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
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
            <p className="text-sm">
              © {new Date().getFullYear()} BOBOX Remodel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
