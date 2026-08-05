import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { aggregateBySystem, countrySnapshot } from "@/lib/derive";
import { formatPercent, NO_DATA } from "@/lib/format";
import { DemoDisclosure, DemoStamp, Section } from "@/components/editorial";
import { ResultsTable } from "@/components/results-table";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.longName}`,
  description: SITE.definition,
  alternates: { canonical: "/" },
};

/**
 * The home page states nothing it does not derive. Counts come from the
 * fixtures, market figures come from the run cells; no fact is retyped here.
 */
export default function HomePage() {
  const totalEligibleRuns = RUN_CELLS.reduce(
    (sum, cell) => sum + cell.eligibleRuns,
    0,
  );
  const globalRows = aggregateBySystem();

  const marketLedger = COUNTRIES.map((country) => {
    const rows = countrySnapshot(country.code);
    const accuracies = rows
      .map((row) => row.accuracy)
      .filter((value): value is number => value !== null);
    return {
      country,
      systems: rows.length,
      best: accuracies.length > 0 ? Math.max(...accuracies) : null,
      worst: accuracies.length > 0 ? Math.min(...accuracies) : null,
      leader: rows[0],
    };
  });

  return (
    <div>
      <div className="mica-grid border-b border-[var(--color-rule-strong)] pt-12 pb-10">
        <div className="md:col-span-8">
          <p className="mica-eyebrow">{SITE.editionStrip.join(" · ")}</p>
          <h1 className="mica-display mt-4 text-[44px] leading-[1.03] sm:text-[68px]">
            {SITE.tagline}
          </h1>
          <p className="mica-display mt-3 text-[24px] text-[var(--color-vermilion)] sm:text-[30px]">
            {SITE.secondary}
          </p>
          <p className="mt-6 max-w-[60ch] text-[17.5px] leading-relaxed text-[var(--color-ink-soft)]">
            {SITE.definition}
          </p>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/rankings" className="mica-link text-[15px]">
              Read the result tables
            </Link>
            <Link href="/methodology" className="mica-link text-[15px]">
              How MICA measures
            </Link>
            <Link href="/submit" className="mica-link text-[15px]">
              Submit a system snapshot
            </Link>
          </p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <span className="mica-ticks" aria-hidden="true" />
          <dl className="m-0 mt-4">
            {[
              { term: "Markets", value: String(COUNTRIES.length) },
              { term: "Task families", value: String(TASK_FAMILIES.length) },
              { term: "System snapshots", value: String(SYSTEMS.length) },
              { term: "Eligible runs", value: totalEligibleRuns.toLocaleString("en") },
            ].map((item) => (
              <div
                key={item.term}
                className="flex items-baseline justify-between border-b border-[var(--color-rule)] py-2"
              >
                <dt className="mica-eyebrow">{item.term}</dt>
                <dd className="m-0 font-[family-name:var(--font-mono)] text-[18px] tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12px] text-[var(--color-ink-faint)]">
            Counted from the demo fixtures at build time.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DemoDisclosure detail="MICA is under construction. The interface below is complete; the data behind it is a seeded, synthetic fixture used to build and test the interface. Nothing here describes the real performance of any product." />
      </div>

      <Section
        eyebrow="Three results, never one"
        title="MICA reports accuracy, speed and cost separately"
        intro="A single number would hide the trade a buyer actually has to make. MICA publishes no composite score and never will; the axes below are read side by side."
      >
        <div className="grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] md:grid-cols-3">
          {OUTCOME_AXES.map((axis) => (
            <article key={axis.id} className="bg-[var(--color-paper)] p-5">
              <h3 className="mica-display text-[21px]">{axis.label}</h3>
              <p className="mica-eyebrow mt-1.5">{axis.unit}</p>
              <p className="mt-3 max-w-[42ch] text-[14px] text-[var(--color-ink-soft)]">
                {axis.description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Derived from run cells"
        title="The market ledger"
        intro="Every market is scored on its own terms. A system that has not run in a market shows as missing coverage, never as a zero."
      >
        <DemoStamp className="mb-4" />
        <div className="mica-scroller">
          <table className="mica-table">
            <caption>
              Demo accuracy spread by market — Illustrative demo data, not an
              official ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Market</th>
                <th scope="col">Edition note</th>
                <th scope="col" className="num">
                  Systems covered
                </th>
                <th scope="col" className="num">
                  Accuracy spread
                </th>
                <th scope="col">Highest accuracy in demo</th>
              </tr>
            </thead>
            <tbody>
              {marketLedger.map((entry) => (
                <tr key={entry.country.code}>
                  <th scope="row" className="font-normal">
                    <Link
                      href={`/countries/${entry.country.code}`}
                      className="mica-link"
                    >
                      {entry.country.name}
                    </Link>
                    <span className="ml-2 text-[var(--color-ink-faint)]">
                      {entry.country.nativeName}
                    </span>
                  </th>
                  <td className="max-w-[38ch] text-[13.5px] text-[var(--color-ink-soft)]">
                    {entry.country.editionNote}
                  </td>
                  <td className="num">
                    {entry.systems} / {SYSTEMS.length}
                  </td>
                  <td className="num">
                    {entry.worst === null
                      ? NO_DATA
                      : `${formatPercent(entry.worst, 0)} – ${formatPercent(entry.best, 0)}`}
                  </td>
                  <td className="text-[13.5px]">
                    {entry.leader ? entry.leader.systemName : NO_DATA}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="All markets combined"
        title="Index-wide demo results"
        intro="Accuracy pooled across every market and family in the demo fixture. Cost is withheld here because the five markets do not share a currency."
      >
        <ResultsTable
          rows={globalRows}
          caption="All markets, all task families"
          showCost={false}
        />
        <p className="mt-4">
          <Link href="/rankings" className="mica-link">
            Filter by market, task family and outcome axis →
          </Link>
        </p>
      </Section>

      <Section
        eyebrow="What we ask the agent to do"
        title="Four families of everyday task"
        intro="Each family is defined by a declared final state and a confirmation boundary the system must not cross without consent."
      >
        <div className="border-t border-[var(--color-rule)]">
          {TASK_FAMILIES.map((family) => (
            <article
              key={family.id}
              className="mica-grid border-b border-[var(--color-rule)] py-5"
            >
              <h3 className="mica-display text-[20px] md:col-span-3">
                {family.label}
              </h3>
              <p className="max-w-[62ch] text-[14.5px] text-[var(--color-ink-soft)] md:col-span-6">
                {family.summary}
              </p>
              <p className="text-[13px] text-[var(--color-ink-faint)] md:col-span-3">
                {family.canonicalTasks.length} canonical tasks
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4">
          <Link href="/tasks" className="mica-link">
            Read the task definitions →
          </Link>
        </p>
      </Section>
    </div>
  );
}
