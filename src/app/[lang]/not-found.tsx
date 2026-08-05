import type { Metadata } from "next";
import { NAV } from "@/components/nav-items";
import { LocaleLink } from "@/components/locale-link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: getDict(DEFAULT_LOCALE).notFound.metaTitle,
};

/**
 * A not-found boundary receives no params, so it renders in the default locale.
 * Nav labels come from the dictionary: `NAV` now carries hrefs and dictionary
 * keys only, so a label is never written twice.
 */
export default function NotFound() {
  const lang = DEFAULT_LOCALE;
  const dict = getDict(lang);
  return (
    <div className="mica-grid py-20">
      <div className="md:col-span-8">
        <p className="mica-eyebrow">{dict.notFound.eyebrow}</p>
        <h1 className="mica-display mt-3 text-[42px]">{dict.notFound.title}</h1>
        <p className="mt-4 max-w-[60ch] text-[16px] text-[var(--color-ink-soft)]">
          {dict.notFound.body}
        </p>
        <ul className="mt-6 flex list-none flex-wrap gap-x-6 p-0">
          {NAV.map((item) => (
            <li key={item.href}>
              <LocaleLink lang={lang} href={item.href} className="mica-link">
                {dict.nav[item.key]}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
