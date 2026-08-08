/**
 * Official MICA per-task scoring.
 *
 * One task attempt yields one final score, and that score is the product of
 * three normalized components — accuracy, speed and cost — scaled to [0, 100]:
 *
 *     finalScore = 100 × accuracyComponent × speedComponent × costComponent
 *
 * Multiplication happens once, per individual task. Family and country figures
 * are the plain arithmetic mean of the individual final scores that were
 * eligible; there is no geometric mean and no weighting at the aggregate level.
 *
 * The raw accuracy outcome, the raw latency and the raw cost are never replaced
 * by the score: they remain on the record and stay separately disclosable. The
 * score is derived on demand from those raw values, so it cannot drift away
 * from the evidence it claims to summarise.
 *
 * Everything here fails closed. An unmeasured task is `null`, never zero, and
 * an impossible input throws rather than being coerced into a plausible number.
 */

/** The score of a task that was attempted, was eligible, and did everything right. */
export const MAX_TASK_SCORE = 100;

/**
 * Pre-registered evaluator references for one executable task version. These are
 * declared before any run and are properties of the task, not of a cohort: they
 * are never re-derived from observed results, so a slow field cannot make a slow
 * system look fast.
 */
export interface TaskScoringReferences {
  /** Reference wall-clock seconds for a competent completion. Positive. */
  speedTargetSec: number;
  /** Reference evaluation execution cost in USD. Positive. */
  costTargetUsd: number;
}

/**
 * What a single attempt actually did. `costUsd` is evaluation execution cost —
 * model, tool and API spend for running the task — in USD. It is deliberately
 * not the transaction value or a market-local purchase amount, so that no
 * currency conversion ever enters the product.
 */
export interface TaskObservation {
  /** True only for a confirmed success. Every other completion outcome is false. */
  success: boolean;
  /** Wall-clock seconds for the attempt. Finite and strictly positive. */
  observedLatencySec: number;
  /** Metered evaluation execution cost in USD. Finite and strictly positive. */
  observedCostUsd: number;
}

export interface TaskScoreBreakdown {
  /** 1 for a confirmed success, 0 otherwise. Never partial. */
  accuracyComponent: 0 | 1;
  /** min(1, speedTargetSec / observedLatencySec), in [0, 1]. */
  speedComponent: number;
  /** min(1, costTargetUsd / observedCostUsd). Zero/unmetered cost is unscorable. */
  costComponent: number;
  /** 100 × the three components, in [0, 100]. */
  finalScore: number;
}

function requirePositiveFinite(value: number, what: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${what} must be a finite positive number, received ${value}`);
  }
}

/** Throws unless both references are pre-registered positive finite numbers. */
export function assertScoringReferences(
  references: TaskScoringReferences,
): void {
  requirePositiveFinite(references.speedTargetSec, "speedTargetSec");
  requirePositiveFinite(references.costTargetUsd, "costTargetUsd");
}

/**
 * Accuracy is binary by policy. A run either reached the declared final state
 * inside its confirmation boundary or it did not; there is no partial credit,
 * so a fast, cheap failure multiplies the whole product to zero.
 */
export function accuracyComponent(success: boolean): 0 | 1 {
  return success ? 1 : 0;
}

/** Faster than the reference is capped at 1: speed cannot buy back accuracy. */
export function speedComponent(
  observedLatencySec: number,
  speedTargetSec: number,
): number {
  requirePositiveFinite(observedLatencySec, "observedLatencySec");
  requirePositiveFinite(speedTargetSec, "speedTargetSec");
  return Math.min(1, speedTargetSec / observedLatencySec);
}

/** Zero or unmetered cost is not evidence of perfect efficiency; fail closed. */
export function costComponent(
  observedCostUsd: number,
  costTargetUsd: number,
): number {
  requirePositiveFinite(observedCostUsd, "observedCostUsd");
  requirePositiveFinite(costTargetUsd, "costTargetUsd");
  return Math.min(1, costTargetUsd / observedCostUsd);
}

/**
 * The official final score for one individual task attempt. Throws on any input
 * that cannot honestly be scored, rather than returning a defensible-looking 0.
 */
export function scoreTaskAttempt(
  observation: TaskObservation,
  references: TaskScoringReferences,
): TaskScoreBreakdown {
  assertScoringReferences(references);

  const accuracy = accuracyComponent(observation.success);
  const speed = speedComponent(
    observation.observedLatencySec,
    references.speedTargetSec,
  );
  const cost = costComponent(
    observation.observedCostUsd,
    references.costTargetUsd,
  );

  // The product is bounded by construction; the clamp only absorbs float error
  // at the 1 × 1 × 1 boundary so the published bound is exactly [0, 100].
  const finalScore = Math.min(
    MAX_TASK_SCORE,
    Math.max(0, MAX_TASK_SCORE * accuracy * speed * cost),
  );

  return {
    accuracyComponent: accuracy,
    speedComponent: speed,
    costComponent: cost,
    finalScore,
  };
}

/**
 * One task's contribution to an aggregate. `finalScore` is `null` when the task
 * was not scored — not attempted, not eligible, or missing references. A null
 * is excluded from the mean with a stated reason; it never enters as a zero.
 */
export interface TaskScoreEntry {
  taskId: string;
  family: string;
  country: string;
  finalScore: number | null;
  /** Why the entry is unscored, when it is. Surfaced in the audit trail. */
  exclusionReason?: string;
}

export interface AggregateScore {
  /** Arithmetic mean of the included final scores, or `null` for none. */
  mean: number | null;
  /** Task ids that entered the mean, in input order. */
  includedTaskIds: readonly string[];
  /** Task ids that did not, each with the reason it was left out. */
  excluded: readonly { taskId: string; reason: string }[];
}

/**
 * The one aggregation primitive. Eligibility is explicit: an entry is included
 * only when it carries a real, in-range final score, and every other entry is
 * reported as an exclusion so a shrinking denominator is visible rather than
 * silent.
 */
export function aggregateTaskScores(
  entries: readonly TaskScoreEntry[],
): AggregateScore {
  const includedTaskIds: string[] = [];
  const excluded: { taskId: string; reason: string }[] = [];
  let total = 0;

  for (const entry of entries) {
    if (entry.finalScore === null) {
      excluded.push({
        taskId: entry.taskId,
        reason: entry.exclusionReason ?? "task has no final score",
      });
      continue;
    }
    if (
      !Number.isFinite(entry.finalScore) ||
      entry.finalScore < 0 ||
      entry.finalScore > MAX_TASK_SCORE
    ) {
      throw new RangeError(
        `aggregateTaskScores: task "${entry.taskId}" has an out-of-range final score ${entry.finalScore}; scores must lie within [0, ${MAX_TASK_SCORE}]`,
      );
    }
    includedTaskIds.push(entry.taskId);
    total += entry.finalScore;
  }

  return {
    mean: includedTaskIds.length === 0 ? null : total / includedTaskIds.length,
    includedTaskIds,
    excluded,
  };
}

/** Family score: the arithmetic mean of eligible task scores in that family. */
export function familyScore(
  entries: readonly TaskScoreEntry[],
  family: string,
): AggregateScore {
  return aggregateTaskScores(entries.filter((entry) => entry.family === family));
}

/** Country score: the arithmetic mean of eligible task scores in that market. */
export function countryScore(
  entries: readonly TaskScoreEntry[],
  country: string,
): AggregateScore {
  return aggregateTaskScores(
    entries.filter((entry) => entry.country === country),
  );
}
