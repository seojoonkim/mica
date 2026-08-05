import type { Interval } from "@/lib/calc";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/**
 * Wording used wherever a value genuinely does not exist. The English constants
 * keep their original names and values so nothing that already imports them
 * changes meaning; the localized versions are read from the dictionary.
 */
export const NO_SUCCESS = "No successful task.";
export const NO_DATA = "No coverage in this market.";
export const NOT_MEASURED = "Not measured";

/** The three missing-value phrases in one locale. */
export function missingLabels(lang: Locale = DEFAULT_LOCALE) {
  return getDict(lang).missing;
}

export function formatPercent(
  value: number | null,
  digits = 1,
  lang: Locale = DEFAULT_LOCALE,
): string {
  if (value === null || !Number.isFinite(value)) {
    return missingLabels(lang).notMeasured;
  }
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatInterval(
  interval: Interval | null,
  lang: Locale = DEFAULT_LOCALE,
): string {
  if (!interval) return missingLabels(lang).notMeasured;
  return `${(interval.low * 100).toFixed(0)}–${(interval.high * 100).toFixed(0)}%`;
}

export function formatSeconds(
  value: number | null,
  lang: Locale = DEFAULT_LOCALE,
): string {
  if (value === null || !Number.isFinite(value)) {
    return missingLabels(lang).noSuccess;
  }
  if (value < 60) return `${value.toFixed(0)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatCost(
  value: number | null,
  currency: string | null,
  lang: Locale = DEFAULT_LOCALE,
): string {
  if (value === null || currency === null || !Number.isFinite(value)) {
    return missingLabels(lang).noSuccess;
  }
  const fractionDigits = value >= 500 ? 0 : 2;
  // The currency code is data and is never translated; only grouping and symbol
  // placement follow the reader's locale.
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency,
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

/** Raw denominator label, e.g. "42 / 61 eligible runs". */
export function formatFraction(numerator: number, denominator: number): string {
  return `${numerator} / ${denominator}`;
}
