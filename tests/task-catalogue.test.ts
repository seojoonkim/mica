import { describe, it, expect } from "vitest";
import {
  COUNTRY_CODES,
  HoldoutLeakError,
  TASK_PROMOTION_FIELDS,
  assertNoHoldoutTasks,
  canonicalTaskSchema,
  isTaskPromotable,
  taskFamilyRecordSchema,
  toPublicTaskCatalogue,
} from "@/lib/schema";
import { PUBLIC_TASK_FAMILIES, TASK_CATALOGUE_STATUS, TASK_FAMILIES } from "@/data/demo/tasks";

/** The minimum a task record must carry, with no orthogonal metadata. */
function bareTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-task-1",
    title: "Test task",
    finalState: "A synthetic final state.",
    confirmationBoundary: "Stops before any irreversible action.",
    markets: [...COUNTRY_CODES],
    translations: {
      ko: {
        title: "테스트 작업",
        finalState: "합성 최종 상태.",
        confirmationBoundary: "되돌릴 수 없는 작업 전에 멈춘다.",
      },
    },
    ...overrides,
  };
}

const FULL_METADATA = {
  surface: "web",
  terminationClass: "completed-final-state",
  declaredComplexity: "multi-step",
  diagnosticAxes: ["orchestration"],
  marketApplicability: COUNTRY_CODES.map((market) => ({
    market,
    applicability: "applicable",
    note: "Synthetic test record.",
  })),
};

describe("task lifecycle defaults", () => {
  it("defaults an unannotated record to a public candidate", () => {
    const task = canonicalTaskSchema.parse(bareTask());
    expect(task.lifecycle).toBe("candidate");
    expect(task.taskSet).toBe("public");
  });

  it("lets a candidate omit the orthogonal promotion metadata", () => {
    const result = canonicalTaskSchema.safeParse(bareTask());
    expect(result.success).toBe(true);
    for (const field of TASK_PROMOTION_FIELDS) {
      expect(result.data![field]).toBeUndefined();
    }
  });
});

describe("promotion contract", () => {
  it("refuses a validated record that is missing promotion metadata", () => {
    const result = canonicalTaskSchema.safeParse(
      bareTask({ lifecycle: "validated" }),
    );
    expect(result.success).toBe(false);
    const issues = JSON.stringify(result.error?.issues);
    for (const field of TASK_PROMOTION_FIELDS) {
      expect(issues).toContain(`missing ${field}`);
    }
  });

  it("accepts a validated record that carries all of it", () => {
    const input = bareTask({ lifecycle: "validated", ...FULL_METADATA });
    expect(canonicalTaskSchema.safeParse(input).success).toBe(true);
    expect(isTaskPromotable(canonicalTaskSchema.parse(input))).toBe(true);
  });

  it("refuses applicability that omits a market or repeats one", () => {
    const partial = FULL_METADATA.marketApplicability.slice(1);
    expect(
      canonicalTaskSchema.safeParse(
        bareTask({
          lifecycle: "validated",
          ...FULL_METADATA,
          markets: COUNTRY_CODES.slice(1),
          marketApplicability: partial,
        }),
      ).success,
    ).toBe(false);
    expect(
      canonicalTaskSchema.safeParse(
        bareTask({
          lifecycle: "validated",
          ...FULL_METADATA,
          marketApplicability: [
            ...FULL_METADATA.marketApplicability,
            FULL_METADATA.marketApplicability[0],
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it("refuses a market list that disagrees with the applicability decisions", () => {
    expect(
      canonicalTaskSchema.safeParse(
        bareTask({
          lifecycle: "validated",
          ...FULL_METADATA,
          marketApplicability: FULL_METADATA.marketApplicability.map((entry) =>
            entry.market === "ae"
              ? { ...entry, applicability: "not-applicable" }
              : entry,
          ),
        }),
      ).success,
    ).toBe(false);
  });
});

describe("public versus holdout", () => {
  const family = (tasks: unknown[]) =>
    taskFamilyRecordSchema.parse({
      id: "email-calendar",
      label: "Test family",
      summary: "Synthetic family.",
      whyItIsHard: "Synthetic reason.",
      canonicalTasks: tasks,
    });

  it("drops holdout records from the public catalogue", () => {
    const source = family(
      Array.from({ length: 10 }, (_, index) =>
        bareTask({
          id: `test-task-${index + 1}`,
          taskSet: index < 3 ? "holdout" : "public",
        }),
      ),
    );
    const [publicFamily] = toPublicTaskCatalogue([source]);
    expect(source.canonicalTasks).toHaveLength(10);
    expect(publicFamily.canonicalTasks).toHaveLength(7);
    expect(
      publicFamily.canonicalTasks.every((task) => task.taskSet === "public"),
    ).toBe(true);
  });

  it("throws rather than publishing a holdout record that slipped through", () => {
    expect(() =>
      assertNoHoldoutTasks(
        [
          {
            id: "email-calendar",
            canonicalTasks: [canonicalTaskSchema.parse(bareTask({ taskSet: "holdout" }))],
          },
        ],
        "test export",
      ),
    ).toThrow(HoldoutLeakError);
  });
});

describe("shipped catalogue readiness", () => {
  it("exposes only public tasks through the public catalogue", () => {
    expect(() =>
      assertNoHoldoutTasks(PUBLIC_TASK_FAMILIES, "public task catalogue"),
    ).not.toThrow();
    expect(PUBLIC_TASK_FAMILIES).toHaveLength(TASK_FAMILIES.length);
  });

  it("counts every current task as an unvalidated candidate", () => {
    expect(TASK_CATALOGUE_STATUS.publicTasks).toBe(100);
    expect(TASK_CATALOGUE_STATUS.candidateTasks).toBe(100);
    expect(TASK_CATALOGUE_STATUS.validatedTasks).toBe(0);
  });

  it("registers no scoring reference against a provisional candidate", () => {
    for (const family of PUBLIC_TASK_FAMILIES) {
      for (const task of family.canonicalTasks) {
        expect(task).not.toHaveProperty("speedTargetSec");
        expect(task).not.toHaveProperty("costTargetUsd");
      }
    }
  });
});
