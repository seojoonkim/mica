import Link from "next/link";
import type { Metadata } from "next";
import { SYSTEMS } from "@/data/demo/systems";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { globalAccuracy, marketsCovered } from "@/lib/derive";
import { formatPercent, NO_DATA } from "@/lib/format";
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

export const metadata: Metadata = {
  title: "Systems",
  description:
    "The versioned consumer-agent system snapshots in the MICA demo edition.",
  alternates: { canonical: "/agents" },
};

const TRACK_LABEL = new Map(RESULT_TRACKS.map((track) => [track.id, track.label]));
const VERIFICATION_LABEL = new Map(
  VERIFICATION_STATUSES.map((status) => [status.id, status.label]),
);

export default function AgentsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="System index"
        title="MICA measures systems, not models"
        standfirst="An entry is a dated snapshot of a whole system: orchestrator, models, tools and memory together. Two entries can share a base model and still land far apart, which is the point."
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="Derived from run cells"
        title="Snapshots in this edition"
        intro="Global accuracy is a country macro-average and is only available for systems with cells in every market. A system missing a market shows missing coverage, not a lower score."
      >
        <DemoStamp className="mb-4" />
        <DataTableScroller label="System snapshots">
          <table className="mica-table">
            <caption>
              System snapshots — Illustrative demo data, not an official
              ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">System</th>
                <th scope="col">Operator</th>
                <th scope="col">Snapshot</th>
                <th scope="col">Verification</th>
                <th scope="col">Track</th>
                <th scope="col" className="num">
                  Markets
                </th>
                <th scope="col" className="num">
                  Global accuracy
                </th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((system) => {
                const markets = marketsCovered(system.slug);
                const global = globalAccuracy(system.slug);
                return (
                  <tr key={system.slug}>
                    <th scope="row" className="font-normal">
                      <Link
                        href={`/agents/${system.slug}`}
                        className="mica-link"
                      >
                        {system.name}
                      </Link>
                    </th>
                    <td className="text-[13.5px]">{system.operator}</td>
                    <td className="font-[family-name:var(--font-mono)] text-[12px]">
                      {system.snapshotVersion}
                      <span className="block text-[var(--color-ink-faint)]">
                        {system.snapshotDate}
                      </span>
                    </td>
                    <td className="text-[13px]">
                      {VERIFICATION_LABEL.get(system.verification) ??
                        system.verification}
                    </td>
                    <td className="text-[13px]">
                      {TRACK_LABEL.get(system.track) ?? system.track}
                    </td>
                    <td className="num">
                      {markets.length} / {COUNTRY_BY_CODE.size}
                    </td>
                    <td className="num">
                      {global === null ? NO_DATA : formatPercent(global)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow="Reading the labels"
        title="Verification status"
        intro="Only independently rerun results are ever on the publication track. Everything in this demo edition is excluded regardless, because demo data can never be publication eligible."
      >
        <DataList
          items={VERIFICATION_STATUSES.map((status) => ({
            term: `${status.label} · ${status.short}`,
            detail: status.description,
          }))}
        />
      </Section>

      <Section eyebrow="Reading the labels" title="Result tracks">
        <DataList
          items={RESULT_TRACKS.map((track) => ({
            term: track.label,
            detail: track.description,
          }))}
        />
      </Section>
    </div>
  );
}
