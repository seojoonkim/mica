
import { SITE } from "@/lib/site";
import { NAV, DOWNLOADS } from "@/components/nav-items";
import { NavLinks } from "@/components/nav-links";
import { LocaleLink } from "@/components/locale-link";
import { LocaleSwitchLive } from "@/components/locale-switch";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

export function SkipLink({ lang }: { lang: Locale }) {
  return (
    <a href="#main" className="mica-skip">
      {getDict(lang).chrome.skip}
    </a>
  );
}

/**
 * Both mandated English strings, plus their Korean equivalents when the reader
 * is in Korean. The English wording is never replaced — it is the contract —
 * so a Korean reader sees the Korean sentence and the exact English phrase.
 */
export function DemoWords({
  lang,
  separator = " · ",
}: {
  lang: Locale;
  separator?: string;
}) {
  const dict = getDict(lang);
  const english = `${dict.disclosure.demoLabel}${separator}${dict.disclosure.notRanking}`;
  if (lang === DEFAULT_LOCALE) return <>{english}</>;
  return (
    <>
      <span lang={lang}>
        {dict.disclosure.demoLabelLocal}
        {separator}
        {dict.disclosure.notRankingLocal}
      </span>
      <span lang="en"> ({english})</span>
    </>
  );
}

export function Masthead({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <header className="border-b border-[var(--color-rule-strong)] bg-[var(--color-surface)]">
      <div className="mica-shell">
        {/*
         * One horizontal identity line on every viewport: the wordmark, the
         * expansion where there is room, the edition stamp and the language
         * switch.
         */}
        <div className="flex items-center justify-between gap-x-4 pt-2.5 pb-1.5 md:pt-4 md:pb-2">
          <LocaleLink
            lang={lang}
            href="/"
            aria-label={dict.chrome.homeLabel}
            className="flex min-h-[44px] items-center gap-3 text-[var(--color-ink)] no-underline"
          >
            <span className="mica-display text-[21px] tracking-[-0.02em] md:text-[24px]">
              MICA
            </span>
            <span className="hidden font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-[var(--color-ink-faint)] sm:inline">
              {dict.site.longName}
            </span>
          </LocaleLink>
          <div className="flex shrink-0 items-center gap-4">
            <p className="mica-eyebrow text-right">{dict.site.edition}</p>
            <LocaleSwitchLive lang={lang} />
          </div>
        </div>
        <nav
          aria-label={dict.chrome.primaryNavLabel}
          className="border-t border-[var(--color-rule)]"
        >
          <NavLinks lang={lang} />
        </nav>
      </div>
    </header>
  );
}

/**
 * The single global status bar. Every page carries both mandated strings above
 * the fold whether or not it renders a score surface, plus the two shortest
 * routes to check the claim: the method, and the raw fixture.
 */
export function DemoStatusBar({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <aside className="mica-statusbar" aria-label={dict.chrome.dataStatusLabel}>
      <div className="mica-shell">
        <p className="mica-statusbar-inner">
          <span
            lang="en"
            className="font-semibold uppercase tracking-[0.08em] text-[var(--color-vermilion)]"
          >
            {dict.disclosure.demoLabel}
          </span>
          <span aria-hidden="true" className="text-[var(--color-rule-strong)]">
            /
          </span>
          <span lang="en" className="uppercase tracking-[0.08em]">
            {dict.disclosure.notRanking}
          </span>
          {lang === DEFAULT_LOCALE ? null : (
            <span lang={lang} className="text-[var(--color-ink-soft)]">
              {dict.disclosure.demoLabelLocal} / {dict.disclosure.notRankingLocal}
            </span>
          )}
          <span className="ml-auto flex gap-4">
            <LocaleLink lang={lang} href="/methodology" className="mica-link">
              {dict.chrome.method}
            </LocaleLink>
            <a href="/data/demo/mica-demo.json" className="mica-link" download>
              {dict.chrome.jsonData}
            </a>
          </span>
        </p>
      </div>
    </aside>
  );
}

export function Colophon({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <footer className="mt-20 border-t border-[var(--color-rule-strong)] py-10">
      <div className="mica-shell">
        <div className="mica-grid">
          <div className="md:col-span-5">
            <p className="mica-display text-[20px]">{dict.site.longName}</p>
            <p className="mt-2 max-w-[42ch] text-[13.5px] text-[var(--color-ink-soft)]">
              {dict.site.tagline} {dict.site.secondary}
            </p>
            <p className="mt-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
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
        <p className="max-w-[80ch] font-[family-name:var(--font-mono)] text-[11px] uppercase leading-relaxed tracking-[0.1em] text-[var(--color-ink-faint)]">
          <DemoWords lang={lang} /> · {dict.chrome.colophonNote}
        </p>
      </div>
    </footer>
  );
}
