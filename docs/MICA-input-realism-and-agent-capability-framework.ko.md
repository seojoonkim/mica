# MICA 입력 현실성·에이전트 역량 프레임워크

## Multinational Index of Consumer Agents

- 문서 상태: MECE 보강 제안안
- 작성일: 2026-08-18
- 검토 상태: GPT-5.6 Sol, Claude Opus 5, Gemini 3.5 Flash, Grok 4.6 독립 감사와 4모델 충돌 판정 반영
- 목적: MICA를 소비 도메인과 API 실행 범위 중심의 벤치마크에서, 실제 소비자의 불완전한 발화와 입력을 이해하고 끝까지 수행하는 에이전트 시스템의 총괄 프레임워크로 확장한다.
- 보존 계약: 기존 10개 태스크 패밀리, 시장별 실행 계약, Accuracy·Speed·Cost 결과 축, 기존 진단 7축과 실행 증거 계약을 유지한다.

---

## 1. 문제 정의

현재 MICA는 소비자가 무엇을 하려는지에 대해서는 넓고 구체적이다. 이메일·캘린더, 쇼핑·배송, 여행·숙박, 외식·예약, 금융, 이동, 의료 행정, 공공 행정, 주거·공과금, 통신·구독의 10개 태스크 패밀리가 실제 소비 생활의 주요 실행 영역을 포괄한다. 시장별 실행 표면, 인증 경계, 완료 의미, 복구 조건과 증거 요구도 구분한다.

그러나 실제 소비자는 평가용 프롬프트처럼 말하지 않는다.

- “작년 봄쯤 민수가 보낸 그 파일 있잖아”처럼 단서를 흩어 말한다.
- 날짜나 사람을 잘못 기억한 채 과거 기록을 찾는다.
- 처음에는 예산을 말하지 않고 뒤늦게 제약을 추가한다.
- “아니, 목요일 말고 금요일”처럼 앞선 지시를 정정한다.
- “그거랑 같은 걸로”라며 사진이나 스크린샷만 보낸다.
- 무엇을 물어야 하는지 모르는 상태에서 목적만 말한다.
- 에이전트가 이미 도구로 확인할 수 있는 정보까지 반복해서 묻기를 기대하지 않는다.

따라서 MICA는 두 질문을 함께 답해야 한다.

1. 정의된 소비 작업을 현지 환경에서 완료할 수 있는가?
2. 불완전하고 불확실한 소비자 입력을 올바른 작업 상태로 복원할 수 있는가?

두 번째 질문은 새 종합점수가 아니라 동일 canonical task를 여러 현실적 조건으로 표현한 paired evaluation으로 측정한다.

---

## 2. MECE 총괄 구조

MICA는 다섯 역할을 구분한다. 이들은 모두 같은 종류의 “축”도, 서로 대등한 표본 층도 아니다. Layer 1~3은 evaluator가 실행 전에 고정하는 외생 설계 변수, Layer 4는 그 설계 셀이 요구하는 파생 태그와 실행 중 관측 행동, Layer 5는 종속 결과와 사후 원인 귀속이다. `Layer`라는 이름은 데이터 흐름의 순서를 뜻할 뿐 다섯 항목을 한 taxonomy나 가중 점수로 합친다는 뜻이 아니다.

### Layer 1. Domain: 목적

기존 10개 소비 태스크 패밀리를 유지한다.

1. Email & Calendar
2. Shopping & Delivery
3. Travel Planning & Accommodation
4. Dining & Reservations
5. Money, Banking & Investing
6. Mobility & Local Transit
7. Healthcare Administration
8. Government & Civic Services
9. Home & Utilities
10. Telecom & Digital Subscriptions

Domain은 소비자 목표와 허용 가능한 최종 상태의 의미를 정의한다. 시장, 인터페이스, 발화 형식, 모델 능력과 결과는 포함하지 않는다.

### Layer 2. Execution & Information Environment: 외부 세계

에이전트 실행 전에 evaluator가 고정하는 환경 계약이다.

#### 2A. Market, Policy & Execution Surface

- 시장, 언어, 통화, 시간대
- 서비스, 공급자, 웹·앱·API·전화·사람 핸드오프 표면
- 초기 backend state
- 계정, 인증, 권한
- 허용 행동과 금지 행동
- 정책, 규제, confirmation boundary
- irreversible commit boundary
- 완료 의미와 acceptable final states
- hard validator
- 장애와 허용 복구 경로
- required execution evidence

#### 2B. Information Environment

- 참조 대상이 있는 위치와 세션 범위
- 기록의 최신성, 유효 시점과 supersession 상태
- 사용자 주장과 authoritative record의 일치 관계
- 성공에 필요한 정보의 최소 합법 획득 경로
- 대체 증거 경로와 접근 권한
- 현재 제약의 환경상 만족 가능성
- authoritative source와 evaluation timestamp

동일한 발화를 주었을 때 환경 상태 때문에 정답 행동이 달라진다면 그 속성은 Input Realism이 아니라 Information Environment에 둔다.

### Layer 3. Input Realism: 관측 가능한 사용자 입력

canonical task의 목표와 validator는 그대로 두고 발화, 아티팩트, 턴 분포와 수정 사건을 바꾼다. 모델 실행 전에 입력 자체를 보고 라벨링할 수 있어야 한다.

### Layer 4. Required Capability & Observed Behavior: 요구 기능과 행동

각 task instance가 성공에 요구하는 기능을 사전에 태그하고, 실행 후 해당 기능의 행동 증거를 기록한다. capability는 설계 요인도, 공식 결과 점수도, primary failure cause도 아니다.

### Layer 5. Outcome & Diagnosis: 결과와 최초 결정적 원인

- Outcome: Accuracy, Speed, Cost
- Diagnosis: 기존 7축 중 실패를 피하려면 가장 먼저 달라져야 했던 하나의 primary cause

capability behavior, trajectory progress, 현실성 난이도를 Accuracy에 가산하지 않는다.

---

## 3. 층 배치 결정 규칙

새 후보 속성은 다음 순서로 분류한다.

1. 소비 목적과 성공 의미를 바꾸는가? 그렇다면 Domain 또는 새 canonical task다.
2. 동일 입력에서도 외부 상태에 따라 정답이 바뀌는가? 그렇다면 Execution & Information Environment다.
3. 입력·아티팩트 자체만 보고 실행 전에 정할 수 있는가? 그렇다면 Input Realism이다.
4. 성공에 필요한 기능인가? 그렇다면 required capability다.
5. 실행 로그에서 관측된 기능 행동인가? 그렇다면 observed capability behavior다.
6. 최종 상태인가? 그렇다면 Outcome이다.
7. 실패를 막기 위해 가장 먼저 바뀌어야 했던 시스템 원인인가? 그렇다면 Diagnosis다.

한 항목이 두 층에 필요해 보이면 원시 사실은 책임 층 한 곳에 저장하고, 다른 층에는 ID 참조 또는 파생 분석값만 둔다.

---

## 4. Execution & Information Environment 스키마

### EE1. Referent Locus / Session Scope

- `utterance-internal`
- `same-turn-artifact`
- `same-session-prior-turn`
- `cross-session-persisted-record`
- `external-system-or-artifact`
- `unavailable-or-nonexistent`

참조 표현의 명시성과 분리한다. “주문번호 A1832”도 cross-session 조회를 요구할 수 있고, “파란 거”도 same-turn 이미지나 과거 구매를 가리킬 수 있다.

### EE2. Temporal Currency

- `current`
- `time-qualified`
- `recently-updated`
- `potentially-stale`
- `superseded-record-present`
- `conflicting-timestamps`

사용자가 사실을 틀리게 기억한 것과 저장 기록이 과거에는 맞았지만 현재는 폐기된 것은 다른 조건이다.

### EE3. Assertion–Record Consistency

- `not-applicable`
- `verified-consistent`
- `partially-inconsistent`
- `contradicted`
- `unverifiable`

사용자 발화의 확신 정도는 Input Realism의 User Assertion Form에 두고, authoritative record와의 실제 관계는 이 환경 필드에 둔다.

### EE4. Minimum Evidence Acquisition Route

- `in-request`
- `current-session`
- `persisted-record`
- `authorized-tool`
- `user-only-knowledge`
- `inaccessible-under-policy`

여러 경로가 있으면 성공에 필요한 최소 권한·최소 외부성 경로를 primary로 기록하고 나머지는 `alternativeEvidenceRoutes`에 둔다.

### EE5. Constraint Satisfiability

- `satisfiable`
- `satisfiable-with-authorized-alternative`
- `temporarily-unavailable`
- `mutually-inconsistent`
- `prohibited-under-policy`

사용자의 새 제약이 이전 발화와 충돌하는 사건과, 환경상 모든 제약을 동시에 만족할 수 없는 상태를 분리한다.

---

## 5. Input Realism 분류

원시 스키마는 단일 거대 enum보다 독립 조작 가능한 필드를 사용한다.

### IR1. Request Specification Sufficiency

- `sufficient`: 현재 요청만으로 허용 행동과 목표 상태가 결정됨
- `underspecified-noncritical`: 여러 해석이 있지만 안전하고 되돌릴 수 있는 공통 진행이 가능
- `underspecified-critical`: 잘못 선택하면 목표, 비용, 권한 또는 안전 상태가 달라짐
- `internally-inconsistent`: 현재 요청 내부의 제약이 동시에 성립하지 않음

`recoverable`은 정보가 어디에 있는지를 뜻하므로 EE4로 이동한다. `clarification-required`는 정답 행동이므로 Oracle Interaction Policy로 이동한다.

### IR2. Discourse Topology

- `single-turn`
- `single-turn-multi-intent`
- `multi-turn-contiguous`
- `multi-turn-fragmented`
- `interleaved-with-unrelated-content`

### IR3. Signal Density

- `tight`
- `verbose-or-redundant`
- `distractor-heavy`

장황함은 턴 수와 독립적이다. 장황한 단일 턴과 정돈된 멀티턴을 모두 표현할 수 있어야 한다.

### IR4. Revision Dynamics

- `none`
- `additive-update`
- `error-correction`
- `preference-or-goal-reversal`
- `scope-change`
- `unresolved-conflict`

보조 필드:

- `revisionTarget`
- `effectiveFrom`
- `supersedesEventId`
- `commitStatusAtRevision`: `pre-commit | post-commit | not-applicable`

### IR5. Reference Form

- `fully-named`
- `descriptive`
- `deictic-or-pronominal`
- `elliptical`
- `ambiguous-multiple-candidates`

세션 범위와 기록 위치는 EE1에 둔다.

### IR6. User Assertion Form

- `not-applicable`
- `asserted`
- `hedged`
- `explicitly-unknown`

사용자가 자신 있게 말하는지와 그 말이 실제로 맞는지는 다른 차원이다. 실제 일치 관계는 EE3에 둔다.

### IR7. Modality Presence

원시 저장은 다중값 집합을 사용한다.

- `text`
- `image`
- `screenshot`
- `document`
- `audio`
- `transcript`

보조 필드:

- `primaryModality`

실제 artifact ID는 여러 Input Realism 필드가 공유하는 task-level `artifactRefs`에 한 번만 저장한다.

`mixed`는 저장값이 아니라 둘 이상의 modality가 있을 때 UI에서 계산하는 파생 표시값이다.

### IR8. Artifact Fidelity / Signal Condition

다중값 집합을 사용한다.

- `clean`
- `surface-noise`
- `ocr-or-asr-degraded`
- `partial-or-cropped`
- `low-legibility`
- `cross-artifact-conflict`

모달리티와 품질을 분리해야 깨끗한 이미지, 잘린 이미지, 오타가 많은 텍스트를 독립 비교할 수 있다.

---

## 6. Oracle Interaction Policy

Clarification Demand는 Input Realism이 아니라 정답 상호작용 정책이다.

- `must-not-ask-before-progress`: 도구로 확인하거나 안전한 공통 준비를 먼저 해야 함
- `may-ask`: 질문이 품질을 높이지만 성공에 필수는 아님
- `must-ask-before-commit`: 중요한 누락을 사용자 확인 없이 확정하면 안 됨
- `must-handoff`: 사람, 보안, 계정 소유자 또는 권한 경계로 넘겨야 함

필수 보조 필드:

- `decisionPoint`
- `requiredInformation`
- `derivableInformation`
- `riskIfAssumed`
- `allowedPreClarificationActions`
- `acceptableQuestionSemantics`
- `answerFixtures`

`expectedTermination`은 oracle 정책뿐 아니라 canonical final state와 confirmation boundary에도 연결되므로 task-level 필드에 한 번만 저장한다.

질문 문구 일치가 아니라 필요한 정보를 얻었는지, 질문 전 안전한 진행을 했는지, 질문 후 의사결정이 개선됐는지를 평가한다.

---

## 7. Required Capability와 Observed Behavior

### AC1. Intent Resolution

사용자 목표, 허용 해석과 완료 조건을 복원한다. 잘못된 action predicate를 선택한 행동과 연결한다.

### AC2. Goal & Constraint State Tracking

여러 턴의 목표와 제약을 누적하고, 최신 유효 상태와 폐기 상태를 구분한다.

### AC3. Evidence-Grounded Memory Retrieval

불완전한 단서로 기록 후보를 회수하고, 출처·관련성·최신성을 검증한다. 검색 미시도, 검색 실패, 후보 오선택, 최신성 검증 실패를 하네스 로그로 분리할 수 있을 때만 독립 behavior로 유지한다. 그렇지 않으면 Memory subtype으로 강등한다.

### AC4. Reference Resolution

언어 표현을 대화, 아티팩트 또는 기록의 구체 엔티티에 결속한다. action predicate는 맞지만 argument binding이 틀린 행동과 연결한다.

### AC5. Information-Seeking & Clarification Calibration

검색, 도구 관측, 안전한 선행 작업, 사용자 질문, handoff 중 필요한 행동을 선택한다. 질문 수가 많다는 이유만으로 성공으로 보지 않는다.

### AC6. Multimodal Grounding

아티팩트에서 필요한 정보를 추출하고, 서로 다른 모달리티의 개체·속성을 작업 상태에 연결한다.

### AC7. Epistemic Calibration

확인 사실, 사용자 주장, 시스템 추론과 미확인 가설을 구분하고 확신, 질문, abstention과 commit 수준을 조절한다.

### 조건부 Probe A. Correction Event Handling

독립 최상위 capability로 점수화하지 않는다.

- pre-commit correction: AC2의 state update probe
- post-commit 의미 상태 갱신: AC2
- post-commit side-effect 취소·변경·복원: 기존 Recovery diagnosis

수정 조건별 성능은 별도 slice로 공개한다.

### 조건부 Probe B. Claim-Level Evidence Grounding

주장과 evidence event의 support relation을 기록한다.

- `claimId`
- `evidenceEventIds`
- `supportRelation`
- `groundingStatus`
- `confidenceOrActionLevel`

근거 연결과 확신·행동 조절은 반례상 분리 가능하므로 별도 behavior로 파일럿한다. 다만 새 상위 diagnosis로 만들지 않으며 주석 합의와 추가 설명력이 없으면 AC7 하위 지표로 강등한다.

---

## 8. Capability와 Diagnosis의 관계

둘을 단일 codebook으로 통합하지 않는다.

- `requiredCapabilities`: 실행 전에 부착한 요구 기능
- `observedCapabilityBehaviors`: 실행 로그에서 확인한 기능 행동
- `primaryDiagnosticAxis`: 실패를 막기 위해 가장 먼저 달라져야 했던 시스템 원인

동일 capability가 여러 diagnosis로 실패할 수 있고, 동일 diagnosis가 여러 capability 요구에서 발생할 수 있으므로 다대다 mapping이다.

mapping registry는 다음 구조를 갖는다.

```text
required capability
→ expected observable events
→ possible diagnostic axes
→ counterfactual fix
```

기존 primary diagnosis 7축은 유지한다.

1. Orchestration
2. Model Routing
3. Memory
4. Tool/API Use
5. Localization
6. Safety
7. Recovery

한 실패에는 primary axis 하나와 최대 하나의 secondary contributor만 둔다. 단순 상관관계만 있으면 `unresolved`로 표시한다.

---

## 9. Task 계층과 스키마

평가 단위는 다음 계층을 따른다.

- `domain`
- `canonical_task`
- `market_execution_binding`
- `task_instance`
- `run`
- `trajectory_event`
- `validator_result`
- `diagnosis`

canonical task는 목표, 허용 최종 상태, 필수 제약, 금지 상태, confirmation boundary와 validator를 고정한다. task instance는 입력·정보 환경과 사용자 상호작용 조건만 바꾼다.

```ts
TaskInstance = {
  id: string;
  canonicalTaskId: string;
  marketExecutionBindingId: string;
  version: string;

  informationEnvironment: {
    referentLocus: ReferentLocus;
    temporalCurrency: TemporalCurrency;
    assertionRecordConsistency: AssertionRecordConsistency;
    minimumEvidenceAcquisitionRoute: EvidenceRoute;
    alternativeEvidenceRoutes: EvidenceRoute[];
    constraintSatisfiability: ConstraintSatisfiability;
    authoritativeSourceRefs: string[];
    evaluationTimestamp: string;
  };

  inputProfile: {
    requestSpecificationSufficiency: RequestSpecificationSufficiency;
    discourseTopology: DiscourseTopology;
    signalDensity: SignalDensity;
    revisionDynamics: RevisionDynamics;
    revisionTarget?: string;
    effectiveFrom?: string;
    supersedesEventId?: string;
    commitStatusAtRevision: "pre-commit" | "post-commit" | "not-applicable";
    referenceForm: ReferenceForm;
    userAssertionForm: UserAssertionForm;
    modalitiesPresent: Modality[];
    primaryModality: Modality;
    signalConditions: SignalCondition[];
  };

  oracleInteractionPolicy: {
    policy: "must-not-ask-before-progress" | "may-ask" | "must-ask-before-commit" | "must-handoff";
    decisionPoint: string;
    requiredInformation: string[];
    derivableInformation: string[];
    riskIfAssumed: string[];
    allowedPreClarificationActions: string[];
    acceptableQuestionSemantics: string[];
    answerFixtures: AnswerFixture[];
  };

  requiredCapabilities: AgentCapabilityId[];
  turnScript: UserTurn[];
  artifactRefs: string[];
  groundTruth: GroundTruth;
  expectedTermination: TerminationClass;
  lifecycle: "candidate" | "validated";
  taskSet: "public" | "holdout";
};
```

attempt에는 다음을 추가 기록한다.

- `observedCapabilityBehaviors`
- 질문과 handoff event
- retrieval query, candidate와 선택 근거
- claim-to-evidence linkage
- constraint state change와 supersession
- first decisive error event
- primary diagnosis와 counterfactual fix

---

## 10. 채점과 이중계상 방지

### 10.1 공식 결과 보존

코드에 이미 존재하는 run-level 정규화 산식은 보존한다.

`100 × accuracy component × speed component × cost component`

이 산식은 동일 run의 eligibility와 내부 정규화를 위한 계산 계약이다. Accuracy, Speed, Cost 원시값은 각각 공개하고, 세 축을 하나의 글로벌 리더보드 숫자나 단일 MICA 순위로 축약하지 않는다. realism이나 capability에 별도 난이도 보너스를 붙이지 않는다.

### 10.2 Accuracy

hard validator가 있으면 최종 환경 상태를 우선한다. 질문을 잘했거나 거의 완료했더라도 최종 상태가 실패면 progress를 Accuracy에 가산하지 않는다. 정당한 handoff는 사전 선언된 termination class와 confirmation boundary에 따라 성공이 될 수 있다.

### 10.3 Speed

첫 사용자 입력부터 terminal outcome 또는 정당한 handoff까지 단일 wall-clock을 측정한다. scripted user response, 질문, 검색과 tool retry를 포함한다. 외부 서비스 지연은 원시 wall-clock에 포함하고, 필요하면 agent-attributable latency를 별도 분해 공개한다.

### 10.4 Cost

모델 호출, 도구/API, 검색과 실패 후 재시도 비용을 포함한다. 사용자 interaction turn을 비용 모델에 넣을 경우 규칙을 사전 등록한다.

### 10.5 비점수 진단

- Required Clarification Hit Rate
- Avoidable Question Rate
- Constraint Retention Rate
- Superseded Constraint Error Rate
- Memory Retrieval Precision
- Unsupported Assumption Rate
- Claim Grounding Support Rate
- Honest Handoff Rate

분모가 없으면 0이 아니라 `not-applicable` 또는 `unmeasured`로 공개한다.

---

## 11. 표본 설계

### 11.1 Anchor

각 canonical task와 market binding에 clean anchor를 둔다.

- sufficient request
- single turn
- tight signal
- correction 없음
- fully named reference
- text 중심
- clean signal
- current evidence
- 정보가 요청에 포함됨

anchor와 variation은 같은 목표, acceptable final states와 validator를 공유한다.

### 11.2 Constrained Strength-2 Covering Array

모든 축의 완전요인을 실행하지 않는다.

- task family에 적용 가능한 factor만 포함한다.
- 기본 배열은 해당 family에서 독립 조작 가능한 핵심 Input Realism factor 3~5개로 제한한다. 모든 Input·Environment·Capability 필드를 하나의 배열에 넣지 않는다.
- 논리적으로 불가능한 조합을 constraint로 선언한다.
- 배열 생성 후 실제 달성 pair coverage를 기계 검증한다.
- constraint 때문에 빠진 pair는 강제 셀로 보충한다.
- 시장, referent locus, record currency와 권한·정책 조건은 기본적으로 block 또는 고정 조건으로 두고, 명시적 상호작용 가설이 있을 때만 배열 factor로 승격한다.
- 시장별 level 분포를 blocking한다.

covering array는 사용자 모집단 대표성이나 모든 3-way interaction을 보장하지 않는다.

### 11.3 Mandatory Risk Cells

다음은 pairwise 결과와 무관하게 포함한다.

- cross-session record × superseded record × irreversible action
- underspecified request × authorized-tool evidence × unnecessary-question 유혹
- underspecified request × user-only knowledge × must-ask-before-commit
- correction × planned side effect × state update
- post-commit reversal × recovery requirement
- screenshot × cropped signal × ambiguous reference
- mixed modalities × cross-artifact conflict
- OCR/ASR error × 금액·날짜·주소
- policy restriction × prohibited user request
- temporary tool failure × recoverable path
- frontend success indication × backend validator failure
- evidence retrieval success × unsupported claim
- inaccessible information × fabricated certainty

### 11.4 Paired Analysis

같은 canonical task의 anchor와 variation을 같은 시스템·버전에서 실행해 다음을 공개한다.

- raw accuracy change
- latency change
- cost change
- 질문 행동 변화
- constraint retention 변화
- capability behavior 변화

paired delta는 공식 점수에 다시 가산하지 않는다.

### 11.5 Repetition과 Holdout

반복 횟수는 파일럿 분산을 보고 사전 등록한다. 반복 시 평균 성공률과 all-runs success를 분리한다. holdout은 compositional, market-service, temporal-update로 나누고 holdout 결과를 본 뒤 taxonomy나 validator를 바꾸면 새 버전으로 승격한다.

---

## 12. 근거와 설계 결정

### 대화 상태와 제약

- MultiWOZ는 multi-domain dialogue state와 slot constraint의 명시적 추적을 지지한다: https://aclanthology.org/D18-1547/
- Schema-Guided Dialogue는 intent·slot·service schema 분리와 unseen service 일반화를 지지한다: https://arxiv.org/abs/1909.05855
- 과잉해석 금지: 두 자료는 실제 소비자 서비스의 backend completion이나 장기 cross-session memory를 직접 검증하지 않는다.

### 다중 턴 수정과 상호작용

- MINT는 언어 피드백과 도구를 포함한 multi-turn 수정 행동을 별도 관찰할 근거를 제공한다: https://arxiv.org/abs/2309.10691
- τ-bench는 사용자·정책·도구·DB state를 실행 환경으로 묶고 최종 state와 반복 신뢰성을 평가할 근거를 제공한다: https://arxiv.org/abs/2406.12045
- 과잉해석 금지: MINT가 Correction Event Handling을 독립 최상위 capability로 직접 확정하지는 않는다.

### 명확화 정책

- ShARC는 현재 정보로 답할 수 있는 경우와 follow-up이 필요한 경우를 정답 행동으로 구분할 근거를 제공한다: https://aclanthology.org/P18-1128/
- Qulac은 질문 빈도가 아니라 후속 검색·결정 효용을 평가할 근거를 제공한다: https://doi.org/10.1145/3331184.3331265
- 과잉해석 금지: 검색 효용을 결제·예약·취소의 최종 성공으로 직접 대체하지 않는다.

### 장기 기억과 최신성

- LongMemEval은 cross-session retrieval, temporal reasoning, knowledge update와 abstention을 구분할 근거를 제공한다: https://arxiv.org/abs/2410.10813
- LoCoMo는 장기 대화의 single-hop, multi-hop, temporal, adversarial 조건을 분리할 근거를 제공한다: https://arxiv.org/abs/2402.17753
- 과잉해석 금지: memory QA 성공이 도구 실행과 권한 준수를 보장하지 않는다.

### 멀티모달 참조

- SIMMC 2.0은 modality, multimodal coreference, disambiguation과 dialogue state를 분리할 근거를 제공한다: https://arxiv.org/abs/2104.08667
- 과잉해석 금지: 실제 OCR 오류, 잘린 문서와 웹 UI 실행을 모두 직접 포괄하지 않는다.

### 실행 상태와 결과 검증

- OSWorld는 초기 상태와 execution-based evaluator를 명시할 근거를 제공한다: https://arxiv.org/abs/2404.07972
- WebArena는 재현 가능한 웹 환경과 functional correctness, backend validation을 사용할 근거를 제공한다: https://arxiv.org/abs/2307.13854
- AgentBoard는 final success와 progress·trajectory diagnosis를 분리할 근거를 제공한다: https://arxiv.org/abs/2401.13178
- 과잉해석 금지: progress metric 자체가 인과적 failure diagnosis를 보장하지 않는다.

### 조합 표본 설계

- NIST SP 800-142는 t-way covering array로 factor interaction coverage를 효율화할 근거를 제공한다: https://doi.org/10.6028/NIST.SP.800-142
- 과잉해석 금지: strength-2가 모든 고차 상호작용이나 실제 사용자 분포를 보장하지 않는다.

상세 근거·한계 매트릭스는 `docs/research/MICA-evidence-decision-matrix.ko.md`를 따른다.

---

## 13. MECE 수용 테스트

### 13.1 층 배타성

- 동일 발화에서 외부 상태만 바꿨을 때 정답이 바뀌면 해당 속성을 Input에 두지 않는다.
- 모델 실행 후에만 알 수 있는 값을 Input에 두지 않는다.
- capability와 diagnosis를 동일 점수로 중복 집계하지 않는다.

### 13.2 축 독립성

다음 paired counterexample을 실제로 만들 수 있어야 한다.

- 충분한 요청 × 증거는 외부 도구에 있음
- 불완전 요청 × 필요한 정보는 현재 대화에 있음
- fully named reference × cross-session record
- deictic reference × same-turn artifact
- 정확한 사용자 주장 × stale record
- 틀린 사용자 주장 × current record
- clean image × noisy text
- noisy image × clean text

독립 variation을 만들 수 없고 항상 함께 움직이면 병합 또는 재배치를 검토한다.

### 13.3 진단 배타성

- `firstDecisiveErrorEvent`를 지정한다.
- 하나의 counterfactual fix로 사라지는 최초 오류는 primary cause 하나로 센다.
- 특정 라벨 쌍의 주석 불일치가 집중되면 정의문을 계속 늘리지 말고 병합 또는 decision rule 변경을 검토한다.

### 13.4 구성타당도

- anchor와 variation은 같은 validator를 공유해야 한다.
- variation이 의도한 capability event를 실제로 자극했는지 manipulation check를 한다.
- null control에서 성능이 떨어지면 realism 효과가 아니라 생성·파서·채점 artifact를 먼저 의심한다.
- 파일럿 임계값은 보편 상수가 아니라 사전 등록 운영 가설로 표시한다.

상세 테스트는 `docs/research/MICA-MECE-acceptance-tests.ko.md`를 따른다.

---

## 14. 대표 인스턴스

### 불확실한 과거 기록 탐색

사용자:

> “지난달쯤 다나카 씨가 보낸 그 견적서 최신본 찾아줘. 3월이었던 것 같기도 하고.”

- Input: `hedged`, `descriptive`
- Environment: `external-system-or-artifact`, `superseded-record-present`, `partially-inconsistent`, `authorized-tool`
- Required capability: Evidence-Grounded Memory Retrieval, Reference Resolution, Epistemic Calibration
- 성공: 4월 최신본을 근거 메시지와 함께 찾고 3월 파일이 superseded임을 설명

### 장황한 수정과 제약 누적

사용자:

> “이번 주 목요일 저녁에 여섯 명 갈 만한 데 찾아줘. 너무 시끄러운 곳 말고. 한 명은 채식이고, 잠깐, 목요일 아니고 금요일이야. 인원도 일곱 명.”

- Input: `single-turn`, `verbose-or-redundant`, `error-correction`, `pre-commit`
- Required capability: Intent Resolution, Goal & Constraint State Tracking
- Correction Event Handling slice: 적용
- 성공: 금요일, 7명, 채식 1명, 소음 조건을 모두 반영

### 도구로 확인 가능한 불완전 요청

사용자:

> “매달 나가는 이상한 결제 그거 정리 좀.”

- Input: `underspecified-noncritical`, `deictic-or-pronominal`
- Environment: 거래 명세와 구독 목록이 `authorized-tool`로 관측 가능
- Oracle policy: `must-not-ask-before-progress`
- 성공: 사용자에게 명세를 다시 요구하기 전에 반복 결제 후보를 근거와 함께 찾고, 취소는 승인 전에 실행하지 않음

### 사용자만 아는 핵심 정보

사용자:

> “내일 공항 가는 제일 좋은 방법 알려줘.”

- Input: `underspecified-critical`
- Environment: 출발지는 fixture에 있지만 출발 시각과 수하물 조건은 `user-only-knowledge`
- Oracle policy: `must-ask-before-commit`
- 성공: 이미 있는 출발지는 되묻지 않고 결정적 정보만 확인

---

## 15. 구현 로드맵

### Phase 1. 계약과 스키마

- `src/lib/schema.ts`: information environment, input profile, oracle policy, capability behavior, task instance와 diagnosis linkage 추가
- `src/data/policy/axes.ts`: required capability와 기존 diagnosis mapping registry 추가
- `src/lib/score.ts`: 변경하지 않음
- schema invariant, impossible combination, canonical link, validator identity와 holdout 누출 테스트 추가

### Phase 2. 파일럿 저작

- Email & Calendar, Shopping & Delivery 우선
- 한국·일본 우선 파일럿
- canonical task와 market binding별 anchor+2 variation
- independent ground truth와 bilingual naturalness review
- correction, stale record, evidence route와 multimodal fixture 포함

### Phase 3. 표본·진단 검증

- constrained strength-2 covering array 생성기
- achieved pair coverage validator
- mandatory risk cell registry
- mapping registry와 first decisive error annotation guide
- inter-annotator agreement와 null control

### Phase 4. 공개

- Input Realism Overview
- Information Environment slices
- Clarification Panel
- Memory & Reference Panel
- Constraint Retention Curve
- paired task detail과 redacted trace
- measured, unmeasured, not-applicable coverage 공개

### Phase 5. 확장

- 10개 패밀리와 모든 초기 시장으로 층화 확장
- compositional, market-service, temporal-update holdout
- 반복 신뢰성 분석
- 파일럿에서 독립성이 확인된 conditional probe만 정식 승격

---

## 16. 비목표

- 입력 현실성에 임의 난이도 점수를 부여하지 않는다.
- capability behavior를 기존 A×S×C 점수에 가중하지 않는다.
- 사용자 발화의 확신과 authoritative truth를 같은 필드로 저장하지 않는다.
- 참조 표현과 세션·기록 위치를 같은 enum으로 합치지 않는다.
- modality 조합을 원시 `mixed` 값 하나로 버리지 않는다.
- clarification 정답을 입력 조건으로 노출하지 않는다.
- 모든 조합을 완전요인으로 실행하지 않는다.
- 실제 개인의 이메일·사진·건강·금융 기록을 사용하지 않는다.
- 현재 존재하지 않는 실측 성능이나 시스템 순위를 만들지 않는다.

---

## 17. 최종 정의

MICA는 다음 질문에 답하는 다국가 소비자 에이전트 벤치마크다.

> 어떤 에이전트 시스템이, 어떤 시장의 어떤 소비 작업을, 실제 소비자가 말하고 기억하고 수정하고 입력하는 방식 그대로 받아들여, 안전하고 정확하며 효율적으로 완료하는가?

기존 10개 소비 도메인은 실행 범위다. Execution & Information Environment는 외부 세계의 계약이다. Input Realism은 소비자가 일을 맡기는 관측 가능한 방식이다. Required Capability는 성공에 필요한 기능이며 Observed Behavior는 그 기능이 실제로 나타난 증거다. Accuracy·Speed·Cost는 최종 결과이고 기존 7개 diagnosis는 왜 실패했는지를 설명한다.

이 역할을 분리하고 교차 측정해야 MICA는 API 연결 범위 비교를 넘어 실제 소비 생활에서 신뢰할 수 있는 완성형 에이전트 시스템을 평가할 수 있다.
