# kh-b13 measurement receipt

- origin: kiheon-ideation
- controllerStatus: DESIGNABLE (측정 설계 완결, 실제 시뮬레이터 실행은 아님)
- sourceJob: kh-b13-candidate-freeze, kh-b13-post-freeze, kh-b13-exposure
- measurementJob: kh-b13-measurement
- methodRevision: standard-v1.3.5 (measurement asset uses schema mica.measurement-asset/v3, additive on top of the job's v1.3.5 lock)
- candidateId: ki-b13-02
- assetId: ma-kh-b13-02 / oracleId: or-kh-b13-02 / reviewId: mr-kh-b13-02
- sourceFrozenRowSha256: db708a9c9b23c1d19a44af96d2019653dca8c7ece8c5c340fc39d095dec5ea87 (controller가 kh-b13-candidate-freeze/frozen-candidates.staging.jsonl 원본 행에서 여러 차례 독립 재계산해 매번 일치 확인, catalog-annotations.jsonl의 값과도 일치)
- measurementDecision: **designable** (`measurement-contracts.jsonl` 참조)

## 왜 이 job이 존재하는가

`ki-b13-02`(travel-accommodation-04 슬롯, verified tier, `core20-annotation-009`로 이미 포트폴리오에 반영됨)는 kh-b13의 candidate-freeze와 post-freeze(comparison)까지만 끝난 채 측정 자산이 없었다. 같은 세션에서 새로 구현한 `mica.measurement-asset/v3` preflight validator를 실제 신규 저작에 적용해 검증하는 것이 1차 목적이었고, 사용자가 "마무리까지 진행해보자"고 명시적으로 요청해 oracle review → measurement review → exposure prep → blind-agent rehearsal → controller 최종 결속까지 전체 공정을 완주했다.

## 산출물 5단계와 각 단계의 격리

| 단계 | 파일 | 컨텍스트 |
|---|---|---|
| 측정 자산 저작 | `measurement-assets.staging.jsonl` | 격리 Agent(frozen candidate + comparison만) |
| oracle review | `oracle-reviews.staging.jsonl` | 별도 격리 Agent(저작자와 다른 컨텍스트, frozen candidate + 측정 자산만) |
| measurement review | `measurement-review.staging.jsonl` | 별도 격리 Agent 2개(출력 토큰 한도로 15개 체크포인트를 A/B 분할, 저작자·oracle reviewer와 다른 컨텍스트, 세 산출물 전수 대조) |
| exposure prep | `../kh-b13-exposure/agent-visible.jsonl` | 별도 격리 Agent(frozen candidate만, 평가자 전용 필드 제외 명시) |
| blind-agent rehearsal | `../kh-b13-exposure/blind-agent-rehearsal.jsonl` | 완전 격리 Agent(agent-visible 행만, 후보 명세·oracle·fixture 등 일체 비공개) |
| controller 최종 결속 | `measurement-contracts.jsonl` | controller 직접 작성(새 판단 아님 -- 위 산출물들의 상호 참조·해시를 재계산·대조하는 종합) |

## 검증 (controller가 직접 재확인한 것, 산출물의 주장을 그대로 신뢰하지 않음)

- `scripts/mica-measurement-asset.py validate` PASS를 저작자 자가 실행 + controller 독립 재실행 2회 모두 확인.
- `sourceFrozenRowSha256`을 원본 frozen-candidates 행에서 직접 재계산해 일치 확인(자산 선언값·catalog-annotations 기록값과 3자 일치).
- `blind-agent-rehearsal.jsonl`이 주장한 `agentVisibleRowSha256`을 `agent-visible.jsonl` 원문에서 직접 재계산해 일치 확인.
- `agent-visible.jsonl` 전체 텍스트를 판정 어휘·9개 gateId·8개 fixture 오브젝트명·3개 sink ID·7개 atomic call unit·canary 토큰 등 40개 내부 식별자로 기계 스캔, 검출 0건 확인(공개 표면 무결 재확인).
- assetId/oracleId/reviewId/candidateId/batchId를 5개 산출물 파일 전체에서 교차 대조, 불일치 0건.
- `git status kh-b13-candidate-freeze/ kh-b13-post-freeze/` 무변화 확인 -- 상류 산출물은 읽기만 했다.
- 회귀 6종(`test-mica-portfolio.py` `test-mica-scenario-production.py` `test-mica-batch-control.py` `test-mica-cleanroom.py` `test-mica-isolated-agent-runner.py` `test-mica-measurement-asset.py`) 전부 그린 유지.

## 발견된 결함과 재정

oracle review 6건 + measurement review issue 재정 6건, 전부 non-blocking 또는 resolved-by-interpretation으로 종결했다(차단 0건). 가장 실질적인 관찰은 이 자산이 후보 `confirmationBoundary` 5개 중 취소 제출(submit_cancellation) 경로만 실제로 시험하고 환불요청·결제수단처리·개인정보전달·이의제기 4개는 대응 도구 자체가 없어 스코프 밖이라는 점이다 -- designable 판정을 막지는 않지만 실제 시뮬레이터 구축 전 선결 조건으로 `measurement-contracts.jsonl.notes`에 이월했다.

## 범위 밖 (하지 않은 것)

- 실제 시뮬레이터 실행, 시장·현지 검토, 공개 적합성 최종 승인은 하지 않는다. `designable`은 측정 설계 완결이며 실행 검증이 아니다.
- `ki-b13-02`의 포트폴리오 슬롯 상태(`travel-accommodation-04`, verified, occupied)는 이 job과 무관하게 이미 유효했고 이 job이 바꾸지 않는다.
- throughput 회복 가설(2026-08-14 분석 §4)의 완전한 반증은 이 1건이 아니라 앞으로 여러 배치 저작에서 계속 관찰해야 한다.
