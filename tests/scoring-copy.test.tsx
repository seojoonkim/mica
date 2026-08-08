import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";
import { getDict } from "@/lib/i18n/dictionary";
import MethodologyPage from "@/app/[lang]/methodology/page";
import TasksPage from "@/app/[lang]/tasks/page";
import RankingsPage from "@/app/[lang]/rankings/page";
import EvidenceIndexPage from "@/app/[lang]/evidence/page";
import GovernancePage from "@/app/[lang]/about/governance/page";
import HomePage from "@/app/[lang]/page";
import { WIKI_CHAPTERS } from "@/data/methodology/wiki";

/**
 * The public scoring contract, asserted on the strings the reader actually
 * sees. MICA publishes one multiplicative final score per validated task, keeps
 * the three raw axes separately disclosed, aggregates by arithmetic mean, and
 * still has no result of any kind. Each of those four is a promise that a later
 * copy edit could quietly break, so each is pinned here rather than left to a
 * reviewer's memory.
 */

const LOCALES = ["en", "ko"] as const;

/** Every string a reader can reach, flattened out of a dictionary. */
function publicStrings(dict: unknown): string[] {
  if (typeof dict === "string") return [dict];
  if (Array.isArray(dict)) return dict.flatMap(publicStrings);
  if (dict && typeof dict === "object") {
    return Object.values(dict as Record<string, unknown>).flatMap(publicStrings);
  }
  return [];
}

/**
 * Phrases from the superseded "three results, never one" policy. A match is a
 * public contradiction of the current contract, not a style problem, so the
 * assertion names the offending string.
 */
const RETIRED_POLICY_PHRASES = [
  /no composite score/i,
  /never will/i,
  /three results, never one/i,
  /never contributes to a combined/i,
  /will not accept one from a submitter/i,
  /종합\s?점수를 발표하지 않/,
  /결코 하나가 아니/,
  /결코 합쳐진 하나의 결과/,
  /숨겨진 종합점수/,
  /종합점수에 합치지/,
  /종합 점수는 없습니다/,
];

describe("no retired no-composite policy survives in public copy", () => {
  it.each(LOCALES)("carries no superseded phrase anywhere in the %s dictionary", (lang) => {
    const strings = publicStrings(getDict(lang));
    expect(strings.length).toBeGreaterThan(100);
    for (const value of strings) {
      for (const phrase of RETIRED_POLICY_PHRASES) {
        expect(
          phrase.test(value),
          `retired policy phrase ${phrase} in: ${value}`,
        ).toBe(false);
      }
    }
  });
});

describe("methodology states the per-task formula", () => {
  it.each(LOCALES)("renders the multiplicative formula and its components in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang }) }),
    );

    const formula = container.querySelector("[data-score-formula]");
    expect(formula).not.toBeNull();
    expect(formula).toHaveTextContent("100 ×");
    expect(formula).toHaveTextContent("×");
    expect(formula).toHaveTextContent(dict.methodology.scoringFormula);
    // Normalized components, explicitly not raw seconds or raw dollars.
    expect(formula).toHaveTextContent(dict.methodology.scoringFormulaNote);

    const components = container.querySelector("[data-score-components]");
    expect(components).not.toBeNull();
    for (const component of dict.methodology.scoringComponents) {
      expect(components).toHaveTextContent(component.term);
      expect(components).toHaveTextContent(component.detail);
    }
  });

  it.each(LOCALES)("states arithmetic aggregation and null exclusion in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang }) }),
    );
    const semantics = container.querySelector("[data-score-semantics]");

    expect(semantics).toHaveTextContent(dict.methodology.scoringAggregationDetail);
    expect(semantics).toHaveTextContent(/arithmetic mean|산술평균/);
    // A missing or ineligible task is excluded with a reason, never a zero.
    expect(semantics).toHaveTextContent(dict.methodology.scoringExclusionDetail);
    expect(semantics).toHaveTextContent(/never counted as a zero|0으로 세지 않/);
  });

  it.each(LOCALES)("keeps raw axes separately disclosed and cost defined as evaluation spend in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang }) }),
    );
    const semantics = container.querySelector("[data-score-semantics]");

    expect(semantics).toHaveTextContent(dict.methodology.scoringRawDetail);
    expect(semantics).toHaveTextContent(dict.methodology.scoringCostDetail);
    expect(semantics).toHaveTextContent(/USD/);
    expect(semantics).toHaveTextContent(
      /not the price of an item|상품 가격, 예약 금액, 거래 금액이 아니/,
    );
  });

  it.each(LOCALES)("leaves the cross-market overall undefined rather than inventing a weighting in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang }) }),
    );
    expect(container.querySelector("[data-score-semantics]")).toHaveTextContent(
      dict.methodology.scoringOverallDetail,
    );
    expect(dict.methodology.scoringOverallDetail).toMatch(
      /not defined|정의되어 있지 않/i,
    );
  });

  it.each(LOCALES)("permits and requires disclosure of per-task model routing in %s", async (lang) => {
    const { container } = render(
      await MethodologyPage({ params: Promise.resolve({ lang }) }),
    );
    const routing = container.querySelector("[data-model-routing]");
    const chapter = WIKI_CHAPTERS.find((item) => item.id === "model-routing");

    expect(routing).not.toBeNull();
    expect(chapter).toBeDefined();
    for (const item of chapter!.entries) {
      expect(routing).toHaveTextContent(item.detail[lang]);
    }
    expect(routing).toHaveTextContent(/provider|공급자/);
    expect(routing).toHaveTextContent(/tokens|토큰/);
  });
});

describe("tasks page pairs the scoring contract with an unscored catalogue", () => {
  it.each(LOCALES)("shows the formula and says nothing here is scored in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await TasksPage({ params: Promise.resolve({ lang }) }),
    );

    expect(container.querySelector("[data-score-formula]")).toHaveTextContent(
      dict.tasks.scoringFormula,
    );
    expect(container.querySelector("[data-score-semantics]")).toHaveTextContent(
      dict.tasks.scoringStatusDetail,
    );
    // The 100 definitions are provisional candidates with no references.
    expect(dict.tasks.scoringIntro).toMatch(
      /provisional candidates|잠정 후보/,
    );
    expect(dict.tasks.scoringStatusDetail).toMatch(
      /no .*reference|기준값이 없/i,
    );
    expect(screen.getByTestId("publication-status")).toHaveTextContent(
      dict.tasks.publicationStatus,
    );
  });

  it.each(LOCALES)("still lists the three raw axes beside the score in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await TasksPage({ params: Promise.resolve({ lang }) }),
    );
    const raw = container.querySelector("[data-raw-axes]");

    expect(raw).not.toBeNull();
    for (const axis of ["accuracy", "speed", "cost"] as const) {
      expect(raw).toHaveTextContent(dict.outcomeAxes[axis].label);
      expect(raw).toHaveTextContent(dict.outcomeAxes[axis].unit);
    }
    expect(container.querySelector("[data-score-semantics]")).toHaveTextContent(
      dict.tasks.scoringRawDetail,
    );
  });

  it.each(LOCALES)("states that a task may route to several models in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await TasksPage({ params: Promise.resolve({ lang }) }),
    );
    expect(container.querySelector("[data-score-semantics]")).toHaveTextContent(
      dict.tasks.scoringRoutingDetail,
    );
    expect(dict.tasks.scoringRoutingDetail).toMatch(/several|여러/);
  });
});

describe("rankings publishes the aggregation architecture and no figure", () => {
  it.each(LOCALES)("describes category and country means without an overall score in %s", async (lang) => {
    const dict = getDict(lang);
    const { container } = render(
      await RankingsPage({
        params: Promise.resolve({ lang }),
        searchParams: Promise.resolve({}),
      }),
    );
    const architecture = container.querySelector("[data-score-architecture]");

    expect(architecture).not.toBeNull();
    for (const item of dict.rankings.scoreItems) {
      expect(architecture).toHaveTextContent(item.detail);
    }
    expect(architecture).toHaveTextContent(/arithmetic mean|산술평균/);
    // No table, no row, no number: the architecture is described, not filled.
    expect(screen.queryByRole("table")).toBeNull();
    expect(dict.rankings.scoreIntro).toMatch(
      /no system has been measured|측정된 시스템이 없/i,
    );
  });
});

describe("evidence names what a scored record will have to carry", () => {
  it.each(LOCALES)("requires route lineage and raw components in future evidence in %s", async (lang) => {
    const dict = getDict(lang);
    render(
      await EvidenceIndexPage({
        params: Promise.resolve({ lang }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(document.body.textContent).toContain(dict.evidence.futureDetail);
    // And is explicit that today's aggregate fixtures contain none of it.
    expect(document.body.textContent).toContain(dict.evidence.futureGapDetail);
    expect(dict.evidence.futureGapDetail).toMatch(
      /no per-task route lineage|과제별 호출 계보도/,
    );
  });
});

describe("standing commitments survive the scoring change", () => {
  it.each(LOCALES)("keeps the governance refusals and open independence gaps in %s", async (lang) => {
    const dict = getDict(lang);
    render(await GovernancePage({ params: Promise.resolve({ lang }) }));
    const text = document.body.textContent ?? "";

    // The score is derivable-or-not-published, and a submitter's own score is
    // still refused: the refusal moved, it did not disappear.
    expect(text).toContain(dict.governance.rules[0]);
    expect(text).toContain(dict.governance.rules[1]);
    expect(dict.governance.rules[1]).toMatch(/submitter|제출자/);
    // Public/holdout separation and unresolved neutrality stay on the page.
    expect(text).toContain(dict.governance.independenceSetsDetail);
    expect(text).toContain(dict.governance.independenceStatusDetail);
  });

  it.each(LOCALES)("still reports zero measured systems and zero results on the %s home page", async (lang) => {
    const dict = getDict(lang);
    render(await HomePage({ params: Promise.resolve({ lang }) }));

    expect(screen.getByTestId("publication-status")).toHaveTextContent(
      dict.home.publicationStatus,
    );
    expect(document.body.textContent).toContain(dict.home.noResultsHeadline);
    expect(screen.queryAllByRole("table")).toHaveLength(0);
  });
});

describe("Korean scoring copy follows the house rules", () => {
  it("avoids the em dash in the strings added for scoring", () => {
    const koScoring = [
      ko.methodology.scoringIntro,
      ko.methodology.scoringFormulaNote,
      ko.methodology.scoringAggregationDetail,
      ko.methodology.scoringOverallDetail,
      ko.methodology.scoringExclusionDetail,
      ko.methodology.scoringRawDetail,
      ko.methodology.scoringCostDetail,
      ko.methodology.scoringStatusDetail,
      ko.methodology.routingIntro,
      ko.tasks.scoringIntro,
      ko.tasks.scoringRawDetail,
      ko.tasks.scoringRoutingDetail,
      ko.rankings.scoreIntro,
      ko.evidence.futureDetail,
      ko.evidence.futureGapDetail,
      ...ko.methodology.scoringComponents.map((item) => item.detail),
      ...ko.methodology.routingItems.map((item) => item.detail),
      ...ko.tasks.scoringComponents.map((item) => item.detail),
      ...ko.rankings.scoreItems.map((item) => item.detail),
    ];

    for (const value of koScoring) {
      expect(value, `em dash in: ${value}`).not.toContain("—");
    }
  });

  it("translates rather than echoes the English scoring copy", () => {
    expect(ko.methodology.scoringTitle).not.toBe(en.methodology.scoringTitle);
    expect(ko.tasks.scoringIntro).not.toBe(en.tasks.scoringIntro);
    expect(ko.rankings.scoreTitle).not.toBe(en.rankings.scoreTitle);
    // The formula itself is notation and stays identical apart from the labels.
    expect(en.methodology.scoringFormula).toContain("100 ×");
    expect(ko.methodology.scoringFormula).toContain("100 ×");
  });
});
