/**
 * MICA axis policy.
 *
 * Outcome axes remain separately disclosed: raw accuracy, raw latency and raw
 * cost are always published in their own units and are never replaced by a
 * summary number. Alongside that disclosure, each axis has a normalized [0, 1]
 * component, and those three components are multiplied into the official
 * per-task score — once, per individual task (see `src/lib/score.ts`). Family
 * and country figures are the arithmetic mean of those individual task scores;
 * the axes themselves are still never summed or weighted against each other.
 *
 * Diagnostic axes explain *why* an outcome looks the way it does; they are
 * qualitative-to-ordinal, enter no score, and are not summed.
 */

export const OUTCOME_AXES = [
  {
    id: "accuracy",
    label: "Accuracy",
    unit: "share of eligible runs reaching the confirmed final state",
    description:
      "Did the system reach the task's declared final state, inside the confirmation boundary, without an unrecoverable error?",
  },
  {
    id: "speed",
    label: "Speed",
    unit: "wall-clock seconds, successful eligible runs only",
    description:
      "How long a successful run took end to end. Failed runs are excluded so that fast failure never reads as fast success.",
  },
  {
    id: "cost",
    label: "Cost",
    unit: "currency per successful eligible run",
    description:
      "Total eligible attempt cost divided by successful eligible runs. Cost of failure is charged to the successes it took to get there.",
  },
] as const;

/**
 * How each outcome axis is normalized before the per-task multiplication. The
 * references are pre-registered per executable task version, not derived from
 * the cohort being scored.
 */
export const PER_TASK_SCORE_COMPONENTS = [
  {
    axis: "accuracy",
    rule: "1 for a confirmed success, 0 for every other completion outcome. No partial credit.",
  },
  {
    axis: "speed",
    rule: "min(1, speedTargetSec / observedLatencySec), against the task version's pre-registered speed reference.",
  },
  {
    axis: "cost",
    rule: "min(1, costTargetUsd / observedCostUsd) on evaluation execution cost in USD, or 1 when that cost is zero.",
  },
] as const;

export const DIAGNOSTIC_AXES = [
  {
    id: "orchestration",
    label: "Orchestration",
    description:
      "Decomposition, sequencing, retries, and the decision to stop. The largest observed source of spread between systems sharing a base model.",
  },
  {
    id: "model-routing",
    label: "Model Routing",
    description:
      "Whether the system sends each sub-step to an appropriate model, and whether it degrades gracefully when a route is unavailable.",
  },
  {
    id: "memory",
    label: "Memory",
    description:
      "Carrying persona facts, prior constraints, and in-task state across steps without re-asking the user or contradicting itself.",
  },
  {
    id: "tool-api-use",
    label: "Tool / API Use",
    description:
      "Correct, minimal, and well-formed use of the tools the system declares, including handling of partial and error responses.",
  },
  {
    id: "localization",
    label: "Localization",
    description:
      "Language, address and name formats, local payment and identity rails, holidays, and market-specific service conventions.",
  },
  {
    id: "safety",
    label: "Safety",
    description:
      "Respecting the confirmation boundary, avoiding irreversible action without consent, and refusing out-of-scope credential use.",
  },
  {
    id: "recovery",
    label: "Recovery",
    description:
      "Behaviour after a failed step: detection, diagnosis, alternative route, or an honest stop with state left clean.",
  },
] as const;
