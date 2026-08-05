import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";

const STATIC_PATHS = [
  "/",
  "/countries",
  "/rankings",
  "/agents",
  "/tasks",
  "/methodology",
  "/about/governance",
  "/submit",
] as const;

/**
 * Country and system entries are derived from the canonical fixtures, so a new
 * market or snapshot appears in the sitemap without a second edit here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...COUNTRIES.map((country) => `/countries/${country.code}`),
    ...SYSTEMS.map((system) => `/agents/${system.slug}`),
  ];

  return paths.map((path) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
