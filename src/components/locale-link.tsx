import Link from "next/link";
import type { ComponentProps } from "react";
import { localeHref, type Locale } from "@/lib/i18n/config";

/**
 * The one way MICA writes an internal link.
 *
 * `href` is always the logical path — `/rankings`, `/countries/kr` — and the
 * locale segment is added here. Nothing in the app hand-writes `/ko/...`, so a
 * page cannot half-escape the reader's language, and moving the site under a
 * locale segment did not scatter string concatenation through every file.
 */
export function LocaleLink({
  lang,
  href,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & {
  lang: Locale;
  href: string;
}) {
  return <Link href={localeHref(lang, href)} {...rest} />;
}
