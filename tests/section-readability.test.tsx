import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/[lang]/page";

describe("editorial section readability", () => {
  it.each(["en", "ko"] as const)("separates every %s section header from its body", async (lang) => {
    const { container } = render(await HomePage({ params: Promise.resolve({ lang }) }));
    const sections = [...container.querySelectorAll("[data-editorial-section]")];
    expect(sections.length).toBeGreaterThanOrEqual(3);

    for (const section of sections) {
      const header = section.querySelector("[data-section-header]");
      const body = section.querySelector("[data-section-body]");
      expect(header).not.toBeNull();
      expect(body).not.toBeNull();
      expect(header!.querySelector("h2")).not.toBeNull();
      expect(header!.nextElementSibling).toBe(body);
    }
  });
});