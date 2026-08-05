"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeHref,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/**
 * The language switch.
 *
 * It takes the logical path and the raw query string as props rather than
 * reading them itself, so the same component renders identically on the server
 * and needs no `useSearchParams` bailout. Both are supplied by the layout from
 * the request, which is what keeps a filtered Rankings view — market, family,
 * metric, verification — intact across a language change.
 *
 * The click writes the preference cookie the middleware reads at `/`, so the
 * choice survives a later visit to the bare origin.
 */
export function LocaleSwitch({
  lang,
  path,
  search,
}: {
  lang: Locale;
  path: string;
  search: string;
}) {
  const dict = getDict(lang);
  const target = search ? `${path}?${search}` : path;

  const remember = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  };

  return (
    <nav aria-label={dict.locale.switchLabel} className="mica-langswitch">
      <ul className="m-0 flex list-none items-center gap-2 p-0">
        {LOCALES.map((locale) => (
          <li key={locale}>
            <Link
              href={localeHref(locale, target)}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === lang ? "true" : undefined}
              className="mica-langlink"
              onClick={() => remember(locale)}
            >
              {dict.locale[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The switch as mounted in the masthead. It reads the current location itself
 * so no layout has to opt into a dynamic render to know the path; the Suspense
 * boundary is what `useSearchParams` requires on a statically generated page.
 */
function LocaleSwitchFromLocation({ lang }: { lang: Locale }) {
  const { path } = splitLocale(usePathname() ?? "/");
  const search = useSearchParams().toString();
  return <LocaleSwitch lang={lang} path={path} search={search} />;
}

export function LocaleSwitchLive({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={<LocaleSwitch lang={lang} path="/" search="" />}>
      <LocaleSwitchFromLocation lang={lang} />
    </Suspense>
  );
}
