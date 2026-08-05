import Link from "next/link";
import type { AggregateView } from "@/lib/derive";
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

const VERIFICATION_SHORT = new Map(
  VERIFICATION_STATUSES.map((status) => [status.id, status.short]),
);

/** Cost is only meaningful inside one currency, so a cross-market slice says so. */
const COST_NOT_COMPARABLE = "Not comparable across currencies";

export function ResultsTable({
  rows,
  caption,
  showCost = true,
}: {
  rows: readonly AggregateView[];
  caption: string;
  showCost?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="mica-notice text-[14px] text-[var(--color-ink-soft)]">
        {NO_DATA} No system in the demo edition has run cells for this slice.
      </p>
    );
  }

  const frontier = paretoSlugs(rows);

  return (
    <div>
      <DemoStamp className="mb-4" />
      <div className="mica-scroller">
        <table className="mica-table">
          <caption>
            {caption} — Illustrative demo data, not an official ranking. Columns
            are read separately; MICA publishes no composite score.
          </caption>
          <thead>
            <tr>
              <th scope="col">System</th>
              <th scope="col">Verification</th>
              <th scope="col" className="num">
                Accuracy
              </th>
              <th scope="col" className="num">
                95% interval
              </th>
              <th scope="col" className="num">
                Speed p50
              </th>
              <th scope="col" className="num">
                Speed p90
              </th>
              {showCost ? (
                <th scope="col" className="num">
                  Cost per success
                </th>
              ) : null}
              <th scope="col" className="num">
                Eligible runs
              </th>
              <th scope="col">Standing</th>
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
                <td className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.08em]">
                  {VERIFICATION_SHORT.get(row.verification) ?? row.verification}
                </td>
                <td className="num">{formatPercent(row.accuracy)}</td>
                <td className="num text-[var(--color-ink-faint)]">
                  {formatInterval(row.accuracyInterval)}
                </td>
                <td className="num">{formatSeconds(row.latencyP50)}</td>
                <td className="num">{formatSeconds(row.latencyP90)}</td>
                {showCost ? (
                  <td className="num">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-[76ch] text-[12.5px] text-[var(--color-ink-faint)]">
        Accuracy is the share of eligible runs reaching the confirmed final
        state. Speed counts successful runs only. Cost divides the cost of all
        eligible attempts by the successful ones. &ldquo;Frontier&rdquo; marks
        rows not dominated on all three axes at once; it is not a rank.
      </p>
    </div>
  );
}
