# MICA 입력 현실성 프레임워크 근거·결정 매트릭스

- 작성일: 2026-08-18
- 용도: 연구를 장식용 인용이 아니라 MICA의 구체 설계 결정과 반증 조건에 연결한다.
- 근거 규칙: 원문 또는 공식 서지 페이지가 확인된 1차 자료만 채택한다. 연구가 직접 지지하지 않는 범위는 MICA 설계 가설로 표시한다.

## 1. 대화 상태와 제약

### MultiWOZ

- 원문: https://aclanthology.org/D18-1547/
- 확인된 기여: 다중 도메인 task-oriented dialogue, belief state, slot 기반 제약 상태를 제공한다.
- MICA 결정: 여러 턴에서 누적·수정된 제약의 정답을 `finalEffectiveConstraints`와 `supersededConstraints`로 분리한다.
- 지지하지 않는 과잉 해석: 실제 장기 기억, 정책·권한, 멀티모달 입력의 충분한 포괄성.

### Schema-Guided Dialogue

- 원문: https://arxiv.org/abs/1909.05855
- 확인된 기여: intent, slot, service schema와 unseen service 일반화를 평가한다.
- MICA 결정: 의도 해소와 제약 상태 추적을 별도 capability로 유지하고, 도메인별 API 명칭 암기와 schema 일반화를 구분한다.
- 지지하지 않는 과잉 해석: 자유로운 소비자 발화 전체나 비정형 정책 판단을 slot schema로 환원하는 것.

### MINT

- 원문: https://arxiv.org/abs/2309.10691
- 확인된 기여: 도구 사용, 다중턴 상호작용, 자연어 피드백 이후 수정 능력을 평가한다.
- MICA 결정: 사용자 정정 이후 잘못된 상태 제거와 최종 성공을 각각 trajectory 진단과 outcome으로 기록한다.
- 지지하지 않는 과잉 해석: 명확한 benchmark feedback이 실제 사용자의 불완전한 정정과 동일하다는 주장.

## 2. 명확화와 모호성

### ShARC

- 원문: https://aclanthology.org/P18-1128/
- 확인된 기여: 주어진 규칙과 상황에서 최종 답 또는 follow-up question이 필요한지를 분리한다.
- MICA 결정: `Specification Completeness`는 관측된 입력 상태, `Clarification Demand`는 oracle가 판정하는 다음 행동 정책으로 구분한다.
- 지지하지 않는 과잉 해석: 모든 소비자 업무의 확률적·선호 기반 의사결정을 폐쇄형 규칙으로 표현하는 것.

### Qulac

- 원문: https://doi.org/10.1145/3331184.3331265
- 확인된 기여: clarification question의 가치를 질문 표면이 아니라 검색 결과 개선으로 평가한다.
- MICA 결정: 명확화 캘리브레이션은 질문 수가 아니라 결정 공간 감소, 성공 가능성 증가, 이미 제공된 정보 재질문 여부로 진단한다.
- 지지하지 않는 과잉 해석: 검색 facet 효용이 거래·예약·권한 경계의 질문 효용과 동일하다는 주장.

### AmbigQA

- 원문: https://aclanthology.org/2020.emnlp-main.466/
- 확인된 기여: 하나의 모호한 질문에 여러 유효한 해석과 disambiguated question-answer pair가 있을 수 있음을 보여준다.
- MICA 결정: 모호한 instance의 ground truth는 단일 숨은 의도만이 아니라 허용 가능한 interpretation set과 질문 필요 조건을 표현할 수 있어야 한다.
- 지지하지 않는 과잉 해석: 단일턴 QA의 모호성 해소를 실제 실행 비용·위험과 동일시하는 것.

## 3. 장기 기억과 갱신

### LongMemEval

- 원문: https://arxiv.org/abs/2410.10813
- 확인된 기여: information extraction, multi-session reasoning, temporal reasoning, knowledge update, abstention을 구분한다.
- MICA 결정: `Temporal & Session Scope`와 `Memory Reliability`를 분리한다. 최신성, 갱신, 철회, 근거 없음에서의 보류를 fixture에 명시한다.
- 지지하지 않는 과잉 해석: 기록에 존재하는 정보를 현재 목적에 사용할 권한까지 검증한다는 주장.

### LoCoMo

- 원문: https://arxiv.org/abs/2402.17753
- 확인된 기여: 매우 긴 대화의 single-hop, multi-hop, temporal, adversarial 기억 평가를 제공한다.
- MICA 결정: history length, fact age, distractor density, temporal reasoning requirement를 instance condition으로 기록한다.
- 지지하지 않는 과잉 해석: 합성 장기 대화가 실제 개인정보·관계·삭제 정책을 대표한다는 주장.

### LaMP

- 원문: https://arxiv.org/abs/2304.11406
- 확인된 기여: 사용자 profile retrieval과 personalized downstream task를 결합한다.
- MICA 결정: no-history, oracle-history, agent-retrieved-history 조건을 분리해 retrieval과 활용 실패를 진단한다.
- 지지하지 않는 과잉 해석: 과거 행동 기록이 명시적으로 허용된 지속 메모리와 같다는 주장.

## 4. 멀티모달·참조 해소

### SIMMC 2.0

- 원문: https://arxiv.org/abs/2104.08667
- 확인된 기여: multimodal disambiguation, coreference resolution, dialogue state tracking을 분리한다.
- MICA 결정: `Input Modality`와 `Reference Explicitness`를 분리한다. capability에서도 입력 해석과 최종 객체 ID 해소를 각각 진단한다.
- 지지하지 않는 과잉 해석: 제한된 쇼핑 장면이 실제 OCR·잘림·화질 저하까지 포괄한다는 주장.

### VisualWebArena

- 원문: https://arxiv.org/abs/2401.13649
- 확인된 기여: 시각 정보가 필수인 실제적 웹 task와 programmatic evaluator를 결합한다.
- MICA 결정: modality는 최종 성공 정의를 바꾸는 난이도 보너스가 아니라 동일 task의 외생 조건과 분석 slice로 둔다.
- 지지하지 않는 과잉 해석: 시각 요구와 입력 품질/노이즈가 같은 차원이라는 주장.

## 5. 실행 성공과 과정 진단

### τ-bench

- 원문: https://arxiv.org/abs/2406.12045
- 확인된 기여: 사용자·도구·도메인 정책·DB 상태를 결합하고 최종 상태와 반복 신뢰성을 평가한다.
- MICA 결정: 목표 달성, 정책 충족, 필수 확인을 accuracy criterion의 AND 계약으로 한 번만 판정한다. 반복 성공은 신뢰성 진단으로 공개한다.
- 지지하지 않는 과잉 해석: LLM user simulator가 사람의 장황함·기억 오류·감정·수정을 완전히 재현한다는 주장.

### OSWorld

- 원문: https://arxiv.org/abs/2404.07972
- 확인된 기여: 초기 환경 상태, 실제 컴퓨터 행동, execution-based evaluator를 결합한다.
- MICA 결정: canonical task는 목표 상태와 validator를 고정하고, realism은 입력과 환경의 instance factor로 둔다.
- 지지하지 않는 과잉 해석: 이진 task success가 모든 부분 진척을 설명한다는 주장.

### WebArena

- 원문: https://arxiv.org/abs/2307.13854
- 확인된 기여: 재현 가능한 웹 환경과 backend/functional correctness validator를 제공한다.
- MICA 결정: 정답 문구보다 post-condition read-back을 우선하고, 데이터·엔티티·환경 snapshot을 versioning한다.
- 지지하지 않는 과잉 해석: self-hosted 환경이 실제 시장별 운영 사이트 변화를 완전히 대표한다는 주장.

### AgentBoard

- 원문: https://arxiv.org/abs/2401.13178
- 확인된 기여: 최종 성공과 progress/trajectory diagnosis를 함께 분석한다.
- MICA 결정: progress, invalid action, tool error, recovery는 진단으로 공개하되 Accuracy에 더하지 않는다.
- 지지하지 않는 과잉 해석: 하나의 참조 경로에 대한 progress가 모든 유효 대안 경로를 공정하게 평가한다는 주장.

## 6. 조합 설계

### NIST SP 800-142, Practical Combinatorial Testing

- 원문: https://doi.org/10.6028/NIST.SP.800-142
- 확인된 기여: full factorial 없이 모든 t-way factor-value 조합을 포함하는 covering array를 설명한다.
- MICA 결정: 시장·도메인 최소 quota, 사전 지정 고위험 mandatory cells, 나머지 2-way/3-way covering array, random audit를 결합한다.
- 지지하지 않는 과잉 해석: covering array가 모집단 대표 표본이나 causal effect 추정을 자동 보장한다는 주장.

## 7. 채택 전 MECE 판정 규칙

새 후보를 추가하려면 네 조건을 모두 만족해야 한다.

1. 외생성: 시스템이 실행되기 전에 evaluator가 고정할 수 있는 조건인가?
2. 독립 조작 가능성: 다른 축을 고정한 채 해당 값만 바꾼 paired instance를 만들 수 있는가?
3. 배타성: 한 instance가 같은 축에서 둘 이상의 level에 동시에 속하지 않는가?
4. 비중복성: 기존 Market & Execution, 기존 진단 7축, 다른 Input Realism 축으로 손실 없이 표현할 수 없는가?

조건을 만족하지 못하면 새 축이 아니라 다음 중 하나로 이동한다.

- oracle policy label
- fixture metadata
- environment/execution condition
- capability requirement
- trajectory diagnostic
- outcome criterion

## 8. 현재 채택 가설과 반증

- 가설 A: 시간·세션 범위는 별도 Input Realism 축이다.
  - 반증: Reference Explicitness와 분리해 조작할 수 없거나, 모든 level이 reference level에 일대일 종속된다.
- 가설 B: 입력 품질/노이즈는 Input Modality와 독립된 축이다.
  - 반증: 동일 modality·의도·artifact에서 품질만 바꾼 paired instance를 만들 수 없다.
- 가설 C: 정보 접근 가능성은 Specification Completeness와 독립된 fixture 조건이다.
  - 반증: 모든 접근성 level이 complete/recoverable/clarification-required에 일대일 대응한다.
- 가설 D: Clarification Demand는 사용자 입력 스타일이 아니라 oracle policy label이다.
  - 반증: evaluator의 도구·권한·파생 가능 정보와 무관하게 발화 표면만으로 항상 결정된다.
- 가설 E: 정책·권한, 도구 실행, 복구는 새 input/capability 축이 아니다.
  - 반증: 기존 Market & Execution 및 진단 7축으로 실패를 일의적으로 귀속할 수 없는 최소 반례가 존재한다.
