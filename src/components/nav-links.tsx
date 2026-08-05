"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV } from "@/components/nav-items";

/**
 * The only client component in MICA. It exists solely so the primary nav can
 * collapse behind a disclosure on narrow screens; above 760px CSS shows the
 * list unconditionally and the toggle is hidden, so the same markup serves both.
 */
export function NavLinks() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
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
