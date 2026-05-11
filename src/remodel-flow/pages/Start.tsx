import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StepHeader } from "../ui";
import {
  shouldShowLegacyDraftBanner,
  LEGACY_DRAFT_KEY,
  BANNER_DISMISSED_KEY,
} from "../legacyDraftBanner";

/**
 * Show a one-time, non-blocking info banner on /remodel-flow/start when
 * meaningful legacy `bobox_project_draft` data exists and no meaningful
 * active remodel-flow progress has been made.
 *
 * Reads localStorage DIRECTLY rather than going through FlowContext so a
 * fresh-default FlowContext mount cannot defeat the predicate.
 */
function useLegacyDraftBanner(): { show: boolean; dismiss: () => void } {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(shouldShowLegacyDraftBanner());
    // Re-evaluate if storage changes in another tab.
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === LEGACY_DRAFT_KEY ||
        e.key === BANNER_DISMISSED_KEY ||
        e.key === "bobox_remodel_flow_v1"
      ) {
        setShow(shouldShowLegacyDraftBanner());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
          data-testid="legacy-upgrade-banner"
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
        eyebrow="Bathroom project intake"
        title="Start your bathroom remodel plan."
        description="Answer a few questions so BOBOX can help you compare package options and prepare a planning summary."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { n: "1", t: "Start with your project", d: "Tell us the basics about your bathroom and project goals." },
          { n: "2", t: "Choose your style", d: "Start with the Modern package direction for V1." },
          { n: "3", t: "Pick a package tier", d: "Compare Essential, Balanced, and Premium package levels." },
          { n: "4", t: "Review package products", d: "See the vanity, faucet, and floor tile selected for your package." },
          { n: "5", t: "Prepare your summary", d: "Use your project summary to discuss final scope, labor, and site details with a project professional." },
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
          Start project intake →
        </Link>
      </div>
    </div>
  );
};

export default Start;
