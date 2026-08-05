import { PUBLICATION_RULES } from "@/data/policy/publication";
import type { VerificationStatusId } from "@/lib/schema";

/**
 * Pure calculation contracts. Every number MICA shows comes through here, and
 * every "we don't know" is represented as `null` rather than as a zero.
 */

export interface Interval {
  low: number;
  high: number;
}

/**
 * Wilson score interval for a binomial proportion. Preferred over the normal
 * approximation because MICA cells are small and often near 0 or 1.
 * Returns `null` when there is no denominator to speak of.
 */
export function wilsonInterval(
  successes: number,
  total: number,
  z = 1.96,
): Interval | null {
  if (!Number.isFinite(successes) || !Number.isFinite(total)) return null;
  if (total <= 0) return null;
  if (successes < 0 || successes > total) {
    throw new RangeError(
      `wilsonInterval: successes (${successes}) must be within [0, ${total}]`,
    );
  }

  const p = successes / total;
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const centre = p + z2 / (2 * total);
  const margin =
    z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total));

  return {
    low: successes === 0 ? 0 : Math.max(0, (centre - margin) / denominator),
    high:
      successes === total ? 1 : Math.min(1, (centre + margin) / denominator),
  };
}

/**
 * Linear-interpolation percentile (the "R-7" definition, matching most
 * spreadsheet tools). `p` is a fraction in [0, 1]. Empty input is `null`.
 */
export function percentile(values: readonly number[], p: number): number | null {
  if (p < 0 || p > 1 || !Number.isFinite(p)) {
    throw new RangeError(`percentile: p must be within [0, 1], received ${p}`);
  }
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const position = p * (sorted.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  if (lowerIndex === upperIndex) return sorted[lowerIndex];

  const weight = position - lowerIndex;
  return sorted[lowerIndex] * (1 - weight) + sorted[upperIndex] * weight;
}

/**
 * Cost per success: total cost of *all* eligible attempts divided by the number
 * of *successful* eligible runs. With zero successes the value is undefined —
 * not infinity, not zero — and callers must render "No successful task."
 */
export function costPerSuccess(
  totalEligibleCost: number,
  successfulRuns: number,
): number | null {
  if (totalEligibleCost < 0) {
    throw new RangeError("costPerSuccess: total cost cannot be negative");
  }
  if (successfulRuns < 0) {
    throw new RangeError("costPerSuccess: successful runs cannot be negative");
  }
  if (successfulRuns === 0) return null;
  return totalEligibleCost / successfulRuns;
}

export interface ParetoPoint {
  id: string;
  /** Higher is better. */
  accuracy: number | null;
  /** Lower is better. */
  latencySec: number | null;
  /** Lower is better. */
  costPerSuccess: number | null;
}

/**
 * Pareto frontier over (accuracy ↑, latency ↓, cost ↓).
 *
 * A point is dominated when another point is at least as good on all three axes
 * and strictly better on at least one. Points with any missing axis cannot be
 * compared and are never placed on the frontier, nor used to dominate others.
 */
export function computeParetoFrontier(
  points: readonly ParetoPoint[],
): readonly string[] {
  type ComparablePoint = {
    id: string;
    accuracy: number;
    latencySec: number;
    costPerSuccess: number;
  };
  const comparable = points.filter(
    (point): point is ComparablePoint =>
      point.accuracy !== null &&
      point.latencySec !== null &&
      point.costPerSuccess !== null,
  );

  const dominates = (
    a: ComparablePoint,
    b: ComparablePoint,
  ): boolean => {
    const atLeastAsGood =
      a.accuracy >= b.accuracy &&
      a.latencySec <= b.latencySec &&
      a.costPerSuccess <= b.costPerSuccess;
    const strictlyBetter =
      a.accuracy > b.accuracy ||
      a.latencySec < b.latencySec ||
      a.costPerSuccess < b.costPerSuccess;
    return atLeastAsGood && strictlyBetter;
  };

  return comparable
    .filter((candidate) =>
      comparable.every(
        (other) => other.id === candidate.id || !dominates(other, candidate),
      ),
    )
    .map((point) => point.id);
}

export interface PublicationInput {
  dataStatus: string;
  verification: VerificationStatusId;
  eligibleRuns: number;
  tasksAttempted: number;
  tasksDefined: number;
  criticalSafetyEvents: number;
}

export interface PublicationVerdict {
  eligible: boolean;
  /** Human-readable reasons the result is not publishable, most severe first. */
  blockers: string[];
}

/**
 * The publication gate. Demo data and critical safety events are hard blocks;
 * verification track, sample size and coverage are the remaining conditions.
 */
export function evaluatePublicationEligibility(
  input: PublicationInput,
): PublicationVerdict {
  const blockers: string[] = [];

  if (input.criticalSafetyEvents > 0 && PUBLICATION_RULES.criticalSafetyBlocks) {
    blockers.push(
      `${input.criticalSafetyEvents} critical safety event${
        input.criticalSafetyEvents === 1 ? "" : "s"
      } recorded — publication is permanently blocked for this cell.`,
    );
  }

  if (input.dataStatus === "demo") {
    blockers.push("Illustrative demo data is never publication eligible.");
  }

  if (input.verification !== "independent-rerun") {
    blockers.push(
      "Only independently rerun results may reach publication; this cell is not.",
    );
  }

  if (input.eligibleRuns < PUBLICATION_RULES.minEligibleRuns) {
    blockers.push(
      `${input.eligibleRuns} eligible runs is below the minimum of ${PUBLICATION_RULES.minEligibleRuns}.`,
    );
  }

  const coverage =
    input.tasksDefined > 0 ? input.tasksAttempted / input.tasksDefined : 0;
  if (coverage < PUBLICATION_RULES.minCoverage) {
    blockers.push(
      `Task coverage of ${(coverage * 100).toFixed(0)}% is below the minimum of ${(
        PUBLICATION_RULES.minCoverage * 100
      ).toFixed(0)}%.`,
    );
  }

  return { eligible: blockers.length === 0, blockers };
}

/**
 * Country macro-average: the mean of per-country values, used only when every
 * required country is present. A missing country makes the global figure
 * unavailable — it is never treated as a zero.
 */
export function countryMacroAverage(
  valuesByCountry: ReadonlyMap<string, number | null>,
  requiredCountries: readonly string[],
): number | null {
  const values: number[] = [];
  for (const country of requiredCountries) {
    if (!valuesByCountry.has(country)) return null;
    const value = valuesByCountry.get(country);
    if (value === null || value === undefined) return null;
    values.push(value);
  }
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
