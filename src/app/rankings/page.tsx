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
import { countryCodeSchema, taskFamilySchema } from "@/lib/schema";
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";
import { ResultsTable } from "@/components/results-table";

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Demo results by market, task family and outcome axis. Accuracy, speed and cost are never combined.",
  alternates: { canonical: "/rankings" },
};

const METRICS: readonly MetricKey[] = ["accuracy", "speed", "cost"];

function readCountry(value: string | undefined) {
  const parsed = countryCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : ("all" as const);
}

function readFamily(value: string | undefined) {
  const parsed = taskFamilySchema.safeParse(value);
  return parsed.success ? parsed.data : ("all" as const);
}

function readMetric(value: string | undefined): MetricKey {
  return METRICS.includes(value as MetricKey) ? (value as MetricKey) : "accuracy";
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

  const rows = sortByMetric(aggregateBySystem({ country, family }), metric);
  const countryLabel =
    country === "all"
      ? "All markets"
      : (COUNTRIES.find((entry) => entry.code === country)?.name ?? country);
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
        standfirst="Choose a market, a task family and the axis you care about. The ordering changes; the numbers do not. MICA does not publish a composite score, and a system that leads on accuracy may be last on cost."
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="Filter"
        title="Slice the demo fixture"
        intro="The form submits as a normal link, so any view here can be bookmarked or shared."
      >
        <form
          method="get"
          action="/rankings"
          className="flex flex-wrap items-end gap-4 border-y border-[var(--color-rule)] py-5"
        >
          <p className="flex flex-col gap-1.5">
            <label className="mica-eyebrow" htmlFor="country">
              Market
            </label>
            <select
              id="country"
              name="country"
              defaultValue={country}
              className="mica-control"
            >
              <option value="all">All markets</option>
              {COUNTRIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </select>
          </p>
          <p className="flex flex-col gap-1.5">
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
          <p className="flex flex-col gap-1.5">
            <label className="mica-eyebrow" htmlFor="metric">
              Order by
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
          <button type="submit" className="mica-control cursor-pointer">
            Apply
          </button>
          <Link href="/rankings" className="mica-link self-center text-[13px]">
            Reset
          </Link>
        </form>
        {axis ? (
          <p className="mt-4 max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow mr-2">Ordering by {axis.label}</span>
            {axis.description}
          </p>
        ) : null}
        {metric === "cost" && country === "all" ? (
          <p className="mica-notice mt-4 max-w-[70ch] text-[14px] text-[var(--color-ink-soft)]">
            Cost cannot be ordered across all markets at once: the five editions
            do not share a currency. Choose a single market to see cost per
            success.
          </p>
        ) : null}
      </Section>

      <Section
        eyebrow={`${countryLabel} · ${familyLabelText}`}
        title="Results"
      >
        <ResultsTable
          rows={rows}
          caption={`${countryLabel} · ${familyLabelText} · ordered by ${axis?.label ?? metric}`}
          showCost={country !== "all"}
        />
      </Section>
    </div>
  );
}
