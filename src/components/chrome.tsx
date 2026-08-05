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
    <header className="border-b border-[var(--color-rule-strong)] bg-[var(--color-paper)]">
      <div className="mica-shell">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-5 pb-3">
          <Link
            href="/"
            className="mica-display text-[26px] tracking-tight text-[var(--color-ink)] no-underline"
          >
            MICA
            <span className="ml-3 hidden align-middle font-[family-name:var(--font-mono)] text-[10.5px] font-normal uppercase tracking-[0.16em] text-[var(--color-ink-faint)] sm:inline">
              {SITE.longName}
            </span>
          </Link>
          <p className="mica-eyebrow">{SITE.edition} · Demo build</p>
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
