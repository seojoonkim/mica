---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: independent-pre-review
scope: std-b11-observation-gate
language: ko
---

# std-b11 관찰 관문 Codex 선검토

## 판정

공식 observation reviewer가 판정하기 전에 차단 후보 2건과 주의 후보 1건을 확인했다. 이 문서는 공식 review JSONL을 대신하지 않으며 생산 파일을 수정하지 않는다.

## 차단 1. ob-b11-01의 관찰 범위가 광고 단계에서 계약 기간으로 확장됨

source reviewer는 `ev-b11-01`의 대상이 인터넷 표시와 중개 단계라고 확인했고, 계약 기간 중 부담으로 읽지 말라고 남겼다. 그러나 `ob-b11-01`은 다음을 포함한다.

- `burdenBearer`: 정액관리비를 실제로 부과받는 임차인
- `contextOrTrigger`: 임차 후 매월 관리비를 부과받는 시점
- `unresolvedConsequence`: 매월 정액관리비를 부과 근거를 확인하지 못한 채 부담

원문 고시는 광고에 비목별 금액을 표시할지에 관한 근거다. 계약 기간의 실제 청구서와 부과 내역이 확인되지 않는 상태까지 직접 관찰한 자료는 아니다. `scope`, `evidenceAlignment`, `noInventedFacts` 관점에서 reject가 타당하다.

## 차단 2. ob-b11-02가 source reviewer가 부정한 인과 서술을 복사함

`sr-b11-02.nonBlockingNotes`는 원문이 신청 급증의 원인을 통신사 침해사고로 설명하지 않는다고 확인했다. 그런데 `ob-b11-02.evidenceStatus`는 다음 문장을 그대로 사용한다.

> 신청 급증에는 통신사 침해사고 등 개별 사건의 영향이 있다고 자료가 밝히고 있어

이는 원문에 없는 인과 서술이 downstream 관찰로 전파된 경우다. 또한 `unresolvedConsequence`의 12.3%와 8.4%는 신청 2,123건이 아니라 처리완료분 1,060건 기준이라는 reviewer 경고가 본문에 드러나지 않아 같은 문단의 분모를 오해하게 한다. `evidenceAlignment`와 `noInventedFacts` 관점에서 reject가 타당하다.

## 주의. ob-b11-05의 원하는 상태가 근거보다 넓을 수 있음

`desiredStateChange`의 "이용한 요양기관이 어디든"은 특정 진료 건과 2025년 10월 연계 현황을 넘어 모든 요양기관에서의 보편적 청구 가능 상태로 읽힐 수 있다. 원하는 상태이므로 곧바로 허위 사실은 아니지만, reviewer는 다음을 확인해야 한다.

- 관찰 단위를 "해당 진료 건을 처리한 요양기관"으로 한정해도 상태 변화가 유지되는가
- 미연계 기관에서 창구 방문과 서류 발급이 반드시 필요하다는 사실을 자료가 직접 지지하는가
- 자료의 편익 서술을 반대로 읽은 추론을 직접 관찰로 표현하지 않았는가

이 세 조건 중 하나라도 실패하면 reject가 타당하다.

## 현재 통과 가능성이 있는 관찰

- `ob-b11-03`: 개인 간 중고거래 분쟁 기준의 비강제성과 이행 불확실성
- `ob-b11-04`: 본인 명의 숨은 금융자산의 확인과 환급 필요

이 두 건도 공식 reviewer가 원문과 전수 대조해야 하며 이 문서는 accept를 확정하지 않는다.

## controller에 요구할 조치

1. 공식 observation reviewer에게 이 문서를 답안으로 주지 말고, 원문 source evidence와 관찰만으로 독립 판정하게 한다.
2. `ob-b11-01`, `ob-b11-02`, `ob-b11-05`의 위 쟁점을 reviewer가 실제 기준에 따라 판정하도록 검사 항목을 빠뜨리지 않는다.
3. 하나라도 실패하면 원문 관찰을 고치지 않고 reject한다.
4. 같은 배치에서 새 observation ID로 재작성하지 않는다.
5. accepted-only 관찰 수량으로 다음 단계에 진행한다.
