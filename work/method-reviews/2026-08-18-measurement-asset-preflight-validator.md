---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: implemented
scope: measurement-asset-schema-v3
language: ko
asOf: 2026-08-18
preparedBy: Claude Code 주 컨트롤러 (Sonnet 5)
relatedDocs:
  - work/method-reviews/2026-08-14-measurement-throughput-analysis.md
  - work/method-reviews/2026-08-14-std-b12-closure-handoff.md
  - work/mica-scenario-batches/std-b12/defect-ledger.jsonl
---

# 측정 자산 저작 중 검증기 구현 (df-b12-01~04)

## 0. 한 줄 요약

`00-C` 운영 원장의 재개 조건("df-b12-01~04 정합 결함 — 저작 중 preflight validator 구현과 대표 2~3건 반증 실행")을 해소했다. `scripts/mica-measurement-asset.py`가 `mica.measurement-asset/v3` 스키마의 4개 정합 규칙을 결정론적으로 검사하고, 실제 `std-b12` 자산에서 확인된 4건 전부를 재현해 정확히 잡아낸다는 것을 테스트로 증명했다.

## 1. 왜 스키마 확장이 필요했는가

`work/mica-scenario-batches/std-b12/measurement-assets.staging.jsonl`(2건, 자산당 51KB)을 직접 읽어 확인한 것: `simultaneityGate.perVariant[].proof`, `syntheticClock.worstPathProof.tickMath`, `sinks.*.verdictBinding`, `approvalModel.*`처럼 검사에 필요한 값 대부분이 **자연어 산문 안에만 존재**하고 별도 구조화 필드가 없었다. `df-b12-02`(수치 두 곳 불일치)의 두 숫자조차 각각 다른 산문 문장 안에 묻혀 있어, 기존 스키마 그대로는 어떤 결정론적 검증기도 만들 수 없었다.

`mica.measurement-asset/v2 → v3`으로 additive 확장했다(레포의 기존 관례: `mica.catalog-annotation/v3→v4`처럼 새 필드는 새 스키마 버전에만 필수이고 구 파일은 재작성하지 않는다). 산문 필드는 사람이 읽는 근거로 그대로 남기고, 그 옆에 기계가 대조할 구조화 필드를 추가했다(단 `sinks.*.verdictBinding`은 예외 — 그 필드 자체가 결함의 원인이라 제거했다).

## 2. 범위 결정

4개 규칙(`df-b12-01`~`04`) 전부를 v1로 구현했다. `df-b12-02`·`03`·`04`는 구조화 필드 몇 개만 추가하면 완전히 결정론적으로 검사되지만, `df-b12-01`(terminal 도달 가능성)은 진짜 도달가능성 추론이 필요해 범위가 다르다는 것을 사용자와 상의해 확인했고, **좁은 구조적 대리 검사**로 범위를 정했다: 완전한 그래프 도달가능성 엔진이 아니라, `std-b12`에서 실제로 걸린 정확한 패턴(승인이 무조건 조항으로 막히는데 + 이 variant는 확정값이 결측인데 + terminal이 그 승인을 요구하는 조합)만 재현한다.

throughput-analysis §3.1이 언급한 나머지 2개(게이트↔locked path 1:1, EXP registry 폐포·결측 공식 단일성)는 이번 범위에서 뺐다 — 체크 함수를 독립 함수로 분리해 뒀으니 추가는 쉽다. §3.4("measurement-designed를 slot 점유 선행조건에서 뺄지")는 방법 방향 결정이라 건드리지 않았다. `std-b12` 자체는 재제출·재판정하지 않는다 — `closed`로 남고, 이 검증기는 **앞으로의 저작**에만 적용한다.

## 3. 스키마 v3 필드

| 규칙 | 신규 필드 | 검사 |
|---|---|---|
| df-b12-02 | `simultaneityGate.perVariant[].worstPathCalls`, `syntheticClock.worstPathProof.perVariantCalls` | variant별 두 값 동일성 |
| df-b12-03 | 없음(`sinks.<key>`를 `{sinkId, reachCondition}`으로 고정, `verdictBinding` 제거) | 키 집합 정확히 일치 |
| df-b12-04 | `gates: [{gateId, failClosed}]`, `expectedVerdicts[].justifiedBy` | `EXP-COUNT-0` + 규칙 1 결속 행은 `justifiedBy`가 실제 `prohibitedStateChecks` 인덱스 또는 `failClosed:true` 게이트를 참조해야 함 |
| df-b12-01 | `approvalModel.anchorUnconditionalOnMissingValue`, `variants[].missingConfirmedValues`, `variants[].terminalRequiresApproval` | 세 조건 동시 성립 시 저작자 확인 요구(FAIL) |

## 4. 반증 실행 (00-C 재개 조건)

`scripts/test-mica-measurement-asset.py`의 `Std12ReproductionTest`가 `std-b12`의 실제 원본(`ma-b12-01`, `ma-b12-02`)을 읽어 v3 신규 필드만 산문에서 확인한 실측값으로 채운 인메모리 사본을 만들고(원본 staging 파일은 건드리지 않음), 4건 전부 검증기가 정확히 FAIL로 재현하는 것을 확인했다.

- **df-b12-02**: `ma-b12-01`의 실제 5개 variant 수치 — `worstPathProof`측 `{v-01-a:15, v-01-b:17, v-01-c:14, v-01-d:24, v-01-e:20}` vs `simultaneityGate`측 `{v-01-a:19, v-01-b:15, v-01-c:21, v-01-d:24, v-01-e:22}`. `defect-ledger.jsonl`이 기록한 불일치 4건(v-01-d만 일치)과 정확히 같다. 검증기가 `v-01-a`에서 fail-fast로 잡는다.
- **df-b12-01**: `ma-b12-02`의 `v-02-c`(금액 미특정, `g-02-external-appeal-submit`이 `APPROVAL-R` 요구) — anchorObject 무조건 조항 + 결측값 + 승인 요구 terminal 조합을 정확히 잡는다.
- **df-b12-03**: `ma-b12-02`의 `sinks.unresolved`·`sinks.handoff`가 실제로 둘 다 `verdictBinding`을 갖고 있음을 확인(원 defect 보고는 `handoff`만 인용했지만 `unresolved`도 같은 패턴이었다 — 이번에 처음 확인). 키 집합 위반으로 잡는다.
- **df-b12-04**: `ma-b12-02`의 `v-02-e`(선결제 정지, 근거 없는 규칙 1 결속)를 FAIL로 잡으면서, 구조적으로 비슷한 `v-02-b`(게이트가 실제로 fail-closed 차단하는 정당한 경우)는 `justifiedBy`를 채우면 PASS로 남는 것까지 확인 — 과잉 차단이 아니라는 증거다.

## 5. 검증

- `python3 scripts/test-mica-measurement-asset.py` — 26/26 PASS(합성 fixture 18건 + 반증 실행 4건 + 기저·CLI 4건).
- 기존 회귀 5종(`test-mica-portfolio.py` 30건, `test-mica-scenario-production.py` 5건, `test-mica-batch-control.py` 5건, `test-mica-cleanroom.py` 16건, `test-mica-isolated-agent-runner.py`) 전부 그린 유지.
- `git status work/mica-scenario-batches/std-b12/` 무변화 확인 — 원본은 읽기만 했다.

## 6. 다음

- 다음 측정 배치부터 `mica.measurement-asset/v3`로 저작하고 제출 전 `scripts/mica-measurement-asset.py validate <path>`를 돌린다.
- throughput-analysis §4의 반증 방법(검증기 도입 후 variant 5를 유지한 채 새 배치를 돌려 처리량이 회복되는지 확인)은 다음 실제 측정 생산 세션의 대상이다 — 이번 작업은 도구를 만들고 알려진 결함 재현까지만 증명했다.
- 게이트↔locked path 1:1, EXP registry 폐포 검사는 필요해지면 `scripts/mica-measurement-asset.py`에 체크 함수를 추가하면 된다(기존 4개와 같은 구조).
