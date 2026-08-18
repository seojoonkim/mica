# MICA Bench MECE 확장 통합기획안

## Multinational Index of Consumer Agents

- 문서 상태: 제품·데이터·평가·UX 통합 기준안
- 지원 범위: 대한민국, 일본, 싱가포르, 대만, 태국, 아랍에미리트 6개국 전체
- 실행 범위: 단일 국가, 단일 과제의 전체 국가 비교, 또는 사용자 지정 국가×과제 조합
- 기준 제품 계약: 10개 소비 도메인, 100개 canonical task, Accuracy·Speed·Cost
- 확장 원칙: 국가 수나 task 수를 먼저 늘리지 않고, 동일 task를 현실적인 조건에서 반복 검증할 수 있는 실행·진단 체계로 깊이를 확장한다.

---

## 1. 한 문장 전략

> MICA는 6개국의 같은 생활 과제를 현실 조건에서 시험하고, 실제 완료·속도·비용을 측정하며, 성공과 실패의 원인을 설명하는 소비자 에이전트 벤치마크다.

MICA의 대외 상위 프레임워크는 세 단계만 보여준다.

# Test → Measure → Explain

한국어 표현은 다음과 같다.

# 현실을 시험한다 → 완료를 측정한다 → 원인을 설명한다

1. **Test / 현실을 시험한다**  
   같은 canonical task를 국가별 실행 환경과 현실적인 사용자 입력으로 시험한다.
2. **Measure / 완료를 측정한다**  
   실제 최종 상태를 확인하고 Accuracy, Speed, Cost를 각각 측정한다.
3. **Explain / 원인을 설명한다**  
   실행 중 관측한 행동과 최초 결정적 실패 원인으로 시스템의 강점과 약점을 설명한다.

이 세 단계는 질문이 다르므로 겹치지 않는다.

- Test는 evaluator가 실행 전에 고정한 **독립 조건**이다.
- Measure는 실행 후 확인한 **결과**다.
- Explain은 결과를 만든 행동과 시스템 원인에 대한 **사후 분석**이다.

내부의 정밀한 5개 역할 계층은 이 상위 구조를 구현하기 위한 데이터 계약으로 유지하되, 홈페이지의 첫 설명에서는 노출하지 않는다.

---

## 2. 왜 이 구조가 필요한가

현재 MICA에는 좋은 재료가 이미 있다.

- 6개 시장
- 10개 소비 도메인
- 100개 public-set canonical task 후보
- 20개 hero mission
- 국가별 market hazard와 integration situation
- Accuracy, Speed, Cost 결과 계약
- Orchestration, Model Routing, Memory, Tool/API Use, Localization, Safety, Recovery 진단 축

하지만 현재 제품에서는 다음 개념들이 서로 다른 깊이에서 한꺼번에 나타난다.

- 국가
- task family
- canonical task
- integration condition
- input realism
- capability
- outcome
- diagnosis

이 상태에서는 방문자가 세 가지를 혼동하기 쉽다.

1. **시험 조건**과 **시스템 능력**을 같은 분류축으로 오해한다.
2. **결과 점수**와 **실패 원인**을 하나의 리더보드 점수로 합쳐야 한다고 오해한다.
3. 100개 task가 곧 100개의 실제 실행 scenario라고 오해한다.

통합안은 이를 하나의 평가 흐름으로 정리한다.

```text
Canonical task
  + 6-country market execution binding
  + realistic task instance
                  ↓
               Run trace
                  ↓
     verified outcome + causal diagnosis
```

---

## 3. 상위 프레임워크와 내부 MECE 계약

### 3.1 Test: 무엇을 어떤 현실에서 시험하는가

Test에는 실행 전에 정해지는 것만 둔다.

#### A. What: 목표

- 10개 소비 도메인
- 100개 canonical task
- canonical final state
- confirmation boundary
- 허용·금지 행동
- hard validator

#### B. Where: 6개국 실행 환경

- 시장, 언어, 통화, 시간대
- 현지 서비스와 공급자
- 웹, 앱, API, 전화, 사람 handoff 표면
- 계정, 인증, 권한, 정책
- 초기 backend state
- 완료 의미와 증거
- 장애와 허용 복구 경로
- 정보의 위치, 최신성, authoritative source

#### C. How asked: 현실적인 입력

- 요청 명세의 충분성
- 단일 턴·다중 턴·분산 대화
- 장황함과 distractor
- 수정·번복·scope 변화
- 명시적·지시적·모호한 참조
- 사용자 주장의 확신 형태
- text, image, screenshot, document, audio, transcript
- OCR/ASR 저하, 잘림, 저가독성, artifact 간 충돌

`canonical task + market execution binding + task instance`가 실행 가능한 Test cell을 만든다.

### 3.2 Measure: 실제로 끝냈는가

공식 결과는 기존 계약을 그대로 유지한다.

- **Accuracy:** 선언된 final state를 confirmation boundary 안에서 실제로 달성했는가
- **Speed:** 첫 입력부터 성공 또는 정당한 handoff까지 걸린 wall-clock 시간
- **Cost:** 모델, 도구/API, 검색, 실패 후 재시도에 사용한 실행 비용

run-level 내부 계산 계약:

`100 × normalized Accuracy × normalized Speed × normalized Cost`

보존 규칙:

- Accuracy, Speed, Cost의 원시값을 각각 공개한다.
- 결과를 하나의 글로벌 단일 순위로 축약하지 않는다.
- realism 난이도나 capability behavior에 보너스 점수를 주지 않는다.
- 질문을 잘했거나 거의 완료했다는 이유로 Accuracy에 부분 점수를 더하지 않는다.
- 정당한 handoff는 사전 등록된 termination class와 boundary에 따라 성공일 수 있다.

### 3.3 Explain: 왜 성공하거나 실패했는가

Explain은 두 종류의 관측을 분리한다.

#### A. 요구 능력과 관측 행동

실행 전에 task instance가 요구하는 능력을 태그한다.

1. Intent Resolution
2. Goal & Constraint State Tracking
3. Evidence-Grounded Memory Retrieval
4. Reference Resolution
5. Information-Seeking & Clarification Calibration
6. Multimodal Grounding
7. Epistemic Calibration

실행 후에는 각 능력이 실제로 어떤 행동으로 나타났는지 trace event로 기록한다. 이는 결과 점수가 아니다.

#### B. 최초 결정적 실패 원인

실패를 막기 위해 시스템에서 가장 먼저 달라져야 했던 원인을 하나만 고른다.

1. Orchestration
2. Model Routing
3. Memory
4. Tool/API Use
5. Localization
6. Safety
7. Recovery

- primary diagnosis는 하나만 둔다.
- secondary contributor는 최대 하나만 둔다.
- 증거가 부족하면 억지로 고르지 않고 `unresolved`로 둔다.
- capability와 diagnosis는 다대다 관계이므로 하나의 codebook으로 합치지 않는다.

### 3.4 내부 5계층과 외부 3단의 대응

- Domain, Execution & Information Environment, Input Realism → **Test**
- Outcome → **Measure**
- Required Capability, Observed Behavior, Diagnosis → **Explain**

내부 Layer 1~3은 외생 설계 변수, Layer 4는 파생 요구 태그와 관측 행동, Layer 5는 종속 결과와 사후 원인이다. 다섯 항목은 동급 taxonomy도, 하나의 가중 점수 항목도 아니다.

---

## 4. 6개국 전체 범위 계약

### 4.1 국가 범위

MICA의 통합 실행 범위는 다음 6개국 전체다.

1. 대한민국 (`kr`)
2. 일본 (`jp`)
3. 싱가포르 (`sg`)
4. 대만 (`tw`)
5. 태국 (`th`)
6. 아랍에미리트 (`ae`)

### 4.2 핵심 원칙: 국가를 번역본으로 취급하지 않는다

공통인 것:

- canonical task의 소비 목적
- 허용 가능한 final state의 의미
- 핵심 validator intent
- confirmation boundary의 안전 원칙
- Accuracy, Speed, Cost 측정 계약

국가별로 달라지는 것:

- 서비스와 공급자
- 실행 surface
- 주소·이름·날짜·통화 형식
- 결제·본인확인·권한 경계
- 공식 정보 출처
- 휴일·영업·재고·예약 규칙
- 완료와 post-action readback 방식
- 실패·재시도·handoff 경로

따라서 하나의 canonical task는 6개의 `market_execution_binding`과 연결된다. 단, 해당 국가에서 목표 자체가 성립하지 않거나 서비스가 존재하지 않는 경우에는 억지 대체 시나리오를 만들지 않고 `not-applicable`을 근거와 함께 선언한다.

### 4.3 테스트 실행 범위는 선택할 수 있다

MICA의 카탈로그와 binding 체계는 6개국 전체를 지원하지만, 개별 experiment가 항상 6개국을 동시에 실행할 필요는 없다. 실행 계획은 `taskIds × countryCodes × instanceProfileIds`의 명시적 셀 집합으로 저장한다.

1. **Country-focused:** 한 국가를 선택해 여러 과제와 입력 변형을 깊게 시험한다.
2. **Task-focused cross-market:** 특정 canonical task를 선택해 6개국 전체 또는 선택한 여러 국가에서 비교한다.
3. **Custom matrix:** 필요한 국가와 과제의 조합만 선택해 실행한다.
4. **Full benchmark:** 검증된 전체 범위를 대상으로 실행한다.

모든 결과에는 선택 범위와 분모를 함께 공개한다. 단일 국가 결과를 cross-market 결과나 전체 MICA 결과로 표시할 수 없고, 특정 과제의 6개국 비교도 전체 100개 과제의 국가 비교로 확대 해석할 수 없다.

### 4.4 실행 범위 객체

```ts
EvaluationScope = {
  mode: "country-focused" | "task-focused" | "custom-matrix" | "full-benchmark";
  countryCodes: CountryCode[];
  canonicalTaskIds: CanonicalTaskId[];
  instanceProfileIds: TaskInstanceProfileId[];
  cellSelectionRule: "cartesian-product" | "explicit-cells";
  explicitCells?: Array<{ countryCode: CountryCode; canonicalTaskId: CanonicalTaskId }>;
};
```

실행 전 scope manifest를 검증하고 freeze한다. 빈 국가·과제·instance 선택, 중복 셀, 지원 universe 밖의 식별자, `cartesian-product`와 `explicitCells`의 동시 지정은 거부한다. `explicit-cells`는 하나 이상의 명시 셀을 요구하며, 적용 불가능한 binding은 실행하지 않고 근거가 있는 `not-applicable`로 남긴다.

실행 후에는 `planned / eligible / executed / failed / harness-failed / not-applicable` 셀 수와 포함 국가·과제 목록을 제목, 결과 화면, export에 함께 공개한다. 부분 실행에서 선택하지 않은 셀은 실패나 0점이 아니라 `unmeasured`로 유지한다.

`planned`는 freeze된 scope의 전체 셀 수, `eligible`은 `not-applicable`을 제외한 평가 가능 셀 수, `executed`는 실제 실행이 시작된 셀 수를 뜻한다. 집계 분모는 지표별로 공개하며, 실행 누락이나 harness failure를 조용히 제외해 성능을 부풀릴 수 없다.

---

## 5. 평가 단위와 데이터 모델

### 5.1 계층

```text
domain
└─ canonical_task
   └─ market_execution_binding
      └─ task_instance
         └─ run
            ├─ trajectory_event
            ├─ validator_result
            └─ diagnosis
```

### 5.2 책임 경계

#### `canonical_task`

안정적인 비교 단위다.

- goal
- constraints
- acceptable final states
- forbidden states
- confirmation boundary
- validator contract
- expected termination classes
- version

#### `market_execution_binding`

canonical task가 특정 국가의 실제 환경에서 어떻게 실행되는지를 정의한다.

- country
- locale, currency, timezone
- provider and service fixtures
- execution surfaces
- account, authorization, policy
- initial backend state
- irreversible commit boundary
- completion semantics
- required evidence
- recovery routes
- authoritative sources and timestamps
- applicability status and rationale

#### `task_instance`

같은 목표와 validator를 유지하면서 현실 입력과 정보 조건을 조작한다.

- `canonicalTaskId`
- `marketExecutionBindingId`
- information environment
- input profile
- oracle interaction policy
- required capabilities
- turn script
- artifact references
- ground truth
- expected termination
- lifecycle and public/holdout status

#### `run`

시스템이 한 task instance를 수행한 관측 기록이다.

- system and version
- instance and fixture version
- start/end timestamp
- model/tool/API events
- user question and scripted answer events
- handoff events
- state changes and side effects
- latency and cost ledger
- artifact and evidence references
- terminal outcome

#### `validator_result`

- final state readback
- hard checks
- boundary compliance
- evidence sufficiency
- eligibility
- raw Accuracy, Speed, Cost
- normalized components and internal run score

#### `diagnosis`

- first decisive error event
- primary diagnostic axis and subtype
- optional secondary contributor
- related required capabilities
- observed behaviors
- counterfactual fix
- evidence event IDs
- confidence or unresolved status

### 5.3 ID와 버전 규칙

- canonical goal 또는 validator가 바뀌면 canonical task major version을 올린다.
- 공급자·정책·fixture가 바뀌면 market binding version을 올린다.
- 발화·artifact·realism factor가 바뀌면 task instance version을 올린다.
- taxonomy 변경 후 기존 run을 조용히 재해석하지 않는다.
- 모든 결과는 task, binding, instance, evaluator, system version을 함께 고정한다.

### 5.4 현재 코드와의 차이

현재 canonical TypeScript export 기준:

- 6 countries
- 10 task families
- 100 public candidate tasks
- 0 validated tasks
- 20 hero missions
- 0 registered systems
- 0 run cells

현재 구현에는 국가·task·integration situation·결과 축·진단 축의 기반은 있으나 다음 실행 단위가 없다.

- 별도 `market_execution_binding` registry
- 현실 입력을 담는 `task_instance` registry
- oracle interaction fixture
- trajectory event schema
- deterministic validator result
- capability behavior evidence
- primary diagnosis artifact
- 실행 가능한 system/run data

따라서 다음 확장은 카탈로그 콘텐츠 추가가 아니라 이 실행 그래프를 구현하는 일이어야 한다.

---

## 6. 평가 설계

### 6.1 Clean anchor

각 canonical task와 6개 market binding 조합에는 기준 instance를 둔다.

- sufficient request
- single turn
- tight signal
- correction 없음
- fully named reference
- text 중심
- clean artifact
- current evidence
- 필요한 정보가 요청에 포함

anchor와 realism variation은 동일한 goal, final state, validator를 공유한다.

### 6.2 Family별 constrained covering array

모든 요인을 완전요인으로 조합하지 않는다.

- 각 task family에서 독립 조작 가능한 핵심 Input Realism factor 3~5개만 고른다.
- 시장은 기본적으로 block이다.
- 정보 환경, 권한, 정책은 fixed condition 또는 block으로 둔다.
- 시장, 정보 환경, 권한, 정책은 family covering array factor로 승격하지 않는다. 이들 조건의 상호작용 가설은 별도의 사전 등록된 blocked comparison 또는 mandatory risk cell로 검증한다.
- 불가능한 조합은 constraint로 사전 등록한다.
- strength-2 pair coverage를 기계 검증한다.
- constraint 때문에 빠진 필수 pair는 별도 강제 cell로 보완한다.

### 6.3 Mandatory risk cells

다음 고위험 조합은 covering array 결과와 관계없이 포함한다.

- 과거 기록 × 폐기된 기록 × 되돌릴 수 없는 행동
- 불완전 요청 × 도구로 확인 가능 × 불필요한 질문 유혹
- 불완전 요청 × 사용자만 아는 정보 × commit 전 필수 질문
- 수정 × 예정된 side effect × state update
- post-commit 번복 × recovery
- 잘린 screenshot × 모호한 참조
- 복수 artifact × 서로 충돌하는 정보
- OCR/ASR 오류 × 금액·날짜·주소
- 정책 제한 × 금지된 요청
- 일시적 도구 실패 × 허용된 복구 경로
- frontend 성공 표시 × backend validator 실패
- 근거 검색 성공 × 근거 없는 주장
- 접근 불가 정보 × 조작된 확신

### 6.4 Paired evaluation

같은 시스템·버전에서 clean anchor와 realism variation을 쌍으로 비교한다.

공개 항목:

- raw Accuracy 변화
- latency 변화
- cost 변화
- 질문·handoff 행동 변화
- constraint retention 변화
- capability behavior 변화

paired delta는 공식 결과에 다시 더하지 않는다.

### 6.5 Oracle Interaction Policy

정답 질문·handoff 정책을 instance마다 사전 등록한다.

- `must-not-ask-before-progress`
- `may-ask`
- `must-ask-before-commit`
- `must-handoff`

평가는 질문 문구 일치가 아니라 다음을 본다.

- 필요한 정보를 실제로 얻었는가
- 질문 전 가능한 안전한 진행을 했는가
- 추측 위험이 있는 commit을 막았는가
- handoff 시 상태와 다음 행동을 보존했는가

### 6.6 진단 신뢰도

- 자동 validator가 결과를 판정한다.
- 진단은 trace evidence를 기반으로 주석한다.
- primary diagnosis의 annotator agreement를 추적한다.
- 근거가 약하면 `unresolved`로 둔다.
- 모델 합의 자체를 ground truth로 사용하지 않는다.

---

## 7. 제품 정보구조

### 7.1 최상위 내비게이션

1. **Overview**
2. **Tasks**
3. **Markets**
4. **Results**
5. **Methodology**
6. **Governance**

내비게이션에서 내부 taxonomy 명칭을 늘어놓지 않는다. 사용자는 목표, 조건, 결과, 방법론 순으로 내려간다.

### 7.2 Overview

첫 화면이 10초 안에 답해야 할 질문:

1. 무엇을 평가하는가
2. 왜 기존 benchmark와 다른가
3. 결과를 어떻게 읽는가

권장 흐름:

- Hero: “Can consumer agents finish real life across markets?”
- 한 문장 정의
- Test → Measure → Explain 3단 diagram
- 6 markets / 10 domains / 100 canonical tasks 현황
- 하나의 대표 task가 6개국 현실 조건으로 갈라지는 예시
- Accuracy / Speed / Cost raw result 설명
- 결과가 아직 없으면 fail-closed preview 상태를 명확히 표시

### 7.3 Tasks

기존 10개 도메인과 100개 canonical task를 탐색한다.

필터:

- domain
- action/termination class
- confirmation boundary
- market applicability
- lifecycle: candidate / validated

Task detail:

- canonical goal
- final state
- confirmation boundary
- 6-country applicability matrix
- 각 국가 binding 상태
- available anchor/variation/risk instances
- validator contract
- 공개 결과로 이동

### 7.4 Markets

국가 소개 페이지를 단순 hazard essay가 아니라 실행 계약의 관문으로 바꾼다.

- market context
- payment, identity, address, language, holiday, service surface
- integration situations
- 지원 task와 not-applicable task
- evidence freshness
- binding validation coverage
- 해당 국가 결과와 diagnosis profile

국가 간 비교는 “어느 나라가 더 어렵다”는 단일 점수가 아니라 동일 task의 조건 차이와 paired outcome 차이로 보여준다.

### 7.5 Results

Results는 두 화면으로 분리한다.

#### Performance

- Accuracy, Speed, Cost를 각각 표시
- task, domain, market, system version별 slice
- 실행 전 scope selector: 국가 중심 / 과제 중심 / 맞춤형 / 전체
- 선택한 국가×과제 matrix와 예상 셀 수 미리보기
- run-level score는 상세 audit에서만 보조적으로 표시
- 결과가 없는 셀은 0이 아니라 unmeasured
- eligibility가 없는 결과는 공개하지 않음

#### Diagnostic Profile

- 7개 primary diagnosis 분포
- required capability별 observed behavior
- realism factor별 paired delta
- 질문·handoff·constraint retention 지표
- representative trace와 counterfactual fix

Performance와 Diagnostic Profile을 하나의 종합 순위로 합치지 않는다.

### 7.6 Methodology

Methodology의 첫 수준은 상위 3단만 보여준다.

1. Test
2. Measure
3. Explain

각 항목을 펼치면 내부 계약으로 내려간다.

- Test: Domain → Market Binding → Task Instance
- Measure: Validator → Accuracy / Speed / Cost → Eligibility
- Explain: Required Capability → Observed Behavior → Primary Diagnosis

표본 설계, versioning, holdout, governance는 별도 고급 섹션으로 둔다.

### 7.7 Governance

- task proposal과 promotion 기준
- market binding evidence freshness
- evaluator/version change log
- annotation guide와 agreement
- conflict-of-interest와 funding disclosure
- public/holdout 경계
- result correction and withdrawal policy

---

## 8. 핵심 UX 원칙

### 8.1 한 화면에 한 질문

- Tasks는 “무엇을 시험하는가”
- Markets는 “어디서 조건이 달라지는가”
- Results는 “어떻게 수행했는가”
- Diagnostics는 “왜 그런가”
- Methodology는 “어떻게 믿을 수 있는가”

### 8.2 공통 visual grammar

- Test: 청록 계열, 조건 카드와 binding line
- Measure: 중립색 기반 수치, raw unit 우선
- Explain: 진단 accent, trace와 evidence 연결
- 상태 표기: candidate, validated, measured, eligible, unmeasured를 색만이 아니라 텍스트·아이콘으로 구분

### 8.3 대표 인터랙션

하나의 canonical task를 선택하면 다음 흐름을 한 화면에서 추적한다.

```text
Task
→ Market
→ Input variation
→ Run
→ Verified result
→ Why
```

사용자는 내부 taxonomy를 공부하지 않아도 되고, 연구자는 각 단계의 원시 계약과 evidence까지 내려갈 수 있어야 한다.

### 8.4 결과 없는 현재 상태

현재 systems와 run cells가 0이므로 다음을 금지한다.

- 가상 성능 숫자
- 비어 있는 leaderboard를 실제 순위처럼 보이게 하는 UI
- candidate task를 validated scenario로 표현
- 국가 hazard를 측정된 난이도로 표현

대신 “Benchmark design preview”와 실행 준비도를 보여준다.

---

## 9. 운영 모델

### 9.1 저작 workflow

1. canonical task contract 확정
2. 6개국 market binding 저작
3. 공식 출처와 fixture 검증
4. clean anchor 저작
5. family별 realism factor 선택
6. covering array와 mandatory risk cell 생성
7. oracle policy와 hard validator 작성
8. dry run과 annotator test
9. candidate → validated promotion
10. public/holdout 분리와 version freeze

### 9.2 실행 workflow

1. fixture reset
2. evaluation scope 선택 및 manifest freeze
3. system registration and version lock
4. task instance assignment
5. run and trace capture
6. backend/post-condition readback
7. deterministic result validation
8. cost and latency ledger reconciliation
9. capability behavior extraction
10. primary diagnosis annotation
11. eligibility check and scope-aware publication

### 9.3 변경 관리

- 공식 출처와 서비스 정책의 freshness SLA를 시장·도메인별로 정의한다.
- binding 변경은 영향받는 instance를 자동 invalidation한다.
- validator 변경은 기존 결과와 섞지 않는다.
- 실행 실패와 harness failure를 분리한다.
- 개인 정보와 credential은 fixture에서 synthetic 또는 partner-controlled data만 사용한다.

---

## 10. 구현 로드맵

## Phase 0. 통합 계약 고정

목표: 제품과 연구 문서가 같은 언어를 사용하게 한다.

산출물:

- Test → Measure → Explain 용어집
- 내부 5계층 대응표
- 6개국 하드 범위 선언
- entity/ID/version contract
- 현재 data migration map

Exit criteria:

- 홈페이지, Methodology, schema 문서가 상충하지 않는다.
- Test 조건, Measure 결과, Explain 진단이 기계적으로 구분된다.
- canonical export가 6 markets / 10 families / 100 tasks를 일관되게 보고한다.

## Phase 1. 실행 스키마와 6개국 binding 기반

목표: 100개 task를 실행 가능한 구조에 연결한다.

산출물:

- `marketExecutionBindingSchema`
- `taskInstanceSchema`
- `trajectoryEventSchema`
- `validatorResultSchema`
- `diagnosisSchema`
- 6개국 binding registry와 validation tooling
- data export version 2

Exit criteria:

- 6개국 모두 최소 하나 이상의 binding fixture가 schema validation을 통과한다.
- 모든 canonical task가 6개국 각각에 `applicable`, `not-applicable`, `not-yet-authored` 중 하나로 명시된다.
- not-applicable에는 근거가 있고, not-yet-authored는 완료로 계산하지 않는다.

## Phase 2. 선택형 vertical slice

목표: 국가 중심, 과제 중심 cross-market, 맞춤 matrix를 같은 실행 엔진에서 재현한다.

권장 범위:

- Country-focused slice: 한 국가 × 10개 domain의 대표 task 1개씩
- Task-focused slice: 대표 canonical task 1개 × 6개국
- Custom matrix slice: 사전 등록한 비직사각 국가×과제 셀
- 각 선택 binding에 clean anchor 1개

산출물:

- resettable simulator 또는 partner-controlled fixture
- run recorder
- deterministic evaluator
- latency/cost ledger
- 6개국 task detail과 result detail UI

Exit criteria:

- 세 실행 모드가 동일 schema, recorder, validator로 end-to-end run을 완료한다.
- task-focused slice는 6개국 전체를 포함해 cross-market 비교 경로를 검증한다.
- 성공 결과는 post-condition readback으로 검증된다.
- 실패와 harness failure가 분리된다.
- 결과가 없는 셀은 fail-closed한다.

## Phase 3. Realism paired pilot

목표: 현실적 입력이 시스템 성능을 어떻게 바꾸는지 검증한다.

산출물:

- family별 핵심 Input Realism factor 3~5개
- constrained strength-2 arrays
- mandatory risk cells
- oracle interaction fixtures
- paired analysis report

Exit criteria:

- 선택 scope의 모든 eligible cell이 anchor와 variation 쌍을 포함한다.
- pair coverage가 기계 검증된다.
- 고위험 mandatory cells가 누락되지 않는다.
- paired delta가 공식 결과에 이중 가산되지 않는다.

## Phase 4. Explain 진단 검증

목표: 점수뿐 아니라 개선 가능한 원인을 신뢰성 있게 제시한다.

산출물:

- capability → expected event → possible diagnosis mapping registry
- behavior extractor
- primary diagnosis annotation guide
- counterfactual fix template
- diagnostic profile UX

Exit criteria:

- 선택 scope의 각 시장 run에 capability behavior와 diagnosis artifact가 존재한다.
- cross-market 진단을 주장하는 표본은 6개국 run을 모두 포함하며, 국가별 표본 수와 전체 산출 방식을 사전 등록한다.
- primary diagnosis는 하나, secondary는 최대 하나다.
- annotator agreement 기준을 사전 등록하고 충족한다.
- 불충분한 근거는 unresolved로 남는다.
- capability와 diagnosis를 하나의 점수로 합치지 않는다.

## Phase 5. 100-task 확장과 공개

목표: 6개국 전체에서 100개 canonical task를 운영 가능한 benchmark로 승격한다.

산출물:

- 100-task × 6-country applicability/binding coverage
- validated public set
- compositional, market-service, temporal-update holdout
- public Performance와 Diagnostic Profile
- governance and correction log

Exit criteria:

- 100개 task 모두 6개국 상태가 명시된다.
- applicable binding은 evidence와 freshness 검사를 통과한다.
- candidate와 validated를 UI와 export에서 명확히 분리한다.
- 공개 결과는 system, task, binding, instance, evaluator version으로 재현 가능하다.
- publication eligibility가 false인 셀은 어떤 집계에도 들어가지 않는다.

---

## 11. 우선순위

### P0: 반드시 먼저

- 3단 상위 프레임과 용어 통일
- 6개국 하드 범위
- schema 책임 경계
- market binding / task instance / run / validator / diagnosis
- publication fail-closed

### P1: 실행 가능성을 만드는 것

- 국가 중심·과제 중심 cross-market·맞춤 matrix vertical slice
- simulator/fixture
- deterministic validator
- trace, latency, cost ledger
- task·market·result 연결 UX

### P2: MICA의 차별점을 만드는 것

- realism paired evaluation
- oracle interaction policy
- capability behavior
- primary diagnosis와 counterfactual fix

### P3: 규모화와 신뢰

- 100-task expansion
- holdout
- governance independence
- evidence freshness automation
- external reproducibility package

---

## 12. 성공 지표

### 제품 이해도

- 첫 방문자가 10초 안에 Test, Measure, Explain을 구분할 수 있다.
- 사용자 테스트에서 “realism이 별도 점수인가”, “diagnosis가 순위에 합산되는가”에 대한 오답이 없다.
- task detail에서 3번 이내의 상호작용으로 market condition, result, diagnosis에 도달한다.

### 데이터 완전성

- 100% canonical task에 versioned final state와 confirmation boundary가 있다.
- 100% task × 6-country 조합에 applicability 상태가 있다.
- applicable binding의 100%가 source timestamp와 required evidence를 가진다.
- 공개 run의 100%가 post-condition 또는 선언된 hard validator evidence를 가진다.

### 평가 신뢰성

- 결과·harness failure·unmeasured·not-applicable이 혼합되지 않는다.
- covering array pair coverage가 사전 목표를 충족한다.
- mandatory risk cell 누락이 0이다.
- primary diagnosis의 agreement 기준을 충족한다.
- publication ineligible result 노출이 0이다.

### 범위 정직성과 6개국 형평성

- 단일 국가, 과제 중심 cross-market, 맞춤 matrix, 전체 benchmark를 명확히 구분한다.
- cross-market 결과는 해당 비교에 포함된 국가와 분모를 제목과 export에 함께 표시한다.
- “6개국 비교”는 6개국 모두 eligible evidence가 있을 때만 사용한다.
- 국가별 N/A는 실행 미완료를 숨기는 용도로 쓸 수 없다.
- 번역 완성도가 아니라 현지 실행 계약과 evidence coverage로 준비도를 판정한다.

---

## 13. 하지 않을 것

- 10개 도메인을 새 taxonomy로 갈아엎지 않는다.
- 100개 canonical task를 현실 발화 변형 수만큼 복제하지 않는다.
- 선택 scope보다 넓은 결과처럼 부르지 않는다. 단일 국가 run은 국가 결과로, 특정 과제의 6개국 run은 해당 과제의 cross-market 결과로만 공개한다.
- capability, realism, diagnosis를 Accuracy에 가산하지 않는다.
- 7개 diagnosis를 새 글로벌 점수로 합치지 않는다.
- 모든 입력·환경 변수를 하나의 거대 covering array에 넣지 않는다.
- 시장 차이를 본질적 난이도 순위로 단정하지 않는다.
- 모델 다수결을 설계 근거로 삼지 않는다.
- 측정 전 데이터를 성능 결과처럼 표현하지 않는다.

---

## 14. 최종 제품 정의

MICA Bench는 6개국, 10개 소비 도메인, 100개 canonical task를 기반으로 완전한 소비자 에이전트 시스템을 평가한다.

- **Test:** 같은 생활 목표를 국가별 실행 환경과 현실적인 사용자 입력에서 시험한다.
- **Measure:** 실제 final state를 검증하고 Accuracy, Speed, Cost를 각각 공개한다.
- **Explain:** 실행 행동과 최초 결정적 원인을 통해 시스템이 왜 성공하거나 실패했는지 설명한다.

외부에는 이 세 단계만 선명하게 보여주고, 내부에서는 Domain, Environment, Input, Capability, Outcome, Diagnosis의 책임을 분리해 재현성과 MECE를 지킨다.

MICA의 확장은 더 많은 카테고리를 붙이는 일이 아니다. **같은 100개 생활 과제가 6개국의 실제 조건과 불완전한 사용자 입력에서도 끝까지 완료되는지를 검증 가능한 방식으로 보여주는 일**이다.
