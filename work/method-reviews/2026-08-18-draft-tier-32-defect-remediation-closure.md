---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: controller-decision
scope: draft-tier-remediation
language: ko
asOf: 2026-08-18
decidedBy: 신기헌 (컨트롤러 권고에 따름)
appliesFrom: draft-r1 결함 32건 재작업 종료
baseCommit: 779186a
relatedDocs:
  - work/method-reviews/2026-08-18-draft-tier-review-rubric-hardening.md
  - work/method-reviews/2026-08-18-draft-r1-full-audit-findings.md
---

# draft tier 32건 결함 재작업 종료

## 0. 결정

`2026-08-18-draft-tier-review-rubric-hardening.md`가 정한 재작업 절차(그룹 A 교정 7건, 그룹 B 재조사 24건, 그룹 C 보류 1건)를 4라운드에 걸쳐 실행했다. 100슬롯 중 22개가 실제로 결함 콘텐츠를 점유하고 있었고, 그중 19개를 6항목 rubric을 통과한 새 후보로 교체했다. 남은 3개(`restaurants-local-08`, `restaurants-local-10`, `email-calendar-07`)는 반복 재조사에도 통과작이 나오지 않아, 결함이 확인된 원래 콘텐츠를 유지한 채 재작업을 종료한다. 100/100 슬롯 표시는 그대로 유지한다.

## 1. 실측 요약

| 항목 | 값 |
|---|---:|
| 원 감사 MAJOR 결함 (63건 중) | 32 |
| 그중 실제 슬롯 점유 (overflow 아님) | 22 |
| 그중 overflow 전용(슬롯 영향 없음) | 4 |
| Group A 교정 성공 (원장 콘텐츠 수정) | 5 |
| Group C 보류 (카테고리 판단 이견만, 슬롯 없음) | 1 |
| 새 후보로 슬롯 교체 성공 | 19 |
| overflow 후보 교체(슬롯 없음) | 2 |
| overflow 후보 순수 회수(대체 없음) | 2 |
| **최종 미해결 슬롯** | **3** |

정리하면 32건 중 29건(90.6%)이 해소됐고, 3건(9.4%)이 결함 있는 채로 남았다.

## 2. 재작업 라운드별 기록

| 라운드 | 대상 | 방식 | 결과 | 커밋 |
|---|---|---|---|---|
| 1 | Group A 7건 | 격리 교정+재검토 | 5건 CONFIRM/MINOR, 2건 여전히 MAJOR | `41a4878` |
| 2 | Group B 24건 (9개 카테고리) | 완전 재조사 (producer+reviewer) | 12/24 1차 수락 | — |
| 3 | Group A 실패 2건 대체 | 완전 재조사 (전용 배치) | `trv2-draft-06` 대체 성공, `eml2-draft-02` 대체 실패 | — |
| 4 | Group B reject 중 authorityRoleCompliant 단독 실패 7건 | 격리 교정 | 6/7 성공 | — |
| — | wave-3 적용 | 라운드 2·3·4 산출물 원장 반영 (13 슬롯 + 6 overflow) | — | `ef0d218` |
| 5 | Group B reject 중 evidenceReal=true 미처리 11건 | 격리 교정 | 8/11 성공 (mobility-transit 완전 해소) | — |
| — | wave-4 적용 | 라운드 5 산출물 원장 반영 (6 슬롯 + 2 overflow) | — | `779186a` |
| 6 (최종) | `eml2-draft-02` 대체 마지막 시도 3건 | 격리 교정 | 3/3 실패 | — |

각 "성공" 판정은 원 producer/reviewer와 무관한 신규 격리 컨텍스트가 evidence.sourceUrl을 WebFetch로 직접 재확인한 뒤 6항목(evidenceReal, categoryMatch, lifeNeedSupport, authorityRoleCompliant, evidencePrecision, internalConsistency) 전부에 대해 내린 것이다.

## 3. 슬롯 교체 23건

구 후보 23건을 `retracted-defect` 상태로 표시했다(스키마는 `fa3a2f0` 참조). 그중 19건은 실제 슬롯을 점유하고 있어 새 후보로 교체했고, 4건(`mbi-draft-05`, `mob2-draft-05`, `trv2-draft-06`, `eml-draft-03`)은 애초에 overflow였다 -- 이 중 2건(`trv2-draft-06`, `eml-draft-03`)은 overflow 자리도 새 후보로 교체했고, 2건(`mbi-draft-05`, `mob2-draft-05`)은 대체 없이 회수만 했다.

각 구 후보의 원 리뷰 기록(`verdict: accept`)은 고치지 않았다 -- 당시(4항목 rubric 기준) 사실이었기 때문이다. `retracted-defect`가 이후 발견된 결함과 대체 이력을 별도로 기록하고, 슬롯 교체분은 `attemptHistory`에 `supersededCandidateId`·`replacementCandidateId`를 남긴다.

## 4. 미해결 3건

| 슬롯 | 후보 | 실패 이력 |
|---|---|---|
| `restaurants-local-08` | `res3-draft-02` | 재시도 없음 -- Group B가 이 카테고리에 생산 5건(res-r2-01~05)을 배정했으나 성공 3건(01, 03, 04)이 다른 3개 슬롯(`res2-draft-02`, `res3-draft-03`, `res3-draft-01`)으로 먼저 소진돼 순번상 배정받지 못함 |
| `restaurants-local-10` | `res3-draft-04` | 위와 동일한 이유로 미배정 |
| `email-calendar-07` | `eml2-draft-02` | **3라운드 연속 실패**. ①원 조사(evidenceReal=false, categoryMatch=false) ②보충 재조사 3건 전부 reject(주로 authorityRoleCompliant+evidencePrecision+internalConsistency 복합 실패) ③최종 교정 시도 3건 전부 실패 -- 그중 1건은 재검토자가 "이 소재의 완료 조건과 권위 있는 최종 상태는 email 서비스가 아니라 공적 분쟁조정 절차에서 성립하므로 government-civic이 맞다"고 지적(교정 담당자는 반대 판단을 자인한 채 email-calendar를 유지해 DEFECT-MAJOR), 다른 1건은 "비밀번호 분실"과 "사용자 이름 분실"이라는 원문의 서로 다른 두 절차를 한 흐름으로 합친 구조적 오류가 반복됨 |

restaurants-local 2건은 순수 생산량 부족(수요 5 > 공급 3)이고, email-calendar 1건은 이 특정 소재(개인정보 침해 사고 신고, 계정 복구 절차)가 email-calendar 카테고리의 완료조건과 구조적으로 잘 맞지 않거나(카테고리 재검토 여지), 원문 자체가 두 개의 서로 다른 절차를 담고 있어 하나의 시나리오로 뭉치기 어려운 것으로 보인다. 다음에 이 슬롯을 다시 시도한다면 email-calendar가 아니라 government-civic 카테고리에서, 또는 완전히 다른 소재에서 시작하는 편이 나을 수 있다.

## 5. 하지 않은 것

- 결함이 확인된 3개 슬롯의 콘텐츠를 임의로 수정하거나 가리지 않았다. 감사에서 MAJOR로 확인된 원래 콘텐츠가 그대로 남아 있다.
- 100/100 슬롯 표시를 97/100으로 낮추지 않았다. 사용자가 명시적으로 "결함 있는 채로 유지"를 선택했다.
- 추가 재조사 라운드를 진행하지 않았다. `eml2-draft-02`는 이미 3라운드(원 조사 + 보충 + 최종 교정) 실패했고, 반복의 한계효용이 낮다고 판단했다.
- `mob-r2-04`(evidenceReal=true, 5항목 pass, categoryMatch만 실패 -- 재검토자는 travel-accommodation 제안)는 적용하지 않았다. mobility-transit 슬롯이 이미 다른 후보로 채워져 급하지 않았고, travel-accommodation도 이미 충족 상태라 여분으로만 남겨둔다.

## 6. 회귀 상태

validate PASS(occupied=100), mica 회귀 30+5+16 전부 그린, vooy-mika 회귀 10 그린. git push, Notion, Slack 반영 없음 -- 전부 로컬 커밋만.
