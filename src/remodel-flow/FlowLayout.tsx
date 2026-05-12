import { Link, Outlet, useLocation } from "react-router-dom";

const STEPS = [
  { path: "/remodel-flow/start", label: "Start" },
  { path: "/remodel-flow/style", label: "Style" },
  { path: "/remodel-flow/tier", label: "Tier" },
  { path: "/remodel-flow/packages", label: "Package" },
  { path: "/remodel-flow/customize", label: "Customize" },
  { path: "/remodel-flow/preview", label: "Preview" },
];

const FlowShell = () => {
  const { pathname } = useLocation();
  const activeIdx = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <Link
            to="/"
            title="Back to main site"
            aria-label="Back to main site"
            className="text-sm font-semibold tracking-[0.18em] hover:opacity-80 transition-opacity"
          >
            BOBOX
          </Link>
          <nav
            aria-label="Remodel planner steps"
            className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {STEPS.map((s, i) => {
              const isActive = i === activeIdx;
              const isDone = i < activeIdx;
              return (
                <div key={s.path} className="flex items-center gap-2">
                  <span
                    className={
                      isActive
                        ? "inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 font-medium"
                        : isDone
                          ? "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-foreground/80"
                          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                    }
                  >
                    <span className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s.label}</span>
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="h-px w-4 bg-border" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 mt-20">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>BOBOX · Bathroom remodel planner</span>
          <Link to="/" className="underline-offset-4 hover:underline hover:text-foreground transition-colors">
            Back to main site
          </Link>
        </div>
      </footer>
    </div>
  );
};

const FlowLayout = () => <FlowShell />;

export default FlowLayout;
