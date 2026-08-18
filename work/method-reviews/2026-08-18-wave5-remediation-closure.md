---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: remediation-closure
scope: wave5-remediation
language: ko
asOf: 2026-08-18
preparedBy: Claude Code 주 컨트롤러 (Sonnet 패스)
relatedDocs:
  - work/method-reviews/2026-08-18-sonnet-production-handoff.md
  - work/method-reviews/2026-08-18-category-boundary-rule.md
  - work/method-reviews/2026-08-18-draft-tier-32-defect-remediation-closure.md
---

# wave-5-remediation 종결: 4개 결함 슬롯 재발굴

## 0. 대상과 결과 한 줄

인계 브리프가 지정한 4개 결함 슬롯(`restaurants-local-08`, `restaurants-local-10`, `email-calendar-07`, `healthcare-administration-10`) 전부에 6항목 rubric을 통과한 대체 후보를 확보했다. 여분 1건(`hc-admin-workinjury-reimburse-04`)은 `category-overflow`로 별도 반영한다.

## 1. 생산 경과

### 1라운드 (격리 producer Sonnet high + reviewer Opus xhigh, 카테고리별 파이프라인)

- `restaurants-local` 4건 생산, 4건 전부 reject. 3건(`res3-draft-11/13/14`)은 `authorityRoleCompliant` 단독 실패(boundedObservation이 "조정기관"/"조정부"로만 지칭하는데 taskAction 등에 "한국소비자원" 실명이 새어나감). 1건(`res3-draft-12`)은 관찰에 없는 "식사 패키지" 소재를 창작해 categoryMatch·evidencePrecision 복합 실패.
- `email-calendar` 3건 생산, 1건(`eml2-draft-02b`, 캘린더 스팸 초대 자동추가 설정 변경) 6항목 전부 pass로 accept. 나머지 2건은 evidencePrecision 또는 categoryMatch/internalConsistency 복합 실패.
- `healthcare-administration` 3건 생산, 3건 전부 evidencePrecision 단독 실패(원문에 없는 서류 요건·연락 수단·인증 방식을 taskAction 등에 창작).

### 2라운드 (교정 + 재생산)

- restaurants-local 근접 실패 3건에 실명 치환 교정(Sonnet high) 후 재검토(Opus xhigh, 처음부터 독립 판정): `res3-draft-13`은 accept. `res3-draft-11`/`res3-draft-14`는 교정자가 필드별로 다른 일반 명칭("조정기관" vs "조정위원회", "조정기관" vs "조정부")을 섞어 써서 authorityRoleCompliant 재차 실패.
- healthcare-administration 재생산 4건(직전 실패 원인을 구체 예시로 명시한 강화 프롬프트, 이미 다룬 소재 재사용 금지): 2건(`hc-admin-deposit-refund-02` 진찰료 예약금 환불, `hc-admin-workinjury-reimburse-04` 산재 요양비 청구) accept. 2건은 evidencePrecision 실패(각각 존재하지 않는 신청 기한/소멸시효 서술, "소비자분쟁해결기준"이라는 원문에 없는 법적 근거를 일반화해 확장).

### 3라운드 (기계적 정합성 재교정)

- `res3-draft-11`/`res3-draft-14`의 명칭 불일치를 결정론적 문자열 치환(코사 호응까지 확인)으로 교정한 뒤 독립 재검토(Opus): `res3-draft-11`은 6항목 전부 pass로 accept. `res3-draft-14`는 명칭 문제는 해소됐으나 새로운 근본 결함 발견: 계약 상대가 "예식장"이지 "음식점"이 아니어서 categoryMatch 자체가 성립하지 않음(원문 어디에도 식음료 제공 서술이 없음). res3-draft-14는 최종 폐기.

이 시점에 `restaurants-local` need=2를 `res3-draft-11` + `res3-draft-13` 2건으로 충족했다.

## 2. 사후 분류 (격리 annotator Sonnet + reviewer Opus, 5건 전체)

annotator가 4개 필드(terminationClass/declaredComplexity/targetSurface/measurementIntent)를 1차 제안했고, 독립 reviewer가 처음부터 재판정했다. reviewer가 지적해 교정한 사항:

- `res3-draft-11`/`res3-draft-13`: targetSurface를 `web`에서 `mixed-surface`로 수정. 원문(boundedObservation)과 taskAction 어디에도 온라인·전화·방문 등 전달수단이 특정되지 않았는데 web으로 단정한 것은 evidencePrecision 원칙(원문에 없는 전달수단을 사실처럼 특정하지 않는다)의 분류 단계 위반이었다.
- `hc-admin-workinjury-reimburse-04`: measurementIntent에 원문 밖 실제 기관 실명("근로복지공단")이 노출되고 원문에 없는 "결정 통지"라는 산출물을 창작한 것을 발견, 일반 명칭("권위 있는 결정 결과")으로 교정.

authorityRoleCompliant 같은 실명 노출 규율이 candidate 본문뿐 아니라 사후 분류 단계에서 새로 쓰는 필드(measurementIntent)에도 동일하게 적용돼야 함을 확인했다. 다음 세션 프롬프트에 반영할 사항이다.

## 3. 최종 반영 내역

| 슬롯 | 구 후보 (retracted-defect) | 신규 후보 | terminationClass | declaredComplexity | targetSurface |
|---|---|---|---|---|---|
| `restaurants-local-08` | `res3-draft-02` | `res3-draft-11` | approval-handoff | cross-session | mixed-surface |
| `restaurants-local-10` | `res3-draft-04` | `res3-draft-13` | approval-handoff | cross-session | mixed-surface |
| `email-calendar-07` | `eml2-draft-02` | `eml2-draft-02b` | completed-final-state | multi-step | mixed-surface |
| `healthcare-administration-10` | `hea-r2-03` | `hc-admin-deposit-refund-02` | completed-final-state | multi-step | phone-or-in-person |

여분(`category-overflow`, 슬롯 미배정): `hc-admin-workinjury-reimburse-04` (산재 요양비 청구, completed-final-state / cross-session / mixed-surface).

## 4. 다음 세션에 넘기는 함정 (누적)

기존 함정 목록(em dash, failureRecoveryEvents 공란, 실명 노출)에 다음을 추가한다.

7. **실명은 candidate 본문뿐 아니라 사후 분류 단계 신규 필드(measurementIntent 등)에도 노출되면 안 된다.** authorityRoleCompliant 검사를 candidate JSON 자체로 한정하면 놓친다.
8. **일반 명칭으로 실명을 치환할 때, 같은 candidate 안의 모든 필드가 정확히 같은 한 단어를 써야 한다.** 원문이 "조정기관"이면 taskAction·canonicalFinalState·failureRecoveryEvents 전부 "조정기관"이어야 하고, 한국어 조사(이/가, 을/를)까지 호응시켜야 한다. 필드마다 다른 동의어(조정기관/조정위원회/조정부)를 섞어 쓰면 authorityRoleCompliant가 재실패한다.
9. **분쟁조정 후보의 채널(targetSurface)은 원문에 온라인·전화·방문 등 전달수단이 명시되지 않는 한 기본값을 `mixed-surface`로 잡는다.** "조정기관에 신청한다"는 절차 존재만으로 web을 단정하면 evidencePrecision 원칙 위반이다.
10. **거래 상대방의 업종이 카테고리와 실제로 일치하는지 확인한다.** "예약"이라는 거래 형식이 있다고 자동으로 restaurants-local이 되지 않는다. 예식장 계약은 식음료 제공 서술이 없으면 외식 영역이 아니다.
