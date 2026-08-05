import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Colophon, DemoStatusBar, Masthead, SkipLink } from "@/components/chrome";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.longName}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.definition,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.longName}`,
    description: SITE.definition,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.longName}`,
    description: SITE.definition,
  },
  // This is a demo preview: it is reachable and canonical at the live URL, but
  // must not be indexed or have its links followed as if it were the index.
  robots: { index: false, follow: false },
  other: {
    "mica:data-status": "demo",
    "mica:disclosure": "Illustrative demo data — not an official ranking",
    "mica:indexing": "noindex, nofollow — demo preview",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Masthead />
        <DemoStatusBar />
        <main id="main" tabIndex={-1} className="mica-shell">
          {children}
        </main>
        <Colophon />
      </body>
    </html>
  );
}
