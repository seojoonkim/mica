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
const BASE_MEASUREMENT = {
  version: "1.0.0",
  accuracy: {
    scoring: "all-required-binary",
    criteria: [
      {
        id: "final-state",
        description: "The declared final state is confirmed.",
        evidence: "Authoritative post-action readback.",
        required: true,
      },
      {
        id: "boundary",
        description: "The confirmation boundary is respected.",
        evidence: "Action log contains no prohibited state change.",
        required: true,
      },
    ],
  },
  speed: {
    clock: "wall-clock",
    startEvent: "Evaluator releases the task prompt and credentials.",
    stopEvent: "The evaluator records a terminal outcome and final evidence.",
    timeoutSec: 900,
    population: "all-eligible-attempts",
  },
  cost: {
    currency: "USD",
    included: ["model-inference", "tool-api-fees"],
    excluded: ["transaction-value"],
    zeroCostPolicy: "record-zero",
  },
  references: {
    status: "calibration-pending",
    speedTargetSec: null,
    costTargetUsd: null,
    method: "pilot-median",
    sampleSize: 0,
  },
};

function bareTask(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-task-1",
    title: "Test task",
    finalState: "A synthetic final state.",
    confirmationBoundary: "Stops before any irreversible action.",
    markets: [...COUNTRY_CODES],
    measurement: BASE_MEASUREMENT,
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

describe("measurement contract schema", () => {
  it("accepts an auditable calibration-pending contract", () => {
    expect(
      canonicalTaskSchema.safeParse(bareTask({ measurement: BASE_MEASUREMENT })).success,
    ).toBe(true);
  });

  it("rejects duplicate accuracy criteria", () => {
    const duplicate = {
      ...BASE_MEASUREMENT,
      accuracy: {
        ...BASE_MEASUREMENT.accuracy,
        criteria: [
          BASE_MEASUREMENT.accuracy.criteria[0],
          BASE_MEASUREMENT.accuracy.criteria[0],
        ],
      },
    };
    expect(canonicalTaskSchema.safeParse(bareTask({ measurement: duplicate })).success).toBe(
      false,
    );
  });

  it("rejects identical speed start and stop events", () => {
    const invalid = {
      ...BASE_MEASUREMENT,
      speed: {
        ...BASE_MEASUREMENT.speed,
        stopEvent: BASE_MEASUREMENT.speed.startEvent,
      },
    };
    expect(canonicalTaskSchema.safeParse(bareTask({ measurement: invalid })).success).toBe(
      false,
    );
  });

  it("rejects target numbers before references are registered", () => {
    const invalid = {
      ...BASE_MEASUREMENT,
      references: {
        ...BASE_MEASUREMENT.references,
        speedTargetSec: 60,
      },
    };
    expect(canonicalTaskSchema.safeParse(bareTask({ measurement: invalid })).success).toBe(
      false,
    );
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

  it("accepts a validated record with calibrated references and full metadata", () => {
    const measurement = {
      ...BASE_MEASUREMENT,
      references: {
        status: "registered",
        speedTargetSec: 300,
        costTargetUsd: 0.25,
        method: "pilot-median",
        sampleSize: 30,
      },
    };
    const input = bareTask({
      lifecycle: "validated",
      ...FULL_METADATA,
      measurement,
    });
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

  it("gives every candidate an auditable accuracy, speed, and cost contract", () => {
    for (const family of PUBLIC_TASK_FAMILIES) {
      for (const task of family.canonicalTasks) {
        const contract = task.measurement;

        expect(contract.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(contract.accuracy.scoring).toBe("all-required-binary");
        expect(contract.accuracy.criteria.length).toBeGreaterThanOrEqual(2);
        expect(contract.accuracy.criteria.length).toBeLessThanOrEqual(8);
        expect(new Set(contract.accuracy.criteria.map((criterion) => criterion.id)).size).toBe(
          contract.accuracy.criteria.length,
        );
        expect(
          contract.accuracy.criteria.every(
            (criterion) =>
              criterion.required &&
              criterion.description.length > 0 &&
              criterion.evidence.length > 0,
          ),
        ).toBe(true);

        expect(contract.speed.clock).toBe("wall-clock");
        expect(contract.speed.startEvent.length).toBeGreaterThan(0);
        expect(contract.speed.stopEvent.length).toBeGreaterThan(0);
        expect(contract.speed.startEvent).not.toBe(contract.speed.stopEvent);
        expect(contract.speed.timeoutSec).toBeGreaterThan(0);
        expect(contract.speed.population).toBe("all-eligible-attempts");

        expect(contract.cost.currency).toBe("USD");
        expect(contract.cost.included).toEqual(["model-inference", "tool-api-fees"]);
        expect(contract.cost.excluded).toContain("transaction-value");
        expect(contract.cost.zeroCostPolicy).toBe("record-zero");

        expect(contract.references.status).toBe("calibration-pending");
        expect(contract.references.speedTargetSec).toBeNull();
        expect(contract.references.costTargetUsd).toBeNull();
      }
    }
  });

  it("registers no scoring reference against a provisional candidate", () => {
    for (const family of PUBLIC_TASK_FAMILIES) {
      for (const task of family.canonicalTasks) {
        expect(task.measurement.references).toEqual({
          status: "calibration-pending",
          speedTargetSec: null,
          costTargetUsd: null,
          method: "pilot-median",
          sampleSize: 0,
        });
      }
    }
  });
});
