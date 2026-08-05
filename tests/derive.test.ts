import { describe, it, expect, vi } from "vitest";
import { formatCost, formatSeconds, NO_SUCCESS } from "@/lib/format";

/**
 * The derivation layer is pure with respect to the records it reads, so it is
 * tested against anonymous synthetic records rather than against the shipped
 * registries — which are empty, and stay empty. The empty-registry behaviour
 * itself is covered in `no-published-results.test.tsx`.
 */
vi.mock("@/data/demo/runs", async () => ({
  RUN_CELLS: (await import("./support/synthetic")).SYNTHETIC_RUN_CELLS,
}));
vi.mock("@/data/demo/systems", async () => {
  const { SYNTHETIC_SYSTEMS } = await import("./support/synthetic");
  const bySlug = new Map(SYNTHETIC_SYSTEMS.map((s) => [s.slug, s]));
  return {
    SYSTEMS: SYNTHETIC_SYSTEMS,
    SYSTEM_BY_SLUG: bySlug,
    getSystem: (slug: string) => bySlug.get(slug),
    systemName: (slug: string) => bySlug.get(slug)?.name ?? slug,
  };
});

const {
  aggregateBySystem,
  sortByMetric,
  paretoSlugs,
  globalAccuracy,
  globalAccuracyRows,
  marketsCovered,
  countrySnapshot,
} = await import("@/lib/derive");

describe("aggregateBySystem", () => {
  it("returns one row per system with coverage in the slice", () => {
    const rows = aggregateBySystem({ country: "kr" });
    expect(rows.length).toBeGreaterThan(1);
    expect(new Set(rows.map((r) => r.systemSlug)).size).toBe(rows.length);
  });

  it("omits systems with no coverage in the market", () => {
    const slugs = aggregateBySystem({ country: "sg" }).map((r) => r.systemSlug);
    expect(slugs).not.toContain("test-system-2");
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
      country: "kr",
      family: "shopping-delivery",
    }).find((r) => r.systemSlug === "test-system-3")!;
    expect(row.successfulRuns).toBe(0);
    expect(row.costPerSuccess).toBeNull();
    expect(formatCost(row.costPerSuccess, row.currency)).toBe(NO_SUCCESS);
    expect(formatSeconds(row.latencyP50)).toBe(NO_SUCCESS);
  });
});

describe("percentiles", () => {
  it("exposes latencyP95 and no longer exposes latencyP90", () => {
    const row = aggregateBySystem({ country: "kr" })[0];
    expect(row.latencyP95).not.toBeUndefined();
    expect("latencyP90" in row).toBe(false);
  });

  it("computes p95 from successful runs only and at or above p50", () => {
    for (const row of aggregateBySystem({ country: "kr" })) {
      if (row.latencyP50 === null) continue;
      expect(row.latencyP95).not.toBeNull();
      expect(row.latencyP95!).toBeGreaterThanOrEqual(row.latencyP50);
    }
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
    const sorted = sortByMetric(aggregateBySystem({ country: "kr" }), "cost");
    expect(sorted[sorted.length - 1].costPerSuccess).toBeNull();
  });

  it("does not mutate its input", () => {
    const original = rows.map((r) => r.systemSlug);
    sortByMetric(rows, "cost");
    expect(rows.map((r) => r.systemSlug)).toEqual(original);
  });

  it("returns nothing at all for an empty row set", () => {
    expect(sortByMetric([], "accuracy")).toEqual([]);
  });
});

describe("pareto and coverage", () => {
  it("puts at least one system on the frontier", () => {
    expect(
      paretoSlugs(aggregateBySystem({ country: "kr" })).size,
    ).toBeGreaterThan(0);
  });

  it("finds no frontier in an empty row set", () => {
    expect(paretoSlugs([]).size).toBe(0);
  });

  it("withholds a global figure for a system missing markets", () => {
    expect(globalAccuracy("test-system-2")).toBeNull();
  });

  it("reports a global figure for a system covering every market", () => {
    const value = globalAccuracy("test-system-1");
    expect(value).not.toBeNull();
    expect(value!).toBeGreaterThan(0);
    expect(value!).toBeLessThan(1);
  });

  it("computes the macro-average rather than pooling runs", () => {
    const macro = globalAccuracyRows().find(
      (row) => row.systemSlug === "test-system-1",
    )!.accuracy!;
    const pooled = aggregateBySystem().find(
      (row) => row.systemSlug === "test-system-1",
    )!.accuracy!;
    expect(macro).not.toBe(pooled);
  });

  it("lists only the markets a system actually covers", () => {
    expect(marketsCovered("test-system-2")).toEqual(["kr", "jp"]);
    expect(marketsCovered("test-system-1")).toHaveLength(5);
    expect(marketsCovered("never-submitted")).toEqual([]);
  });

  it("gives a market with cells a non-empty snapshot", () => {
    expect(countrySnapshot("kr").length).toBeGreaterThan(0);
  });
});
