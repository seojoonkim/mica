import {
  wilsonInterval,
  percentile,
  costPerSuccess,
  computeParetoFrontier,
  evaluatePublicationEligibility,
  countryMacroAverage,
  type Interval,
} from "@/lib/calc";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS, SYSTEM_BY_SLUG } from "@/data/demo/systems";
import {
  COUNTRY_CODES,
  type CountryCode,
  type RunCell,
  type TaskFamilyId,
  type VerificationStatusId,
} from "@/lib/schema";

/**
 * Views derived from the canonical run cells. Nothing in here stores a second
 * copy of a number; every figure is computed from `RUN_CELLS` on demand.
 */

export interface AggregateView {
  systemSlug: string;
  systemName: string;
  verification: VerificationStatusId;
  country: CountryCode | "all";
  family: TaskFamilyId | "all";
  eligibleRuns: number;
  successfulRuns: number;
  accuracy: number | null;
  accuracyInterval: Interval | null;
  latencyP50: number | null;
  /** Both percentiles are over successful eligible runs only. */
  latencyP95: number | null;
  /** Evaluation execution spend per success, in USD. */
  costPerSuccess: number | null;
  /** Always `"USD"` when a cost exists — execution spend has no local currency. */
  currency: string | null;
  coverage: number | null;
  tasksAttempted: number;
  tasksDefined: number;
  criticalSafetyEvents: number;
  publicationEligible: boolean;
  blockers: string[];
}

function combine(
  cells: readonly RunCell[],
  systemSlug: string,
  country: CountryCode | "all",
  family: TaskFamilyId | "all",
): AggregateView {
  const system = SYSTEM_BY_SLUG.get(systemSlug);
  const eligibleRuns = cells.reduce((sum, cell) => sum + cell.eligibleRuns, 0);
  const successfulRuns = cells.reduce(
    (sum, cell) => sum + cell.successfulRuns,
    0,
  );
  // Successful runs only: including failures would let fast failure read as
  // fast success. `allEligibleLatenciesSec` is kept on the cell for auditing.
  const latencies = cells.flatMap((cell) => cell.successLatenciesSec);
  const tasksAttempted = cells.reduce(
    (sum, cell) => sum + cell.tasksAttempted,
    0,
  );
  const tasksDefined = cells.reduce((sum, cell) => sum + cell.tasksDefined, 0);
  const criticalSafetyEvents = cells.reduce(
    (sum, cell) => sum + cell.criticalSafetyEvents,
    0,
  );

  // Evaluation execution spend is canonically USD in every market, so cells can
  // be summed across markets without a conversion and the figure stays valid
  // for the `all` slice. The market's own currency is never applied to it.
  const totalCostUsd = cells.reduce(
    (sum, cell) => sum + cell.totalEligibleCostUsd,
    0,
  );
  const costPerSuccessUsd = costPerSuccess(totalCostUsd, successfulRuns);

  const verdict = evaluatePublicationEligibility({
    dataStatus: "demo",
    verification: system?.verification ?? "self-reported",
    eligibleRuns,
    tasksAttempted,
    tasksDefined: Math.max(tasksDefined, 1),
    criticalSafetyEvents,
  });

  return {
    systemSlug,
    systemName: system?.name ?? systemSlug,
    verification: system?.verification ?? "self-reported",
    country,
    family,
    eligibleRuns,
    successfulRuns,
    accuracy: eligibleRuns > 0 ? successfulRuns / eligibleRuns : null,
    accuracyInterval: wilsonInterval(successfulRuns, eligibleRuns),
    latencyP50: percentile(latencies, 0.5),
    latencyP95: percentile(latencies, 0.95),
    costPerSuccess: costPerSuccessUsd,
    currency: costPerSuccessUsd === null ? null : "USD",
    coverage: tasksDefined > 0 ? tasksAttempted / tasksDefined : null,
    tasksAttempted,
    tasksDefined,
    criticalSafetyEvents,
    publicationEligible: verdict.eligible,
    blockers: verdict.blockers,
  };
}

export interface AggregateQuery {
  country?: CountryCode | "all";
  family?: TaskFamilyId | "all";
}

/** One row per system for the requested country/family slice. */
export function aggregateBySystem(query: AggregateQuery = {}): AggregateView[] {
  const country = query.country ?? "all";
  const family = query.family ?? "all";

  const filtered = RUN_CELLS.filter(
    (cell) =>
      (country === "all" || cell.country === country) &&
      (family === "all" || cell.family === family),
  );

  const bySystem = new Map<string, RunCell[]>();
  for (const cell of filtered) {
    const bucket = bySystem.get(cell.system);
    if (bucket) bucket.push(cell);
    else bySystem.set(cell.system, [cell]);
  }

  return [...bySystem.entries()].map(([slug, cells]) =>
    combine(cells, slug, country, family),
  );
}

export type MetricKey = "accuracy" | "speed" | "cost";

/**
 * Sorts rows by a single raw outcome axis. The metric switch changes the
 * ordering only: these are the separately disclosed raw figures, not the
 * normalized components that `src/lib/score.ts` multiplies into a task score.
 * Rows with no value for the active metric sink to the bottom in a stable order.
 */
export function sortByMetric(
  rows: readonly AggregateView[],
  metric: MetricKey,
): AggregateView[] {
  const value = (row: AggregateView): number | null =>
    metric === "accuracy"
      ? row.accuracy
      : metric === "speed"
        ? row.latencyP50
        : row.costPerSuccess;

  const betterIsLower = metric !== "accuracy";

  return [...rows].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (left === null && right === null)
      return a.systemName.localeCompare(b.systemName);
    if (left === null) return 1;
    if (right === null) return -1;
    if (left === right) return a.systemName.localeCompare(b.systemName);
    return betterIsLower ? left - right : right - left;
  });
}

/** Slugs on the (accuracy ↑, latency ↓, cost ↓) frontier for these rows. */
export function paretoSlugs(rows: readonly AggregateView[]): ReadonlySet<string> {
  return new Set(
    computeParetoFrontier(
      rows.map((row) => ({
        id: row.systemSlug,
        accuracy: row.accuracy,
        latencySec: row.latencyP50,
        costPerSuccess: row.costPerSuccess,
      })),
    ),
  );
}

/**
 * Global accuracy for a system as a country macro-average, available only when
 * the system has cells in every market in the index.
 */
export function globalAccuracy(systemSlug: string): number | null {
  const byCountry = new Map<string, number | null>();
  for (const code of COUNTRY_CODES) {
    const cells = RUN_CELLS.filter(
      (cell) => cell.system === systemSlug && cell.country === code,
    );
    if (cells.length === 0) continue;
    const eligible = cells.reduce((sum, cell) => sum + cell.eligibleRuns, 0);
    const successful = cells.reduce((sum, cell) => sum + cell.successfulRuns, 0);
    byCountry.set(code, eligible > 0 ? successful / eligible : null);
  }
  return countryMacroAverage(byCountry, COUNTRY_CODES);
}

export interface GlobalAccuracyRow {
  systemSlug: string;
  systemName: string;
  verification: VerificationStatusId;
  /** Country macro-average, or `null` when a market is missing. */
  accuracy: number | null;
  markets: CountryCode[];
}

/**
 * Index-wide accuracy per system, as the country macro-average from
 * `globalAccuracy` — never a pooling of runs, which would silently weight the
 * markets that happen to have more attempts. Systems with no macro-average sink
 * to the bottom rather than being dropped or shown as a zero.
 */
export function globalAccuracyRows(): GlobalAccuracyRow[] {
  return SYSTEMS.map((system) => ({
    systemSlug: system.slug,
    systemName: system.name,
    verification: system.verification,
    accuracy: globalAccuracy(system.slug),
    markets: marketsCovered(system.slug),
  })).sort(
    (a, b) =>
      (b.accuracy ?? -1) - (a.accuracy ?? -1) ||
      a.systemName.localeCompare(b.systemName),
  );
}

/** The markets a system has any demo coverage in. */
export function marketsCovered(systemSlug: string): CountryCode[] {
  return COUNTRY_CODES.filter((code) =>
    RUN_CELLS.some((cell) => cell.system === systemSlug && cell.country === code),
  );
}

export function countrySnapshot(country: CountryCode): AggregateView[] {
  return sortByMetric(aggregateBySystem({ country }), "accuracy");
}
