---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: controller-review-record
scope: draft-r1-full-session-reaudit
language: ko
asOf: 2026-08-18
decidedBy: Claude Code 주 컨트롤러 (Fable 검수 패스)
appliesFrom: draft-r1 재작업 산출물 및 사이트 반영 전체
---

# Fable 검수 패스: 재작업 전체 재감사와 보완

## 0. 범위와 방법

이번 세션의 재작업 산출물 전체(원장 4파일, 재작업 투입 27건, 사이트 코드, 기록 문서)를 다시 검사했다. validator가 검사하지 않는 사슬까지 원시 바이트에서 독립 재계산했다:

- annotation의 `sourceFrozenRowSha256` ↔ 실제 동결 원문 행 해시 (draft-r1 계보 90건 전수)
- review의 `annotationRowSha256` ↔ 실제 annotation 행 해시 (147건 전수)
- 슬롯 캐시 SHA·tier·disposition·proposedSlotId 결속 (100슬롯 전수)
- 세션 추가 27건의 구조 완전성(키 순서, evidence 6키, 배열 필드, originalCategoryId 일치)
- superseded-defect 이력의 대체 후보 ↔ 현 점유자 일치, retracted 후보의 미점유 확인

**결과: SHA 사슬과 구조 결속은 전수 무결.** 아래는 발견하고 보완한 항목과, 보완하지 않고 기록만 남기는 항목이다.

## 1. 발견 1: failureRecoveryEvents 결측 9건 (보완 완료 7건)

재작업 투입 27건 중 9건의 `failureRecoveryEvents`가 빈 배열이었다. 원본 63건은 100% 충전 상태라 모집단 기준 미달이며, 사이트 카탈로그에도 "별도 항목 없음"으로 노출되고 있었다. 원인 추적 결과 컨트롤러 이관 스크립트의 유실이 아니라 Group B 생산 단계부터 빈 배열이었고(재작업 프롬프트가 이 필드의 비어있음을 막지 않았음), 당시 검토자들도 이를 결격 사유로 삼지 않았다.

격리 producer(원문 재조사) + 격리 reviewer(6항목 rubric) 파이프라인으로 보완했다. 수락 기준은 accepted-only 원칙 그대로다:

| 후보 | 결과 | 반영 |
|---|---|---|
| `hom-r2-02` | accept | 3개 사건 반영 |
| `hea-r2-02` | accept | 3개 사건 반영 |
| `ema-r2-03` | accept | 1개 사건 반영 |
| `hom-r2-05` | 부분: 검토자가 1번 항목만 명시 승인(2번은 startState와 모순) | 1번만 반영 |
| `tel-r2-02` | 부분: 검토자가 3번만 무결로 확인(1번 경미한 확대해석, 2번 원문 밖 창구 추론) | 3번만 반영 |
| `sho-r2-05` | 부분: 1번 무결, 2번 대안조치 누락, 3번 조항 오결합 | 1번만 반영 |
| `sho-r2-06` | 부분: 1번 당사자 오귀속, 2번 무결 | 2번만 반영 |
| `hea-r2-03` | 0건 유지: 원문(2문장 상담사례)에 복구 경로가 전혀 없어 채우면 창작이 됨 | 반영 없음(정당) |
| `hom-r2-04` | 새 항목 2개는 유효하나 검토자가 카테고리 자체에 이견 제기 | 반영 없음(§3 참조) |

부분 반영은 검토자가 항목 단위로 명시 판정한 것만 집행한 것이다(컨트롤러가 새 판단을 만들지 않음). SHA 3~4계층 캐스케이드 갱신 후 validate PASS, 전수 재감사 무결 재확인.

## 2. 발견 2: em dash 규칙 위반 (보완 완료)

전역 출력 규칙(em dash 금지)을 위반한 곳:

- 컨트롤러 작성 문서 2건: `2026-08-18-draft-tier-review-rubric-hardening.md` 5곳, `2026-08-18-draft-tier-32-defect-remediation-closure.md` 7곳. 콜론·하이픈으로 치환 완료.
- 세션 중 생산된 후보 3건의 본문: `mon-r2-04.confirmationBoundary`, `sho-r2-04.evidence.publisher`, `sho-r2-05.evidence.publisher`. 격리 컨텍스트가 구두점만 치환했고, 컨트롤러가 기계 검증(치환 외 문자 불변)으로 확인 후 캐스케이드 반영.
- 치환하지 않은 곳: 이전 세션 유래 파일들(사이트 코드 주석·독스트링 7곳, 이전 파도의 trv2 계열 후보 5건). 규칙상 기존 문서의 em dash는 명시 지시 없이 일괄 치환하지 않는다.

## 3. 발견 3: 카테고리 판정 이견 2건 (조치 없음, 기록만)

field-fill 재검토 과정에서 검토자가 기존 콘텐츠에 대해 새 이견을 제기했다. 이전 검토자(수락)와 이번 검토자(반대)의 독립 판단이 충돌하는 사안이라 일방 조치 없이 기록만 남긴다. 둘 다 이 세션에서 반복된 같은 구조적 경계 문제다: **완료 조건이 분쟁조정·상담 절차에서 성립하는 후보를 소재 카테고리에 둘 것인가.**

| 후보 | 위치 | 이견 요지 |
|---|---|---|
| `hom-r2-04` | home-utilities overflow (슬롯 없음) | 완료 조건이 임대차분쟁조정 성립이므로 주거 공과금 축이 아니라는 판정. 앞선 wave-3 검토자는 수락했음 |
| `hea-r2-03` | healthcare-administration-10 (슬롯 점유) | 완료 조건이 "법적 근거 확인 시점 종결"(정보 취득)이라 의료행정 최종 상태가 성립하지 않고, categoryRationale과 canonicalFinalState가 서로 모순된다는 판정. wave-4 검토자는 CONFIRM했음 |

같은 계열의 기존 기록: `hca-draft-08`(Group C 보류), `ema-r3-01`(government-civic 제안), `eml2-draft-02`(3라운드 실패의 한 원인). 카테고리 택소노미에서 "공적 구제 절차 완결형" 후보의 소속을 어떻게 정할지는 방법론 차원의 결정이 필요하며, 개별 건 패치로 풀 문제가 아니다. 다음 rubric 개정 시 판정 규칙에 경계 사례 지침을 추가할 것을 권고한다.

## 4. 발견 4: 배치 기록 stale (보완 완료)

`draft-r1/batch-manifest.json`이 wave-2까지만 기록하고 있었다(acceptedCandidateCount 63, 실제 동결 90행). closure.json의 `frozenCandidatesSha256`도 63행 시점 값이었다. wave-3-remediation, wave-4-remediation, field-fill-1 파도 기록을 추가하고 수치·해시를 현재 파일 기준으로 갱신했다.

## 5. 발견 5: 라이브 진행판이 낡음 (조치 보류, 사용자 결정 필요)

`https://mica-kiheon-progress.vercel.app/`는 동결 56건·슬롯 48/100 시점, 즉 draft-r1 작업 전체 이전 상태를 보여주고 있다. vooy-mika의 Vercel 연결은 CLI 수동 배포 방식이라 GitHub push가 라이브에 반영되지 않는다. 배포는 명시 승인이 필요한 별도 단계이므로 컨트롤러가 실행하지 않았다.

## 6. 사이트 보완 (완료)

- 범례 innerHTML에 escapeHtml 적용(기존 textContent에서 innerHTML로 바꿀 때 빠뜨린 방어. 현재 데이터는 저장소 통제라 실위험은 없었음).
- "결함 회수" 배지에 설명 툴팁 추가.

## 7. 이 검수가 확인만 하고 바꾸지 않은 것

- 3개 결함 유지 슬롯(사용자 결정)과 그 표시 체계.
- retracted 23건의 원 리뷰 기록(당시 사실).
- `hea-r2-04`의 실명 치환 등 앞선 반영분(전부 무결 재확인).
- 이전 세션 유래 파일의 em dash.
