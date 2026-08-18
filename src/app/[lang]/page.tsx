import { LocaleLink } from "@/components/locale-link";
import { TaskFamilyIcon } from "@/components/task-family-icon";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_CATALOGUE_STATUS, TASK_FAMILIES } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import { DIAGNOSTIC_AXES, OUTCOME_AXES } from "@/data/policy/axes";
import {
  AxisGlyph,
  DataList,
  DetailCue,
  PublicationStatus,
  Section,
} from "@/components/editorial";
import {
  evaluationFamilyCount,
  publishedResultFamilyIds,
} from "@/lib/i18n/coverage";

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: `${SITE.name} — ${dict.site.longName}`,
    description: dict.site.definition,
    alternates: localeAlternates(lang, "/"),
  };
}

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

  // The catalogue lifecycle, counted from the canonical task records and the
  // run-cell ledger rather than asserted in copy.
  const calibrationPending = TASK_FAMILIES.flatMap((family) => family.canonicalTasks)
    .filter((task) => task.measurement.references.status === "calibration-pending")
    .length;
  const lifecycleFigures = [
    {
      term: dict.home.lifecycleCandidates,
      value: String(TASK_CATALOGUE_STATUS.candidateTasks),
    },
    {
      term: dict.home.lifecycleCalibrationPending,
      value: String(calibrationPending),
    },
    {
      term: dict.home.lifecycleValidated,
      value: String(TASK_CATALOGUE_STATUS.validatedTasks),
    },
    {
      term: dict.home.lifecyclePublishedResults,
      value: String(RUN_CELLS.length),
    },
  ];

  return (
    <div>
      {/*
       * The hero is the differentiation argument made visual rather than
       * argued in prose: the display line, the figure ledger that puts the
       * market / family / result counts in the reader's eye, the system stack
       * that says the unit of measurement is the whole orchestration, and the
       * market band that names every edition in its own script.
       */}
      <header className="mica-home-hero border-b border-[var(--color-ink)] pb-9">
        <div className="mica-grid pt-9 md:pt-12">
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
            {DIAGNOSTIC_AXES.map((axis, index) => (
              <li key={axis.id}>
                <span className="mica-stack-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mica-stack-term">
                  {dict.diagnosticAxes[axis.id].label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The market band: every edition, native name first. */}
        <div className="mica-grid mt-8 border-t border-[var(--color-ink)] pt-5">
          <p className="mica-eyebrow md:col-span-3">{dict.home.bandEyebrow}</p>
          <ul className="mica-band md:col-span-9">
            {COUNTRIES.map((country) => (
              <li key={country.code} data-market={country.code}>
                <LocaleLink
                  lang={lang}
                  href={`/countries/${country.code}`}
                  className="block text-[var(--color-ink)] no-underline"
                  data-detail-link
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
                  <DetailCue />
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <Section
        eyebrow={dict.home.frameworkEyebrow}
        title={dict.home.frameworkTitle}
        intro={dict.home.frameworkIntro}
      >
        <div data-testid="agent-capability-framework">
          <ol className="mica-framework-stages">
            {dict.home.frameworkStages.map((stage, index) => (
              <li key={stage.label}>
                <p className="mica-framework-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mica-eyebrow">{stage.label}</p>
                <h3 className="mica-display mica-h3">{stage.title}</h3>
                <p className="mica-body-sm">{stage.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mica-framework-formula">{dict.home.frameworkFormulaLabel}</p>
          <div className="mica-framework-field">
            <div>
              <p className="mica-eyebrow">{dict.home.frameworkFieldTitle}</p>
              <p className="mica-body-sm mt-2 mb-0">{dict.home.frameworkFieldDetail}</p>
            </div>
            <ul className="mica-framework-diagnostics" aria-label={dict.home.stackEyebrow}>
              {DIAGNOSTIC_AXES.map((axis, index) => (
                <li key={axis.id}>
                  <span className="mica-diagnostic-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mica-diagnostic-copy">
                    <span className="mica-stack-term">{dict.diagnosticAxes[axis.id].label}</span>
                    <span className="mica-body-sm">{dict.diagnosticAxes[axis.id].description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>


      <div className="mt-9">
        <PublicationStatus text={dict.home.publicationStatus} />
        {/*
         * The empty state, stated twice and deliberately: once as the standing
         * of the index, once as the standing of the taxonomy. Both counts are
         * read from the canonical records, so neither can be overstated in
         * copy.
         */}
        <div className="mica-home-status mt-4">
          <div>
            <p className="mica-notice-head">
              {dict.home.noResultsHeadline}
            </p>
            <p className="mica-body-sm mt-2 mb-0">
              {dict.home.noResultsDetail}
            </p>
          </div>
          <div className="mica-home-status-next">
            <p className="mica-eyebrow">{dict.coverage.headline}</p>
            <p className="mica-body-sm mt-2 mb-0">{dict.coverage.detail}</p>
          </div>
        </div>
        <dl
          className="mica-ledger mt-4"
          data-testid="catalogue-lifecycle-status"
          aria-label={dict.home.lifecycleLabel}
        >
          {lifecycleFigures.map((figure) => (
            <div key={figure.term}>
              <dt className="mica-eyebrow">{figure.term}</dt>
              <dd>{figure.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Section
        eyebrow={dict.home.positionEyebrow}
        title={dict.home.positionTitle}
        intro={dict.home.positionIntro}
      >
        <DataList items={dict.home.positionItems} />
        <p className="mt-6">
          <LocaleLink lang={lang} href="/methodology#why-mica" className="mica-link">
            {dict.home.positionLink}
          </LocaleLink>
        </p>
      </Section>

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
          {OUTCOME_AXES.map((axis, index) => (
            <article key={axis.id} className="mica-axis" data-axis={axis.id}>
              <p className="mica-axis-bar m-0">
                <span aria-hidden="true">
                  {String(index + 1).padStart(2, "0")} / {String(OUTCOME_AXES.length).padStart(2, "0")}
                </span>
                <AxisGlyph axis={axis.id} />
              </p>
              <div className="mica-axis-body">
                <h3 className="mica-display mica-h3">
                  {dict.outcomeAxes[axis.id].label}
                </h3>
                <dl className="mica-axis-definition">
                  <div className="mica-axis-measure">
                    <dt>{dict.common.measurementLabel}</dt>
                    <dd>{dict.outcomeAxes[axis.id].unit}</dd>
                  </div>
                  <div className="mica-axis-rule">
                    <dt>{dict.common.ruleLabel}</dt>
                    <dd>{dict.outcomeAxes[axis.id].description}</dd>
                  </div>
                </dl>
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
        <ol className="mica-home-family-index">
          {TASK_FAMILIES.map((family, index) => {
            const categoryNumber = String(index + 1).padStart(2, "0");

            return (
            <li
              key={family.id}
            >
              <LocaleLink lang={lang} href={`/tasks#${family.id}`} data-detail-link>
                <span className="mica-home-family-number" aria-hidden="true">
                  {categoryNumber}
                </span>
                <TaskFamilyIcon family={family.id} />
                <span className="mica-home-family-copy">
                  <strong>{dict.families[family.id].label}</strong>
                  <span>{dict.families[family.id].summary}</span>
                </span>
                <span className="mica-home-family-count">
                  {family.canonicalTasks.length} {dict.common.canonicalTasks}
                </span>
                <DetailCue />
              </LocaleLink>
            </li>
            );
          })}
        </ol>
        <p className="mt-4">
          <LocaleLink lang={lang} href="/tasks" className="mica-link">
            {dict.home.familiesLink}
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
