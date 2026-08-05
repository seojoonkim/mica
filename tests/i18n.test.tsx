import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  isLocale,
  localeHref,
  pickLocale,
  splitLocale,
  htmlLangForCountry,
} from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";
import { publishedResultFamilyIds } from "@/lib/i18n/coverage";
import sitemap from "@/app/sitemap";
import HomePage from "@/app/[lang]/page";
import TasksPage from "@/app/[lang]/tasks/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import { generateMetadata as layoutMetadata } from "@/app/[lang]/layout";
import { LocaleSwitch } from "@/components/locale-switch";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { SITE } from "@/lib/site";

const DEMO_EN = "Illustrative demo data";
const RANKING_EN = "Not an official ranking";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [prefix];
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("locale primitives", () => {
  it("declares exactly English and Korean with English as the fallback", () => {
    expect([...LOCALES]).toEqual(["en", "ko"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LOCALE_COOKIE).toBe("mica_lang");
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("prefers the cookie, then Accept-Language, then English", () => {
    expect(pickLocale("ko", "en-GB,en;q=0.9")).toBe("ko");
    expect(pickLocale("en", "ko-KR,ko;q=0.9")).toBe("en");
    expect(pickLocale(undefined, "ko-KR,ko;q=0.9,en;q=0.8")).toBe("ko");
    expect(pickLocale(undefined, "en-US,en;q=0.9,ko;q=0.8")).toBe("en");
    expect(pickLocale(undefined, undefined)).toBe("en");
    expect(pickLocale("de", "fr-FR")).toBe("en");
  });

  it("prefixes and strips the locale segment without losing the logical path", () => {
    expect(localeHref("en", "/")).toBe("/en");
    expect(localeHref("ko", "/rankings")).toBe("/ko/rankings");
    expect(localeHref("ko", "/evidence?country=kr")).toBe(
      "/ko/evidence?country=kr",
    );
    expect(splitLocale("/ko/rankings")).toEqual({ lang: "ko", path: "/rankings" });
    expect(splitLocale("/en")).toEqual({ lang: "en", path: "/" });
    expect(splitLocale("/rankings")).toEqual({ lang: null, path: "/rankings" });
  });

  it("names the document language of each native market name", () => {
    expect(htmlLangForCountry("kr")).toBe("ko");
    expect(htmlLangForCountry("jp")).toBe("ja");
    expect(htmlLangForCountry("tw")).toBe("zh-Hant");
    expect(htmlLangForCountry("th")).toBe("th");
  });
});

describe("typed dictionary contract", () => {
  it("gives Korean exactly the English key set", () => {
    expect(keyPaths(ko).sort()).toEqual(keyPaths(en).sort());
  });

  it("resolves a dictionary per locale", () => {
    expect(getDict("en")).toBe(en);
    expect(getDict("ko")).toBe(ko);
  });

  it("translates every task family and every canonical task", () => {
    for (const family of TASK_FAMILIES) {
      expect(ko.families[family.id].label).toBeTruthy();
      expect(ko.families[family.id].label).not.toBe(family.label);
      expect(en.families[family.id].label).toBe(family.label);
      for (const task of family.canonicalTasks) {
        expect(task.translations.ko.title).not.toBe(task.title);
        expect(task.translations.ko.finalState).not.toBe(task.finalState);
        expect(task.translations.ko.confirmationBoundary).not.toBe(
          task.confirmationBoundary,
        );
      }
    }
    expect(ko.families["money-banking-investing"].label).toBe("금융·은행·투자");
    expect(ko.families["email-calendar"].label).not.toBe(
      ko.families["telecom-subscriptions"].label,
    );
    expect(ko.families["telecom-subscriptions"].label).toMatch(/통신/);
    expect(ko.families["email-calendar"].label).toMatch(/이메일/);
  });

  it.each(["en", "ko"] as const)(
    "renders all 100 localized tasks on the %s tasks page as readable lists",
    async (lang) => {
      render(await TasksPage({ params: Promise.resolve({ lang }) }));
      expect(document.querySelectorAll("[data-canonical-task]")).toHaveLength(100);
      expect(document.querySelector("table")).toBeNull();
      const sample = TASK_FAMILIES[0].canonicalTasks[0];
      const expectedTitle = lang === "ko" ? sample.translations.ko.title : sample.title;
      expect(screen.getByRole("heading", { name: expectedTitle })).toBeInTheDocument();
    },
  );
});

describe("coverage honesty", () => {
  it("separates ten evaluation families from zero published result families", () => {
    expect(TASK_FAMILIES).toHaveLength(10);
    expect(publishedResultFamilyIds()).toHaveLength(0);
  });

  it.each(["en", "ko"] as const)(
    "states both counts on the %s home page",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const text = document.body.textContent ?? "";
      expect(text).toContain(String(TASK_FAMILIES.length));
      expect(text).toContain(String(publishedResultFamilyIds().length));
      expect(text).toContain(getDict(lang).coverage.headline);
    },
  );

  it.each(["en", "ko"] as const)(
    "states both counts on the %s tasks page",
    async (lang) => {
      render(await TasksPage({ params: Promise.resolve({ lang }) }));
      expect(document.body.textContent ?? "").toContain(
        getDict(lang).coverage.headline,
      );
    },
  );
});

describe("localized page rendering", () => {
  it.each(["en", "ko"] as const)(
    "renders %s headings from the dictionary",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const dict = getDict(lang);
      expect(
        screen.getByRole("heading", { level: 1, name: dict.site.tagline }),
      ).toBeInTheDocument();
      expect(document.body.textContent).toContain(dict.home.axesTitle);
      expect(document.body.textContent).toContain(dict.home.readinessTitle);
    },
  );

  it.each(["en", "ko"] as const)(
    "keeps the exact English disclosure strings visible in %s",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const text = document.body.textContent ?? "";
      expect(text).toContain(DEMO_EN);
      expect(text).toContain(RANKING_EN);
      if (lang === "ko") {
        expect(text).toContain(ko.disclosure.demoLabelLocal);
        expect(text).toContain(ko.disclosure.notRankingLocal);
      }
    },
  );

  it.each(["en", "ko"] as const)(
    "prefixes every internal href with the %s locale",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const hrefs = [...document.querySelectorAll("a[href^='/']")].map(
        (a) => a.getAttribute("href")!,
      );
      const internal = hrefs.filter((href) => !href.startsWith("/data/"));
      expect(internal.length).toBeGreaterThan(0);
      for (const href of internal) {
        expect(href.startsWith(`/${lang}`)).toBe(true);
      }
      expect(internal).toContain(`/${lang}/rankings`);
      expect(internal).toContain(`/${lang}/methodology`);
    },
  );

  it("translates the rankings controls and empty state into Korean", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ lang: "ko" }),
        searchParams: Promise.resolve({}),
      }),
    );
    const text = document.body.textContent ?? "";
    expect(text).toContain(ko.rankings.chooseMarket);
    expect(text).toContain(ko.rankings.noMarketSelected);
    expect(screen.getByRole("form", { name: ko.rankings.formLabel })).toHaveAttribute(
      "method",
      "get",
    );
    expect(screen.getByRole("form", { name: ko.rankings.formLabel })).toHaveAttribute(
      "action",
      "/ko/rankings",
    );
  });
});

describe("language switch", () => {
  it("offers both locales with hrefLang and the active one marked", () => {
    render(<LocaleSwitch lang="ko" path="/rankings" search="" />);
    const nav = screen.getByRole("navigation", { name: ko.locale.switchLabel });
    const enLink = within(nav).getByRole("link", { name: "EN" });
    const koLink = within(nav).getByRole("link", { name: "한국어" });
    expect(enLink).toHaveAttribute("hreflang", "en");
    expect(koLink).toHaveAttribute("hreflang", "ko");
    expect(enLink).toHaveAttribute("href", "/en/rankings");
    expect(koLink).toHaveAttribute("href", "/ko/rankings");
    expect(koLink).toHaveAttribute("aria-current", "true");
    expect(enLink).not.toHaveAttribute("aria-current");
  });

  it("preserves the query string of a filtered Rankings view", () => {
    render(
      <LocaleSwitch
        lang="en"
        path="/rankings"
        search="country=kr&family=email-calendar&metric=cost"
      />,
    );
    const nav = screen.getByRole("navigation", { name: en.locale.switchLabel });
    expect(within(nav).getByRole("link", { name: "한국어" })).toHaveAttribute(
      "href",
      "/ko/rankings?country=kr&family=email-calendar&metric=cost",
    );
  });
});

describe("localized document metadata", () => {
  it.each(["en", "ko"] as const)(
    "emits canonical, alternates and the intact preview contract for %s",
    async (lang) => {
      const meta = await layoutMetadata({ params: Promise.resolve({ lang }) });
      expect(meta.robots).toMatchObject({ index: false, follow: false });
      expect(meta.metadataBase?.toString()).toContain(new URL(SITE.url).host);
      expect(meta.alternates?.canonical).toBe(`/${lang}`);
      expect(meta.alternates?.languages).toMatchObject({
        en: "/en",
        ko: "/ko",
        "x-default": "/en",
      });
      expect(meta.description).toBe(getDict(lang).site.definition);
      expect(meta.other).toMatchObject({
        "mica:data-status": "demo",
        "mica:disclosure": "Illustrative demo data — not an official ranking",
        "mica:indexing": "noindex, nofollow — demo preview",
      });
    },
  );
});

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("emits every page in both locales", () => {
    for (const path of ["", "/rankings", "/evidence", "/about/governance"]) {
      expect(urls).toContain(`${SITE.url}/en${path}`);
      expect(urls).toContain(`${SITE.url}/ko${path}`);
    }
  });

  it("keeps no unlocalized page urls", () => {
    for (const url of urls) {
      const rest = url.slice(SITE.url.length);
      expect(rest.startsWith("/en") || rest.startsWith("/ko")).toBe(true);
    }
  });
});
