import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_CATALOGUE_STATUS, TASK_FAMILIES } from "@/data/demo/tasks";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";
import { getDict } from "@/lib/i18n/dictionary";
import { DemoDisclosure } from "@/components/editorial";
import { Colophon } from "@/components/chrome";

import TasksPage from "@/app/[lang]/tasks/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import HomePage from "@/app/[lang]/page";
import { generateMetadata as homeMetadata } from "@/app/[lang]/page";
import { generateMetadata as countriesMetadata } from "@/app/[lang]/countries/page";
import { generateMetadata as rankingsMetadata } from "@/app/[lang]/rankings/page";
import { generateMetadata as agentsMetadata } from "@/app/[lang]/agents/page";
import { generateMetadata as tasksMetadata } from "@/app/[lang]/tasks/page";
import { generateMetadata as evidenceMetadata } from "@/app/[lang]/evidence/page";
import MethodologyPage, {
  generateMetadata as methodologyMetadata,
} from "@/app/[lang]/methodology/page";
import GovernancePage, {
  generateMetadata as governanceMetadata,
} from "@/app/[lang]/about/governance/page";
import SubmitPage, {
  generateMetadata as submitMetadata,
} from "@/app/[lang]/submit/page";

describe("plain-language public copy", () => {
  it("uses a concise bilingual H1 and keeps the scoped world-first claim in the subtitle", async () => {
    expect(en.site.tagline).toBe("The consumer-agent benchmark");
    expect(ko.site.tagline).toBe("소비자 에이전트 벤치마크");

    for (const [lang, dict] of [["en", en], ["ko", ko]] as const) {
      const { container, unmount } = render(await HomePage({ params: Promise.resolve({ lang }) }));
      expect(container.querySelector("h1")).toHaveTextContent(dict.site.tagline);
      expect(dict.site.secondary).toMatch(lang === "en" ? /world.s first/i : /세계 최초/);
      expect(dict.site.secondary).toContain(String(COUNTRIES.length));
      expect(dict.site.secondary).toMatch(lang === "en" ? /public benchmark/i : /공개 벤치마크/);
      expect(dict.site.secondary).toMatch(lang === "en" ? /everyday consumer domains/i : /일상 소비 영역/);
      expect(dict.site.secondary).toMatch(lang === "en" ? /end-to-end consumer-agent execution/i : /엔드투엔드 실행/);
      expect(dict.site.secondary).not.toMatch(/initiative|이니셔티브|initiative in preview|no system has been measured|no result has been published/i);
      unmount();
    }
  });

  it("removes the global demo-ranking strip and its repeated footer wording", async () => {
    for (const lang of ["en", "ko"] as const) {
      const footer = render(<Colophon lang={lang} />);
      expect(footer.container).not.toHaveTextContent(/illustrative demo data/i);
      expect(footer.container).not.toHaveTextContent(/not an official ranking/i);
      footer.unmount();
    }

    const layoutSource = readFileSync(join(process.cwd(), "src/app/[lang]/layout.tsx"), "utf8");
    expect(layoutSource).not.toContain("DemoStatusBar");
  });

  it("describes the conjunction existing benchmarks do not combine without denying their final-state work", () => {
    expect(en.home.positionTitle).toMatch(/do not combine/i);
    expect(ko.home.positionTitle).toMatch(/함께 다루지 않는/);
    expect(en.home.positionTitle).not.toMatch(/^No benchmark/i);
    expect(ko.home.positionTitle).not.toMatch(/벤치마크가 없습니다/);
    expect(en.home.positionIntro).toMatch(/WebArena|WebVoyager|WebShop|AndroidWorld|AppWorld|τ-bench/);
    expect(ko.home.positionIntro).toMatch(/WebArena|WebVoyager|WebShop|AndroidWorld|AppWorld|τ-bench/);
  });

  it("renders machine-derived catalogue and publication lifecycle counts", async () => {
    const calibrationPending = TASK_FAMILIES.flatMap((family) => family.canonicalTasks)
      .filter((task) => task.measurement.references.status === "calibration-pending").length;

    for (const lang of ["en", "ko"] as const) {
      const dict = getDict(lang);
      const { container, unmount } = render(await HomePage({ params: Promise.resolve({ lang }) }));
      const status = container.querySelector('[data-testid="catalogue-lifecycle-status"]');
      expect(status).not.toBeNull();
      expect(status).toHaveTextContent(String(TASK_CATALOGUE_STATUS.candidateTasks));
      expect(status).toHaveTextContent(String(calibrationPending));
      expect(status).toHaveTextContent(String(TASK_CATALOGUE_STATUS.validatedTasks));
      expect(status).toHaveTextContent("0");
      expect(status).toHaveTextContent(dict.home.lifecycleCandidates);
      expect(status).toHaveTextContent(dict.home.lifecycleCalibrationPending);
      expect(status).toHaveTextContent(dict.home.lifecycleValidated);
      expect(status).toHaveTextContent(dict.home.lifecyclePublishedResults);
      unmount();
    }
  });

  it("states the canonical market count everywhere it summarizes coverage", () => {
    expect(en.common.editionSummary).toContain(`${COUNTRIES.length} markets`);
    expect(ko.common.editionSummary).toContain(`${COUNTRIES.length}개 시장`);
    expect(en.home.bandEyebrow).toContain(String(COUNTRIES.length));
    expect(ko.home.bandEyebrow).toContain(String(COUNTRIES.length));
  });

  it("does not present unavailable results or submissions as available actions", () => {
    expect(en.home.readTables).toMatch(/preview|how results/i);
    expect(ko.home.readTables).toMatch(/미리 보기|공개 방식/);
    expect(en.nav.submit).toMatch(/requirements|how submissions/i);
    expect(ko.nav.submit).toMatch(/요건|안내/);
    expect(en.submit.title).not.toMatch(/^Submit\b/i);
    expect(ko.submit.title).not.toMatch(/제출$/);
  });

  it("uses reader-facing terms for the most visible benchmark concepts", () => {
    expect(ko.common.finalState).toBe("완료 조건");
    expect(ko.common.confirmationBoundary).toBe("사용자 승인이 필요한 지점");
    expect(ko.table.snapshot).toBe("평가용 시스템 버전");
    expect(ko.table.runCell).toBe("평가 결과 묶음");
    expect(ko.table.locale).toBe("언어·지역 설정");
    expect(ko.chrome.colophonNote).not.toContain("publicationEligible");
  });

  it("removes the unlabeled mixed-purpose edition strip from the home hero", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(document.querySelector(".mica-strip")).toBeNull();
  });
});

const LOCALES = ["en", "ko"] as const;

function headingEndingWith(title: string) {
  return new RegExp(`${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}

/**
 * The publication-status slice. Home, tasks, methodology and submit define what
 * MICA measures; they carry no score figure, so the mandatory demo disclosure
 * does not belong on them. What they must carry instead is one localized notice
 * saying the index is unpublished, read from that page's own dictionary section.
 */
const DEFINITION_SURFACES = [
  {
    name: "home",
    section: "home",
    render: (lang: (typeof LOCALES)[number]) =>
      HomePage({ params: Promise.resolve({ lang }) }),
  },
  {
    name: "tasks",
    section: "tasks",
    render: (lang: (typeof LOCALES)[number]) =>
      TasksPage({ params: Promise.resolve({ lang }) }),
  },
  {
    name: "methodology",
    section: "methodology",
    render: (lang: (typeof LOCALES)[number]) =>
      MethodologyPage({ params: Promise.resolve({ lang }) }),
  },
  {
    name: "submit",
    section: "submit",
    render: (lang: (typeof LOCALES)[number]) =>
      SubmitPage({ params: Promise.resolve({ lang }) }),
  },
] as const;

/**
 * Reads the page's own `publicationStatus` string. Indexed rather than accessed
 * as a property so this test can name a key the dictionary does not carry yet:
 * the assertion, not the type checker, is what should report its absence.
 */
function publicationStatusCopy(lang: (typeof LOCALES)[number], section: string) {
  const dict = getDict(lang) as unknown as Record<string, Record<string, string>>;
  return dict[section]?.publicationStatus;
}

describe("definition surfaces carry a publication status, not a score disclosure", () => {
  for (const surface of DEFINITION_SURFACES) {
    it.each(LOCALES)(
      `renders the %s ${surface.name} publication status and no demo disclosure`,
      async (lang) => {
        render(await surface.render(lang));
        const notice = screen.getByTestId("publication-status");
        expect(notice).toBeInTheDocument();
        expect(screen.queryByTestId("demo-disclosure")).toBeNull();
      },
    );

    it.each(LOCALES)(
      `takes the %s ${surface.name} notice text from the page dictionary`,
      async (lang) => {
        const copy = publicationStatusCopy(lang, surface.section);
        expect(copy, `${surface.section}.publicationStatus missing for ${lang}`).toBeTruthy();
        render(await surface.render(lang));
        expect(screen.getByTestId("publication-status")).toHaveTextContent(copy!);
      },
    );
  }

  it("keeps the English and Korean status copy distinct per locale", () => {
    for (const surface of DEFINITION_SURFACES) {
      const enCopy = publicationStatusCopy("en", surface.section);
      const koCopy = publicationStatusCopy("ko", surface.section);
      expect(enCopy).toBeTruthy();
      expect(koCopy).toBeTruthy();
      expect(koCopy).not.toBe(enCopy);
    }
  });
});

describe("rankings leads with its empty-result notice", () => {
  it.each(LOCALES)(
    "places the %s empty notice before the filter form in DOM order",
    async (lang) => {
      const dict = getDict(lang);
      const { container } = render(
        await RankingsPage({
          params: Promise.resolve({ lang }),
          searchParams: Promise.resolve({ country: "kr", family: "email-calendar" }),
        }),
      );

      const notice = screen.getByTestId("publication-status");
      expect(notice).toHaveTextContent(dict.rankings.noResultsNotice);

      const form = screen.getByRole("form", { name: dict.rankings.formLabel });
      expect(
        notice.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(container).toContainElement(form);
      expect(screen.queryByRole("table")).toBeNull();
      expect(screen.getByText(dict.rankings.selectedSliceEmptyNotice)).toBeInTheDocument();
      expect(screen.queryByText(dict.rankings.selectMarketNotice)).toBeNull();
    },
  );

  it.each(LOCALES)(
    "structures the %s leaderboard as overall, market and category views before detailed controls",
    async (lang) => {
      const dict = getDict(lang);
      const { container } = render(
        await RankingsPage({
          params: Promise.resolve({ lang }),
          searchParams: Promise.resolve({}),
        }),
      );

      const viewNav = screen.getByRole("navigation", {
        name: dict.rankings.viewNavigationLabel,
      });
      expect(viewNav).toBeInTheDocument();
      expect(viewNav.querySelectorAll("a")).toHaveLength(3);

      const overall = container.querySelector("#overall-leaderboard");
      const markets = container.querySelector("#market-leaderboards");
      const categories = container.querySelector("#category-leaderboards");
      const form = screen.getByRole("form", { name: dict.rankings.formLabel });
      expect(overall).not.toBeNull();
      expect(markets).not.toBeNull();
      expect(categories).not.toBeNull();
      expect(overall!.querySelectorAll("[data-leaderboard-axis]")).toHaveLength(3);
      expect(markets!.querySelectorAll("[data-leaderboard-market]")).toHaveLength(COUNTRIES.length);
      expect(categories!.querySelectorAll("[data-leaderboard-family]")).toHaveLength(TASK_FAMILIES.length);
      const costState = overall!.querySelector(
        '[data-leaderboard-axis="cost"] .mica-leaderboard-axis-state',
      );
      expect(costState).toHaveTextContent(dict.rankings.costGlobalUnavailable);
      expect(costState).not.toHaveTextContent(dict.rankings.axisAwaiting);
      expect(markets!.querySelector("a")).toHaveAttribute("href", expect.stringContaining("#results"));
      expect(categories!.querySelector("a")).toHaveAttribute("href", expect.stringContaining("#results"));
      expect(
        categories!.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.queryByRole("table")).toBeNull();
    },
  );
});

describe("home outcome cards have an explicit editorial reading order", () => {
  it.each(LOCALES)("separates the %s axis title, measure and rule without repeating the title", async (lang) => {
    const dict = getDict(lang);
    const common = dict.common as unknown as Record<string, string>;
    const { container } = render(await HomePage({ params: Promise.resolve({ lang }) }));
    const cards = [...container.querySelectorAll(".mica-axis")];

    expect(cards).toHaveLength(3);
    cards.forEach((card, index) => {
      const axis = OUTCOME_AXES[index].id;
      const bar = card.querySelector(".mica-axis-bar");
      const heading = card.querySelector("h3");
      const measure = card.querySelector(".mica-axis-measure");
      const rule = card.querySelector(".mica-axis-rule");

      expect(bar).toHaveTextContent(
        `${String(index + 1).padStart(2, "0")} / ${String(OUTCOME_AXES.length).padStart(2, "0")}`,
      );
      expect(bar!.querySelector("span")).toHaveAttribute("aria-hidden", "true");
      expect(bar).not.toHaveTextContent(dict.outcomeAxes[axis].label);
      expect(heading).toHaveTextContent(dict.outcomeAxes[axis].label);
      expect(measure).toHaveTextContent(common.measurementLabel);
      expect(measure).toHaveTextContent(dict.outcomeAxes[axis].unit);
      expect(rule).toHaveTextContent(common.ruleLabel);
      expect(rule).toHaveTextContent(dict.outcomeAxes[axis].description);
      expect(measure!.compareDocumentPosition(rule!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });
});

describe("score-surface disclosures stay factual without the removed demo-ranking slogan", () => {
  it.each(LOCALES)("keeps the localized detail and removes both slogan fragments in %s", (lang) => {
    render(<DemoDisclosure lang={lang} />);
    const disclosure = screen.getByTestId("demo-disclosure");
    expect(disclosure).toBeInTheDocument();
    expect(disclosure).toHaveTextContent(getDict(lang).disclosure.defaultDetail);
    expect(disclosure).not.toHaveTextContent(/Illustrative demo data/i);
    expect(disclosure).not.toHaveTextContent(/Not an official ranking/i);
  });

  it("keeps the retired demo-ranking slogan out of the Open Graph card", () => {
    const source = readFileSync(join(process.cwd(), "src/app/opengraph-image.tsx"), "utf8");
    expect(source).not.toContain("Illustrative demo data");
    expect(source).not.toContain("Not an official ranking");
  });
});

describe("Korean detail routes", () => {
  it("localizes metadata for every public Korean index route", async () => {
    const params = () => Promise.resolve({ lang: "ko" });
    await expect(homeMetadata({ params: params() })).resolves.toMatchObject({
      title: `MICA — ${ko.site.longName}`,
      description: ko.site.definition,
      alternates: { canonical: "/ko" },
    });
    for (const [metadata, copy, path] of [
      [countriesMetadata, ko.countries, "/ko/countries"],
      [rankingsMetadata, ko.rankings, "/ko/rankings"],
      [agentsMetadata, ko.agents, "/ko/agents"],
      [tasksMetadata, ko.tasks, "/ko/tasks"],
      [evidenceMetadata, ko.evidence, "/ko/evidence"],
    ] as const) {
      await expect(metadata({ params: params() })).resolves.toMatchObject({
        title: copy.metaTitle,
        description: copy.metaDescription,
        alternates: { canonical: path },
      });
    }
    expect(ko.rankings.metaDescription).toMatch(/공개된 검증 결과가 없습니다/);
    expect(ko.agents.metaDescription).toMatch(/등록부는 비어 있습니다/);
    expect(ko.evidence.metaDescription).toMatch(/등록부는 비어 있습니다/);
  });

  it("keeps English index metadata factual and language-specific", async () => {
    const params = () => Promise.resolve({ lang: "en" });
    await expect(homeMetadata({ params: params() })).resolves.toMatchObject({
      title: `MICA — ${en.site.longName}`,
      description: en.site.definition,
      alternates: { canonical: "/" },
    });
    for (const [metadata, copy, path] of [
      [countriesMetadata, en.countries, "/countries"],
      [rankingsMetadata, en.rankings, "/rankings"],
      [agentsMetadata, en.agents, "/agents"],
      [tasksMetadata, en.tasks, "/tasks"],
      [evidenceMetadata, en.evidence, "/evidence"],
    ] as const) {
      await expect(metadata({ params: params() })).resolves.toMatchObject({
        title: copy.metaTitle,
        description: copy.metaDescription,
        alternates: { canonical: path },
      });
    }
    expect(en.rankings.metaDescription).toMatch(/no verified results/i);
    expect(en.agents.metaDescription).toMatch(/registry is empty/i);
    expect(en.evidence.metaDescription).toMatch(/registry is empty/i);
  });

  it("renders the methodology sections from the Korean dictionary", async () => {
    render(await MethodologyPage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: headingEndingWith(ko.methodology.axesTitle) })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: headingEndingWith(ko.methodology.publicationTitle) })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("The three outcome axes");
  });

  it("renders governance sections from the Korean dictionary", async () => {
    render(await GovernancePage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: ko.governance.rulesTitle })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: ko.governance.correctionsTitle })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("What MICA will not do");
    expect(document.body.textContent).not.toContain("demo-fixture");
    expect(document.body.textContent).not.toContain("Preview edition");
    expect(document.body.textContent).not.toContain("데이터 상태demo");
  });

  it("renders submission guidance from the Korean dictionary", async () => {
    render(await SubmitPage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: ko.submit.stepOneTitle })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: ko.submit.contactTitle })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("Declare the snapshot");
  });

  it("localizes metadata for all three Korean detail routes", async () => {
    await expect(
      methodologyMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.methodology.metaTitle,
      description: ko.methodology.metaDescription,
    });
    await expect(
      governanceMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.governance.metaTitle,
      description: ko.governance.metaDescription,
    });
    await expect(
      submitMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.submit.metaTitle,
      description: ko.submit.metaDescription,
    });
  });
});
