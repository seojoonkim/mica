export const SITE = {
  name: "MICA",
  longName: "Multinational Index of Consumer Agents",
  tagline: "The global benchmark for consumer agent orchestration.",
  secondary: "Models matter. Orchestration wins.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://mica-eta.vercel.app",
  edition: "Preview edition 0.1",
  definition:
    "MICA measures complete, versioned consumer-agent systems on everyday tasks in six markets across Asia and the Middle East, reporting accuracy, speed and cost as three separate results.",
  demoNotice:
    "Illustrative demo data — not an official ranking. Every figure on this site is generated for interface development and carries no evidentiary weight.",
} as const;

export const DEMO_LABEL = "Illustrative demo data";
export const NOT_A_RANKING = "Not an official ranking";
