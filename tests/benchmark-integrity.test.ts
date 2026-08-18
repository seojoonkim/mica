import { describe, expect, it } from "vitest";
import { WIKI_CHAPTERS } from "@/data/methodology/wiki";

function chapter(id: string) {
  const value = WIKI_CHAPTERS.find((candidate) => candidate.id === id);
  expect(value, `missing methodology chapter: ${id}`).toBeDefined();
  return value!;
}

function entry(chapterId: string, entryId: string) {
  const value = chapter(chapterId).entries.find((candidate) => candidate.id === entryId);
  expect(value, `missing methodology entry: ${chapterId}/${entryId}`).toBeDefined();
  return value!;
}

describe("benchmark integrity contracts", () => {
  it("tests transfer beyond known task templates and services", () => {
    const contract = entry("task-authoring", "unseen-generalization");
    expect(contract.badge).toBe("current-rule");
    expect(contract.detail.en).toMatch(/unseen task famil|unseen service/i);
    expect(contract.detail.en).toMatch(/separately/i);
    expect(contract.detail.ko).toMatch(/처음 보는 과제 계열|처음 보는 서비스/);
    expect(contract.detail.ko).toMatch(/별도/);
  });

  it("prevents repeated submission and best-score selection", () => {
    const contract = entry("tracks-uncertainty", "submission-attempt-control");
    expect(contract.badge).toBe("current-rule");
    expect(contract.detail.en).toMatch(/pre-registered|declared/i);
    expect(contract.detail.en).toMatch(/all eligible|best score|cherry-pick/i);
    expect(contract.detail.ko).toMatch(/사전 등록|사전 선언/);
    expect(contract.detail.ko).toMatch(/모든 적격|최고점/);
  });

  it("classifies contamination and publishes clean-subset comparisons", () => {
    const classification = entry("public-set-holdout", "contamination-classification");
    expect(classification.badge).toBe("current-rule");
    expect(classification.detail.en).toMatch(/exposure/i);
    expect(classification.detail.en).toMatch(/memorization/i);
    expect(classification.detail.en).toMatch(/score exploitation/i);
    expect(classification.detail.ko).toMatch(/노출/);
    expect(classification.detail.ko).toMatch(/암기/);
    expect(classification.detail.ko).toMatch(/점수 악용/);

    const comparison = entry("public-set-holdout", "clean-subset-comparison");
    expect(comparison.badge).toBe("current-rule");
    expect(comparison.detail.en).toMatch(/clean-subset/i);
    expect(comparison.detail.ko).toMatch(/청정 부분집합/);
    expect(comparison.detail.ko).toMatch(/일반화 주장을 차단/);
  });

  it("discloses role conflicts and holdout access before publication", () => {
    const contract = entry("governance", "role-level-conflicts");
    expect(contract.badge).toBe("current-rule");
    for (const role of ["author", "reviewer", "evaluator", "funder"]) {
      expect(contract.detail.en).toMatch(new RegExp(role, "i"));
    }
    expect(contract.detail.en).toMatch(/holdout access/i);
    expect(contract.detail.ko).toMatch(/저작자/);
    expect(contract.detail.ko).toMatch(/검토자/);
    expect(contract.detail.ko).toMatch(/평가자/);
    expect(contract.detail.ko).toMatch(/자금 제공자/);
    expect(contract.detail.ko).toMatch(/홀드아웃 접근/);
  });
});
