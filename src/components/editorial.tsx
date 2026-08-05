import type { ReactNode } from "react";
import { DemoWords } from "@/components/chrome";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/**
 * Shared editorial primitives. The demo disclosure lives here so that every
 * score surface carries the same two English strings, spelled identically, with
 * the Korean restatement beside them rather than instead of them.
 */

/**
 * The mandatory disclosure. It appears on every surface that shows a score, and
 * always carries both `Illustrative demo data` and `Not an official ranking` as
 * visible text, in every locale.
 */
export function DemoDisclosure({
  lang,
  detail,
}: {
  lang: Locale;
  detail?: string;
}) {
  const dict = getDict(lang);
  return (
    <aside
      className="mica-notice"
      aria-label={dict.disclosure.detailLabel}
      data-testid="demo-disclosure"
    >
      {/* Quieter than it was: the global status bar now carries the alarm. */}
      <p className="font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[0.08em] text-[var(--color-ink-faint)]">
        <DemoWords lang={lang} />
      </p>
      <p className="mt-1.5 max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
        {detail ?? dict.disclosure.defaultDetail}
      </p>
    </aside>
  );
}

/** Compact inline restatement, for use directly above a table. */
export function DemoStamp({
  lang,
  className = "",
}: {
  lang: Locale;
  className?: string;
}) {
  const dict = getDict(lang);
  return (
    <p className={`flex flex-wrap gap-2 ${className}`}>
      <span className="mica-stamp" lang="en">
        {dict.disclosure.demoLabel}
      </span>
      <span className="mica-stamp mica-stamp-quiet" lang="en">
        {dict.disclosure.notRanking}
      </span>
      {lang === "en" ? null : (
        <>
          <span className="mica-stamp mica-stamp-quiet" lang={lang}>
            {dict.disclosure.demoLabelLocal}
          </span>
          <span className="mica-stamp mica-stamp-quiet" lang={lang}>
            {dict.disclosure.notRankingLocal}
          </span>
        </>
      )}
    </p>
  );
}

export function PageHeader({
  lang,
  eyebrow,
  title,
  standfirst,
  children,
}: {
  lang: Locale;
  eyebrow: string;
  title: string;
  standfirst: string;
  children?: ReactNode;
}) {
  const dict = getDict(lang);
  return (
    <div className="border-b border-[var(--color-rule-strong)] pb-7">
      <div className="mica-grid pt-8 md:pt-10">
        <div className="md:col-span-8">
          <p className="mica-eyebrow">{eyebrow}</p>
          <h1 className="mica-display mica-h1 mt-2.5">{title}</h1>
          <p className="mica-lead mt-4 max-w-[62ch]">{standfirst}</p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <span className="mica-ticks" aria-hidden="true" />
          <p className="mica-eyebrow mt-3">{dict.site.edition}</p>
          <p className="mt-2 text-[13.5px] text-[var(--color-ink-faint)]">
            {dict.common.editionSummary}
          </p>
        </div>
      </div>
      {children ? <div className="mt-7">{children}</div> : null}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-12">
      <span className="mica-ticks" aria-hidden="true" />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="mica-display mica-h2">{title}</h2>
        {eyebrow ? <p className="mica-eyebrow">{eyebrow}</p> : null}
      </div>
      {intro ? (
        <p className="mt-3 max-w-[70ch] text-[15.5px] text-[var(--color-ink-soft)]">
          {intro}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * Anchor navigation over the `Section` ids already on a page. Plain links and
 * CSS `scroll-margin-top` do the work; there is no scroll spy, so there is no
 * client component and no focus that moves without the reader asking.
 */
export function OnThisPage({
  lang,
  items,
}: {
  lang: Locale;
  items: readonly { id: string; label: string }[];
}) {
  return (
    <nav aria-labelledby="on-this-page" className="mt-6">
      <p className="mica-eyebrow" id="on-this-page">
        {getDict(lang).common.onThisPage}
      </p>
      <ul className="mica-toc mt-2">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A definition row used for dense reference lists. */
export function DataList({
  items,
}: {
  items: readonly { term: string; detail: ReactNode }[];
}) {
  return (
    <dl className="m-0 border-t border-[var(--color-rule)]">
      {items.map((item) => (
        <div
          key={item.term}
          className="grid gap-1 border-b border-[var(--color-rule)] py-3.5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8"
        >
          <dt className="mica-eyebrow pt-1 text-[var(--color-ink)]">
            {item.term}
          </dt>
          <dd className="m-0 max-w-[70ch] text-[15px] text-[var(--color-ink-soft)]">
            {item.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}
