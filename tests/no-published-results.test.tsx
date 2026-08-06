import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { SYSTEMS } from "@/data/demo/systems";
import { RUN_CELLS } from "@/data/demo/runs";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { RUN_CELL_IDS } from "@/lib/evidence";
import {
  aggregateBySystem,
  globalAccuracyRows,
  countrySnapshot,
} from "@/lib/derive";
import { getDict } from "@/lib/i18n/dictionary";
import { COUNTRY_CODES } from "@/lib/schema";
import {
  publishedResultFamilyIds,
  evaluationFamilyCount,
  isPublishedResult,
} from "@/lib/i18n/coverage";
import sitemap from "@/app/sitemap";
import HomePage from "@/app/[lang]/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import AgentsPage from "@/app/[lang]/agents/page";
import EvidenceIndexPage from "@/app/[lang]/evidence/page";
import CountriesPage from "@/app/[lang]/countries/page";
import CountryPage from "@/app/[lang]/countries/[country]/page";
import SystemPage, {
  generateStaticParams as agentParams,
} from "@/app/[lang]/agents/[system]/page";
import EvidenceCellPage, {
  generateStaticParams as evidenceParams,
} from "@/app/[lang]/evidence/[cell]/page";

/**
 * The release contract: MICA publishes the taxonomy, the methodology and the
 * evidence infrastructure, and it publishes no system results at all. No
 * invented agent, operator, score, ranking or run cell may appear anywhere the
 * public can reach — rendered pages, exported files or the sitemap.
 */

/** Every fictional name that ever shipped in the demo fixture. */
const FORBIDDEN = [
  "Atlas Concierge",
  "atlas-concierge",
  "Meridian Agent",
  "meridian-agent",
  "Hangang Assistant",
  "hangang-assistant",
  "Kaiyō Orchestrator",
  "Kaiyo Orchestrator",
  "kaiyo-orchestrator",
  "Swift Errand",
  "swift-errand",
  "Nanyang Copilot",
  "nanyang-copilot",
  "Demo Operator",
];

function expectNoFictionalNames(text: string) {
  for (const name of FORBIDDEN) {
    expect(text.toLowerCase()).not.toContain(name.toLowerCase());
  }
}

const LANGS = ["en", "ko"] as const;

describe("the canonical fixtures carry no system results", () => {
  it("exports an empty, validated system array", () => {
    expect(SYSTEMS).toEqual([]);
  });

  it("exports an empty, validated run-cell array", () => {
    expect(RUN_CELLS).toEqual([]);
    expect(RUN_CELL_IDS).toEqual([]);
  });

  it("derives no rows, rankings or market snapshots", () => {
    expect(aggregateBySystem()).toEqual([]);
    expect(aggregateBySystem({ country: "kr" })).toEqual([]);
    expect(globalAccuracyRows()).toEqual([]);
    for (const code of COUNTRY_CODES) {
      expect(countrySnapshot(code)).toEqual([]);
    }
  });

  it("reports ten evaluation families and zero published result families", () => {
    expect(evaluationFamilyCount()).toBe(10);
    expect(publishedResultFamilyIds()).toEqual([]);
  });

  it("fails closed for non-official, ineligible or unverified cells", () => {
    const baseSystem = {
      slug: "test-system",
      name: "Test System",
      operator: "Test Operator",
      snapshotVersion: "1.0.0",
      snapshotDate: "2026-01-01",
      composition: {
        orchestrator: "Test orchestrator",
        models: ["test model"],
        tools: ["test tool"],
        memory: "none",
      },
      summary: "Test-only system.",
      verification: "independent-rerun" as const,
      track: "simulator" as const,
      dataStatus: "official" as const,
      publicationEligible: true,
    };
    const baseCell = {
      system: "test-system",
      country: "kr" as const,
      family: "email-calendar" as const,
      eligibleRuns: 20,
      successfulRuns: 10,
      tasksAttempted: 3,
      tasksDefined: 3,
      successLatenciesSec: [100],
      allEligibleLatenciesSec: [100],
      totalEligibleCost: 100,
      criticalSafetyEvents: 0,
      dataStatus: "official" as const,
      publicationEligible: true,
    };

    // Thresholds are intentionally unset, so even an otherwise official cell
    // cannot become published in this edition.
    expect(isPublishedResult(baseCell, baseSystem)).toBe(false);
    expect(isPublishedResult({ ...baseCell, dataStatus: "demo" }, baseSystem)).toBe(false);
    expect(isPublishedResult({ ...baseCell, publicationEligible: false }, baseSystem)).toBe(false);
    expect(
      isPublishedResult(baseCell, { ...baseSystem, verification: "self-reported" }),
    ).toBe(false);
    expect(isPublishedResult(baseCell, undefined)).toBe(false);
  });
});

describe("rendered pages name no fictional system", () => {
  const pages = [
    ["home", (lang: "en" | "ko") => HomePage({ params: Promise.resolve({ lang }) })],
    [
      "rankings",
      (lang: "en" | "ko") =>
        RankingsPage({
          params: Promise.resolve({ lang }),
          searchParams: Promise.resolve({ country: "kr" }),
        }),
    ],
    ["agents", (lang: "en" | "ko") => AgentsPage({ params: Promise.resolve({ lang }) })],
    [
      "evidence",
      (lang: "en" | "ko") =>
        EvidenceIndexPage({
          params: Promise.resolve({ lang }),
          searchParams: Promise.resolve({}),
        }),
    ],
    ["countries", (lang: "en" | "ko") => CountriesPage({ params: Promise.resolve({ lang }) })],
    [
      "country detail",
      (lang: "en" | "ko") =>
        CountryPage({ params: Promise.resolve({ lang, country: "kr" }) }),
    ],
  ] as const;

  for (const [name, build] of pages) {
    it.each(LANGS)(`renders the %s ${name} page with no fictional name`, async (lang) => {
      render(await build(lang));
      expectNoFictionalNames(document.body.textContent ?? "");
      expect(document.body.innerHTML.toLowerCase()).not.toContain("--kr--");
    });
  }
});

describe("home states an honest empty index", () => {
  it.each(LANGS)("shows zero verified systems and zero measured runs in %s", async (lang) => {
    const dict = getDict(lang);
    render(await HomePage({ params: Promise.resolve({ lang }) }));
    const ledger = document.querySelector(".mica-ledger")!;
    const rows = [...ledger.querySelectorAll("div")].map(
      (row) => row.textContent ?? "",
    );
    expect(rows.some((row) => row.includes(dict.home.statSystems) && row.includes("0"))).toBe(true);
    expect(rows.some((row) => row.includes(dict.home.statRuns) && row.includes("0"))).toBe(true);
  });

  it.each(LANGS)("says no verified results are published in %s", async (lang) => {
    const dict = getDict(lang);
    render(await HomePage({ params: Promise.resolve({ lang }) }));
    const text = document.body.textContent ?? "";
    expect(text).toContain(dict.home.noResultsHeadline);
    expect(text).toContain(dict.home.noResultsDetail);
    expect(text).toContain(dict.home.readinessTitle);
  });

  it("pairs the English publication status with no result table", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));
    expect(screen.getByTestId("publication-status")).toHaveTextContent(
      getDict("en").home.publicationStatus,
    );
    expect(screen.queryByTestId("demo-disclosure")).toBeNull();
    expect(screen.queryAllByRole("table")).toHaveLength(0);
  });

  it("no longer publishes a market ledger or a global ranking", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/accuracy spread/i);
    expect(text).not.toMatch(/highest accuracy/i);
    expect(text).not.toMatch(/index-wide/i);
  });
});

describe("rankings is a valid route with an honest empty state", () => {
  it.each(LANGS)("keeps the filter form but publishes no results in %s", async (lang) => {
    const dict = getDict(lang);
    render(
      await RankingsPage({
        params: Promise.resolve({ lang }),
        searchParams: Promise.resolve({ country: "kr", family: "email-calendar" }),
      }),
    );
    expect(screen.getByRole("form", { name: dict.rankings.formLabel })).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(document.body.textContent).toContain(dict.rankings.noResultsNotice);
    expect(document.querySelector("a[href*='/evidence/']")).toBeNull();
  });
});

describe("registries are empty rather than populated", () => {
  it.each(LANGS)("states an empty system registry in %s", async (lang) => {
    const dict = getDict(lang);
    render(await AgentsPage({ params: Promise.resolve({ lang }) }));
    expect(document.body.textContent).toContain(dict.agents.emptyNotice);
    expect(screen.queryByRole("table")).toBeNull();
  });

  it.each(LANGS)("states an empty evidence registry in %s", async (lang) => {
    const dict = getDict(lang);
    render(
      await EvidenceIndexPage({
        params: Promise.resolve({ lang }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(document.body.textContent).toContain(dict.evidence.emptyNotice);
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("detail routes generate nothing and 404", () => {
  it("generates no agent or evidence detail params", () => {
    expect(agentParams()).toEqual([]);
    expect(evidenceParams()).toEqual([]);
  });

  it("404s an unknown agent detail", async () => {
    await expect(
      SystemPage({ params: Promise.resolve({ lang: "en", system: "atlas-concierge" }) }),
    ).rejects.toThrow();
  });

  it("404s an unknown evidence detail", async () => {
    await expect(
      EvidenceCellPage({
        params: Promise.resolve({ lang: "en", cell: "atlas-concierge--kr--email-calendar" }),
      }),
    ).rejects.toThrow();
  });
});

describe("country pages keep research and drop measurements", () => {
  it.each(LANGS)("renders %s market context with no score table", async (lang) => {
    render(await CountryPage({ params: Promise.resolve({ lang, country: "kr" }) }));
    const text = document.body.textContent ?? "";
    expect(screen.queryByRole("table")).toBeNull();
    expect(document.querySelector("a[href*='/evidence/']")).toBeNull();
    // Market research and task definitions survive.
    expect(text).toContain("Super-app enclosure");
    expect(text.length).toBeGreaterThan(500);
  });

  it("drops measured system counts and leaders from the country index", async () => {
    render(await CountriesPage({ params: Promise.resolve({ lang: "en" }) }));
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/systems covered/i);
    expect(text).not.toMatch(/highest demo accuracy/i);
  });
});

describe("sitemap and exports carry no fictional records", () => {
  it("lists no agent or evidence detail page", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => /\/agents\/[^/]+$/.test(url))).toBe(false);
    expect(urls.some((url) => /\/evidence\/[^/]+$/.test(url))).toBe(false);
    for (const url of urls) expectNoFictionalNames(url);
  });

  it("ships public JSON and CSV with empty system and run arrays", () => {
    const dir = join(process.cwd(), "public", "data", "demo");
    const json = JSON.parse(readFileSync(join(dir, "mica-demo.json"), "utf8"));
    expect(json.countries).toEqual(COUNTRIES);
    expect(json.taskFamilies).toEqual(TASK_FAMILIES);
    expect(json.systems).toEqual([]);
    expect(json.runCells).toEqual([]);
    const csv = readFileSync(join(dir, "mica-demo.csv"), "utf8");
    expectNoFictionalNames(csv);
    expect(csv.trim().split("\n")).toHaveLength(2);
    expectNoFictionalNames(JSON.stringify(json));
  });
});
