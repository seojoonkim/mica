/**
 * Locale primitives. Kept dependency-free and free of Next imports so that
 * middleware, server components and tests can all use the same functions.
 */

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** The cookie MICA writes when a reader picks a language explicitly. */
export const LOCALE_COOKIE = "mica_lang";

/** One year: a language choice is a preference, not a session detail. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Cookie first, then Accept-Language by declared quality, then English. A value
 * that names no supported locale is ignored rather than guessed at.
 */
export function pickLocale(
  cookie: string | undefined,
  acceptLanguage: string | undefined,
): Locale {
  if (isLocale(cookie)) return cookie;
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      return {
        base: tag.trim().toLowerCase().split("-")[0],
        quality: q ? Number.parseFloat(q.slice(2)) : 1,
      };
    })
    .filter((entry) => Number.isFinite(entry.quality))
    .sort((a, b) => b.quality - a.quality);

  for (const entry of ranked) {
    if (isLocale(entry.base)) return entry.base;
  }
  return DEFAULT_LOCALE;
}

/**
 * `/rankings` → `/ko/rankings`, `/` → `/ko`. A query string travels with the
 * path so a filtered view keeps its filters across a language change.
 */
export function localeHref(lang: Locale, path: string): string {
  const [pathname, query] = path.split("?");
  const clean = pathname === "/" || pathname === "" ? "" : pathname;
  return `/${lang}${clean}${query ? `?${query}` : ""}`;
}

/**
 * The inverse: split a pathname into its locale segment and the logical path
 * beneath it. `lang` is null when the pathname carries no locale at all, which
 * is what the middleware uses to decide whether a redirect is needed — and is
 * why the redirect cannot loop.
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
