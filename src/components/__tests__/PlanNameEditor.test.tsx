import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PlanNameEditor, {
  validatePlanName,
  isDefaultLikePlanName,
  normalizePlanName,
  PLAN_NAME_MAX_LENGTH,
} from "@/components/PlanNameEditor";

describe("PlanNameEditor helpers", () => {
  describe("validatePlanName", () => {
    it("trims whitespace and accepts valid name", () => {
      expect(validatePlanName("  My Plan  ")).toEqual({ ok: true, value: "My Plan" });
    });

    it("rejects empty string", () => {
      expect(validatePlanName("")).toEqual({ ok: false, reason: "empty" });
    });

    it("rejects whitespace-only", () => {
      expect(validatePlanName("   ")).toEqual({ ok: false, reason: "empty" });
    });

    it("enforces max length of 80", () => {
      const long = "a".repeat(PLAN_NAME_MAX_LENGTH + 1);
      expect(validatePlanName(long)).toEqual({ ok: false, reason: "too_long" });
    });

    it("accepts name at exactly max length", () => {
      const exact = "a".repeat(PLAN_NAME_MAX_LENGTH);
      const r = validatePlanName(exact);
      expect(r.ok).toBe(true);
      expect(r.value).toBe(exact);
    });

    it("rejects zero-width-only input as empty", () => {
      expect(validatePlanName("\u200B\u200C\u200D\uFEFF")).toEqual({ ok: false, reason: "empty" });
    });

    it("normalizes embedded newlines/tabs to a single space", () => {
      const r = validatePlanName("Master\nBath");
      expect(r.ok).toBe(true);
      expect(r.value).toBe("Master Bath");
      expect(r.value).not.toMatch(/[\n\r\t]/);
    });

    it("strips zero-width chars and keeps the visible text", () => {
      const r = validatePlanName("Mast\u200Ber Bath");
      expect(r.ok).toBe(true);
      expect(r.value).toBe("Master Bath");
    });

    it("normalizes non-breaking spaces", () => {
      const r = validatePlanName("Master\u00A0Bath");
      expect(r.ok).toBe(true);
      expect(r.value).toBe("Master Bath");
    });
  });

  describe("normalizePlanName", () => {
    it("returns empty for null/undefined", () => {
      expect(normalizePlanName(null)).toBe("");
      expect(normalizePlanName(undefined)).toBe("");
    });
    it("collapses whitespace runs", () => {
      expect(normalizePlanName("a   b")).toBe("a b");
    });
  });

  describe("isDefaultLikePlanName", () => {
    it.each(["", "   ", "Untitled Project", "untitled design", "null", "UNDEFINED"])(
      "returns true for %p",
      (input) => {
        expect(isDefaultLikePlanName(input)).toBe(true);
      },
    );

    it("returns false for real names", () => {
      expect(isDefaultLikePlanName("Master Bath")).toBe(false);
    });

    it("returns true for null/undefined input", () => {
      expect(isDefaultLikePlanName(null)).toBe(true);
      expect(isDefaultLikePlanName(undefined)).toBe(true);
    });
  });
});

describe("PlanNameEditor UI", () => {
  const setup = (props: Partial<React.ComponentProps<typeof PlanNameEditor>> = {}) => {
    const onSave = props.onSave ?? vi.fn().mockResolvedValue(true);
    const utils = render(
      <PlanNameEditor
        name={props.name ?? "Master Bath"}
        fallbackLabel={props.fallbackLabel}
        onSave={onSave}
      />,
    );
    return { ...utils, onSave };
  };

  const enterEdit = () => {
    fireEvent.click(screen.getByRole("button", { name: /edit project name/i }));
    return screen.getByRole("textbox", { name: /edit project name/i }) as HTMLInputElement;
  };

  it("A. clicking pencil opens input pre-filled and focused", async () => {
    setup({ name: "Master Bath" });
    const input = enterEdit();
    expect(input.value).toBe("Master Bath");
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("B. typing + Enter saves with trimmed name and exits edit mode", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "  Guest Bath  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Guest Bath"));
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: /edit project name/i })).toBeNull(),
    );
  });

  it("C. Escape cancels without calling onSave and exits edit mode", async () => {
    const onSave = vi.fn();
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "Other Name" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onSave).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: /edit project name/i })).toBeNull(),
    );
    expect(screen.getByText("Master Bath")).toBeInTheDocument();
  });

  it("D. blur cancels without calling onSave and exits edit mode", async () => {
    const onSave = vi.fn();
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "Other Name" } });
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: /edit project name/i })).toBeNull(),
    );
  });

  it("E. empty + Enter does not save, sets aria-invalid, stays in edit mode", async () => {
    const onSave = vi.fn();
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input).toBeInTheDocument();
  });

  it("F. unchanged name + Enter does not save and exits edit mode", async () => {
    const onSave = vi.fn();
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: /edit project name/i })).toBeNull(),
    );
  });

  it("G. when onSave returns false, error is shown and editor stays open", async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "New Name" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    expect(onSave).toHaveBeenCalledWith("New Name");
    expect(screen.getByText(/couldn't save/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /edit project name/i })).toBeInTheDocument();
  });

  it("H. embedded newline is normalized before save", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    setup({ name: "Master Bath", onSave });
    const input = enterEdit();
    fireEvent.change(input, { target: { value: "Master\nBath 2" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Master Bath 2"));
  });
});
