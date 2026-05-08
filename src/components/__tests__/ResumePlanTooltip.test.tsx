import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResumePlanTooltip, { buildTooltipContent } from "@/components/ResumePlanTooltip";
import type { SavedProject } from "@/hooks/useUserProjects";

const base: SavedProject = {
  id: "p1",
  name: "Master bath remodel",
  status: "draft",
  bathroom_type: null,
  updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  workflow_progress: null,
  selected_package: { tier: "balanced" },
  style_preferences: { style: "modern" },
  source: "projects",
};

describe("ResumePlanTooltip / buildTooltipContent", () => {
  it("renders project name", () => {
    const c = buildTooltipContent(base);
    expect(c.nameDisplay).toBe("Master bath remodel");
    expect(c.nameTruncated).toBe(false);
  });

  it("default-like name renders 'Your project'", () => {
    const c = buildTooltipContent({ ...base, name: "" });
    expect(c.nameDisplay).toBe("Your project");
  });

  it("truncates long names around 32 chars and keeps full name", () => {
    const longName = "A".repeat(50);
    const c = buildTooltipContent({ ...base, name: longName });
    expect(c.nameTruncated).toBe(true);
    expect(c.nameDisplay.length).toBeLessThanOrEqual(32);
    expect(c.nameDisplay.endsWith("…")).toBe(true);
    expect(c.nameFull).toBe(longName);
  });

  it("uses formatRecency() when recent", () => {
    const c = buildTooltipContent(base);
    expect(c.recencyLine).toMatch(/Last edited/);
  });

  it("falls back to absolute date when recency suppressed (>=7 days old)", () => {
    const old = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const c = buildTooltipContent({ ...base, updated_at: old });
    expect(c.recencyLine).toMatch(/^Updated /);
  });

  it("omits recency line when no usable updated_at", () => {
    const c = buildTooltipContent({ ...base, updated_at: "" });
    expect(c.recencyLine).toBeNull();
  });

  it("includes metadata summary without duplicate Updated tail", () => {
    const c = buildTooltipContent(base);
    expect(c.metadataLine).toContain("Balanced");
    expect(c.metadataLine).toContain("Modern");
    expect(c.metadataLine).not.toMatch(/Updated/);
  });

  it("trigger has accessible label", () => {
    render(<ResumePlanTooltip project={base} />);
    expect(screen.getByRole("button", { name: /About this plan/i })).toBeInTheDocument();
  });

  it("trigger opens popover on Enter key", async () => {
    render(<ResumePlanTooltip project={base} />);
    const trigger = screen.getByRole("button", { name: /About this plan/i });
    fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: /Saved plan details/i })).toBeInTheDocument(),
    );
  });

  it("trigger opens popover on Space key", async () => {
    render(<ResumePlanTooltip project={base} />);
    const trigger = screen.getByRole("button", { name: /About this plan/i });
    fireEvent.keyDown(trigger, { key: " ", code: "Space" });
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: /Saved plan details/i })).toBeInTheDocument(),
    );
  });

  it("Escape closes the popover", async () => {
    render(<ResumePlanTooltip project={base} />);
    const trigger = screen.getByRole("button", { name: /About this plan/i });
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: /Saved plan details/i })).toBeInTheDocument(),
    );
    fireEvent.keyDown(document.body, { key: "Escape", code: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: /Saved plan details/i })).not.toBeInTheDocument(),
    );
  });
});
