import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";
import ShopProducts from "@/components/ShopProducts";

export default function Shop() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX{" "}
            <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">
              Remodel
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-foreground">
              Shop
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu />
            <Button size="sm" asChild>
              <Link to="/start">Start Your Project</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Page intro */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-16 text-center max-w-2xl">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
            Shop Products
          </p>
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Curated Products for Your Remodel
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Handpicked fixtures and finishes from trusted brands. Browse by
            category and shop directly from our retail partners.
          </p>
        </div>
      </header>

      <ShopProducts hideHeader />

      <footer className="bg-foreground text-primary-foreground/70 py-12">
        <div className="container mx-auto px-6 text-center text-sm">
          © {new Date().getFullYear()} BOBOX Remodel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
