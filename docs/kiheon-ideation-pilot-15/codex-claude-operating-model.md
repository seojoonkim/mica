# Codex·Claude Code 분업 운영 모델

- origin: `kiheon-ideation`
- status: `active-production-contract`
- current standard revision: `standard-v1.3.1`
- current compressed revision: `lean-v1.2-b5`

## 1. 역할 선언

### Codex: 공정 관리와 품질 고도화

Codex는 생산 공정의 control plane을 맡는다.

- 완료 배치의 결함 원장과 거절·수정 이력을 분석한다.
- 방법론, 역할 계약, 검증 도구와 회귀 검사를 보완한다.
- 다음 배치가 사용할 방법 revision과 원문 파일 해시를 동결한다.
- 완료 배치가 역할 분리, accepted-only 동결, 사후 대조, 측정 결속을 지켰는지 통합 감사한다.
- 결함 수정은 진행 중인 배치에 끼워 넣지 않고 다음 배치 revision으로만 승격한다.

Codex가 신규 생활 필요를 대신 작성하거나, 생산 중인 후보를 의미 수정해 통과시키지 않는다.

### Claude Code: 동결된 공정으로 신규 배치 생산

Claude Code는 production lane을 맡는다.

- `batch-manifest.json`에 동결된 revision과 파일 해시만 사용한다.
- 독립 1차 자료 조사부터 관찰·후보·측정 계약까지 역할을 분리해 실행한다.
- 각 역할의 출력 원문을 수정하지 않고 수락된 행만 다음 단계로 동결한다.
- 실행 중 발견한 결함은 `defect-ledger.jsonl`에 기록하되 방법 파일을 직접 바꾸지 않는다.
- 배치를 완료하거나 fail-closed로 닫은 뒤 Codex에 결함과 회귀 결과를 돌려준다.

Claude Code가 배치 도중 방법 revision을 바꾸거나 비교 결과를 작성자에게 되돌리지 않는다.

## 2. 배치 경계

```text
완료 배치
  → Codex 결함 분석
  → 방법·검증기 수정
  → 회귀 검사
  → 방법 revision 커밋
  → 빈 배치에 method lock 기록
  → Claude Code 신규 생산
  → 독립 검토·동결·측정
  → 완료 또는 fail-closed 종료
```

배치가 시작된 뒤에는 method lock을 바꾸지 않는다. 수정이 필요하면 현재 산출물을 보존하고 배치를 닫은 다음, 새 revision과 새 배치 ID로 다시 시작한다.

## 3. 자동 관문

새 배치는 다음 세 상태를 순서대로 지난다.

1. `prepared-unlocked`: 빈 배치만 생성된 상태. 생산 금지.
2. `prepared-locked`: 커밋된 방법 revision과 파일별 SHA-256이 결속된 상태.
3. `in-progress`: `validate-ready` 통과 후 production lane이 역할 실행을 시작한 상태.

```bash
python3 scripts/mica-scenario-production.py lock-method \
  work/mica-scenario-batches/<batch-id>

python3 scripts/mica-scenario-production.py validate-ready \
  work/mica-scenario-batches/<batch-id>
```

`validate-ready`는 빈 산출물, 열린 closure, 미할당 역할, 현재 checkout의 방법 파일과 동결 해시 일치를 확인한다. PASS는 생산 시작 조건만 확인하며 의미 품질이나 후보 수락을 승인하지 않는다.

## 4. standard-v1.1-b4에 반영된 회귀 규칙

`std-b4`에서 발견한 결함과 비차단 관찰을 다음 revision의 공통 규칙으로 승격했다.

1. measurement asset 작성 전에 기대 판정표의 모든 성공·실패·복구 행이 같은 trace에서 동시에 성립 가능한지 확인한다.
2. 자격 gate의 각 항목은 차단되는 locked path와 1:1로 연결한다.
3. 재검사 때 과거 값이 되살아나는 일회성 injector 대신 variant 자체의 상태로 실패를 고정한다.
4. 판정 규칙은 위에서 아래로 첫 일치 규칙을 적용한다. 규정 threshold와 사용자의 실제 값은 별도 필드이며, 값 차이만으로 source conflict로 분류하지 않는다.
5. 원문 페이지가 첨부 링크를 제공하면 `download.do`, `fileDown.do` 같은 직접 첨부 경로를 먼저 시도하고, 2차 자료 재구성은 최후 수단으로 남긴다.

## 5. standard-v1.2-b5에 반영된 회귀 규칙

`std-b5`에서 측정 설계 자체의 모호성과 교차 런타임 입력 경합을 확인했다. 다음 빈 배치부터 아래를 공통 관문으로 사용한다.

1. 한 활성 배치의 같은 artifact path는 한 런타임만 소유한다. producer가 입력을 닫고 SHA-256을 controller가 기록하기 전에는 reviewer를 시작하지 않는다.
2. reviewer는 시작 전·쓰기 직전·완료 후 입력 SHA-256을 검증한다. 중간에 값이 바뀌면 결과를 채택하지 않고 stale evidence로 격리한다.
3. EXP expected table의 literal label은 허용 registry에 전부 열거한다. 누락 성분 처리 formula는 모든 variant에서 하나로 유지한다.
4. strict-before 같은 사건 순서는 두 사건이 모두 존재할 때만 평가하며, 사건 부재는 `NOT-APPLICABLE`로 처리한다.
5. accepted-only freeze는 원문 행 전체 SHA-256과 별도 custodian context를 남긴다. 잘린 hash나 controller 대행 freeze는 허용하지 않는다.
6. source evidence의 실제 발행 주체와 후보의 실행 권위 표현을 분리한다. 후보·fixture·oracle은 기능적 역할 또는 합성 식별자를 사용한다.

## 6. 교차 런타임 점검

- Claude Code는 매 배치 closure에 method revision, source commit, 역할별 모델·context ID를 기록한다.
- Codex는 매 배치 종료 뒤 결함 원장과 구조 회귀를 확인한다.
- 두 배치마다 또는 의미 판정 충돌이 생길 때, 다른 런타임이 원문 산출물만 받아 blind review를 한 번 수행한다.
- 같은 결함이 재발하거나 method lock이 어긋나면 다음 생산을 중단하고 표준 프로필로 복귀한다.
- 동일 artifact path를 두 런타임이 동시에 쓰지 않는다. runtime 전환은 controller가 고정 입력 SHA와 새 소유자를 기록한 뒤에만 허용한다.

### std-b6 종료 감사에서 추가된 종결 점검

- 역할 산출물은 `self`가 아니라 실제 컨텍스트 ID를 기록하고, controller가 `modelRecord`와 일치 여부를 확인한다.
- 종결 원장은 최종 측정 검토, 측정 계약, 결함 원장, closure의 SHA-256까지 포함한다. `batch-manifest.json`은 자기참조 때문에 제외한다.
- 측정 reviewer는 합성 시계의 호출 단위와 최악 경로 호출 수를 확인한다. 호출 단위가 모호하거나 상한을 넘으면 실제 실행 전 정리 항목으로 남기고 실행 승인으로 승격하지 않는다.
- Codex 감사 결과는 생산 커밋에 결속해 남기며, 다음 배치는 이 보강 규칙을 포함한 방법 source commit을 새로 동결한 뒤에만 연다.

### 상세성 적합성 검토에서 추가된 실행 노출 점검

- Claude Code와 Codex의 독립 검토는 `노출면은 간결하게, 평가 하네스는 엄밀하게`에 합의했다.
- Claude Code production lane은 후보를 `agent-visible`, `evaluator-visible`, `harness-private` 세 표면으로 분리하고, 자연어 요청에 최종 상태·실패 분기·채점 식별자가 섞이지 않게 한다.
- 별도 blind rehearsal 컨텍스트는 `agent-visible`만 받아 공개 요청의 입력 충분성과 합리적인 수행·안전 인계 경로의 존재를 확인한다. 후보·fixture·oracle 파일은 허용 입력이 아니다. 도구를 실제로 실행하거나 모델의 성공률·성능을 추론하지 않는다.
- Codex control plane은 새 `v5` 배치에서 `agent-visible.jsonl`과 `blind-agent-rehearsal.jsonl`을 별도 산출물로 검사한다. `validate-exposure`는 공개 입력 누출, 원문 행 SHA, 독립 리허설 판정, 측정 후보 집합 일치와 `instruction-sufficiency` 의미 선언을 확인한다. minimum sufficient oracle과 실제 런타임의 하네스 경로 차단은 별도 의미·실행 검토로 남는다. 완료·진행 중인 `v3`·`v4` 배치에는 새 형식을 소급하지 않는다.
- 기존 27개 측정 설계는 폐기하지 않으며, 실제 실행에 투입하기 전에 전수 정적 누출 감사와 우선 후보의 blind-agent rehearsal을 수행한다.
- 첫 actual-execution pilot에서 특정 정답 문장과의 문자 단위 비교가 의미상 충분한 사용자 고지를 차단했다. 이후 도구 경계는 선행 상태·승인·제출 결속만 강제하고, 자연어 고지와 최종 응답의 요구 사실은 비공개 evaluator가 사후 판정한다. 최초 실패와 수리 후 재실행을 모두 보존한다.

## 7. 현재 인수인계

`std-b7`은 `standard-v1.3`으로 완료됐다. 후보 5건 중 3건은 측정 설계와 노출 검토를 통과했고, 2건은 blind rehearsal 의미가 단일 모델 실행 표본처럼 적용되는 교정 문제 때문에 보류됐다. 이 결과는 실제 실행 성능 실패가 아니다.

현재 생산 중인 `std-b8`은 이미 동결된 `standard-v1.3`·`v4` 계약을 그대로 마친다. 그 산출물이나 method lock을 중간에 바꾸지 않는다. `std-b8` 종료 뒤 여는 다음 빈 배치부터 `standard-v1.3.1`·`v5` 제어면 도구가 포함된 source commit을 동결하고, `new-batch → lock-method → validate-ready`를 통과하기 전까지 생산 역할을 시작하지 않는다. 완료·진행 중인 `v3`·`v4` 배치의 method lock은 그대로 보존한다.

이 인수인계는 신규 후보의 수락 수량을 예약하지 않는다. 0건 수락도 유효하며, 시장 검토·실제 실행·공개·정본 편입·push는 별도 사람 승인 대상이다.
