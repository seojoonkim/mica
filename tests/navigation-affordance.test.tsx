import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/[lang]/page";
import CountriesPage from "@/app/[lang]/countries/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";

const LOCALES = ["en", "ko"] as const;

describe("subpage link affordance", () => {
  it.each(LOCALES)("marks every linked home register row as opening detail in %s", async (lang) => {
    const { container } = render(await HomePage({ params: Promise.resolve({ lang }) }));
    const marketLinks = [...container.querySelectorAll(".mica-band a[data-detail-link]")];
    const familyLinks = [...container.querySelectorAll(".mica-home-family-index a[data-detail-link]")];

    expect(marketLinks).toHaveLength(COUNTRIES.length);
    expect(familyLinks).toHaveLength(TASK_FAMILIES.length);
    for (const link of [...marketLinks, ...familyLinks]) {
      expect(link.querySelector("[data-detail-cue]")).not.toBeNull();
    }
  });

  it.each(LOCALES)("marks country edition and leaderboard rows as navigable in %s", async (lang) => {
    const countries = render(await CountriesPage({ params: Promise.resolve({ lang }) }));
    expect(countries.container.querySelectorAll("[data-country-edition] a[data-detail-link]")).toHaveLength(
      COUNTRIES.length,
    );
    countries.unmount();

    const rankings = render(
      await RankingsPage({ params: Promise.resolve({ lang }), searchParams: Promise.resolve({}) }),
    );
    const registerLinks = [...rankings.container.querySelectorAll(".mica-leaderboard-register a")];
    expect(registerLinks).toHaveLength(COUNTRIES.length + TASK_FAMILIES.length);
    expect(registerLinks.every((link) => link.hasAttribute("data-detail-link"))).toBe(true);
    expect(registerLinks.every((link) => link.querySelector("[data-detail-cue]"))).toBe(true);
  });
});