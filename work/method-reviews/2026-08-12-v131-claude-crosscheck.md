# standard-v1.3.1 교차 검토 — Claude Code 독립 의견

- 지위: 독립 교차 검토 의견(정본 아님). 통합 결정은 기헌.
- 검토자: Claude Code controller (std-b7·b8 production lane)
- 대상: `codex/mica-v131-rehearsal-semantics` 커밋 `c1964a0` "calibrate blind rehearsal semantics"
- 검토일: 2026-08-12 (12:30~12:45 KST 실측)

## 검증 실측

| 항목 | 결과 |
|---|---|
| 문서 5종(methodology·SKILL×2·contract·role-prompts) diff 정독 | 완료 |
| 검증기 변경(scripts, +49) 정독 | 완료 |
| 테스트 스위트 — v131 워크트리 | **OK** (2 tests, 워크트리 비오염 확인) |
| 테스트 스위트 — 현행 브랜치 d4781b9 | **OK** (production 2 + 파일럿 3 시나리오 PASS) |
| v3·v4 하위 호환 | 테스트가 std-b8(v4) validate-batch 통과를 명시 검증 |
| v5 강제 실효성 | 음성 테스트 확인 — `actualExecutionObserved=true` 위장 시 `blind-rehearsal-execution-claim` 실패 재현 |

## 판정: **채택 권고**

1. **nt-b7-01 보정의 정확한 반영.** std-b7에서 회부한 쟁점(방법 문언 "도달할 수 있다" vs 운영의 단일 표본 실제 경로 판정, 라운드 간 표본 분산 관측)을 그대로 인용하며, 리허설을 "입력 충분성·합리적 경로 존재성 검토"로 한정하고 단일 서술에서 단계 하나가 빠졌다는 이유의 실패를 명시 금지한다. b7 hold 2건을 만든 바로 그 독법 차이를 문언 수준에서 봉합한다.
2. **기계 강제 계층이 실재.** v5 스키마가 `assessmentMode=instruction-sufficiency`·`actualExecutionObserved=false`·`performanceInferenceAllowed=false`·`reachabilityBasis`(비어 있으면 실패)를 검증기로 강제하고, 성능 주장 위장을 잡는 음성 테스트가 있다. 문서 선언에 그치지 않는다.
3. **소급 없음.** v3·v4 배치는 역사 검증 대상으로 유지 — std-b7(v3 lock)·std-b8(v4) 기록 불변. 회귀 확인됨.
4. **역방향 오염 금지 조항.** "특정 구현 순서·정답 문구를 요청에 더해 한 모델의 행동을 맞추는 수정은 금지" — std-b7 개정 사이클에서 실제로 밟을 뻔한 위험(요청문의 채점표 낭독화)을 정확히 봉인한다. b7 v2 개정은 관찰 원문의 걱정·욕구 결만 실었으므로 이 조항과 충돌하지 않음도 확인했다.

## 유의 사항 (채택 시 통합 작업 메모)

1. **병합 필요**: 브랜치 베이스가 a1c2343이라 f681078(std-b8 완료)·d4781b9(실행 파일럿)와의 병합이 필요하다. 예상 충돌 지점은 methodology.md(파일럿의 "자연어 도구 입력" 절과 v1.3.1 절이 인접)와 manifest.json(방법 파일 SHA 재계산). 통합 커밋 후 `preflight`·양 테스트 스위트 재실행 권장.
2. **std-b9 잠금 순서**: 통합 커밋 → `new-batch --profile standard --batch-id std-b9`(v5) → `lock-method` → `validate-ready`.
3. **b7 hold 재판정 여지**: v1.3.1 독법에서 ki-b7-04·05의 불통과 사유(단일 표본이 특정 단계를 실제 수행하지 않음)는 reject 요건(경로 설명 불가·숨은 정보 필요·정답 단서 노출)에 해당하지 않는다 — 재판정 시 통과 가능성이 높다. 단 이는 형식 소급이 아니라 **새 검토 행위**이므로 기헌 결정 사안이다(수치 +2 잠재).
4. **미포함 항목**: 배치 점유 표식(이중 통제 예방 — std-b8에서 실제 발생한 사건의 재발 방지 장치)은 이 revision에 없다. 다음 revision 후보로 잔존.

## 절차 기록

- 검토는 코덱스 워크트리를 읽기 전용으로 사용했고 실행 후 워킹트리 비오염을 재확인했다.
- 이 의견은 std-b8 이중 통제 사건 조사(같은 날, 같은 세션)와 독립적으로 작성됐다.
