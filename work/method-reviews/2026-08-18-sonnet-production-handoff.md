---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: production-handoff
scope: next-scenario-production-session
language: ko
asOf: 2026-08-18
preparedBy: Claude Code 주 컨트롤러 (Fable 패스)
appliesFrom: 다음 시나리오 발굴 세션 (Sonnet 주도)
relatedDocs:
  - work/method-reviews/2026-08-18-category-boundary-rule.md
  - work/method-reviews/2026-08-18-fable-review-supplement.md
  - work/method-reviews/2026-08-18-draft-tier-32-defect-remediation-closure.md
---

# 시나리오 발굴 세션 인계 브리프

## 0. 현재 상태 한 줄

100/100 슬롯 점유, 그중 96개가 6항목 rubric 통과, **4개가 결함 표시 상태로 재발굴 대기**. 원장 SHA 사슬은 전수 무결(Fable 재감사 완료).

## 1. 발굴 대상 (우선순위순)

| 슬롯 | 현 점유 | 상황 | 발굴 지침 |
|---|---|---|---|
| `restaurants-local-08` | `res3-draft-02` | 생산량 부족(수요 5 > 성공 3)으로 미교체 | 검증된 소재 지침 사용: 분쟁조정 결정례 + 신고 절차 페이지. wave-2에서 이 조합으로 4/4 전건 통과했음 |
| `restaurants-local-10` | `res3-draft-04` | 위와 동일 | 위와 동일 |
| `email-calendar-07` | `eml2-draft-02` | 3라운드 연속 실패 | **소재 전환 필수**: 완료 조건이 이메일·캘린더 도메인의 실제 상태 변화(계정 접근, 수신 상태, 일정 상태)로 성립하는 소재만. 공적 신고·상담으로 완결되는 소재 금지(경계 규칙 (b)). 성공 선례: `ema-r2-03`(계정 보호조치 해제 후 보안 점검), `eml3-draft-03`(캘린더 스팸 신고+설정) |
| `healthcare-administration-10` | `hea-r2-03` | 경계 규칙 판정으로 부적합 확정(정보 취득 종결) | 완료 조건이 의료 행정의 외부 상태 변화(접수·취소·발급·환급 확정)로 성립하는 소재. 성공 선례: `hea-r2-01`(환급금 지급), `hea-r2-02`(검진 취소 접수) |

가용 여분: `mob-r2-04`(항공권 취소수수료 조정례, 6항목 중 5 pass, 경계 규칙상 `travel-accommodation` 재분류가 맞음: travel은 이미 충족이라 overflow 편입만 가능).

## 2. 생산 프롬프트에 반드시 넣을 것

이번 세션에서 실측으로 확인된 함정들이다. 재작업 프롬프트에 이미 검증된 문구가 있으니 재사용한다(scratchpad 소실 시 이 목록으로 재구성).

1. **6항목 rubric 전문**: 특히 evidencePrecision(본문 전 필드 문장 단위 대조)과 internalConsistency. role-prompts.md §2.2가 정본.
2. **카테고리 경계 지침**: role-prompts.md §2.2 categoryMatch 항에 통합됨. 이것이 없어서 eml2 슬롯이 3라운드 실패했다.
3. **`failureRecoveryEvents`는 원문이 지지하는 1~3개를 반드시 작성, 지지가 없으면 빈 배열+사유**: Group B 재작업분 9/27이 이 필드를 비워서 냈고 검토자도 안 잡았다. 명시 요구가 없으면 또 빈다.
4. **em dash(U+2014) 금지**: 생산자 프롬프트에 명시. 이번에 3건이 새어 나와 격리 치환으로 정리했다.
5. **실명은 evidence 안에만**: authorityRoleCompliant 단독 실패가 Group B에서 7건. "분쟁조정 사례집을 근거로 쓸 때 결정 주체 기관명을 본문에 옮기지 마라"를 구체 예시로 넣을 것.
6. **조사 채널**: B층 카테고리(외식·예약 등)는 분쟁조정 결정례 + 민간 약관을 우선. §1.1 네 채널 동등 원칙.

## 3. 반영 절차 (검증된 경로)

1. 생산: producer(Sonnet high) + reviewer(Opus xhigh 권장, 검토 품질이 병목이었음) 격리 쌍. 후보 데이터는 workflow `args`가 아니라 스크립트에 JS 리터럴로 임베드(Python 생성 + `node --check`).
2. 수락분 동결: draft-r1 파일에 append, wave 기록을 `batch-manifest.json`에 추가.
3. 분류: 격리 annotator+reviewer 쌍으로 terminationClass/declaredComplexity/targetSurface/measurementIntent.
4. 원장 반영: 슬롯 교체는 4계층(frozen → sourceFrozenRowSha256 → annotationRowSha256 → 슬롯 캐시 + attemptHistory superseded 이벤트), overflow는 3계층. 구 후보는 `retracted-defect`, `known-defect-unresolved` 마커 제거.
5. JSONL 편집은 **반드시 행 단위 외과 수정**(catalog 파일들은 전행 round-trip이 byte-identical하지 않음, 통짜 재직렬화 금지).
6. 검증: `mica-portfolio.py validate` + 회귀 3종 + 전수 사슬 감사(스크래치 `fable-audit.py` 패턴 재작성: annotation↔frozen 해시까지 볼 것. validator는 이 링크를 안 본다).
7. 사이트: `vooy-mika/tools/build-site-data.py` 재생성 → 테스트 → 커밋. push·배포는 사용자 승인.

## 4. 열린 방법론 항목 (발굴과 별개)

- `hca-draft-08` 보류 유지 중, 다음 annotation 라운드에서 경계 규칙으로 재판정.
- 측정 축: `df-b12-01`~`04` 측정 자산 내부 정합 결함이 여전히 열려 있음(std-b12 유래). 저작 중 preflight validator 구현이 선행 과제.
- verified tier 신규 생산은 job-packet clean-room lane(`standard-v1.3.5`)이 정본. 구 in-repo lane(std-b11)은 폐기 확정.
