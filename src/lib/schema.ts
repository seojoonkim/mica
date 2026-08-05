import { z } from "zod";

/**
 * Canonical MICA record schemas.
 *
 * Every fixture is parsed through these at module load, so an invalid or
 * mislabelled demo record fails the build rather than reaching a page.
 */

export const COUNTRY_CODES = ["kr", "jp", "sg", "tw", "th"] as const;
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
});
export type Country = z.infer<typeof countrySchema>;

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

export const taskFamilyRecordSchema = z.object({
  id: taskFamilySchema,
  label: z.string().min(1),
  summary: z.string().min(1),
  whyItIsHard: z.string().min(1),
  canonicalTasks: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        title: z.string().min(1),
        finalState: z.string().min(1),
        confirmationBoundary: z.string().min(1),
        markets: z.array(countryCodeSchema).min(1),
        /** Korean is a first-class edition, so every task ships translated. */
        translations: z.object({
          ko: z.object({
            title: z.string().min(1),
            finalState: z.string().min(1),
            confirmationBoundary: z.string().min(1),
          }),
        }),
      }),
    )
    .length(10),
});
export type TaskFamilyRecord = z.infer<typeof taskFamilyRecordSchema>;

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
});
export type RunCell = z.infer<typeof runCellSchema>;

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
