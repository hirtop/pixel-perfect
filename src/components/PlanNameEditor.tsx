import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const PLAN_NAME_MAX_LENGTH = 80;

const DEFAULT_LIKE = new Set(["", "untitled project", "untitled design", "null", "undefined"]);

export function isDefaultLikePlanName(name: string | undefined | null): boolean {
  if (!name) return true;
  return DEFAULT_LIKE.has(name.trim().toLowerCase());
}

export interface ValidationResult {
  ok: boolean;
  value?: string;
  reason?: "empty" | "too_long";
}

/**
 * Strip zero-width chars, normalize tabs/newlines/CRs/NBSPs to spaces,
 * collapse runs of whitespace, and trim. Used before validation so saved
 * names never contain invisible/control characters.
 */
export function normalizePlanName(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw
    // Strip zero-width chars + BOM
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    // Normalize NBSP and other unicode spaces to regular space
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    // Tabs / newlines / carriage returns -> space
    .replace(/[\t\n\r]+/g, " ")
    // Strip remaining control chars (C0 + DEL)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    // Collapse whitespace runs
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function validatePlanName(raw: string): ValidationResult {
  const cleaned = normalizePlanName(raw);
  if (cleaned.length === 0) return { ok: false, reason: "empty" };
  if (cleaned.length > PLAN_NAME_MAX_LENGTH) return { ok: false, reason: "too_long" };
  return { ok: true, value: cleaned };
}

interface PlanNameEditorProps {
  name: string;
  fallbackLabel?: string;
  className?: string;
  inputClassName?: string;
  onSave: (next: string) => Promise<boolean> | boolean;
  ariaLabel?: string;
}

/**
 * Inline editable plan name.
 * Behavior:
 *  - Click pencil to enter edit mode.
 *  - Enter saves trimmed name.
 *  - Escape cancels (preserves original name).
 *  - Blur cancels (does NOT save) to avoid surprise saves on accidental tab-out.
 *  - Empty/whitespace names are rejected (no save, stays in edit mode).
 *  - Max length enforced at 80 chars.
 *  - Default-like names render as the fallback label, but remain editable.
 */
export default function PlanNameEditor({
  name,
  fallbackLabel = "Your project",
  className,
  inputClassName,
  onSave,
  ariaLabel = "Edit project name",
}: PlanNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(isDefaultLikePlanName(name) ? "" : name);
      setError(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing, name]);

  const display = isDefaultLikePlanName(name) ? fallbackLabel : name.trim();

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const commit = async () => {
    const v = validatePlanName(draft);
    if (!v.ok) {
      setError(v.reason === "empty" ? "Name cannot be empty." : `Max ${PLAN_NAME_MAX_LENGTH} characters.`);
      return;
    }
    if (v.value === name?.trim()) {
      cancel();
      return;
    }
    setBusy(true);
    try {
      const ok = await onSave(v.value!);
      if (ok === false) {
        setError("Couldn't save. Try again.");
        return;
      }
      setEditing(false);
      setError(null);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (editing) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 align-middle", className)}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={PLAN_NAME_MAX_LENGTH}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={cancel}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          className={cn(
            "h-6 min-w-[8rem] rounded border border-input bg-background px-1.5 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-ring",
            inputClassName,
          )}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => void commit()}
          disabled={busy}
          aria-label="Save project name"
          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          disabled={busy}
          aria-label="Cancel rename"
          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {error && <span className="text-[11px] text-destructive">{error}</span>}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 align-middle", className)}>
      <span className="truncate">{display}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={ariaLabel}
        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </span>
  );
}
