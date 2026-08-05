import {
  runCellSchema,
  assertDemoInvariants,
  COUNTRY_CODES,
  type RunCell,
  type CountryCode,
} from "@/lib/schema";
import { z } from "zod";
import { SYSTEMS } from "@/data/demo/systems";
import {
  SEEDED_DEMO_FAMILY_IDS,
  type SeededDemoFamilyId,
} from "@/data/demo/tasks";

/**
 * Canonical demo run cells — one aggregate per system × country × family.
 *
 * Values are produced by a deterministic, seeded generator so the fixture is
 * reproducible and reviewable rather than hand-tuned to flatter any entry. They
 * are illustrative only and carry no evidentiary weight whatsoever.
 *
 * Deliberate shapes encoded here, because they are the states the interface has
 * to survive:
 *   - `hangang-assistant` has no cells at all outside KR and JP (missing
 *     coverage must read as missing, never as zero).
 *   - `swift-errand` records zero successes in one TH cell (cost per success is
 *     undefined and must render as words).
 *   - `swift-errand` records a critical safety event in one KR cell (a hard,
 *     permanent publication block).
 */

/** Deterministic 32-bit string hash — stable across runs and platforms. */
function hash(seed: string): number {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Seeded pseudo-random sequence in [0, 1). */
function sequence(seed: string): () => number {
  let state = hash(seed) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface SystemProfile {
  accuracy: number;
  latencySec: number;
  /** Cost of a single eligible attempt, in index units before currency scaling. */
  attemptCost: number;
  markets?: readonly CountryCode[];
}

const PROFILES: Record<string, SystemProfile> = {
  "atlas-concierge": { accuracy: 0.71, latencySec: 168, attemptCost: 0.42 },
  "meridian-agent": { accuracy: 0.49, latencySec: 132, attemptCost: 0.36 },
  "hangang-assistant": {
    accuracy: 0.76,
    latencySec: 154,
    attemptCost: 0.51,
    markets: ["kr", "jp"],
  },
  "kaiyo-orchestrator": { accuracy: 0.66, latencySec: 191, attemptCost: 0.33 },
  "swift-errand": { accuracy: 0.28, latencySec: 46, attemptCost: 0.07 },
  "nanyang-copilot": { accuracy: 0.74, latencySec: 224, attemptCost: 0.68 },
};

/** Market difficulty and the currency scale used for demo cost figures. */
const COUNTRY_FACTORS: Record<
  CountryCode,
  { accuracy: number; latency: number; currencyScale: number }
> = {
  kr: { accuracy: -0.04, latency: 1.0, currencyScale: 1400 },
  jp: { accuracy: -0.06, latency: 1.12, currencyScale: 155 },
  sg: { accuracy: 0.05, latency: 0.92, currencyScale: 1.35 },
  tw: { accuracy: -0.02, latency: 1.06, currencyScale: 32 },
  th: { accuracy: -0.07, latency: 1.04, currencyScale: 36 },
};

// Only the seeded demo families have run aggregates; the other six taxonomy
// families deliberately have no cells rather than fabricated ones.
const FAMILY_FACTORS: Record<
  SeededDemoFamilyId,
  { accuracy: number; latency: number }
> = {
  "email-calendar": { accuracy: 0.09, latency: 0.72 },
  "shopping-delivery": { accuracy: -0.03, latency: 1.05 },
  "travel-accommodation": { accuracy: -0.08, latency: 1.34 },
  "restaurants-local": { accuracy: -0.05, latency: 0.98 },
};

const TASKS_DEFINED = 3;

function buildCell(
  systemSlug: string,
  country: CountryCode,
  family: SeededDemoFamilyId,
): unknown {
  const profile = PROFILES[systemSlug];
  const next = sequence(`${systemSlug}:${country}:${family}`);

  const eligibleRuns = 18 + Math.floor(next() * 15);

  const zeroSuccessCell =
    systemSlug === "swift-errand" &&
    country === "th" &&
    family === "restaurants-local";

  const rate = zeroSuccessCell
    ? 0
    : Math.min(
        0.95,
        Math.max(
          0.05,
          profile.accuracy +
            COUNTRY_FACTORS[country].accuracy +
            FAMILY_FACTORS[family].accuracy +
            (next() - 0.5) * 0.08,
        ),
      );

  const successfulRuns = Math.round(eligibleRuns * rate);

  const baseLatency =
    profile.latencySec *
    COUNTRY_FACTORS[country].latency *
    FAMILY_FACTORS[family].latency;

  const successLatenciesSec = Array.from({ length: successfulRuns }, () =>
    Math.round(baseLatency * (0.66 + next() * 0.85)),
  );

  // Failed attempts have wall-clock times too. They are recorded so the
  // population behind every published figure is auditable, but they are not
  // mixed into the reported p50/p95, which stay successful-runs-only.
  const failedLatenciesSec = Array.from(
    { length: eligibleRuns - successfulRuns },
    () => Math.round(baseLatency * (0.28 + next() * 1.1)),
  );
  const allEligibleLatenciesSec = [
    ...successLatenciesSec,
    ...failedLatenciesSec,
  ];

  const scale = COUNTRY_FACTORS[country].currencyScale;
  const rawCost =
    profile.attemptCost * eligibleRuns * scale * (0.85 + next() * 0.4);
  // Minor units for small-denomination currencies, whole units otherwise.
  const totalEligibleCost =
    scale > 100 ? Math.round(rawCost) : Math.round(rawCost * 100) / 100;

  const criticalSafetyEvents =
    systemSlug === "swift-errand" &&
    country === "kr" &&
    family === "shopping-delivery"
      ? 1
      : 0;

  // Coverage is uneven on purpose; nothing here is padded up to full coverage.
  const tasksAttempted =
    successfulRuns === 0
      ? TASKS_DEFINED - 1
      : Math.max(2, Math.min(TASKS_DEFINED, 2 + Math.round(next())));

  return {
    system: systemSlug,
    country,
    family,
    eligibleRuns,
    successfulRuns,
    tasksAttempted,
    tasksDefined: TASKS_DEFINED,
    successLatenciesSec,
    allEligibleLatenciesSec,
    totalEligibleCost,
    criticalSafetyEvents,
    dataStatus: "demo",
    publicationEligible: false,
  };
}

const raw: unknown[] = SYSTEMS.flatMap((system) => {
  const markets = PROFILES[system.slug].markets ?? COUNTRY_CODES;
  return markets.flatMap((country) =>
    SEEDED_DEMO_FAMILY_IDS.map((family) => buildCell(system.slug, country, family)),
  );
});

export const RUN_CELLS: readonly RunCell[] = assertDemoInvariants(
  z.array(runCellSchema).parse(raw),
  (cell) => `run cell ${cell.system}/${cell.country}/${cell.family}`,
);
