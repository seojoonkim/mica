# 독립 관찰에서 측정 가능 후보까지

- execution profile: `standard`
- method revision: `standard-v1.3` (2026-08-11 기헌 채택 — `standard-v1.2-b5` + std-b6 Codex 감사 보강 + 상세성 적합성 검토의 노출면 계약·blind-agent rehearsal·정적 누출 감사·`중요하지만 현재 측정 불가` 원장. 근거: work/method-reviews/2026-08-11-detail-fitness-*)
- batch ceiling: 최대 5건
- estimated duration: 1회 약 6–12시간
- relationship: 기존 전체 방법론이며 압축 프로필은 [`methodology-lean-v1.md`](./methodology-lean-v1.md)에서 별도로 정의

## 1. 목표 정의

목표 수량은 raw 아이디어가 아니라 다음 관문을 통과한 `measurable-candidate`다.

1. 근거가 있는 생활 필요 관찰
2. 독립 의미 검토와 관찰 동결
3. 종단 간 상태 변화 과업으로 번역
4. 독립 후보 검토와 후보 동결
5. 기존 과제와 사후 대조
6. 실제 simulator 자산과 독립 oracle을 포함한 측정 설계

시장 검토, 현지화, 실제 실행, 공개 승격은 별도 상태다.

## 2. 작성 입력과 비교 입력을 분리한다

작성자와 번역자는 기존 MICA 과제, 과거 후보, 비교 판정, gap 목록을 보지 않는다. 공식 과제는 후보 동결 뒤 대조자만 열 수 있다. 대조 결과는 작성자에게 되돌아가지 않는다.

이 분리는 기존 과제를 맹목적으로 추종하지 않으면서도, MICA가 처음 의도한 완성형 시스템·실제 상태 변화·권위 있는 완료 근거·안전한 실행 구조를 유지하기 위한 장치다.

## 3. 역할 분리

- source researcher ≠ source reviewer
- need writer ≠ observation reviewer ≠ observation custodian
- task translator ≠ candidate reviewer ≠ candidate custodian
- comparator ≠ measurement asset author ≠ oracle reviewer ≠ measurement reviewer

작성자 자기심사를 금지한다. 각 단계는 원문 행과 판정을 별도 보존하며, 수락된 행만 다음 상태로 동결한다.

## 4. 과업 후보의 최소 계약

후보는 최소한 다음 질문에 답해야 한다.

- 어떤 사람의 어떤 시작 상태가 바뀌는가?
- 단순 답변이 아니라 어떤 외부 상태 또는 검증 가능한 전달물이 달라지는가?
- 어떤 readback, 사건 번호, 영수증, 발급 기록, 최종 판정이 완료를 증명하는가?
- 어디에서 이용자 확인을 받고 멈춰야 하는가?
- 절대 발생하면 안 되는 상태는 무엇인가?
- 실패를 주입했을 때 어떻게 복구하거나 안전하게 인계하는가?
- 어느 실행 트랙에서 피해 없이 반복할 수 있는가?
- 아직 모르는 시장 사실과 교정값을 정확히 미확인으로 남겼는가?

## 5. 측정 계약

이번 15건은 모두 다음 조건으로 `designable` 판정을 받았다.

- 실행 트랙: `simulator`
- 정확도: 모든 필수 조건을 충족해야 하는 이분 판정
- 완료 근거: 선언된 권위 registry와 readback
- 초기화: 후보별 deterministic reset
- 실행 자격: fail-closed attempt eligibility
- 실패 주입: 정상·실패·복구 variant
- 독립성: oracle reviewer와 measurement reviewer 분리
- 미교정 값: timeout, 목표 비용, 반복 수

`designable`은 측정 자산을 구성할 수 있다는 뜻이다. 성능 결과나 실행 성공을 뜻하지 않는다.

## 6. 파일럿에서 확인된 결함 유형

- closure/review 전체 key shape가 계약에 충분히 적혀 있지 않음
- controller가 전달해야 할 artifact path·SHA 누락
- 실제 원문 행과 nested 객체의 해시 혼동
- 접수나 준비 문서를 외부 상태 완료로 오인
- 선택지별 승인 payload와 성공 readback·oracle의 결속 부족
- 비교 source enum 불일치
- 기대 판정표의 각 행은 그럴듯하지만 하나의 trace에서 동시에 충족되지 않는 측정 자산
- 자격 gate와 실제로 차단되는 locked path가 1:1로 결속되지 않은 측정 자산
- 재검사에서 이전 값을 되살릴 수 있는 일회성 실패 injector
- 원문 첨부를 직접 내려받기 전에 2차 자료로 재구성한 출처 수집

모든 결함은 원문을 조용히 고치는 대신 중단, 계약 보완, 독립 재검토 순서로 닫았다. 유효하지 않은 중간 artifact는 저장하거나 후속 입력으로 사용하지 않았다.

### standard-v1.1-b4 회귀 규칙

1. fixture 작성 전 기대 판정표의 정상·실패·복구 행을 하나의 trace에 대입해 동시에 성립 가능한지 확인한다.
2. eligibility의 각 gate는 차단되는 locked path와 1:1로 대응시킨다.
3. 실패 상태는 variant에 고정한다. 한 번만 값을 바꾸는 injector로 재검사 결과를 만들지 않는다.
4. 판정 규칙은 위에서 아래로 첫 일치 규칙을 적용한다. 규정 threshold와 사용자의 실제 값은 서로 다른 필드이므로 값 차이만으로 source conflict라 하지 않는다.
5. 공식 페이지가 첨부 파일을 제공하면 직접 첨부 경로를 먼저 확인하고, 2차 자료 재구성은 직접 원문을 확보할 수 없을 때만 한계와 함께 사용한다.

### standard-v1.2-b5 회귀 규칙

1. 한 활성 배치의 같은 artifact path는 한 런타임만 쓴다. producer가 입력 artifact를 닫고 SHA-256을 controller에 넘긴 뒤에만 reviewer를 시작한다.
2. reviewer는 시작 전·쓰기 직전·완료 후 입력 SHA-256을 다시 확인한다. 값이 달라지면 결과를 채택하지 않고 `stale-review-evidence/`에 격리한다.
3. EXP 기대값에 쓰는 모든 literal label은 허용 registry에 구 단위로 먼저 열거한다. 정답 trace가 registry에 없는 표현을 요구하면 asset을 수락하지 않는다.
4. 부분 산출·상태 요약의 누락 성분 처리 규칙은 모든 variant에서 하나여야 한다. 기대 판정표와 formula가 서로 다른 누락 규칙을 쓰면 차단한다.
5. 두 사건의 엄격한 선후를 요구하는 branch는 두 사건이 모두 존재할 때만 평가한다. 하나라도 없으면 `NOT-APPLICABLE`이며 vacuous true로 간주하지 않는다.
6. custodian은 원문 JSONL 행의 전체 SHA-256과 독립 context ID를 기록한다. 잘린 hash나 controller의 기계적 대행으로 동결하지 않는다.
7. 실제 사업자명은 source evidence와 출처 표기에만 남긴다. 후보·fixture·oracle에는 기능적 권위 역할 또는 합성 식별자를 쓰며, 실명 자체가 판정 대상인 예외는 별도 검토 근거를 남긴다.

### std-b6 Codex 감사 보강 규칙

`std-b6`는 `standard-v1.2-b5`로 생산됐고 3건이 `designable`까지 통과했다. 다음 배치부터는 아래 항목도 종결 조건으로 적용한다.

1. 역할 산출물의 `*ContextId`와 동결 담당 표기는 `self` 같은 상대 표현이 아니라 실제 실행 컨텍스트 ID여야 한다. controller는 `batch-manifest.json`의 `modelRecord`와 각 행의 값을 대조한다.
2. controller는 마지막 측정 검토, `measurement-contracts.jsonl`, 결함 원장, closure까지 모든 최종 산출물의 SHA-256을 종결 원장에 기록한다. 자기참조가 생기는 `batch-manifest.json` 자체만 예외다.
3. 측정 자산은 probe·sink·이벤트를 한 번의 호출로 기록하는지 건별 호출로 기록하는지 원자적 호출 단위를 선언하고, 최악 경로의 호출 수가 합성 시계 상한 안에 드는지 `designable` 판정 전에 증명한다.
4. 비차단 정리 항목이 남아 있는 `designable` 후보는 측정 설계 완료로 집계할 수 있지만 실제 simulator 실행 전에는 해당 항목을 닫아야 한다. `designable`을 실행 검증 완료로 표현하지 않는다.

### 상세성 적합성 검토 이후의 노출면 계약

2026-08-11 Claude Code와 Codex의 독립 검토는 `노출면은 간결하게, 평가 하네스는 엄밀하게`에 합의했다. 상세한 최종 상태·금지 상태·실패 변형·oracle은 재현 가능한 평가에 필요하지만, 이를 피측정 에이전트에게 그대로 주면 생활과업 수행 능력이 아니라 명세 준수 능력을 측정하게 된다.

후보 하나는 다음 세 표면으로 분리한다.

| 표면 | 포함 항목 | 피측정 에이전트 접근 |
|---|---|---:|
| `agent-visible` | 자연어 `userRequest`, 사용자가 이미 알고 제공한 제약, 공통 안전 정책, 허용 도구 범위 | 허용 |
| `evaluator-visible` | 시작 상태 요약, 최종 상태, 승인 경계, 금지 결과, 안전 인계 기준 | 금지 |
| `harness-private` | fixture, 실패 variant, reset, eligibility, full oracle, probe, registry, event ID, tick·비용 계산 | 반드시 금지 |

`candidate-specs.json`과 `task-candidates.jsonl`은 평가자용 연구 명세다. 실제 실행에서 피측정 에이전트에게 전달하는 입력 파일이 아니다. 실행기는 `agent-visible` 묶음만 직렬화하고, 평가자는 도구 호출·외부 상태·최종 응답에서 내부 판정 레코드를 파생해야 한다. 에이전트에게 내부 JSON schema, 판정 토큰, event ID 또는 probe 레코드 생성을 요구하지 않는다.

oracle은 `minimum sufficient oracle` 원칙을 따른다. 사용자가 원한 결과, 권위 있는 readback, 승인 경계, 금지 상태, 안전한 실패를 이분 판정하는 데 필요한 최소 조건만 둔다. 특정 클릭 순서, 특정 문구, 내부 필드명은 결과가 같다면 성공의 필수조건으로 만들지 않는다.

다음 배치부터 measurement review 뒤 `blind-agent rehearsal`을 추가한다. 별도 컨텍스트가 `agent-visible` 묶음만 받고 상식적인 수행 경로를 설명하거나 합성 환경에서 리허설한다. measurement reviewer는 그 기록과 비공개 계약을 대조해 다음을 모두 확인해야 `designable`로 종결할 수 있다.

1. 사용자 요청에 정답 상태·실패 분기·채점 식별자가 누출되지 않았다.
2. 명세를 모르는 에이전트도 도구 탐색과 권위 있는 readback을 통해 성공 경로에 도달할 수 있다.
3. 자연어 응답을 내부 판정 형식으로 바꾸는 책임이 하네스에 있다.
4. 평가 조건이 사용자 결과와 무관한 특정 표현·구현 순서를 강제하지 않는다.
5. 실행 런타임에서 `evaluator-visible`과 `harness-private` 파일 경로를 읽을 수 없다.

기존 27개 측정 설계는 폐기하지 않는다. 실제 실행에 투입하기 전에 전수 정적 누출 감사를 하고, 우선 실행할 소수 후보부터 blind-agent rehearsal을 통과시킨다. 측정하기 어렵지만 삶의 중요도가 큰 관찰은 삭제하지 않고 `중요하지만 현재 측정 불가` 원장에 보존한다.

새 생산 배치는 `mica.scenario-production-batch/v4`를 사용한다. 공개 요청은 `agent-visible.jsonl`, 블라인드 리허설은 `blind-agent-rehearsal.jsonl`에 분리하고, `validate-exposure`가 내부 필드·채점 식별자 누출, 공개 행 원문 SHA, 후보 집합과 이분 판정을 확인한다. 기존 `v3` 배치에는 이 형식을 소급하지 않는다.

### standard-v1.3 확정 사항 (2026-08-11 기헌 채택)

위 노출면 계약과 std-b6 감사 보강 규칙을 묶어 `standard-v1.3`으로 확정한다. 추가 확정:

1. 소급 강도: 기존 designable 전건은 **정적 누출 감사**(에이전트 노출 후보 필드에 하네스 내부
   식별자·채점 어휘 등장 여부 스캔)를 통과해야 하며, blind-agent rehearsal은 실제 실행에
   투입하는 후보부터 적용한다. 전면 재제작은 하지 않는다.
2. `중요하지만 현재 측정 불가` 원장: `docs/kiheon-ideation-pilot-15/deferred-needs-ledger.jsonl`.
   과업 번역 불가(외부 확인 불가·제도 층위 등)로 거절된 관찰 중 삶의 비중이 큰 항목을 원문
   보존 형태로 수록하고, 새 환경·oracle 수단이 생기면 재검토한다. 수록은 삭제·격하가 아니라 보존이다.
3. 사이먼 정렬 시점: 100개 아이디어 완성 후. 비공개 하네스 상세 공유는 GitHub PR로 상정하고
   채택·병합 시점에 실제 반영한다(병합 전에는 정본·운영에 미반영).
4. 웹 진행판·팀 커뮤니케이션: 설계 수와 실행 수를 분리 표기하고 `0회 실행`을 성공률·실패율로
   읽히게 하지 않는다.

## 7. 통합 해석

15건 중 12건은 기존 필요를 더 엄격한 실행·완료·복구 구조로 바꾼 `transformation`, 3건은 고정 비교군에서 동일 상태 구조를 찾지 못한 `independent-finding`이다. 이 결과는 신규성 또는 시장 가치의 최종 증명이 아니다.

과업은 공공·제도·권리·민감 행정, 복수 기관과 권한 조정에 편중돼 있다. 다음 제작이나 검토에서는 기존 과제명이 아니라 저위험 반복 실행, 생활 유지, 탐색·거래와 같은 추상 coverage 차원을 독립 조사 질문으로 사용해야 한다.

## 8. 방법론 성숙도와 100건 확장

현재 버전은 `intermediate-iteration-release`다. 15건의 통과 후보와 여러 정상 거절·보류·fail-closed 사례를 통해 공정이 실제로 작동한다는 근거는 확보했지만, 모든 과업 유형과 시장에서 결함이 없다고 주장하지 않는다. 정량 신뢰도 점수도 부여하지 않는다.

후속 제작은 다음 상태 전이를 반복한다.

1. 표준 5개 단위에서 근거 조사부터 측정 심사까지 전체 공정을 닫는다.
2. 현재 범위에서 새 실행 가능한 공정 결함이 없고 기존 결함 회귀가 통과할 때만 10개 단위로 승격한다.
3. 10개 단위에서 구조 결함, 역할 충돌, 비교 결과 역류 또는 반복 편중이 발견되면 표준 5개 단위로 강등한다.
4. 통과한 `measurable-candidate`만 누적해 현재 15건에서 100건으로 확장한다.
5. 100건 도달 뒤 전수 중복·coverage·측정 계약·시장 상태·실행 적합성·공개 경계를 통합 분석한다.

남은 85건은 한 번에 생성하는 백로그가 아니다. 각 배치의 수락·거절·보류와 결함 원장을 보존하고, 중간 버전을 후속 PR로 공유하면서 방법론 자체의 완성도를 단계적으로 높인다.

## 9. 런타임 분업과 방법 동결

Codex는 완료 배치의 결함 분석, 방법론·검증기 수정, 회귀 검사와 다음 revision 동결을 맡는다. Claude Code는 동결된 revision으로 신규 배치를 생산하고 결함 원장과 closure를 반환한다. 진행 중인 배치에는 방법 변경을 소급하지 않는다.

새 배치는 `prepared-unlocked → prepared-locked → in-progress` 순서로 진행한다. `methodLock`은 revision, 방법 source commit과 파일별 SHA-256을 기록한다. 자세한 역할과 인수인계 규칙은 [`codex-claude-operating-model.md`](./codex-claude-operating-model.md)를 따른다.
