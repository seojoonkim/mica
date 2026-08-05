import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { countrySnapshot, globalAccuracyRows } from "@/lib/derive";
import { formatPercent, missingLabels } from "@/lib/format";
import { DemoDisclosure, DemoStamp, Section } from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";
import { evaluationFamilyCount, seededFamilyIds } from "@/lib/i18n/coverage";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.longName}`,
  description: SITE.definition,
  alternates: { canonical: "/" },
};

/**
 * The home page states nothing it does not derive. Counts come from the
 * fixtures, market figures come from the run cells; no fact is retyped here.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  const totalEligibleRuns = RUN_CELLS.reduce(
    (sum, cell) => sum + cell.eligibleRuns,
    0,
  );
  const globalRows = globalAccuracyRows();

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
      <div className="mica-grid border-b border-[var(--color-rule-strong)] pt-9 pb-9 md:pt-12">
        <div className="md:col-span-8">
          <p className="mica-eyebrow">{dict.site.editionStrip.join(" · ")}</p>
          <h1 className="mica-display mica-hero mt-3">{dict.site.tagline}</h1>
          <p className="mica-display mica-h2 mt-3 text-[var(--color-atlas)]">
            {dict.site.secondary}
          </p>
          <p className="mica-lead mt-5 max-w-[60ch]">{dict.site.definition}</p>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <LocaleLink lang={lang} href="/rankings" className="mica-link text-[15px]">
              {dict.home.readTables}
            </LocaleLink>
            <LocaleLink lang={lang} href="/methodology" className="mica-link text-[15px]">
              {dict.home.howMeasured}
            </LocaleLink>
            <LocaleLink lang={lang} href="/submit" className="mica-link text-[15px]">
              {dict.home.submitSnapshot}
            </LocaleLink>
          </p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <span className="mica-ticks" aria-hidden="true" />
          {/* Status metrics: a plain figure ledger, two-up on a phone. */}
          <dl className="m-0 mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {[
              { term: dict.home.statMarkets, value: String(COUNTRIES.length) },
              {
                term: dict.home.statFamilies,
                value: String(evaluationFamilyCount()),
              },
              {
                term: dict.home.statSeeded,
                value: String(seededFamilyIds().length),
              },
              { term: dict.home.statSystems, value: String(SYSTEMS.length) },
              {
                term: dict.home.statRuns,
                value: totalEligibleRuns.toLocaleString(lang),
              },
            ].map((item) => (
              <div
                key={item.term}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--color-rule)] py-2"
              >
                <dt className="mica-eyebrow">{item.term}</dt>
                <dd className="m-0 font-[family-name:var(--font-mono)] text-[19px] font-medium tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] text-[var(--color-ink-faint)]">
            {dict.home.countedNote}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <DemoDisclosure lang={lang} detail={dict.home.disclosureDetail} />
        {/*
         * Ten families are defined; four carry seeded demo results. Both counts
         * are read from the fixtures, so neither can be overstated in copy.
         */}
        <p className="mica-notice mt-4 max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
          <span className="mica-eyebrow mr-2">{dict.coverage.headline}</span>
          {dict.coverage.detail}
        </p>
      </div>

      <Section
        eyebrow={dict.home.axesEyebrow}
        title={dict.home.axesTitle}
        intro={dict.home.axesIntro}
      >
        <div className="grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] md:grid-cols-3">
          {OUTCOME_AXES.map((axis) => (
            <article key={axis.id} className="bg-[var(--color-surface)] p-5">
              <h3 className="mica-display mica-h3">
                {dict.outcomeAxes[axis.id].label}
              </h3>
              <p className="mica-eyebrow mt-1.5">
                {dict.outcomeAxes[axis.id].unit}
              </p>
              <p className="mt-3 max-w-[42ch] text-[14.5px] text-[var(--color-ink-soft)]">
                {dict.outcomeAxes[axis.id].description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow={dict.home.ledgerEyebrow}
        title={dict.home.ledgerTitle}
        intro={dict.home.ledgerIntro}
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={dict.home.ledgerCaption}>
          <table className="mica-table">
            <caption>
              {dict.home.ledgerCaption} — {dict.table.captionSuffix}
            </caption>
            <thead>
              <tr>
                <th scope="col">{dict.table.market}</th>
                <th scope="col">{dict.table.editionNote}</th>
                <th scope="col" className="num">
                  {dict.table.systemsCovered}
                </th>
                <th scope="col" className="num">
                  {dict.table.accuracySpread}
                </th>
                <th scope="col">{dict.table.highestAccuracy}</th>
              </tr>
            </thead>
            <tbody>
              {marketLedger.map((entry) => (
                <tr key={entry.country.code}>
                  <th scope="row" className="font-normal">
                    <LocaleLink lang={lang}
                      href={`/countries/${entry.country.code}`}
                      className="mica-link"
                    >
                      {dict.markets[entry.country.code]}
                    </LocaleLink>
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
                      ? missingLabels(lang).noData
                      : `${formatPercent(entry.worst, 0, lang)} – ${formatPercent(entry.best, 0, lang)}`}
                  </td>
                  <td className="text-[13.5px]">
                    {entry.leader ? entry.leader.systemName : missingLabels(lang).noData}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow={dict.home.globalEyebrow}
        title={dict.home.globalTitle}
        intro={dict.home.globalIntro}
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={dict.home.globalCaption}>
          <table className="mica-table">
            <caption>
              {dict.home.globalCaption} — {dict.home.globalCaptionSuffix}
            </caption>
            <thead>
              <tr>
                <th scope="col">{dict.table.system}</th>
                <th scope="col" className="num" aria-sort="descending">
                  {dict.table.globalAccuracy}
                </th>
                <th scope="col" className="num">
                  {dict.table.marketsCovered}
                </th>
              </tr>
            </thead>
            <tbody>
              {globalRows.map((row) => (
                <tr key={row.systemSlug}>
                  <th scope="row" className="font-normal">
                    <LocaleLink lang={lang}
                      href={`/agents/${row.systemSlug}`}
                      className="mica-link"
                    >
                      {row.systemName}
                    </LocaleLink>
                  </th>
                  <td className="num">
                    {row.accuracy === null
                      ? dict.table.withheld
                      : formatPercent(row.accuracy, 1, lang)}
                  </td>
                  <td className="num text-[var(--color-ink-faint)]">
                    {row.markets.length} / {COUNTRIES.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableScroller>
        <p className="mt-3 max-w-[76ch] text-[12.5px] text-[var(--color-ink-faint)]">
          {dict.home.globalNote}
        </p>
        <p className="mt-4">
          <LocaleLink lang={lang} href="/rankings" className="mica-link">
            {dict.home.filterLink}
          </LocaleLink>
        </p>
      </Section>

      <Section
        eyebrow={dict.home.familiesEyebrow}
        title={dict.home.familiesTitle}
        intro={dict.home.familiesIntro}
      >
        <div className="border-t border-[var(--color-rule)]">
          {TASK_FAMILIES.map((family) => (
            <article
              key={family.id}
              className="mica-grid border-b border-[var(--color-rule)] py-5"
            >
              <h3 className="mica-display mica-h3 md:col-span-3">
                {dict.families[family.id].label}
              </h3>
              <p className="max-w-[62ch] text-[15px] text-[var(--color-ink-soft)] md:col-span-6">
                {dict.families[family.id].summary}
              </p>
              <p className="text-[13.5px] text-[var(--color-ink-faint)] md:col-span-3">
                {family.canonicalTasks.length} {dict.common.canonicalTasks}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-4">
          <LocaleLink lang={lang} href="/tasks" className="mica-link">
            {dict.home.familiesLink}
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
