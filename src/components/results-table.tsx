import Link from "next/link";
import type { AggregateView, MetricKey } from "@/lib/derive";
import { paretoSlugs } from "@/lib/derive";
import {
  formatCost,
  formatFraction,
  formatInterval,
  formatPercent,
  formatSeconds,
  NO_DATA,
} from "@/lib/format";
import { VERIFICATION_STATUSES } from "@/data/policy/publication";
import { DemoStamp } from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";

const VERIFICATION_SHORT = new Map(
  VERIFICATION_STATUSES.map((status) => [status.id, status.short]),
);

/** Cost is only meaningful inside one currency, so a cross-market slice says so. */
const COST_NOT_COMPARABLE = "Not comparable across currencies";

/**
 * `metric` is the axis the rows were ordered by, passed in so the active column
 * can carry `aria-sort`. The table never reorders on its own.
 *
 * `evidenceHrefFor` is supplied only where a row maps to exactly one canonical
 * run cell — a single market and a single task family. An all-family table
 * pools several cells per row, so it gets no evidence link rather than a
 * misleading one.
 */
export function ResultsTable({
  rows,
  caption,
  showCost = true,
  metric,
  evidenceHrefFor,
}: {
  rows: readonly AggregateView[];
  caption: string;
  showCost?: boolean;
  metric?: MetricKey;
  evidenceHrefFor?: (row: AggregateView) => string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className="mica-notice text-[14px] text-[var(--color-ink-soft)]">
        {NO_DATA} No system in the demo edition has run cells for this slice.
      </p>
    );
  }

  const frontier = paretoSlugs(rows);
  // Accuracy reads best-first descending; speed and cost read best-first
  // ascending, because lower is better on both.
  const sortOf = (column: MetricKey) =>
    metric === column
      ? ({ "aria-sort": column === "accuracy" ? "descending" : "ascending" } as const)
      : {};
  // The same column that carries aria-sort is tinted, so the ordering axis is
  // visible as well as announced.
  const cellOf = (column: MetricKey) =>
    metric === column ? "num is-metric" : "num";

  return (
    <div>
      <DemoStamp className="mb-4" />
      <DataTableScroller label={caption}>
        <table className="mica-table">
          <caption>
            {caption} — Illustrative demo data, not an official ranking. Columns
            are read separately; MICA publishes no composite score.
          </caption>
          <thead>
            <tr>
              <th scope="col">System</th>
              <th scope="col">Verification</th>
              <th scope="col" className={cellOf("accuracy")} {...sortOf("accuracy")}>
                Accuracy
              </th>
              <th scope="col" className="num">
                95% interval
              </th>
              <th scope="col" className={cellOf("speed")} {...sortOf("speed")}>
                Speed p50
              </th>
              <th scope="col" className="num">
                Speed p95
              </th>
              {showCost ? (
                <th scope="col" className={cellOf("cost")} {...sortOf("cost")}>
                  Cost per success
                </th>
              ) : null}
              <th scope="col" className="num">
                Eligible runs
              </th>
              <th scope="col">Standing</th>
              {evidenceHrefFor ? <th scope="col">Run cell</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.systemSlug}>
                <th scope="row" className="font-normal">
                  <Link
                    href={`/agents/${row.systemSlug}`}
                    className="mica-link"
                  >
                    {row.systemName}
                  </Link>
                  {frontier.has(row.systemSlug) ? (
                    <span className="mica-eyebrow ml-2 text-[var(--color-vermilion)]">
                      Frontier
                    </span>
                  ) : null}
                </th>
                <td className="font-[family-name:var(--font-mono)] text-[12.5px] uppercase tracking-[0.06em]">
                  {VERIFICATION_SHORT.get(row.verification) ?? row.verification}
                </td>
                <td className={cellOf("accuracy")}>{formatPercent(row.accuracy)}</td>
                <td className="num text-[var(--color-ink-faint)]">
                  {formatInterval(row.accuracyInterval)}
                </td>
                <td className={cellOf("speed")}>{formatSeconds(row.latencyP50)}</td>
                <td className="num">{formatSeconds(row.latencyP95)}</td>
                {showCost ? (
                  <td className={cellOf("cost")}>
                    {row.currency === null
                      ? COST_NOT_COMPARABLE
                      : formatCost(row.costPerSuccess, row.currency)}
                  </td>
                ) : null}
                <td className="num text-[var(--color-ink-faint)]">
                  {formatFraction(row.successfulRuns, row.eligibleRuns)}
                </td>
                <td className="text-[13px] text-[var(--color-ink-faint)]">
                  Not publication eligible
                  {row.criticalSafetyEvents > 0
                    ? " — critical safety event"
                    : ""}
                </td>
                {evidenceHrefFor ? (
                  <td className="text-[13px]">
                    {(() => {
                      const href = evidenceHrefFor(row);
                      return href ? (
                        <Link href={href} className="mica-link">
                          Evidence
                        </Link>
                      ) : (
                        <span className="text-[var(--color-ink-faint)]">—</span>
                      );
                    })()}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableScroller>
      <p className="mt-3 max-w-[76ch] text-[12.5px] text-[var(--color-ink-faint)]">
        Accuracy is the share of eligible runs reaching the confirmed final
        state. Speed p50 and p95 describe successful eligible runs only, so they
        say how long success took, not how long an attempt took; failed attempts
        are timed and kept with the run cell but are not in this population.
        Cost divides the cost of all eligible attempts by the successful ones. &ldquo;Frontier&rdquo; marks
        rows not dominated on all three axes at once; it is not a rank.
      </p>
    </div>
  );
}
