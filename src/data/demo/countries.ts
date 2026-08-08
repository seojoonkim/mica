import {
  auditIntegrationCoverage,
  buildIntegrationSituationIndex,
  countrySchema,
  type Country,
  type CountryCode,
  type IntegrationSituation,
} from "@/lib/schema";
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
    integrationProfile: {
      summary:
        "Declared integration conditions for the Korean edition. Each situation states how the journey is reached, who must approve it, when it is actually complete and what a run would have to show. None has been exercised against a system.",
      situations: [
        {
          id: "kr-super-app-signed-in-flow",
          title: "Signed-in super-app flow with no browsable equivalent",
          detail:
            "Ordering, tracking and support live inside a signed-in app shell rather than an addressable web checkout, so the whole journey happens on one channel and a public page cannot confirm it.",
          capabilityArea: "Everyday commerce and local services",
          families: ["shopping-delivery", "restaurants-local"],
          surfaces: ["signed-in-app", "super-app-channel"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["channel-unavailable", "duplicate-or-retry-risk"],
          evidence: [
            "tool-call-lineage",
            "authoritative-response",
            "post-action-readback",
          ],
          translations: {
            ko: {
              title: "브라우저 대체 경로가 없는 로그인 앱 내부 흐름",
              detail:
                "주문, 배송 조회, 문의가 모두 로그인된 앱 안에서 이루어지고 공개 웹 결제 화면이 따로 없어서, 전 과정이 한 채널에서 끝나고 공개 페이지로는 결과를 확인할 수 없습니다.",
              capabilityArea: "생활 커머스와 지역 서비스",
            },
          },
        },
        {
          id: "kr-carrier-identity-handoff",
          title: "Carrier-bound identity check handed back to the user",
          detail:
            "A mid-journey identity step is tied to the user's mobile line. The correct behaviour is to preserve state and hand control back, not to attempt the check.",
          capabilityArea: "Identity-gated services",
          families: [
            "government-civic",
            "telecom-subscriptions",
            "money-banking-investing",
          ],
          surfaces: ["signed-in-app", "human-handoff"],
          authorization: "carrier-identity",
          completion: "human-confirmed",
          recovery: ["identity-handoff-timeout", "partial-success"],
          evidence: ["handoff-checkpoint", "tool-call-lineage"],
          translations: {
            ko: {
              title: "통신사 본인확인에서의 사용자 인계",
              detail:
                "과정 중간의 본인확인 단계가 사용자의 휴대전화 회선에 묶여 있습니다. 올바른 동작은 상태를 보존하고 사용자에게 제어를 넘기는 것이며, 확인 자체를 대신 시도하는 것이 아닙니다.",
              capabilityArea: "본인확인이 필요한 서비스",
            },
          },
        },
        {
          id: "kr-domestic-payment-approval",
          title: "Domestic payment approved in a separate app",
          detail:
            "Payment is confirmed in a separate domestic payment or banking app, so the confirmation boundary lands before the order state is final and a blind retry can duplicate the charge.",
          capabilityArea: "Payment and checkout",
          families: ["shopping-delivery", "money-banking-investing"],
          surfaces: ["signed-in-app", "qr-device-handoff"],
          authorization: "payment-approval",
          completion: "out-of-band-completion",
          recovery: ["duplicate-or-retry-risk", "partial-success"],
          evidence: [
            "handoff-checkpoint",
            "retry-idempotency-record",
            "authoritative-response",
          ],
          translations: {
            ko: {
              title: "별도 앱에서 이루어지는 국내 결제 승인",
              detail:
                "결제 승인이 별도의 국내 결제·은행 앱에서 이루어지므로 확인 경계가 주문 상태 확정보다 앞에 놓이고, 확인 없이 재시도하면 중복 결제가 생길 수 있습니다.",
              capabilityArea: "결제와 주문 확정",
            },
          },
        },
        {
          id: "kr-address-detail-completeness",
          title: "Accepted order that cannot be delivered",
          detail:
            "Road-name and lot-number addressing coexist and building or unit detail is often required, so an order can be accepted and still fail delivery unless the stored address is read back.",
          capabilityArea: "Delivery addressing",
          families: ["shopping-delivery", "home-utilities"],
          surfaces: ["open-web", "signed-in-app"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["partial-success", "stale-inventory-or-late-fee"],
          evidence: ["post-action-readback", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "접수는 되지만 배송되지 않는 주소",
              detail:
                "도로명 주소와 지번 주소가 함께 쓰이고 건물·동호수 정보가 필요한 경우가 많아서, 주문은 접수되어도 저장된 주소를 다시 읽어 확인하지 않으면 배송이 실패할 수 있습니다.",
              capabilityArea: "배송 주소 처리",
            },
          },
        },
        {
          id: "kr-lunar-holiday-scheduling",
          title: "Lunar-calendar holidays in scheduling and delivery windows",
          detail:
            "Public holidays that move year to year change what a valid slot and a reasonable delivery window are, and the resulting artifact has to be readable in the local calendar and time zone.",
          capabilityArea: "Scheduling and date handling",
          families: ["email-calendar", "travel-accommodation"],
          surfaces: ["official-api", "open-web"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["partial-success"],
          evidence: ["locale-formatted-artifact", "post-action-readback"],
          translations: {
            ko: {
              title: "음력 공휴일이 걸린 일정과 배송 기간",
              detail:
                "해마다 날짜가 바뀌는 공휴일 때문에 유효한 시간대와 합리적인 배송 기간의 기준이 달라지고, 결과물은 현지 달력과 표준시로 읽을 수 있어야 합니다.",
              capabilityArea: "일정과 날짜 처리",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "한국 에디션에 선언된 연동 조건입니다. 각 상황은 어떤 경로로 접근하고 누가 승인해야 하며 언제 실제로 완료되는지, 그리고 실행 기록이 무엇을 남겨야 하는지를 밝힙니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
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
    integrationProfile: {
      summary:
        "Declared integration conditions for the Japanese edition. Most of them decide whether a form is accepted at all, and the rest decide whether an accepted order is actually finished. None has been exercised against a system.",
      situations: [
        {
          id: "jp-kana-name-fields",
          title: "Separate phonetic reading fields on booking forms",
          detail:
            "Forms commonly ask for the customer name twice, once in characters and once as a phonetic reading. Mirroring one field into the other produces a rejected submission rather than a warning.",
          capabilityArea: "Form completion and local text entry",
          families: ["restaurants-local", "travel-accommodation"],
          surfaces: ["open-web", "signed-in-app"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["whole-form-invalidation", "partial-success"],
          evidence: ["locale-formatted-artifact", "post-action-readback"],
          translations: {
            ko: {
              title: "예약 양식의 별도 발음 표기 입력란",
              detail:
                "고객 이름을 문자 표기와 발음 표기로 두 번 요구하는 양식이 흔합니다. 한쪽을 그대로 옮겨 적으면 경고가 아니라 제출 거절로 이어집니다.",
              capabilityArea: "양식 작성과 현지 문자 입력",
            },
          },
        },
        {
          id: "jp-postal-code-autofill",
          title: "Postal-code auto-fill and duplicated address fields",
          detail:
            "The postal code populates the region and ward fields itself. Typing them again duplicates the address, and the failure appears at submission rather than at the field.",
          capabilityArea: "Address entry",
          families: ["shopping-delivery", "home-utilities"],
          surfaces: ["open-web"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["duplicate-or-retry-risk", "whole-form-invalidation"],
          evidence: ["tool-call-lineage", "post-action-readback"],
          translations: {
            ko: {
              title: "우편번호 자동 입력과 주소 항목 중복",
              detail:
                "우편번호를 넣으면 광역·구 단위 항목이 자동으로 채워집니다. 이를 다시 입력하면 주소가 중복되고, 오류는 입력 시점이 아니라 제출 시점에 드러납니다.",
              capabilityArea: "주소 입력",
            },
          },
        },
        {
          id: "jp-konbini-completion",
          title: "Convenience-store payment or pickup completes the order",
          detail:
            "The order is only finished when the user pays or collects at a store, so a checkout confirmation is a pending state and the deadline for that step is part of the task.",
          capabilityArea: "Fulfilment and payment outside the agent's surface",
          families: ["shopping-delivery", "telecom-subscriptions"],
          surfaces: ["open-web", "human-handoff"],
          authorization: "payment-approval",
          completion: "out-of-band-completion",
          recovery: ["stale-inventory-or-late-fee", "partial-success"],
          evidence: [
            "authoritative-response",
            "handoff-checkpoint",
            "locale-formatted-artifact",
          ],
          translations: {
            ko: {
              title: "편의점 결제·수령으로 완료되는 주문",
              detail:
                "사용자가 매장에서 결제하거나 수령해야 주문이 끝나므로, 결제 화면의 확인은 대기 상태이며 그 단계의 기한까지가 과제의 일부입니다.",
              capabilityArea: "에이전트 화면 밖에서 끝나는 이행과 결제",
            },
          },
        },
        {
          id: "jp-phone-confirmation-code",
          title: "Reservation confirmed by a code sent to the user's phone",
          detail:
            "Booking flows frequently send a one-time code to the user's number, which moves the confirmation boundary onto the user's device and puts the step under a timeout.",
          capabilityArea: "Reservation confirmation",
          families: ["restaurants-local", "healthcare-administration"],
          surfaces: ["human-handoff", "signed-in-app"],
          authorization: "otp",
          completion: "human-confirmed",
          recovery: ["identity-handoff-timeout", "channel-unavailable"],
          evidence: ["handoff-checkpoint", "tool-call-lineage"],
          translations: {
            ko: {
              title: "사용자 휴대전화로 오는 코드로 확정되는 예약",
              detail:
                "예약 과정에서 사용자 번호로 일회용 코드를 보내는 경우가 많습니다. 확인 경계가 사용자 기기로 옮겨가고 그 단계에는 제한 시간이 걸립니다.",
              capabilityArea: "예약 확정",
            },
          },
        },
        {
          id: "jp-whole-form-retry-invalidation",
          title: "Retry invalidates the whole submission",
          detail:
            "Many flows discard the entire form on a validation error or a held reservation slot, so a retry is a fresh non-idempotent submission and has to be recorded as one.",
          capabilityArea: "Recovery and retry discipline",
          families: ["travel-accommodation", "government-civic"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["whole-form-invalidation", "duplicate-or-retry-risk"],
          evidence: ["retry-idempotency-record", "tool-call-lineage"],
          translations: {
            ko: {
              title: "재시도 시 제출 전체가 무효가 되는 절차",
              detail:
                "검증 오류나 좌석 선점 해제가 나면 양식 전체가 폐기되는 절차가 많습니다. 재시도는 멱등하지 않은 새 제출이므로 그렇게 기록해야 합니다.",
              capabilityArea: "복구와 재시도 관리",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "일본 에디션에 선언된 연동 조건입니다. 상당수는 양식이 접수되는지를 가르고, 나머지는 접수된 주문이 실제로 끝났는지를 가릅니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
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
    integrationProfile: {
      summary:
        "Declared integration conditions for the Singapore edition. Language friction is low here, so what remains is payment eligibility, late price changes and address precision. None has been exercised against a system.",
      situations: [
        {
          id: "sg-multi-rail-payment-eligibility",
          title: "Choosing a payment rail the persona actually holds",
          detail:
            "Card, national QR transfer and stored-value wallets coexist, and the QR rail completes on the user's own device. Picking a rail the persona does not hold fails quietly at the last step.",
          capabilityArea: "Payment eligibility and checkout",
          families: ["shopping-delivery", "mobility-transit"],
          surfaces: ["open-web", "signed-in-app", "qr-device-handoff"],
          authorization: "payment-approval",
          completion: "human-confirmed",
          recovery: ["channel-unavailable", "partial-success"],
          evidence: ["tool-call-lineage", "handoff-checkpoint"],
          translations: {
            ko: {
              title: "페르소나가 실제로 보유한 결제 수단 선택",
              detail:
                "카드, 국가 QR 이체, 선불 지갑이 함께 쓰이고 QR 경로는 사용자 기기에서 마무리됩니다. 페르소나가 갖고 있지 않은 수단을 고르면 마지막 단계에서 조용히 실패합니다.",
              capabilityArea: "결제 수단 적격성과 주문 확정",
            },
          },
        },
        {
          id: "sg-late-fee-final-readback",
          title: "Fees added late, so the final total must be read back",
          detail:
            "Platform, delivery and small-order fees appear near the end of the flow, so a price quoted mid-task is routinely wrong and only the confirmed total counts.",
          capabilityArea: "Price accuracy at confirmation",
          families: ["shopping-delivery", "restaurants-local"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["stale-inventory-or-late-fee", "partial-success"],
          evidence: ["post-action-readback", "authoritative-response"],
          translations: {
            ko: {
              title: "뒤늦게 붙는 수수료와 최종 금액 재확인",
              detail:
                "플랫폼·배달·소액주문 수수료가 흐름 후반에 붙기 때문에 과정 중간에 제시한 금액은 대체로 틀리며, 확정된 총액만 유효합니다.",
              capabilityArea: "확정 시점의 금액 정확도",
            },
          },
        },
        {
          id: "sg-block-unit-addressing",
          title: "Block and unit numbers dropped by address parsing",
          detail:
            "Residential addresses depend on block and unit numbers that many parsers discard, producing an accepted order that cannot be delivered until the stored address is checked.",
          capabilityArea: "Delivery addressing",
          families: ["shopping-delivery", "home-utilities"],
          surfaces: ["open-web"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["partial-success", "duplicate-or-retry-risk"],
          evidence: ["post-action-readback", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "주소 파싱에서 사라지는 블록·유닛 번호",
              detail:
                "주거지 주소는 블록과 유닛 번호에 의존하는데 이를 버리는 파서가 많아서, 저장된 주소를 확인하기 전까지는 접수는 되지만 배송되지 않는 주문이 생깁니다.",
              capabilityArea: "배송 주소 처리",
            },
          },
        },
        {
          id: "sg-cross-locale-regional-booking",
          title: "Booking that crosses into a neighbouring market",
          detail:
            "Travel tasks routinely pull in a second locale, currency and time zone mid-flow, and the confirmation has to be readable and correct in both.",
          capabilityArea: "Cross-border travel booking",
          families: ["travel-accommodation", "mobility-transit"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["stale-inventory-or-late-fee", "channel-unavailable"],
          evidence: ["locale-formatted-artifact", "tool-call-lineage"],
          translations: {
            ko: {
              title: "인접 시장으로 넘어가는 예약",
              detail:
                "여행 과제는 흐름 중간에 다른 지역, 통화, 표준시를 끌어들이는 일이 잦고 확정 내용은 양쪽 모두에서 읽을 수 있고 정확해야 합니다.",
              capabilityArea: "국경을 넘는 여행 예약",
            },
          },
        },
        {
          id: "sg-card-hold-handoff",
          title: "No-show policy requiring a card hold",
          detail:
            "A reservation may require a card hold that sits outside the agent's authority, so the run stops at the account holder's confirmation and must not re-place the booking blindly.",
          capabilityArea: "Reservation guarantees",
          families: ["restaurants-local", "travel-accommodation"],
          surfaces: ["signed-in-app", "human-handoff"],
          authorization: "account-holder-confirmation",
          completion: "human-confirmed",
          recovery: ["identity-handoff-timeout", "duplicate-or-retry-risk"],
          evidence: ["handoff-checkpoint", "retry-idempotency-record"],
          translations: {
            ko: {
              title: "노쇼 정책에 따른 카드 보증 요구",
              detail:
                "예약에 카드 보증이 필요할 수 있고 이는 에이전트의 권한 밖입니다. 실행은 계정 보유자의 확인 지점에서 멈춰야 하며 확인 없이 예약을 다시 넣어서는 안 됩니다.",
              capabilityArea: "예약 보증",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "싱가포르 에디션에 선언된 연동 조건입니다. 언어 장벽이 낮은 시장이라 남는 것은 결제 수단 적격성, 뒤늦은 금액 변동, 주소 정밀도입니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
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
    integrationProfile: {
      summary:
        "Declared integration conditions for the Taiwan edition. The pattern here is that the last step, not the first, decides the outcome. None has been exercised against a system.",
      situations: [
        {
          id: "tw-store-pickup-branch-selection",
          title: "Pickup branch chosen as part of the order",
          detail:
            "The order carries a chosen convenience-store branch. A branch near the wrong one of the persona's addresses is an accuracy failure that reads as a success unless the stored selection is checked.",
          capabilityArea: "Fulfilment routing",
          families: ["shopping-delivery", "restaurants-local"],
          surfaces: ["open-web", "signed-in-app"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["partial-success", "stale-inventory-or-late-fee"],
          evidence: ["post-action-readback", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "주문의 일부로 선택되는 수령 지점",
              detail:
                "주문에는 선택한 편의점 지점이 포함됩니다. 페르소나의 다른 주소 근처 지점을 고르면 성공처럼 보이지만 정확도 실패이며, 저장된 선택을 확인해야 드러납니다.",
              capabilityArea: "이행 경로 선택",
            },
          },
        },
        {
          id: "tw-messaging-channel-commerce",
          title: "Booking inside a messaging channel with no structured endpoint",
          detail:
            "Restaurant and local-service booking often happens in a chat channel, so there is no structured response to parse and a supervised handoff is the only honest completion.",
          capabilityArea: "Local services without an API",
          families: ["restaurants-local", "home-utilities"],
          surfaces: ["super-app-channel", "human-handoff"],
          authorization: "session-only",
          completion: "human-confirmed",
          recovery: ["channel-unavailable", "duplicate-or-retry-risk"],
          evidence: ["tool-call-lineage", "handoff-checkpoint"],
          translations: {
            ko: {
              title: "구조화된 응답이 없는 메신저 채널 예약",
              detail:
                "식당과 지역 서비스 예약이 대화 채널에서 이루어지는 경우가 많습니다. 파싱할 구조화된 응답이 없으므로 감독된 인계가 유일하게 정직한 완료 방식입니다.",
              capabilityArea: "연동 창구가 없는 지역 서비스",
            },
          },
        },
        {
          id: "tw-invoice-carrier-binding",
          title: "Digital invoice carrier belongs to the account holder",
          detail:
            "Checkout expects an invoice carrier identifier. Omitting it completes the purchase but misses the declared final state, and inventing one is never acceptable, so it is confirmed with the account holder.",
          capabilityArea: "Receipts and tax artifacts",
          families: ["shopping-delivery", "money-banking-investing"],
          surfaces: ["open-web", "signed-in-app"],
          authorization: "account-holder-confirmation",
          completion: "synchronous-confirmed",
          recovery: ["whole-form-invalidation", "partial-success"],
          evidence: ["locale-formatted-artifact", "authoritative-response"],
          translations: {
            ko: {
              title: "계정 보유자에게 속한 전자 인보이스 캐리어",
              detail:
                "결제 단계에서 인보이스 캐리어 식별자를 요구합니다. 이를 빠뜨리면 구매는 끝나도 선언한 최종 상태에 못 미치고, 임의로 만들어 넣는 것은 허용되지 않으므로 계정 보유자에게 확인합니다.",
              capabilityArea: "영수증과 세금 관련 산출물",
            },
          },
        },
        {
          id: "tw-traditional-character-artifact",
          title: "Traditional-character output as the delivered artifact",
          detail:
            "A semantically correct answer in the wrong character set is a localization failure, and the same applies to the confirmation text a run leaves behind.",
          capabilityArea: "Local text and search",
          families: ["email-calendar", "government-civic"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["partial-success"],
          evidence: ["locale-formatted-artifact", "post-action-readback"],
          translations: {
            ko: {
              title: "번체 표기로 남겨야 하는 결과물",
              detail:
                "뜻이 맞아도 문자 체계가 다르면 현지화 실패이며, 실행이 남기는 확인 문구에도 같은 기준이 적용됩니다.",
              capabilityArea: "현지 문자와 검색",
            },
          },
        },
        {
          id: "tw-store-pickup-payment",
          title: "Payment and collection completed at the store",
          detail:
            "Payment on collection finishes the order off the agent's surface and under a deadline, so a confirmation number is a pending state and a retry can create a second order.",
          capabilityArea: "Out-of-band fulfilment",
          families: ["shopping-delivery", "telecom-subscriptions"],
          surfaces: ["human-handoff", "qr-device-handoff"],
          authorization: "payment-approval",
          completion: "out-of-band-completion",
          recovery: ["stale-inventory-or-late-fee", "duplicate-or-retry-risk"],
          evidence: [
            "handoff-checkpoint",
            "authoritative-response",
            "retry-idempotency-record",
          ],
          translations: {
            ko: {
              title: "매장에서 마무리되는 결제와 수령",
              detail:
                "수령 시 결제로 주문이 에이전트 화면 밖에서, 그것도 기한 안에 끝납니다. 확인 번호는 대기 상태이며 재시도는 두 번째 주문을 만들 수 있습니다.",
              capabilityArea: "화면 밖에서 끝나는 이행",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "대만 에디션에 선언된 연동 조건입니다. 이 시장에서는 첫 단계가 아니라 마지막 단계가 결과를 가릅니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
  },
  {
    code: "ae",
    name: "United Arab Emirates",
    nativeName: "الإمارات العربية المتحدة",
    locale: "ar-AE",
    currency: "AED",
    currencySymbol: "د.إ",
    timezone: "Asia/Dubai",
    editionNote:
      "A bilingual, identity-gated service market where the visible web flow is often only the first half of the task. Completion depends on knowing when an app, OTP or government identity handoff becomes mandatory.",
    hazards: [
      {
        title: "Arabic–English listing drift",
        detail:
          "Venues, buildings and public services may appear under different Arabic and English names or transliterations. Treating those labels as separate entities produces duplicate or wrong-location results.",
        axis: "localization",
      },
      {
        title: "Building and community addressing",
        detail:
          "A usable delivery address often depends on tower, community, apartment, landmark and access notes rather than a street number alone. Dropping those fields can create an accepted but undeliverable order.",
        axis: "localization",
      },
      {
        title: "OTP and UAE Pass handoff",
        detail:
          "Government and regulated-service flows frequently require a user-held OTP or UAE Pass approval. The correct agent behaviour is to preserve state and hand control back at that identity boundary.",
        axis: "safety",
      },
      {
        title: "App-only fulfilment",
        detail:
          "Delivery, mobility and local-service inventory can differ between the public website and the signed-in mobile app. A web-only agent may find an option it cannot actually complete.",
        axis: "tool-api-use",
      },
    ],
    whatLocalChanges: [
      "Arabic and English names must be resolved as alternate labels for the same place or service, not assumed to be distinct records.",
      "Delivery final states include building, unit, community and access-note confirmation, not only a pin or postal address.",
      "Identity-gated government and regulated-service tasks stop at the UAE Pass or OTP approval step and must retain enough state for a clean user handoff.",
      "Prices and availability need a final signed-in check because public listings, app inventory, delivery fees and service-area rules can diverge late in the flow.",
    ],
    integrationProfile: {
      summary:
        "Declared integration conditions for the UAE edition. The visible web flow is often only the first half, and the second half is identity, app inventory or a late service-area rule. None has been exercised against a system.",
      situations: [
        {
          id: "ae-identity-approval-handoff",
          title: "Government or regulated-service identity approval",
          detail:
            "Regulated flows require a user-held identity approval that the agent must never attempt. The run preserves enough state for a clean handoff and stops there.",
          capabilityArea: "Identity-gated public and regulated services",
          families: ["government-civic", "healthcare-administration"],
          surfaces: ["signed-in-app", "human-handoff"],
          authorization: "government-identity",
          completion: "human-confirmed",
          recovery: ["identity-handoff-timeout", "partial-success"],
          evidence: ["handoff-checkpoint", "tool-call-lineage"],
          translations: {
            ko: {
              title: "정부·규제 서비스의 신원 승인",
              detail:
                "규제 대상 절차는 사용자가 직접 하는 신원 승인을 요구하며 에이전트가 대신 시도해서는 안 됩니다. 실행은 깨끗한 인계를 위해 상태를 보존하고 거기서 멈춥니다.",
              capabilityArea: "신원 확인이 필요한 공공·규제 서비스",
            },
          },
        },
        {
          id: "ae-app-inventory-divergence",
          title: "Signed-in app inventory diverging from the public site",
          detail:
            "Availability, price and service coverage can differ between the public website and the signed-in app, so an option found on the web may not be completable and needs a signed-in check.",
          capabilityArea: "Availability and pricing verification",
          families: ["shopping-delivery", "mobility-transit"],
          surfaces: ["signed-in-app", "open-web"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["stale-inventory-or-late-fee", "channel-unavailable"],
          evidence: ["post-action-readback", "authoritative-response"],
          translations: {
            ko: {
              title: "공개 웹과 다른 로그인 앱의 재고",
              detail:
                "공개 웹사이트와 로그인 앱 사이에 재고, 가격, 서비스 범위가 다를 수 있습니다. 웹에서 찾은 선택지가 실제로는 완료되지 않을 수 있어 로그인 상태에서 다시 확인해야 합니다.",
              capabilityArea: "재고와 가격 확인",
            },
          },
        },
        {
          id: "ae-bilingual-entity-resolution",
          title: "Arabic and English labels for the same place",
          detail:
            "Venues, buildings and services appear under different Arabic and English names or transliterations. Treating the labels as separate records produces duplicates or the wrong location.",
          capabilityArea: "Entity resolution and search",
          families: ["restaurants-local", "travel-accommodation"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["partial-success", "duplicate-or-retry-risk"],
          evidence: ["tool-call-lineage", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "같은 장소를 가리키는 아랍어와 영어 표기",
              detail:
                "장소, 건물, 서비스가 아랍어와 영어에서 서로 다른 이름이나 음역으로 나타납니다. 이를 별개의 기록으로 다루면 중복이 생기거나 엉뚱한 위치를 고르게 됩니다.",
              capabilityArea: "개체 식별과 검색",
            },
          },
        },
        {
          id: "ae-tower-community-access-notes",
          title: "Tower, community, unit and access notes in an address",
          detail:
            "A usable address depends on tower, community, apartment and access notes rather than a street number, and dropping those fields creates an accepted but undeliverable order.",
          capabilityArea: "Delivery addressing",
          families: ["shopping-delivery", "home-utilities"],
          surfaces: ["open-web", "signed-in-app"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["partial-success", "duplicate-or-retry-risk"],
          evidence: ["post-action-readback", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "타워, 커뮤니티, 호수, 출입 안내가 포함된 주소",
              detail:
                "쓸 수 있는 주소는 도로 번호가 아니라 타워, 커뮤니티, 호수, 출입 안내에 달려 있습니다. 이 항목을 빠뜨리면 접수는 되지만 배송되지 않는 주문이 됩니다.",
              capabilityArea: "배송 주소 처리",
            },
          },
        },
        {
          id: "ae-late-service-area-validation",
          title: "Service-area and fee rules validated late, with a payment code",
          detail:
            "Delivery fees and service-area rules can fail near the end of the flow, and card payment may be confirmed with a one-time code, so the final charge and state must be read back rather than assumed.",
          capabilityArea: "Checkout validation",
          families: ["shopping-delivery", "money-banking-investing"],
          surfaces: ["open-web", "official-api"],
          authorization: "otp",
          completion: "out-of-band-completion",
          recovery: ["stale-inventory-or-late-fee", "duplicate-or-retry-risk"],
          evidence: [
            "authoritative-response",
            "retry-idempotency-record",
            "handoff-checkpoint",
          ],
          translations: {
            ko: {
              title: "뒤늦게 검증되는 서비스 지역·수수료와 결제 인증 코드",
              detail:
                "배송비와 서비스 지역 규칙이 흐름 후반에 걸릴 수 있고 카드 결제는 일회용 코드로 확인될 수 있습니다. 최종 청구액과 상태는 추정하지 말고 다시 읽어 확인해야 합니다.",
              capabilityArea: "주문 확정 단계의 검증",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "아랍에미리트 에디션에 선언된 연동 조건입니다. 눈에 보이는 웹 흐름은 절반인 경우가 많고 나머지 절반은 신원 확인, 앱 재고, 뒤늦은 서비스 지역 규칙입니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
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
    integrationProfile: {
      summary:
        "Declared integration conditions for the Thai edition. Script, address interpretation and a user-completed payment step decide most outcomes here. None has been exercised against a system.",
      situations: [
        {
          id: "th-national-qr-payment-handoff",
          title: "National QR transfer completed on the user's device",
          detail:
            "Many flows end in a scannable transfer the user completes themselves. Preparing the payment intent and stopping is the correct behaviour, and a re-issued intent has to be guarded against double payment.",
          capabilityArea: "Payment handoff",
          families: ["shopping-delivery", "money-banking-investing"],
          surfaces: ["qr-device-handoff", "signed-in-app"],
          authorization: "payment-approval",
          completion: "out-of-band-completion",
          recovery: ["duplicate-or-retry-risk", "identity-handoff-timeout"],
          evidence: ["handoff-checkpoint", "retry-idempotency-record"],
          translations: {
            ko: {
              title: "사용자 기기에서 완료되는 국가 QR 이체",
              detail:
                "많은 절차가 사용자가 직접 완료하는 스캔 이체로 끝납니다. 결제 요청을 준비하고 멈추는 것이 올바른 동작이며, 요청을 다시 만들 때는 이중 결제를 막아야 합니다.",
              capabilityArea: "결제 인계",
            },
          },
        },
        {
          id: "th-landmark-address-notes",
          title: "Landmark and lane-relative addresses in a note field",
          detail:
            "Addresses are frequently expressed relative to a landmark or a lane rather than as structured fields, so the free-text note carries information the form cannot and must survive to the stored order.",
          capabilityArea: "Delivery addressing",
          families: ["shopping-delivery", "home-utilities"],
          surfaces: ["open-web"],
          authorization: "session-only",
          completion: "asynchronous-pending",
          recovery: ["partial-success", "duplicate-or-retry-risk"],
          evidence: ["post-action-readback", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "메모란에 담기는 랜드마크·골목 기준 주소",
              detail:
                "주소를 구조화된 항목 대신 랜드마크나 골목 기준으로 표현하는 일이 잦습니다. 자유 입력 메모가 양식이 담지 못하는 정보를 지니므로 저장된 주문까지 그대로 남아야 합니다.",
              capabilityArea: "배송 주소 처리",
            },
          },
        },
        {
          id: "th-script-and-transliteration-search",
          title: "Thai script segmentation and romanisation drift",
          detail:
            "Thai is written without spaces between words and the same venue appears under several romanisations, so matching a request to the right listing is a retrieval problem before it is a reasoning one.",
          capabilityArea: "Local search and retrieval",
          families: ["restaurants-local", "travel-accommodation"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["partial-success", "stale-inventory-or-late-fee"],
          evidence: ["tool-call-lineage", "locale-formatted-artifact"],
          translations: {
            ko: {
              title: "태국어 띄어쓰기 분절과 음역 표기 차이",
              detail:
                "태국어는 단어 사이를 띄우지 않고 같은 장소가 여러 로마자 표기로 나타납니다. 요청을 맞는 목록에 연결하는 일은 추론 이전에 검색의 문제입니다.",
              capabilityArea: "현지 검색과 탐색",
            },
          },
        },
        {
          id: "th-buddhist-era-dates",
          title: "Buddhist-era years in bookings and confirmations",
          detail:
            "Confirmations and forms use a different year numbering, which is a recurring date-parsing failure and has to be correct in both the submitted form and the delivered artifact.",
          capabilityArea: "Date handling",
          families: ["travel-accommodation", "government-civic"],
          surfaces: ["open-web", "official-api"],
          authorization: "session-only",
          completion: "synchronous-confirmed",
          recovery: ["whole-form-invalidation", "partial-success"],
          evidence: ["locale-formatted-artifact", "post-action-readback"],
          translations: {
            ko: {
              title: "예약과 확인서에 쓰이는 불기 연도",
              detail:
                "확인서와 양식이 다른 연도 체계를 쓰기 때문에 날짜 해석 오류가 반복됩니다. 제출한 양식과 전달한 결과물 양쪽에서 맞아야 합니다.",
              capabilityArea: "날짜 처리",
            },
          },
        },
        {
          id: "th-off-aggregator-carrier-inventory",
          title: "Domestic carrier inventory outside aggregate search",
          detail:
            "Some domestic budget carriers do not expose inventory to aggregators, so part of the option space is only reachable directly and the shortfall must be stated rather than hidden.",
          capabilityArea: "Travel inventory coverage",
          families: ["travel-accommodation", "mobility-transit"],
          surfaces: ["open-web", "human-handoff"],
          authorization: "account-holder-confirmation",
          completion: "human-confirmed",
          recovery: ["channel-unavailable", "stale-inventory-or-late-fee"],
          evidence: ["handoff-checkpoint", "authoritative-response"],
          translations: {
            ko: {
              title: "통합 검색에 노출되지 않는 국내 항공 재고",
              detail:
                "일부 국내 저비용 항공사는 재고를 통합 검색에 제공하지 않습니다. 선택지의 일부는 직접 경로로만 닿을 수 있고, 빠진 범위는 감추지 말고 밝혀야 합니다.",
              capabilityArea: "여행 재고 커버리지",
            },
          },
        },
      ],
      translations: {
        ko: {
          summary:
            "태국 에디션에 선언된 연동 조건입니다. 문자 처리, 주소 해석, 사용자가 마무리하는 결제 단계가 결과의 대부분을 가릅니다. 어느 것도 아직 시스템으로 수행된 적이 없습니다.",
        },
      },
    },
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

/**
 * Machine-derived coverage of the declared market integration profiles. It is
 * computed from the records rather than asserted in prose, so a market that
 * falls short of the contract says so here instead of being described as
 * covered. A validated market edition must additionally pass
 * `assertValidatedIntegrationCoverage`, which fails closed.
 */
export const MARKET_INTEGRATION_AUDIT = auditIntegrationCoverage(COUNTRIES);

/** Every declared situation id, by market. The linkage check reads this. */
export const INTEGRATION_SITUATION_INDEX =
  buildIntegrationSituationIndex(COUNTRIES);

export function integrationSituationsFor(
  code: CountryCode,
): readonly IntegrationSituation[] {
  return COUNTRY_BY_CODE.get(code)?.integrationProfile.situations ?? [];
}
