import type { Locale } from "@/lib/i18n/config";
import { en, type Dict } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";

export type { Dict } from "@/lib/i18n/en";

const DICTIONARIES: Record<Locale, Dict> = { en, ko };

/**
 * The only way a page reads copy. There is no runtime fallback to English: the
 * `satisfies Dict` declaration on `ko` makes a missing key a typecheck failure
 * instead, so a half-translated build never ships.
 */
export function getDict(lang: Locale): Dict {
  return DICTIONARIES[lang];
}
