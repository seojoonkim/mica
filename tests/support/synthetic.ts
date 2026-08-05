import {
  systemSchema,
  runCellSchema,
  type RunCell,
  type SystemRecord,
} from "@/lib/schema";
import type { AggregateView } from "@/lib/derive";

/**
 * Anonymous records for unit-testing the pure derivation layer.
 *
 * These exist so `derive` and `evidence` stay under test now that the shipped
 * registries are empty. They are deliberately nameless — `test-system-1`, not
 * anything that could be mistaken for a product — and they live under `tests/`
 * only. Nothing here is imported by `src/` or copied into `public/`, so no
 * invented system can reach a rendered page or an exported file through them.
 *
 * They are parsed through the canonical schemas, so a schema change breaks
 * these fixtures rather than silently leaving the tests measuring a stale shape.
 */

function cell(overrides: Partial<RunCell> & Pick<RunCell, "system" | "country" | "family">): RunCell {
  const eligibleRuns = overrides.eligibleRuns ?? 20;
  const successfulRuns = overrides.successfulRuns ?? 10;
  return runCellSchema.parse({
    eligibleRuns,
    successfulRuns,
    tasksAttempted: 2,
    tasksDefined: 3,
    successLatenciesSec: Array.from({ length: successfulRuns }, (_, i) => 100 + i),
    allEligibleLatenciesSec: Array.from({ length: eligibleRuns }, (_, i) => 90 + i),
    totalEligibleCost: 1000,
    criticalSafetyEvents: 0,
    dataStatus: "demo",
    publicationEligible: false,
    ...overrides,
  });
}

function system(
  slug: string,
  overrides: Partial<SystemRecord> = {},
): SystemRecord {
  return systemSchema.parse({
    slug,
    name: slug.replace(/(^|-)(\w)/g, (_, sep, ch) => (sep ? " " : "") + ch.toUpperCase()),
    operator: "Test Operator",
    snapshotVersion: "0.0.1",
    snapshotDate: "2026-01-01",
    composition: {
      orchestrator: "Test orchestrator",
      models: ["test model"],
      tools: ["test tool"],
      memory: "None",
    },
    summary: "Anonymous unit-test record.",
    verification: "independent-rerun",
    track: "simulator",
    dataStatus: "demo",
    publicationEligible: false,
    ...overrides,
  });
}

/** One system in every market, one covering two markets, one self-reported. */
export const SYNTHETIC_SYSTEMS: readonly SystemRecord[] = [
  system("test-system-1"),
  system("test-system-2", { verification: "self-reported" }),
  system("test-system-3", { verification: "provisional" }),
];

const ALL_MARKETS = ["kr", "jp", "sg", "tw", "th"] as const;

export const SYNTHETIC_RUN_CELLS: readonly RunCell[] = [
  // Uneven cell sizes on purpose: a country macro-average and a pooled-run
  // accuracy must come out at different numbers, or a pooled implementation
  // would pass the macro-average tests unnoticed.
  ...ALL_MARKETS.map((country) =>
    cell({
      system: "test-system-1",
      country,
      family: "email-calendar",
      eligibleRuns: country === "kr" ? 40 : 20,
      successfulRuns: country === "kr" ? 28 : 10,
    }),
  ),
  // Deliberately partial coverage: a missing market must never read as a zero.
  cell({ system: "test-system-2", country: "kr", family: "email-calendar" }),
  cell({ system: "test-system-2", country: "jp", family: "email-calendar" }),
  // Deliberately zero successes: cost per success and p50 must render as words.
  cell({
    system: "test-system-3",
    country: "kr",
    family: "shopping-delivery",
    successfulRuns: 0,
    criticalSafetyEvents: 1,
  }),
];

/**
 * A ready-made table row. `ResultsTable` is a pure function of the rows it is
 * handed, so its tests build rows here rather than deriving them from a
 * registry that is — and stays — empty.
 */
export function syntheticRow(
  overrides: Partial<AggregateView> & Pick<AggregateView, "systemSlug">,
): AggregateView {
  return {
    systemName: overrides.systemSlug
      .replace(/(^|-)(\w)/g, (_, sep, ch) => (sep ? " " : "") + ch.toUpperCase()),
    verification: "independent-rerun",
    country: "kr",
    family: "email-calendar",
    eligibleRuns: 20,
    successfulRuns: 12,
    accuracy: 0.6,
    accuracyInterval: { low: 0.4, high: 0.8 },
    latencyP50: 120,
    latencyP95: 240,
    costPerSuccess: 90,
    currency: "KRW",
    coverage: 0.5,
    tasksAttempted: 2,
    tasksDefined: 4,
    criticalSafetyEvents: 0,
    publicationEligible: false,
    blockers: ["Publication thresholds are not set."],
    ...overrides,
  };
}

/** Two contrasting rows: one faster and cheaper, one more accurate. */
export const SYNTHETIC_ROWS: readonly AggregateView[] = [
  syntheticRow({ systemSlug: "test-system-1", accuracy: 0.72, latencyP50: 150, latencyP95: 300, costPerSuccess: 120 }),
  syntheticRow({ systemSlug: "test-system-2", accuracy: 0.44, latencyP50: 80, latencyP95: 160, costPerSuccess: 60 }),
];
