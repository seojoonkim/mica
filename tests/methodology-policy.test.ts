import { describe, expect, it } from "vitest";
import { PER_TASK_SCORE_COMPONENTS } from "@/data/policy/axes";
import { PUBLICATION_RULES, THRESHOLDS_NOT_SET } from "@/data/policy/publication";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";

describe("preview scoring and publication policy", () => {
  it("demotes the composite score while references and uncertainty are uncalibrated", () => {
    expect(en.home.axesTitle).toMatch(/derived/);
    expect(en.methodology.scoringIntro).toMatch(/headline/);
    expect(en.methodology.limits.join(" ")).toMatch(/local reference/);
    expect(ko.home.axesTitle).toMatch(/파생/);
    expect(ko.methodology.scoringIntro).toMatch(/대표/);
    expect(ko.methodology.limits.join(" ")).toMatch(/현지 기준/);
  });

  it("defines one attempt as the scoring unit and refuses zero cost", () => {
    expect(PER_TASK_SCORE_COMPONENTS.every((component) => component.unit === "eligible-attempt")).toBe(true);
    expect(PER_TASK_SCORE_COMPONENTS.find((component) => component.axis === "cost")?.rule).toMatch(/not measured/);
  });

  it("fails publication closed for incomplete coverage, safety blocks and unset repeatability rules", () => {
    expect(PUBLICATION_RULES.requiresCompleteCanonicalSet).toBe(true);
    expect(PUBLICATION_RULES.safetyBlockScope).toBe("aggregate-withheld");
    expect(PUBLICATION_RULES.minRunsPerTask).toBeNull();
    expect(PUBLICATION_RULES.maxIneligibleDiscardRate).toBeNull();
    expect(THRESHOLDS_NOT_SET).toMatch(/runs per task/);
    expect(en.thresholdsNotSet).toMatch(
      /runs per task.*minimum cell sample size.*task coverage.*maximum ineligible discard rate/,
    );
    expect(ko.thresholdsNotSet).toMatch(
      /과제별 실행 횟수.*최소 셀 표본 크기.*과제 커버리지.*최대 부적격 제외율/,
    );
  });
});
