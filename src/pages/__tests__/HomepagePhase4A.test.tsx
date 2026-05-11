import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const SRC = readFileSync("src/pages/Index.tsx", "utf8");

const FORBIDDEN = [
  "Shop with confidence",
  "SHOP PRODUCTS",
  "Shop Now",
  "Ferguson Home",
  "affiliate partnerships",
  "live budgets",
  "Live Budget",
  "live pricing",
  "real product suggestions",
  "AI shopping assistant",
  "AI photo risk scan",
  "Subcontractor handoff",
  "Agreement templates",
  "verified pros",
  "$49/mo",
  "Pro $49",
  "Track Budget and Shop",
  "explore products",
  "compare products",
  "marketplace",
  "checkout",
  "contractor-approved",
  "contractor-ready",
  "construction-ready",
  "quote-ready",
  "bid-ready",
  "ready to build",
  "guaranteed",
  "Curated Products for Your Remodel",
  "Handpicked fixtures",
  "ShopProducts",
  "Affiliate Disclosure",
  "Design Your Bathroom",
  "Help When Needed",
];

describe("Homepage Phase 4A — copy gate", () => {
  it("contains the new hero headline", () => {
    expect(SRC).toContain("Plan your bathroom remodel");
  });
  it("contains the new hero subhead", () => {
    expect(SRC).toContain(
      "Choose a remodel package, review the products inside it, and prepare a planning summary to discuss final scope, labor, and site details with a project professional.",
    );
  });
  it("uses the new primary CTA label", () => {
    expect(SRC).toContain("Start a Bathroom Project");
  });
  it("contains the three new How It Works steps", () => {
    expect(SRC).toContain("Pick a style and tier.");
    expect(SRC).toContain("Review the package products.");
    expect(SRC).toContain("Prepare a planning summary.");
  });
  it("contains the four new Why BOBOX cards", () => {
    expect(SRC).toContain("Package-led planning.");
    expect(SRC).toContain("Real package products.");
    expect(SRC).toContain("Simple remodel workflow.");
    expect(SRC).toContain("Built for the next conversation.");
  });
  it("contains the Early Access placeholder", () => {
    expect(SRC).toContain("Early Access");
    expect(SRC).toContain("Free to plan during V1.");
    expect(SRC).toContain("Join the waitlist");
  });
  it("does not contain any forbidden Phase 4A copy", () => {
    for (const phrase of FORBIDDEN) {
      expect(SRC, `forbidden phrase present: ${phrase}`).not.toContain(phrase);
    }
  });
  it("does not link to /shop from the homepage", () => {
    expect(SRC).not.toMatch(/to=["']\/shop["']/);
    expect(SRC).not.toMatch(/>Shop</);
  });
});
