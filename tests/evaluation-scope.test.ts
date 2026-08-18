import { describe, expect, it } from "vitest";
import { parseEvaluationScope, summarizeEvaluationScope } from "@/lib/evaluation-scope";
import { COUNTRIES } from "@/data/demo/countries";
import { PUBLIC_TASK_FAMILIES } from "@/data/demo/tasks";


describe("evaluation scope planner", () => {
  it("parses a country-focused scope in canonical order and drops unknowns", () => {
    const scope = parseEvaluationScope({ mode: "country-focused", countries: ["sg", "kr", "sg", "nope"] });
    expect(scope).toEqual({ mode: "country-focused", countries: ["kr", "sg"], tasks: PUBLIC_TASK_FAMILIES.flatMap((f) => f.canonicalTasks.map((t) => t.id)), valid: true });
  });

  it("supports task-focused cross-market and public tasks only", () => {
    const scope = parseEvaluationScope({ mode: "task-focused", countries: ["tw"], tasks: ["sd-constrained-basket", "sd-constrained-basket", "private-task"] });
    expect(scope.countries).toEqual(COUNTRIES.map((c) => c.code));
    expect(scope.tasks).toEqual(["sd-constrained-basket"]);
  });

  it("fails closed for an empty custom matrix", () => {
    const scope = parseEvaluationScope({ mode: "custom", countries: [], tasks: [] });
    expect(scope.valid).toBe(false);
    expect(scope.countries).toEqual([]);
    expect(scope.tasks).toEqual([]);
  });

  it("expands the full benchmark from canonical public catalogues", () => {
    const scope = parseEvaluationScope({ mode: "full-benchmark", countries: ["unknown"], tasks: ["private"] });
    expect(scope.valid).toBe(true);
    expect(scope.countries).toEqual(COUNTRIES.map((country) => country.code));
    expect(scope.tasks).toEqual(PUBLIC_TASK_FAMILIES.flatMap((family) => family.canonicalTasks.map((task) => task.id)));
  });

  it("derives market eligibility without inventing execution", () => {
    const scope = parseEvaluationScope({ mode: "custom", countries: ["kr"], tasks: ["sd-constrained-basket"] });
    expect(summarizeEvaluationScope(scope)).toEqual({ planned: 1, executionEligible: 1, executed: 0, failed: 0, harnessFailed: 0, notApplicable: 0 });
  });

  it("reports the full public universe as eligible while keeping every run status empty", () => {
    const scope = parseEvaluationScope({ mode: "full-benchmark" });
    expect(summarizeEvaluationScope(scope)).toEqual({ planned: 600, executionEligible: 600, executed: 0, failed: 0, harnessFailed: 0, notApplicable: 0 });
  });
});
