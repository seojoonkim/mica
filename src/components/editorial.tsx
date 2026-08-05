import type { ReactNode } from "react";
import { DEMO_LABEL, NOT_A_RANKING, SITE } from "@/lib/site";

/**
 * Shared editorial primitives. The demo disclosure lives here so that every
 * score surface carries the same two strings, spelled identically.
 */

/**
 * The mandatory disclosure. It appears on every surface that shows a score,
 * and always carries both `Illustrative demo data` and `Not an official
 * ranking` as visible text.
 */
export function DemoDisclosure({ detail }: { detail?: string }) {
  return (
    <aside
      className="mica-notice"
      aria-label="Data status"
      data-testid="demo-disclosure"
    >
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--color-vermilion)]">
        {DEMO_LABEL} · {NOT_A_RANKING}
      </p>
      <p className="mt-1.5 max-w-[76ch] text-[13px] text-[var(--color-ink-soft)]">
        {detail ??
          "Every figure below is generated for interface development. It carries no evidentiary weight and no system on this page has been ranked by MICA."}
      </p>
    </aside>
  );
}

/** Compact inline restatement, for use directly above a table. */
export function DemoStamp({ className = "" }: { className?: string }) {
  return (
    <p className={`flex flex-wrap gap-2 ${className}`}>
      <span className="mica-stamp">{DEMO_LABEL}</span>
      <span className="mica-stamp mica-stamp-quiet">{NOT_A_RANKING}</span>
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-rule-strong)] pb-8">
      <div className="mica-grid pt-10">
        <div className="md:col-span-8">
          <p className="mica-eyebrow">{eyebrow}</p>
          <h1 className="mica-display mt-3 text-[38px] sm:text-[52px]">
            {title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
            {standfirst}
          </p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <span className="mica-ticks" aria-hidden="true" />
          <p className="mica-eyebrow mt-3">{SITE.edition}</p>
          <p className="mt-2 text-[13px] text-[var(--color-ink-faint)]">
            Five markets · four task families · three separate outcome axes.
          </p>
        </div>
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
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
    <section id={id} className="mt-14">
      <span className="mica-ticks" aria-hidden="true" />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="mica-display text-[26px] sm:text-[30px]">{title}</h2>
        {eyebrow ? <p className="mica-eyebrow">{eyebrow}</p> : null}
      </div>
      {intro ? (
        <p className="mt-3 max-w-[70ch] text-[15px] text-[var(--color-ink-soft)]">
          {intro}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
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
          className="grid gap-1 border-b border-[var(--color-rule)] py-3 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6"
        >
          <dt className="mica-eyebrow pt-0.5">{item.term}</dt>
          <dd className="m-0 max-w-[70ch] text-[14.5px] text-[var(--color-ink-soft)]">
            {item.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}
