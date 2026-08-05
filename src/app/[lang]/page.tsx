import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import { DIAGNOSTIC_AXES, OUTCOME_AXES } from "@/data/policy/axes";
import {
  AxisGlyph,
  DataList,
  DemoDisclosure,
  Section,
} from "@/components/editorial";
import {
  evaluationFamilyCount,
  publishedResultFamilyIds,
} from "@/lib/i18n/coverage";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.longName}`,
  description: SITE.definition,
  alternates: { canonical: "/" },
};

/**
 * The home page states nothing it does not derive, and today everything it
 * derives is a zero: the system registry and the run-cell ledger are both
 * empty. It therefore leads with the taxonomy, the axes and the readiness of
 * each part of the apparatus, and says in as many words that no verified result
 * has been published.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  // Both are counted, not asserted, so the honest zeroes below stay honest
  // if a verified result is ever admitted.
  const measuredRuns = RUN_CELLS.reduce((sum, cell) => sum + cell.eligibleRuns, 0);

  return (
    <div>
      {/*
       * The hero is the differentiation argument made visual rather than
       * argued in prose: the display line, the figure ledger that puts the
       * 5 / 10 / 0 counts in the reader's eye, the system stack that says the
       * unit of measurement is the whole orchestration, and the market band
       * that names the five editions in their own scripts.
       */}
      <header className="mica-home-hero border-b border-[var(--color-ink)] pb-9">
        <ul className="mica-strip">
          {dict.site.editionStrip.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="mica-grid pt-8 md:pt-10">
          <div className="md:col-span-7">
            <h1 className="mica-display mica-hero">{dict.site.tagline}</h1>
            <p className="mica-display mica-h2 mt-5">
              {dict.site.secondary}
            </p>
            <p className="mica-lead mt-6 max-w-[54ch]">{dict.site.definition}</p>
            <p className="mt-7 flex flex-wrap gap-x-6 gap-y-1">
              <LocaleLink lang={lang} href="/rankings" className="mica-cta">
                {dict.home.readTables}
              </LocaleLink>
              <LocaleLink lang={lang} href="/methodology" className="mica-cta">
                {dict.home.howMeasured}
              </LocaleLink>
              <LocaleLink lang={lang} href="/submit" className="mica-cta">
                {dict.home.submitSnapshot}
              </LocaleLink>
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            {/* The figure ledger: hairline rows, mono numerals, no chrome. */}
            <dl className="mica-ledger">
              {[
                { term: dict.home.statMarkets, value: String(COUNTRIES.length) },
                {
                  term: dict.home.statFamilies,
                  value: String(evaluationFamilyCount()),
                },
                {
                  term: dict.home.statPublished,
                  value: String(publishedResultFamilyIds().length),
                },
                { term: dict.home.statSystems, value: String(SYSTEMS.length) },
                {
                  term: dict.home.statRuns,
                  value: measuredRuns.toLocaleString(lang),
                },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="mica-eyebrow">{item.term}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mica-micro mt-3">
              {dict.home.countedNote}
            </p>
          </div>
        </div>

        {/*
         * The system stack. Each term is a diagnostic axis MICA already
         * defines, so the line is read off the policy rather than written
         * here: a model is one link in it, never the thing being measured.
         */}
        <div className="mica-grid mt-9 border-t border-[var(--color-ink)] pt-5">
          <p className="mica-eyebrow md:col-span-3">{dict.home.stackEyebrow}</p>
          <ul className="mica-stack md:col-span-9">
            {DIAGNOSTIC_AXES.map((axis) => (
              <li key={axis.id}>
                <span className="mica-stack-term">
                  {dict.diagnosticAxes[axis.id].label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The market band: five editions, native name first. */}
        <div className="mica-grid mt-8 border-t border-[var(--color-ink)] pt-5">
          <p className="mica-eyebrow md:col-span-3">{dict.home.bandEyebrow}</p>
          <ul className="mica-band md:col-span-9">
            {COUNTRIES.map((country) => (
              <li key={country.code} data-market={country.code}>
                <LocaleLink
                  lang={lang}
                  href={`/countries/${country.code}`}
                  className="block text-[var(--color-ink)] no-underline"
                >
                  <span className="mica-band-code">{country.code}</span>
                  <span
                    className="mica-band-native"
                    lang={country.locale}
                  >
                    {country.nativeName}
                  </span>
                  <span className="mica-band-name">
                    {dict.markets[country.code]}
                  </span>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mt-9">
        <DemoDisclosure lang={lang} detail={dict.home.disclosureDetail} />
        {/*
         * The empty state, stated twice and deliberately: once as the standing
         * of the index, once as the standing of the taxonomy. Both counts are
         * read from the canonical records, so neither can be overstated in
         * copy.
         */}
        <div className="mica-notice mica-notice-empty mt-4">
          <p className="mica-notice-head">
            {dict.home.noResultsHeadline}
          </p>
          <p className="mica-body-sm mt-2 mb-0">
            {dict.home.noResultsDetail}
          </p>
        </div>
        <div className="mica-notice mica-notice-open mt-4">
          <p className="mica-notice-head">
            {dict.coverage.headline}
          </p>
          <p className="mica-body-sm mt-2 mb-0">
            {dict.coverage.detail}
          </p>
        </div>
      </div>

      <Section
        eyebrow={dict.home.axesEyebrow}
        title={dict.home.axesTitle}
        intro={dict.home.axesIntro}
      >
        {/*
         * The triptych. Each axis owns one hue and one glyph for the whole
         * site, and the two always travel together, so the identity survives
         * greyscale and colour blindness.
         */}
        <div className="mica-triptych">
          {OUTCOME_AXES.map((axis) => (
            <article key={axis.id} className="mica-axis" data-axis={axis.id}>
              <p className="mica-axis-bar m-0">
                <span>{dict.outcomeAxes[axis.id].label}</span>
                <AxisGlyph axis={axis.id} />
              </p>
              <div className="mica-axis-body">
                <h3 className="mica-display mica-h3">
                  {dict.outcomeAxes[axis.id].label}
                </h3>
                <p className="mica-eyebrow mt-2">
                  {dict.outcomeAxes[axis.id].unit}
                </p>
                <p className="mica-body-sm mt-4">
                  {dict.outcomeAxes[axis.id].description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/*
       * Where the ledger and the global table used to sit. They are not hidden
       * behind a flag: the records they read are gone, and the honest thing to
       * put in a benchmark's most valuable column inch is the state of the
       * apparatus, not an empty table implying a table is imminent.
       */}
      <Section
        eyebrow={dict.home.readinessEyebrow}
        title={dict.home.readinessTitle}
        intro={dict.home.readinessIntro}
      >
        <DataList items={dict.home.readinessItems} />
        <p className="mt-6">
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
          {TASK_FAMILIES.map((family, index) => {
            const categoryNumber = String(index + 1).padStart(2, "0");

            return (
            <article
              key={family.id}
              className="mica-family-row mica-grid border-b border-[var(--color-rule)] py-5"
            >
              <p className="mica-family-index md:col-span-1" aria-hidden="true">
                {categoryNumber}
              </p>
              <h3
                className="mica-display mica-h3 md:col-span-3"
                aria-label={`${dict.common.categoryLabel} ${categoryNumber}: ${dict.families[family.id].label}`}
              >
                {dict.families[family.id].label}
              </h3>
              <p className="mica-body md:col-span-5">
                {dict.families[family.id].summary}
              </p>
              <p className="mica-micro md:col-span-3">
                {family.canonicalTasks.length} {dict.common.canonicalTasks}
              </p>
            </article>
            );
          })}
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
