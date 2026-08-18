---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: proposed-for-cross-runtime-review
scope: low-resource-core-20-by-next-day
language: ko
inputs:
  - work/method-reviews/2026-08-14-std-b12-closure-handoff.md
  - work/method-reviews/2026-08-14-measurement-throughput-analysis.md
  - work/method-reviews/2026-08-14-standard-v1.3.5-final-convergence.md
---

# 저비용 Core 20 완성 계획

## 0. 목표

내일까지 서로 다른 portfolio slot 20개를 `core-slot-qualified`로 만든다.

20은 raw candidate 수가 아니다. 다음 조건을 모두 통과해 실제 portfolio ledger의 서로 다른 slot을 점유한 수다.

1. 수락된 근거와 독립 source review가 있다.
2. 수락·동결된 need observation이 있다.
3. 수락·동결된 task candidate가 있다.
4. post-freeze comparison이 `duplicate`가 아니다.
5. 필수 catalog annotation이 있다.
6. annotation을 작성하지 않은 별도 reviewer가 accept했다.
7. 같은 candidate와 같은 slot의 중복 점유가 없다.
8. portfolio apply가 receipt와 함께 성공했다.

`measurement-designed`는 이 20개 점유의 선행 조건이 아니다.

## 1. 상태 모델 수정

### Core 축

```text
frozen-candidate
  -> post-freeze-compared
  -> catalog-annotated
  -> annotation-reviewed
  -> core-slot-qualified
```

### Execution 축

```text
core-slot-qualified
  -> measurement-selected
  -> measurement-designed
  -> rehearsal-passed
  -> system-attempted
```

두 축은 독립이다.

- core slot 점유는 공개 100개 포트폴리오의 완성도를 나타낸다.
- measurement 상태는 실제 실행 큐에 넣을 준비 정도를 나타낸다.
- measurement reject가 frozen candidate 계보와 core annotation을 삭제하지 않는다.
- measurement-designed가 아니어도 core-slot-qualified가 될 수 있다.
- 실제 실행에 투입할 후보만 상세 measurement asset을 만든다.

## 2. Core 20 필수 annotation

각 후보에는 다음만 결속한다.

- candidateId
- sourceFrozenRowSha256
- categoryId
- proposedSlotId
- terminationClass
- declaredComplexity
- targetSurface
- surfaceStatus: `target-only`
- expectedDiagnosticAxes
- marketApplicability
- annotatorContextId
- annotation reviewer verdict
- reviewNote

`confirmedSurface`와 `observedDiagnosticAxes`는 금지한다. 두 값은 시장 통합 또는 실제 실행 이후에만 만든다.

annotation rationale은 필드별 장문으로 쓰지 않는다. 후보 전체에 대해 한두 문장의 `reviewNote`만 허용한다.

## 3. 기존 56건 처리

56건 전체를 먼저 장문 검토하지 않는다.

### 3.1 deterministic prefilter

스크립트가 다음을 기계적으로 추출한다.

- closed batch 여부
- frozen candidate raw-row SHA
- candidate review accept 여부
- comparison verdict
- 현재 category metadata
- 기존 공개 ID
- source·observation·candidate 계보

### 3.2 우선순위 20건 선택

다음 순서로 20건을 고른다.

1. comparison이 `duplicate`가 아닌 후보
2. 근거·관찰·후보 review가 모두 accept인 후보
3. 아직 비어 있는 category·slot을 채우는 후보
4. 현재 편중이 낮은 category의 후보
5. 동일 필요·동일 final state 후보와 거리가 먼 후보
6. annotation 근거가 명확한 후보

처음 선택한 후보가 annotation review에서 reject되면 21번째 후보로 교체한다. raw 후보 수를 20으로 맞추는 것이 아니라 accepted unique slot을 20으로 맞춘다.

### 3.3 compact packet

semantic annotation에 전달하는 입력은 다음 필드로 제한한다.

- candidateId
- userRequest
- initialState
- finalState
- approvalBoundary
- prohibitedStates
- failureRecoveryEvents
- marketScope
- comparison verdict와 closest IDs

전체 대화, 전체 measurement asset, oracle, 과거 후보 본문은 넣지 않는다.

20건을 10건씩 두 packet으로 처리한다.

## 4. 역할 분담

### Codex

- v1.3.5 최소 schema와 validator 구현
- closingShaLedger 자동 도출·검증
- 기존 후보 deterministic prefilter
- compact packet 생성
- annotation 결과 기계 검증
- independent annotation review
- portfolio apply와 100-slot ledger
- 실제 empty slot 계산
- 진행판과 인수인계 집계

### Claude Code annotation 세션

- compact packet만 읽는다.
- 20건의 semantic annotation을 작성한다.
- 기존 전체 catalog와 measurement asset은 읽지 않는다.
- 장문 해설을 쓰지 않는다.
- role output만 저장하고 종료한다.

### Claude Code 신규 생산 세션

기존 56건에서 accepted unique slot 20개가 나오지 않을 때만 연다.

- Codex가 만든 empty slot brief만 읽는다.
- 기존 후보와 comparison 결과는 읽지 않는다.
- 부족 수량만 5건 단위로 생산한다.
- source -> observation -> candidate freeze까지만 우선 완료한다.
- measurement asset은 만들지 않는다.

## 5. 측정 단계 비용 축소

Core 20을 만들기 전에는 신규 상세 measurement asset을 만들지 않는다.

Core 20 이후 대표 2~3건만 선택해 다음을 검증한다.

1. 작성 중 preflight validator
2. 공통 core와 variant 레코드 분해
3. variant 5 유지 반증 실험

preflight validator의 최소 검사는 다음이다.

- variant 동시 성립 가능성
- terminal 도달 가능성
- worstPath 산술 일치
- 판정 클래스 단일성
- 금지 상태 결속 근거
- gate·locked path 1:1
- EXP registry 폐포
- approval anchor 자기모순

검증기를 먼저 적용하고도 통과율이 회복되지 않을 때만 variant 축소를 검토한다.

## 6. closingShaLedger 안전 수정

controller가 `closingShaLedger` 값을 손으로 적지 못하게 한다.

- 도구가 대상 파일을 직접 읽어 SHA-256을 도출한다.
- closure 작성 명령이 ledger를 자동 생성한다.
- validate-batch가 각 ledger 항목을 실제 파일 SHA와 대조한다.
- 누락, 창작 값, 절단값, stale 값은 모두 fail-closed한다.

이 수정은 semantic 작업과 무관한 작은 안전 패치이므로 v1.3.5 최소 구현에 포함한다.

## 7. 시간 예산

| 구간 | 예상 시간 |
|---|---:|
| std-b12 종결 확인과 clean baseline | 20~40분 |
| v1.3.5 최소 schema·validator·SHA 안전 패치 | 1.5~2.5시간 |
| 기존 56건 prefilter와 compact packet 생성 | 30~50분 |
| 20건 annotation 작성 | 40~70분 |
| 독립 review·교체·portfolio apply | 60~100분 |
| 부족 slot용 신규 후보 0~5건 | 필요 시 1.5~3시간 |
| 미팅용 진행판·요약 | 30~45분 |

기존 56건에서 20개 unique slot을 확보하면 총 4~6시간을 예상한다. 부족 후보를 새로 만들면 6~9시간을 예상한다.

## 8. 토큰 예산 절감 규칙

정확한 크레딧 잔량을 알 수 없으므로 절대 토큰량을 보장하지 않는다. 기존 방식 대비 모델 입력·출력을 60~75% 줄이는 것을 목표로 한다.

- 전체 56건을 모델에 한 번에 넣지 않는다.
- compact packet 10건씩 두 번만 semantic annotation한다.
- review는 전건 장문 판정 대신 enum·SHA·한두 문장 note로 제한한다.
- history, Notion, Slack, site, measurement asset은 annotation session 입력에서 제외한다.
- 같은 자료를 여러 독립 모델에 반복 입력하지 않는다.
- exact-SHA 전체 검증은 micro edit마다 하지 않고 revision transaction 끝에서 한 번 수행한다.
- 신규 생산은 부족 수량만 5건 단위로 한다.
- 측정 자산은 Core 20 이후 대표 2~3건만 만든다.
- 실제 실행, market confirmation, private holdout 저작은 이번 목표에서 제외한다.

## 9. 내일 보고 수치

미팅에는 다음 다섯 수치만 우선 보고한다.

1. `core-slot-qualified`: 목표 20
2. annotation reviewed: 목표 20 이상
3. raw frozen candidate: 참고 수치
4. measurement-designed: 목표 0~3
5. system-attempted: 현 단계 0 허용

`raw candidate 56`을 `slot 56개 완성`으로 표현하지 않는다.

## 10. 중단·전환 조건

- 기존 후보에서 unique accepted slot 20개가 나오면 신규 생산을 시작하지 않는다.
- 20개가 안 나오면 부족 수량만 clean-room으로 생산한다.
- annotation reject율이 30%를 넘으면 자동 prefill 규칙을 먼저 고친다.
- validator 구현이 3시간을 넘기면 nonessential site·export 작업을 미루고 annotation validator와 slot ledger만 남긴다.
- 크레딧 경고가 오면 한 packet의 크기를 10에서 5로 줄이고 deep measurement를 전부 미룬다.
- Core 20과 ledger receipt가 완성되면 이번 목표를 종료한다.

## 11. 다음 검토 요청

Claude Code는 이 계획을 읽기 전용으로 검토한다.

검토 질문:

1. `measurement-designed`를 core slot 점유 선행 조건에서 빼는 것이 공식 방법론과 충돌하는가.
2. Core 20 필수 annotation에 빠진 공개 시점 필수 필드가 있는가.
3. compact packet이 의미 판정에 충분한가.
4. 4~6시간과 입력·출력 60~75% 절감 추정이 과도한가.
5. std-b12 결함 중 Core 20 전에 반드시 고쳐야 할 항목이 closingShaLedger 외에 있는가.
