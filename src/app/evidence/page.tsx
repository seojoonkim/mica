import Link from "next/link";
import type { Metadata } from "next";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES, familyLabel } from "@/data/demo/tasks";
import { SYSTEMS, systemName } from "@/data/demo/systems";
import {
  RUN_CELL_IDS,
  evidenceHref,
  runCellId,
  runCellsFor,
} from "@/lib/evidence";
import {
  countryCodeSchema,
  taskFamilySchema,
  type CountryCode,
  type TaskFamilyId,
} from "@/lib/schema";
import { formatFraction, formatPercent } from "@/lib/format";
import {
  DataList,
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";

export const metadata: Metadata = {
  title: "Evidence",
  description:
    "Every figure in the demo edition traces back to an aggregate run cell: one system, one market, one task family. This is fixture evidence, not official evidence.",
  alternates: { canonical: "/evidence" },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readCountry(value: string | undefined): CountryCode | null {
  const parsed = countryCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function readFamily(value: string | undefined): TaskFamilyId | null {
  const parsed = taskFamilySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function readSystem(value: string | undefined): string | null {
  return SYSTEMS.some((system) => system.slug === value) ? value! : null;
}

/**
 * The index of run cells. The filter is a plain GET form, like Rankings, so
 * every slice is bookmarkable and no client JavaScript is involved.
 */
export default async function EvidenceIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const country = readCountry(first(query.country));
  const family = readFamily(first(query.family));
  const system = readSystem(first(query.system));

  const cells = runCellsFor({
    ...(system ? { system } : {}),
    ...(country ? { country } : {}),
    ...(family ? { family } : {}),
  });

  const scope = [
    system ? systemName(system) : "All systems",
    country
      ? (COUNTRIES.find((entry) => entry.code === country)?.name ?? country)
      : "All markets",
    family ? familyLabel(family) : "All task families",
  ].join(" · ");

  return (
    <div>
      <PageHeader
        eyebrow="Run-cell lineage"
        title="Evidence"
        standfirst="MICA's unit of evidence is the aggregate run cell: one system, one market, one task family. Every number on this site is computed from these cells, and each one has a page stating exactly what it contains."
      >
        <DemoDisclosure detail="These are demo fixture cells, not official evidence. They exist so the lineage of a published figure can be checked in the interface; they carry no evidentiary weight." />
      </PageHeader>

      <Section
        eyebrow="What a run cell is"
        title="The evidence model"
        intro="MICA records aggregates, not individual attempts. There is no per-attempt record behind these pages, so none is shown."
      >
        <DataList
          items={[
            {
              term: "Unit",
              detail:
                "One aggregate run cell per system × market × task family. Cell ids read system--market--family, e.g. atlas-concierge--kr--email-calendar.",
            },
            {
              term: "What it holds",
              detail:
                "Eligible and successful run counts, latencies for successful eligible runs, the latency population for all eligible attempts, total eligible cost, task coverage and critical safety events.",
            },
            {
              term: "What it does not hold",
              detail:
                "No individual attempts, timestamps, transcripts, screenshots, tool logs or provider identities. No user data of any kind: the demo fixture is generated, and a real edition would use synthetic personas and controlled test accounts only.",
            },
            {
              term: "How figures are derived",
              detail:
                "Accuracy, its 95% interval, speed percentiles and cost per success are computed from the cell on request. Nothing is stored twice, and no axis is folded into another — MICA publishes no composite score.",
            },
            {
              term: "Standing",
              detail:
                "Fixture evidence for interface development. Every cell is dataStatus: demo and publicationEligible: false.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Filter"
        title="Find a cell"
        intro="Narrow by system, market or task family. The form submits as a normal link."
      >
        <form
          method="get"
          action="/evidence"
          aria-label="Filter run cells"
          className="mica-panel"
        >
          <div className="mica-fields">
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="system">
                System
              </label>
              <select
                id="system"
                name="system"
                defaultValue={system ?? ""}
                className="mica-control"
              >
                <option value="">All systems</option>
                {SYSTEMS.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="country">
                Market
              </label>
              <select
                id="country"
                name="country"
                defaultValue={country ?? ""}
                className="mica-control"
              >
                <option value="">All markets</option>
                {COUNTRIES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="family">
                Task family
              </label>
              <select
                id="family"
                name="family"
                defaultValue={family ?? ""}
                className="mica-control"
              >
                <option value="">All task families</option>
                {TASK_FAMILIES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-5 border-t border-[var(--color-rule)] pt-4">
            <button type="submit" className="mica-button w-auto">
              Apply
            </button>
            <Link href="/evidence" className="mica-link text-[14px]">
              Reset
            </Link>
          </div>
        </form>
      </Section>

      <Section
        eyebrow={scope}
        title={`${cells.length} of ${RUN_CELL_IDS.length} run cells`}
        intro="Each row is one aggregate run cell, not an individual transcript."
      >
        <DemoStamp className="mb-4" />
        <DataTableScroller label={`Run cells — ${scope}`}>
          <table className="mica-table">
            <caption>
              Run cells — {scope}. Illustrative demo data, not an official
              ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Run cell</th>
                <th scope="col">System</th>
                <th scope="col">Market</th>
                <th scope="col">Task family</th>
                <th scope="col" className="num">
                  Accuracy
                </th>
                <th scope="col" className="num">
                  Eligible runs
                </th>
              </tr>
            </thead>
            <tbody>
              {cells.map((cell) => {
                const id = runCellId(cell);
                return (
                  <tr key={id}>
                    <th scope="row" className="font-normal">
                      <Link href={evidenceHref(cell)} className="mica-link">
                        <span className="font-[family-name:var(--font-mono)] text-[12.5px]">
                          {id}
                        </span>
                      </Link>
                    </th>
                    <td>{systemName(cell.system)}</td>
                    <td>
                      {COUNTRIES.find((entry) => entry.code === cell.country)
                        ?.name ?? cell.country}
                    </td>
                    <td>{familyLabel(cell.family)}</td>
                    <td className="num">
                      {formatPercent(
                        cell.eligibleRuns > 0
                          ? cell.successfulRuns / cell.eligibleRuns
                          : null,
                      )}
                    </td>
                    <td className="num text-[var(--color-ink-faint)]">
                      {formatFraction(cell.successfulRuns, cell.eligibleRuns)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableScroller>
        {cells.length === 0 ? (
          <p className="mica-notice mt-4 max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            No run cell matches this slice. Missing coverage is missing, never a
            zero.
          </p>
        ) : null}
      </Section>
    </div>
  );
}
