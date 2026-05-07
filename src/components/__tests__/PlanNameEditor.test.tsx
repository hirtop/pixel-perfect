import { describe, it, expect } from "vitest";
import {
  validatePlanName,
  isDefaultLikePlanName,
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
