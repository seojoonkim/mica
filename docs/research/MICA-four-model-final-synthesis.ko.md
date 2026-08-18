# MICA 총괄 프레임워크 4대 LLM MECE 감사 최종 종합

- 상태: 4개 독립 LLM 결과와 근거 패킷 기반 final synthesis
- 완료 lane: GPT-5.6 Sol, Claude Opus 5, Gemini 3.5 Flash, Grok 4.6
- 판정 원칙: 모델 수의 다수결이 아니라 외생성, 독립 조작 가능성, 관측 가능한 행동 서명, 기존 점수 이중계상 여부, 검증된 1차 연구의 직접 지지 범위로 판정한다.

## 1. 공통 합의

### 1.1 프레임워크와 점수 계약

- Domain, Execution Environment, Input Realism, Required Capability, Outcome & Diagnosis는 서로 다른 역할을 갖는다.
- Accuracy, Speed, Cost의 기존 공식 결과 계약은 보존한다.
- Input realism, capability behavior, trajectory progress를 Accuracy에 가산하지 않는다.
- 최종 성공은 가능한 경우 hard validator와 backend 또는 외부 post-condition으로 판정한다.
- 동일 실패에는 하나의 primary diagnostic cause만 부여하고 secondary contributor는 최대 하나만 허용한다.

### 1.2 현재 Input Realism의 공통 결함

- Clarification Demand는 순수 입력 속성이 아니며 Oracle Interaction Policy로 이동해야 한다.
- Reference Explicitness는 언어적 참조 형식과 정보 소재·세션 범위를 혼합한다.
- 사용자 주장과 authoritative record의 일치 여부, 기록의 최신성은 분리해야 한다.
- Input Modality와 OCR·ASR·잘림·저가독성 등 signal condition은 독립적으로 저장해야 한다.
- 요청의 명세 충분성과 누락 정보를 합법적으로 획득할 수 있는 경로는 분리해야 한다.
- strength-2 covering array는 기본 pair coverage 수단일 뿐이며 고위험 3-way 이상 조합은 mandatory risk cells로 강제해야 한다.

### 1.3 새 상위 capability를 만들지 않을 항목

- 정책·권한은 Execution Environment 계약 및 Safety diagnosis로 충분하다.
- 도구 실행·완료 상태 검증은 Tool/API Use subtype으로 충분하다.
- 실행 실패 복구는 기존 Recovery diagnosis로 충분하다.
- 완료 판정은 validator contract에 둔다.

## 2. 직접 충돌 결정표

### D1. Capability와 Diagnosis

모델 입장:

- GPT-5.6 Sol: 사전 요구 capability와 사후 diagnosis를 분리하고 다대다 mapping으로 연결한다.
- Claude Opus 5: 동일 라벨 집합을 사전 요구 태그와 사후 원인으로 재사용하는 단일 codebook을 제안한다.
- Gemini 3.5 Flash: 별도 구조 유지에 가깝고 전체 단일 codebook은 제안하지 않는다.

판정:

- 동일 required capability가 Memory, Tool/API Use, Orchestration 등 여러 원인으로 실패할 수 있다.
- 동일 Memory diagnosis도 retrieval, currency validation, constraint preservation 등 여러 capability 요구에서 발생할 수 있다.
- 따라서 두 분류는 다대다이며 동일 codebook을 강제하면 의미가 손실된다.

결정:

1. `required_capabilities`: 실행 전 인스턴스 요구 태그
2. `observed_capability_behaviors`: 실행 후 행동 증거
3. `primary_diagnostic_axis`: 최초 결정적 시스템 실패 원인

세 구조를 분리하고, `required capability → expected events → possible diagnoses → counterfactual fix` mapping registry로 연결한다. 이들 지표는 공식 점수에 가산하지 않는다.

### D2. Correction Compliance

모델 입장:

- GPT-5.6 Sol: 독립 capability 유지
- Claude Opus 5: pre-commit은 Constraint State Tracking, post-commit은 Recovery이므로 독립 capability 삭제
- Gemini 3.5 Flash: User-guided State Correction으로 독립 유지

판정:

- pre-commit correction 실패는 이전 값을 무효화하지 못하고 현재 유효 constraint를 갱신하지 못한 행동으로, Constraint State Tracking과 행동 서명이 같다.
- post-commit correction에서 의미 상태는 갱신했지만 기존 side effect 취소·변경에 실패했다면 Recovery 실패다.
- MINT는 correction 조건을 별도 관찰해야 함은 지지하지만 독립 최상위 구성개념임을 직접 지지하지 않는다.

결정:

- 독립 최상위 capability로 두지 않는다.
- `Correction Event Handling`을 자극·요구 태그와 diagnostic slice로 유지한다.
- pre-commit은 Goal & Constraint State Tracking 하위 probe로 둔다.
- post-commit 의미 갱신은 Goal & Constraint State Tracking, side-effect 복원은 Recovery로 둔다.
- fixture에 `revision_type`, `revision_target`, `effective_from`, `supersedes_event_id`, `commit_status_at_revision`을 둔다.

### D3. Claim-Level Evidence Grounding

모델 입장:

- GPT-5.6 Sol: Epistemic Calibration과 분리
- Claude Opus 5: Epistemic Calibration 하위 지표로 흡수
- Gemini 3.5 Flash: 독립 상위 capability를 제안하지 않음

판정:

- 올바른 출처 연결 후 과도하게 낮은 확신을 보이는 경우 grounding 성공·calibration 실패가 가능하다.
- 낮은 확신을 표현했지만 인용한 자료가 해당 주장을 지원하지 않는 경우 calibration 일부 성공·grounding 실패가 가능하다.
- 관측 단위도 claim-to-evidence entailment와 confidence/action policy로 다르다.

결정:

- 측정 behavior로는 분리한다.
- 새 상위 diagnostic axis로 승격하지 않는다.
- 파일럿에서 독립 구성타당성과 주석 합의도를 확인한 뒤 정식 capability 승격 여부를 결정한다.
- 필드: `claim_id`, `evidence_event_ids`, `support_relation`, `grounding_status`, `confidence_or_action_level`.

### D4. Temporal/Session Scope

모델 입장:

- GPT-5.6 Sol: Reference Form, Context Dependency Scope, Temporal Currency를 독립 외생 축으로 둔다.
- Claude Opus 5: Reference Form만 Input에 두고 Referent Locus와 Record Currency는 Information Environment로 이동한다.
- Gemini 3.5 Flash: 명시성과 시간·세션 범위를 하나의 enum으로 병합한다.

판정:

- 고유 ID도 cross-session record를 요구할 수 있고, 지시어도 same-turn screenshot을 가리킬 수 있다.
- 언어 형식, 정보 저장 위치, 기록 최신성은 독립적으로 조작 가능하고 서로 다른 행동을 요구한다.

결정:

- Input Realism: `Reference Form`
- Information Environment: `Referent Locus / Session Scope`, `Temporal Currency`
- 실험에서는 모두 외생 factor로 조작하되 저장 책임을 분리한다.
- Reference Explicitness와 temporal/session scope를 결합한 enum은 금지한다.

### D5. Input Modality

모델 입장:

- GPT-5.6 Sol: modalities set + primary modality
- Claude Opus 5: modality presence flags
- Gemini 3.5 Flash: Text, Image, Document, Voice, Mixed 단일 enum

판정:

- text+image, text+document, image+document 등은 서로 다른 grounding·cross-artifact 검증 행동을 요구한다.
- `mixed`는 어떤 조합인지 복원하지 못한다.

결정:

- 원시 스키마는 `modalities_present` presence set을 사용한다.
- `primary_modality`와 `artifact_refs`를 별도로 둔다.
- `mixed`는 UI·요약 분석용 파생값으로만 허용한다.
- `signal_conditions`는 modality와 별도 다중값 필드로 저장한다.

## 3. 잠정 권고 taxonomy

### Layer 1. Domain

기존 10개 소비 도메인을 유지한다.

### Layer 2. Execution & Information Environment

#### 2A. Market, Policy & Execution Surface

- 시장·언어·통화·시간대
- 공급자·서비스·실행 표면
- 초기 backend state
- 계정·인증·권한
- 허용·금지 행동
- 정책·규제 조건
- irreversible commit boundary
- completion semantics
- acceptable final states
- hard validator
- 허용 복구 경로
- required execution evidence

#### 2B. Information Environment

- `referent_locus`
- `session_scope`
- `record_currency`
- `assertion_record_consistency`
- `minimum_evidence_acquisition_route`
- `alternative_evidence_routes`
- `constraint_satisfiability`
- authoritative source 및 evaluation timestamp

### Layer 3. Input Realism

1. Request Specification Sufficiency
2. Discourse Topology
3. Signal Density
4. Revision Dynamics
5. Revision Timing
6. Reference Form
7. User Assertion Form
8. Modality Presence
9. Artifact Fidelity / Signal Condition

`Clarification Demand`는 포함하지 않는다.

### Oracle Interaction Policy

- `must-not-ask-before-progress`
- `may-ask`
- `must-ask-before-commit`
- `must-handoff`

보조 필드:

- `decision_point`
- `required_information`
- `derivable_information`
- `risk_if_assumed`
- `allowed_pre_clarification_actions`
- `acceptable_question_semantics`
- `expected_termination`

### Layer 4. Required Capability Tags

정식 후보:

1. Intent Resolution
2. Goal & Constraint State Tracking
3. Evidence-Grounded Memory Retrieval
4. Reference Resolution
5. Information-Seeking & Clarification Calibration
6. Multimodal Grounding
7. Epistemic Calibration

조건부 behavior/probe:

- Correction Event Handling
- Claim-Level Evidence Grounding
- Execution State Verification
- Permission/Commit Gating

### Layer 5. Outcome & Diagnosis

공식 결과:

- Accuracy
- Speed
- Cost

기존 primary diagnosis:

1. Orchestration
2. Model Routing
3. Memory
4. Tool/API Use
5. Localization
6. Safety
7. Recovery

추가 진단 필드:

- `first_decisive_error_event`
- `primary_diagnostic_axis`
- `primary_subtype`
- `secondary_contributor`
- `required_capabilities`
- `observed_capability_behaviors`
- `counterfactual_fix`
- `evidence_event_ids`
- `diagnostic_confidence`

## 4. 파일럿 가설

### H1. Claim-Level Grounding 독립성

- 수용: grounding 성공·calibration 실패와 역반례를 안정적으로 저작하고 주석자가 구분한다.
- 강등: 두 지표가 항상 함께 움직이거나 기존 diagnosis subtype보다 추가 설명력이 없다.

### H2. Correction Event Handling 독립성

- 수용: 일반 constraint update는 성공하지만 explicit correction에서만 반복 실패하는 별도 행동 서명과 counterfactual fix가 존재한다.
- 강등: pre-commit은 모두 Constraint Tracking, post-commit은 모두 Recovery로 설명된다.

### H3. Session Scope 독립성

- 수용: 동일 reference form에서 session scope만 바꾼 paired instance가 가능하고 별도 성능 효과가 있다.
- 강등: fixture에서 session scope가 reference form 또는 evidence route와 사실상 일대일 종속된다.

### H4. Evidence-Grounded Memory Retrieval 관측 가능성

- 수용: 검색 미시도, 검색 실패, 후보 오선택, 최신성 검증 실패를 로그로 분리할 수 있다.
- 강등: retrieval trace를 관측할 수 없어 Memory diagnosis와 분리할 수 없다.

### H5. Input과 Information Environment 독립성

paired manipulation으로 다음을 검증한다.

- Request Sufficiency × Evidence Availability
- Reference Form × Referent Locus
- User Assertion Form × Assertion–Record Consistency
- Record Currency × Personal Claim Correctness
- Modality Presence × Artifact Fidelity

## 5. Grok 4.6 closure 판정

Grok 4.6 결과는 다음 네 항목으로 타깃 확인했다.

1. 위 5개 결정에 새로운 최소 반례를 제시하는가
2. 근거 패킷의 1차 연구를 과잉해석하지 않았는가
3. 독립 조작 가능성 또는 행동 서명 기준으로 현 결정을 뒤집을 근거가 있는가
4. 새 항목이 기존 Environment, Input, Capability, Diagnosis에 배치되지 않는 진짜 누락인가

### 확인 결과

- **새 유효 반례 1건:** Domain·Environment·Input은 외생 설계 변수이고 Capability는 파생 요구 태그, Outcome·Diagnosis는 종속 관측이므로, 다섯 항목을 대등한 taxonomy 또는 표본 층으로 표현하면 MECE가 깨진다. 본안은 이미 “같은 종류의 축이 아니다”라고 구분했으며, 최종안에는 설계 변수·파생 태그·종속 관측이라는 역할 타입을 명시해 오해 가능성을 닫았다.
- **Clarification Demand:** Input에서 제거하고 Oracle Interaction Policy로 이동한 기존 결정을 지지한다.
- **Reference·시간·기록:** Reference Form, Referent Locus, Record Currency를 분리한 기존 결정을 지지한다.
- **사용자 주장·기록:** User Assertion Form과 Assertion–Record Consistency를 분리한 기존 결정을 지지한다.
- **Modality·품질:** presence와 signal condition을 분리한 기존 결정을 지지한다.
- **Capability·Diagnosis:** Grok은 capability를 diagnosis의 하위원인으로 더 강하게 흡수할 것을 제안했지만, 동일 요구 capability가 여러 시스템 원인으로 실패하고 동일 diagnosis가 여러 요구 capability에서 나타나는 다대다 반례를 뒤집지 못했다. 따라서 사전 요구 태그·관측 행동·사후 primary diagnosis 분리 결정을 유지한다.
- **Correction Event Handling:** 독립 최상위 capability로 두지 않고 pre-commit state update와 post-commit recovery로 나눈 기존 결정을 지지한다.
- **Claim-Level Evidence Grounding:** 별도 관측 behavior로 파일럿하되 새 diagnosis 축으로 만들지 않는 기존 결정을 뒤집는 반례는 없었다.
- **표본 설계:** 모든 차원을 한 covering array에 넣지 말고 family별 핵심 Input factor만 조합하며 시장·환경은 block, 고위험 3-way는 mandatory cell로 분리하라는 제안을 반영했다.

### 최종 결론

4개 모델의 합의 자체는 증거로 사용하지 않았다. 독립 조작 가능성, 관측 가능한 행동 서명, 최초 결정적 오류, 기존 `Accuracy × Speed × Cost` 보존 계약과 검증된 1차 연구의 직접 지지 범위로 판정했다. Grok이 제시한 새 유효 반례는 역할 타입 명시로 흡수되었고 D1~D5의 기존 결정을 뒤집는 추가 반례는 없었다. 따라서 잠정 taxonomy를 최종안으로 확정한다.
