/**
 * /subcontractors — V1 Retirement Gate placeholder.
 *
 * Subcontractor bidding belongs to a future BOBOX product (BOBOX Bid),
 * not BOBOX Remodel V1. Route is preserved to avoid 404s.
 */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/AccountMenu";

const Subcontractors = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="font-heading text-xl tracking-tight text-foreground">
            BOBOX <span className="font-body text-sm font-medium text-muted-foreground tracking-normal ml-1">Remodel</span>
          </Link>
          <AccountMenu />
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl w-full text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4">
            BOBOX Bid is not part of Remodel V1
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Subcontractor bidding and trade coordination are planned as a separate BOBOX product. BOBOX Remodel currently focuses on bathroom package planning and project summaries.
          </p>
          <Button asChild size="lg">
            <Link to="/summary">Back to your remodel summary</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Subcontractors;
