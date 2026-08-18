
import { SITE } from "@/lib/site";
import { NAV, DOWNLOADS } from "@/components/nav-items";
import { NavLinks } from "@/components/nav-links";
import { LocaleLink } from "@/components/locale-link";
import { LocaleSwitchLive } from "@/components/locale-switch";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

export function SkipLink({ lang }: { lang: Locale }) {
  return (
    <a href="#main" className="mica-skip">
      {getDict(lang).chrome.skip}
    </a>
  );
}
export function Masthead({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <header className="mica-masthead">
      <div className="mica-shell">
        {/*
         * A masthead, not a product bar: the wordmark is set in the display
         * serif at broadsheet size with its expansion beneath, and the edition
         * stamp and language switch sit opposite it on the same baseline band.
         * On a phone the expansion drops and the wordmark shrinks, but nothing
         * moves into a second row.
         */}
        <div className="mica-masthead-top">
          <LocaleLink
            lang={lang}
            href="/"
            aria-label={dict.chrome.homeLabel}
            className="block min-h-11 min-w-0 text-[var(--color-ink)] no-underline"
          >
            <span className="mica-wordmark">MICA</span>
            <span className="mica-wordmark-expansion mt-1.5">
              {dict.site.longName}
            </span>
          </LocaleLink>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <p className="mica-eyebrow hidden text-right sm:block">
              {dict.site.edition}
            </p>
            <LocaleSwitchLive lang={lang} />
          </div>
        </div>
        <nav
          aria-label={dict.chrome.primaryNavLabel}
          className="border-t border-[var(--color-ink)]"
        >
          <NavLinks lang={lang} />
        </nav>
      </div>
    </header>
  );
}
export function Colophon({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <footer className="mt-24 border-t border-[var(--color-ink)] py-10">
      <div className="mica-shell">
        <div className="mica-grid">
          <div className="md:col-span-5">
            <p className="mica-display text-[26px] leading-tight">
              {dict.site.longName}
            </p>
            <p className="mica-body-sm mt-2">
              {dict.site.tagline} {dict.site.secondary}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
              {SITE.name} · {dict.site.edition}
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-7">
            <p className="mica-eyebrow">{dict.chrome.indexHeading}</p>
            <ul className="mt-2 list-none space-y-1 p-0 text-[13.5px]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <LocaleLink lang={lang} href={item.href} className="mica-link">
                    {dict.nav[item.key]}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="mica-eyebrow">{dict.chrome.downloadsHeading}</p>
            <ul className="mt-2 list-none space-y-1 p-0 text-[13.5px]">
              {DOWNLOADS.map((item) => (
                <li key={item.href}>
                  <a className="mica-link" href={item.href} download>
                    {dict.chrome[item.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="mica-rule my-6" />
        <p className="max-w-[80ch] text-[11px] uppercase leading-relaxed tracking-[0.1em] text-[var(--color-ink-faint)]">
          {dict.chrome.colophonNote}
        </p>
      </div>
    </footer>
  );
}
