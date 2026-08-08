import { z } from "zod";
import {
  scoreTaskAttempt,
  type TaskScoreBreakdown,
  type TaskScoreEntry,
} from "./score";

/**
 * Canonical MICA record schemas.
 *
 * Every fixture is parsed through these at module load, so an invalid or
 * mislabelled demo record fails the build rather than reaching a page.
 */

export const COUNTRY_CODES = ["kr", "jp", "sg", "tw", "th", "ae"] as const;
export const countryCodeSchema = z.enum(COUNTRY_CODES);
export type CountryCode = z.infer<typeof countryCodeSchema>;

export const TASK_FAMILY_IDS = [
  "email-calendar",
  "shopping-delivery",
  "travel-accommodation",
  "restaurants-local",
  "money-banking-investing",
  "mobility-transit",
  "healthcare-administration",
  "government-civic",
  "home-utilities",
  "telecom-subscriptions",
] as const;
export const taskFamilySchema = z.enum(TASK_FAMILY_IDS);
export type TaskFamilyId = z.infer<typeof taskFamilySchema>;

export const verificationStatusSchema = z.enum([
  "independent-rerun",
  "provisional",
  "self-reported",
]);
export type VerificationStatusId = z.infer<typeof verificationStatusSchema>;

export const resultTrackSchema = z.enum([
  "simulator",
  "live-shadow",
  "verified-live",
]);

/** Demo fixtures are always `demo`; the union leaves room for future editions. */
export const dataStatusSchema = z.enum(["demo", "preview", "official"]);

export const diagnosticAxisSchema = z.enum([
  "orchestration",
  "model-routing",
  "memory",
  "tool-api-use",
  "localization",
  "safety",
  "recovery",
]);

/**
 * Market integration taxonomy.
 *
 * These five dimensions describe how a real consumer journey in a market is
 * actually reached, authorised, completed, recovered and evidenced. They are
 * fixed execution conditions held equal across systems under access parity —
 * never difficulty bonuses, penalties or a ranking input.
 */
export const INTERACTION_SURFACES = [
  "open-web",
  "official-api",
  "signed-in-app",
  "super-app-channel",
  "qr-device-handoff",
  "human-handoff",
] as const;
export const interactionSurfaceSchema = z.enum(INTERACTION_SURFACES);
export type InteractionSurface = z.infer<typeof interactionSurfaceSchema>;

/** The strongest approval the journey demands before it can complete. */
export const AUTHORIZATION_BOUNDARIES = [
  "session-only",
  "otp",
  "carrier-identity",
  "government-identity",
  "payment-approval",
  "account-holder-confirmation",
] as const;
export const authorizationBoundarySchema = z.enum(AUTHORIZATION_BOUNDARIES);
export type AuthorizationBoundary = z.infer<typeof authorizationBoundarySchema>;

/**
 * When the declared final state actually becomes true. A tool call that
 * returned 200 is not a final state when completion is asynchronous or happens
 * off the agent's surface.
 */
export const COMPLETION_SEMANTICS = [
  "synchronous-confirmed",
  "asynchronous-pending",
  "out-of-band-completion",
  "human-confirmed",
] as const;
export const completionSemanticsSchema = z.enum(COMPLETION_SEMANTICS);
export type CompletionSemantics = z.infer<typeof completionSemanticsSchema>;

/** The way this situation characteristically goes wrong mid-journey. */
export const RECOVERY_CONDITIONS = [
  "partial-success",
  "stale-inventory-or-late-fee",
  "duplicate-or-retry-risk",
  "whole-form-invalidation",
  "channel-unavailable",
  "identity-handoff-timeout",
] as const;
export const recoveryConditionSchema = z.enum(RECOVERY_CONDITIONS);
export type RecoveryCondition = z.infer<typeof recoveryConditionSchema>;

/** What a future run has to produce before the situation counts as exercised. */
export const EVIDENCE_REQUIREMENTS = [
  "tool-call-lineage",
  "authoritative-response",
  "post-action-readback",
  "handoff-checkpoint",
  "retry-idempotency-record",
  "locale-formatted-artifact",
] as const;
export const evidenceRequirementSchema = z.enum(EVIDENCE_REQUIREMENTS);
export type EvidenceRequirement = z.infer<typeof evidenceRequirementSchema>;

/**
 * One representative local execution condition for a market.
 *
 * A situation is a declared plan, not a measurement. `status` is a single
 * literal for the whole edition so that no record can imply the situation has
 * been run against a system: nothing here has been exercised.
 */
export const integrationSituationSchema = z.object({
  /** Stable, country-prefixed identifier. Run evidence links to this string. */
  id: z.string().regex(/^[a-z]{2}-[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1),
  detail: z.string().min(1),
  /** Plain-language capability area, for readers who do not think in families. */
  capabilityArea: z.string().min(1),
  /** Task families this condition is expected to appear in. Scope, not proof. */
  families: z.array(taskFamilySchema).min(1),
  surfaces: z.array(interactionSurfaceSchema).min(1),
  authorization: authorizationBoundarySchema,
  completion: completionSemanticsSchema,
  recovery: z.array(recoveryConditionSchema).min(1),
  evidence: z.array(evidenceRequirementSchema).min(1),
  status: z.literal("declared-not-exercised").default("declared-not-exercised"),
  translations: z.object({
    ko: z.object({
      title: z.string().min(1),
      detail: z.string().min(1),
      capabilityArea: z.string().min(1),
    }),
  }),
});
export type IntegrationSituation = z.infer<typeof integrationSituationSchema>;

/**
 * The transparent minimum a market edition profile must span. It is set at what
 * the current country records can honestly carry — five representative
 * situations covering three surfaces, three authorisation boundaries, two
 * completion semantics, three recovery conditions and four evidence types — not
 * at a number chosen to look thorough.
 */
export const INTEGRATION_COVERAGE_MINIMUMS = {
  situations: 5,
  surfaces: 3,
  authorizations: 3,
  completions: 2,
  recoveries: 3,
  evidence: 4,
} as const;

export const integrationProfileSchema = z.object({
  /** One sentence stating what the profile is and what it is not. */
  summary: z.string().min(1),
  situations: z
    .array(integrationSituationSchema)
    .min(INTEGRATION_COVERAGE_MINIMUMS.situations),
  translations: z.object({ ko: z.object({ summary: z.string().min(1) }) }),
});
export type IntegrationProfile = z.infer<typeof integrationProfileSchema>;

export const countrySchema = z.object({
  code: countryCodeSchema,
  name: z.string().min(1),
  nativeName: z.string().min(1),
  locale: z.string().min(2),
  currency: z.string().length(3),
  currencySymbol: z.string().min(1),
  timezone: z.string().min(3),
  editionNote: z.string().min(1),
  /** Why this market is hard for a consumer agent, in operational terms. */
  hazards: z
    .array(
      z.object({
        title: z.string().min(1),
        detail: z.string().min(1),
        axis: diagnosticAxisSchema,
      }),
    )
    .min(3),
  whatLocalChanges: z.array(z.string().min(1)).min(3),
  /**
   * The declared market integration profile: the representative real-world
   * interaction conditions a validated task in this market is expected to meet.
   * It is an edition plan and a coverage contract, not evidence of any run.
   */
  integrationProfile: integrationProfileSchema,
}).superRefine((country, ctx) => {
  const ids = country.integrationProfile.situations.map(
    (situation) => situation.id,
  );
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["integrationProfile", "situations"],
        message: `integration situation id "${id}" is declared twice for ${country.code}.`,
      });
    }
    seen.add(id);
    // The id carries its market so run evidence can be checked for a
    // cross-country link without consulting a second table.
    if (!id.startsWith(`${country.code}-`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["integrationProfile", "situations"],
        message: `integration situation id "${id}" must be prefixed with its market code "${country.code}-".`,
      });
    }
  }
});
export type Country = z.infer<typeof countrySchema>;

/** One market's coverage against {@link INTEGRATION_COVERAGE_MINIMUMS}. */
export type IntegrationCoverageReport = {
  country: CountryCode;
  situations: number;
  surfaces: readonly InteractionSurface[];
  authorizations: readonly AuthorizationBoundary[];
  completions: readonly CompletionSemantics[];
  recoveries: readonly RecoveryCondition[];
  evidence: readonly EvidenceRequirement[];
  /** Stable, human-readable reasons this market falls short. Empty is a pass. */
  gaps: readonly string[];
};

export type IntegrationCoverageAudit = {
  byCountry: readonly IntegrationCoverageReport[];
  /** Markets MICA defines that carry no profile at all. */
  missingCountries: readonly CountryCode[];
  complete: boolean;
};

type CountryLike = Pick<Country, "code" | "integrationProfile">;

function distinct<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

/**
 * Audit the declared integration profiles across the markets MICA defines.
 *
 * The audit reports rather than throws, so a preview edition can expose its
 * own gaps honestly. {@link assertValidatedIntegrationCoverage} is the fail
 * closed wrapper a validated edition must pass.
 */
export function auditIntegrationCoverage(
  countries: readonly CountryLike[],
): IntegrationCoverageAudit {
  const byCode = new Map(countries.map((country) => [country.code, country]));
  const byCountry: IntegrationCoverageReport[] = [];
  const missingCountries: CountryCode[] = [];

  for (const code of COUNTRY_CODES) {
    const country = byCode.get(code);
    if (!country) {
      missingCountries.push(code);
      continue;
    }
    const situations = country.integrationProfile.situations;
    const surfaces = distinct(situations.flatMap((s) => s.surfaces));
    const authorizations = distinct(situations.map((s) => s.authorization));
    const completions = distinct(situations.map((s) => s.completion));
    const recoveries = distinct(situations.flatMap((s) => s.recovery));
    const evidence = distinct(situations.flatMap((s) => s.evidence));

    const gaps: string[] = [];
    const shortfalls: [string, number, number][] = [
      ["situations", situations.length, INTEGRATION_COVERAGE_MINIMUMS.situations],
      ["surfaces", surfaces.length, INTEGRATION_COVERAGE_MINIMUMS.surfaces],
      [
        "authorization boundaries",
        authorizations.length,
        INTEGRATION_COVERAGE_MINIMUMS.authorizations,
      ],
      [
        "completion semantics",
        completions.length,
        INTEGRATION_COVERAGE_MINIMUMS.completions,
      ],
      [
        "recovery conditions",
        recoveries.length,
        INTEGRATION_COVERAGE_MINIMUMS.recoveries,
      ],
      ["evidence types", evidence.length, INTEGRATION_COVERAGE_MINIMUMS.evidence],
    ];
    for (const [dimension, actual, required] of shortfalls) {
      if (actual < required) {
        gaps.push(`${dimension}: ${actual} of ${required} required`);
      }
    }

    byCountry.push({
      country: code,
      situations: situations.length,
      surfaces,
      authorizations,
      completions,
      recoveries,
      evidence,
      gaps,
    });
  }

  return {
    byCountry,
    missingCountries,
    complete:
      missingCountries.length === 0 &&
      byCountry.every((report) => report.gaps.length === 0),
  };
}

export class IntegrationCoverageError extends Error {
  constructor(problems: readonly string[]) {
    super(
      `MICA invariant violated: the market integration profile does not satisfy the coverage contract: ${problems.join("; ")}.`,
    );
    this.name = "IntegrationCoverageError";
  }
}

/**
 * Fail closed for a validated market edition: every market MICA defines must
 * carry a profile that meets the declared minimums, or nothing ships.
 */
export function assertValidatedIntegrationCoverage(
  countries: readonly CountryLike[],
): IntegrationCoverageAudit {
  const audit = auditIntegrationCoverage(countries);
  if (!audit.complete) {
    const problems = [
      ...audit.missingCountries.map((code) => `${code} has no profile`),
      ...audit.byCountry
        .filter((report) => report.gaps.length > 0)
        .map((report) => `${report.country} ${report.gaps.join(", ")}`),
    ];
    throw new IntegrationCoverageError(problems);
  }
  return audit;
}

/**
 * The situation ids each market declares. Zod cannot see the catalogue from
 * inside an attempt record, so linkage is checked against this index instead of
 * being guessed from the id string alone.
 */
export type IntegrationSituationIndex = ReadonlyMap<
  CountryCode,
  ReadonlySet<string>
>;

export function buildIntegrationSituationIndex(
  countries: readonly CountryLike[],
): IntegrationSituationIndex {
  return new Map(
    countries.map((country) => [
      country.code,
      new Set(country.integrationProfile.situations.map((s) => s.id)),
    ]),
  );
}

export const heroMissionSchema = z.object({
  id: z.string().min(1),
  country: countryCodeSchema,
  family: taskFamilySchema,
  title: z.string().min(1),
  persona: z.string().min(1),
  prompt: z.string().min(1),
  finalState: z.string().min(1),
  confirmationBoundary: z.string().min(1),
});
export type HeroMission = z.infer<typeof heroMissionSchema>;

/**
 * Where a task record stands in its own lifecycle. `candidate` is a drafted
 * catalogue definition and nothing more: it is not validated, not in use, and
 * carries no claim that it has been exercised against a system. Only
 * `validated` records may be described as part of a settled benchmark set.
 */
export const taskLifecycleSchema = z.enum(["candidate", "validated"]);
export type TaskLifecycle = z.infer<typeof taskLifecycleSchema>;

/**
 * Public and holdout ownership are separable by construction. A holdout record
 * must never reach a public export or a rendered page; the public catalogue is
 * derived by filtering, and the filter is asserted rather than assumed.
 */
export const taskSetSchema = z.enum(["public", "holdout"]);
export type TaskSet = z.infer<typeof taskSetSchema>;

/**
 * Execution surface. This is a fixed execution condition held equal across
 * systems under access parity — an app-only or identity-gated task is not
 * thereby a harder task, and this field must never be read as a difficulty
 * signal.
 */
export const taskSurfaceSchema = z.enum([
  "web",
  "app-only",
  "identity-gated",
  "phone-or-in-person",
  "mixed-surface",
]);
export type TaskSurface = z.infer<typeof taskSurfaceSchema>;

/**
 * How a correct run is expected to end. Stopping at an approval boundary,
 * refusing an out-of-scope request, or escalating to a human are correct
 * terminations, not degraded ones, so they are recorded on their own axis
 * instead of inflating a difficulty rating.
 */
export const terminationClassSchema = z.enum([
  "completed-final-state",
  "approval-handoff",
  "refusal",
  "escalation",
]);
export type TerminationClass = z.infer<typeof terminationClassSchema>;

/**
 * Declared structural complexity: how much work the task spans, stated by the
 * author and independent of both surface and termination class.
 */
export const declaredComplexitySchema = z.enum([
  "single-step",
  "multi-step",
  "cross-session",
]);
export type DeclaredComplexity = z.infer<typeof declaredComplexitySchema>;

export const marketApplicabilitySchema = z.enum([
  "applicable",
  "variant-required",
  "not-applicable",
]);

export const marketApplicabilityEntrySchema = z.object({
  market: countryCodeSchema,
  applicability: marketApplicabilitySchema,
  /** Why this market is in, out, or in only as a variant. */
  note: z.string().min(1),
});

/** Fields a candidate may omit but a validated task must carry. */
export const TASK_PROMOTION_FIELDS = [
  "surface",
  "terminationClass",
  "declaredComplexity",
  "diagnosticAxes",
  "marketApplicability",
] as const;
export type TaskPromotionField = (typeof TASK_PROMOTION_FIELDS)[number];

const baseCanonicalTaskSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: z.string().min(1),
  finalState: z.string().min(1),
  confirmationBoundary: z.string().min(1),
  markets: z.array(countryCodeSchema).min(1),
  /**
   * Defaults are the weakest truthful claim: an unannotated record is a
   * provisional candidate, and it is public rather than holdout so that
   * omitting the field can never silently create hidden content.
   */
  lifecycle: taskLifecycleSchema.default("candidate"),
  taskSet: taskSetSchema.default("public"),
  /** Orthogonal authoring metadata. Optional while a task is a candidate. */
  surface: taskSurfaceSchema.optional(),
  terminationClass: terminationClassSchema.optional(),
  declaredComplexity: declaredComplexitySchema.optional(),
  diagnosticAxes: z.array(diagnosticAxisSchema).min(1).optional(),
  marketApplicability: z.array(marketApplicabilityEntrySchema).min(1).optional(),
  /**
   * The public UI is English and Korean only. `translations` therefore carries
   * a Korean overlay and nothing else; no other language may be implied.
   */
  translations: z.object({
    ko: z.object({
      title: z.string().min(1),
      finalState: z.string().min(1),
      confirmationBoundary: z.string().min(1),
    }),
  }),
});

/** A task record after defaults are applied, before promotion is checked. */
export type CanonicalTaskInput = z.input<typeof baseCanonicalTaskSchema>;
export type CanonicalTask = z.infer<typeof baseCanonicalTaskSchema>;

/**
 * Every reason a task cannot be promoted from candidate to validated, in a
 * stable order. An empty list is the only thing that authorises promotion.
 */
export function taskPromotionGaps(task: CanonicalTask): readonly string[] {
  const gaps: string[] = [];

  for (const field of TASK_PROMOTION_FIELDS) {
    if (task[field] === undefined) gaps.push(`missing ${field}`);
  }

  const applicability = task.marketApplicability;
  if (applicability) {
    // Differentiated applicability means an explicit, per-market decision for
    // every market MICA defines — not one blanket answer reused everywhere.
    const declared = applicability.map((entry) => entry.market);
    const unique = new Set(declared);
    if (unique.size !== declared.length) {
      gaps.push("marketApplicability repeats a market");
    }
    for (const code of COUNTRY_CODES) {
      if (!unique.has(code)) {
        gaps.push(`marketApplicability omits ${code}`);
      }
    }

    // The market list and the applicability decisions must be the same claim
    // stated once, so a task cannot run where it declared itself inapplicable.
    const runnable = applicability
      .filter((entry) => entry.applicability !== "not-applicable")
      .map((entry) => entry.market)
      .sort()
      .join(",");
    const markets = [...task.markets].sort().join(",");
    if (runnable !== markets) {
      gaps.push(
        `markets (${markets || "none"}) disagree with applicable markets (${runnable || "none"})`,
      );
    }
  }

  return gaps;
}

export function isTaskPromotable(task: CanonicalTask): boolean {
  return taskPromotionGaps(task).length === 0;
}

export class TaskPromotionError extends Error {
  constructor(taskId: string, gaps: readonly string[]) {
    super(
      `MICA invariant violated: task "${taskId}" is marked lifecycle:"validated" but does not satisfy the promotion contract: ${gaps.join("; ")}.`,
    );
    this.name = "TaskPromotionError";
  }
}

/**
 * Fail closed on promotion: a record may only call itself validated once the
 * orthogonal metadata a validated task is defined by is actually present.
 */
export const canonicalTaskSchema = baseCanonicalTaskSchema.superRefine(
  (task, ctx) => {
    if (task.lifecycle !== "validated") return;
    for (const gap of taskPromotionGaps(task)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lifecycle"],
        message: `Task "${task.id}" cannot be validated: ${gap}.`,
      });
    }
  },
);

export const taskFamilyRecordSchema = z.object({
  id: taskFamilySchema,
  label: z.string().min(1),
  summary: z.string().min(1),
  whyItIsHard: z.string().min(1),
  canonicalTasks: z.array(canonicalTaskSchema).length(10),
});
export type TaskFamilyRecord = z.infer<typeof taskFamilyRecordSchema>;

export class HoldoutLeakError extends Error {
  constructor(where: string, taskId: string) {
    super(
      `MICA invariant violated: ${where} contains holdout task "${taskId}". Holdout tasks must never be exported or rendered publicly.`,
    );
    this.name = "HoldoutLeakError";
  }
}

/** The shape a family takes once holdout records have been removed. */
export type PublicTaskFamily = Omit<TaskFamilyRecord, "canonicalTasks"> & {
  canonicalTasks: readonly CanonicalTask[];
};

/** Throws if any task in `families` is holdout. Used to guard public output. */
export function assertNoHoldoutTasks(
  families: readonly {
    id: string;
    canonicalTasks: readonly CanonicalTask[];
  }[],
  where: string,
): void {
  for (const family of families) {
    for (const task of family.canonicalTasks) {
      if (task.taskSet === "holdout") {
        throw new HoldoutLeakError(`${where} (${family.id})`, task.id);
      }
    }
  }
}

/**
 * The only supported way to obtain a task catalogue for public rendering or
 * export. Holdout records are dropped, and the result is re-checked so a future
 * refactor that breaks the filter fails loudly instead of publishing.
 */
export function toPublicTaskCatalogue(
  families: readonly TaskFamilyRecord[],
): readonly PublicTaskFamily[] {
  const publicFamilies = families.map((family) => ({
    ...family,
    canonicalTasks: family.canonicalTasks.filter(
      (task) => task.taskSet === "public",
    ),
  }));
  assertNoHoldoutTasks(publicFamilies, "public task catalogue");
  return publicFamilies;
}

export const systemSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  operator: z.string().min(1),
  snapshotVersion: z.string().min(1),
  snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** A snapshot describes the whole system, not a bare model. */
  composition: z.object({
    orchestrator: z.string().min(1),
    models: z.array(z.string().min(1)).min(1),
    tools: z.array(z.string().min(1)).min(1),
    memory: z.string().min(1),
  }),
  summary: z.string().min(1),
  verification: verificationStatusSchema,
  track: resultTrackSchema,
  dataStatus: dataStatusSchema,
  publicationEligible: z.boolean(),
});
export type SystemRecord = z.infer<typeof systemSchema>;

/**
 * Canonical run aggregate: one system × country × family cell.
 * All derived views are computed from these; nothing is stored twice.
 */
export const runCellSchema = z.object({
  system: z.string().min(1),
  country: countryCodeSchema,
  family: taskFamilySchema,
  /** Attempts that passed eligibility screening (the denominator). */
  eligibleRuns: z.number().int().min(0),
  successfulRuns: z.number().int().min(0),
  /** Canonical tasks attempted / canonical tasks defined for the market. */
  tasksAttempted: z.number().int().min(0),
  tasksDefined: z.number().int().min(1),
  /** Wall-clock seconds for successful eligible runs only. */
  successLatenciesSec: z.array(z.number().min(0)),
  /**
   * Wall-clock seconds for every eligible attempt, successful or not. Recorded
   * so the reported population is auditable; the published p50/p95 are still
   * taken from successful runs only, so fast failure never reads as fast
   * success.
   */
  allEligibleLatenciesSec: z.array(z.number().min(0)),
  /** Total cost of ALL eligible attempts, in the country's currency. */
  totalEligibleCost: z.number().min(0),
  criticalSafetyEvents: z.number().int().min(0),
  dataStatus: dataStatusSchema,
  publicationEligible: z.boolean(),
}).superRefine((cell, ctx) => {
  // Cross-field contradictions. Field-level rules cannot see siblings, so the
  // counts and their latency populations are reconciled here: a cell that
  // disagrees with itself is a data-entry fault, not a publishable record.
  if (cell.successfulRuns > cell.eligibleRuns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["successfulRuns"],
      message: `successfulRuns (${cell.successfulRuns}) cannot exceed eligibleRuns (${cell.eligibleRuns}).`,
    });
  }
  if (cell.successLatenciesSec.length !== cell.successfulRuns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["successLatenciesSec"],
      message: `successLatenciesSec has ${cell.successLatenciesSec.length} entries but successfulRuns is ${cell.successfulRuns}.`,
    });
  }
  if (cell.allEligibleLatenciesSec.length !== cell.eligibleRuns) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["allEligibleLatenciesSec"],
      message: `allEligibleLatenciesSec has ${cell.allEligibleLatenciesSec.length} entries but eligibleRuns is ${cell.eligibleRuns}.`,
    });
  }
  if (cell.tasksAttempted > cell.tasksDefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tasksAttempted"],
      message: `tasksAttempted (${cell.tasksAttempted}) cannot exceed tasksDefined (${cell.tasksDefined}).`,
    });
  }
});
export type RunCell = z.infer<typeof runCellSchema>;

/**
 * Pre-registered scoring references for one executable task version.
 *
 * These belong to a validated, runnable task version and are declared before
 * any run. They are evaluator references, never post-hoc cohort baselines, so
 * they cannot be re-derived from the results they score. Provisional catalogue
 * candidates carry none, and nothing invents one for them.
 */
export const taskScoringReferencesSchema = z.object({
  speedTargetSec: z.number().finite().positive(),
  costTargetUsd: z.number().finite().positive(),
});
export type TaskScoringReferencesRecord = z.infer<
  typeof taskScoringReferencesSchema
>;

/**
 * How an attempt ended. Exactly one value means success; every other value is a
 * non-success completion outcome and scores accuracy 0, with no partial credit.
 */
export const attemptOutcomeSchema = z.enum([
  "confirmed-success",
  "incorrect-final-state",
  "incomplete",
  "boundary-violation",
  "tool-or-api-failure",
  "refused-in-scope-request",
  "timeout",
  "aborted",
]);
export type AttemptOutcome = z.infer<typeof attemptOutcomeSchema>;

export const SUCCESS_OUTCOME = "confirmed-success" as const;

/**
 * One model call made while performing a task.
 *
 * Model routing is evidence, not configuration. An agent may pick a different
 * model per task and may call several models within one task; whatever it did
 * must appear here, call by call, or the attempt cannot be scored. Nothing in
 * the schema presumes a single global model, a fixed provider, or a fixed
 * number of calls.
 */
export const modelInvocationSchema = z.object({
  /** 1-based position in the call sequence for this attempt. */
  order: z.number().int().min(1),
  provider: z.string().min(1),
  modelId: z.string().min(1),
  /** Version or immutable snapshot identifier — never a floating alias alone. */
  modelVersion: z.string().min(1),
  /** What this call was for: planner, extractor, verifier, and so on. */
  purpose: z.string().min(1),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  latencySec: z.number().finite().nonnegative(),
  costUsd: z.number().finite().nonnegative(),
});
export type ModelInvocation = z.infer<typeof modelInvocationSchema>;

/** Float-tolerant equality for summed money, to 1e-9 USD. */
const COST_EPSILON_USD = 1e-9;
function costsAgree(a: number, b: number): boolean {
  return Math.abs(a - b) <= COST_EPSILON_USD;
}

const baseTaskAttemptResultSchema = z.object({
  attemptId: z.string().min(1),
  /** The system snapshot under test, tied to a `systemSchema` record. */
  system: z.string().min(1),
  systemSnapshotVersion: z.string().min(1),
  market: countryCodeSchema,
  family: taskFamilySchema,
  taskId: z.string().min(1),
  /** The executable task version the references were registered against. */
  taskVersion: z.string().min(1),
  /**
   * What kind of record this is. Synthetic fixtures exist for schema and unit
   * work and claim nothing about a market; only a validated localized attempt
   * asserts that a real local execution condition was exercised, and only that
   * class is required to name the situation it exercised.
   */
  attemptClass: z
    .enum(["synthetic-fixture", "validated-localized"])
    .default("synthetic-fixture"),
  /**
   * The market integration situations this attempt exercised. Required for a
   * validated localized attempt, so run evidence always states which local
   * special situation it stands for rather than leaving it to be inferred.
   */
  integrationSituationIds: z.array(z.string().min(1)).min(1).optional(),
  outcome: attemptOutcomeSchema,
  /**
   * Optional stored mirror of the binary accuracy component. It is redundant
   * with `outcome` by design and is cross-checked below; the score itself is
   * never stored, only derived.
   */
  accuracy: z.union([z.literal(0), z.literal(1)]).optional(),
  /** Raw wall-clock seconds. Kept visible even though a score now exists. */
  observedLatencySec: z.number().finite().positive(),
  /** Evaluation execution cost in USD for model calls only. */
  modelCostUsd: z.number().finite().nonnegative(),
  /** Evaluation execution cost in USD for tool and API usage. */
  toolApiCostUsd: z.number().finite().nonnegative().default(0),
  /**
   * Total evaluation execution cost in USD. Additive contract: it is exactly
   * model cost plus tool/API cost. This is execution spend, not a transaction
   * price and not a market-local purchase amount, so no currency conversion
   * ever enters the score.
   */
  observedCostUsd: z.number().finite().nonnegative(),
  scoringReferences: taskScoringReferencesSchema,
  modelInvocations: z.array(modelInvocationSchema).min(1),
  /** Whether the attempt passed eligibility screening for aggregation. */
  eligible: z.boolean().default(true),
  dataStatus: dataStatusSchema,
  publicationEligible: z.boolean(),
});

/**
 * A scored task attempt: system snapshot, market, family, task version,
 * outcome, raw latency and cost, pre-registered references, and the full model
 * routing trail. Everything the official per-task score is computed from, and
 * nothing that duplicates the score itself.
 */
export const taskAttemptResultSchema = baseTaskAttemptResultSchema.superRefine(
  (attempt, ctx) => {
    const invocations = attempt.modelInvocations;

    // Ordering: a strict 1..n sequence. Duplicated or gapped orders would make
    // the routing trail unreconstructable.
    const orders = invocations.map((call) => call.order);
    const unique = new Set(orders);
    if (unique.size !== orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modelInvocations"],
        message: "modelInvocations repeat an invocation order.",
      });
    } else {
      const expected = orders.length;
      const sorted = [...orders].sort((a, b) => a - b);
      const contiguous = sorted.every((order, index) => order === index + 1);
      if (!contiguous) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["modelInvocations"],
          message: `modelInvocations must be numbered 1..${expected} with no gaps.`,
        });
      }
      if (orders.some((order, index) => index > 0 && order < orders[index - 1])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["modelInvocations"],
          message: "modelInvocations must be listed in invocation order.",
        });
      }
    }

    // Cost: exact additive contract in both directions. Summed calls are the
    // model cost, and model plus tool/API cost is the total.
    const summed = invocations.reduce((total, call) => total + call.costUsd, 0);
    if (!costsAgree(summed, attempt.modelCostUsd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["modelCostUsd"],
        message: `modelInvocations sum to ${summed} USD but modelCostUsd is ${attempt.modelCostUsd}.`,
      });
    }
    const totalParts = attempt.modelCostUsd + attempt.toolApiCostUsd;
    if (!costsAgree(totalParts, attempt.observedCostUsd)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["observedCostUsd"],
        message: `observedCostUsd (${attempt.observedCostUsd}) must equal modelCostUsd + toolApiCostUsd (${totalParts}).`,
      });
    }

    // A single call cannot have taken longer than the attempt that contains it.
    for (const call of invocations) {
      if (call.latencySec > attempt.observedLatencySec) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["modelInvocations"],
          message: `invocation ${call.order} took ${call.latencySec}s, longer than the attempt's ${attempt.observedLatencySec}s.`,
        });
      }
    }

    // A validated localized attempt must name the local condition it exercised.
    // Which ids exist is a catalogue question and is checked separately by
    // `integrationLinkageGaps`; what the schema can enforce alone is that the
    // claim is present at all, and that duplicates are not padding it.
    const links = attempt.integrationSituationIds;
    if (attempt.attemptClass === "validated-localized" && !links) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["integrationSituationIds"],
        message:
          "a validated localized attempt must link at least one market integration situation.",
      });
    }
    if (links && new Set(links).size !== links.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["integrationSituationIds"],
        message: "integrationSituationIds repeat a situation.",
      });
    }

    // The stored accuracy mirror, when present, must agree with the outcome.
    if (attempt.accuracy !== undefined) {
      const implied = attempt.outcome === SUCCESS_OUTCOME ? 1 : 0;
      if (attempt.accuracy !== implied) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accuracy"],
          message: `outcome "${attempt.outcome}" implies accuracy ${implied}, but ${attempt.accuracy} was recorded.`,
        });
      }
    }
  },
);
export type TaskAttemptResult = z.infer<typeof baseTaskAttemptResultSchema>;

/**
 * Every reason an attempt's declared integration linkage does not hold against
 * the catalogue, in a stable order. An empty list is the only thing that lets a
 * validated localized attempt be accepted.
 */
export function integrationLinkageGaps(
  attempt: Pick<
    TaskAttemptResult,
    "market" | "attemptClass" | "integrationSituationIds"
  >,
  index: IntegrationSituationIndex,
): readonly string[] {
  const gaps: string[] = [];
  const links = attempt.integrationSituationIds ?? [];

  if (attempt.attemptClass === "validated-localized" && links.length === 0) {
    gaps.push("links no market integration situation");
  }

  const declared = index.get(attempt.market) ?? new Set<string>();
  for (const id of links) {
    if (declared.has(id)) continue;
    // A situation from another market is a different failure from one that does
    // not exist at all, and the two are worth telling apart in the message.
    const owner = [...index.entries()].find(([, ids]) => ids.has(id))?.[0];
    gaps.push(
      owner
        ? `situation "${id}" belongs to market ${owner}, not ${attempt.market}`
        : `situation "${id}" is not declared by any market`,
    );
  }

  return gaps;
}

export class IntegrationLinkageError extends Error {
  constructor(attemptId: string, gaps: readonly string[]) {
    super(
      `MICA invariant violated: attempt "${attemptId}" declares invalid market integration linkage: ${gaps.join("; ")}.`,
    );
    this.name = "IntegrationLinkageError";
  }
}

/**
 * Fail closed on linkage. The catalogue is passed in rather than imported, so
 * the schema layer keeps no dependency on the demo fixtures.
 */
export function assertIntegrationLinkage(
  attempt: TaskAttemptResult,
  index: IntegrationSituationIndex,
): TaskAttemptResult {
  const gaps = integrationLinkageGaps(attempt, index);
  if (gaps.length > 0) throw new IntegrationLinkageError(attempt.attemptId, gaps);
  return attempt;
}

/**
 * The official score of an attempt, computed from its raw evidence. Deriving it
 * here — rather than reading a stored field — is what stops a score and the
 * numbers it claims to summarise from drifting apart.
 */
export function taskAttemptScore(
  attempt: TaskAttemptResult,
): TaskScoreBreakdown {
  return scoreTaskAttempt(
    {
      success: attempt.outcome === SUCCESS_OUTCOME,
      observedLatencySec: attempt.observedLatencySec,
      observedCostUsd: attempt.observedCostUsd,
    },
    attempt.scoringReferences,
  );
}

/**
 * Aggregation input for one attempt. Ineligible attempts become an explicit
 * `null` with a reason rather than a zero, so they shrink the denominator
 * visibly instead of dragging the mean down invisibly.
 */
export function taskAttemptScoreEntry(
  attempt: TaskAttemptResult,
): TaskScoreEntry {
  if (!attempt.eligible) {
    return {
      taskId: attempt.taskId,
      family: attempt.family,
      country: attempt.market,
      finalScore: null,
      exclusionReason: "attempt did not pass eligibility screening",
    };
  }
  return {
    taskId: attempt.taskId,
    family: attempt.family,
    country: attempt.market,
    finalScore: taskAttemptScore(attempt).finalScore,
  };
}

export class DemoEligibilityError extends Error {
  constructor(what: string) {
    super(
      `MICA invariant violated: ${what} is marked dataStatus:"demo" but claims publicationEligible:true. Demo data can never be publication eligible.`,
    );
    this.name = "DemoEligibilityError";
  }
}

/**
 * Guard applied to every fixture collection. Throws — deliberately loudly — if
 * illustrative data ever claims official standing.
 */
export function assertDemoInvariants<
  T extends { dataStatus: string; publicationEligible: boolean },
>(records: readonly T[], label: (record: T) => string): readonly T[] {
  for (const record of records) {
    if (record.dataStatus === "demo" && record.publicationEligible) {
      throw new DemoEligibilityError(label(record));
    }
  }
  return records;
}
