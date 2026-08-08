import type { AggregateView, MetricKey } from "@/lib/derive";
import { paretoSlugs } from "@/lib/derive";
import {
  formatCost,
  formatFraction,
  formatInterval,
  formatPercent,
  formatSeconds,
  missingLabels,
} from "@/lib/format";
import { AxisGlyph } from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";
import { LocaleLink } from "@/components/locale-link";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

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
  lang = DEFAULT_LOCALE,
  showCost = true,
  metric,
  evidenceHrefFor,
}: {
  rows: readonly AggregateView[];
  caption: string;
  lang?: Locale;
  showCost?: boolean;
  metric?: MetricKey;
  evidenceHrefFor?: (row: AggregateView) => string | null;
}) {
  const dict = getDict(lang);

  if (rows.length === 0) {
    return (
      <p className="mica-notice text-[14px] text-[var(--color-ink-soft)]">
        {missingLabels(lang).noData} {dict.table.emptySlice}
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
  // The same column that carries aria-sort is marked, so the ordering axis is
  // visible as well as announced. The mark is three channels at once — the
  // axis hue, a hard left edge, and the axis glyph in the header — so no
  // reader depends on colour alone.
  const cellOf = (column: MetricKey) =>
    metric === column ? `num is-metric is-metric-${column}` : "num";
  const markOf = (column: MetricKey) =>
    metric === column ? <AxisGlyph axis={column} /> : null;

  return (
    <div>
      <DataTableScroller label={caption} lang={lang}>
        <table className="mica-table">
          <caption>
            {caption} — {dict.table.captionSuffixScoring}
          </caption>
          <thead>
            <tr>
              <th scope="col">{dict.table.system}</th>
              <th scope="col">{dict.table.verification}</th>
              <th scope="col" className={cellOf("accuracy")} {...sortOf("accuracy")}>
                {markOf("accuracy")}
                {dict.table.accuracy}
              </th>
              <th scope="col" className="num">
                {dict.table.interval95}
              </th>
              <th scope="col" className={cellOf("speed")} {...sortOf("speed")}>
                {markOf("speed")}
                {dict.table.speedP50}
              </th>
              <th scope="col" className="num">
                {dict.table.speedP95}
              </th>
              {showCost ? (
                <th scope="col" className={cellOf("cost")} {...sortOf("cost")}>
                  {markOf("cost")}
                  {dict.table.costPerSuccess}
                </th>
              ) : null}
              <th scope="col" className="num">
                {dict.table.eligibleRuns}
              </th>
              <th scope="col">{dict.table.standing}</th>
              {evidenceHrefFor ? <th scope="col">{dict.table.runCell}</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.systemSlug}>
                <th scope="row" className="font-normal">
                  <LocaleLink
                    lang={lang}
                    href={`/agents/${row.systemSlug}`}
                    className="mica-link"
                  >
                    {row.systemName}
                  </LocaleLink>
                  {frontier.has(row.systemSlug) ? (
                    <span className="mica-eyebrow ml-2 text-[var(--color-vermilion)]">
                      {dict.table.frontier}
                    </span>
                  ) : null}
                </th>
                <td className="font-[family-name:var(--font-mono)] text-[12.5px] uppercase tracking-[0.06em]">
                  {dict.verification[row.verification]?.short ?? row.verification}
                </td>
                <td className={cellOf("accuracy")}>
                  {formatPercent(row.accuracy, 1, lang)}
                </td>
                <td className="num text-[var(--color-ink-faint)]">
                  {formatInterval(row.accuracyInterval, lang)}
                </td>
                <td className={cellOf("speed")}>
                  {formatSeconds(row.latencyP50, lang)}
                </td>
                <td className="num">{formatSeconds(row.latencyP95, lang)}</td>
                {showCost ? (
                  <td className={cellOf("cost")}>
                    {row.currency === null
                      ? dict.table.costNotComparable
                      : formatCost(row.costPerSuccess, row.currency, lang)}
                  </td>
                ) : null}
                <td className="num text-[var(--color-ink-faint)]">
                  {formatFraction(row.successfulRuns, row.eligibleRuns)}
                </td>
                <td className="text-[13px] text-[var(--color-ink-faint)]">
                  {dict.table.notPublicationEligible}
                  {row.criticalSafetyEvents > 0
                    ? dict.table.criticalSafetyEvent
                    : ""}
                </td>
                {evidenceHrefFor ? (
                  <td className="text-[13px]">
                    {(() => {
                      const href = evidenceHrefFor(row);
                      return href ? (
                        <LocaleLink lang={lang} href={href} className="mica-link">
                          {dict.table.evidence}
                        </LocaleLink>
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
        {dict.table.footnote}
      </p>
    </div>
  );
}
