import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
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
import { DataTableScroller } from "@/components/data-table-scroller";
import { evidenceHref, runCellsFor } from "@/lib/evidence";

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
  params: Promise<LangParams & { system: string }>;
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
  params: Promise<LangParams & { system: string }>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
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

  const cells = runCellsFor({ system: system.slug });

  const blockers =
    byCountry.find((entry) => entry.row)?.row?.blockers ??
    aggregateBySystem().find((entry) => entry.systemSlug === system.slug)
      ?.blockers ??
    [];

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={`${dict.agent.eyebrowPrefix} · ${system.snapshotVersion} · ${system.snapshotDate}`}
        title={system.name}
        standfirst={system.summary}
      >
        <DemoDisclosure lang={lang} />
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
                  `${formatPercent(global)} — country macro-average, not a pooling of runs`
                ),
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Accuracy, speed and cost read separately"
        title="Results by market"
        intro="Cost appears in each market's own currency. Speed p50 and p95 cover successful eligible runs only, so they describe how long success took, not how long an attempt took. Markets with no run cells say so in words."
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={`${system.name} by market`}>
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
                  Speed p95
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
                    <LocaleLink lang={lang}
                      href={`/countries/${country.code}`}
                      className="mica-link"
                    >
                      {country.name}
                    </LocaleLink>
                  </th>
                  {row ? (
                    <>
                      <td className="num">{formatPercent(row.accuracy)}</td>
                      <td className="num">{formatSeconds(row.latencyP50)}</td>
                      <td className="num">{formatSeconds(row.latencyP95)}</td>
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
        </DataTableScroller>
      </Section>

      <Section
        eyebrow="By task family"
        title="Results by task family"
        intro="Pooled across markets, so cost is withheld — the five editions do not share a currency."
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={`${system.name} by task family`}>
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
        </DataTableScroller>
      </Section>

      <Section
        eyebrow="Lineage"
        title="Run cells behind these figures"
        intro="Every figure above is computed from these aggregate run cells — one per market and task family. A cell page states what the cell holds and, just as plainly, what it does not."
      >
        {cells.length === 0 ? (
          <p className="mica-notice max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            {NO_DATA} This snapshot has no run cells in the demo edition.
          </p>
        ) : (
          <ul className="m-0 grid list-none gap-x-8 gap-y-1 p-0 text-[14px] md:grid-cols-2">
            {cells.map((cell) => (
              <li key={`${cell.country}-${cell.family}`}>
                <LocaleLink lang={lang} href={evidenceHref(cell)} className="mica-link">
                  {COUNTRIES.find((entry) => entry.code === cell.country)?.name ??
                    cell.country}{" "}
                  · {TASK_FAMILIES.find((entry) => entry.id === cell.family)?.label ?? cell.family}
                </LocaleLink>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4">
          <LocaleLink lang={lang} href={`/evidence?system=${system.slug}`} className="mica-link">
            All run cells for {system.name} →
          </LocaleLink>
        </p>
      </Section>

      <Section
        eyebrow="Diagnostics"
        title="Why the outcome looks like this"
        intro="Diagnostic axes are evidence-led in this preview: they name what MICA looks at when explaining an outcome. They carry no reading, no score and no rating, because MICA has no evidence base to read them from yet."
      >
        <DataList
          items={DIAGNOSTIC_AXES.map((axis) => ({
            term: axis.label,
            detail: axis.description,
          }))}
        />
        <p className="mt-4 max-w-[76ch] text-[13.5px] text-[var(--color-ink-faint)]">
          Earlier drafts of this interface showed a 1–5 reading per axis. Those
          numbers were not supported by any measurement and have been removed
          rather than relabelled.
        </p>
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
          <LocaleLink lang={lang} href="/methodology" className="mica-link">
            Read the publication rules →
          </LocaleLink>
        </p>
      </Section>

      <nav aria-label="Other systems" className="mt-14">
        <span className="mica-ticks" aria-hidden="true" />
        <p className="mica-eyebrow mt-4">Other snapshots</p>
        <ul className="mt-2 flex list-none flex-wrap gap-x-6 p-0">
          {SYSTEMS.filter((other) => other.slug !== system.slug).map((other) => (
            <li key={other.slug}>
              <LocaleLink lang={lang} href={`/agents/${other.slug}`} className="mica-link">
                {other.name}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
