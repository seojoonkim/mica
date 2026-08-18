import type { Dict } from "@/lib/i18n/dictionary";

/**
 * The complete route index used by the footer and fallback navigation.
 *
 * `href` is the logical path, without a locale segment: `LocaleLink` adds the
 * prefix. `key` names the dictionary entry, so a label is never written twice.
 */
export const NAV = [
  { href: "/countries", key: "countries" },
  { href: "/evaluate", key: "evaluate" },
  { href: "/rankings", key: "rankings" },
  { href: "/agents", key: "agents" },
  { href: "/tasks", key: "tasks" },
  { href: "/evidence", key: "evidence" },
  { href: "/methodology", key: "methodology" },
  { href: "/about/governance", key: "governance" },
  { href: "/submit", key: "submit" },
] as const satisfies readonly { href: string; key: keyof Dict["nav"] }[];

/** The five recurring reader journeys shown in the global header. */
export const PRIMARY_NAV = [
  { href: "/evaluate", key: "evaluate" },
  { href: "/rankings", key: "rankings" },
  { href: "/tasks", key: "tasks" },
  { href: "/methodology", key: "methodology" },
  { href: "/evidence", key: "evidence" },
  { href: "/submit", key: "submit" },
] as const satisfies readonly { href: string; key: keyof Dict["nav"] }[];

/** Downloads are static assets outside the locale tree, so they keep raw hrefs. */
export const DOWNLOADS = [
  { href: "/data/demo/mica-demo.json", key: "demoDatasetJson" },
  { href: "/data/demo/mica-demo.csv", key: "demoRunCellsCsv" },
] as const satisfies readonly { href: string; key: keyof Dict["chrome"] }[];
