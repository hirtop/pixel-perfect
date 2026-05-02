import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const StepHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) => (
  <div className="mb-10 max-w-2xl">
    {eyebrow && (
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{eyebrow}</p>
    )}
    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
    {description && <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>}
  </div>
);

export const FlowCard = ({
  children,
  selected,
  onClick,
  className,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group relative w-full text-left rounded-2xl border p-5 transition-all",
      "border-border bg-card hover:border-foreground/40 hover:shadow-sm",
      selected && "border-foreground ring-2 ring-foreground/10 shadow-sm",
      className,
    )}
  >
    {children}
  </button>
);

export const PrimaryNav = ({
  back,
  next,
  nextLabel = "Continue",
  disabled,
}: {
  back?: string;
  next?: string;
  nextLabel?: string;
  disabled?: boolean;
}) => (
  <div className="mt-12 flex items-center justify-between">
    {back ? (
      <Link
        to={back}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back
      </Link>
    ) : (
      <span />
    )}
    {next && (
      <Link
        to={disabled ? "#" : next}
        aria-disabled={disabled}
        onClick={(e) => disabled && e.preventDefault()}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-foreground text-background hover:bg-foreground/90",
        )}
      >
        {nextLabel} →
      </Link>
    )}
  </div>
);
