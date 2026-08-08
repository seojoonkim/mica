import { describe, it, expect } from "vitest";
import {
  modelInvocationSchema,
  runCellSchema,
  taskAttemptResultSchema,
  taskAttemptScore,
  taskAttemptScoreEntry,
  type TaskAttemptResult,
} from "@/lib/schema";
import { aggregateTaskScores } from "@/lib/score";

function invocation(overrides: Record<string, unknown> = {}) {
  return {
    order: 1,
    provider: "test-provider",
    modelId: "test-model",
    modelVersion: "2026-01-01-snapshot",
    purpose: "plan",
    inputTokens: 1200,
    outputTokens: 300,
    latencySec: 4,
    costUsd: 0.02,
    ...overrides,
  };
}

/**
 * A coherent attempt. Each case mutates exactly one axis of this record, so a
 * rejection can only be attributed to that contradiction. The numbers are
 * synthetic unit-test scaffolding and describe no system and no real run.
 */
function attempt(overrides: Record<string, unknown> = {}) {
  return {
    attemptId: "test-attempt-1",
    system: "test-system-1",
    systemSnapshotVersion: "0.0.1",
    market: "kr",
    family: "email-calendar",
    taskId: "test-task-1",
    taskVersion: "v1",
    outcome: "confirmed-success",
    observedLatencySec: 120,
    modelCostUsd: 0.05,
    toolApiCostUsd: 0.01,
    observedCostUsd: 0.06,
    scoringReferences: { speedTargetSec: 60, costTargetUsd: 0.03 },
    modelInvocations: [
      invocation(),
      invocation({
        order: 2,
        provider: "other-provider",
        modelId: "other-model",
        purpose: "verify",
        costUsd: 0.03,
        latencySec: 9,
      }),
    ],
    dataStatus: "demo",
    publicationEligible: false,
    ...overrides,
  };
}

const parse = (input: Record<string, unknown>) =>
  taskAttemptResultSchema.safeParse(input);

describe("model invocation evidence", () => {
  it("requires provider, model identity, tokens, latency and cost", () => {
    expect(modelInvocationSchema.safeParse(invocation()).success).toBe(true);
    for (const field of [
      "provider",
      "modelId",
      "modelVersion",
      "purpose",
    ] as const) {
      expect(
        modelInvocationSchema.safeParse(invocation({ [field]: "" })).success,
      ).toBe(false);
    }
    expect(
      modelInvocationSchema.safeParse(invocation({ inputTokens: -1 })).success,
    ).toBe(false);
    expect(
      modelInvocationSchema.safeParse(invocation({ costUsd: -0.01 })).success,
    ).toBe(false);
    expect(
      modelInvocationSchema.safeParse(invocation({ latencySec: Number.NaN }))
        .success,
    ).toBe(false);
  });
});

describe("task attempt routing evidence", () => {
  it("accepts a coherent attempt with several models in one task", () => {
    const result = parse(attempt());
    expect(result.success).toBe(true);
    expect(
      new Set(result.data!.modelInvocations.map((call) => call.modelId)).size,
    ).toBe(2);
  });

  it("accepts a single-invocation attempt — no minimum route length", () => {
    expect(
      parse(
        attempt({
          modelCostUsd: 0.02,
          observedCostUsd: 0.03,
          modelInvocations: [invocation()],
        }),
      ).success,
    ).toBe(true);
  });

  it("lets each task pick a different model, with no global model assumption", () => {
    const first = parse(attempt()).data!;
    const second = parse(
      attempt({
        attemptId: "test-attempt-2",
        taskId: "test-task-2",
        modelCostUsd: 0.02,
        observedCostUsd: 0.03,
        modelInvocations: [
          invocation({ provider: "third-provider", modelId: "third-model" }),
        ],
      }),
    ).data!;
    expect(first.modelInvocations[0].modelId).not.toBe(
      second.modelInvocations[0].modelId,
    );
  });

  it("requires at least one recorded invocation — routing is never implicit", () => {
    expect(
      parse(attempt({ modelCostUsd: 0, observedCostUsd: 0.01, modelInvocations: [] }))
        .success,
    ).toBe(false);
  });

  it("rejects repeated, gapped or out-of-sequence invocation orders", () => {
    for (const orders of [
      [1, 1],
      [1, 3],
      [2, 1],
    ]) {
      const result = parse(
        attempt({
          modelInvocations: [
            invocation({ order: orders[0] }),
            invocation({ order: orders[1], costUsd: 0.03 }),
          ],
        }),
      );
      expect(result.success).toBe(false);
      expect(JSON.stringify(result.error?.issues)).toContain("modelInvocations");
    }
  });
});

describe("task attempt cost and outcome invariants", () => {
  it("keeps a zero-cost raw record but marks its derived audit score unmeasured", () => {
    const parsed = parse(
      attempt({
        modelCostUsd: 0,
        toolApiCostUsd: 0,
        observedCostUsd: 0,
        modelInvocations: [invocation({ costUsd: 0 })],
      }),
    );
    expect(parsed.success).toBe(true);
    expect(taskAttemptScore(parsed.data!)).toBeNull();
    expect(taskAttemptScoreEntry(parsed.data!)).toMatchObject({
      finalScore: null,
      exclusionReason: "evaluation execution cost was not measured",
    });
  });

  it("requires invocation costs to sum exactly to the recorded model cost", () => {
    expect(parse(attempt({ modelCostUsd: 0.04 })).success).toBe(false);
    expect(parse(attempt({ modelCostUsd: 0.09 })).success).toBe(false);
  });

  it("requires the total to cover model plus tool/API cost", () => {
    expect(parse(attempt({ observedCostUsd: 0.05 })).success).toBe(false);
    expect(parse(attempt({ toolApiCostUsd: 0.02 })).success).toBe(false);
  });

  it("defaults tool/API cost to zero rather than guessing it", () => {
    const result = parse(
      attempt({ toolApiCostUsd: undefined, observedCostUsd: 0.05 }),
    );
    expect(result.success).toBe(true);
    expect(result.data!.toolApiCostUsd).toBe(0);
  });

  it("rejects negative and non-finite money and latency", () => {
    expect(parse(attempt({ toolApiCostUsd: -0.01 })).success).toBe(false);
    expect(parse(attempt({ observedLatencySec: 0 })).success).toBe(false);
    expect(parse(attempt({ observedLatencySec: Number.NaN })).success).toBe(false);
  });

  it("rejects an invocation slower than the attempt containing it", () => {
    expect(
      parse(
        attempt({
          modelInvocations: [
            invocation({ latencySec: 200 }),
            invocation({ order: 2, costUsd: 0.03 }),
          ],
        }),
      ).success,
    ).toBe(false);
  });

  it("requires pre-registered positive scoring references", () => {
    expect(
      parse(attempt({ scoringReferences: { speedTargetSec: 0, costTargetUsd: 0.03 } }))
        .success,
    ).toBe(false);
    expect(
      parse(attempt({ scoringReferences: { speedTargetSec: 60, costTargetUsd: 0 } }))
        .success,
    ).toBe(false);
    expect(parse(attempt({ scoringReferences: undefined })).success).toBe(false);
  });

  it("keeps a stored accuracy mirror aligned with the outcome", () => {
    expect(parse(attempt({ accuracy: 1 })).success).toBe(true);
    expect(parse(attempt({ accuracy: 0 })).success).toBe(false);
    expect(
      parse(attempt({ outcome: "incomplete", accuracy: 1 })).success,
    ).toBe(false);
    expect(
      parse(attempt({ outcome: "incomplete", accuracy: 0 })).success,
    ).toBe(true);
  });

  it("stores no final score field, so a score cannot go stale", () => {
    const parsed = parse(attempt()).data!;
    expect(Object.keys(parsed)).not.toContain("finalScore");
    expect(Object.keys(parsed)).not.toContain("score");
  });
});

describe("aggregate evidence and currency lineage", () => {
  const artifact = {
    attemptId: "test-attempt-1",
    taskId: "test-task-1",
    taskVersion: "v1",
    redactedTraceId: "trace-test-attempt-1",
    finalStateEvidenceId: "evidence-test-attempt-1",
    invocationRecordIds: ["invocation-test-attempt-1-1"],
    artifactSha256: "a".repeat(64),
  };

  const cell = (overrides: Record<string, unknown> = {}) => ({
    system: "test-system-1",
    country: "kr",
    family: "email-calendar",
    eligibleRuns: 1,
    successfulRuns: 1,
    tasksAttempted: 1,
    tasksDefined: 1,
    successLatenciesSec: [120],
    allEligibleLatenciesSec: [120],
    totalEligibleCostUsd: 0.06,
    attemptArtifacts: [artifact],
    criticalSafetyEvents: 0,
    dataStatus: "demo",
    publicationEligible: false,
    ...overrides,
  });

  it("requires canonical aggregate execution cost in USD", () => {
    expect(runCellSchema.safeParse(cell()).success).toBe(true);
    expect(runCellSchema.safeParse(cell({ totalEligibleCostUsd: undefined })).success).toBe(false);
    expect(runCellSchema.safeParse(cell({ totalEligibleCost: 1000, totalEligibleCostUsd: undefined })).success).toBe(false);
  });

  it("requires one immutable artifact manifest per eligible attempt", () => {
    expect(runCellSchema.safeParse(cell({ attemptArtifacts: [] })).success).toBe(false);
    expect(runCellSchema.safeParse(cell({ attemptArtifacts: [artifact, artifact] })).success).toBe(false);
    expect(runCellSchema.safeParse(cell({ attemptArtifacts: [{ ...artifact, artifactSha256: "bad" }] })).success).toBe(false);
  });

  it("publishes only bounded opaque evidence identifiers", () => {
    for (const attemptId of ["person@example.com", "contains space", "x".repeat(65)]) {
      expect(runCellSchema.safeParse(cell({
        attemptArtifacts: [{ ...artifact, attemptId }],
      })).success).toBe(false);
    }
    expect(runCellSchema.safeParse(cell({
      eligibleRuns: 2,
      successfulRuns: 2,
      successLatenciesSec: [120, 121],
      allEligibleLatenciesSec: [120, 121],
      attemptArtifacts: [artifact, { ...artifact, attemptId: "test-attempt-2" }],
    })).success).toBe(true);
  });
});

describe("derived attempt score", () => {
  it("derives the score from the raw evidence on the record", () => {
    const parsed = parse(attempt()).data!;
    const score = taskAttemptScore(parsed);
    expect(score).not.toBeNull();
    // speed 60/120 = 0.5; cost 0.03/0.06 = 0.5; accuracy 1.
    expect(score!.finalScore).toBeCloseTo(25, 12);
    // The raw numbers stay visible alongside the score.
    expect(parsed.observedLatencySec).toBe(120);
    expect(parsed.observedCostUsd).toBeCloseTo(0.06, 12);
  });

  it("scores every non-success outcome zero, however fast or cheap", () => {
    for (const outcome of [
      "incorrect-final-state",
      "incomplete",
      "boundary-violation",
      "tool-or-api-failure",
      "refused-in-scope-request",
      "timeout",
      "aborted",
    ]) {
      const parsed = parse(
        attempt({
          outcome,
          observedLatencySec: 1,
          modelCostUsd: 0.000001,
          toolApiCostUsd: 0,
          observedCostUsd: 0.000001,
          modelInvocations: [invocation({ costUsd: 0.000001, latencySec: 0.5 })],
        }),
      ).data!;
      expect(taskAttemptScore(parsed)?.finalScore).toBe(0);
    }
  });

  it("excludes an ineligible attempt from aggregation instead of zeroing it", () => {
    const eligible = parse(attempt()).data as TaskAttemptResult;
    const ineligible = parse(
      attempt({ attemptId: "test-attempt-2", taskId: "test-task-2", eligible: false }),
    ).data as TaskAttemptResult;

    const entries = [eligible, ineligible].map(taskAttemptScoreEntry);
    expect(entries[1].finalScore).toBeNull();

    const aggregate = aggregateTaskScores(entries);
    expect(aggregate.mean).toBeCloseTo(25, 12);
    expect(aggregate.excluded).toHaveLength(1);
  });
});
