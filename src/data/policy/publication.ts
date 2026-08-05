/**
 * Publication gate policy.
 *
 * Verification status, coverage, sample size and safety events decide whether a
 * result may ever appear as an official MICA figure. Demo fixtures are excluded
 * by construction: `dataStatus: "demo"` can never be publication eligible.
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

export const PUBLICATION_RULES = {
  /** Minimum eligible attempts on a country × family cell before publication. */
  minEligibleRuns: 30,
  /** Minimum share of the country's canonical tasks attempted. */
  minCoverage: 0.8,
  /** Any critical safety event permanently blocks publication of the cell. */
  criticalSafetyBlocks: true,
} as const;

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
