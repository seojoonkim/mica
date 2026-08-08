import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/** Shared editorial primitives. */

/**
 * The three outcome axes each carry one fixed glyph as well as one fixed hue,
 * so the axis identity survives greyscale, colour blindness and a printout.
 * The glyph is decorative: the axis is always named in text beside it.
 */
export const AXIS_GLYPH = {
  accuracy: "●",
  speed: "▲",
  cost: "■",
} as const;

export function AxisGlyph({ axis }: { axis: keyof typeof AXIS_GLYPH }) {
  return (
    <span className="mica-axis-glyph" aria-hidden="true">
      {AXIS_GLYPH[axis]}
    </span>
  );
}

/** A visible cue for register rows that open another page or filtered view. */
export function DetailCue() {
  return (
    <span className="mica-detail-cue" data-detail-cue aria-hidden="true">
      <span>→</span>
    </span>
  );
}

/** Factual data-status detail for surfaces that can show scores. */
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
      className="mica-invert"
      aria-label={dict.disclosure.detailLabel}
      data-testid="demo-disclosure"
    >
      <p className="mica-eyebrow mb-2 text-[var(--color-bone)]">
        {dict.disclosure.previewLabel}
      </p>
      <p className="mica-body-sm m-0 text-[var(--color-bone)]">
        {detail ?? dict.disclosure.defaultDetail}
      </p>
    </aside>
  );
}

/**
 * The publication status. Definition surfaces — home, tasks, methodology,
 * submit — carry no score figure, so the mandatory demo disclosure does not
 * belong on them. What they carry instead is one sentence, read from that
 * page's own dictionary, stating where the page stands and that no verified
 * result is published. It deliberately restates none of the mandated
 * disclosure wording: it is a status note, not a disclaimer.
 */
export function PublicationStatus({ text }: { text: string }) {
  return (
    <aside className="mica-notice mica-notice-empty" data-testid="publication-status">
      <p className="mica-body-sm m-0">{text}</p>
    </aside>
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
    <div className="border-b border-[var(--color-ink)] pb-8">
      <div className="mica-grid pt-7 md:pt-9">
        <div className="md:col-span-8">
          <p className="mica-eyebrow">{eyebrow}</p>
          <h1 className="mica-display mica-h1 mt-3">{title}</h1>
          <p className="mica-lead mt-5 max-w-[58ch]">{standfirst}</p>
        </div>
        <div className="md:col-span-3 md:col-start-10">
          <span className="mica-ticks" aria-hidden="true" />
          <p className="mica-eyebrow mt-3">{dict.site.edition}</p>
          <p className="mica-micro mt-2">
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
  number,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  /**
   * An explicit, visible section number such as `3` or `3.2`. When it is
   * passed the numbering becomes semantic: the string is rendered inside the
   * `h2` itself, so a screen reader announces it exactly once as part of the
   * heading, and the decorative CSS counter is suppressed for this section.
   * When it is omitted the section keeps the old decorative counter, so every
   * non-methodology caller is untouched.
   */
  number?: string;
  children: ReactNode;
}) {
  const numbered = typeof number === "string" && number.length > 0;
  return (
    <section
      id={id}
      className={`mica-section${numbered ? " mica-section-explicit" : ""}`}
      data-editorial-section
      data-section-number={numbered ? number : undefined}
    >
      {/*
       * Without an explicit number the section numeral is a CSS counter on an
       * aria-hidden span, so the editorial rhythm costs the document outline
       * nothing. With one, the numeral moves into the heading and becomes part
       * of the accessible name — announced once, and identical to the string
       * the table of contents shows.
       */}
      <div className="mica-section-head" data-section-header>
        {numbered ? null : <p className="mica-section-num m-0" aria-hidden="true" />}
        <div className="mica-section-copy min-w-0">
          {eyebrow ? <p className="mica-eyebrow">{eyebrow}</p> : null}
          <h2 className="mica-display mica-h2 mt-2">
            {numbered ? (
              <span className="mica-section-num-inline" data-section-heading-number>
                {number}
              </span>
            ) : null}
            {numbered ? " " : null}
            {title}
          </h2>
          {intro ? (
            <p className="mica-body mt-3">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mica-section-body" data-section-body>{children}</div>
    </section>
  );
}

export type TocItem = {
  id: string;
  label: string;
  /** The visible number, identical to the one the section heading carries. */
  number?: string;
  children?: readonly TocItem[];
};

function TocLink({ item, depth }: { item: TocItem; depth: number }) {
  return (
    <a href={`#${item.id}`} data-toc-link={item.id} data-toc-depth={depth}>
      {item.number ? (
        <span className="mica-toc-num" data-toc-number>
          {item.number}
        </span>
      ) : null}
      <span className="mica-toc-label">{item.label}</span>
    </a>
  );
}

/**
 * Anchor navigation over the `Section` ids already on a page. Plain links and
 * CSS `scroll-margin-top` do the work; there is no scroll spy, so there is no
 * client component and no focus that moves without the reader asking.
 *
 * Items carrying a `number` render as a real ordered list, chapters outside and
 * subsections nested inside, so the contents page has the same shape as the
 * document. Items without one keep the older unnumbered inline list.
 */
export function OnThisPage({
  lang,
  items,
}: {
  lang: Locale;
  items: readonly TocItem[];
}) {
  const numbered = items.some((item) => item.number || item.children?.length);
  return (
    <nav aria-labelledby="on-this-page" className="mt-6">
      <p className="mica-eyebrow" id="on-this-page">
        {getDict(lang).common.onThisPage}
      </p>
      {numbered ? (
        <ol className="mica-method-toc mt-3" data-toc-level="chapter">
          {items.map((item) => (
            <li key={item.id}>
              <TocLink item={item} depth={1} />
              {item.children?.length ? (
                <ol className="mica-method-toc-sub" data-toc-level="subsection">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <TocLink item={child} depth={2} />
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mica-toc mt-2">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      )}
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
          <dd className="mica-body m-0">
            {item.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
}
