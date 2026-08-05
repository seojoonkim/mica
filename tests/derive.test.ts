import { describe, it, expect } from "vitest";
import {
  aggregateBySystem,
  sortByMetric,
  paretoSlugs,
  globalAccuracy,
  marketsCovered,
  countrySnapshot,
} from "@/lib/derive";
import { formatCost, formatSeconds, NO_SUCCESS } from "@/lib/format";

describe("aggregateBySystem", () => {
  it("returns one row per system with coverage in the slice", () => {
    const rows = aggregateBySystem({ country: "kr" });
    expect(rows.length).toBeGreaterThan(1);
    expect(new Set(rows.map((r) => r.systemSlug)).size).toBe(rows.length);
  });

  it("omits systems with no coverage in the market", () => {
    const slugs = aggregateBySystem({ country: "sg" }).map((r) => r.systemSlug);
    expect(slugs).not.toContain("hangang-assistant");
  });

  it("reports a currency for a single market and none across markets", () => {
    expect(aggregateBySystem({ country: "kr" })[0].currency).toBe("KRW");
    expect(aggregateBySystem({ country: "all" })[0].currency).toBeNull();
  });

  it("withholds cost per success across markets rather than mixing currencies", () => {
    for (const row of aggregateBySystem({ country: "all" })) {
      expect(row.costPerSuccess).toBeNull();
    }
  });

  it("marks every demo row as not publication eligible with a stated reason", () => {
    for (const row of aggregateBySystem({ country: "jp" })) {
      expect(row.publicationEligible).toBe(false);
      expect(row.blockers.length).toBeGreaterThan(0);
    }
  });

  it("renders words, not a number, where there were no successes", () => {
    const row = aggregateBySystem({
      country: "th",
      family: "restaurants-local",
    }).find((r) => r.systemSlug === "swift-errand")!;
    expect(row.successfulRuns).toBe(0);
    expect(row.costPerSuccess).toBeNull();
    expect(formatCost(row.costPerSuccess, row.currency)).toBe(NO_SUCCESS);
    expect(formatSeconds(row.latencyP50)).toBe(NO_SUCCESS);
  });
});

describe("sortByMetric", () => {
  const rows = aggregateBySystem({ country: "kr" });

  it("orders accuracy high to low", () => {
    const sorted = sortByMetric(rows, "accuracy");
    const values = sorted.map((r) => r.accuracy ?? -1);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });

  it("orders speed low to high", () => {
    const sorted = sortByMetric(rows, "speed").filter(
      (r) => r.latencyP50 !== null,
    );
    const values = sorted.map((r) => r.latencyP50!);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("changes only the order, never the set of rows", () => {
    const byAccuracy = sortByMetric(rows, "accuracy").map((r) => r.systemSlug);
    const byCost = sortByMetric(rows, "cost").map((r) => r.systemSlug);
    expect([...byAccuracy].sort()).toEqual([...byCost].sort());
  });

  it("sinks rows with no value for the active metric to the bottom", () => {
    const sorted = sortByMetric(
      aggregateBySystem({ country: "th", family: "restaurants-local" }),
      "cost",
    );
    expect(sorted[sorted.length - 1].costPerSuccess).toBeNull();
  });

  it("does not mutate its input", () => {
    const original = rows.map((r) => r.systemSlug);
    sortByMetric(rows, "cost");
    expect(rows.map((r) => r.systemSlug)).toEqual(original);
  });
});

describe("pareto and coverage", () => {
  it("puts at least one system on the frontier", () => {
    expect(paretoSlugs(aggregateBySystem({ country: "kr" })).size).toBeGreaterThan(
      0,
    );
  });

  it("withholds a global figure for a system missing markets", () => {
    expect(globalAccuracy("hangang-assistant")).toBeNull();
  });

  it("reports a global figure for a system covering every market", () => {
    const value = globalAccuracy("atlas-concierge");
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThan(0);
    expect(value!).toBeLessThan(1);
  });

  it("lists only the markets a system actually covers", () => {
    expect(marketsCovered("hangang-assistant")).toEqual(["kr", "jp"]);
    expect(marketsCovered("atlas-concierge")).toHaveLength(5);
  });

  it("gives every market a non-empty snapshot", () => {
    for (const code of ["kr", "jp", "sg", "tw", "th"] as const) {
      expect(countrySnapshot(code).length).toBeGreaterThan(0);
    }
  });
});
