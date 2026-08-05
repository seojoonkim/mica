/** The single source of truth for MICA's primary navigation. */
export const NAV = [
  { href: "/countries", label: "Countries" },
  { href: "/rankings", label: "Rankings" },
  { href: "/agents", label: "Systems" },
  { href: "/tasks", label: "Tasks" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about/governance", label: "Governance" },
  { href: "/submit", label: "Submit" },
] as const;

export const DOWNLOADS = [
  { href: "/data/demo/mica-demo.json", label: "Demo dataset (JSON)" },
  { href: "/data/demo/mica-demo.csv", label: "Demo run cells (CSV)" },
] as const;
