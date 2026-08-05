import { countrySchema, type Country } from "@/lib/schema";
import { z } from "zod";

/**
 * Canonical country records. Country pages are the first vertical slice and the
 * source of truth for the Home summaries — nothing here is restated elsewhere.
 */
const raw: unknown[] = [
  {
    code: "kr",
    name: "South Korea",
    nativeName: "대한민국",
    locale: "ko-KR",
    currency: "KRW",
    currencySymbol: "₩",
    timezone: "Asia/Seoul",
    editionNote:
      "The densest super-app market in the index. Most consumer journeys begin and end inside one of three platforms, and an agent that cannot operate inside them cannot finish the task at all.",
    hazards: [
      {
        title: "Super-app enclosure",
        detail:
          "Delivery, payment, messaging and identity often live behind a single app shell rather than an addressable web flow. Systems that assume a browsable checkout stall before the confirmation boundary.",
        axis: "tool-api-use",
      },
      {
        title: "Mobile identity verification",
        detail:
          "Many mid-journey steps demand a carrier-bound identity check. The correct agent behaviour is to stop and hand back, not to attempt the check.",
        axis: "safety",
      },
      {
        title: "Address granularity",
        detail:
          "Road-name and lot-number address systems coexist, and building/unit detail is frequently required for a delivery to be accepted.",
        axis: "localization",
      },
      {
        title: "Honorific-sensitive drafting",
        detail:
          "Email and message drafting is judged on register. A grammatically correct draft in the wrong speech level is scored as a localization failure.",
        axis: "localization",
      },
    ],
    whatLocalChanges: [
      "Payment steps route through domestic rails that expect an app-side confirmation, so the confirmation boundary lands earlier than in a card-first market.",
      "Restaurant reservations concentrate in two aggregators; direct-to-venue phone booking is common and is out of scope for the index.",
      "Delivery windows are short and same-day is the default expectation, so recovery from a failed first attempt is time-boxed.",
      "Calendar work spans lunar-calendar public holidays that shift year to year and are a recurring source of date errors.",
    ],
  },
  {
    code: "jp",
    name: "Japan",
    nativeName: "日本",
    locale: "ja-JP",
    currency: "JPY",
    currencySymbol: "¥",
    timezone: "Asia/Tokyo",
    editionNote:
      "The most form-heavy market in the index. Tasks rarely fail on reasoning; they fail on a field that had to be filled a particular way.",
    hazards: [
      {
        title: "Kana name fields",
        detail:
          "Booking and delivery forms commonly require a separate phonetic reading of the customer name. Systems that mirror the kanji into the kana field produce a rejected form.",
        axis: "localization",
      },
      {
        title: "Postal-code driven addressing",
        detail:
          "The postal code auto-populates prefecture and ward; typing them manually as well is a frequent duplicate-field error.",
        axis: "tool-api-use",
      },
      {
        title: "Convenience-store fulfilment",
        detail:
          "A large share of orders complete at a konbini pickup or payment step, which extends the task well past the checkout screen.",
        axis: "orchestration",
      },
      {
        title: "Register and refusal etiquette",
        detail:
          "Declining or rescheduling carries strong conventional phrasing. A blunt but accurate message is scored down on localization.",
        axis: "localization",
      },
    ],
    whatLocalChanges: [
      "Reservation flows frequently need a phone number that receives a confirmation code, moving the confirmation boundary to the user's device.",
      "Seat and room inventory is released on fixed calendar rules, so travel tasks depend on knowing the release date, not on search skill.",
      "Cost per success rises with retries because many forms invalidate the whole submission rather than a single field.",
      "Public holiday clusters compress delivery capacity and change what a reasonable ETA looks like.",
    ],
  },
  {
    code: "sg",
    name: "Singapore",
    nativeName: "Singapore",
    locale: "en-SG",
    currency: "SGD",
    currencySymbol: "S$",
    timezone: "Asia/Singapore",
    editionNote:
      "The most English-legible market in the index, which makes it the cleanest control: differences observed here are mostly orchestration, not language.",
    hazards: [
      {
        title: "Multi-rail payments",
        detail:
          "Card, national QR transfer and stored-value wallets coexist. Choosing a rail the persona does not hold is a common silent failure.",
        axis: "model-routing",
      },
      {
        title: "Block and unit addressing",
        detail:
          "Residential addresses depend on block and unit numbers that many address parsers drop, producing an accepted order that cannot be delivered.",
        axis: "localization",
      },
      {
        title: "Aggregator fee stacking",
        detail:
          "Platform, delivery and small-order fees are added late in the flow, so a price quoted mid-task is routinely wrong at confirmation.",
        axis: "recovery",
      },
      {
        title: "Regional booking spillover",
        detail:
          "Travel tasks frequently cross into neighbouring markets, pulling in a second locale mid-task.",
        axis: "orchestration",
      },
    ],
    whatLocalChanges: [
      "Because language friction is low, the accuracy spread between systems here is almost entirely attributable to orchestration and recovery.",
      "Fee disclosure timing makes 'quote the final price before confirming' a meaningful and frequently failed sub-requirement.",
      "Same-day delivery is dense and cheap, so speed differences compress and cost becomes the discriminating axis.",
      "Reservation no-show policies often require a card hold, which sits outside the agent's authority.",
    ],
  },
  {
    code: "tw",
    name: "Taiwan",
    nativeName: "臺灣",
    locale: "zh-TW",
    currency: "TWD",
    currencySymbol: "NT$",
    timezone: "Asia/Taipei",
    editionNote:
      "A convenience-store logistics market with a strong messaging-app layer. The hardest step is usually the last one, not the first.",
    hazards: [
      {
        title: "Store-to-store pickup selection",
        detail:
          "Orders complete at a chosen convenience-store branch. Picking a branch near the wrong one of the persona's addresses is an accuracy failure that looks like a success.",
        axis: "memory",
      },
      {
        title: "Traditional-character handling",
        detail:
          "Simplified-character output in a traditional-character market is a localization failure even when semantically correct.",
        axis: "localization",
      },
      {
        title: "Messaging-app commerce",
        detail:
          "Restaurant and local-service booking often happens inside a chat channel with no structured endpoint.",
        axis: "tool-api-use",
      },
      {
        title: "Invoice and receipt carriers",
        detail:
          "Checkout expects a digital invoice carrier identifier; omitting it completes the purchase but fails the declared final state.",
        axis: "tool-api-use",
      },
    ],
    whatLocalChanges: [
      "The final state for shopping tasks includes the pickup location and invoice carrier, not just an order confirmation number.",
      "Latency measurements stretch because store-selection steps add a round trip that other markets do not have.",
      "Local-services tasks lean on chat, so a system without a supervised messaging path simply cannot attempt part of the coverage.",
      "Holiday travel demand is concentrated around lunar-calendar dates shared with, but not identical to, other markets in the index.",
    ],
  },
  {
    code: "th",
    name: "Thailand",
    nativeName: "ประเทศไทย",
    locale: "th-TH",
    currency: "THB",
    currencySymbol: "฿",
    timezone: "Asia/Bangkok",
    editionNote:
      "The most script-and-transliteration sensitive market in the index, and the one where address interpretation most often decides the outcome.",
    hazards: [
      {
        title: "Thai script segmentation",
        detail:
          "Thai is written without spaces between words. Systems that tokenise on whitespace mis-segment venue and street names and search for something that does not exist.",
        axis: "localization",
      },
      {
        title: "Transliteration drift",
        detail:
          "The same venue appears under several romanisations. Matching the persona's request to the right listing is a retrieval problem, not a reasoning one.",
        axis: "memory",
      },
      {
        title: "Landmark-relative addresses",
        detail:
          "Delivery addresses are frequently expressed relative to a landmark or soi rather than as a structured address, and require a note field to be usable.",
        axis: "localization",
      },
      {
        title: "QR-first payment",
        detail:
          "Many flows terminate in a scannable transfer the user must complete, which is the correct place for the agent to stop.",
        axis: "safety",
      },
    ],
    whatLocalChanges: [
      "Buddhist-era year formatting appears in booking confirmations and is a recurring date-parsing failure.",
      "The confirmation boundary is early: the agent prepares a payment intent and hands it back rather than completing it.",
      "Address note fields carry information that structured fields cannot, so dropping free text materially lowers delivery success.",
      "Travel tasks frequently mix domestic budget carriers whose inventory is not exposed to aggregate search.",
    ],
  },
];

export const COUNTRIES: readonly Country[] = z
  .array(countrySchema)
  .parse(raw);

export const COUNTRY_BY_CODE: ReadonlyMap<string, Country> = new Map(
  COUNTRIES.map((country) => [country.code, country]),
);

export function getCountry(code: string): Country | undefined {
  return COUNTRY_BY_CODE.get(code);
}
