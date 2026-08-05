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
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Rankings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Systems" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the section for a detail route by prefix match", () => {
    pathname.current = "/agents/hangang-assistant";
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Systems" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not treat a prefix of a different segment as active", () => {
    pathname.current = "/tasks-archive";
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Tasks" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks nothing outside the nav, including the home route", () => {
    pathname.current = "/";
    render(<NavLinks />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("mobile nav disclosure", () => {
  it("closes on Escape and returns focus to the toggle", () => {
    render(<NavLinks />);
    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });
});

describe("global demo status bar", () => {
  it("always states both required strings visibly", () => {
    render(<DemoStatusBar />);
    const bar = screen.getByRole("complementary", { name: /data status/i });
    expect(bar).toHaveTextContent("Illustrative demo data");
    expect(bar).toHaveTextContent("Not an official ranking");
  });

  it("links to the methodology and to the JSON dataset", () => {
    render(<DemoStatusBar />);
    expect(screen.getByRole("link", { name: /method/i })).toHaveAttribute(
      "href",
      "/methodology",
    );
    expect(screen.getByRole("link", { name: /json/i })).toHaveAttribute(
      "href",
      "/data/demo/mica-demo.json",
    );
  });
});
