import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import AccountMenu from "@/components/AccountMenu";

const CONTACT_EMAIL = "hello@boboxremodel.com";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Disclaimer
          </h1>
          <p className="text-sm text-muted-foreground mb-12">
            Last updated: April 24, 2026
          </p>

          <article className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">Disclosure</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                BOBOX Remodel provides planning information and estimated package guidance. It is not a contractor, legal advisor, or final quoting service. Always review scope, pricing, site conditions, and product availability with qualified professionals before starting work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">Contact</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                For questions about this disclosure, contact us at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>
          </article>
        </motion.div>
      </main>
    </div>
  );
};

export default Disclaimer;
