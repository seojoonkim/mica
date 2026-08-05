import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SYSTEMS, getSystem } from "@/data/demo/systems";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { DIAGNOSTIC_AXES } from "@/data/policy/axes";
import { aggregateBySystem, globalAccuracy, marketsCovered } from "@/lib/derive";
import {
  formatCost,
  formatFraction,
  formatPercent,
  formatSeconds,
  NO_DATA,
  NOT_MEASURED,
} from "@/lib/format";
import {
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
} from "@/data/policy/publication";
import {
  DataList,
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";

const VERIFICATION = new Map(
  VERIFICATION_STATUSES.map((status) => [status.id, status]),
);
const TRACK = new Map(RESULT_TRACKS.map((track) => [track.id, track]));

export function generateStaticParams() {
  return SYSTEMS.map((system) => ({ system: system.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ system: string }>;
}): Promise<Metadata> {
  const { system: slug } = await params;
  const system = getSystem(slug);
  if (!system) return { title: "System not found" };
  return {
    title: `${system.name} — system snapshot`,
    description: system.summary,
    alternates: { canonical: `/agents/${system.slug}` },
  };
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system: slug } = await params;
  const system = getSystem(slug);
  if (!system) notFound();

  const global = globalAccuracy(system.slug);
  const markets = marketsCovered(system.slug);
  const verification = VERIFICATION.get(system.verification);
  const track = TRACK.get(system.track);

  const byCountry = COUNTRIES.map((country) => ({
    country,
    row: aggregateBySystem({ country: country.code }).find(
      (entry) => entry.systemSlug === system.slug,
    ),
  }));

  const blockers =
    byCountry.find((entry) => entry.row)?.row?.blockers ??
    aggregateBySystem().find((entry) => entry.systemSlug === system.slug)
      ?.blockers ??
    [];

  return (
    <div>
      <PageHeader
        eyebrow={`System snapshot · ${system.snapshotVersion} · ${system.snapshotDate}`}
        title={system.name}
        standfirst={system.summary}
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="What was measured"
        title="Snapshot composition"
        intro="MICA records the whole system. A change to any part of this composition makes a new snapshot, not an update to this one."
      >
        <DataList
          items={[
            { term: "Operator", detail: system.operator },
            { term: "Orchestrator", detail: system.composition.orchestrator },
            { term: "Models", detail: system.composition.models.join(" · ") },
            { term: "Tools", detail: system.composition.tools.join(" · ") },
            { term: "Memory", detail: system.composition.memory },
            {
              term: "Verification",
              detail: verification
                ? `${verification.label} — ${verification.description}`
                : system.verification,
            },
            {
              term: "Result track",
              detail: track ? `${track.label} — ${track.description}` : system.track,
            },
            {
              term: "Markets covered",
              detail:
                markets.length === 0
                  ? NO_DATA
                  : markets
                      .map(
                        (code) =>
                          COUNTRIES.find((entry) => entry.code === code)?.name ??
                          code,
                      )
                      .join(" · "),
            },
            {
              term: "Global accuracy",
              detail:
                global === null ? (
                  <>
                    {NO_DATA} A macro-average is withheld unless the system has
                    cells in every market; a missing market is never counted as
                    a zero.
                  </>
                ) : (
                  `${formatPercent(global)} — country macro-average`
                ),
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Accuracy, speed and cost read separately"
        title="Results by market"
        intro="Cost appears in each market's own currency. Markets with no run cells say so in words."
      >
        <DemoStamp className="mb-4" />
        <div className="mica-scroller">
          <table className="mica-table">
            <caption>
              {system.name} by market — Illustrative demo data, not an official
              ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Market</th>
                <th scope="col" className="num">
                  Accuracy
                </th>
                <th scope="col" className="num">
                  Speed p50
                </th>
                <th scope="col" className="num">
                  Speed p90
                </th>
                <th scope="col" className="num">
                  Cost per success
                </th>
                <th scope="col" className="num">
                  Eligible runs
                </th>
              </tr>
            </thead>
            <tbody>
              {byCountry.map(({ country, row }) => (
                <tr key={country.code}>
                  <th scope="row" className="font-normal">
                    <Link
                      href={`/countries/${country.code}`}
                      className="mica-link"
                    >
                      {country.name}
                    </Link>
                  </th>
                  {row ? (
                    <>
                      <td className="num">{formatPercent(row.accuracy)}</td>
                      <td className="num">{formatSeconds(row.latencyP50)}</td>
                      <td className="num">{formatSeconds(row.latencyP90)}</td>
                      <td className="num">
                        {formatCost(row.costPerSuccess, row.currency)}
                      </td>
                      <td className="num text-[var(--color-ink-faint)]">
                        {formatFraction(row.successfulRuns, row.eligibleRuns)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={5} className="text-[var(--color-ink-faint)]">
                      {NO_DATA}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="By task family"
        title="Results by task family"
        intro="Pooled across markets, so cost is withheld — the five editions do not share a currency."
      >
        <DemoStamp className="mb-4" />
        <div className="mica-scroller">
          <table className="mica-table">
            <caption>
              {system.name} by task family — Illustrative demo data, not an
              official ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Task family</th>
                <th scope="col" className="num">
                  Accuracy
                </th>
                <th scope="col" className="num">
                  Speed p50
                </th>
                <th scope="col" className="num">
                  Eligible runs
                </th>
              </tr>
            </thead>
            <tbody>
              {TASK_FAMILIES.map((family) => {
                const row = aggregateBySystem({ family: family.id }).find(
                  (entry) => entry.systemSlug === system.slug,
                );
                return (
                  <tr key={family.id}>
                    <th scope="row" className="font-normal">
                      {family.label}
                    </th>
                    {row ? (
                      <>
                        <td className="num">{formatPercent(row.accuracy)}</td>
                        <td className="num">{formatSeconds(row.latencyP50)}</td>
                        <td className="num text-[var(--color-ink-faint)]">
                          {formatFraction(row.successfulRuns, row.eligibleRuns)}
                        </td>
                      </>
                    ) : (
                      <td colSpan={3} className="text-[var(--color-ink-faint)]">
                        {NO_DATA}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Diagnostics"
        title="Why the outcome looks like this"
        intro="Diagnostic axes are ordinal readings from 1 to 5. They explain outcomes; they are never summed, and they are not a score."
      >
        <DemoStamp className="mb-4" />
        <div className="mica-scroller">
          <table className="mica-table">
            <caption>
              Diagnostic axes, 1–5 ordinal — Illustrative demo data, not an
              official ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Axis</th>
                <th scope="col" className="num">
                  Reading
                </th>
                <th scope="col">What the axis covers</th>
              </tr>
            </thead>
            <tbody>
              {DIAGNOSTIC_AXES.map((axis) => {
                const value = system.diagnostics[axis.id];
                return (
                  <tr key={axis.id}>
                    <th scope="row" className="font-normal">
                      {axis.label}
                    </th>
                    <td className="num">
                      {value === undefined ? (
                        NOT_MEASURED
                      ) : (
                        <>
                          <span aria-hidden="true">
                            {"■".repeat(value)}
                            <span className="text-[var(--color-rule)]">
                              {"■".repeat(5 - value)}
                            </span>
                          </span>
                          <span className="ml-2">{value} / 5</span>
                        </>
                      )}
                    </td>
                    <td className="max-w-[52ch] text-[13.5px] text-[var(--color-ink-soft)]">
                      {axis.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Publication gate"
        title="Why nothing here is publishable"
        intro="MICA states the reasons a result is not publishable rather than quietly omitting it."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {blockers.map((blocker) => (
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

      <nav aria-label="Other systems" className="mt-14">
        <span className="mica-ticks" aria-hidden="true" />
        <p className="mica-eyebrow mt-4">Other snapshots</p>
        <ul className="mt-2 flex list-none flex-wrap gap-x-6 p-0">
          {SYSTEMS.filter((other) => other.slug !== system.slug).map((other) => (
            <li key={other.slug}>
              <Link href={`/agents/${other.slug}`} className="mica-link">
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
