import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { type MetricKey } from "@/lib/derive";
import {
  countryCodeSchema,
  taskFamilySchema,
  verificationStatusSchema,
  type VerificationStatusId,
} from "@/lib/schema";
import { VERIFICATION_STATUSES } from "@/data/policy/publication";
import { AxisGlyph, PageHeader, PublicationStatus, Section } from "@/components/editorial";
import { localeHref } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.rankings.metaTitle,
    description: dict.rankings.metaDescription,
    alternates: { canonical: `/${lang}/rankings` },
  };
}

const METRICS: readonly MetricKey[] = ["accuracy", "speed", "cost"];

/** No market selected is a real state, not a silent fallback to "all". */
function readCountry(value: string | undefined) {
  const parsed = countryCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function readFamily(value: string | undefined) {
  const parsed = taskFamilySchema.safeParse(value);
  return parsed.success ? parsed.data : ("all" as const);
}

function readMetric(value: string | undefined): MetricKey {
  return METRICS.includes(value as MetricKey) ? (value as MetricKey) : "accuracy";
}

/** Verified-first: the default view is independently rerun results only. */
function readVerification(value: string | undefined): VerificationStatusId {
  const parsed = verificationStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : "independent-rerun";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Rankings stays a real route with real, bookmarkable controls, and publishes
 * nothing. The filter is a plain GET form; the ordering it would apply changes
 * with the selected axis, but no axis is ever folded into another, because MICA
 * publishes no composite score. Until a verified result exists there is no
 * table to order and no evidence to link to, and the page says so.
 */
export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<LangParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  const query = await searchParams;
  const country = readCountry(first(query.country));
  const family = readFamily(first(query.family));
  const metric = readMetric(first(query.metric));
  const verification = readVerification(first(query.verification));

  const countryLabel =
    country === null
      ? dict.rankings.noMarketSelected
      : (dict.markets[country] ??
        COUNTRIES.find((entry) => entry.code === country)?.name ??
        country);
  const verificationStatus = VERIFICATION_STATUSES.find(
    (entry) => entry.id === verification,
  );
  const familyLabelText =
    family === "all"
      ? dict.common.allTaskFamilies
      : (dict.families[family]?.label ??
        TASK_FAMILIES.find((entry) => entry.id === family)?.label ??
        family);
  const axis = OUTCOME_AXES.find((entry) => entry.id === metric);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.rankings.eyebrow}
        title={dict.rankings.title}
        standfirst={dict.rankings.standfirst}
      >
        <PublicationStatus text={dict.rankings.noResultsNotice} />
      </PageHeader>

      <nav className="mica-leaderboard-nav" aria-label={dict.rankings.viewNavigationLabel}>
        <span className="mica-eyebrow">{dict.rankings.viewIndex}</span>
        <ol>
          <li><a href="#overall-leaderboard"><span>01</span>{dict.rankings.overallView}</a></li>
          <li><a href="#market-leaderboards"><span>02</span>{dict.rankings.marketView}</a></li>
          <li><a href="#category-leaderboards"><span>03</span>{dict.rankings.categoryView}</a></li>
        </ol>
      </nav>

      <Section
        id="overall-leaderboard"
        eyebrow={dict.rankings.overallEyebrow}
        title={dict.rankings.overallTitle}
        intro={dict.rankings.overallIntro}
      >
        <div className="mica-leaderboard-axes">
          {OUTCOME_AXES.map((entry) => {
            const scope = entry.id === "accuracy"
              ? dict.rankings.axisScopeAccuracy
              : entry.id === "speed"
                ? dict.rankings.axisScopeSpeed
                : dict.rankings.axisScopeCost;
            return (
              <article key={entry.id} data-leaderboard-axis={entry.id} className="mica-leaderboard-axis" data-axis={entry.id}>
                <div className="mica-leaderboard-axis-head">
                  <AxisGlyph axis={entry.id} />
                  <h3>{dict.outcomeAxes[entry.id].label}</h3>
                  <span>{dict.rankings.unpublishedLabel}</span>
                </div>
                <p className="mica-leaderboard-axis-state">
                  {entry.id === "cost"
                    ? dict.rankings.costGlobalUnavailable
                    : dict.rankings.axisAwaiting}
                </p>
                <p className="mica-micro">{scope}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        id="market-leaderboards"
        eyebrow={dict.rankings.marketEyebrow}
        title={dict.rankings.marketTitle}
        intro={dict.rankings.marketIntro}
      >
        <ol className="mica-leaderboard-register mica-leaderboard-markets">
          {COUNTRIES.map((entry, index) => (
            <li key={entry.code} data-leaderboard-market={entry.code} data-market={entry.code}>
              <LocaleLink lang={lang} href={`/rankings?country=${entry.code}#results`}>
                <span className="mica-register-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{dict.markets[entry.code]}</strong>
                <span className="mica-register-meta">{entry.currency}</span>
                <span className="mica-register-state">{dict.rankings.unpublishedLabel}</span>
                <span className="mica-register-action">{dict.rankings.marketOpen}</span>
              </LocaleLink>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="category-leaderboards"
        eyebrow={dict.rankings.categoryEyebrow}
        title={dict.rankings.categoryTitle}
        intro={dict.rankings.categoryIntro}
      >
        <ol className="mica-leaderboard-register mica-leaderboard-categories">
          {TASK_FAMILIES.map((entry, index) => (
            <li key={entry.id} data-leaderboard-family={entry.id}>
              <LocaleLink lang={lang} href={`/rankings?family=${entry.id}#results`}>
                <span className="mica-register-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{dict.families[entry.id].label}</strong>
                <span className="mica-register-meta">{entry.canonicalTasks.length} {dict.common.canonicalTasks}</span>
                <span className="mica-register-state">{dict.rankings.unpublishedLabel}</span>
                <span className="mica-register-action">{dict.rankings.categoryOpen}</span>
              </LocaleLink>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow={dict.rankings.filterEyebrow}
        title={dict.rankings.filterTitle}
        intro={dict.rankings.filterIntro}
      >
        {/*
         * Still a plain GET form with the same four named controls, so every
         * view stays bookmarkable. Only the layout changed: a two-up grid on a
         * phone rather than four full-width boxes in a 275px column.
         */}
        <form
          method="get"
          action={localeHref(lang, "/rankings")}
          aria-label={dict.rankings.formLabel}
          className="mica-panel"
        >
          <div className="mica-fields">
            <p className="mica-field mica-field-primary">
              <label className="mica-eyebrow text-[var(--color-atlas)]" htmlFor="metric">
                {dict.rankings.orderByAxis}
              </label>
              <select
                id="metric"
                name="metric"
                defaultValue={metric}
                className="mica-control"
              >
                {OUTCOME_AXES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {dict.outcomeAxes[entry.id].label}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="country">
                {dict.table.market}
              </label>
              <select
                id="country"
                name="country"
                defaultValue={country ?? ""}
                className="mica-control"
              >
                <option value="">{dict.rankings.chooseMarket}</option>
                {COUNTRIES.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {dict.markets[entry.code]}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="family">
                {dict.table.taskFamily}
              </label>
              <select
                id="family"
                name="family"
                defaultValue={family}
                className="mica-control"
              >
                <option value="all">{dict.common.allTaskFamilies}</option>
                {TASK_FAMILIES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {dict.families[entry.id].label}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="verification">
                {dict.table.verification}
              </label>
              <select
                id="verification"
                name="verification"
                defaultValue={verification}
                className="mica-control"
              >
                {VERIFICATION_STATUSES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {dict.verification[entry.id].label}
                  </option>
                ))}
              </select>
            </p>
          </div>
          <div className="mt-4 flex items-center gap-5 border-t border-[var(--color-rule)] pt-4">
            <button type="submit" className="mica-button w-auto">
              {dict.common.apply}
            </button>
            <LocaleLink lang={lang} href="/rankings" className="mica-link text-[14px]">
              {dict.common.reset}
            </LocaleLink>
          </div>
        </form>
        {axis ? (
          <p className="mica-summary mt-5 text-[14.5px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow text-[var(--color-atlas)]">
              {dict.rankings.orderingBy} {dict.outcomeAxes[axis.id].label}
            </span>
            <span className="max-w-[70ch]">
              {dict.outcomeAxes[axis.id].description}
            </span>
          </p>
        ) : null}
        {metric === "cost" && country === null ? (
          <p className="mica-notice mt-4 max-w-[70ch] text-[14.5px] text-[var(--color-ink-soft)]">
            {dict.rankings.costAcrossMarkets}
          </p>
        ) : null}
        {verificationStatus ? (
          <p className="mica-summary text-[14.5px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow">
              {dict.rankings.showingOnlyPrefix}{" "}
              {dict.verification[verificationStatus.id].label}{" "}
              {dict.rankings.showingOnlySuffix}
            </span>
            <span className="max-w-[70ch]">
              {dict.verification[verificationStatus.id].description}
            </span>
          </p>
        ) : null}
      </Section>

      <Section
        id="results"
        eyebrow={`${countryLabel} · ${familyLabelText}`}
        title={dict.rankings.resultsTitle}
      >
        <p className="mica-notice max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
          {country === null
            ? dict.rankings.selectMarketNotice
            : dict.rankings.selectedSliceEmptyNotice}
        </p>
      </Section>

    </div>
  );
}
