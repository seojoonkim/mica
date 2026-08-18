---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: controller-decision
scope: draft-tier-review-rubric
language: ko
asOf: 2026-08-18
decidedBy: Claude Code 주 컨트롤러
appliesFrom: draft-r1 결함 32건 재작업, 이후 모든 draft tier 생산
baseCommit: c97cf0b
---

# draft tier 검토 rubric 경화

## 0. 결정

draft tier의 `reviewer` 역할이 지금까지 쓴 4항목 rubric(evidenceReal, lifeNeedSupport, noInventedFacts, categoryMatch)에 **두 항목을 추가**한다.

5. **evidencePrecision**: boundedObservation뿐 아니라 후보 본문 전체(taskAction, canonicalFinalState, confirmationBoundary, failureRecoveryEvents, prohibitedStates)를 원문과 **문장 단위로** 대조한다.
6. **internalConsistency**: 후보 자신의 필드끼리 서로 모순되지 않는지 확인한다.

이후 모든 draft tier producer+reviewer job은 이 6항목 rubric을 쓴다. 이미 원장에 적용된 51건 중 결함이 없는 31건(CONFIRM 2 + MINOR 29)은 재작업하지 않는다. 결함 32건은 별도 재작업 절차(§4)를 밟는다.

## 1. 왜 지금 고치는가: 실측

63건(100%) 전수 심층 감사 결과다. 방법: 3개 독립 라운드(1차 12건, 2차 12건, 3차 39건, 서로 중복 없음), 각 건마다 격리된 신규 컨텍스트가 원문을 실제로 다시 열어 재검증했다.

| 라운드 | n | MAJOR | 비율 |
|---|---:|---:|---:|
| 1차 | 12 | 3 | 25.0% |
| 2차 | 12 | 4 | 33.3% |
| 3차 | 39 | 25 | 64.1% |
| **합계** | **63** | **32** | **50.8%** |

**실제 슬롯을 점유 중인 51건 중 26건(51%)이 DEFECT-MAJOR였다.** 3차 표본에서 비율이 급등해 프라이밍 편향(3차 프롬프트에 "1·2차에서 이런 유형이 나왔다"는 문구를 넣었다)을 의심했으나, MAJOR 판정 4건을 무작위로 뽑아 원문과 직접 재대조한 결과 전부 실제 결함이었다(`work/method-reviews/2026-08-18-draft-r1-full-audit-findings.md` §2 참조). 즉 51%는 편향의 산물이 아니라 실측이다.

### 1.1 항목별 실패율(63건 중)

| 항목 | 실패 | 비율 |
|---|---:|---:|
| categoryMatch | 3 | 4.8% |
| lifeNeedSupport | 1 | 1.6% |
| authorityRoleCompliant | 3 | 4.8% |
| **evidenceReal** | **27** | **42.9%** |
| **internallyConsistent** | **35** | **55.6%** |

카테고리 판정, 생활 필요 적격성, 실명 처리는 90%대 후반으로 버텼다. `2026-08-17-source-channel-widening.md`와 `2026-08-17-source-eligibility-check-restoration.md`가 세운 관문은 대체로 작동했다는 뜻이다. 완전히 새는 곳은 근거 정밀도와 내적 정합성, 이 둘뿐이다. **기존 4항목 rubric에는 이 둘을 검사하는 항목이 애초에 없었다.**

### 1.2 실패 유형: 실제 사례

- **시간 순서·인과관계 역전**: `mbi-draft-05`는 은행 상계가 반환청구 **전**이라고 썼으나 실제로는 **7주 후**였다. 이 순서 자체가 조정위원회가 "부당하다"고 판단한 논거였다.
- **당사자 오귀속**: `trv-draft-01`은 입원한 사람을 신청인 본인으로 썼으나 원문은 신청인의 배우자다. 적용 법조항(국외여행 표준약관 제15조 ② 라)은 배우자 입원에만 성립하므로, 이 오귀속 하나로 법적 근거 경로 자체가 무너진다.
- **근거 밖 절차 삽입**: `mbi-draft-04`는 "경찰서에서 사건사고사실확인원 발급, 지급정지 신청일로부터 3영업일 이내 제출"이라는 절차 전체를 원문에 없이 지어냈다.
- **근거 밖 법률 인용**: `mob2-draft-05`는 "여객자동차운수사업법"을 인용했는데, 원문에서 그 법이 등장하는 유일한 문장은 "이 법으로는 규제 못 한다"는 배제 근거였다.
- **자기모순**: `res2-draft-03`은 `startState`가 확정한 사실을 `unknowns`가 다시 미상으로 선언하고, `taskAction`이 이미 확정된 사실의 재확인을 지시했다.
- **근거 없는 성공 사례 확정**: `trv2-draft-06`은 "신고 이후 환급 전환 사례가 다수 보고됨"이라는, 과업의 성공 가능성을 떠받치는 핵심 주장을 원문 없이 만들었고, 같은 후보의 `unknowns`가 스스로 이를 부정했다.
- **실명 노출**: `mob2-draft-02`는 실제 사업자명 "버스타고"가 `startState`와 `taskAction`에 그대로 노출됐다. 1·2차 24건에서는 이 항목이 24/24 만점이었는데, 그 만점 자체가 표본 운이었다.

### 1.3 카테고리별 분포: 조달이 어려웠던 곳이 결함도 많다

| 카테고리 | MAJOR | 전체 |
|---|---:|---:|
| mobility-transit | 6 | 9 |
| restaurants-local | 6 | 8 |
| home-utilities | 4 | 8 |
| shopping-delivery | 4 | 6 |

`2026-08-17-source-channel-widening.md`가 진단한 "1차 자료 조달이 구조적으로 어려운 B층"과 정확히 겹친다. 실제 1차 자료가 부족할 때, 그 공백을 그럴듯한 서술로 메우려는 압력이 검토 단계에서 걸러지지 않고 그대로 통과했다는 뜻이다.

## 2. 왜 애초에 안 잡혔는가

기존 4항목 rubric(evidenceReal, lifeNeedSupport, noInventedFacts, categoryMatch)의 `evidenceReal`은 "boundedObservation이 원문과 대체로 일치하는가"를 물었다. 이건 **근거 요약 하나만** 원문과 대조하는 검사다. 그런데 실제 결함은 `taskAction`, `canonicalFinalState`, `failureRecoveryEvents`처럼 번역·구성 단계에서 새로 쓰는 필드에 몰려 있었다. `boundedObservation`은 원문 인용이라 상대적으로 깨끗했고(위 사례들에서도 boundedObservation 자체는 대체로 정확하다고 반복 확인됨), 그 뒤에 이어지는 번역 필드들이 원문 밖 지식을 끌어와도 잡는 항목이 없었다.

`noInventedFacts`는 "원문에 없는 사업자명·수치·기간을 만들지 않았는가"를 물었다. 이것도 좁다. 시간 순서를 뒤집거나 당사자를 바꿔치기하는 건 "발명"이 아니라 "왜곡"이라 이 항목의 문면 밖에 있었다.

내적 정합성은 4항목 중 어디에도 없었다. 각 필드를 원문과 대조하기만 했지, 후보 자신의 필드끼리 대조하는 절차가 없었다.

## 3. 새 rubric

### 3.1 evidencePrecision

boundedObservation만이 아니라 **taskAction, canonicalFinalState, confirmationBoundary, failureRecoveryEvents, prohibitedStates 전체**를 원문과 문장 단위로 대조한다. 특히:

- 시간 순서·인과관계가 원문과 같은 방향인가
- 사건의 당사자(누가 무엇을 했는지)가 원문과 정확히 일치하는가
- 원문에 없는 법률·기관·절차·수치·전달수단을 사실처럼 서술하지 않았는가
- 원문이 명시적으로 부정하거나 배제한 것을 반대로 서술하지 않았는가

### 3.2 internalConsistency

후보 자신의 필드끼리 모순되지 않는지 확인한다. 특히:

- `startState`가 확정한 사실을 `unknowns`가 다시 미상으로 선언하는가
- `taskAction`이 이미 확정된 사실의 재확인을 지시하는가
- 근거 없는 성공 사례·통계·처리 결과를 확정적으로 서술하면서, 같은 후보의 다른 필드(주로 `unknowns`)가 그 사실을 원문에 없다고 스스로 인정하는가

### 3.3 판정 불변식

6항목 중 하나라도 fail이면 reject다. 기존 4항목 불변식과 동일하게 적용한다.

## 4. 결함 32건 재작업 방식

일괄 재생산이 아니라 결함 성격에 따라 나눈다.

| 그룹 | 조건 | 건수 | 방식 |
|---|---|---:|---|
| A. 교정 | evidenceReal=true (근거는 유효, 다른 축만 실패) | 7 | 격리 컨텍스트가 원문 재확인 후 지적된 필드만 최소 수정 → 새 격리 컨텍스트가 6항목 rubric으로 재검토 |
| B. 재조사 | evidenceReal=false (근거 자체가 부실) | 24 | 새 격리 producer가 해당 카테고리에서 처음부터 재조사 → 새 격리 reviewer가 6항목 rubric으로 검토 |
| C. 보류 | 순수 카테고리 판단 차이, 슬롯 미점유, 대체 카테고리 없음 | 1(`hca-draft-08`) | 조치 없음. 기존 categoryId 유지, 감사자의 이견만 기록 |

그룹 A는 `2026-08-18` 1차 교정에서 이미 실측된 방식이다(`res2-draft-03`, `mbi-draft-05`, `mob2-draft-05` 3건 CONFIRM/MINOR 전환 완료, SHA 3계층 수동 갱신 절차 확립).

그룹 B는 기존 producer 산출물을 버리고 완전히 새로 조사한다. 근거가 부실한 후보를 고쳐 쓰는 것보다, 그 카테고리에서 실제로 문장 단위 대조를 통과할 수 있는 소재를 처음부터 찾는 편이 안전하다.

## 5. 하지 않은 것

- 31건(CONFIRM 2 + MINOR 29)을 재작업하지 않는다. 6항목 rubric으로도 이미 통과 수준이라고 감사가 확인했다.
- `hca-draft-08`을 위해 없는 카테고리("consumer-contract-dispute")를 새로 만들지 않는다.
- 카테고리 판정 규칙, 생활 필요 적격성 4문항, 실명 처리 규칙은 바꾸지 않는다. 이 세 축은 24~90%대로 버텼다.
- 검증된 clean-room lane(구 in-repo 배치, `scripts/mica-scenario-production.py`)의 rubric은 건드리지 않는다. 이 문서는 draft tier에만 적용된다.
