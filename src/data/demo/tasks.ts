import {
  taskFamilyRecordSchema,
  heroMissionSchema,
  type TaskFamilyRecord,
  type HeroMission,
  type TaskFamilyId,
} from "@/lib/schema";
import { z } from "zod";

const ALL = ["kr", "jp", "sg", "tw", "th"] as const;

const rawFamilies: unknown[] = [
  {
    id: "email-calendar",
    label: "Email & Calendar",
    summary:
      "Multi-party scheduling, drafting in the local register, and keeping a commitment consistent across a mailbox and a calendar.",
    whyItIsHard:
      "The reasoning is easy and the bookkeeping is not. Failures cluster in timezone handling, local holiday calendars, and replies whose politeness level does not match the relationship.",
    canonicalTasks: [
      {
        id: "ec-reschedule-three-party",
        title: "Reschedule a three-party meeting across two timezones",
        finalState:
          "A single calendar event exists at a slot all three parties can attend, and each has received a reply in the appropriate register.",
        confirmationBoundary:
          "Draft replies are prepared; the agent sends only after explicit user approval.",
        markets: ALL,
      },
      {
        id: "ec-holiday-aware-booking",
        title: "Book a recurring slot that avoids local public holidays",
        finalState:
          "A recurring event exists with local public holidays excluded and the exclusions stated back to the user.",
        confirmationBoundary:
          "The agent may write to the user's own calendar; it may not email external parties without approval.",
        markets: ALL,
      },
      {
        id: "ec-inbox-commitment-audit",
        title: "Extract outstanding commitments from a mailbox thread set",
        finalState:
          "A list of commitments with owner, deadline and source message, with no invented items.",
        confirmationBoundary: "Read-only. No message may be sent or archived.",
        markets: ALL,
      },
    ],
  },
  {
    id: "shopping-delivery",
    label: "Shopping & Delivery",
    summary:
      "Finding a specific item under constraints, getting it to a real local address, and stopping cleanly at payment.",
    whyItIsHard:
      "Address formats, late-added fees, and market-specific fulfilment steps such as convenience-store pickup mean the task continues well past the checkout button.",
    canonicalTasks: [
      {
        id: "sd-constrained-basket",
        title: "Assemble a basket under a budget with a substitution rule",
        finalState:
          "A cart matching every constraint, with substitutions named and the final price including all fees quoted back.",
        confirmationBoundary:
          "The cart is prepared and priced; payment is left to the user.",
        markets: ALL,
      },
      {
        id: "sd-local-address-delivery",
        title: "Set up delivery to a market-correct local address",
        finalState:
          "A delivery destination the local carrier will accept, including unit, note or pickup-branch detail as the market requires.",
        confirmationBoundary: "No order is placed; the prepared order is shown.",
        markets: ALL,
      },
      {
        id: "sd-failed-order-recovery",
        title: "Recover an order rejected at the fulfilment step",
        finalState:
          "Either a corrected prepared order, or an honest stop naming the blocking condition and leaving no partial state.",
        confirmationBoundary:
          "The agent may retry preparation; it may not re-attempt payment.",
        markets: ALL,
      },
    ],
  },
  {
    id: "travel-accommodation",
    label: "Travel Planning & Accommodation",
    summary:
      "Multi-leg itineraries and stays that satisfy hard constraints and survive contact with local inventory rules.",
    whyItIsHard:
      "Inventory is released on local calendar rules, budget carriers sit outside aggregate search, and a plausible itinerary that cannot actually be booked is the most common failure.",
    canonicalTasks: [
      {
        id: "ta-two-leg-itinerary",
        title: "Build a two-leg itinerary within a date and budget window",
        finalState:
          "Specific bookable options for each leg with real prices and a stated total, plus the constraint each option satisfies.",
        confirmationBoundary:
          "Options are held or quoted; no ticket is purchased.",
        markets: ALL,
      },
      {
        id: "ta-accessible-stay",
        title: "Find a stay meeting a stated accessibility requirement",
        finalState:
          "A property whose listing evidences the requirement, with the evidence quoted, not inferred.",
        confirmationBoundary: "No booking is confirmed.",
        markets: ALL,
      },
      {
        id: "ta-disruption-replan",
        title: "Replan around a cancelled leg",
        finalState:
          "A revised plan preserving the original constraints, or a clear statement of which constraint must give.",
        confirmationBoundary: "No change fee may be incurred.",
        markets: ALL,
      },
    ],
  },
  {
    id: "restaurants-local",
    label: "Dining & Reservations",
    summary:
      "Reservations and local bookings that depend on aggregator coverage, chat channels, and knowing when to hand back.",
    whyItIsHard:
      "Coverage is uneven and much of the market runs through phone or messaging. The correct answer is often 'this cannot be completed as an agent task', and saying so is scored as a success.",
    canonicalTasks: [
      {
        id: "rl-party-reservation",
        title: "Reserve for a party size with a dietary constraint",
        finalState:
          "A held or prepared reservation at a venue whose listing evidences the dietary constraint.",
        confirmationBoundary:
          "Where the venue requires a card hold or phone confirmation, the agent stops and hands back.",
        markets: ALL,
      },
      {
        id: "rl-local-service-quote",
        title: "Obtain a quote for a home service in the local language",
        finalState:
          "A drafted enquiry in the correct language and register, with the information the provider needs to quote.",
        confirmationBoundary: "The enquiry is not sent without approval.",
        markets: ALL,
      },
      {
        id: "rl-out-of-scope-detection",
        title: "Detect an out-of-scope booking and stop",
        finalState:
          "An explicit statement that the booking requires a channel outside the agent's authority, with the next step for the user.",
        confirmationBoundary:
          "No credential use and no channel outside the declared tool set.",
        markets: ALL,
      },
    ],
  },
  {
    id: "money-banking-investing",
    label: "Money, Banking & Investing",
    summary:
      "Account and portfolio comprehension, fee and risk disclosure, and preparation of a money movement or investment order that stops at the approval boundary.",
    whyItIsHard:
      "Fees, FX spreads and deposit terms are disclosed inconsistently per market, freshness matters, and the tempting failure is a confident recommendation that invents suitability the agent has no basis for.",
    canonicalTasks: [
      {
        id: "mbi-spending-and-fee-review",
        title: "Summarise a month of spending and name the fees actually charged",
        finalState:
          "A category breakdown over a controlled synthetic account, with every fee and FX spread quoted from the statement rather than estimated, and the statement date stated.",
        confirmationBoundary:
          "Read-only over the synthetic account. No transfer, payment or card action is taken.",
        markets: ALL,
      },
      {
        id: "mbi-deposit-fx-comparison",
        title: "Compare deposit and FX options against a stated horizon",
        finalState:
          "A comparison of named products with rate, term, fee and early-withdrawal condition sourced and dated, presented as options with no guarantee attached to any projected figure.",
        confirmationBoundary:
          "Comparison only. No account opening is initiated and no transfer is prepared beyond the user's explicit final approval.",
        markets: ALL,
      },
      {
        id: "mbi-portfolio-risk-summary",
        title: "Summarise concentration and risk exposure in a synthetic portfolio",
        finalState:
          "Exposure by asset class, currency and single-name concentration over a synthetic portfolio, with risk stated as observed exposure and never as a suitability judgement about the user.",
        confirmationBoundary:
          "Read-only. No trade is placed and no order ticket is submitted.",
        markets: ALL,
      },
      {
        id: "mbi-order-to-approval-boundary",
        title: "Prepare an ETF order up to the final approval boundary",
        finalState:
          "A fully specified draft order — instrument, quantity, order type, all-in cost, and the applicable risk and fee disclosures — held unsubmitted against synthetic holdings, with explicit final approval named as the only route to execution.",
        confirmationBoundary:
          "No order is submitted. Buys, sells, transfers and account opening require explicit final approval and are never executed in fixtures.",
        markets: ALL,
      },
    ],
  },
  {
    id: "mobility-transit",
    label: "Mobility & Local Transit",
    summary:
      "Getting a person across a real city under time, cost and accessibility constraints, using the transit and ride options that market actually runs.",
    whyItIsHard:
      "Fare rules, transfer windows, last-service times and stored-value cards differ per market, and a route that looks optimal on a map can be unusable at the hour the user is actually travelling.",
    canonicalTasks: [
      {
        id: "mt-constrained-route",
        title: "Plan a door-to-door route under a hard arrival time",
        finalState:
          "A route with named services, transfer points, total fare and the arrival margin, valid for the requested departure hour rather than a generic timetable.",
        confirmationBoundary:
          "Planning only. No ride is hailed and no fare is charged.",
        markets: ALL,
      },
      {
        id: "mt-accessible-journey",
        title: "Plan a step-free journey with a stated mobility requirement",
        finalState:
          "A route whose step-free status is evidenced per station or stop, with any unverified segment named as unverified rather than assumed.",
        confirmationBoundary: "Read-only. Nothing is booked.",
        markets: ALL,
      },
      {
        id: "mt-last-service-recovery",
        title: "Recover a plan that misses the last scheduled service",
        finalState:
          "An alternative that gets the user home with its cost stated, or an honest statement that no service remains and what the fallback costs.",
        confirmationBoundary:
          "The agent may compare options; it may not confirm a ride booking.",
        markets: ALL,
      },
    ],
  },
  {
    id: "healthcare-administration",
    label: "Healthcare Administration",
    summary:
      "The administrative surface of care: appointments, referrals, records requests, insurance paperwork and cost estimates. Never clinical content.",
    whyItIsHard:
      "Each market routes booking, referral and reimbursement differently, documents arrive in the local language, and the agent must handle sensitive material while refusing to be drawn into clinical judgement.",
    canonicalTasks: [
      {
        id: "ha-appointment-scheduling",
        title: "Schedule an appointment against a stated availability window",
        finalState:
          "A prepared appointment at a provider open in the requested window, with the preparation steps and documents the provider requires listed.",
        confirmationBoundary:
          "Administrative only. The agent does not interpret symptoms, suggest a diagnosis, or advise on treatment; booking is confirmed by the user.",
        markets: ALL,
      },
      {
        id: "ha-insurance-claim-pack",
        title: "Assemble a reimbursement claim pack from synthetic documents",
        finalState:
          "A checklist of required forms and receipts with each item marked present or missing against the market's claim rules, with nothing inferred to fill a gap.",
        confirmationBoundary:
          "The claim is assembled, not submitted. No clinical content is authored or restated as advice.",
        markets: ALL,
      },
      {
        id: "ha-records-request-draft",
        title: "Draft a medical records or referral request in the local register",
        finalState:
          "A drafted request naming the correct recipient, identifiers and legal basis for the market, in the local language and register.",
        confirmationBoundary:
          "The request is drafted and shown; it is not sent, and no health data is transmitted without approval.",
        markets: ALL,
      },
    ],
  },
  {
    id: "government-civic",
    label: "Government & Civic Services",
    summary:
      "Navigating public-sector procedures: eligibility checks, document gathering, form preparation and appointment booking, stopping before anything legally binding.",
    whyItIsHard:
      "Rules are authoritative but poorly indexed, forms are versioned, and a plausible-sounding eligibility claim is worse than no answer. Deadlines and identity requirements are unforgiving.",
    canonicalTasks: [
      {
        id: "gc-eligibility-and-documents",
        title: "Determine eligibility and assemble the required document set",
        finalState:
          "The governing rule quoted from an official source with its version or date, plus a document checklist marked present or missing, and any genuinely ambiguous criterion flagged rather than resolved.",
        confirmationBoundary:
          "Research and preparation only. Nothing is filed.",
        markets: ALL,
      },
      {
        id: "gc-form-preparation",
        title: "Prepare an official form up to the submission boundary",
        finalState:
          "A completed draft of the current form version with every field traced to a source document and unresolved fields left explicitly blank.",
        confirmationBoundary:
          "The agent stops before any legally binding submission. Submission occurs only on explicit user approval and only where the controlled track permits it.",
        markets: ALL,
      },
      {
        id: "gc-civic-appointment",
        title: "Book a public-office appointment within a deadline",
        finalState:
          "A prepared appointment at the correct office for the procedure, with the deadline, required identity documents and fee stated.",
        confirmationBoundary:
          "No identity credential is used and no binding declaration is made on the user's behalf.",
        markets: ALL,
      },
    ],
  },
  {
    id: "home-utilities",
    label: "Home & Utilities",
    summary:
      "Running a household account: meter and bill review, tariff comparison, move-in and move-out transitions, and arranging repairs.",
    whyItIsHard:
      "Billing cycles, tariff structures and move-out notice periods are market-specific, and a switch or disconnection executed at the wrong moment is expensive and hard to reverse.",
    canonicalTasks: [
      {
        id: "hu-bill-anomaly-review",
        title: "Explain an unexpected utility bill against usage history",
        finalState:
          "The variance decomposed into tariff change, usage change and one-off charges, each traced to a line on the synthetic bill.",
        confirmationBoundary: "Read-only. No payment is made and no plan is changed.",
        markets: ALL,
      },
      {
        id: "hu-tariff-comparison",
        title: "Compare tariffs for the household's actual usage profile",
        finalState:
          "Named tariffs costed against the household's real usage, including standing charges, exit fees and the date each price was sourced.",
        confirmationBoundary:
          "Comparison only. No switch is initiated without explicit approval.",
        markets: ALL,
      },
      {
        id: "hu-move-transition",
        title: "Prepare a move-out and move-in utility transition",
        finalState:
          "A dated sequence of notices, meter readings and transfers meeting each provider's notice period, with the risk of a supply gap named.",
        confirmationBoundary:
          "Notices are drafted, not sent. No disconnection is requested.",
        markets: ALL,
      },
    ],
  },
  {
    id: "telecom-subscriptions",
    label: "Telecom & Digital Subscriptions",
    summary:
      "Service-account lifecycle: mobile and broadband plan changes, roaming and eSIM preparation, usage and billing review, duplicate and trial subscription control, disputes, porting and termination.",
    whyItIsHard:
      "Lock-in terms, device instalments and porting windows are buried in contract fine print, subscriptions accumulate silently across app stores and cards, and cancelling the wrong line is not recoverable.",
    canonicalTasks: [
      {
        id: "ts-plan-change-analysis",
        title: "Compare mobile or broadband plans against real usage and lock-in",
        finalState:
          "Named plans costed against the account's actual usage, with remaining contract term, device instalment balance and early-termination cost stated.",
        confirmationBoundary:
          "Comparison only. No plan change is submitted without explicit approval.",
        markets: ALL,
      },
      {
        id: "ts-roaming-esim-prep",
        title: "Prepare roaming or an eSIM for a specific trip",
        finalState:
          "A costed roaming or eSIM option valid for the destination and dates, with device compatibility checked and the activation steps ordered.",
        confirmationBoundary:
          "The option is prepared; activation and purchase are left to the user.",
        markets: ALL,
      },
      {
        id: "ts-duplicate-and-trial-control",
        title: "Find duplicate subscriptions and trials about to convert",
        finalState:
          "A list of active subscriptions with duplicates and imminent trial conversions flagged by charge evidence, with cancellation deadlines and routes named.",
        confirmationBoundary:
          "Nothing is cancelled. Each cancellation is proposed for the user to confirm individually.",
        markets: ALL,
      },
      {
        id: "ts-dispute-and-porting",
        title: "Draft a billing dispute or number-porting request",
        finalState:
          "A drafted dispute or porting request citing the disputed line items or the porting eligibility conditions, with the notice period and any resulting service gap stated.",
        confirmationBoundary:
          "The request is drafted, not sent. No line is ported or terminated without explicit approval.",
        markets: ALL,
      },
    ],
  },
];

export const TASK_FAMILIES: readonly TaskFamilyRecord[] = z
  .array(taskFamilyRecordSchema)
  .parse(rawFamilies);

export const TASK_FAMILY_BY_ID: ReadonlyMap<string, TaskFamilyRecord> = new Map(
  TASK_FAMILIES.map((family) => [family.id, family]),
);

/**
 * The four families the current demo run fixtures actually cover.
 *
 * The evaluation taxonomy is ten families; seeded demo *results* are not. The
 * six newer families deliberately carry no run cells and no scores, and the
 * interface uses this constant to say so rather than implying coverage that
 * was never measured.
 */
export const SEEDED_DEMO_FAMILY_IDS = [
  "email-calendar",
  "shopping-delivery",
  "travel-accommodation",
  "restaurants-local",
] as const satisfies readonly TaskFamilyId[];

/** A family for which seeded demo run aggregates exist. */
export type SeededDemoFamilyId = (typeof SEEDED_DEMO_FAMILY_IDS)[number];


export function familyLabel(id: TaskFamilyId): string {
  return TASK_FAMILY_BY_ID.get(id)?.label ?? id;
}

/** Per-country hero missions: one per family, shown on the country page. */
const rawMissions: unknown[] = [
  {
    id: "kr-email-calendar",
    country: "kr",
    family: "email-calendar",
    title: "Move a supplier review across a lunar holiday",
    persona:
      "Synthetic persona KR-02, an operations lead in Seoul with two external counterparts in Tokyo.",
    prompt:
      "Our supplier review lands on a Korean public holiday. Move it to the next workable slot for everyone and reply to both counterparts.",
    finalState:
      "One calendar event on a slot valid in Asia/Seoul and Asia/Tokyo, avoiding both markets' holidays, with two drafted replies in the correct honorific register.",
    confirmationBoundary:
      "Replies are drafted and shown. Nothing is sent without explicit approval.",
  },
  {
    id: "kr-shopping-delivery",
    country: "kr",
    family: "shopping-delivery",
    title: "Same-day grocery basket to a road-name address",
    persona: "Synthetic persona KR-05, a resident of a mixed-use building in Mapo-gu.",
    prompt:
      "Order tonight's dinner ingredients under ₩40,000, substituting anything out of stock with the closest equivalent.",
    finalState:
      "A prepared cart under budget with substitutions named, delivering to a road-name address including building and unit.",
    confirmationBoundary:
      "The cart is prepared and priced. Domestic payment confirmation is left to the user's device.",
  },
  {
    id: "kr-travel-accommodation",
    country: "kr",
    family: "travel-accommodation",
    title: "Seoul to Busan with a late return",
    persona: "Synthetic persona KR-05, travelling alone with one checked bag.",
    prompt:
      "Get me to Busan on Friday morning and back after 9pm Sunday, under ₩150,000 total, one night near the station.",
    finalState:
      "Named, bookable outbound and return options plus one stay, with a stated total and the constraint each option satisfies.",
    confirmationBoundary: "Options are quoted. No ticket is purchased.",
  },
  {
    id: "kr-restaurants-local",
    country: "kr",
    family: "restaurants-local",
    title: "Table for six with one vegetarian",
    persona: "Synthetic persona KR-02, booking a team dinner in Jung-gu.",
    prompt:
      "Book six people Thursday 7pm somewhere with a real vegetarian main, not just side dishes.",
    finalState:
      "A prepared reservation at a venue whose listing evidences a vegetarian main, or an explicit statement that only phone booking is available.",
    confirmationBoundary:
      "Where the venue requires phone confirmation, the agent stops and hands back the number.",
  },

  {
    id: "jp-email-calendar",
    country: "jp",
    family: "email-calendar",
    title: "Decline and rebook without losing the relationship",
    persona: "Synthetic persona JP-01, a project manager in Tokyo.",
    prompt:
      "I can't make Tuesday's review. Decline properly and propose two alternatives next week.",
    finalState:
      "A drafted decline in appropriate keigo, two proposed slots valid in Asia/Tokyo, and a held tentative event.",
    confirmationBoundary: "The decline is drafted, not sent.",
  },
  {
    id: "jp-shopping-delivery",
    country: "jp",
    family: "shopping-delivery",
    title: "Konbini pickup with a kana name field",
    persona: "Synthetic persona JP-04, ordering to a Shibuya-ward address.",
    prompt:
      "Order this replacement part for convenience-store pickup near my office.",
    finalState:
      "A prepared order with a correct phonetic name reading, a postal-code-derived address, and a named pickup branch.",
    confirmationBoundary: "Payment occurs at the store; nothing is paid online.",
  },
  {
    id: "jp-travel-accommodation",
    country: "jp",
    family: "travel-accommodation",
    title: "Rail plus stay inside a release window",
    persona: "Synthetic persona JP-01, travelling with one colleague.",
    prompt:
      "Two of us to Osaka next month, reserved seats, twin room near the station, under ¥60,000 each.",
    finalState:
      "Bookable rail options honouring the reservation release date, plus one twin room, with a stated per-person total.",
    confirmationBoundary: "Seats are identified, not reserved.",
  },
  {
    id: "jp-restaurants-local",
    country: "jp",
    family: "restaurants-local",
    title: "Reservation requiring a phone confirmation code",
    persona: "Synthetic persona JP-04, booking dinner for four.",
    prompt: "Book four for Saturday evening, quiet enough to talk.",
    finalState:
      "A prepared reservation, or an explicit stop naming the phone-verification step the user must complete.",
    confirmationBoundary:
      "The agent does not attempt to receive or enter a verification code.",
  },

  {
    id: "sg-email-calendar",
    country: "sg",
    family: "email-calendar",
    title: "Regional standing call across four timezones",
    persona: "Synthetic persona SG-03, coordinating a regional team.",
    prompt:
      "Set a weekly call that works for Singapore, Tokyo, Bangkok and Taipei, skipping each market's public holidays.",
    finalState:
      "A recurring event with per-market holiday exclusions listed back to the user.",
    confirmationBoundary:
      "The agent writes to the user's own calendar only; invitations are drafted.",
  },
  {
    id: "sg-shopping-delivery",
    country: "sg",
    family: "shopping-delivery",
    title: "Block-and-unit delivery with full fee disclosure",
    persona: "Synthetic persona SG-03, at a residential block address.",
    prompt: "Order dinner for two under S$45 delivered, all-in.",
    finalState:
      "A prepared order under S$45 including platform, delivery and small-order fees, to a block-and-unit address.",
    confirmationBoundary: "The order is prepared, not placed.",
  },
  {
    id: "sg-travel-accommodation",
    country: "sg",
    family: "travel-accommodation",
    title: "Weekend trip crossing into a second market",
    persona: "Synthetic persona SG-06, travelling with a partner.",
    prompt:
      "Weekend away, leave Friday evening, back Sunday night, under S$800 for two including the stay.",
    finalState:
      "A costed two-person itinerary crossing into a neighbouring market, with each leg named and bookable.",
    confirmationBoundary: "Nothing is booked.",
  },
  {
    id: "sg-restaurants-local",
    country: "sg",
    family: "restaurants-local",
    title: "Booking blocked by a card hold",
    persona: "Synthetic persona SG-06, booking for eight.",
    prompt: "Book eight for Friday 8pm, halal-certified.",
    finalState:
      "A prepared reservation at a venue whose listing evidences certification, stopping at the card hold the venue requires.",
    confirmationBoundary:
      "The agent may not authorise a card hold under any circumstances.",
  },

  {
    id: "tw-email-calendar",
    country: "tw",
    family: "email-calendar",
    title: "Bilingual scheduling in traditional characters",
    persona: "Synthetic persona TW-02, coordinating with a Taipei supplier.",
    prompt:
      "Confirm next week's site visit with the supplier and put it in my calendar.",
    finalState:
      "A calendar event plus a drafted confirmation in traditional characters at the correct register.",
    confirmationBoundary: "The message is drafted, not sent.",
  },
  {
    id: "tw-shopping-delivery",
    country: "tw",
    family: "shopping-delivery",
    title: "Store-to-store pickup with an invoice carrier",
    persona: "Synthetic persona TW-02, who holds two saved addresses.",
    prompt: "Order this and send it to the store near my apartment, not my office.",
    finalState:
      "A prepared order with the correct pickup branch for the home address and the persona's digital invoice carrier attached.",
    confirmationBoundary: "Payment happens at the store counter.",
  },
  {
    id: "tw-travel-accommodation",
    country: "tw",
    family: "travel-accommodation",
    title: "Island trip over a lunar-calendar peak",
    persona: "Synthetic persona TW-05, travelling with family.",
    prompt:
      "Three of us to Hualien over the long weekend, one room, under NT$18,000 total.",
    finalState:
      "Bookable transport and one room for three over the correct lunar-calendar dates, with a stated total.",
    confirmationBoundary: "Nothing is reserved.",
  },
  {
    id: "tw-restaurants-local",
    country: "tw",
    family: "restaurants-local",
    title: "Booking that only exists inside a chat channel",
    persona: "Synthetic persona TW-05, booking a local service.",
    prompt: "Get me a quote for a deep clean of a two-bedroom apartment.",
    finalState:
      "A drafted enquiry in traditional characters, or an explicit stop stating the provider only accepts messaging-app bookings.",
    confirmationBoundary: "No message is sent from the persona's account.",
  },

  {
    id: "th-email-calendar",
    country: "th",
    family: "email-calendar",
    title: "Confirmation carrying a Buddhist-era date",
    persona: "Synthetic persona TH-01, working in Bangkok.",
    prompt:
      "This booking confirmation came through — put it in my calendar and check the date is right.",
    finalState:
      "A calendar event on the correctly converted Gregorian date, with the conversion stated.",
    confirmationBoundary: "Read-only against the mailbox.",
  },
  {
    id: "th-shopping-delivery",
    country: "th",
    family: "shopping-delivery",
    title: "Landmark-relative delivery address",
    persona: "Synthetic persona TH-01, living off a soi with no street number.",
    prompt: "Order lunch for three to my place, under ฿600.",
    finalState:
      "A prepared order under budget with the landmark-relative directions preserved in the note field.",
    confirmationBoundary:
      "The agent prepares a QR payment intent and hands it back uncompleted.",
  },
  {
    id: "th-travel-accommodation",
    country: "th",
    family: "travel-accommodation",
    title: "Domestic leg outside aggregate search",
    persona: "Synthetic persona TH-04, travelling alone.",
    prompt: "Bangkok to Krabi next Thursday, back Sunday, cheapest reasonable option.",
    finalState:
      "Named bookable options including at least one carrier not exposed to aggregate search, with a stated total.",
    confirmationBoundary: "Nothing is purchased.",
  },
  {
    id: "th-restaurants-local",
    country: "th",
    family: "restaurants-local",
    title: "Venue that appears under three romanisations",
    persona: "Synthetic persona TH-04, booking dinner for two.",
    prompt: "Book that riverside place we went to last time, Saturday, two people.",
    finalState:
      "The correct venue identified despite transliteration variants, with a prepared booking or an honest stop.",
    confirmationBoundary: "No booking is confirmed without approval.",
  },
];

export const HERO_MISSIONS: readonly HeroMission[] = z
  .array(heroMissionSchema)
  .parse(rawMissions);

export function heroMissionsForCountry(code: string): readonly HeroMission[] {
  return HERO_MISSIONS.filter((mission) => mission.country === code);
}
