import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { SYSTEMS } from "@/data/demo/systems";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { globalAccuracy, marketsCovered } from "@/lib/derive";
import { formatPercent, missingLabels } from "@/lib/format";
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

export default async function AgentsPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.agents.eyebrow}
        title={dict.agents.title}
        standfirst={dict.agents.standfirst}
      >
        <DemoDisclosure lang={lang} />
      </PageHeader>

      <Section
        eyebrow={dict.agents.snapshotsEyebrow}
        title={dict.agents.snapshotsTitle}
        intro={dict.agents.snapshotsIntro}
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={dict.agents.snapshotsCaption}>
          <table className="mica-table">
            <caption>
              {dict.agents.snapshotsCaption} — {dict.table.captionSuffix}
            </caption>
            <thead>
              <tr>
                <th scope="col">{dict.table.system}</th>
                <th scope="col">{dict.table.operator}</th>
                <th scope="col">{dict.table.snapshot}</th>
                <th scope="col">{dict.table.verification}</th>
                <th scope="col">{dict.table.track}</th>
                <th scope="col" className="num">
                  {dict.table.markets}
                </th>
                <th scope="col" className="num">
                  {dict.table.globalAccuracy}
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
                      <LocaleLink lang={lang}
                        href={`/agents/${system.slug}`}
                        className="mica-link"
                      >
                        {system.name}
                      </LocaleLink>
                    </th>
                    <td className="text-[13.5px]">{system.operator}</td>
                    <td className="font-[family-name:var(--font-mono)] text-[12px]">
                      {system.snapshotVersion}
                      <span className="block text-[var(--color-ink-faint)]">
                        {system.snapshotDate}
                      </span>
                    </td>
                    <td className="text-[13px]">
                      {dict.verification[system.verification]?.label ??
                        VERIFICATION_LABEL.get(system.verification) ??
                        system.verification}
                    </td>
                    <td className="text-[13px]">
                      {dict.tracks[system.track]?.label ??
                        TRACK_LABEL.get(system.track) ??
                        system.track}
                    </td>
                    <td className="num">
                      {markets.length} / {COUNTRY_BY_CODE.size}
                    </td>
                    <td className="num">
                      {global === null
                        ? missingLabels(lang).noData
                        : formatPercent(global, 1, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow={dict.agents.labelsEyebrow}
        title={dict.agents.verificationTitle}
        intro={dict.agents.verificationIntro}
      >
        <DataList
          items={VERIFICATION_STATUSES.map((status) => ({
            term: `${dict.verification[status.id].label} · ${dict.verification[status.id].short}`,
            detail: dict.verification[status.id].description,
          }))}
        />
      </Section>

      <Section
        eyebrow={dict.agents.labelsEyebrow}
        title={dict.agents.tracksTitle}
      >
        <DataList
          items={RESULT_TRACKS.map((track) => ({
            term: dict.tracks[track.id].label,
            detail: dict.tracks[track.id].description,
          }))}
        />
      </Section>
    </div>
  );
}
