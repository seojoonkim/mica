import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MethodologyPage from "@/app/[lang]/methodology/page";

describe("methodology on-this-page navigation", () => {
  it("offers a named nav whose links all resolve to real section ids", async () => {
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang: "en" }) }),
    );
    const nav = screen.getByRole("navigation", { name: /on this page/i });
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(5);
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith("#")).toBe(true);
      expect(container.querySelector(`[id="${href.slice(1)}"]`)).not.toBeNull();
    }
  });
});
