import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { COUNTRIES } from "@/data/demo/countries";
import { LOCALES, localeHref } from "@/lib/i18n/config";

const STATIC_PATHS = [
  "/",
  "/countries",
  "/rankings",
  "/agents",
  "/tasks",
  "/evidence",
  "/methodology",
  "/about/governance",
  "/submit",
] as const;

/**
 * Market pages are derived from the canonical fixtures, so a new market appears
 * in the sitemap without a second edit here. System and run-cell detail pages
 * are not listed: the registries are empty, and a sitemap is the last place a
 * benchmark should advertise a page that resolves to a 404.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...COUNTRIES.map((country) => `/countries/${country.code}`),
  ];

  // English is canonical at the unprefixed path; Korean uses /ko. Each logical
  // path appears once per locale with explicit alternates so crawlers never
  // need to infer language from content.
  return LOCALES.flatMap((lang) =>
    paths.map((path) => ({
      url: `${SITE.url}${localeHref(lang, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [other, `${SITE.url}${localeHref(other, path)}`]),
        ),
      },
    })),
  );
}
