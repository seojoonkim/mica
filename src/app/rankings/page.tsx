import Link from "next/link";
import type { Metadata } from "next";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { OUTCOME_AXES } from "@/data/policy/axes";
import {
  aggregateBySystem,
  sortByMetric,
  type MetricKey,
} from "@/lib/derive";
import {
  countryCodeSchema,
  taskFamilySchema,
  verificationStatusSchema,
  type VerificationStatusId,
} from "@/lib/schema";
import { VERIFICATION_STATUSES } from "@/data/policy/publication";
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";
import { ResultsTable } from "@/components/results-table";
import { evidenceHref, getRunCellById, runCellId } from "@/lib/evidence";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Demo results by market, task family and outcome axis. Accuracy, speed and cost are never combined.",
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
 * The filter is a plain GET form. Ordering changes with the selected axis, but
 * no axis is ever folded into another — MICA publishes no composite score.
 */
export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const country = readCountry(first(query.country));
  const family = readFamily(first(query.family));
  const metric = readMetric(first(query.metric));
  const verification = readVerification(first(query.verification));

  // Cost is orderable inside one currency only, which a chosen market
  // guarantees; without a market there is nothing to order at all.
  const rows =
    country === null
      ? []
      : sortByMetric(
          aggregateBySystem({ country, family }).filter(
            (row) => row.verification === verification,
          ),
          metric,
        );
  const countryLabel =
    country === null
      ? "No market selected"
      : (COUNTRIES.find((entry) => entry.code === country)?.name ?? country);
  const verificationStatus = VERIFICATION_STATUSES.find(
    (entry) => entry.id === verification,
  );
  const familyLabelText =
    family === "all"
      ? "All task families"
      : (TASK_FAMILIES.find((entry) => entry.id === family)?.label ?? family);
  const axis = OUTCOME_AXES.find((entry) => entry.id === metric);

  return (
    <div>
      <PageHeader
        eyebrow="Result tables"
        title="Ordered by one axis at a time"
        standfirst="Choose a market first, then a task family and the axis you care about. Results default to independently rerun systems; widen the verification filter to see provisional or self-reported entries. The ordering changes; the numbers do not. MICA does not publish a composite score, and a system that leads on accuracy may be last on cost."
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="Filter"
        title="Slice the demo fixture"
        intro="The form submits as a normal link, so any view here can be bookmarked or shared."
      >
        {/*
         * Still a plain GET form with the same four named controls, so every
         * view stays bookmarkable. Only the layout changed: a two-up grid on a
         * phone rather than four full-width boxes in a 275px column.
         */}
        <form
          method="get"
          action="/rankings"
          aria-label="Filter results"
          className="mica-panel"
        >
          <div className="mica-fields">
            <p className="mica-field mica-field-primary">
              <label className="mica-eyebrow text-[var(--color-atlas)]" htmlFor="metric">
                Order by axis
              </label>
              <select
                id="metric"
                name="metric"
                defaultValue={metric}
                className="mica-control"
              >
                {OUTCOME_AXES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
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
                <option value="">Choose a market…</option>
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
                defaultValue={family}
                className="mica-control"
              >
                <option value="all">All task families</option>
                {TASK_FAMILIES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </p>
            <p className="mica-field">
              <label className="mica-eyebrow" htmlFor="verification">
                Verification
              </label>
              <select
                id="verification"
                name="verification"
                defaultValue={verification}
                className="mica-control"
              >
                {VERIFICATION_STATUSES.map((entry) => (
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
            <Link href="/rankings" className="mica-link text-[14px]">
              Reset
            </Link>
          </div>
        </form>
        {axis ? (
          <p className="mica-summary mt-5 text-[14.5px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow text-[var(--color-atlas)]">
              Ordering by {axis.label}
            </span>
            <span className="max-w-[70ch]">{axis.description}</span>
          </p>
        ) : null}
        {metric === "cost" && country === null ? (
          <p className="mica-notice mt-4 max-w-[70ch] text-[14.5px] text-[var(--color-ink-soft)]">
            Cost cannot be ordered across markets at once: the five editions do
            not share a currency. Choose a single market to see cost per
            success.
          </p>
        ) : null}
        {verificationStatus ? (
          <p className="mica-summary text-[14.5px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow">
              Showing {verificationStatus.label} only
            </span>
            <span className="max-w-[70ch]">
              {verificationStatus.description}
            </span>
          </p>
        ) : null}
      </Section>

      <Section
        eyebrow={`${countryLabel} · ${familyLabelText}`}
        title="Results"
      >
        {country === null ? (
          <p className="mica-notice max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            Select a market to see results. MICA measures each market on its own
            terms, and cost only exists inside one currency, so there is no
            all-markets table to show.
          </p>
        ) : (
          <>
            <ResultsTable
              rows={rows}
              caption={`${countryLabel} · ${familyLabelText} · ${verificationStatus?.label ?? verification} · ordered by ${axis?.label ?? metric}`}
              showCost
              metric={metric}
              /*
               * A row is one canonical run cell only when both a market and a
               * single task family are chosen. The all-families view pools
               * cells per row, so it gets no evidence column at all.
               */
              evidenceHrefFor={
                family === "all"
                  ? undefined
                  : (row) => {
                      const id = runCellId({
                        system: row.systemSlug,
                        country,
                        family,
                      });
                      return getRunCellById(id)
                        ? evidenceHref({
                            system: row.systemSlug,
                            country,
                            family,
                          })
                        : null;
                    }
              }
            />
            {family === "all" ? (
              <p className="mt-4 max-w-[70ch] text-[13px] text-[var(--color-ink-faint)]">
                Each row here pools every task family, so no single run cell
                stands behind it. Choose one task family to link straight to the
                run cell, or browse the{" "}
                <Link href={`/evidence?country=${country}`} className="mica-link">
                  run cells for {countryLabel}
                </Link>
                .
              </p>
            ) : null}
          </>
        )}
      </Section>
    </div>
  );
}
