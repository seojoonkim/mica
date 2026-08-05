import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COUNTRIES, getCountry } from "@/data/demo/countries";
import { systemName } from "@/data/demo/systems";
import { heroMissionsForCountry, familyLabel } from "@/data/demo/tasks";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { DIAGNOSTIC_AXES } from "@/data/policy/axes";
import { aggregateBySystem, countrySnapshot } from "@/lib/derive";
import { countryCodeSchema } from "@/lib/schema";
import { formatPercent, formatSeconds, formatCost, NO_DATA } from "@/lib/format";
import {
  DataList,
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";
import { ResultsTable } from "@/components/results-table";
import { DataTableScroller } from "@/components/data-table-scroller";
import { evidenceHref, runCellsFor } from "@/lib/evidence";

const AXIS_LABEL = new Map(DIAGNOSTIC_AXES.map((axis) => [axis.id, axis.label]));

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getCountry(slug);
  if (!country) return { title: "Market not found" };
  return {
    title: `${country.name} edition`,
    description: country.editionNote,
    alternates: { canonical: `/countries/${country.code}` },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: slug } = await params;
  const parsed = countryCodeSchema.safeParse(slug);
  const country = parsed.success ? getCountry(parsed.data) : undefined;
  if (!parsed.success || !country) notFound();

  const code = parsed.data;
  const rows = countrySnapshot(code);
  const missions = heroMissionsForCountry(code);

  return (
    <div>
      <PageHeader
        eyebrow={`Market edition · ${country.locale} · ${country.timezone}`}
        title={`${country.name} — ${country.nativeName}`}
        standfirst={country.editionNote}
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="Accuracy, speed and cost read separately"
        title={`Demo results in ${country.name}`}
        intro={`Cost is reported in ${country.currency} (${country.currencySymbol}) because a cost figure only means anything inside one currency.`}
      >
        <ResultsTable
          rows={rows}
          caption={`${country.name} — all task families`}
        />
      </Section>

      <Section
        eyebrow="By task family"
        title="Where the market gets hard"
        intro="The same system can be competent in one family and unable to finish in another. Family cells are shown separately for that reason."
      >
        <DemoStamp className="mb-4" />
        <DataTableScroller label={`${country.name} accuracy by task family`}>
          <table className="mica-table">
            <caption>
              {country.name} accuracy by task family — Illustrative demo data,
              not an official ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Task family</th>
                <th scope="col" className="num">
                  Systems with cells
                </th>
                <th scope="col" className="num">
                  Best accuracy
                </th>
                <th scope="col" className="num">
                  Best speed p50
                </th>
                <th scope="col" className="num">
                  Lowest cost per success
                </th>
              </tr>
            </thead>
            <tbody>
              {TASK_FAMILIES.map((family) => {
                const familyRows = aggregateBySystem({
                  country: code,
                  family: family.id,
                });
                const accuracies = familyRows
                  .map((row) => row.accuracy)
                  .filter((value): value is number => value !== null);
                const speeds = familyRows
                  .map((row) => row.latencyP50)
                  .filter((value): value is number => value !== null);
                const costs = familyRows
                  .map((row) => row.costPerSuccess)
                  .filter((value): value is number => value !== null);
                return (
                  <tr key={family.id}>
                    <th scope="row" className="font-normal">
                      <Link
                        href={`/rankings?country=${code}&family=${family.id}`}
                        className="mica-link"
                      >
                        {family.label}
                      </Link>
                    </th>
                    <td className="num">{familyRows.length}</td>
                    <td className="num">
                      {accuracies.length === 0
                        ? NO_DATA
                        : formatPercent(Math.max(...accuracies))}
                    </td>
                    <td className="num">
                      {speeds.length === 0
                        ? "No successful task."
                        : formatSeconds(Math.min(...speeds))}
                    </td>
                    <td className="num">
                      {costs.length === 0
                        ? "No successful task."
                        : formatCost(Math.min(...costs), country.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow="Lineage"
        title={`Run cells for ${country.name}`}
        intro="Each cell is one system on one task family in this market. The tables above are computed from them; the cell pages state what each aggregate holds and what it cannot show."
      >
        <ul className="m-0 grid list-none gap-x-8 gap-y-1 p-0 text-[14px] md:grid-cols-2">
          {runCellsFor({ country: code }).map((cell) => (
            <li key={`${cell.system}-${cell.family}`}>
              <Link href={evidenceHref(cell)} className="mica-link">
                {systemName(cell.system)} · {familyLabel(cell.family)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href={`/evidence?country=${code}`} className="mica-link">
            All run cells for {country.name} →
          </Link>
        </p>
      </Section>

      <Section
        eyebrow="Operational hazards"
        title={`Why ${country.name} is hard for an agent`}
        intro="Each hazard is tied to the diagnostic axis it loads onto, so a failure can be traced to a capability rather than to a vague sense of difficulty."
      >
        <DataList
          items={country.hazards.map((hazard) => ({
            term: hazard.title,
            detail: (
              <>
                <span className="mica-eyebrow mr-2 text-[var(--color-atlas)]">
                  {AXIS_LABEL.get(hazard.axis) ?? hazard.axis}
                </span>
                {hazard.detail}
              </>
            ),
          }))}
        />
      </Section>

      <Section
        eyebrow="Localisation"
        title="What changes when the task is local"
        intro="These are the concrete differences an agent has to absorb before it can finish an everyday task here."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {country.whatLocalChanges.map((item) => (
            <li
              key={item}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {missions.length > 0 ? (
        <Section
          eyebrow="Hero missions"
          title="What we actually asked for"
          intro="A hero mission is the human-readable version of a canonical task: a persona, a prompt, a declared final state, and the line the system must not cross alone."
        >
          <div className="border-t border-[var(--color-rule)]">
            {missions.map((mission) => (
              <article
                key={mission.id}
                className="mica-grid border-b border-[var(--color-rule)] py-6"
              >
                <div className="md:col-span-4">
                  <p className="mica-eyebrow">{familyLabel(mission.family)}</p>
                  <h3 className="mica-display mt-2 text-[21px]">
                    {mission.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-[var(--color-ink-faint)]">
                    {mission.persona}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <blockquote className="m-0 border-l-2 border-[var(--color-atlas)] pl-4 text-[15px] italic text-[var(--color-ink)]">
                    {mission.prompt}
                  </blockquote>
                  <p className="mt-3 max-w-[64ch] text-[14px] text-[var(--color-ink-soft)]">
                    <span className="mica-eyebrow mr-2">Final state</span>
                    {mission.finalState}
                  </p>
                  <p className="mt-2 max-w-[64ch] text-[14px] text-[var(--color-ink-soft)]">
                    <span className="mica-eyebrow mr-2 text-[var(--color-vermilion)]">
                      Confirmation boundary
                    </span>
                    {mission.confirmationBoundary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <nav aria-label="Other markets" className="mt-14">
        <span className="mica-ticks" aria-hidden="true" />
        <p className="mica-eyebrow mt-4">Other markets</p>
        <ul className="mt-2 flex list-none flex-wrap gap-x-6 p-0">
          {COUNTRIES.filter((other) => other.code !== code).map((other) => (
            <li key={other.code}>
              <Link href={`/countries/${other.code}`} className="mica-link">
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
