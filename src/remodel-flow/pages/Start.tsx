import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StepHeader } from "../ui";
import { useFlow } from "../FlowContext";
import { hasFlowProgress } from "../resumeRoute";

const LEGACY_DRAFT_KEY = "bobox_project_draft";
const BANNER_DISMISSED_KEY = "bobox_legacy_upgrade_banner_dismissed_v1";

/**
 * Show a one-time, non-blocking info banner when a signed-in (or anon) user
 * lands on /remodel-flow/start and:
 *   - they have non-empty legacy `bobox_project_draft` data, AND
 *   - their FlowContext state is empty/new (no progress yet)
 *
 * Saved Supabase rows are not touched. The banner is dismissible and
 * remembered via localStorage so it does not nag.
 */
function useLegacyDraftBanner(): { show: boolean; dismiss: () => void } {
  const { state } = useFlow();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(BANNER_DISMISSED_KEY) === "1") return;
      const raw = localStorage.getItem(LEGACY_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const hasMeaningfulLegacy =
        parsed && typeof parsed === "object" && Object.keys(parsed).length > 0;
      if (hasMeaningfulLegacy && !hasFlowProgress(state)) {
        setShow(true);
      }
    } catch {
      /* ignore */
    }
  }, [state]);

  return {
    show,
    dismiss: () => {
      try {
        localStorage.setItem(BANNER_DISMISSED_KEY, "1");
      } catch {
        /* ignore */
      }
      setShow(false);
    },
  };
}

const Start = () => {
  const banner = useLegacyDraftBanner();

  return (
    <div>
      {banner.show && (
        <div
          role="status"
          className="mb-6 flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground"
        >
          <p className="flex-1 leading-relaxed">
            We upgraded the project flow. Your previous project data is still
            saved. Continue through the new flow to refresh your project.
          </p>
          <button
            type="button"
            onClick={banner.dismiss}
            className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <StepHeader
        eyebrow="Next-gen flow · preview"
        title="Design your bathroom in five simple steps."
        description="A faster, resolver-driven planning experience. Pick a style, choose a tier, customize what matters, and preview a complete plan."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { n: "1", t: "Pick a style", d: "Modern, spa, classic, or minimal." },
          { n: "2", t: "Choose a tier", d: "Essential, balanced, or premium." },
          { n: "3", t: "Select a package", d: "Choose a curated design that fits your style and budget." },
          { n: "4", t: "Customize your plan", d: "Adjust finishes and fixtures to match your preferences." },
          { n: "5", t: "Preview your bathroom design", d: "See a visual concept of your complete bathroom." },
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
};

export default Start;
