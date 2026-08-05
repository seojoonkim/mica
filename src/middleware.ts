import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  localeHref,
  pickLocale,
  splitLocale,
} from "@/lib/i18n/config";

/**
 * Every page lives under a locale segment, so a request without one is sent to
 * the reader's language: the explicit cookie choice first, then Accept-Language,
 * then English. `splitLocale` returns a null `lang` only for a path that carries
 * no locale at all, which is why this redirect cannot loop.
 *
 * The query string is carried across so a shared filtered URL survives the hop.
 */
export function middleware(request: NextRequest) {
  const { lang } = splitLocale(request.nextUrl.pathname);
  if (lang) return NextResponse.next();

  const chosen = pickLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language") ?? undefined,
  );

  const url = request.nextUrl.clone();
  url.pathname = localeHref(chosen, request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Static assets, the metadata routes and anything with a file extension are
  // not pages and must not gain a locale segment.
  matcher: ["/((?!_next|api|data|favicon|icon|opengraph-image|robots.txt|sitemap.xml|.*\\.).*)"],
};
