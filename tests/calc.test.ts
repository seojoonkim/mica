import { describe, it, expect } from "vitest";
import {
  wilsonInterval,
  percentile,
  costPerSuccess,
  computeParetoFrontier,
  evaluatePublicationEligibility,
  countryMacroAverage,
} from "@/lib/calc";

describe("wilsonInterval", () => {
  it("returns null when there is no denominator", () => {
    expect(wilsonInterval(0, 0)).toBeNull();
  });

  it("brackets the point estimate", () => {
    const interval = wilsonInterval(30, 50)!;
    expect(interval.low).toBeLessThan(0.6);
    expect(interval.high).toBeGreaterThan(0.6);
  });

  it("stays inside [0, 1] at the boundaries", () => {
    const none = wilsonInterval(0, 20)!;
    expect(none.low).toBe(0);
    expect(none.high).toBeGreaterThan(0);
    expect(none.high).toBeLessThan(1);

    const all = wilsonInterval(20, 20)!;
    expect(all.high).toBe(1);
    expect(all.low).toBeGreaterThan(0);
    expect(all.low).toBeLessThan(1);
  });

  it("narrows as the sample grows", () => {
    const small = wilsonInterval(5, 10)!;
    const large = wilsonInterval(500, 1000)!;
    expect(large.high - large.low).toBeLessThan(small.high - small.low);
  });

  it("matches a known value for 10/20 at 95%", () => {
    const interval = wilsonInterval(10, 20)!;
    expect(interval.low).toBeCloseTo(0.2993, 3);
    expect(interval.high).toBeCloseTo(0.7007, 3);
  });

  it("rejects successes outside the denominator", () => {
    expect(() => wilsonInterval(21, 20)).toThrow(RangeError);
    expect(() => wilsonInterval(-1, 20)).toThrow(RangeError);
  });
});

describe("percentile", () => {
  it("returns null for an empty series", () => {
    expect(percentile([], 0.5)).toBeNull();
  });

  it("returns the only value for a single sample", () => {
    expect(percentile([42], 0.9)).toBe(42);
  });

  it("computes the median of an odd-length series", () => {
    expect(percentile([3, 1, 2], 0.5)).toBe(2);
  });

  it("interpolates the median of an even-length series", () => {
    expect(percentile([1, 2, 3, 4], 0.5)).toBe(2.5);
  });

  it("handles the extremes", () => {
    expect(percentile([5, 1, 9], 0)).toBe(1);
    expect(percentile([5, 1, 9], 1)).toBe(9);
  });

  it("interpolates p95 linearly", () => {
    expect(percentile([10, 20, 30, 40, 50], 0.95)).toBeCloseTo(48, 6);
  });

  it("does not mutate the input", () => {
    const input = [3, 1, 2];
    percentile(input, 0.5);
    expect(input).toEqual([3, 1, 2]);
  });

  it("rejects p outside [0, 1]", () => {
    expect(() => percentile([1], 1.5)).toThrow(RangeError);
  });
});

describe("costPerSuccess", () => {
  it("charges the cost of all eligible attempts to the successes", () => {
    expect(costPerSuccess(100, 4)).toBe(25);
  });

  it("returns null — never zero or Infinity — with no successes", () => {
    const result = costPerSuccess(100, 0);
    expect(result).toBeNull();
    expect(result).not.toBe(0);
    expect(result).not.toBe(Infinity);
  });

  it("returns null even when no cost was incurred either", () => {
    expect(costPerSuccess(0, 0)).toBeNull();
  });

  it("rejects negative inputs", () => {
    expect(() => costPerSuccess(-1, 1)).toThrow(RangeError);
    expect(() => costPerSuccess(1, -1)).toThrow(RangeError);
  });
});

describe("computeParetoFrontier", () => {
  const point = (
    id: string,
    accuracy: number | null,
    latencySec: number | null,
    cost: number | null,
  ) => ({ id, accuracy, latencySec, costPerSuccess: cost });

  it("keeps a point that nothing dominates", () => {
    const frontier = computeParetoFrontier([
      point("best", 0.9, 100, 1),
      point("worse", 0.5, 200, 2),
    ]);
    expect(frontier).toEqual(["best"]);
  });

  it("keeps trade-offs on the frontier", () => {
    const frontier = computeParetoFrontier([
      point("accurate", 0.9, 300, 5),
      point("fast", 0.6, 40, 1),
    ]);
    expect(new Set(frontier)).toEqual(new Set(["accurate", "fast"]));
  });

  it("excludes points with any missing axis", () => {
    const frontier = computeParetoFrontier([
      point("complete", 0.7, 100, 2),
      point("no-cost", 0.99, 10, null),
    ]);
    expect(frontier).toEqual(["complete"]);
  });

  it("keeps identical points, since neither strictly dominates", () => {
    const frontier = computeParetoFrontier([
      point("a", 0.7, 100, 2),
      point("b", 0.7, 100, 2),
    ]);
    expect(new Set(frontier)).toEqual(new Set(["a", "b"]));
  });

  it("returns nothing for an empty set", () => {
    expect(computeParetoFrontier([])).toEqual([]);
  });
});

describe("evaluatePublicationEligibility", () => {
  const passing = {
    dataStatus: "official",
    verification: "independent-rerun" as const,
    eligibleRuns: 40,
    tasksAttempted: 9,
    tasksDefined: 10,
    criticalSafetyEvents: 0,
  };

  it("passes nothing while publication thresholds are unset", () => {
    const verdict = evaluatePublicationEligibility(passing);
    expect(verdict.eligible).toBe(false);
    expect(verdict.blockers.join(" ")).toContain("thresholds");
  });

  it("blocks demo data unconditionally", () => {
    const verdict = evaluatePublicationEligibility({
      ...passing,
      dataStatus: "demo",
    });
    expect(verdict.eligible).toBe(false);
    expect(verdict.blockers.join(" ")).toContain("demo data");
  });

  it("blocks on any critical safety event", () => {
    const verdict = evaluatePublicationEligibility({
      ...passing,
      criticalSafetyEvents: 1,
    });
    expect(verdict.eligible).toBe(false);
    expect(verdict.blockers[0]).toContain("critical safety event");
  });

  it("blocks provisional and self-reported results", () => {
    for (const verification of ["provisional", "self-reported"] as const) {
      const verdict = evaluatePublicationEligibility({
        ...passing,
        verification,
      });
      expect(verdict.eligible).toBe(false);
    }
  });

  it("invents no sample-size or coverage threshold of its own", () => {
    const verdict = evaluatePublicationEligibility({
      ...passing,
      eligibleRuns: 1,
      tasksAttempted: 1,
    });
    expect(verdict.blockers.join(" ")).not.toMatch(/minimum of/);
  });
});

describe("countryMacroAverage", () => {
  const required = ["kr", "jp", "sg"];

  it("averages when every market is present", () => {
    const values = new Map([
      ["kr", 0.6],
      ["jp", 0.4],
      ["sg", 0.5],
    ]);
    expect(countryMacroAverage(values, required)).toBeCloseTo(0.5, 10);
  });

  it("returns null when a market is missing rather than treating it as zero", () => {
    const values = new Map([
      ["kr", 0.6],
      ["jp", 0.4],
    ]);
    expect(countryMacroAverage(values, required)).toBeNull();
  });

  it("returns null when a market is present but unmeasured", () => {
    const values = new Map<string, number | null>([
      ["kr", 0.6],
      ["jp", 0.4],
      ["sg", null],
    ]);
    expect(countryMacroAverage(values, required)).toBeNull();
  });
});
