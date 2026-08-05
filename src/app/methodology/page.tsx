import Link from "next/link";
import type { Metadata } from "next";
import { OUTCOME_AXES, DIAGNOSTIC_AXES } from "@/data/policy/axes";
import {
  PUBLICATION_RULES,
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
  EVIDENCE_LABELS,
} from "@/data/policy/publication";
import { NO_SUCCESS, NO_DATA, NOT_MEASURED } from "@/lib/format";
import { DataList, DemoDisclosure, PageHeader, Section } from "@/components/editorial";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How MICA defines eligibility, measures accuracy, speed and cost, and decides what may be published.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Methodology draft"
        title="What we measure, and what we refuse to measure"
        standfirst="MICA is a measurement instrument before it is a league table. This page states the definitions, the gates and the known limits, so a disagreement can be about the method rather than about the number."
      >
        <DemoDisclosure detail="The method described here is real. The figures used to exercise it across this site are illustrative demo data and not an official ranking." />
      </PageHeader>

      <Section
        eyebrow="Definitions"
        title="The three outcome axes"
        intro="These are reported side by side, always. MICA publishes no composite score, and will not accept one from a submitter either — a weighting is a buyer's judgement, not a measurement."
      >
        <DataList
          items={OUTCOME_AXES.map((axis) => ({
            term: axis.label,
            detail: (
              <>
                <span className="mica-eyebrow mr-2">{axis.unit}</span>
                {axis.description}
              </>
            ),
          }))}
        />
      </Section>

      <Section
        eyebrow="Counting rules"
        title="Eligibility and denominators"
        intro="Most disputes about benchmarks are really disputes about denominators, so MICA writes its own down."
      >
        <div className="mica-prose text-[15px] text-[var(--color-ink-soft)]">
          <p>
            An <strong>eligible run</strong> is an attempt that passed screening:
            the environment was reachable, the persona and its accounts were in
            the declared starting state, and no MICA-side fault interrupted the
            run. Ineligible attempts are discarded before scoring rather than
            counted as failures.
          </p>
          <p>
            <strong>Accuracy</strong> is successful eligible runs divided by
            eligible runs, reported with a 95% Wilson score interval. The Wilson
            interval is used instead of the normal approximation because MICA
            cells are small and often sit near 0 or 1, where the normal
            approximation misbehaves.
          </p>
          <p>
            <strong>Speed</strong> uses wall-clock seconds from successful
            eligible runs only, reported as p50 and p90. Failed runs are
            excluded deliberately: if they were included, a system that gives up
            quickly would read as fast.
          </p>
          <p>
            <strong>Cost</strong> is the total cost of all eligible attempts
            divided by the number of successful ones, in the market&rsquo;s own
            currency. The cost of failure is charged to the successes it took to
            get there. With zero successes the value does not exist, and the
            table says &ldquo;{NO_SUCCESS}&rdquo; rather than showing a zero or
            an infinity.
          </p>
          <p>
            Cross-market figures use a <strong>country macro-average</strong>:
            the mean of per-country values, computed only when every market is
            present. A missing market withholds the global figure instead of
            being treated as a zero.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Missing values"
        title="What each phrase means"
        intro="MICA never renders an unknown as a number. These are the exact strings used across the site."
      >
        <DataList
          items={[
            {
              term: NO_SUCCESS,
              detail:
                "There were eligible attempts, but none reached the declared final state, so speed and cost per success are undefined.",
            },
            {
              term: NO_DATA,
              detail:
                "The system has no eligible run cells for this market or slice at all. This is an absence of evidence, not a poor result.",
            },
            {
              term: NOT_MEASURED,
              detail:
                "The axis was not assessed for this snapshot. It is not a low reading.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Diagnostics"
        title="Seven diagnostic axes"
        intro="Ordinal readings from 1 to 5 that explain an outcome. They are never summed, never averaged into an outcome, and never presented as a score."
      >
        <DataList
          items={DIAGNOSTIC_AXES.map((axis) => ({
            term: axis.label,
            detail: axis.description,
          }))}
        />
      </Section>

      <Section
        eyebrow="Evidence"
        title="Verification status and result tracks"
        intro="Every figure carries how it was obtained. Only independently rerun results on a publication track can ever become official."
      >
        <DataList
          items={[
            ...VERIFICATION_STATUSES.map((status) => ({
              term: `${status.label} · ${status.short}`,
              detail: `${status.description} ${
                status.publicationTrack
                  ? "On the publication track."
                  : "Never published as official."
              }`,
            })),
            ...RESULT_TRACKS.map((track) => ({
              term: track.label,
              detail: track.description,
            })),
          ]}
        />
      </Section>

      <Section
        eyebrow="The gate"
        title="Publication rules"
        intro="A cell must clear every condition below. Failing any one of them means the cell is shown with its blockers stated, not hidden."
      >
        <DataList
          items={[
            {
              term: "Minimum eligible runs",
              detail: `${PUBLICATION_RULES.minEligibleRuns} eligible attempts on a country × family cell.`,
            },
            {
              term: "Minimum coverage",
              detail: `${(PUBLICATION_RULES.minCoverage * 100).toFixed(0)}% of the market's canonical tasks attempted.`,
            },
            {
              term: "Critical safety events",
              detail: PUBLICATION_RULES.criticalSafetyBlocks
                ? "Any critical safety event permanently blocks publication of the cell. There is no appeal and no re-run to erase it."
                : "Recorded but non-blocking.",
            },
            {
              term: "Verification",
              detail:
                "Independent rerun only. Provisional and self-reported results are displayed for transparency and never published as official.",
            },
            {
              term: "Data status",
              detail:
                "Demo data can never be publication eligible. This is enforced in the schema layer, which throws at build time if a demo record claims otherwise.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Claims"
        title="Measurement, interpretation, recommendation"
        intro="MICA separates what it observed from what it thinks it means and from what it advises. Only the first is a measurement."
      >
        <DataList
          items={Object.values(EVIDENCE_LABELS).map((label) => ({
            term: label.label,
            detail: label.description,
          }))}
        />
      </Section>

      <Section
        eyebrow="Limits"
        title="What this method cannot tell you"
        intro="Stated plainly, because a benchmark that hides its limits is advertising."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {[
            "Simulator results are reproducible but synthetic; real services change under you in ways a replica does not.",
            "Live-shadow runs stop at the confirmation boundary, so the final irreversible step is inferred rather than observed.",
            "Cells are small. A difference inside the 95% interval is not a difference.",
            "Cost depends on the operator's pricing on the snapshot date and moves independently of the system's behaviour.",
            "Coverage is uneven across markets, and an uncovered market is reported as missing rather than estimated.",
          ].map((limit) => (
            <li
              key={limit}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {limit}
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/about/governance" className="mica-link">
            Who decides all of this →
          </Link>
        </p>
      </Section>
    </div>
  );
}
