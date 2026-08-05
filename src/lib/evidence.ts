import { RUN_CELLS } from "@/data/demo/runs";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { aggregateBySystem } from "@/lib/derive";
import { percentile } from "@/lib/calc";
import type { Interval } from "@/lib/calc";
import {
  countryCodeSchema,
  taskFamilySchema,
  type CountryCode,
  type RunCell,
  type TaskFamilyId,
} from "@/lib/schema";

/**
 * Run-cell lineage.
 *
 * MICA's canonical unit of evidence is the aggregate run cell — one system ×
 * market × task family. There are no individual attempt records, so nothing
 * here invents one: an evidence page is a handle on a cell, not on a
 * transcript. The lineage layer stores no second copy of any number; it names
 * a cell and re-reads the same derivation the tables use.
 */

/** Separator is a double dash so single-dash slugs stay unambiguous. */
const SEPARATOR = "--";

export interface RunCellCoordinates {
  system: string;
  country: CountryCode;
  family: TaskFamilyId;
}

/** e.g. `<system-slug>--kr--email-calendar`. */
export function runCellId(cell: RunCellCoordinates): string {
  return [cell.system, cell.country, cell.family].join(SEPARATOR);
}

export function evidenceHref(cell: RunCellCoordinates): string {
  return `/evidence/${runCellId(cell)}`;
}

/**
 * Parses an id into coordinates. Shape and enum membership are checked here;
 * whether a cell actually exists is `getRunCellById`'s question.
 */
export function parseRunCellId(id: string): RunCellCoordinates | null {
  const parts = id.split(SEPARATOR);
  if (parts.length !== 3) return null;
  const [system, country, family] = parts;
  if (!/^[a-z0-9-]+$/.test(system)) return null;
  const parsedCountry = countryCodeSchema.safeParse(country);
  const parsedFamily = taskFamilySchema.safeParse(family);
  if (!parsedCountry.success || !parsedFamily.success) return null;
  return {
    system,
    country: parsedCountry.data,
    family: parsedFamily.data,
  };
}

const CELL_BY_ID: ReadonlyMap<string, RunCell> = new Map(
  RUN_CELLS.map((cell) => [runCellId(cell), cell]),
);

/** Every canonical cell id, in fixture order. */
export const RUN_CELL_IDS: readonly string[] = [...CELL_BY_ID.keys()];

export function getRunCellById(id: string): RunCell | null {
  return CELL_BY_ID.get(id) ?? null;
}

export interface RunCellEvidence extends RunCellCoordinates {
  id: string;
  eligibleRuns: number;
  successfulRuns: number;
  accuracy: number | null;
  accuracyInterval: Interval | null;
  /** Successful eligible runs only, so fast failure never reads as fast success. */
  latencyP50: number | null;
  latencyP95: number | null;
  /** Size of the recorded all-eligible latency population, for auditing. */
  allEligibleLatencyCount: number;
  totalEligibleCost: number;
  costPerSuccess: number | null;
  currency: string | null;
  tasksAttempted: number;
  tasksDefined: number;
  coverage: number | null;
  criticalSafetyEvents: number;
  dataStatus: RunCell["dataStatus"];
  publicationEligible: boolean;
  blockers: string[];
}

/**
 * The published view of one cell. Accuracy, interval, cost per success and the
 * publication verdict come from `aggregateBySystem` sliced to this exact
 * system × market × family, so an evidence page can never drift from the table
 * that links to it.
 */
export function runCellEvidence(id: string): RunCellEvidence | null {
  const cell = getRunCellById(id);
  if (!cell) return null;

  const row = aggregateBySystem({
    country: cell.country,
    family: cell.family,
  }).find((entry) => entry.systemSlug === cell.system);
  if (!row) return null;

  return {
    id: runCellId(cell),
    system: cell.system,
    country: cell.country,
    family: cell.family,
    eligibleRuns: row.eligibleRuns,
    successfulRuns: row.successfulRuns,
    accuracy: row.accuracy,
    accuracyInterval: row.accuracyInterval,
    latencyP50: row.latencyP50,
    latencyP95: row.latencyP95,
    allEligibleLatencyCount: cell.allEligibleLatenciesSec.length,
    totalEligibleCost: cell.totalEligibleCost,
    costPerSuccess: row.costPerSuccess,
    currency: COUNTRY_BY_CODE.get(cell.country)?.currency ?? null,
    tasksAttempted: row.tasksAttempted,
    tasksDefined: row.tasksDefined,
    coverage: row.coverage,
    criticalSafetyEvents: row.criticalSafetyEvents,
    dataStatus: cell.dataStatus,
    publicationEligible: row.publicationEligible,
    blockers: row.blockers,
  };
}

/** All-eligible latency p50, reported only as an audit figure beside the published one. */
export function allEligibleLatencyP50(cell: RunCell): number | null {
  return percentile(cell.allEligibleLatenciesSec, 0.5);
}

/** Cells for a system, market or family — used for the contextual links. */
export function runCellsFor(query: {
  system?: string;
  country?: CountryCode;
  family?: TaskFamilyId;
}): readonly RunCell[] {
  return RUN_CELLS.filter(
    (cell) =>
      (query.system === undefined || cell.system === query.system) &&
      (query.country === undefined || cell.country === query.country) &&
      (query.family === undefined || cell.family === query.family),
  );
}
