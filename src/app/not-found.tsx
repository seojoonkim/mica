import Link from "next/link";
import type { Metadata } from "next";
import { NAV } from "@/components/nav-items";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mica-grid py-20">
      <div className="md:col-span-8">
        <p className="mica-eyebrow">Error 404</p>
        <h1 className="mica-display mt-3 text-[42px]">
          No such page in this edition.
        </h1>
        <p className="mt-4 max-w-[60ch] text-[16px] text-[var(--color-ink-soft)]">
          MICA covers five markets — Korea, Japan, Singapore, Taiwan and
          Thailand — and a fixed set of system snapshots. Anything outside that
          list has no page, rather than an empty one.
        </p>
        <ul className="mt-6 flex list-none flex-wrap gap-x-6 p-0">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="mica-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
