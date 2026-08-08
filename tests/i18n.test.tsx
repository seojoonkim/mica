import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localeAlternates,
  localeHref,
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


/**
 * Every leaf path in a dictionary, descending *into* arrays rather than
 * collapsing them at the array node. A collapsed array hides both a length
 * drift and an untranslated element, which is exactly what parity has to catch.
 */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => keyPaths(item, `${prefix}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

type Leaf = { path: string; en: string; ko: string };

/**
 * Walk the two dictionaries in lockstep and collect aligned string leaves,
 * recording any structural divergence (array length, node kind) as it goes.
 */
function alignLeaves(
  enNode: unknown,
  koNode: unknown,
  prefix = "",
  leaves: Leaf[] = [],
  structural: string[] = [],
): { leaves: Leaf[]; structural: string[] } {
  if (typeof enNode === "string" || typeof koNode === "string") {
    if (typeof enNode === "string" && typeof koNode === "string") {
      leaves.push({ path: prefix, en: enNode, ko: koNode });
    } else {
      structural.push(`${prefix}: string vs ${typeof koNode}`);
    }
  } else if (Array.isArray(enNode) || Array.isArray(koNode)) {
    if (!Array.isArray(enNode) || !Array.isArray(koNode)) {
      structural.push(`${prefix}: array vs non-array`);
    } else if (enNode.length !== koNode.length) {
      structural.push(
        `${prefix}: array length ${enNode.length} (en) vs ${koNode.length} (ko)`,
      );
    } else {
      enNode.forEach((item, i) =>
        alignLeaves(item, koNode[i], `${prefix}[${i}]`, leaves, structural),
      );
    }
  } else if (enNode && typeof enNode === "object") {
    if (!koNode || typeof koNode !== "object") {
      structural.push(`${prefix}: object vs ${typeof koNode}`);
    } else {
      for (const k of Object.keys(enNode as Record<string, unknown>)) {
        alignLeaves(
          (enNode as Record<string, unknown>)[k],
          (koNode as Record<string, unknown>)[k],
          prefix ? `${prefix}.${k}` : k,
          leaves,
          structural,
        );
      }
    }
  }
  return { leaves, structural };
}

const ALIGNED = alignLeaves(en, ko);

describe("localized metadata", () => {
  it("keeps descriptive metadata independent from the concise home H1", async () => {
    for (const [lang, dict] of [["en", en], ["ko", ko]] as const) {
      const metadata = await layoutMetadata({ params: Promise.resolve({ lang }) });
      expect(metadata.description).toBe(dict.site.definition);
      expect(metadata.description).not.toBe(dict.site.tagline);
      expect(metadata.openGraph?.description).toBe(dict.site.definition);
      expect(metadata.twitter?.description).toBe(dict.site.definition);
    }
  });
});

/**
 * Korean copy legitimately drops a grammatical prefix that English needs, so a
 * blanket "no empty Korean leaf" rule would be wrong. Only these documented
 * keys may be empty in Korean while non-empty in English.
 */
const EMPTY_KO_ALLOWED = new Set(["country.hazardsTitlePrefix"]);

/** `{name}`-style interpolation slots — a dropped slot renders a literal hole. */
const PLACEHOLDER = /\{[^}\s]+\}/g;

/** Digits and percentages: the figures a locale pair must not silently restate. */
const NUMERIC_TOKEN = /\d+(?:[.,]\d+)*\s*%?/g;

function tokens(value: string, pattern: RegExp): string[] {
  return (value.match(pattern) ?? []).map((t) => t.replace(/\s+/g, "")).sort();
}

describe("locale primitives", () => {
  it("declares exactly English and Korean with canonical English as the default", () => {
    expect([...LOCALES]).toEqual(["en", "ko"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("keeps English on the root and prefixes Korean without losing the logical path", () => {
    expect(localeHref("en", "/")).toBe("/");
    expect(localeHref("en", "/rankings")).toBe("/rankings");
    expect(localeHref("ko", "/rankings")).toBe("/ko/rankings");
    expect(localeHref("ko", "/evidence?country=kr")).toBe(
      "/ko/evidence?country=kr",
    );
  });

  it("publishes complete path-specific canonical and hreflang alternates", () => {
    expect(localeAlternates("en", "/methodology")).toEqual({
      canonical: "/methodology",
      languages: {
        en: "/methodology",
        ko: "/ko/methodology",
        "x-default": "/methodology",
      },
    });
    expect(localeAlternates("ko", "/countries/kr")).toEqual({
      canonical: "/ko/countries/kr",
      languages: {
        en: "/countries/kr",
        ko: "/ko/countries/kr",
        "x-default": "/countries/kr",
      },
    });
  });

  it("splits explicit locale prefixes from logical paths", () => {
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

  it("keeps the two dictionaries structurally aligned, arrays included", () => {
    expect(ALIGNED.structural).toEqual([]);
    expect(ALIGNED.leaves.length).toBeGreaterThan(0);
  });

  it("leaves no translated string empty", () => {
    const empty = ALIGNED.leaves.filter(
      (leaf) =>
        (leaf.en.trim() === "" ||
          (leaf.ko.trim() === "" && !EMPTY_KO_ALLOWED.has(leaf.path))) &&
        !(leaf.ko.trim() === "" && leaf.en.trim() === ""),
    );
    expect(empty.map((leaf) => leaf.path)).toEqual([]);
  });

  it("preserves interpolation placeholders across locales", () => {
    const drifted = ALIGNED.leaves
      .filter(
        (leaf) =>
          tokens(leaf.en, PLACEHOLDER).join("|") !==
          tokens(leaf.ko, PLACEHOLDER).join("|"),
      )
      .map((leaf) => leaf.path);
    expect(drifted).toEqual([]);
  });

  it("restates the same figures where both locales carry numeric tokens", () => {
    // Scoped to leaves where *both* sides carry figures: a Korean string that
    // phrases a count in words rather than digits is a translation choice, not
    // a contract break. A figure present on both sides must be the same figure.
    const drifted = ALIGNED.leaves
      .filter((leaf) => {
        const enTokens = tokens(leaf.en, NUMERIC_TOKEN);
        const koTokens = tokens(leaf.ko, NUMERIC_TOKEN);
        return (
          enTokens.length > 0 &&
          koTokens.length > 0 &&
          enTokens.join("|") !== koTokens.join("|")
        );
      })
      .map((leaf) => leaf.path);
    expect(drifted).toEqual([]);
  });

  it("never leaves a whole English sentence sitting in the Korean dictionary", () => {
    // Proper nouns and acronyms ("MICA", "p95", "Not an official ranking") are
    // legitimate in Korean copy, so this does not reject Latin script per se.
    // It rejects a *run* of six or more consecutive English words, which no
    // current Korean string reaches — the longest today is four, in the
    // deliberately verbatim disclosure string. Six is that ceiling plus margin.
    const ENGLISH_RUN =
      /[A-Za-z][A-Za-z'’]*(?:[ ,;:-]+[A-Za-z][A-Za-z'’]*){5,}/;
    const pasted = ALIGNED.leaves
      .filter((leaf) => ENGLISH_RUN.test(leaf.ko))
      .map((leaf) => `${leaf.path}: ${leaf.ko}`);
    expect(pasted).toEqual([]);
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
    "uses localized publication status instead of a score disclosure on the %s home",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const dict = getDict(lang);
      expect(screen.getByTestId("publication-status")).toHaveTextContent(
        dict.home.publicationStatus,
      );
      expect(screen.queryByTestId("demo-disclosure")).toBeNull();
    },
  );

  it.each(["en", "ko"] as const)(
    "writes every internal href in the canonical %s locale shape",
    async (lang) => {
      render(await HomePage({ params: Promise.resolve({ lang }) }));
      const hrefs = [...document.querySelectorAll("a[href^='/']")].map(
        (a) => a.getAttribute("href")!,
      );
      const internal = hrefs.filter((href) => !href.startsWith("/data/"));
      expect(internal.length).toBeGreaterThan(0);
      for (const href of internal) {
        expect(lang === "en" ? !href.startsWith("/en") && !href.startsWith("/ko") : href.startsWith("/ko")).toBe(true);
      }
      expect(internal).toContain(lang === "en" ? "/rankings" : "/ko/rankings");
      expect(internal).toContain(lang === "en" ? "/methodology" : "/ko/methodology");
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
    expect(enLink).toHaveAttribute("href", "/rankings");
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
      expect(meta.alternates?.canonical).toBe(lang === "en" ? "/" : "/ko");
      expect(meta.alternates?.languages).toMatchObject({
        en: "/",
        ko: "/ko",
        "x-default": "/",
      });
      expect(meta.description).toBe(getDict(lang).site.definition);
      expect(meta.other).toMatchObject({
        "mica:data-status": "demo",
        "mica:indexing": "noindex, nofollow — demo preview",
      });
      expect(meta.other).not.toHaveProperty("mica:disclosure");
    },
  );
});

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);

  it("emits root English and /ko Korean for every page", () => {
    for (const path of ["", "/rankings", "/evidence", "/about/governance"]) {
      expect(urls).toContain(`${SITE.url}${path || "/"}`);
      expect(urls).toContain(`${SITE.url}/ko${path}`);
    }
  });

  it("never publishes a legacy /en canonical", () => {
    for (const url of urls) {
      const rest = url.slice(SITE.url.length);
      expect(rest.startsWith("/en")).toBe(false);
    }
  });
});
