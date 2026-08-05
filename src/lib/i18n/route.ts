import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * The shape every page under `src/app/[lang]` receives. `lang` arrives as a raw
 * string because the router does not know the locale union; `readLocale` is the
 * single place it is validated, so an unsupported segment is a 404 rather than
 * a page rendered against an undefined dictionary.
 */
export type LangParams = { lang: string };

export async function readLocale(params: Promise<LangParams>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}

/** Both locales are prerendered; there is no runtime-only language. */
export function localeStaticParams(): { lang: Locale }[] {
  return LOCALES.map((lang) => ({ lang }));
}
