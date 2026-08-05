"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/nav-items";
import { localeHref, splitLocale, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/**
 * A route is current when it is the nav href itself or a detail page beneath
 * it, so `/agents/hangang-assistant` lights `Systems`. The boundary check keeps
 * `/tasks-archive` from matching `/tasks`. The comparison is made on the
 * logical path with the locale segment removed, so the active state is the same
 * in both languages.
 */
function isCurrent(pathname: string, href: string) {
  const { path } = splitLocale(pathname);
  return path === href || path.startsWith(`${href}/`);
}

/**
 * The primary nav. It is a client component so the list can collapse behind a
 * disclosure on narrow screens; at 48rem CSS shows the list unconditionally and
 * hides the toggle, so the same markup serves both.
 */
export function NavLinks({ lang }: { lang: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dict = getDict(lang);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Escape must not strand focus inside a list that just disappeared.
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="mica-nav-toggle"
        aria-expanded={open}
        aria-controls="mica-primary-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? dict.chrome.closeMenu : dict.chrome.menu}
      </button>
      <ul
        id="mica-primary-nav"
        className={open ? "mica-nav-list is-open" : "mica-nav-list"}
      >
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={localeHref(lang, item.href)}
              className="mica-navlink"
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {dict.nav[item.key]}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
