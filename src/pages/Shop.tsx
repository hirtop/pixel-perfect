/**
 * /shop — V1 Retirement Gate placeholder.
 *
 * The legacy product grid / build flow has been retired from V1. The route
 * still exists so existing inbound links don't 404, but it now renders only
 * a quiet placeholder pointing buyers back to the package flow.
 *
 * Do not re-introduce: product grid, category sections, "Build Your Bathroom"
 * heading, materials total, "Continue to Summary", or any product cards.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";

export default function Shop() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link
            to="/"
            className="font-heading text-xl tracking-tight text-foreground"
          >
            BOBOX{" "}
            <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">
              Remodel
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
          <AccountMenu />
        </div>
      </nav>

      <main
        data-testid="shop-retirement-placeholder"
        className="flex-1 flex items-center justify-center px-6 py-20"
      >
        <div className="max-w-xl w-full text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            Product catalog under curation
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Product details for each package are being verified. To see what
            your package includes, go to your package summary.
          </p>
          <Button asChild size="lg">
            <Link to="/options">View packages</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
