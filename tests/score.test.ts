import { describe, it, expect } from "vitest";
import {
  MAX_TASK_SCORE,
  accuracyComponent,
  aggregateTaskScores,
  costComponent,
  countryScore,
  familyScore,
  scoreTaskAttempt,
  speedComponent,
  type TaskScoreEntry,
} from "@/lib/score";

const REFERENCES = { speedTargetSec: 60, costTargetUsd: 0.5 };

describe("accuracyComponent", () => {
  it("is binary, with no partial credit", () => {
    expect(accuracyComponent(true)).toBe(1);
    expect(accuracyComponent(false)).toBe(0);
  });
});

describe("speedComponent", () => {
  it("is the target over the observation, capped at 1", () => {
    expect(speedComponent(120, 60)).toBeCloseTo(0.5, 12);
    expect(speedComponent(60, 60)).toBe(1);
    expect(speedComponent(6, 60)).toBe(1);
  });

  it("rejects a non-positive or non-finite latency", () => {
    expect(() => speedComponent(0, 60)).toThrow(RangeError);
    expect(() => speedComponent(-1, 60)).toThrow(RangeError);
    expect(() => speedComponent(Number.NaN, 60)).toThrow(RangeError);
    expect(() => speedComponent(Number.POSITIVE_INFINITY, 60)).toThrow(RangeError);
  });

  it("rejects a non-positive speed reference", () => {
    expect(() => speedComponent(60, 0)).toThrow(RangeError);
    expect(() => speedComponent(60, -60)).toThrow(RangeError);
  });
});

describe("costComponent", () => {
  it("scores a free attempt 1", () => {
    expect(costComponent(0, 0.5)).toBe(1);
  });

  it("is the target over the observation, capped at 1", () => {
    expect(costComponent(1, 0.5)).toBeCloseTo(0.5, 12);
    expect(costComponent(0.25, 0.5)).toBe(1);
  });

  it("rejects negative or non-finite cost and a non-positive reference", () => {
    expect(() => costComponent(-0.01, 0.5)).toThrow(RangeError);
    expect(() => costComponent(Number.NaN, 0.5)).toThrow(RangeError);
    expect(() => costComponent(0.5, 0)).toThrow(RangeError);
  });
});

describe("scoreTaskAttempt", () => {
  it("multiplies the three components and scales to 100", () => {
    const score = scoreTaskAttempt(
      { success: true, observedLatencySec: 120, observedCostUsd: 1 },
      REFERENCES,
    );
    expect(score.accuracyComponent).toBe(1);
    expect(score.speedComponent).toBeCloseTo(0.5, 12);
    expect(score.costComponent).toBeCloseTo(0.5, 12);
    expect(score.finalScore).toBeCloseTo(25, 12);
  });

  it("awards the maximum only for a fast, free, successful attempt", () => {
    const score = scoreTaskAttempt(
      { success: true, observedLatencySec: 30, observedCostUsd: 0 },
      REFERENCES,
    );
    expect(score.finalScore).toBe(MAX_TASK_SCORE);
  });

  it("scores a fast, cheap failure exactly zero", () => {
    const score = scoreTaskAttempt(
      { success: false, observedLatencySec: 1, observedCostUsd: 0 },
      REFERENCES,
    );
    expect(score.accuracyComponent).toBe(0);
    expect(score.speedComponent).toBe(1);
    expect(score.costComponent).toBe(1);
    expect(score.finalScore).toBe(0);
  });

  it("stays within [0, 100] across a wide sweep of observations", () => {
    for (const success of [true, false]) {
      for (const latency of [0.001, 1, 60, 1e6]) {
        for (const cost of [0, 1e-9, 0.5, 1e6]) {
          const { finalScore } = scoreTaskAttempt(
            { success, observedLatencySec: latency, observedCostUsd: cost },
            REFERENCES,
          );
          expect(finalScore).toBeGreaterThanOrEqual(0);
          expect(finalScore).toBeLessThanOrEqual(MAX_TASK_SCORE);
        }
      }
    }
  });

  it("refuses to score against missing or invalid references", () => {
    const observation = {
      success: true,
      observedLatencySec: 60,
      observedCostUsd: 0.5,
    };
    expect(() =>
      scoreTaskAttempt(observation, { speedTargetSec: 0, costTargetUsd: 0.5 }),
    ).toThrow(RangeError);
    expect(() =>
      scoreTaskAttempt(observation, { speedTargetSec: 60, costTargetUsd: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      scoreTaskAttempt(observation, {
        speedTargetSec: Number.NaN,
        costTargetUsd: 0.5,
      }),
    ).toThrow(RangeError);
  });

  it("refuses an unmeasurable latency rather than scoring it zero", () => {
    expect(() =>
      scoreTaskAttempt(
        { success: true, observedLatencySec: 0, observedCostUsd: 0.5 },
        REFERENCES,
      ),
    ).toThrow(RangeError);
  });
});

describe("aggregateTaskScores", () => {
  const entry = (
    taskId: string,
    finalScore: number | null,
    overrides: Partial<TaskScoreEntry> = {},
  ): TaskScoreEntry => ({
    taskId,
    family: "email-calendar",
    country: "kr",
    finalScore,
    ...overrides,
  });

  it("returns null — not zero — for an empty input", () => {
    const result = aggregateTaskScores([]);
    expect(result.mean).toBeNull();
    expect(result.mean).not.toBe(0);
    expect(result.includedTaskIds).toEqual([]);
  });

  it("takes the plain arithmetic mean of included scores", () => {
    expect(
      aggregateTaskScores([entry("a", 100), entry("b", 50), entry("c", 0)]).mean,
    ).toBeCloseTo(50, 12);
  });

  it("is an arithmetic, not geometric, mean at aggregate level", () => {
    // A geometric mean would be 0 here; the arithmetic mean must be 50.
    expect(aggregateTaskScores([entry("a", 0), entry("b", 100)]).mean).toBe(50);
  });

  it("excludes unscored tasks with a reason instead of counting them as zero", () => {
    const result = aggregateTaskScores([
      entry("a", 100),
      entry("b", null, { exclusionReason: "not attempted" }),
    ]);
    expect(result.mean).toBe(100);
    expect(result.includedTaskIds).toEqual(["a"]);
    expect(result.excluded).toEqual([{ taskId: "b", reason: "not attempted" }]);
  });

  it("returns null when every task is unscored", () => {
    expect(aggregateTaskScores([entry("a", null), entry("b", null)]).mean).toBeNull();
  });

  it("rejects an out-of-range or non-finite score outright", () => {
    expect(() => aggregateTaskScores([entry("a", 101)])).toThrow(RangeError);
    expect(() => aggregateTaskScores([entry("a", -1)])).toThrow(RangeError);
    expect(() => aggregateTaskScores([entry("a", Number.NaN)])).toThrow(RangeError);
  });
});

describe("family and country means", () => {
  const entries: TaskScoreEntry[] = [
    { taskId: "t1", family: "email-calendar", country: "kr", finalScore: 80 },
    { taskId: "t2", family: "email-calendar", country: "jp", finalScore: 40 },
    { taskId: "t3", family: "shopping-delivery", country: "kr", finalScore: 20 },
    {
      taskId: "t4",
      family: "shopping-delivery",
      country: "kr",
      finalScore: null,
      exclusionReason: "no eligible attempt",
    },
  ];

  it("averages the eligible task scores within a family", () => {
    expect(familyScore(entries, "email-calendar").mean).toBeCloseTo(60, 12);
    expect(familyScore(entries, "shopping-delivery").mean).toBe(20);
  });

  it("averages the eligible task scores within a country", () => {
    expect(countryScore(entries, "kr").mean).toBeCloseTo(50, 12);
    expect(countryScore(entries, "jp").mean).toBe(40);
  });

  it("returns null for a family or country with nothing measured", () => {
    expect(familyScore(entries, "government-civic").mean).toBeNull();
    expect(countryScore(entries, "ae").mean).toBeNull();
  });

  it("names the tasks it left out of a country mean", () => {
    expect(countryScore(entries, "kr").excluded).toEqual([
      { taskId: "t4", reason: "no eligible attempt" },
    ]);
  });
});
