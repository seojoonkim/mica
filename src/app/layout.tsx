import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { Colophon, Masthead, SkipLink } from "@/components/chrome";

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
    card: "summary",
    title: `${SITE.name} — ${SITE.longName}`,
    description: SITE.definition,
  },
  robots: { index: true, follow: true },
  other: {
    "mica:data-status": "demo",
    "mica:disclosure": "Illustrative demo data — not an official ranking",
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
        <main id="main" tabIndex={-1} className="mica-shell">
          {children}
        </main>
        <Colophon />
      </body>
    </html>
  );
}
