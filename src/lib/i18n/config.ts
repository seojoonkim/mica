/**
 * Locale primitives. Kept dependency-free and free of Next imports so server
 * components, route configuration and tests share the same URL policy.
 */

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * `/rankings` → `/ko/rankings`, `/` → `/ko`. A query string travels with the
 * path so a filtered view keeps its filters across a language change.
 */
export function localeHref(lang: Locale, path: string): string {
  const [pathname, query] = path.split("?");
  const clean = pathname === "/" || pathname === "" ? "" : pathname;
  const prefix = lang === DEFAULT_LOCALE ? "" : `/${lang}`;
  const localizedPath = clean ? `${prefix}${clean}` : prefix || "/";
  return `${localizedPath}${query ? `?${query}` : ""}`;
}

/**
 * The inverse: split a pathname into its locale segment and logical path.
 * `lang` is null for canonical unprefixed English URLs.
 */
export function splitLocale(pathname: string): {
  lang: Locale | null;
  path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if (!isLocale(first)) return { lang: null, path: pathname || "/" };
  return { lang: first, path: rest.length === 0 ? "/" : `/${rest.join("/")}` };
}

/**
 * The document language of a market's native name, so a mixed-script list is
 * announced correctly. Singapore's own name is already English.
 */
const COUNTRY_HTML_LANG: Record<string, string> = {
  kr: "ko",
  jp: "ja",
  sg: "en",
  tw: "zh-Hant",
  th: "th",
};

export function htmlLangForCountry(code: string): string {
  return COUNTRY_HTML_LANG[code] ?? "en";
}

/** BCP 47 tag for the interface language itself. */
export const HTML_LANG: Record<Locale, string> = { en: "en", ko: "ko" };
