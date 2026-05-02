import { Link } from "react-router-dom";
import { StepHeader } from "../ui";

const Start = () => (
  <div>
    <StepHeader
      eyebrow="Next-gen flow · preview"
      title="Design your bathroom in six clean steps."
      description="A faster, resolver-driven planning experience. Pick a style, choose a tier, customize what matters, and preview a complete plan."
    />

    <div className="grid gap-4 md:grid-cols-3">
      {[
        { n: "01", t: "Pick a style", d: "Modern, classic, spa, or minimal." },
        { n: "02", t: "Choose a tier", d: "Essential, balanced, or premium." },
        { n: "03", t: "Customize", d: "Swap any category. The plan recalculates instantly." },
      ].map((s) => (
        <div key={s.n} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground tracking-widest">{s.n}</p>
          <p className="mt-2 font-medium text-foreground">{s.t}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
        </div>
      ))}
    </div>

    <div className="mt-12">
      <Link
        to="/remodel-flow/style"
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Start designing →
      </Link>
    </div>
  </div>
);

export default Start;
