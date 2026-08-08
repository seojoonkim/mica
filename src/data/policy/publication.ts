/**
 * Publication gate policy.
 *
 * Verification status, coverage, sample size and safety events decide whether a
 * result may ever appear as an official MICA figure. The numeric thresholds are
 * deliberately unset in this preview, so the gate refuses everything and says
 * why. Demo and preview fixtures are excluded by construction as well.
 */

export const VERIFICATION_STATUSES = [
  {
    id: "independent-rerun",
    label: "Independent rerun",
    short: "IND",
    description:
      "MICA re-executed the submitted system snapshot on MICA-controlled accounts and infrastructure, and holds the full evidence trace.",
    publicationTrack: true,
  },
  {
    id: "provisional",
    label: "Provisional",
    short: "PROV",
    description:
      "MICA observed a partial or supervised run, or holds evidence for only part of the claimed coverage. Reported, never published as official.",
    publicationTrack: false,
  },
  {
    id: "self-reported",
    label: "Self-reported",
    short: "SELF",
    description:
      "Submitted by the system's operator with an evidence trace MICA has not reproduced. Displayed for transparency only.",
    publicationTrack: false,
  },
] as const;

/**
 * The wording used whenever the gate is asked to judge a result before MICA has
 * agreed what "enough" means. It is a blocker, never a caveat on a pass.
 */
export const THRESHOLDS_NOT_SET =
  "Publication thresholds are not set for this edition: MICA has not yet agreed runs per task, a minimum cell sample size, task coverage, or a maximum ineligible discard rate, so no result can be marked publication eligible.";

export const PUBLICATION_RULES = {
  /**
   * Minimum eligible attempts on a country × family cell before publication.
   * `null` means MICA has not set the threshold — not that any number passes.
   */
  minEligibleRuns: null,
  /** Minimum share of the country's canonical tasks attempted, or `null`. */
  minCoverage: null,
  /** Minimum eligible attempts for every canonical task, calibrated in the pilot. */
  minRunsPerTask: null,
  /** Maximum share of attempted runs discarded as ineligible, calibrated in the pilot. */
  maxIneligibleDiscardRate: null,
  /** A score is withheld unless the pre-registered canonical task set is complete. */
  requiresCompleteCanonicalSet: true,
  /** Any critical safety event permanently blocks publication of the cell. */
  criticalSafetyBlocks: true,
  /** A blocked cell withholds every aggregate above it instead of disappearing. */
  safetyBlockScope: "aggregate-withheld",
} as const;

/** Data statuses that can never reach publication, whatever else is true. */
export const NEVER_PUBLISHABLE_STATUSES = ["demo", "preview"] as const;

export const RESULT_TRACKS = [
  {
    id: "simulator",
    label: "Simulator",
    description:
      "Deterministic local replicas of common local service flows. Reproducible, cheap, and the only track where MICA can guarantee identical conditions across systems.",
    publicationTrack: true,
  },
  {
    id: "live-shadow",
    label: "Live shadow",
    description:
      "The system acts against real services but stops at the confirmation boundary; no irreversible action is taken. Used to check that simulator behaviour transfers.",
    publicationTrack: true,
  },
  {
    id: "verified-live",
    label: "Limited verified live",
    description:
      "A small number of end-to-end runs on MICA-held test accounts where the operator of the service has been notified. Narrow by design.",
    publicationTrack: true,
  },
] as const;

export const EVIDENCE_LABELS = {
  measured: {
    id: "measured",
    label: "Measured",
    description: "A value read directly from run records. No inference.",
  },
  interpretation: {
    id: "interpretation",
    label: "MICA interpretation",
    description:
      "MICA's reading of what the measured values mean. Contestable, and signed by the edition.",
  },
  recommendation: {
    id: "recommendation",
    label: "Recommendation",
    description:
      "Advice for builders or buyers. Never a claim of measurement.",
  },
} as const;
