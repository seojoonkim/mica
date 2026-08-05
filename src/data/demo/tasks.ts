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
        translations: {
          ko: {
            title: "두 시간대에 걸친 3자 회의 일정 재조정",
            finalState:
              "세 참석자가 모두 가능한 시간에 캘린더 일정 하나가 잡히고, 각자에게 관계에 맞는 격식의 답장이 전달된다.",
            confirmationBoundary:
              "답장은 초안까지만 준비하고, 사용자의 명시적 승인 후에만 발송한다.",
          },
        },
      },
      {
        id: "ec-holiday-aware-booking",
        title: "Book a recurring slot that avoids local public holidays",
        finalState:
          "A recurring event exists with local public holidays excluded and the exclusions stated back to the user.",
        confirmationBoundary:
          "The agent may write to the user's own calendar; it may not email external parties without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "현지 공휴일을 피한 반복 일정 잡기",
            finalState:
              "현지 공휴일이 제외된 반복 일정이 등록되고, 제외한 날짜를 사용자에게 알려준다.",
            confirmationBoundary:
              "사용자 본인 캘린더에는 기록할 수 있으나, 승인 없이 외부 참석자에게 메일을 보내지 않는다.",
          },
        },
      },
      {
        id: "ec-inbox-commitment-audit",
        title: "Extract outstanding commitments from a mailbox thread set",
        finalState:
          "A list of commitments with owner, deadline and source message, with no invented items.",
        confirmationBoundary: "Read-only. No message may be sent or archived.",
        markets: ALL,
        translations: {
          ko: {
            title: "메일함 스레드에서 미이행 약속 뽑아내기",
            finalState:
              "담당자, 기한, 근거 메시지가 붙은 약속 목록. 지어낸 항목은 없다.",
            confirmationBoundary:
              "읽기 전용. 메일을 보내거나 보관 처리하지 않는다.",
          },
        },
      },
      {
        id: "ec-invite-timezone-audit",
        title: "Check an incoming invite for a timezone or DST error",
        finalState:
          "The invite's stated time resolved into the user's local timezone, with any DST or timezone mismatch named and the correct local time given.",
        confirmationBoundary:
          "Read-only. The invite is neither accepted nor declined.",
        markets: ALL,
        translations: {
          ko: {
            title: "받은 초대의 시간대·서머타임 오류 점검",
            finalState:
              "초대에 적힌 시각을 사용자의 현지 시간대로 환산하고, 시간대나 서머타임 불일치가 있으면 지적한 뒤 올바른 현지 시각을 제시한다.",
            confirmationBoundary:
              "읽기 전용. 초대를 수락하지도 거절하지도 않는다.",
          },
        },
      },
      {
        id: "ec-daily-agenda-brief",
        title: "Prepare a briefing pack for tomorrow's meetings",
        finalState:
          "Each of tomorrow's events paired with the mailbox thread it came from, the open question it needs to settle, and the attachment the user must read first.",
        confirmationBoundary:
          "Read-only. No event is modified and no reply is drafted on the user's behalf.",
        markets: ALL,
        translations: {
          ko: {
            title: "내일 일정 브리핑 자료 준비",
            finalState:
              "내일 일정마다 관련 메일 스레드, 그 자리에서 결론 내야 할 쟁점, 미리 읽어야 할 첨부를 짝지어 정리한다.",
            confirmationBoundary:
              "읽기 전용. 일정을 수정하지 않고 사용자 명의로 답장을 쓰지도 않는다.",
          },
        },
      },
      {
        id: "ec-double-booking-resolution",
        title: "Resolve two events booked over the same slot",
        finalState:
          "One event moved to a slot free for its required attendees and the other left intact, with the priority rule the agent applied stated explicitly.",
        confirmationBoundary:
          "The user's own calendar may be rewritten; attendee notifications are drafted and sent only on approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "같은 시간에 겹친 두 일정 정리",
            finalState:
              "필수 참석자가 모두 가능한 시간대로 한 일정을 옮기고 다른 일정은 그대로 두며, 어떤 우선순위 기준을 적용했는지 밝힌다.",
            confirmationBoundary:
              "사용자 본인 캘린더는 수정할 수 있다. 참석자 통지는 초안까지만 작성하고 승인 후에만 발송한다.",
          },
        },
      },
      {
        id: "ec-meeting-cancellation",
        title: "Cancel a meeting and notify every attendee",
        finalState:
          "The event removed from the user's calendar and a cancellation notice drafted for each attendee in the register their relationship warrants, including the reason and any rescheduling offer.",
        confirmationBoundary:
          "The event is removed and cancellation notices are sent only after explicit approval. External attendees are never notified silently.",
        markets: ALL,
        translations: {
          ko: {
            title: "회의 취소하고 참석자 전원에게 통지",
            finalState:
              "사용자 캘린더에서 일정을 삭제하고, 참석자별 관계에 맞는 격식으로 취소 사유와 재조율 제안을 담은 통지 초안을 작성한다.",
            confirmationBoundary:
              "일정 삭제와 취소 통지 발송은 모두 명시적 승인 후에만 진행한다. 외부 참석자에게 통보 없이 처리하지 않는다.",
          },
        },
      },
      {
        id: "ec-out-of-office-handover",
        title: "Set up an absence with a handover to a named colleague",
        finalState:
          "An auto-reply scheduled for the exact absence window in the local language and register, plus a handover note listing the threads awaiting a decision and who now owns each.",
        confirmationBoundary:
          "The auto-reply is scheduled on the user's own account; the handover note is drafted and not sent to the colleague without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "부재 설정과 동료 인수인계 준비",
            finalState:
              "부재 기간에 정확히 맞춘 자동 응답을 현지 언어와 격식으로 예약하고, 결정이 필요한 스레드와 새 담당자를 정리한 인수인계 메모를 만든다.",
            confirmationBoundary:
              "자동 응답은 사용자 계정에만 설정한다. 인수인계 메모는 초안 상태로 두고 승인 없이 동료에게 보내지 않는다.",
          },
        },
      },
      {
        id: "ec-latest-attachment-retrieval",
        title: "Identify the current version of a document in a long thread",
        finalState:
          "The most recent attachment named with its message date and sender, and any superseded versions listed so the user can see what it replaces.",
        confirmationBoundary:
          "Read-only. Nothing is forwarded, downloaded to a shared location, or replied to.",
        markets: ALL,
        translations: {
          ko: {
            title: "긴 스레드에서 최신 문서 버전 찾기",
            finalState:
              "가장 최근 첨부 파일을 메시지 날짜와 보낸 사람과 함께 특정하고, 대체된 이전 버전들도 함께 정리한다.",
            confirmationBoundary:
              "읽기 전용. 전달, 공유 위치 저장, 답장 모두 하지 않는다.",
          },
        },
      },
      {
        id: "ec-misdirected-reply-recovery",
        title: "Recover from a reply sent to the wrong recipient",
        finalState:
          "The exposure assessed against what was actually disclosed, a correction drafted for the wrong recipient and the intended one, and the recall option named as available or not for that mail system.",
        confirmationBoundary:
          "No recall is executed and no correction is sent without explicit approval; the agent never deletes the original message.",
        markets: ALL,
        translations: {
          ko: {
            title: "잘못 보낸 답장 수습",
            finalState:
              "실제로 노출된 내용 기준으로 영향 범위를 정리하고, 잘못 받은 사람과 원래 수신자 각각에게 보낼 정정 메일 초안을 만들며, 해당 메일 시스템에서 발송 취소가 가능한지 명시한다.",
            confirmationBoundary:
              "발송 취소를 실행하지 않고 정정 메일도 승인 없이 보내지 않는다. 원본 메일은 삭제하지 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "대체 규칙을 지키며 예산 안에서 장바구니 구성",
            finalState:
              "모든 조건을 만족하는 장바구니가 준비되고, 대체한 품목과 수수료를 포함한 최종 금액을 알려준다.",
            confirmationBoundary:
              "장바구니 구성과 가격 산정까지만 하고, 결제는 사용자에게 맡긴다.",
          },
        },
      },
      {
        id: "sd-local-address-delivery",
        title: "Set up delivery to a market-correct local address",
        finalState:
          "A delivery destination the local carrier will accept, including unit, note or pickup-branch detail as the market requires.",
        confirmationBoundary: "No order is placed; the prepared order is shown.",
        markets: ALL,
        translations: {
          ko: {
            title: "현지 표기 규칙에 맞는 배송지 설정",
            finalState:
              "현지 배송사가 받아들이는 배송지가 설정된다. 시장에 따라 동호수, 배송 메모, 픽업 지점 정보까지 갖춘다.",
            confirmationBoundary:
              "주문은 넣지 않고, 준비된 주문 내역만 보여준다.",
          },
        },
      },
      {
        id: "sd-failed-order-recovery",
        title: "Recover an order rejected at the fulfilment step",
        finalState:
          "Either a corrected prepared order, or an honest stop naming the blocking condition and leaving no partial state.",
        confirmationBoundary:
          "The agent may retry preparation; it may not re-attempt payment.",
        markets: ALL,
        translations: {
          ko: {
            title: "출고 단계에서 거절된 주문 복구",
            finalState:
              "수정된 주문을 다시 준비하거나, 막힌 원인을 밝히고 중간 상태를 남기지 않은 채 정직하게 중단한다.",
            confirmationBoundary:
              "주문 준비는 다시 시도할 수 있으나 결제는 재시도하지 않는다.",
          },
        },
      },
      {
        id: "sd-spec-match-sourcing",
        title: "Find an item matching an exact model specification",
        finalState:
          "Listings identified whose product page evidences the exact model or part number, with lookalike variants named and excluded for a stated reason.",
        confirmationBoundary:
          "Read-only research. Nothing is added to a cart or ordered.",
        markets: ALL,
        translations: {
          ko: {
            title: "정확한 모델 사양에 맞는 상품 찾기",
            finalState:
              "상품 페이지에서 모델명이나 부품 번호가 확인되는 판매 목록을 제시하고, 비슷해 보이지만 다른 변형 제품은 이유를 밝혀 제외한다.",
            confirmationBoundary:
              "조사만 수행한다. 장바구니 담기나 주문은 하지 않는다.",
          },
        },
      },
      {
        id: "sd-all-in-price-comparison",
        title: "Compare sellers on the true landed price",
        finalState:
          "Candidate sellers ranked by item price plus shipping, platform fee, and any import duty or handling charge, with the cheapest headline price shown as not necessarily cheapest overall.",
        confirmationBoundary:
          "Comparison only. No coupon is applied and no purchase is started.",
        markets: ALL,
        translations: {
          ko: {
            title: "최종 실구매가 기준 판매처 비교",
            finalState:
              "상품가에 배송비, 플랫폼 수수료, 관세와 통관 비용까지 더한 금액으로 판매처를 정렬하고, 표시 가격이 가장 싼 곳이 실제로는 가장 싸지 않을 수 있음을 보여준다.",
            confirmationBoundary:
              "비교만 한다. 쿠폰 적용이나 구매 진행은 하지 않는다.",
          },
        },
      },
      {
        id: "sd-delivery-window-fit",
        title: "Pick a seller who can deliver inside a hard deadline",
        finalState:
          "A seller whose stated dispatch and carrier lead time lands the parcel before the deadline, with the cut-off hour and any local holiday closure accounted for.",
        confirmationBoundary:
          "The order is prepared against the chosen window; placement and payment stay with the user.",
        markets: ALL,
        translations: {
          ko: {
            title: "마감 기한 안에 도착 가능한 판매처 선택",
            finalState:
              "출고 시각과 택배 소요일을 근거로 기한 내 도착이 가능한 판매처를 고르고, 당일 출고 마감 시각과 현지 공휴일 휴무를 반영한다.",
            confirmationBoundary:
              "선택한 배송 조건으로 주문을 준비까지만 하고, 주문 확정과 결제는 사용자가 한다.",
          },
        },
      },
      {
        id: "sd-order-modification",
        title: "Change the address or option on an order already placed",
        finalState:
          "The change applied where the seller still allows it, or the exact cut-off that has passed named together with the fallback the user can still use.",
        confirmationBoundary:
          "Any change that triggers a cancellation and reorder requires explicit approval before it is attempted.",
        markets: ALL,
        translations: {
          ko: {
            title: "이미 넣은 주문의 배송지나 옵션 변경",
            finalState:
              "판매자가 아직 변경을 허용하면 반영하고, 이미 지났다면 어떤 마감 시점을 넘겼는지와 사용자가 쓸 수 있는 대안을 알려준다.",
            confirmationBoundary:
              "취소 후 재주문이 필요한 변경은 시도 전에 명시적 승인을 받는다.",
          },
        },
      },
      {
        id: "sd-return-and-refund-prep",
        title: "Prepare a return within the seller's return window",
        finalState:
          "The applicable return window and who pays return shipping established from the seller's own policy, with the return request drafted and the pickup or drop-off route named.",
        confirmationBoundary:
          "The return is drafted, not submitted. No refund is claimed and no item is shipped without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "반품 기한 안에 반품 절차 준비",
            finalState:
              "판매자 정책에서 반품 가능 기한과 반품 배송비 부담 주체를 확인하고, 반품 신청서를 작성한 뒤 수거나 접수 경로를 정리한다.",
            confirmationBoundary:
              "반품 신청은 초안까지만 만든다. 환불을 청구하거나 승인 없이 물건을 발송하지 않는다.",
          },
        },
      },
      {
        id: "sd-undelivered-parcel-trace",
        title: "Trace a parcel marked delivered but not received",
        finalState:
          "The tracking history reconstructed to the last verifiable scan, the responsible party identified as carrier or seller, and a claim drafted to that party within its claim deadline.",
        confirmationBoundary:
          "Read-only against tracking. The claim is drafted and sent only on approval; no chargeback is initiated.",
        markets: ALL,
        translations: {
          ko: {
            title: "배송 완료로 뜨지만 받지 못한 택배 추적",
            finalState:
              "마지막으로 확인 가능한 스캔 기록까지 배송 이력을 정리하고, 책임 주체가 택배사인지 판매자인지 가린 뒤 해당 기한 안에 접수할 클레임 초안을 만든다.",
            confirmationBoundary:
              "배송 조회는 읽기 전용이다. 클레임은 승인 후에만 접수하고, 카드사 지급 거절은 진행하지 않는다.",
          },
        },
      },
      {
        id: "sd-recurring-order-cleanup",
        title: "Review recurring grocery orders and stop the unwanted ones",
        finalState:
          "Every active subscription order listed with its next charge date and amount, and the ones the household no longer uses flagged with evidence from order history.",
        confirmationBoundary:
          "Nothing is cancelled. Each stop is proposed individually for the user to confirm.",
        markets: ALL,
        translations: {
          ko: {
            title: "정기 배송 주문 점검과 불필요한 건 정리",
            finalState:
              "활성 정기 주문마다 다음 결제일과 금액을 정리하고, 주문 이력을 근거로 더 이상 쓰지 않는 항목을 표시한다.",
            confirmationBoundary:
              "해지는 하지 않는다. 건별로 해지안을 제시해 사용자가 각각 확인하게 한다.",
          },
        },
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
        translations: {
          ko: {
            title: "날짜와 예산 범위에 맞는 2구간 일정 짜기",
            finalState:
              "구간별로 실제 예약 가능한 선택지와 가격, 합계 금액, 그리고 각 선택지가 충족하는 조건을 제시한다.",
            confirmationBoundary:
              "선택지를 확보하거나 견적만 낸다. 항공권을 구매하지 않는다.",
          },
        },
      },
      {
        id: "ta-accessible-stay",
        title: "Find a stay meeting a stated accessibility requirement",
        finalState:
          "A property whose listing evidences the requirement, with the evidence quoted, not inferred.",
        confirmationBoundary: "No booking is confirmed.",
        markets: ALL,
        translations: {
          ko: {
            title: "요청한 접근성 조건을 갖춘 숙소 찾기",
            finalState:
              "숙소 정보에 해당 조건이 실제로 명시된 곳을 찾고, 추정이 아니라 원문을 인용해 근거를 제시한다.",
            confirmationBoundary: "예약을 확정하지 않는다.",
          },
        },
      },
      {
        id: "ta-disruption-replan",
        title: "Replan around a cancelled leg",
        finalState:
          "A revised plan preserving the original constraints, or a clear statement of which constraint must give.",
        confirmationBoundary: "No change fee may be incurred.",
        markets: ALL,
        translations: {
          ko: {
            title: "취소된 구간을 반영한 일정 재구성",
            finalState:
              "기존 조건을 그대로 지키는 수정 일정을 내놓거나, 어떤 조건을 포기해야 하는지 분명히 밝힌다.",
            confirmationBoundary: "변경 수수료가 발생하는 조치는 하지 않는다.",
          },
        },
      },
      {
        id: "ta-entry-requirement-check",
        title: "Check entry, visa and transit requirements for a planned route",
        finalState:
          "The visa, passport validity and transit rules for the traveller's nationality quoted from an official source with the date checked, and any requirement the source does not settle flagged as unresolved.",
        confirmationBoundary:
          "Research only. No visa application is started and no personal document is uploaded anywhere.",
        markets: ALL,
        translations: {
          ko: {
            title: "계획한 경로의 입국·비자·경유 요건 확인",
            finalState:
              "여행자 국적 기준 비자, 여권 유효기간, 경유 규정을 공식 출처에서 확인 날짜와 함께 인용하고, 출처로 확정되지 않는 요건은 미확인으로 표시한다.",
            confirmationBoundary:
              "조사만 한다. 비자 신청을 시작하지 않고 개인 서류를 어디에도 업로드하지 않는다.",
          },
        },
      },
      {
        id: "ta-fare-rule-comparison",
        title: "Compare fares on change and cancellation rules, not headline price",
        finalState:
          "Each candidate fare shown with its change fee, cancellation refundability, baggage allowance and no-show rule, so the cheapest fare is visible as the most restrictive one.",
        confirmationBoundary: "Comparison only. Nothing is held or purchased.",
        markets: ALL,
        translations: {
          ko: {
            title: "표시 가격이 아니라 변경·취소 규정으로 항공권 비교",
            finalState:
              "후보 운임마다 변경 수수료, 취소 환불 여부, 수하물 허용량, 노쇼 규정을 함께 보여주어 가장 싼 운임이 가장 제약이 많다는 점이 드러나게 한다.",
            confirmationBoundary: "비교만 한다. 좌석 확보나 구매는 하지 않는다.",
          },
        },
      },
      {
        id: "ta-stay-total-cost",
        title: "Cost a stay including taxes and on-site charges",
        finalState:
          "The nightly rate reconciled with occupancy tax, city or bath tax, resort or cleaning fee and any on-arrival cash charge, with the true total per night stated.",
        confirmationBoundary:
          "Pricing only. No reservation is held and no card is provided.",
        markets: ALL,
        translations: {
          ko: {
            title: "세금과 현장 요금까지 포함한 숙박 총비용 계산",
            finalState:
              "1박 요금에 숙박세, 도시세나 입탕세, 리조트비와 청소비, 현장 결제 항목을 더해 실제 1박당 총액을 제시한다.",
            confirmationBoundary:
              "가격 계산만 한다. 예약을 잡거나 카드 정보를 제공하지 않는다.",
          },
        },
      },
      {
        id: "ta-multi-day-ground-plan",
        title: "Build a day-by-day ground plan the schedule can actually absorb",
        finalState:
          "Each day sequenced with realistic transfer times, venue opening hours and closure days honoured, and any leg that does not fit flagged rather than compressed.",
        confirmationBoundary:
          "Planning only. No tickets, tours or transfers are booked.",
        markets: ALL,
        translations: {
          ko: {
            title: "실제로 소화 가능한 일자별 현지 동선 짜기",
            finalState:
              "이동 시간을 현실적으로 잡고 각 장소의 영업시간과 휴무일을 반영해 하루 단위로 배치하며, 시간상 불가능한 구간은 무리해서 넣지 않고 표시한다.",
            confirmationBoundary:
              "계획만 세운다. 입장권, 투어, 교통편을 예약하지 않는다.",
          },
        },
      },
      {
        id: "ta-booking-modification",
        title: "Move a confirmed booking to new dates",
        finalState:
          "The change cost calculated as fare or rate difference plus change fee, compared against cancel-and-rebook, with the cheaper route recommended and its deadline stated.",
        confirmationBoundary:
          "The change is prepared, not committed. Rebooking and cancellation both require explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "확정된 예약의 날짜 변경",
            finalState:
              "운임 차액과 변경 수수료를 합한 변경 비용을 취소 후 재예약과 비교하고, 더 저렴한 쪽을 기한과 함께 권한다.",
            confirmationBoundary:
              "변경은 준비까지만 한다. 재예약과 취소 모두 명시적 승인이 필요하다.",
          },
        },
      },
      {
        id: "ta-overbooking-recovery",
        title: "Recover a stay that the property cancelled on arrival day",
        finalState:
          "Replacement options at comparable standard within the same area and budget, plus the compensation or rehousing obligation the original booking channel owes, quoted from its terms.",
        confirmationBoundary:
          "Replacement options are presented, not booked, and no compensation claim is filed without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "당일 취소된 숙소 대체 방안 마련",
            finalState:
              "같은 지역, 비슷한 등급, 예산 범위 안의 대체 숙소를 제시하고, 예약 채널 약관에 근거해 보상이나 대체 숙소 제공 의무를 인용한다.",
            confirmationBoundary:
              "대체 숙소는 제시만 하고 예약하지 않으며, 보상 청구도 승인 없이 접수하지 않는다.",
          },
        },
      },
      {
        id: "ta-trip-refund-claim",
        title: "Assemble a delay or cancellation refund claim",
        finalState:
          "The claimable amount established from the carrier's or insurer's own terms, with the required evidence listed as held or missing and the filing deadline stated.",
        confirmationBoundary:
          "The claim pack is assembled and the claim is drafted; nothing is filed without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "지연·결항 환급 청구 자료 준비",
            finalState:
              "항공사나 보험사 약관을 근거로 청구 가능 금액을 정리하고, 필요한 증빙을 확보 여부와 함께 목록화하며 접수 기한을 밝힌다.",
            confirmationBoundary:
              "청구 자료를 모으고 신청서를 작성하는 데서 멈춘다. 명시적 승인 없이 접수하지 않는다.",
          },
        },
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
          "The reservation is confirmed only after explicit approval. If the venue requires a card hold or phone confirmation, the agent stops and hands back.",
        markets: ALL,
        translations: {
          ko: {
            title: "식이 제한이 있는 인원수 예약",
            finalState:
              "해당 식이 조건이 매장 정보로 확인되는 곳에 예약을 잡거나 예약안을 준비한다.",
            confirmationBoundary:
              "예약 확정은 명시적 승인 후에만 진행한다. 카드 보증이나 전화 확인이 필요한 매장이면 거기서 멈추고 사용자에게 넘긴다.",
          },
        },
      },
      {
        id: "rl-local-service-quote",
        title: "Obtain a quote for a home service in the local language",
        finalState:
          "A drafted enquiry in the correct language and register, with the information the provider needs to quote.",
        confirmationBoundary: "The enquiry is not sent without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "현지 언어로 가정 방문 서비스 견적 받기",
            finalState:
              "업체가 견적을 내는 데 필요한 정보를 담아 현지 언어와 격식에 맞는 문의 초안을 작성한다.",
            confirmationBoundary: "승인 없이 문의를 발송하지 않는다.",
          },
        },
      },
      {
        id: "rl-out-of-scope-detection",
        title: "Detect an out-of-scope booking and stop",
        finalState:
          "An explicit statement that the booking requires a channel outside the agent's authority, with the next step for the user.",
        confirmationBoundary:
          "No credential use and no channel outside the declared tool set.",
        markets: ALL,
        translations: {
          ko: {
            title: "권한 밖 예약임을 판단하고 중단하기",
            finalState:
              "해당 예약이 에이전트 권한 밖 채널을 요구한다는 점을 분명히 밝히고, 사용자가 이어서 할 일을 알려준다.",
            confirmationBoundary:
              "자격 증명을 사용하지 않고, 선언된 도구 외의 채널도 쓰지 않는다.",
          },
        },
      },
      {
        id: "rl-availability-verification",
        title: "Verify whether a venue actually has a slot at the requested hour",
        finalState:
          "The venue's real availability for the requested date, hour and party size established from its own booking surface, with closure days and last-order time stated.",
        confirmationBoundary:
          "Read-only. No slot is held and no reservation is started.",
        markets: ALL,
        translations: {
          ko: {
            title: "요청한 시간에 실제로 자리가 있는지 확인",
            finalState:
              "매장 자체 예약 채널에서 해당 날짜, 시간, 인원의 실제 예약 가능 여부를 확인하고 휴무일과 라스트오더 시각을 함께 밝힌다.",
            confirmationBoundary:
              "읽기 전용. 자리를 잡아두거나 예약을 시작하지 않는다.",
          },
        },
      },
      {
        id: "rl-venue-shortlist-by-evidence",
        title: "Shortlist venues against constraints with evidence per claim",
        finalState:
          "A shortlist where every claim about price band, seating, noise level or private room is traced to the listing or a dated review, with unevidenced claims omitted rather than softened.",
        confirmationBoundary:
          "Research only. No enquiry is sent and no booking is made.",
        markets: ALL,
        translations: {
          ko: {
            title: "조건별 근거를 붙인 후보 매장 추리기",
            finalState:
              "가격대, 좌석 형태, 소음, 룸 유무에 대한 모든 주장을 매장 정보나 날짜가 있는 후기에 연결한 후보 목록을 만들고, 근거가 없는 항목은 완곡하게 쓰지 말고 아예 뺀다.",
            confirmationBoundary:
              "조사만 한다. 문의를 보내거나 예약하지 않는다.",
          },
        },
      },
      {
        id: "rl-deposit-and-policy-check",
        title: "Establish the deposit, cancellation and no-show policy before booking",
        finalState:
          "The venue's deposit amount, cancellation cut-off and no-show charge quoted from its own terms, with the total exposure if the party does not turn up stated.",
        confirmationBoundary:
          "No deposit is paid and no card is authorised under any circumstances.",
        markets: ALL,
        translations: {
          ko: {
            title: "예약 전 예약금·취소·노쇼 정책 확인",
            finalState:
              "매장 약관에서 예약금, 취소 마감 시점, 노쇼 위약금을 인용하고, 방문하지 않았을 때 부담해야 할 총액을 밝힌다.",
            confirmationBoundary:
              "어떤 경우에도 예약금을 결제하거나 카드 승인을 진행하지 않는다.",
          },
        },
      },
      {
        id: "rl-group-preorder-prep",
        title: "Prepare a group set menu order ahead of the reservation",
        finalState:
          "A per-person order covering every stated dietary and allergy constraint, priced against the set menu, with the venue's pre-order deadline stated.",
        confirmationBoundary:
          "The pre-order is drafted for the user to send; the agent does not commit the party to a menu or a headcount.",
        markets: ALL,
        translations: {
          ko: {
            title: "예약 전 단체 코스 사전 주문 준비",
            finalState:
              "명시된 식이와 알레르기 조건을 모두 반영한 1인별 주문을 코스 가격 기준으로 정리하고, 매장의 사전 주문 마감 시한을 밝힌다.",
            confirmationBoundary:
              "사전 주문은 사용자가 보내도록 초안까지만 만든다. 메뉴나 인원을 대신 확정하지 않는다.",
          },
        },
      },
      {
        id: "rl-reservation-change",
        title: "Change a reservation's time or party size",
        finalState:
          "The reservation updated where the channel allows it, or the change routed to the venue as a drafted request, with the cancellation cut-off named either way.",
        confirmationBoundary:
          "Any change that forfeits a deposit requires explicit approval before it is attempted.",
        markets: ALL,
        translations: {
          ko: {
            title: "예약 시간이나 인원 변경",
            finalState:
              "예약 채널에서 변경이 가능하면 반영하고, 아니면 매장에 보낼 변경 요청 초안을 만든다. 어느 쪽이든 취소 마감 시점을 함께 알려준다.",
            confirmationBoundary:
              "예약금을 잃게 되는 변경은 시도 전에 명시적 승인을 받는다.",
          },
        },
      },
      {
        id: "rl-reservation-cancellation",
        title: "Cancel a reservation before the penalty window",
        finalState:
          "The cancellation prepared through the channel the booking was made in, timed before the penalty cut-off, with a short cancellation message drafted in the local register.",
        confirmationBoundary:
          "Cancellation is executed only on explicit approval, and the agent never cancels a booking it cannot confirm belongs to the user.",
        markets: ALL,
        translations: {
          ko: {
            title: "위약금 발생 전에 예약 취소",
            finalState:
              "예약한 채널을 통해 위약금 마감 시각 이전에 취소를 준비하고, 현지 격식에 맞는 짧은 취소 안내 문구를 함께 작성한다.",
            confirmationBoundary:
              "취소는 명시적 승인 후에만 실행하며, 사용자 본인 예약임을 확인할 수 없으면 취소하지 않는다.",
          },
        },
      },
      {
        id: "rl-walk-in-fallback",
        title: "Recover a dinner plan when every candidate is full",
        finalState:
          "A ranked fallback of walk-in-viable venues near the original location within the same price band and constraints, with each one's queue behaviour or waitlist route stated.",
        confirmationBoundary:
          "Nothing is booked and no waitlist entry is submitted on the user's behalf.",
        markets: ALL,
        translations: {
          ko: {
            title: "후보 매장이 모두 만석일 때 대안 마련",
            finalState:
              "원래 장소 근처에서 같은 가격대와 조건을 만족하는 워크인 가능 매장을 순위대로 제시하고, 각각의 대기 방식이나 웨이팅 등록 경로를 밝힌다.",
            confirmationBoundary:
              "예약하지 않으며 사용자 명의로 웨이팅을 등록하지도 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "한 달치 지출 요약과 실제 부과된 수수료 확인",
            finalState:
              "가상 계좌 기준 카테고리별 지출 내역을 정리하고, 모든 수수료와 환전 스프레드를 추정이 아니라 거래명세서에서 인용하며 명세서 기준일을 밝힌다.",
            confirmationBoundary:
              "가상 계좌에 대해 읽기 전용. 이체, 결제, 카드 관련 조치를 하지 않는다.",
          },
        },
      },
      {
        id: "mbi-deposit-fx-comparison",
        title: "Compare deposit and FX options against a stated horizon",
        finalState:
          "A comparison of named products with rate, term, fee and early-withdrawal condition sourced and dated, presented as options with no guarantee attached to any projected figure.",
        confirmationBoundary:
          "Comparison only. No account opening is initiated and no transfer is prepared beyond the user's explicit final approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "설정한 기간에 맞춘 예금·환전 상품 비교",
            finalState:
              "상품별 금리, 기간, 수수료, 중도해지 조건을 출처와 기준일과 함께 비교하고, 어떤 예상 수치에도 보장을 붙이지 않은 선택지로 제시한다.",
            confirmationBoundary:
              "비교만 한다. 계좌 개설을 시작하지 않으며, 사용자의 명시적 최종 승인 없이는 이체를 준비하지 않는다.",
          },
        },
      },
      {
        id: "mbi-portfolio-risk-summary",
        title: "Summarise concentration and risk exposure in a synthetic portfolio",
        finalState:
          "Exposure by asset class, currency and single-name concentration over a synthetic portfolio, with risk stated as observed exposure and never as a suitability judgement about the user.",
        confirmationBoundary:
          "Read-only. No trade is placed and no order ticket is submitted.",
        markets: ALL,
        translations: {
          ko: {
            title: "가상 포트폴리오의 집중도와 리스크 노출 정리",
            finalState:
              "가상 포트폴리오를 자산군, 통화, 개별 종목 집중도별로 분해해 제시하고, 리스크는 관찰된 노출로만 서술하며 사용자에 대한 적합성 판단으로 표현하지 않는다.",
            confirmationBoundary:
              "읽기 전용. 매매를 체결하지 않고 주문표도 제출하지 않는다.",
          },
        },
      },
      {
        id: "mbi-order-to-approval-boundary",
        title: "Prepare an ETF order up to the final approval boundary",
        finalState:
          "A fully specified draft order — instrument, quantity, order type, all-in cost, and the applicable risk and fee disclosures — held unsubmitted against synthetic holdings, with explicit final approval named as the only route to execution.",
        confirmationBoundary:
          "No order is submitted. Buys, sells, transfers and account opening require explicit final approval and are never executed in fixtures.",
        markets: ALL,
        translations: {
          ko: {
            title: "최종 승인 직전까지 ETF 주문 준비",
            finalState:
              "종목, 수량, 주문 유형, 총비용, 관련 리스크와 수수료 고지를 모두 채운 주문 초안을 가상 보유 자산 기준으로 미제출 상태로 두고, 실행 경로는 명시적 최종 승인뿐임을 밝힌다.",
            confirmationBoundary:
              "주문을 제출하지 않는다. 매수, 매도, 이체, 계좌 개설은 명시적 최종 승인이 필요하며 픽스처에서는 실행되지 않는다.",
          },
        },
      },
      {
        id: "mbi-subscription-charge-audit",
        title: "Identify recurring card charges the user no longer recognises",
        finalState:
          "Recurring debits on the synthetic account grouped by merchant with first-seen date, amount drift and the likely service named from the descriptor, with unidentifiable descriptors left unidentified.",
        confirmationBoundary:
          "Read-only over the synthetic account. No card is blocked, no transfer is made, and no merchant is contacted.",
        markets: ALL,
        translations: {
          ko: {
            title: "기억나지 않는 카드 정기 결제 찾아내기",
            finalState:
              "가상 계좌의 정기 출금을 가맹점별로 묶어 최초 결제일, 금액 변동, 결제 문구에서 추정되는 서비스명을 정리하고, 식별이 안 되는 문구는 미확인으로 남긴다.",
            confirmationBoundary:
              "가상 계좌에 대해 읽기 전용. 카드를 정지하지 않고 이체도 하지 않으며 가맹점에 연락하지 않는다.",
          },
        },
      },
      {
        id: "mbi-cross-border-transfer-quote",
        title: "Cost a cross-border transfer across providers on the all-in rate",
        finalState:
          "Named providers compared on the FX rate actually applied, sending and receiving fees, and expected arrival time, with the amount landing in the recipient's currency stated for each and the quote timestamped.",
        confirmationBoundary:
          "Quotation only. No transfer is initiated, and execution would require explicit final approval by the user.",
        markets: ALL,
        translations: {
          ko: {
            title: "해외 송금 실질 비용을 업체별로 비교",
            finalState:
              "업체별로 실제 적용 환율, 송금 수수료와 수취 수수료, 예상 소요 시간을 비교하고, 수취인 통화 기준 실수령액과 견적 시각을 함께 제시한다.",
            confirmationBoundary:
              "견적만 낸다. 이체를 시작하지 않으며, 실행하려면 사용자의 명시적 최종 승인이 필요하다.",
          },
        },
      },
      {
        id: "mbi-card-fee-and-limit-review",
        title: "Reconcile card statement charges against the product's fee schedule",
        finalState:
          "Each fee on the synthetic statement matched to the clause in the published fee schedule that authorises it, with any charge lacking a matching clause flagged as disputable and the dispute window stated.",
        confirmationBoundary:
          "Read-only. No dispute is filed, no order or payment instruction is created, and no card limit is changed.",
        markets: ALL,
        translations: {
          ko: {
            title: "카드 명세서 청구 항목과 수수료 약관 대조",
            finalState:
              "가상 명세서의 각 수수료를 공시된 수수료 약관의 근거 조항과 연결하고, 근거 조항이 없는 청구는 이의 제기 대상으로 표시하며 이의 신청 기한을 밝힌다.",
            confirmationBoundary:
              "읽기 전용. 이의를 접수하지 않고 주문이나 결제 지시를 만들지 않으며 카드 한도도 변경하지 않는다.",
          },
        },
      },
      {
        id: "mbi-recurring-payment-schedule-prep",
        title: "Prepare a monthly transfer schedule up to the approval boundary",
        finalState:
          "A dated schedule of transfers between synthetic accounts sized to the stated savings goal, with each date checked against the account's cut-off hour and local banking holidays, held unsubmitted.",
        confirmationBoundary:
          "No transfer is scheduled or executed. The schedule takes effect only on the user's explicit final approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "승인 직전까지 월 자동이체 일정 준비",
            finalState:
              "저축 목표에 맞춘 가상 계좌 간 이체 일정을 날짜별로 짜고, 각 날짜를 이체 마감 시각과 현지 은행 휴무일에 비추어 확인한 뒤 미실행 상태로 둔다.",
            confirmationBoundary:
              "이체를 예약하거나 실행하지 않는다. 사용자의 명시적 최종 승인이 있어야만 일정이 발효된다.",
          },
        },
      },
      {
        id: "mbi-standing-order-cancellation-prep",
        title: "Prepare cancellation of a standing order or automatic debit",
        finalState:
          "The mandate identified with its next debit date, the cancellation route and notice period taken from the provider's terms, and the downstream effect of stopping it stated.",
        confirmationBoundary:
          "Nothing is cancelled. No transfer, trade or account change is made, and cancellation proceeds only on explicit final approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "자동이체 해지 절차 준비",
            finalState:
              "해당 자동이체 건과 다음 출금일을 특정하고, 약관에서 해지 경로와 통지 기간을 확인하며, 중단했을 때 뒤따르는 영향을 밝힌다.",
            confirmationBoundary:
              "해지를 실행하지 않는다. 이체나 매매, 계좌 변경을 하지 않으며 해지는 명시적 최종 승인 후에만 진행한다.",
          },
        },
      },
      {
        id: "mbi-failed-payment-recovery",
        title: "Diagnose a failed payment and prepare a clean retry",
        finalState:
          "The failure attributed to a specific cause such as insufficient balance, an expired mandate, a daily limit or a fraud block, with confirmation of whether the synthetic account was debited and a retry prepared that avoids a double charge.",
        confirmationBoundary:
          "No retry is executed. No transfer is sent and no limit is raised without the user's explicit final approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "결제 실패 원인 진단과 안전한 재시도 준비",
            finalState:
              "잔액 부족, 만료된 출금 동의, 일일 한도, 이상거래 차단 등 구체적 원인을 짚고, 가상 계좌에서 실제 출금이 있었는지 확인한 뒤 이중 청구가 나지 않는 재시도안을 준비한다.",
            confirmationBoundary:
              "재시도를 실행하지 않는다. 사용자의 명시적 최종 승인 없이 이체를 보내거나 한도를 올리지 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "도착 시각이 정해진 문전 대 문전 경로 계획",
            finalState:
              "일반 시각표가 아니라 실제 출발 시간대에 유효한 경로가 나오고, 이용 노선명, 환승 지점, 총 요금, 도착 여유 시간이 함께 제시된다.",
            confirmationBoundary:
              "계획 수립까지만 한다. 차량을 호출하지 않고 요금도 결제하지 않는다.",
          },
        },
      },
      {
        id: "mt-accessible-journey",
        title: "Plan a step-free journey with a stated mobility requirement",
        finalState:
          "A route whose step-free status is evidenced per station or stop, with any unverified segment named as unverified rather than assumed.",
        confirmationBoundary: "Read-only. Nothing is booked.",
        markets: ALL,
        translations: {
          ko: {
            title: "이동 약자 조건을 반영한 계단 없는 경로 계획",
            finalState:
              "역과 정류장마다 계단 없는 이동이 가능한지 근거와 함께 확인되고, 확인되지 않은 구간은 추정하지 않고 미확인으로 표시된다.",
            confirmationBoundary: "조회만 한다. 아무것도 예약하지 않는다.",
          },
        },
      },
      {
        id: "mt-fare-card-topup-prep",
        title: "Prepare a stored-value transit card top-up for a trip length",
        finalState:
          "The card's current balance, the fare total for the planned trips, the shortfall, and the top-up channels that actually accept the user's payment method, with any minimum or increment rule stated.",
        confirmationBoundary:
          "Preparation only. No top-up is charged without explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "여정 기간에 맞춘 교통카드 충전 준비",
            finalState:
              "카드 잔액, 예정 이동의 총 요금, 부족액, 사용자의 결제 수단을 실제로 받아주는 충전 창구가 정리되고, 최소 충전액이나 충전 단위 규칙도 함께 명시된다.",
            confirmationBoundary:
              "준비까지만 한다. 사용자의 명시적 승인 없이 충전 결제를 하지 않는다.",
          },
        },
      },
      {
        id: "mt-airport-transfer-plan",
        title: "Plan an airport transfer with luggage and a check-in cutoff",
        finalState:
          "A transfer plan that works with the stated luggage volume, meets the airline's check-in cutoff with a stated buffer, and names the fare and the last usable departure for each option.",
        confirmationBoundary:
          "Planning only. No airport transfer or ride is booked.",
        markets: ALL,
        translations: {
          ko: {
            title: "수하물과 탑승 수속 마감을 고려한 공항 이동 계획",
            finalState:
              "명시된 수하물 양으로 실행 가능하고 항공사 수속 마감 시각을 여유 시간과 함께 지키는 이동안이 나오며, 각 선택지의 요금과 이용 가능한 마지막 출발 시각이 제시된다.",
            confirmationBoundary:
              "계획 수립까지만 한다. 공항 이동편이나 차량을 예약하지 않는다.",
          },
        },
      },
      {
        id: "mt-ride-booking-approval",
        title: "Take a ride or transit booking up to the confirmation button",
        finalState:
          "A single selected option with the pickup point, vehicle or service class, total price including surcharges, and cancellation terms restated to the user before anything is confirmed.",
        confirmationBoundary:
          "The agent stops at the confirmation step. Booking and payment happen only on explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "확정 버튼 직전까지 진행하는 차량 또는 교통편 예약",
            finalState:
              "선택한 옵션 하나에 대해 탑승 지점, 차량 또는 서비스 등급, 할증 포함 총액, 취소 규정이 확정 전에 사용자에게 다시 제시된다.",
            confirmationBoundary:
              "확정 단계에서 멈춘다. 예약과 결제는 사용자의 명시적 승인이 있을 때만 진행한다.",
          },
        },
      },
      {
        id: "mt-booking-change-request",
        title: "Change the departure on an already booked intercity ticket",
        finalState:
          "The target departure identified as available, with the change fee, any fare difference, the change deadline and what happens to the original seat all stated before action.",
        confirmationBoundary:
          "The change is prepared and priced, not submitted. The user approves before the booking is modified.",
        markets: ALL,
        translations: {
          ko: {
            title: "이미 예약한 도시 간 교통편의 출발 시간 변경",
            finalState:
              "변경하려는 출발편의 좌석 가능 여부와 함께 변경 수수료, 운임 차액, 변경 마감 시각, 기존 좌석 처리 방식이 실행 전에 모두 제시된다.",
            confirmationBoundary:
              "변경안을 준비하고 비용까지만 산정한다. 사용자의 승인 후에 예약을 변경한다.",
          },
        },
      },
      {
        id: "mt-cancel-and-refund",
        title: "Cancel a transit reservation and establish the refund outcome",
        finalState:
          "The applicable cancellation tier identified by time of cancellation, the refundable amount and non-refundable fees itemised, and the refund route and expected timing stated.",
        confirmationBoundary:
          "Cancellation is destructive and is not performed without explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "교통편 예약 취소와 환불 결과 확인",
            finalState:
              "취소 시점에 적용되는 위약 구간을 확인해 환불 가능 금액과 환불되지 않는 수수료를 항목별로 정리하고, 환불 경로와 예상 소요 기간을 제시한다.",
            confirmationBoundary:
              "취소는 되돌릴 수 없으므로 사용자의 명시적 승인 없이 실행하지 않는다.",
          },
        },
      },
      {
        id: "mt-disruption-rerouting",
        title: "Reroute around a live service suspension mid-journey",
        finalState:
          "A replacement route from the user's current position that accounts for the suspended segment, with the added time and cost stated and any officially provided substitute service named.",
        confirmationBoundary:
          "The agent proposes options and does not book or pay for a replacement without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "이동 중 운행 중단 발생 시 우회 경로 재설정",
            finalState:
              "현재 위치에서 출발하는 대체 경로가 중단 구간을 반영해 제시되고, 추가 소요 시간과 비용, 공식 대체 운송 수단 여부가 함께 명시된다.",
            confirmationBoundary:
              "선택지를 제안하는 데 그치고, 승인 없이 대체 수단을 예약하거나 결제하지 않는다.",
          },
        },
      },
      {
        id: "mt-last-service-recovery",
        title: "Recover a plan that misses the last scheduled service",
        finalState:
          "An alternative that gets the user home with its cost stated, or an honest statement that no service remains and what the fallback costs.",
        confirmationBoundary:
          "The agent may compare options; it may not confirm a ride booking.",
        markets: ALL,
        translations: {
          ko: {
            title: "막차를 놓친 상황에서의 귀가 계획 복구",
            finalState:
              "비용이 명시된 귀가 대안이 제시되거나, 남은 운행편이 없다는 사실과 대체 수단의 비용이 솔직하게 전달된다.",
            confirmationBoundary:
              "선택지를 비교할 수는 있으나 차량 예약을 확정하지 않는다.",
          },
        },
      },
      {
        id: "mt-lost-item-report-draft",
        title: "Draft a lost-item report for the correct operator",
        finalState:
          "A report addressed to the operator that actually holds the item, naming the service, date, time window, boarding and alighting points, and the item description, with the operator's claim deadline stated.",
        confirmationBoundary:
          "The report is drafted and shown; it is not submitted without explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "올바른 운영사 앞으로 분실물 신고서 작성",
            finalState:
              "실제로 물품을 보관하는 운영사를 특정해 노선, 날짜, 시간대, 승하차 지점, 물품 설명이 담긴 신고서 초안이 작성되고, 해당 운영사의 신고 기한이 함께 안내된다.",
            confirmationBoundary:
              "신고서는 초안까지만 작성해 보여준다. 사용자의 명시적 승인 없이 제출하지 않는다.",
          },
        },
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
        id: "ha-provider-coverage-research",
        title: "Find providers that accept the user's insurance and language needs",
        finalState:
          "A shortlist of providers with each one's network or coverage status, consultation language support, opening hours and booking channel evidenced from an official listing rather than assumed.",
        confirmationBoundary:
          "Research only. No appointment is made, and the agent gives no clinical opinion on which care is needed.",
        markets: ALL,
        translations: {
          ko: {
            title: "보험 적용과 언어 지원이 되는 의료기관 조사",
            finalState:
              "후보 의료기관마다 보험 적용 여부, 진료 가능 언어, 진료 시간, 예약 경로가 공식 안내를 근거로 확인되어 정리된다.",
            confirmationBoundary:
              "조사만 한다. 예약하지 않으며, 어떤 진료가 필요한지에 대한 의학적 판단은 하지 않는다.",
          },
        },
      },
      {
        id: "ha-cost-estimate-breakdown",
        title: "Build a cost estimate for a scheduled administrative procedure",
        finalState:
          "The published price components itemised into insured and self-paid portions with the user's deductible or co-payment applied, and every figure traced to a published fee schedule with its date.",
        confirmationBoundary:
          "Estimate only. No payment is made and no clinical recommendation is offered.",
        markets: ALL,
        translations: {
          ko: {
            title: "예정된 진료 항목의 비용 견적 산출",
            finalState:
              "공시된 항목별 금액을 보험 적용분과 본인 부담분으로 나누고 자기부담금과 본인부담률을 반영해 계산하며, 모든 금액의 출처 자료와 기준일을 함께 표시한다.",
            confirmationBoundary:
              "견적 산출까지만 한다. 결제하지 않으며 진료에 대한 권고도 하지 않는다.",
          },
        },
      },
      {
        id: "ha-appointment-scheduling",
        title: "Schedule an appointment against a stated availability window",
        finalState:
          "A prepared appointment at a provider open in the requested window, with the preparation steps and documents the provider requires listed.",
        confirmationBoundary:
          "Administrative only. The agent does not interpret symptoms, suggest a diagnosis, or advise on treatment; booking is confirmed by the user.",
        markets: ALL,
        translations: {
          ko: {
            title: "가능 시간대에 맞춘 진료 예약 준비",
            finalState:
              "요청한 시간대에 진료하는 기관으로 예약안이 준비되고, 해당 기관이 요구하는 준비 절차와 지참 서류가 함께 정리된다.",
            confirmationBoundary:
              "행정 업무만 수행한다. 증상 해석, 진단 추정, 치료 조언을 하지 않으며 예약 확정은 사용자가 한다.",
          },
        },
      },
      {
        id: "ha-visit-preparation-pack",
        title: "Prepare a visit pack of documents and administrative steps",
        finalState:
          "A dated pre-visit checklist covering identity and insurance documents, referral paperwork, registration deadline and payment method accepted at that provider, each item marked present or missing.",
        confirmationBoundary:
          "Preparation only. The agent handles paperwork, not preparation instructions that would constitute medical advice.",
        markets: ALL,
        translations: {
          ko: {
            title: "내원 준비 서류와 행정 절차 정리",
            finalState:
              "신분증과 보험 서류, 의뢰서, 접수 마감 시각, 해당 기관에서 받는 결제 수단을 날짜 순서로 정리한 준비 목록이 만들어지고 각 항목의 준비 여부가 표시된다.",
            confirmationBoundary:
              "행정 준비만 한다. 의학적 조언에 해당하는 준비 지침은 다루지 않는다.",
          },
        },
      },
      {
        id: "ha-records-request-draft",
        title: "Draft a medical records or referral request in the local register",
        finalState:
          "A drafted request naming the correct recipient, identifiers and legal basis for the market, in the local language and register.",
        confirmationBoundary:
          "The request is drafted and shown; it is not sent, and no health data is transmitted without approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "현지 격식에 맞는 진료기록 또는 의뢰서 발급 요청 작성",
            finalState:
              "정확한 수신처, 식별 정보, 해당 시장의 법적 근거를 담은 요청서가 현지 언어와 격식으로 작성된다.",
            confirmationBoundary:
              "요청서는 초안까지만 작성해 보여준다. 발송하지 않으며 승인 없이 건강 정보를 전송하지 않는다.",
          },
        },
      },
      {
        id: "ha-insurance-claim-pack",
        title: "Assemble a reimbursement claim pack from synthetic documents",
        finalState:
          "A checklist of required forms and receipts with each item marked present or missing against the market's claim rules, with nothing inferred to fill a gap.",
        confirmationBoundary:
          "The claim is assembled, not submitted. No clinical content is authored or restated as advice.",
        markets: ALL,
        translations: {
          ko: {
            title: "가상 서류로 보험금 청구 서류 묶음 구성",
            finalState:
              "해당 시장의 청구 규정에 따라 필요한 서식과 영수증 목록이 만들어지고 항목마다 준비 여부가 표시되며, 빠진 항목을 추정으로 채우지 않는다.",
            confirmationBoundary:
              "서류를 구성하는 데 그치고 제출하지 않는다. 진료 내용을 새로 작성하거나 조언처럼 다시 설명하지 않는다.",
          },
        },
      },
      {
        id: "ha-appointment-reschedule",
        title: "Move an existing appointment to a new slot within a rule window",
        finalState:
          "A new slot identified that satisfies the provider's rescheduling notice rule, with the late-change fee, the effect on any referral validity and the old slot's release all stated before action.",
        confirmationBoundary:
          "The change is prepared, not committed. The user approves before the existing appointment is altered.",
        markets: ALL,
        translations: {
          ko: {
            title: "규정 기한 안에서 기존 예약 시간 변경",
            finalState:
              "의료기관의 변경 통보 기한을 충족하는 새 시간대를 찾고, 지연 변경 수수료, 의뢰서 유효기간에 미치는 영향, 기존 예약의 반환 처리를 실행 전에 모두 제시한다.",
            confirmationBoundary:
              "변경안을 준비할 뿐 확정하지 않는다. 기존 예약을 바꾸기 전에 사용자의 승인을 받는다.",
          },
        },
      },
      {
        id: "ha-appointment-cancellation",
        title: "Cancel an appointment and settle the administrative consequences",
        finalState:
          "The cancellation window checked against the current time, the no-show or late-cancellation charge stated, and the follow-up steps for any linked referral or prepayment listed.",
        confirmationBoundary:
          "Cancellation is destructive and happens only on explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "진료 예약 취소와 행정 후속 처리",
            finalState:
              "현재 시각 기준으로 취소 가능 기한을 확인하고 미방문 또는 지연 취소 수수료를 제시하며, 연결된 의뢰서나 선결제에 대한 후속 조치를 정리한다.",
            confirmationBoundary:
              "취소는 되돌릴 수 없으므로 사용자의 명시적 승인이 있을 때만 실행한다.",
          },
        },
      },
      {
        id: "ha-portal-booking-approval",
        title: "Drive a provider portal booking up to the confirmation step",
        finalState:
          "Every portal field filled from the user's own records, with the selected slot, provider, department and any prepayment amount restated for review while the confirm action remains untaken.",
        confirmationBoundary:
          "The agent stops at the confirm button and does not submit personal or health data or make a payment without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "의료기관 예약 시스템에서 확정 직전까지 입력",
            finalState:
              "사용자 본인 자료를 근거로 예약 시스템의 모든 항목을 채우고, 선택한 시간대, 기관, 진료과, 선결제 금액을 확인용으로 다시 제시한 채 확정 동작은 실행하지 않는다.",
            confirmationBoundary:
              "확정 버튼 앞에서 멈춘다. 명시적 승인 없이 개인정보나 건강 정보를 제출하거나 결제하지 않는다.",
          },
        },
      },
      {
        id: "ha-claim-rejection-recovery",
        title: "Diagnose a rejected reimbursement claim and prepare a resubmission",
        finalState:
          "The insurer's stated rejection reason mapped to the specific missing or mismatched document, a corrected claim pack assembled, and the appeal or resubmission deadline named.",
        confirmationBoundary:
          "The corrected pack is prepared, not submitted. The agent explains the administrative defect and never reinterprets clinical content.",
        markets: ALL,
        translations: {
          ko: {
            title: "보험금 청구 반려 원인 파악과 재청구 준비",
            finalState:
              "보험사가 밝힌 반려 사유를 누락되거나 불일치한 서류와 정확히 연결하고, 보완한 청구 서류 묶음을 구성하며, 이의신청 또는 재청구 기한을 함께 제시한다.",
            confirmationBoundary:
              "보완 서류를 준비하는 데 그치고 제출하지 않는다. 행정상의 결함만 설명하고 진료 내용을 재해석하지 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "자격 요건 판단과 필요 서류 일체 정리",
            finalState:
              "적용 근거 규정을 공식 출처에서 판 번호 또는 시행일과 함께 인용하고, 서류 목록에 준비 여부를 표시하며, 판단이 갈리는 요건은 임의로 결론짓지 않고 표시해 둔다.",
            confirmationBoundary: "조사와 준비까지만 한다. 어떤 서류도 접수하지 않는다.",
          },
        },
      },
      {
        id: "gc-deadline-and-fee-research",
        title: "Establish the statutory deadline and fee schedule for a procedure",
        finalState:
          "The filing deadline, any grace period, the late penalty and the current fee each quoted from an official notice with its effective date, and the accepted payment channels named.",
        confirmationBoundary:
          "Research only. No fee is paid and no filing is started.",
        markets: ALL,
        translations: {
          ko: {
            title: "행정 절차의 법정 기한과 수수료 확인",
            finalState:
              "신청 기한, 유예 기간, 지연 시 가산금, 현재 수수료를 각각 공식 고시와 시행일을 근거로 제시하고, 납부 가능한 결제 수단을 함께 정리한다.",
            confirmationBoundary:
              "조사만 한다. 수수료를 납부하지 않고 신청도 시작하지 않는다.",
          },
        },
      },
      {
        id: "gc-office-and-channel-research",
        title: "Identify the competent office and the correct filing channel",
        finalState:
          "The office with jurisdiction over the user's registered address identified, with the online, postal and in-person channels compared on eligibility, processing time and identity requirements, each traced to an official page.",
        confirmationBoundary:
          "Research only. No account is created and nothing is filed.",
        markets: ALL,
        translations: {
          ko: {
            title: "관할 기관과 올바른 신청 창구 확인",
            finalState:
              "사용자 주소지를 관할하는 기관을 특정하고 온라인, 우편, 방문 창구를 이용 자격, 처리 기간, 본인확인 요건 기준으로 비교하며 각 내용을 공식 안내 출처와 연결한다.",
            confirmationBoundary:
              "조사만 한다. 계정을 만들지 않고 아무것도 접수하지 않는다.",
          },
        },
      },
      {
        id: "gc-document-certification-prep",
        title: "Prepare translation, notarisation and apostille steps for documents",
        finalState:
          "Each supporting document mapped to the certification it needs, with the accepted issuers, the validity period of each certificate and the ordering of steps so nothing expires before filing.",
        confirmationBoundary:
          "Preparation only. No certification service is ordered or paid for without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "제출 서류의 번역, 공증, 아포스티유 절차 준비",
            finalState:
              "서류마다 필요한 인증 종류와 인정되는 발급 기관, 각 인증의 유효 기간이 정리되고, 접수 전에 유효기간이 지나지 않도록 처리 순서가 배치된다.",
            confirmationBoundary:
              "준비까지만 한다. 명시적 승인 없이 인증 서비스를 신청하거나 결제하지 않는다.",
          },
        },
      },
      {
        id: "gc-form-preparation",
        title: "Prepare an official form up to the submission boundary",
        finalState:
          "A completed draft of the current form version with every field traced to a source document and unresolved fields left explicitly blank.",
        confirmationBoundary:
          "The agent stops before any legally binding submission. Submission occurs only on explicit user approval and only where the controlled track permits it.",
        markets: ALL,
        translations: {
          ko: {
            title: "제출 직전 단계까지 공식 서식 작성",
            finalState:
              "현재 유효한 판의 서식이 초안으로 완성되고 모든 항목이 근거 서류와 연결되며, 확정할 수 없는 항목은 비워 둔 채로 표시된다.",
            confirmationBoundary:
              "법적 효력이 발생하는 제출 직전에 멈춘다. 제출은 사용자의 명시적 승인이 있고 통제된 환경에서 허용될 때만 이루어진다.",
          },
        },
      },
      {
        id: "gc-civic-appointment",
        title: "Book a public-office appointment within a deadline",
        finalState:
          "A prepared appointment at the correct office for the procedure, with the deadline, required identity documents and fee stated.",
        confirmationBoundary:
          "No identity credential is used and no binding declaration is made on the user's behalf.",
        markets: ALL,
        translations: {
          ko: {
            title: "기한 내 관공서 방문 예약 준비",
            finalState:
              "해당 절차를 처리하는 정확한 기관으로 예약안이 준비되고, 기한과 필요한 신분 증명 서류, 수수료가 함께 제시된다.",
            confirmationBoundary:
              "본인 인증 수단을 사용하지 않으며 사용자를 대신해 법적 효력이 있는 신고를 하지 않는다.",
          },
        },
      },
      {
        id: "gc-appointment-reschedule",
        title: "Move a public-office appointment without losing the deadline",
        finalState:
          "A new slot found that still falls inside the statutory deadline, with the rescheduling rule, the number of changes already used and the consequence of missing the deadline stated.",
        confirmationBoundary:
          "The change is prepared, not committed. The user approves before the existing appointment is altered.",
        markets: ALL,
        translations: {
          ko: {
            title: "법정 기한을 지키면서 관공서 방문 예약 변경",
            finalState:
              "법정 기한 안에 들어오는 새 예약 시간을 찾고, 변경 규정과 이미 사용한 변경 횟수, 기한을 넘겼을 때의 결과를 함께 제시한다.",
            confirmationBoundary:
              "변경안을 준비할 뿐 확정하지 않는다. 기존 예약을 바꾸기 전에 사용자의 승인을 받는다.",
          },
        },
      },
      {
        id: "gc-application-withdrawal",
        title: "Withdraw a pending application and state what is lost",
        finalState:
          "The withdrawal route for that procedure identified, with the refundable and non-refundable portions of the fee, the effect on any queue position or priority date, and whether reapplication is restricted.",
        confirmationBoundary:
          "Withdrawal is destructive and irreversible; it is not performed without explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "진행 중인 신청 취하와 그에 따른 손실 확인",
            finalState:
              "해당 절차의 취하 방법을 확인하고 환급되는 수수료와 환급되지 않는 부분, 대기 순번이나 우선일에 미치는 영향, 재신청 제한 여부를 함께 제시한다.",
            confirmationBoundary:
              "취하는 되돌릴 수 없으므로 사용자의 명시적 승인 없이 실행하지 않는다.",
          },
        },
      },
      {
        id: "gc-submission-approval-gate",
        title: "Hold a completed online filing at the final submit screen",
        finalState:
          "The portal filled from the prepared draft, with the declaration text, the attached files, the fee to be charged and the legal effect of submitting all restated to the user while the submit action remains untaken.",
        confirmationBoundary:
          "The agent never presses submit, never signs a declaration and never uses an identity credential; the user completes the binding step.",
        markets: ALL,
        translations: {
          ko: {
            title: "온라인 신청을 최종 제출 화면에서 정지",
            finalState:
              "준비한 초안으로 신청 화면을 모두 채운 뒤 서약 문구, 첨부 파일, 부과될 수수료, 제출의 법적 효력을 사용자에게 다시 제시하고 제출 동작은 실행하지 않는다.",
            confirmationBoundary:
              "제출 버튼을 누르지 않고 서약에 서명하지 않으며 본인 인증 수단을 사용하지 않는다. 법적 효력이 생기는 단계는 사용자가 직접 마무리한다.",
          },
        },
      },
      {
        id: "gc-rejection-recovery",
        title: "Diagnose a rejected filing and prepare a corrected resubmission",
        finalState:
          "The official rejection reason mapped to the specific defective field or missing document, a corrected draft prepared, and the appeal window and resubmission deadline quoted from the notice.",
        confirmationBoundary:
          "The corrected filing is prepared, not submitted, and no appeal is lodged without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "반려된 신청의 원인 분석과 보완 재신청 준비",
            finalState:
              "공식 반려 사유를 문제가 된 항목이나 누락 서류와 정확히 연결하고 보완한 초안을 준비하며, 통지서에 적힌 이의신청 기간과 재신청 기한을 인용해 제시한다.",
            confirmationBoundary:
              "보완 신청서를 준비하는 데 그치고 제출하지 않으며, 명시적 승인 없이 이의신청을 제기하지 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "평소와 다른 공과금 고지서를 사용 이력과 대조해 설명",
            finalState:
              "증가분을 요금제 변경, 사용량 변화, 일회성 청구로 나누어 설명하고 각 항목을 고지서의 특정 줄과 연결한다.",
            confirmationBoundary: "조회만 한다. 요금을 납부하지 않고 요금제도 바꾸지 않는다.",
          },
        },
      },
      {
        id: "hu-tariff-comparison",
        title: "Compare tariffs for the household's actual usage profile",
        finalState:
          "Named tariffs costed against the household's real usage, including standing charges, exit fees and the date each price was sourced.",
        confirmationBoundary:
          "Comparison only. No switch is initiated without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "실제 사용 패턴 기준으로 요금제 비교",
            finalState:
              "실제 사용량을 기준으로 개별 요금제의 총액을 계산하고 기본료, 중도 해지 위약금, 각 가격을 확인한 날짜를 함께 제시한다.",
            confirmationBoundary:
              "비교만 한다. 명시적 승인 없이 요금제 변경을 진행하지 않는다.",
          },
        },
      },
      {
        id: "hu-meter-reading-submission",
        title: "Prepare a meter reading submission before the billing cut-off",
        finalState:
          "The reading recorded with its date, checked for plausibility against the previous reading, and matched to the provider's submission window and channel.",
        confirmationBoundary:
          "The reading is prepared, not submitted. Submission happens only on explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "검침 마감 전 계량기 지침 제출 준비",
            finalState:
              "검침값과 검침일을 기록하고 직전 지침과 비교해 이상 여부를 확인하며, 사업자의 제출 기간과 제출 창구에 맞춘다.",
            confirmationBoundary:
              "제출안을 준비할 뿐 접수하지 않는다. 제출은 명시적 승인이 있을 때만 진행한다.",
          },
        },
      },
      {
        id: "hu-payment-method-update",
        title: "Update the direct debit or card on a utility account",
        finalState:
          "The current payment method and next charge date identified, the replacement details validated, and the first cycle the new method takes effect stated.",
        confirmationBoundary:
          "The change is prepared and shown to the user. It is applied only on explicit approval, and no payment is made.",
        markets: ALL,
        translations: {
          ko: {
            title: "공과금 계정의 자동이체 또는 카드 정보 변경",
            finalState:
              "현재 결제 수단과 다음 출금일을 확인하고 새 결제 정보의 유효성을 검증하며, 변경이 적용되는 첫 청구 주기를 명시한다.",
            confirmationBoundary:
              "변경안을 준비해 사용자에게 보여 준다. 명시적 승인이 있을 때만 적용하고 결제는 하지 않는다.",
          },
        },
      },
      {
        id: "hu-supplier-switch-execution",
        title: "Hold a supplier switch at the final confirmation step",
        finalState:
          "The switch form completed with the chosen tariff, the supply start date, the cooling-off period and the exit fee on the old contract all restated while the confirm action remains untaken.",
        confirmationBoundary:
          "A switch is contractual. The agent never confirms it; the user completes the binding step.",
        markets: ALL,
        translations: {
          ko: {
            title: "공급사 변경을 최종 확인 단계에서 정지",
            finalState:
              "선택한 요금제, 공급 개시일, 청약 철회 기간, 기존 계약의 해지 위약금을 모두 다시 제시한 상태로 신청 화면을 채우고 확정 버튼은 누르지 않는다.",
            confirmationBoundary:
              "공급사 변경은 계약 행위이므로 상담원이 확정하지 않는다. 계약이 성립하는 단계는 사용자가 직접 마무리한다.",
          },
        },
      },
      {
        id: "hu-repair-appointment",
        title: "Arrange a repair visit for a specific fault",
        finalState:
          "The fault described with symptoms and timing, the responsible party identified between landlord, provider and the household, and a visit slot prepared with the callout fee and access requirements stated.",
        confirmationBoundary:
          "The booking request is drafted, not sent, and no chargeable callout is ordered without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "특정 고장에 대한 수리 방문 예약 준비",
            finalState:
              "증상과 발생 시점을 정리해 고장을 설명하고 임대인, 사업자, 세대 중 책임 주체를 구분하며, 출장비와 출입 조건을 명시한 방문 예약안을 준비한다.",
            confirmationBoundary:
              "예약 요청서를 작성만 하고 보내지 않으며, 명시적 승인 없이 비용이 발생하는 출장을 신청하지 않는다.",
          },
        },
      },
      {
        id: "hu-move-transition",
        title: "Prepare a move-out and move-in utility transition",
        finalState:
          "A dated sequence of notices, meter readings and transfers meeting each provider's notice period, with the risk of a supply gap named.",
        confirmationBoundary:
          "Notices are drafted, not sent. No disconnection is requested.",
        markets: ALL,
        translations: {
          ko: {
            title: "이사에 따른 공과금 해지와 개시 절차 준비",
            finalState:
              "각 사업자의 통보 기한을 충족하는 통지, 검침, 명의 이전 일정이 날짜순으로 정리되고 공급 공백이 생길 위험이 함께 제시된다.",
            confirmationBoundary:
              "통지문을 작성만 하고 발송하지 않는다. 공급 중지를 신청하지 않는다.",
          },
        },
      },
      {
        id: "hu-final-bill-closure",
        title: "Close an account and settle the final bill after moving out",
        finalState:
          "The closing reading matched to the final bill, the deposit refund or outstanding balance calculated, and the forwarding address and refund channel recorded.",
        confirmationBoundary:
          "Account closure is destructive and hard to reverse; it is requested only on explicit user approval, and no payment is made.",
        markets: ALL,
        translations: {
          ko: {
            title: "이사 후 계정 해지와 최종 정산",
            finalState:
              "해지 검침값을 최종 고지서와 대조하고 보증금 환급액 또는 미납 잔액을 계산하며, 우편물 수령 주소와 환급 계좌를 기록한다.",
            confirmationBoundary:
              "계정 해지는 되돌리기 어려우므로 사용자의 명시적 승인이 있을 때만 신청하며 결제는 하지 않는다.",
          },
        },
      },
      {
        id: "hu-outage-response",
        title: "Respond to a supply outage and file a compensation claim",
        finalState:
          "The outage confirmed against the operator's status notice with its start time, the household's own equipment ruled in or out, and a compensation claim drafted against the published service standard.",
        confirmationBoundary:
          "The claim is drafted, not submitted, and no engineer visit is ordered without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "공급 중단 대응과 보상 청구 준비",
            finalState:
              "사업자의 장애 공지와 대조해 중단 사실과 시작 시각을 확인하고 세대 내 설비 문제 여부를 가려낸 뒤, 공표된 서비스 기준에 근거한 보상 청구서를 작성한다.",
            confirmationBoundary:
              "청구서를 작성만 하고 접수하지 않으며, 명시적 승인 없이 기사 방문을 신청하지 않는다.",
          },
        },
      },
      {
        id: "hu-switch-reversal",
        title: "Reverse a switch or wrong transfer inside the cooling-off window",
        finalState:
          "The remaining cooling-off or erroneous-transfer window quoted from the contract terms, the cancellation route identified, and the resulting supply arrangement and any charge already incurred stated.",
        confirmationBoundary:
          "Cancelling a switch changes the supply contract; it is not performed without explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "청약 철회 기간 안에 공급사 변경 되돌리기",
            finalState:
              "계약 약관을 근거로 남은 철회 기간 또는 착오 이전 정정 기간을 제시하고 취소 경로를 확인하며, 취소 후의 공급 상태와 이미 발생한 비용을 함께 밝힌다.",
            confirmationBoundary:
              "변경 취소는 공급 계약을 바꾸는 행위이므로 사용자의 명시적 승인 없이 실행하지 않는다.",
          },
        },
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
        translations: {
          ko: {
            title: "실사용량과 약정 조건을 함께 고려한 요금제 비교",
            finalState:
              "실제 사용량을 기준으로 개별 요금제의 총액을 계산하고 남은 약정 기간, 단말기 할부 잔액, 중도 해지 비용을 함께 제시한다.",
            confirmationBoundary:
              "비교만 한다. 명시적 승인 없이 요금제 변경을 신청하지 않는다.",
          },
        },
      },
      {
        id: "ts-usage-and-overage-review",
        title: "Explain a higher than usual telecom bill line by line",
        finalState:
          "The increase split into data overage, international or premium-rate calls, one-off content charges and expired promotional discounts, each tied to a line on the synthetic statement.",
        confirmationBoundary: "Read-only. No payment is made and no plan is changed.",
        markets: ALL,
        translations: {
          ko: {
            title: "평소보다 많이 나온 통신요금 항목별 분석",
            finalState:
              "증가분을 데이터 초과 사용, 국제 및 부가 통화, 일회성 콘텐츠 결제, 종료된 할인 프로모션으로 나누고 각 항목을 청구서의 특정 줄과 연결한다.",
            confirmationBoundary: "조회만 한다. 요금을 납부하지 않고 요금제도 바꾸지 않는다.",
          },
        },
      },
      {
        id: "ts-contract-term-research",
        title: "Establish the exit terms of a mobile or broadband contract",
        finalState:
          "The contract end date, notice period, early-termination charge, remaining device instalment balance and any discount clawback each quoted from the contract or account page with the date checked.",
        confirmationBoundary:
          "Research only. No cancellation notice is given and no plan is altered.",
        markets: ALL,
        translations: {
          ko: {
            title: "통신 계약의 해지 조건 확인",
            finalState:
              "약정 종료일, 해지 통보 기한, 중도 해지 위약금, 단말기 할부 잔액, 할인 반환금을 각각 계약서나 이용 내역에서 확인 날짜와 함께 인용해 제시한다.",
            confirmationBoundary:
              "조사만 한다. 해지를 통보하지 않고 요금제도 변경하지 않는다.",
          },
        },
      },
      {
        id: "ts-roaming-esim-prep",
        title: "Prepare roaming or an eSIM for a specific trip",
        finalState:
          "A costed roaming or eSIM option valid for the destination and dates, with device compatibility checked and the activation steps ordered.",
        confirmationBoundary:
          "The option is prepared; activation and purchase are left to the user.",
        markets: ALL,
        translations: {
          ko: {
            title: "특정 여행 일정에 맞춘 로밍 또는 eSIM 준비",
            finalState:
              "여행지와 기간에 유효한 로밍 또는 eSIM 상품의 비용을 계산하고 단말기 호환 여부를 확인하며 개통 절차를 순서대로 정리한다.",
            confirmationBoundary:
              "선택안을 준비하는 데 그치고 개통과 결제는 사용자가 직접 한다.",
          },
        },
      },
      {
        id: "ts-duplicate-and-trial-control",
        title: "Find duplicate subscriptions and trials about to convert",
        finalState:
          "A list of active subscriptions with duplicates and imminent trial conversions flagged by charge evidence, with cancellation deadlines and routes named.",
        confirmationBoundary:
          "Nothing is cancelled. Each cancellation is proposed for the user to confirm individually.",
        markets: ALL,
        translations: {
          ko: {
            title: "중복 구독과 곧 유료 전환되는 무료 체험 찾기",
            finalState:
              "활성 구독 목록을 정리하고 결제 내역을 근거로 중복 구독과 임박한 유료 전환을 표시하며 해지 기한과 해지 경로를 함께 제시한다.",
            confirmationBoundary:
              "어떤 구독도 해지하지 않는다. 해지는 건별로 제안하고 사용자가 각각 확인한다.",
          },
        },
      },
      {
        id: "ts-plan-change-execution",
        title: "Hold a plan change at the final confirmation screen",
        finalState:
          "The change form completed with the new monthly charge, the effective date, any pro-rated charge on the current cycle and the effect on the existing discount or contract restated while the confirm action remains untaken.",
        confirmationBoundary:
          "A plan change alters a contract. The agent never confirms it; the user completes the binding step.",
        markets: ALL,
        translations: {
          ko: {
            title: "요금제 변경을 최종 확인 화면에서 정지",
            finalState:
              "새 월 요금, 적용 시작일, 이번 달 일할 계산 금액, 기존 할인이나 약정에 미치는 영향을 다시 제시한 상태로 변경 화면을 채우고 확정 버튼은 누르지 않는다.",
            confirmationBoundary:
              "요금제 변경은 계약 조건을 바꾸는 행위이므로 상담원이 확정하지 않는다. 계약이 성립하는 단계는 사용자가 직접 마무리한다.",
          },
        },
      },
      {
        id: "ts-subscription-cancellation",
        title: "Cancel one named subscription and state what access is lost",
        finalState:
          "The cancellation route for that specific service identified, with the date access ends, whether the paid period is still usable, any refund rule and what stored content or profile is deleted.",
        confirmationBoundary:
          "Cancellation is destructive; it is performed only after the user approves that one service by name.",
        markets: ALL,
        translations: {
          ko: {
            title: "지정한 구독 하나 해지와 그로 인한 이용 제한 확인",
            finalState:
              "해당 서비스의 해지 경로를 확인하고 이용 종료일, 결제한 기간을 끝까지 쓸 수 있는지 여부, 환불 규정, 삭제되는 저장 콘텐츠와 프로필을 함께 제시한다.",
            confirmationBoundary:
              "해지는 되돌릴 수 없으므로 사용자가 해당 서비스를 지목해 승인한 뒤에만 실행한다.",
          },
        },
      },
      {
        id: "ts-dispute-and-porting",
        title: "Draft a billing dispute or number-porting request",
        finalState:
          "A drafted dispute or porting request citing the disputed line items or the porting eligibility conditions, with the notice period and any resulting service gap stated.",
        confirmationBoundary:
          "The request is drafted, not sent. No line is ported or terminated without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "통신요금 이의제기 또는 번호이동 신청서 작성",
            finalState:
              "문제가 된 청구 항목이나 번호이동 요건을 근거로 이의제기서 또는 번호이동 신청서를 작성하고 통보 기한과 발생 가능한 서비스 중단 구간을 함께 밝힌다.",
            confirmationBoundary:
              "신청서를 작성만 하고 발송하지 않는다. 명시적 승인 없이 번호이동이나 해지를 진행하지 않는다.",
          },
        },
      },
      {
        id: "ts-line-suspension-recovery",
        title: "Restore a line suspended for non-payment or a lost handset",
        finalState:
          "The reason for suspension confirmed from the account record, the exact amount or step needed to restore service identified, and the reconnection fee and expected restoration time stated.",
        confirmationBoundary:
          "Restoration is prepared. No payment is made and no reconnection is requested without explicit approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "미납 또는 분실로 정지된 회선 복구",
            finalState:
              "가입 정보에서 정지 사유를 확인하고 서비스를 되살리기 위해 필요한 정확한 금액이나 절차를 특정하며, 재개통 수수료와 예상 복구 시간을 함께 제시한다.",
            confirmationBoundary:
              "복구 절차를 준비한다. 명시적 승인 없이 결제하거나 재개통을 신청하지 않는다.",
          },
        },
      },
      {
        id: "ts-mistaken-cancellation-recovery",
        title: "Recover a wrongly cancelled line or subscription",
        finalState:
          "The reinstatement window for that service quoted from its terms, whether the same number, plan price and stored data can be restored, and the fallback if reinstatement is no longer possible.",
        confirmationBoundary:
          "Reinstating creates a new charge; it proceeds only on explicit user approval.",
        markets: ALL,
        translations: {
          ko: {
            title: "잘못 해지한 회선이나 구독 되살리기",
            finalState:
              "해당 서비스 약관을 근거로 복구 가능 기간을 제시하고 동일 번호, 기존 요금, 저장된 데이터를 되살릴 수 있는지 확인하며, 복구가 불가능할 때의 대안을 함께 정리한다.",
            confirmationBoundary:
              "복구는 새로운 요금이 발생하므로 사용자의 명시적 승인이 있을 때만 진행한다.",
          },
        },
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
