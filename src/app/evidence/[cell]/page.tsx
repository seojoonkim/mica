import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { familyLabel } from "@/data/demo/tasks";
import { getSystem } from "@/data/demo/systems";
import {
  RUN_CELL_IDS,
  allEligibleLatencyP50,
  evidenceHref,
  getRunCellById,
  runCellEvidence,
  runCellsFor,
  runCellId,
} from "@/lib/evidence";
import {
  formatCost,
  formatFraction,
  formatInterval,
  formatPercent,
  formatSeconds,
} from "@/lib/format";
import { VERIFICATION_STATUSES } from "@/data/policy/publication";
import {
  DataList,
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";

const VERIFICATION = new Map(
  VERIFICATION_STATUSES.map((status) => [status.id, status]),
);

export function generateStaticParams() {
  return RUN_CELL_IDS.map((cell) => ({ cell }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cell: string }>;
}): Promise<Metadata> {
  const { cell: id } = await params;
  const cell = getRunCellById(id);
  if (!cell) return { title: "Run cell not found" };
  const country = COUNTRY_BY_CODE.get(cell.country);
  return {
    title: `${id} — run cell`,
    description: `Aggregate demo run cell for ${getSystem(cell.system)?.name ?? cell.system} in ${country?.name ?? cell.country}, ${familyLabel(cell.family)}. Not an individual transcript.`,
    alternates: { canonical: `/evidence/${id}` },
  };
}

/**
 * One aggregate run cell, stated in full.
 *
 * Everything on this page is either read straight off the canonical cell or
 * derived from it by the same functions the result tables use. Nothing is
 * dressed up as attempt-level provenance, because none exists.
 */
export default async function EvidenceCellPage({
  params,
}: {
  params: Promise<{ cell: string }>;
}) {
  const { cell: id } = await params;
  const cell = getRunCellById(id);
  const evidence = runCellEvidence(id);
  if (!cell || !evidence) notFound();

  const system = getSystem(cell.system);
  const country = COUNTRY_BY_CODE.get(cell.country);
  const verification = VERIFICATION.get(system?.verification ?? "self-reported");
  const auditP50 = allEligibleLatencyP50(cell);

  const siblings = runCellsFor({ system: cell.system }).filter(
    (other) => runCellId(other) !== id,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Run cell · aggregate"
        title={`${system?.name ?? cell.system} · ${country?.name ?? cell.country} · ${familyLabel(cell.family)}`}
        standfirst={`Cell ${id}. This is an aggregate run cell — the counts and distributions for one system in one market on one task family. It is not an individual transcript, and it contains no user data.`}
      >
        <DemoDisclosure detail="Demo fixture evidence, not official evidence. Every figure below is generated for interface development, carries no evidentiary weight, and no system on this page has been ranked by MICA." />
      </PageHeader>

      <Section
        eyebrow="Identity"
        title="What this cell is"
        intro="A cell id is stable: system, market and task family, joined by a double dash. It is a handle on an aggregate, not on a run."
      >
        <DataList
          items={[
            { term: "Cell id", detail: id },
            {
              term: "System",
              detail: (
                <Link href={`/agents/${cell.system}`} className="mica-link">
                  {system?.name ?? cell.system}
                </Link>
              ),
            },
            {
              term: "Market",
              detail: (
                <Link href={`/countries/${cell.country}`} className="mica-link">
                  {country?.name ?? cell.country}
                </Link>
              ),
            },
            { term: "Task family", detail: familyLabel(cell.family) },
            {
              term: "Verification",
              detail: verification
                ? `${verification.label} — ${verification.description}`
                : (system?.verification ?? "Unknown"),
            },
            { term: "Data status", detail: evidence.dataStatus },
            {
              term: "Publication eligibility",
              detail: evidence.publicationEligible
                ? "Eligible"
                : "Not publication eligible — the blockers are listed below.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Measured"
        title="What the cell records"
        intro="Accuracy, speed and cost are read separately. Speed percentiles cover successful eligible runs only, so fast failure never reads as fast success; the all-eligible population is stated beside them so the reported denominator is auditable."
      >
        <DemoStamp className="mb-4" />
        <DataTableScroller label={`Run cell ${id} — recorded values`}>
          <table className="mica-table">
            <caption>
              Run cell {id} — Illustrative demo data, not an official ranking.
              Columns are read separately; MICA publishes no composite score.
            </caption>
            <thead>
              <tr>
                <th scope="col">Figure</th>
                <th scope="col" className="num">
                  Value
                </th>
                <th scope="col">Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="font-normal">
                  Eligible runs
                </th>
                <td className="num">{evidence.eligibleRuns}</td>
                <td>Attempts that passed eligibility screening — the denominator.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Successful runs
                </th>
                <td className="num">
                  {formatFraction(
                    evidence.successfulRuns,
                    evidence.eligibleRuns,
                  )}
                </td>
                <td>Eligible runs that reached the declared final state.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Accuracy
                </th>
                <td className="num">{formatPercent(evidence.accuracy)}</td>
                <td>Successful runs over eligible runs.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  95% interval
                </th>
                <td className="num">
                  {formatInterval(evidence.accuracyInterval)}
                </td>
                <td>Wilson score interval — cells this small are not well described by a point estimate.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Speed p50
                </th>
                <td className="num">{formatSeconds(evidence.latencyP50)}</td>
                <td>Successful eligible runs only.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Speed p95
                </th>
                <td className="num">{formatSeconds(evidence.latencyP95)}</td>
                <td>Successful eligible runs only.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  All-eligible latency records
                </th>
                <td className="num">{evidence.allEligibleLatencyCount}</td>
                <td>
                  Latencies recorded for every eligible attempt, successful or
                  not (median {formatSeconds(auditP50)}). Kept for auditing; the
                  published percentiles above are not taken from it.
                </td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Total eligible cost
                </th>
                <td className="num">
                  {formatCost(evidence.totalEligibleCost, evidence.currency)}
                </td>
                <td>Cost of all eligible attempts, in this market&rsquo;s own currency.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Cost per success
                </th>
                <td className="num">
                  {formatCost(evidence.costPerSuccess, evidence.currency)}
                </td>
                <td>Total eligible cost over successful runs; undefined with no success.</td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Task coverage
                </th>
                <td className="num">
                  {formatFraction(
                    evidence.tasksAttempted,
                    evidence.tasksDefined,
                  )}
                </td>
                <td>
                  Canonical tasks attempted over canonical tasks defined for
                  this market ({formatPercent(evidence.coverage, 0)}).
                </td>
              </tr>
              <tr>
                <th scope="row" className="font-normal">
                  Critical safety events
                </th>
                <td className="num">{evidence.criticalSafetyEvents}</td>
                <td>
                  {evidence.criticalSafetyEvents > 0
                    ? "Recorded — a permanent publication block for this cell."
                    : "None recorded in this cell."}
                </td>
              </tr>
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow="Publication gate"
        title="Why this cell is not publishable"
        intro="MICA states the reasons rather than quietly omitting the result."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {evidence.blockers.map((blocker) => (
            <li
              key={blocker}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {blocker}
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/methodology" className="mica-link">
            Read the publication rules →
          </Link>
        </p>
      </Section>

      <Section
        eyebrow="Limits"
        title="What this page does not show"
        intro="The honest boundary of the record, stated where the record is read."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {[
            "No individual attempt records. The canonical fixture stores aggregates only, so there is no run to open.",
            "No timestamps, transcripts, screenshots, tool logs, provider identities or external evidence links. None of these exist in the demo edition, and inventing a handle for them would be a false provenance claim.",
            "No user data. Demo figures are generated; a real edition would run synthetic personas and controlled test accounts only.",
            "No composite score. Accuracy, speed and cost stay separate here as everywhere else on the site.",
          ].map((limit) => (
            <li
              key={limit}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {limit}
            </li>
          ))}
        </ul>
      </Section>

      <nav aria-label="Related run cells" className="mt-14">
        <span className="mica-ticks" aria-hidden="true" />
        <p className="mica-eyebrow mt-4">
          Other cells for {system?.name ?? cell.system}
        </p>
        <ul className="mt-2 flex list-none flex-wrap gap-x-6 gap-y-1 p-0 text-[13.5px]">
          {siblings.map((other) => (
            <li key={runCellId(other)}>
              <Link href={evidenceHref(other)} className="mica-link">
                {COUNTRY_BY_CODE.get(other.country)?.name ?? other.country} ·{" "}
                {familyLabel(other.family)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/evidence" className="mica-link">
            All run cells →
          </Link>
        </p>
      </nav>
    </div>
  );
}
