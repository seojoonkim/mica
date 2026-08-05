"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/components/nav-items";

/**
 * A route is current when it is the nav href itself or a detail page beneath
 * it, so `/agents/hangang-assistant` lights `Systems`. The boundary check keeps
 * `/tasks-archive` from matching `/tasks`.
 */
function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The only client component in MICA. It exists so the primary nav can collapse
 * behind a disclosure on narrow screens; at 48rem CSS shows the list
 * unconditionally and hides the toggle, so the same markup serves both.
 */
export function NavLinks() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const toggleRef = useRef<HTMLButtonElement>(null);

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
        {open ? "Close menu" : "Menu"}
      </button>
      <ul
        id="mica-primary-nav"
        className={open ? "mica-nav-list is-open" : "mica-nav-list"}
      >
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="mica-navlink"
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
