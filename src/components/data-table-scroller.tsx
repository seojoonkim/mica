import type { ReactNode } from "react";

/**
 * The shared wrapper for every wide data table on the site.
 *
 * A table that scrolls sideways is unreachable by keyboard unless the scroll
 * container is itself focusable, so this is a `region` with `tabindex=0` and an
 * accessible name — normally the same words as the table caption. The cue is
 * `aria-hidden` because the region name already announces the table; it exists
 * for sighted narrow-viewport readers who cannot otherwise tell there is more
 * to the right. Sticky row headers and header row live in CSS.
 */
export function DataTableScroller({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mica-scroll ${className}`.trim()}>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="mica-scroll-viewport"
      >
        {children}
      </div>
      <p className="mica-scroll-cue" aria-hidden="true">
        Scroll horizontally for all columns →
      </p>
    </div>
  );
}
