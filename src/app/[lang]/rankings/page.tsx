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
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";
import { localeHref } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "No verified results are published. The market, task family and outcome-axis controls are shown as planned methodology; accuracy, speed and cost are never combined.",
  alternates: { canonical: "/rankings" },
};

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
        <DemoDisclosure lang={lang} />
      </PageHeader>

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
        eyebrow={`${countryLabel} · ${familyLabelText}`}
        title={dict.rankings.resultsTitle}
      >
        {country === null ? (
          <p className="mica-notice max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            {dict.rankings.selectMarketNotice}
          </p>
        ) : (
          <p className="mica-notice max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            {dict.rankings.noResultsNotice}
          </p>
        )}
      </Section>

    </div>
  );
}
