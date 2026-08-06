import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/[lang]/page";
import TasksPage from "@/app/[lang]/tasks/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import CountryPage from "@/app/[lang]/countries/[country]/page";
import { TASK_FAMILIES } from "@/data/demo/tasks";

const familyIds = TASK_FAMILIES.map((family) => family.id);

async function renderIconSurfaces() {
  const home = render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));
  const homeIcons = [...home.container.querySelectorAll("[data-task-family-icon]")];
  home.unmount();

  const tasks = render(await TasksPage({ params: Promise.resolve({ lang: "en" }) }));
  const jumpIcons = [...tasks.container.querySelectorAll('[data-icon-surface="task-jump"] [data-task-family-icon]')];
  const headingIcons = [...tasks.container.querySelectorAll('[data-icon-surface="task-heading"] [data-task-family-icon]')];
  tasks.unmount();

  const rankings = render(
    await RankingsPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    }),
  );
  const rankingIcons = [...rankings.container.querySelectorAll('[data-icon-surface="ranking-category"] [data-task-family-icon]')];
  rankings.unmount();

  const country = render(
    await CountryPage({ params: Promise.resolve({ lang: "en", country: "kr" }) }),
  );
  const countryIcons = [...country.container.querySelectorAll('[data-icon-surface="country-category"] [data-task-family-icon]')];
  country.unmount();

  return { homeIcons, jumpIcons, headingIcons, rankingIcons, countryIcons };
}

function familyId(icon: Element) {
  return icon.getAttribute("data-task-family-id");
}

function svgSignature(icon: Element) {
  const svg = icon.querySelector("svg");
  return svg?.innerHTML;
}

describe("task family icon contract", () => {
  it("renders all ten families on each of the five category surfaces", async () => {
    const surfaces = await renderIconSurfaces();

    expect(surfaces.homeIcons).toHaveLength(10);
    expect(surfaces.jumpIcons).toHaveLength(10);
    expect(surfaces.headingIcons).toHaveLength(10);
    expect(surfaces.rankingIcons).toHaveLength(10);
    expect(surfaces.countryIcons).toHaveLength(10);

    for (const icons of Object.values(surfaces)) {
      expect(icons.map(familyId)).toEqual(familyIds);
    }
  });

  it("uses one decorative 24 by 24 SVG definition for the same family everywhere", async () => {
    const surfaces = await renderIconSurfaces();
    const allIcons = Object.values(surfaces).flat();

    expect(allIcons).toHaveLength(50);
    for (const familyId of familyIds) {
      const icons = allIcons.filter((icon) => icon.getAttribute("data-task-family-id") === familyId);
      expect(icons).toHaveLength(5);
      expect(new Set(icons.map(svgSignature))).toHaveLength(1);
    }

    for (const icon of allIcons) {
      const svg = icon.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    }
  });
});
