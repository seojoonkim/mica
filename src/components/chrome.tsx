import Link from "next/link";
import { SITE, DEMO_LABEL, NOT_A_RANKING } from "@/lib/site";
import { NAV, DOWNLOADS } from "@/components/nav-items";
import { NavLinks } from "@/components/nav-links";

export function SkipLink() {
  return (
    <a href="#main" className="mica-skip">
      Skip to main content
    </a>
  );
}

export function Masthead() {
  return (
    <header className="border-b border-[var(--color-rule-strong)] bg-[var(--color-surface)]">
      <div className="mica-shell">
        {/*
         * One horizontal identity line on every viewport: the wordmark, the
         * expansion where there is room, and the edition stamp. It costs about
         * 44px of height on a phone instead of the old stacked block.
         */}
        <div className="flex items-center justify-between gap-x-4 pt-2.5 pb-1.5 md:pt-4 md:pb-2">
          <Link
            href="/"
            className="flex min-h-[44px] items-center gap-3 text-[var(--color-ink)] no-underline"
          >
            <span className="mica-display text-[21px] tracking-[-0.02em] md:text-[24px]">
              MICA
            </span>
            <span className="hidden font-[family-name:var(--font-mono)] text-[12px] font-normal uppercase tracking-[0.1em] text-[var(--color-ink-faint)] sm:inline">
              {SITE.longName}
            </span>
          </Link>
          <p className="mica-eyebrow shrink-0 text-right">{SITE.edition}</p>
        </div>
        <nav
          aria-label="Primary"
          className="border-t border-[var(--color-rule)]"
        >
          <NavLinks />
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
export function DemoStatusBar() {
  return (
    <aside className="mica-statusbar" aria-label="Data status">
      <div className="mica-shell">
        <p className="mica-statusbar-inner">
          <span className="font-semibold uppercase tracking-[0.08em] text-[var(--color-vermilion)]">
            {DEMO_LABEL}
          </span>
          <span aria-hidden="true" className="text-[var(--color-rule-strong)]">
            /
          </span>
          <span className="uppercase tracking-[0.08em]">{NOT_A_RANKING}</span>
          <span className="ml-auto flex gap-4">
            <Link href="/methodology" className="mica-link">
              Method
            </Link>
            <a href="/data/demo/mica-demo.json" className="mica-link" download>
              JSON data
            </a>
          </span>
        </p>
      </div>
    </aside>
  );
}

export function Colophon() {
  return (
    <footer className="mt-20 border-t border-[var(--color-rule-strong)] py-10">
      <div className="mica-shell">
        <div className="mica-grid">
          <div className="md:col-span-5">
            <p className="mica-display text-[20px]">{SITE.longName}</p>
            <p className="mt-2 max-w-[42ch] text-[13.5px] text-[var(--color-ink-soft)]">
              {SITE.tagline} {SITE.secondary}
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-7">
            <p className="mica-eyebrow">Index</p>
            <ul className="mt-2 list-none space-y-1 p-0 text-[13.5px]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="mica-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="mica-eyebrow">Downloads</p>
            <ul className="mt-2 list-none space-y-1 p-0 text-[13.5px]">
              {DOWNLOADS.map((item) => (
                <li key={item.href}>
                  <a className="mica-link" href={item.href} download>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="mica-rule my-6" />
        <p className="max-w-[80ch] font-[family-name:var(--font-mono)] text-[11px] uppercase leading-relaxed tracking-[0.1em] text-[var(--color-ink-faint)]">
          {DEMO_LABEL} · {NOT_A_RANKING} · publicationEligible: false ·
          Synthetic personas and controlled test accounts only
        </p>
      </div>
    </footer>
  );
}
