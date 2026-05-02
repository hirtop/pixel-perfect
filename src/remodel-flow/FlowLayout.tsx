import { Link, Outlet, useLocation } from "react-router-dom";
import { FlowProvider } from "./FlowContext";

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
      <header className="border-b border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            title="Back to main site"
            aria-label="Back to main site"
            className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            BOBOX <span className="text-muted-foreground font-normal">/ next</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            {STEPS.map((s, i) => (
              <div key={s.path} className="flex items-center gap-1">
                <span
                  className={
                    i === activeIdx
                      ? "rounded-full bg-foreground text-background px-2.5 py-1 font-medium"
                      : i < activeIdx
                        ? "rounded-full px-2.5 py-1 text-foreground"
                        : "rounded-full px-2.5 py-1"
                  }
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="opacity-30">·</span>}
              </div>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 mt-16">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>Next-gen remodel preview · isolated flow</span>
          <Link to="/" className="underline-offset-4 hover:underline">Back to main site</Link>
        </div>
      </footer>
    </div>
  );
};

const FlowLayout = () => (
  <FlowProvider>
    <FlowShell />
  </FlowProvider>
);

export default FlowLayout;
