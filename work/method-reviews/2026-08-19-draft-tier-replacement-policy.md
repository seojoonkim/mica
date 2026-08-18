---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: decided
scope: draft-tier-replacement-policy
language: ko
asOf: 2026-08-19
preparedBy: Claude Code 주 컨트롤러 (Fable 5)
decidedBy: 신기헌 (2026-08-19, 컨트롤러 분석·권고 승인)
relatedDocs:
  - work/method-reviews/2026-08-18-draft-tier-review-rubric-hardening.md
  - work/method-reviews/2026-08-18-wave5-remediation-closure.md
  - work/method-reviews/2026-08-18-kh-b13-measurement-first-live-authoring.md
  - work/method-reviews/2026-08-14-measurement-throughput-analysis.md
---

# draft tier 처우 방침: 분리 유지, relabel 금지, 게이트 순서 점진 교체

## 0. 결정

1. **분리 유지**: verified(49)와 draft-r1(51)은 계속 분리 취급한다. 원장 `tier` 필드와 사이트 배지의 구분을 유지한다.
2. **relabel 금지**: draft-r1 후보는 어떤 후속 검토를 통과해도 verified로 라벨을 바꾸지 않는다. '승격'은 언제나 정석(clean-room) 공정으로 새로 생산한 후보로의 **교체**를 뜻한다.
3. **전량 교체가 장기 목표**: draft-r1 51건은 최종적으로 전부 clean-room 생산분으로 대체하는 것을 목표로 한다. 단 일괄 철거가 아니라, 소급 가능한 게이트가 결함을 드러내는 순서대로 점진 교체한다.

## 1. 판단 근거: draft 공정의 구조적 결손 (2026-08-19 원장 실측)

이 결정 시점의 사실관계: draft에서 verified로 전환된 슬롯은 0건이다. wave-5로 교체된 결함 4슬롯(email-calendar-07=eml2-draft-02b, restaurants-local-08=res3-draft-11, restaurants-local-10=res3-draft-13, healthcare-administration-10=hc-admin-deposit-refund-02)도 전부 `tier: draft-r1`이다. verified 49는 16개 clean-room/std/lean 배치 + pilot-15에서 왔고, draft 51은 단일 압축 배치(draft-r1)에서 왔다.

draft 공정이 정석 대비 결여한 것 5가지:

1. **관찰(need observation) 독립층 부재**: producer가 원천 조사부터 과업 번역까지 한 컨텍스트에서 수행한다. 과업을 먼저 쓰고 필요를 역산하는 오염을 막는 장치(해결책 없는 관찰의 독립 검토·동결)가 없다.
2. **격리가 프롬프트 수준**: 정석은 job-packet 물리 격리(저장소 접근 불가)인데 draft는 지시문 금지뿐이다. 오염 부재를 구성적으로 보장하지 못한다. (draft-r1 batch-manifest가 의도적 완화로 명시 기록)
3. **라운드 내 교정 루프 사용**: 정석 계약은 "거절 원문은 같은 배치에서 재작성 금지"를 명시하지만, draft 재작업(wave-3/4/5)은 탈락 후보를 교정해 재검토받았다. 검토자가 자기가 지적한 사항이 수술된 텍스트를 재승인한 것이라 수락 판정의 독립성이 약하다.
4. **사후 대조(comparison) 미실시**: draft annotation 스키마에 대조 필드 자체가 없고, 51건 전부 공식 MICA 100·pilot-15·과거 배치와의 중복/변형/독립발견 판정이 없다. 신규성 미확인.
5. **측정 설계 0/51**: 측정 계약 38건 + pilot 15건 전부 verified 계열이다.

사전 확률 근거: 원래 4항목 검토를 통과한 63건을 심층 감사하니 50.8%가 DEFECT-MAJOR였다(evidencePrecision 43%·internalConsistency 56% 실패). rubric을 6항목으로 경화해 그 두 축은 잡았지만 단일 사후 검토 구조는 그대로다. 반면 정석 관문들의 실제 catch 실적: source review가 kh-b14를 0건 수락으로 종결, std-b13 오착수에서도 근거 1건이 lifeNeedSupport로 reject, measurement review는 정석 배치 std-b12조차 0/2로 종결.

## 2. 결정의 핵심 논리: 소급 가능/불가 구분

- **소급 가능(retrofittable)**: 사후 대조, 측정 자산 저작, oracle review, measurement review, exposure, blind rehearsal. 전부 post-freeze 역할이라 지금이라도 draft 후보에 붙일 수 있다.
- **소급 불가(non-retrofittable)**: 관찰층 독립성, 물리 격리, 무교정 루프 원칙. 텍스트가 생겨난 방식의 속성이라 어떤 후속 검토로도 소급 부여할 수 없다.

소급 불가 결손이 존재하므로 draft 후보는 검토를 아무리 추가해도 verified와 같은 주장을 할 수 없다. MICA의 공개 주장 자체가 "오염 없는 작성·독립 검토·동결·사후 대조"라는 방법론이므로, 정본 100은 최종적으로 전량 그 방법으로 생산된 것이어야 한다. 이것이 relabel 금지와 전량 교체 목표의 근거다.

## 3. 실행 방침

교체 순서는 게이트가 정한다:

1. **51건 사후 대조 소급** (최우선, 저비용): 격리 comparator로 공식 MICA 100·pilot-15·기존 배치와 대조. 중복(duplicate) 판정이 나오는 슬롯부터 교체 대상.
2. **측정 설계 시도에서 걸리는 후보**: 실행 계약이 약한 후보는 여기서 스스로 드러난다(std-b12 전례).
3. **이력 기반 우선순위**: 교정 루프 이력 슬롯(restaurants-local-08·10)과 유일한 2회 연속 교체 슬롯(healthcare-administration-10)을 앞순위로.

교체 생산의 종착 기준은 "동결 완료"가 아니라 **"측정 설계 통과"**다(ki-b13-02가 2026-08-19 완주한 파이프라인 재사용: 저작 + v3 validator + oracle review + measurement review + exposure + rehearsal). 슬롯 대체는 wave-5에서 확립한 원장 수술 + retracted 이력 보존 메커니즘을 재사용한다.

페이스 현실: 현행 v1.3.5 기준 clean-room 처리량은 배치당 0~2건(kh-b13 1건, kh-b14 0건). 51건 전체는 수십 배치 규모이므로 보여주기 100/100을 유지하며 점진 교체한다.

## 4. 범위 밖

- **pilot-15 계열 13건**: verified tier 안에서도 현행 revision 확립 이전 산출물이라 provenance가 이질적이지만, 방법론의 기원 세트이자 서준 측 정본 영역이므로 이번 결정 범위 밖이다.
- **교체 완료 시한**: 설정하지 않는다. 필요해지면 기헌이 별도 결정한다.
- draft 후보 중 소급 게이트(대조+측정)를 전부 통과한 것을 중간 등급으로 존치할지 여부: 현 결정은 "그래도 최종적으로는 교체"이나, 실측이 쌓인 뒤 재론 가능성을 배제하지 않는다.

## 5. 첫 실행 단계

51건 사후 대조 소급이 가장 싸고 정보량이 크다. 다음 착수 후보로 등록한다.

## 6. 슬롯 선정 기준과 초과분 처우 (2026-08-19 추가, 기헌 승인)

### 6.1 슬롯 선정 기준

카테고리에 후보가 10개를 넘으면 어떤 것이 100개 안에 들어가는지의 기준을 다음 우선순위로 고정한다:

1. **공정 등급**: 정석(clean-room) > 임시(draft-r1). 본 방침의 당연 귀결.
2. **실행 트랙 진척**: 측정 설계까지 통과한 후보(designable) > designable-pending-exposure > 동결만 된 후보. 이 프로젝트의 목적이 "측정 가능한 시나리오"이므로 측정까지 도달한 안이 자리를 차지한다.
3. **카테고리 내 다양성**: 10칸은 개별 최고 10개가 아니라 "함께 있을 때 생활 필요·표면·복잡도가 겹치지 않는 10개"의 세트 선택이다. 근접 중복은 한 칸만 차지한다.
4. **동률 시**: 신규성 판정(independent-finding > transformation)과 근거 최신성으로 가른다.

### 6.2 초과분 처우: 폐기물이 아니라 재고

수율 불확실성(배치당 0~2건, 0건 배치 실재) 때문에 과잉 생산은 없앨 수 없다. 카테고리 조준(SLOT-BRIEF)과 가득 찬 카테고리 생산 중단으로 최소화하되, 발생한 정석 초과분은 다음 용도의 재고로 관리한다(우선순위 순):

1. **private holdout 후보 재고**: 공개 100은 학습 오염에 노출되므로 벤치마크의 측정력 유지에는 비공개 평가분이 필수다. 00-C의 기존 열린 항목 "public core / private holdout 분리"의 재고가 바로 정석 초과분이다. 단 holdout 확정 자체는 서준·기헌 거버넌스 결정(사람 승인 경계)으로 유보하며, 여기서는 "초과분을 holdout 후보 재고로 관리한다"까지만 정한다.
2. **슬롯 교체 예비군**: 점유 후보가 사후 결함으로 판명되면 새 배치 없이 즉시 투입. 장기적으로 벤치 버전 회전분.
3. **측정 파이프라인 시험대**: 비싼 측정 설계·시뮬레이터 구축을 정본 100에 돌리기 전 초과분으로 공정을 검증(ki-b13-02가 수행한 역할).

**임시 계열 초과분(현재 17건)은 제외한다**: 소급 불가 결손이 슬롯 점유분과 동일해 위 재사용 가치가 낮다. Day-1 쇼케이스와 감사 교정 데이터로 이미 가치를 소진했다고 간주하고 추가 투자하지 않는다. retracted-defect 27건은 재고가 아니라 실패 이력 보존이다.

## 7. 표시 라벨 (2026-08-19 추가, 기헌 지시)

draft-r1의 사람용 표시 라벨을 "초안"에서 **"임시"**로 바꾼다. "초안"은 다듬으면 완성되는 이전 단계라는 인상을 주지만, 이 방침 아래에서 draft-r1의 실제 지위는 "정석 산출물로 교체될 때까지 자리를 지키는 재작업 대상"이기 때문이다. 진행 사이트의 후보 배지·진행판 셀 배지·범례가 "임시"로 표시하고, 툴팁에 재작업 대상·정석 공정 산출물로 순차 교체 예정임을 명시한다(vooy-mica 커밋 `5bd4346`). 기계용 ID `draft-r1`, 원장 필드, CSS 클래스명은 불변이다(비파괴 원칙). 기존 문서의 "초안 tier" 표기는 소급 치환하지 않고, 새 문서부터 "임시(draft-r1)"를 쓴다.
