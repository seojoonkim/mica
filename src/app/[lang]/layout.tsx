import type { Metadata } from "next";
import "../globals.css";
import { SITE } from "@/lib/site";
import { Colophon, Masthead, SkipLink } from "@/components/chrome";
import { HTML_LANG, localeAlternates, localeHref } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, localeStaticParams, type LangParams } from "@/lib/i18n/route";

export function generateStaticParams() {
  return localeStaticParams();
}

/**
 * Metadata is per-locale because the description is copy, not data. Everything
 * that makes this a preview rather than an index — the noindex/nofollow pair
 * and the `mica:*` disclosure trio — is identical in both languages, and the
 * hreflang set names both locales plus an English x-default.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  const title = `${SITE.name} — ${dict.site.longName}`;

  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s — ${SITE.name}` },
    description: dict.site.definition,
    applicationName: SITE.name,
    alternates: localeAlternates(lang, "/"),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: `${SITE.url}${localeHref(lang, "/")}`,
      title,
      description: dict.site.definition,
      locale: HTML_LANG[lang],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.site.definition,
    },
    // This is a demo preview: it is reachable and canonical at the live URL, but
    // must not be indexed or have its links followed as if it were the index.
    robots: { index: false, follow: false },
    other: {
      "mica:data-status": "demo",
      "mica:indexing": "noindex, nofollow — demo preview",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<LangParams> }>) {
  const lang = await readLocale(params);
  return (
    <html lang={HTML_LANG[lang]}>
      <body>
        <SkipLink lang={lang} />
        <Masthead lang={lang} />
        <main id="main" tabIndex={-1} className="mica-shell">
          {children}
        </main>
        <Colophon lang={lang} />
      </body>
    </html>
  );
}
