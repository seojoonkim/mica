# MICA 프레임워크 MECE 수용 테스트

## 목적

분류 이름의 그럴듯함이 아니라 실제 task instance 저작과 채점에서 상호 배타성·전체 포괄성·이중계상 방지를 검증한다.

## A. 층 경계 테스트

### A1. 외생 조건 테스트

- 질문: 시스템 실행 전에 evaluator가 고정할 수 있는가?
- 예: 발화가 장황함, 이미지가 흐림, 기록이 6개월 전임.
- 통과: Input/Environment condition.
- 실패: 실행 후 나타나는 질문 품질·도구 오류·성공 여부는 다른 층으로 이동.

### A2. 능력 대 결과 테스트

- 질문: 동일 조건에서 시스템에 따라 달라지는 처리 능력인가, 최종 상태인가?
- 통과 예: referent를 올바른 객체에 연결하는 능력.
- 실패 예: 예약이 완료됨은 outcome, API 409 후 재시도는 trajectory/recovery.

### A3. 진단 중복 테스트

- 하나의 최소 실패 trace에 primary cause를 하나만 지정한다.
- 두 축이 항상 함께 primary로 필요하면 정의를 다시 분리하거나 병합한다.
- secondary contributor는 허용하되 공식 집계에서 중복 count하지 않는다.

## B. Input Realism 축별 독립 조작 테스트

각 후보 축은 다른 모든 의미 계약을 고정한 paired instance로 검증한다.

### B1. Specification Completeness × Information Availability

- Pair 1: 요청에는 예산이 없지만 승인된 프로필에서 조회 가능.
- Pair 2: 요청에는 예산이 없고 어떤 허용 기록에서도 조회 불가.
- 기대: 표면적 누락은 같지만 첫 번째는 recoverable, 두 번째는 clarification-required.
- 판정: 접근 가능성이 completeness 판정의 근거라면 별도 축보다 fixture metadata로 둘 수 있다. 분석 가치가 독립적으로 확인되면 외생 condition으로 승격한다.

### B2. Discourse Structure × Revision Dynamics

- Pair 1: 장황하지만 수정 없음.
- Pair 2: 간결한 두 턴에서 명시적 정정.
- 기대: rambling과 correction이 독립적으로 나타난다.

### B3. Reference Explicitness × Temporal Scope

- Pair 1: 같은 턴에 “두 번째 것”을 참조.
- Pair 2: 6개월 전 대화의 고유 ID를 명시.
- Pair 3: 6개월 전 대화를 “그때 그 호텔”로 암시.
- 기대: 참조의 명시성과 시간·세션 거리가 독립적으로 변한다.

### B4. Memory Reliability × Record Freshness

- Pair 1: 사용자 기억은 정확하지만 이후 선호가 갱신됨.
- Pair 2: 사용자 기억은 틀리지만 기록은 최신·권위 있음.
- 기대: 사용자 회상 신뢰도와 저장 기록 최신성/유효성은 다른 속성이다.

### B5. Modality × Input Quality

- Pair 1: 깨끗한 스크린샷.
- Pair 2: 같은 스크린샷을 잘라 핵심 모델명이 일부 누락.
- Pair 3: 깨끗한 음성 전사.
- Pair 4: 같은 음성에 ASR entity 오류 삽입.
- 기대: modality와 noise가 독립적으로 변한다.

### B6. Clarification Demand 위치

- 같은 발화를 제공하되 agent가 접근 가능한 기록/도구/권한을 다르게 한다.
- 질문 필요 여부가 달라지면 Clarification Demand는 순수 입력 스타일이 아니라 oracle policy label이다.

## C. Capability와 기존 진단 경계 테스트

### C1. Intent Resolution vs Orchestration

- 올바른 목적을 복원했지만 하위 작업 순서를 잘못함: Orchestration primary.
- 목적을 잘못 복원해 완벽히 다른 일을 효율적으로 수행함: Intent Resolution primary.

### C2. Constraint State Tracking vs Memory

- 현재 episode 내 정정을 폐기하지 못함: Constraint State Tracking primary.
- 이전 세션의 확정 선호를 저장하지 못함: 기존 Memory primary.
- 검색은 했지만 오래된 사실을 최신으로 오인함: temporal/source validation 관련 primary.

### C3. Correction Compliance vs Recovery

- 사용자 의미 정정을 반영하지 않음: Correction Compliance primary.
- API 실패 후 대체 경로를 못 찾음: Recovery primary.
- 사용자 정정 때문에 실행 중 작업을 되돌려야 하는 복합 trace: 의미 갱신 실패와 실행 복구 실패를 시점별 event로 나눠 각각 하나의 primary를 부여한다.

### C4. Epistemic Calibration vs Claim Grounding

- 근거가 부족함을 알면서 단정함: Epistemic Calibration primary.
- 충분한 문서를 찾았지만 문서에 없는 속성을 덧붙임: Grounding/Faithfulness primary 후보.
- 두 반례가 일관되게 분리되면 claim grounding을 별도 diagnostic으로 둔다. 그렇지 않으면 epistemic calibration의 하위 metric으로 둔다.

### C5. Tool/API Use vs Multimodal Grounding

- 이미지에서 모델을 잘못 읽고 올바른 API를 호출함: Multimodal Grounding primary.
- 모델은 정확히 읽었지만 잘못된 variant ID로 API 호출: Tool/API Use primary.

### C6. Safety/Permission vs Clarification

- 보안 경계 때문에 사용자 승인이 필수: 기존 Safety/Market & Execution에서 boundary를 정의하고 Clarification/Handoff oracle label로 다음 행동을 판정한다.
- 이를 별도 capability로 중복 추가하지 않는다.

## D. 전체 포괄성 테스트

최소 30개의 현실적 consumer utterance archetype을 blind coding한다.

필수 archetype:

- 완전 명세 단일 턴
- 장황하지만 충분한 요청
- 여러 턴에 흩어진 제약
- 명시 정정
- 암묵 철회
- 충돌 업데이트
- 같은 턴 대명사
- 화면 내 공간 참조
- 과거 세션 참조
- 외부 이메일·캘린더 참조
- 정확한 회상
- 불확실한 회상
- 부분적으로 틀린 회상
- 최신 기록과 충돌하는 오래된 회상
- 깨끗한 이미지
- 잘린 이미지
- OCR 오류 문서
- ASR 오류 음성
- mixed input
- 도구로 복원 가능한 누락
- 사용자에게만 확인 가능한 누락
- 접근 불가 정보
- 승인·인증 핸드오프
- 정책과 사용자 요구 충돌
- API 일시 실패
- 중복 실행 위험
- 장기 기록 갱신
- 근거 없는 개인화 유도
- 질문이 필요 없는 모호함
- 질문이 반드시 필요한 모호함

수용 기준:

- 모든 archetype이 손실 없이 coding 가능해야 한다.
- 같은 축에서 둘 이상의 level이 필요한 사례 비율이 5%를 넘으면 level 설계를 수정한다.
- `other` 또는 자유 텍스트 예외가 5%를 넘으면 누락 축을 조사한다.
- 두 축의 값이 파일럿 전체에서 95% 이상 함께 움직이면 병합·fixture 이동 여부를 검토한다.

## E. 표본·통계 테스트

- 도메인과 시장별 최소 quota가 있는가?
- 위험 조합이 covering array의 우연한 포함에 의존하지 않는가?
- 모든 2-way factor-level pair의 coverage가 기계적으로 검증되는가?
- stochastic system은 사전 등록된 seed와 반복 수를 사용하는가?
- 동일 canonical task의 anchor/variation이 같은 시스템·버전에서 paired 되는가?
- 시장/언어별 번역이 아니라 동등 난이도의 현지 자연어로 검수되는가?
- template, entity/data, temporal, user/site holdout이 분리되는가?

## F. 이중계상 테스트

한 실패가 공식 점수에 들어가는 경로를 추적한다.

- 최종 상태 미달: Accuracy 한 번.
- 추가 질문·검색: wall-clock과 비용을 통해 Speed/Cost 한 번.
- 질문 품질·constraint 누락·memory retrieval 오류: diagnostic만.
- progress/subgoal: diagnostic만.
- 현실성 난이도: 별도 보너스·가중치 없음.
- 반복 성공: reliability slice이며 per-attempt outcome에 재가산하지 않음.

공식 score 식과 모든 공개 diagnostic에서 동일 사건의 중복 감점·가산 경로가 발견되면 실패다.

## G. 파일럿 수용·폐기 기준

- taxonomy 수용: blind coder 간 축별 합의도가 사전 등록 임계치를 넘고, 배타성 위반·other 비율이 기준 이내다.
- 축 유지: paired manipulation이 해당 축의 성능 변화 또는 failure mode 차이를 재현하며 다른 축으로 완전히 설명되지 않는다.
- 축 병합: 두 축이 독립 조작되지 않거나 거의 완전한 공선성을 보인다.
- level 재설계: 동일 instance가 한 축의 복수 level에 반복적으로 속한다.
- capability 폐기/이동: 기존 진단축과 primary cause가 안정적으로 분리되지 않는다.
- 점수 계약 유지: 현실성 변형이 있어도 같은 canonical success predicate와 A×S×C 의미가 유지된다.
