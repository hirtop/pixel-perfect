import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Shop from "../Shop";

vi.mock("@/components/AccountMenu", () => ({
  default: () => <div data-testid="account-menu" />,
}));

vi.mock("@/contexts/ProjectContext", () => ({
  useProject: () => ({
    project: {
      id: "p",
      name: "T",
      bathroom_type: "Full bath",
      bathing_setup: "Tub + shower",
      photos: { metadata: [], notes: "" },
      dimensions: {},
      style_preferences: {},
      selected_package: null,
      customizations: { categories: [] },
      workflow_progress: { current_step: "start", completed_steps: [] },
      assessment: {},
      updated_at: new Date().toISOString(),
    },
    updateProject: vi.fn(),
    saveProject: vi.fn(() => Promise.resolve(true)),
    isSaving: false,
    isProjectStateLoading: false,
    markStepComplete: vi.fn(),
  }),
  ProjectProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ShopProducts", () => ({
  default: () => <div data-testid="shop-products" />,
}));

vi.mock("@/components/HomepageClarityCue", () => ({
  default: () => <div data-testid="hcc" />,
}));

const FORBIDDEN_PLACEHOLDER = [
  "coming soon",
  "guaranteed",
  "best",
  "recommended",
  "custom",
  "default",
  "most popular",
  "roi",
  "savings",
  "final quote",
  "ready to build",
];

function renderShop() {
  return render(
    <MemoryRouter initialEntries={["/shop"]}>
      <Shop />
    </MemoryRouter>,
  );
}

describe("/shop — V1 Retirement Gate", () => {
  it("renders the placeholder page", () => {
    renderShop();
    expect(screen.getByTestId("shop-retirement-placeholder")).toBeInTheDocument();
  });

  it("uses the exact heading", () => {
    renderShop();
    expect(
      screen.getByRole("heading", { name: "Product catalog under curation" }),
    ).toBeInTheDocument();
  });

  it("uses the exact body copy", () => {
    renderShop();
    expect(
      screen.getByText(
        "Product details for each package are being verified. To see what your package includes, go to your package summary.",
      ),
    ).toBeInTheDocument();
  });

  it("uses the exact CTA label pointing to /options", () => {
    renderShop();
    const cta = screen.getByRole("link", { name: "View packages" });
    expect(cta).toHaveAttribute("href", "/options");
  });

  it("does not render any retired build-flow UI", () => {
    renderShop();
    const html = document.body.textContent ?? "";
    expect(html).not.toMatch(/Build Your Bathroom/i);
    expect(html).not.toMatch(/Select one product per category/i);
    expect(html).not.toMatch(/MATERIALS TOTAL/i);
    expect(html).not.toMatch(/categories selected/i);
    expect(html).not.toMatch(/Continue to Summary/i);
    expect(html).not.toMatch(/Back to Customize/i);
    expect(html).not.toMatch(/Emmeline/i);
    expect(html).not.toMatch(/Breckenridge 48/i);
    expect(html).not.toMatch(/Breckenridge 72/i);
  });

  it("does not contain a primary-nav Shop link", () => {
    renderShop();
    expect(screen.queryByRole("link", { name: /^Shop$/ })).toBeNull();
  });

  it("placeholder copy contains no forbidden phrases", () => {
    renderShop();
    const text = (document.body.textContent ?? "").toLowerCase();
    for (const phrase of FORBIDDEN_PLACEHOLDER) {
      expect(text.includes(phrase), `forbidden phrase: ${phrase}`).toBe(false);
    }
  });
});

describe("homepage source — Shop link removed", () => {
  it("Index.tsx source contains no <Link to=\"/shop\"", async () => {
    const fs = await import("node:fs/promises");
    const src = await fs.readFile("src/pages/Index.tsx", "utf8");
    expect(src).not.toMatch(/to=["']\/shop["']/);
    expect(src).not.toMatch(/>Shop</);
  });
});
