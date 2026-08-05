import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavLinks } from "@/components/nav-links";
import { DemoStatusBar } from "@/components/chrome";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

beforeEach(() => {
  pathname.current = "/";
});

describe("primary nav active state", () => {
  it("marks the current top-level route with aria-current=page", () => {
    pathname.current = "/rankings";
    render(<NavLinks lang="en" />);
    expect(screen.getByRole("link", { name: "Rankings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Tasks" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the section for a detail route by prefix match", () => {
    pathname.current = "/tasks/some-task";
    render(<NavLinks lang="en" />);
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not treat a prefix of a different segment as active", () => {
    pathname.current = "/tasks-archive";
    render(<NavLinks lang="en" />);
    expect(screen.getByRole("link", { name: "Tasks" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks nothing outside the nav, including the home route", () => {
    pathname.current = "/";
    render(<NavLinks lang="en" />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("primary navigation structure", () => {
  it("keeps the global navigation focused on five benchmark journeys", () => {
    render(<NavLinks lang="en" />);

    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Rankings",
      "Tasks",
      "Methodology",
      "Evidence",
      "Submission requirements",
    ]);
  });
});

describe("mobile nav disclosure", () => {
  it("has a localized accessible name and exposes its menu state", () => {
    render(<NavLinks lang="en" />);
    const toggle = screen.getByRole("button", { name: "Menu" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mica-primary-nav");
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName("Close menu");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape and returns focus to the toggle", () => {
    render(<NavLinks lang="en" />);
    const toggle = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });
});

describe("global demo status bar", () => {
  it("always states both required strings visibly", () => {
    render(<DemoStatusBar lang="en" />);
    const bar = screen.getByRole("complementary", { name: /data status/i });
    expect(bar).toHaveTextContent("Illustrative demo data");
    expect(bar).toHaveTextContent("Not an official ranking");
  });

  it("links to the methodology and to the JSON dataset", () => {
    render(<DemoStatusBar lang="en" />);
    expect(screen.getByRole("link", { name: /method/i })).toHaveAttribute(
      "href",
      "/en/methodology",
    );
    expect(screen.getByRole("link", { name: /json/i })).toHaveAttribute(
      "href",
      "/data/demo/mica-demo.json",
    );
  });
});
