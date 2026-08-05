import type { Interval } from "@/lib/calc";

/** Wording used wherever a value genuinely does not exist. */
export const NO_SUCCESS = "No successful task.";
export const NO_DATA = "No coverage in this market.";
export const NOT_MEASURED = "Not measured";

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return NOT_MEASURED;
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatInterval(interval: Interval | null): string {
  if (!interval) return NOT_MEASURED;
  return `${(interval.low * 100).toFixed(0)}–${(interval.high * 100).toFixed(0)}%`;
}

export function formatSeconds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return NO_SUCCESS;
  if (value < 60) return `${value.toFixed(0)}s`;
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatCost(
  value: number | null,
  currency: string | null,
): string {
  if (value === null || currency === null || !Number.isFinite(value)) {
    return NO_SUCCESS;
  }
  const fractionDigits = value >= 500 ? 0 : 2;
  return new Intl.NumberFormat("en", {
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
