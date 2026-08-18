# MICA 총괄 프레임워크 4대 LLM 독립 MECE 감사 Brief

## 목적

MICA의 기존 소비자 에이전트 평가 구조와 새 입력 현실성·에이전트 역량 제안이 MECE한지 독립적으로 감사하고, 검증된 1차 연구를 실제 스키마·샘플링·채점 결정으로 연결한다.

각 모델은 아래 동일 자료만을 근거 패킷으로 받는다. 모델 간 합의는 증거가 아니다. 각 제안은 정의 경계, 중복 여부, 누락 여부, 측정 가능성으로 판정한다.

## MICA의 보존 계약

- 범위: 10개 소비 도메인 × 6개 시장
- 기존 실행 조건: 실행 표면, 인증·권한, 완료 의미, 복구 조건, 증거 요구
- 공식 결과: Accuracy × Speed × Cost. 현실성이나 진단 점수를 새 가중항으로 추가하지 않는다.
- 기존 진단 7축: Orchestration, Model Routing, Memory, Tool/API Use, Localization, Safety, Recovery
- canonical task의 목표·최종 상태는 유지하고 현실적 요청 방식은 task instance로 변형한다.
- hard validator가 가능한 결과는 환경 상태로 판정한다. trajectory와 역량 지표는 실패 진단이며 outcome에 재가산하지 않는다.

## 현재 제안: 5개 층

1. Domain: 무엇을 하는가
2. Market & Execution: 어디서 어떤 실행 조건으로 하는가
3. Input Realism: 사용자가 어떻게 요청하는가
4. Agent Capability: 그 입력을 처리하려면 어떤 능력이 필요한가
5. Outcome & Diagnosis: 결과와 실패 원인

## 현재 Input Realism 7차원

각 task instance는 각 차원에서 값 하나를 갖는다.

1. Specification Completeness
   - complete, recoverable, clarification-required
2. Discourse Structure
   - single-clean-turn, rambling, fragmented-multi-turn
3. Revision Dynamics
   - none, correction, reversal, conflicting-update
4. Reference Explicitness
   - explicit, within-conversation, cross-session, external-history
5. Autobiographical Memory Reliability
   - not-applicable, accurate, uncertain, partially-wrong, contradictory
6. Input Modality
   - text, image-or-screenshot, document, voice-transcript, mixed
7. Clarification Demand
   - unnecessary, optional, required, handoff-required

## 현재 Agent Capability 8개

1. Intent Resolution
2. Constraint State Tracking
3. Evidence-Grounded Memory Search
4. Reference Resolution
5. Clarification Calibration
6. Multimodal Grounding
7. Correction Compliance
8. Epistemic Calibration

경계 원칙:

- Input Realism은 외생적 시험 조건, Capability는 요구 능력, Outcome은 결과, Diagnosis는 실패 원인이다.
- 기존 Memory는 확보한 상태 보존, 새 Evidence-Grounded Memory Search는 불완전한 단서에서 기록을 찾아 검증하는 능력이다.
- 기존 Recovery는 실행 실패 후 복구, Correction Compliance는 사용자 수정 후 의미·행동 상태 갱신이다.
- 하나의 실패에는 primary diagnostic cause 하나와 필요 시 secondary contributor만 둔다.

## 현재 평가 설계

- 모든 canonical task에 clean text anchor instance를 둔다.
- canonical task마다 현실성 variation 2~3개를 배정한다.
- 입력 차원에는 family 단위 strength-2 covering array를 사용한다.
- 시장 blocking으로 현실성 조건과 시장의 교락을 줄인다.
- 복합 조건 일부는 holdout으로 둔다.
- 같은 canonical task의 anchor와 variation을 paired comparison한다.
- 현실성에 난이도 가중치를 주지 않는다.
- 질문·검색·scripted user answer를 포함한 단일 wall-clock과 전체 비용을 측정한다.

## 검증한 1차 연구 근거

아래는 원문/공식 페이지를 확인한 자료다. 제목과 URL 밖의 세부 주장은 아래 요약 범위에서만 사용한다.

1. MultiWOZ, 다중 도메인 task-oriented dialogue, belief state와 slot 제약 추적
   - https://aclanthology.org/D18-1547/
2. Schema-Guided Dialogue, intent/slot/schema와 unseen service 일반화
   - https://arxiv.org/abs/1909.05855
3. MINT, 도구와 자연어 피드백을 포함한 multi-turn interaction 및 피드백 후 수정
   - https://arxiv.org/abs/2309.10691
4. τ-bench, 사용자·도구·정책·DB 상태를 포함한 실제 도메인 상호작용, 최종 상태와 반복 신뢰성
   - https://arxiv.org/abs/2406.12045
5. ShARC, 규칙 기반 결정에서 답 또는 필요한 follow-up 질문을 분리 평가
   - https://aclanthology.org/P18-1128/
6. Qulac, clarification question이 검색 효용을 얼마나 개선하는지 평가
   - https://doi.org/10.1145/3331184.3331265
7. LongMemEval, multi-session memory, temporal reasoning, knowledge update, abstention
   - https://arxiv.org/abs/2410.10813
8. LoCoMo, 장기 대화의 single-hop, multi-hop, temporal, adversarial 기억 평가
   - https://arxiv.org/abs/2402.17753
9. SIMMC 2.0, multimodal disambiguation, coreference, dialogue state tracking
   - https://arxiv.org/abs/2104.08667
10. OSWorld, 실제 컴퓨터 환경의 초기 상태·행동·execution-based evaluator
   - https://arxiv.org/abs/2404.07972
11. WebArena, 재현 가능한 웹 환경과 functional correctness/backend state validator
   - https://arxiv.org/abs/2307.13854
12. AgentBoard, final success와 progress/trajectory diagnosis의 분리
   - https://arxiv.org/abs/2401.13178
13. NIST SP 800-142 Practical Combinatorial Testing, t-way covering array
   - https://doi.org/10.6028/NIST.SP.800-142

보조 검토 후보:

- AmbigQA: plausible interpretation set과 disambiguated QA
  - https://aclanthology.org/2020.emnlp-main.466/
- LaMP: 사용자 profile retrieval과 personalization task
  - https://arxiv.org/abs/2304.11406
- FaithDial: knowledge-grounded dialogue의 claim faithfulness
  - https://aclanthology.org/2022.tacl-1.84/
- VisualWebArena: 시각 정보가 필요한 웹 실행 task
  - https://arxiv.org/abs/2401.13649
- WebLINX: 실제 웹 navigation과 multi-turn dialogue trajectory
  - https://arxiv.org/abs/2402.05930

## 1차 조사에서 제기된 누락 후보

이들은 자동 채택하지 말고 MECE 경계를 판정해야 한다.

- Temporal & Session Scope: same-turn, same-session, cross-session, long-horizon, updated/stale
- Input Quality / Noise: clean, ASR/OCR error, partial/cropped, conflicting artifacts
- Information Availability / Observability: utterance-only, context-known, retrievable, tool-observable, inaccessible
- Policy/Permission condition
- Tool execution/state verification
- Failure recovery
- Claim-level grounding

주의: 마지막 네 항목은 기존 Market & Execution 또는 기존 7개 진단축에 이미 있을 수 있다. 새 Input Realism이나 Agent Capability에 넣으면 중복인지 판정하라.

## 모델별 필수 산출 형식

한국어로 작성한다. 표 대신 목록을 사용한다.

1. MECE 판정
   - 5개 층 각각의 필요충분 정의
   - 층 간 겹침과 잘못 배치된 항목
2. Input Realism 감사
   - 현재 7차원의 중복, 누락, level 비배타성
   - 유지·병합·이동·추가 결정을 각각 명시
3. Agent Capability 감사
   - 현재 8개와 기존 진단 7축의 중복
   - 유지·병합·이동·추가 결정을 각각 명시
4. 근거-결정 연결
   - 각 채택 연구가 어떤 구체 설계 결정을 지지하는지
   - 연구가 지지하지 않는 과잉 해석
5. 측정·샘플링·스키마
   - anchor/variation, covering array, mandatory risk cells, market blocking, repetitions, holdout
   - task success와 trajectory diagnosis 이중계상 방지
6. 최종 권고 taxonomy
   - 축/레벨 이름과 정확한 경계
   - 구현 우선순위 P0/P1/P2
7. 반증 및 수용 기준
   - 이 프레임워크가 MECE하지 않다고 판정할 테스트
   - 파일럿이 설계를 지지하거나 폐기하게 할 측정 기준

## 핵심 질문

- 시간·세션 범위는 Reference Explicitness에 포함되는가, 별도 외생 조건인가?
- 사용자 기억의 신뢰도와 기록의 최신성은 같은 차원인가?
- Input Modality와 입력 품질/노이즈는 독립적인가?
- Specification Completeness와 Information Availability는 중복인가?
- Clarification Demand는 입력 속성인가, oracle policy label인가?
- Correction Compliance는 Capability인가, 기존 Memory/Recovery의 진단 하위유형인가?
- Claim-level grounding은 Epistemic Calibration과 분리돼야 하는가?
- 정책·권한, 도구 실행, 복구를 새 capability에 넣지 않고도 총괄 프레임워크가 완전한가?
- 완전요인 없이 어떤 표본 설계로 주요 상호작용과 고위험 조합을 보장할 것인가?

## 금지

- 연구 제목·URL·수치를 지어내지 않는다.
- 모델 합의를 사실 근거로 취급하지 않는다.
- 모든 후보를 무조건 새 축으로 추가하지 않는다.
- 기존 Accuracy × Speed × Cost에 새 현실성·진단 점수를 중복 가산하지 않는다.
- 현재 문서의 표현을 그대로 요약하는 데 그치지 않는다. 반례를 들어 분류 경계를 공격한다.
