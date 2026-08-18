---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: implemented
scope: kh-b13-measurement, std-b13-abandonment
language: ko
asOf: 2026-08-18
preparedBy: Claude Code 주 컨트롤러 (Sonnet 5)
relatedDocs:
  - work/method-reviews/2026-08-18-measurement-asset-preflight-validator.md
  - work/method-reviews/2026-08-18-std-b11-abandoned-superseded-lane.md
  - work/mica-scenario-exchange/kh-b13-measurement/CONTROLLER-RECEIPT.md
---

# `mica.measurement-asset/v3` 검증기의 첫 실전 저작 적용, 그 과정에서 발견한 std-b13 오착수

## 0. 한 줄 요약

사용자가 "새 측정 배치 하나 실제로 저작해서 검증기 돌려봐"를 요청했다. 처음에는 이미 폐기된 `mica-scenario-production.py` in-repo lane(`std-b13`)으로 착수했으나, source review 단계에서 `role-briefing`이 `standard-v1.3.4`를 요구한다는 것을 우연히 발견하면서 이 lane 자체가 오늘 이른 시간 이미 공식적으로 폐기됐음(`2026-08-18-std-b11-abandoned-superseded-lane.md`)을 뒤늦게 확인했다. `std-b13`을 정직하게 park하고, 유효한 메커니즘(job-packet clean-room exchange)에 이미 candidate-freeze까지 끝나 있던 `kh-b13`의 미측정 후보 `ki-b13-02`에 `mica.measurement-asset/v3` 자산을 새로 저작해 검증기로 통과시켰다.

## 1. 무엇이 잘못됐고 어떻게 바로잡았는가

사용자 요청을 받고 별도 확인 없이 `python3 scripts/mica-scenario-production.py new-batch --profile lean --batch-id std-b13`으로 착수했다. source researcher·reviewer 두 역할을 실행해 evidence 1건 accept·1건 reject까지 진행한 뒤, `mica-batch-control.py assign-role`이 처음 보는 role 키 이름으로 실패해 `batch-manifest.json`의 `roles` 구조를 열어보다가 `work/mica-scenario-exchange/`와 `.clean-room-jobs/` 아래 이미 `kh-b13`(candidate-freeze·post-freeze까지 완료)과 `kh-b14`(source 단계 zero-accepted로 종결)가 존재하는 것을 발견했다. `git log`로 오늘자 커밋 `100681f`(std-b11 폐기)을 찾아 `2026-08-18-std-b11-abandoned-superseded-lane.md`를 읽고서야 `mica-scenario-production.py`의 in-repo lane 자체가 `methodRevision: standard-v1.3.3`에 갇힌 채 이미 `kh-b13` 이후 job-packet clean-room exchange로 완전히 대체됐다는 것을 확인했다.

`std-b13`은 std-b11과 똑같은 방식으로 정직하게 처리했다 -- `mica-batch-control.py park`로 lease를 닫고, `batch-manifest.json`이나 `closure.json`의 status를 조작하지 않았다(source-evidence.jsonl 2건·source-reviews.jsonl 2건만 실제로 생산됐으므로 그 상태 그대로 둔다). 이 사고 자체가 재발 방지용 신호다: `mica-scenario-production` 스킬 문서(`SKILL.md`)가 아직 이 폐기를 반영하지 않아, 스킬을 그대로 따르면 다시 같은 오착수가 일어난다. 스킬 갱신은 이번 작업 범위 밖이라 손대지 않았다.

## 2. `kh-b13`으로 전환, `ki-b13-02` 발견

`work/mica-scenario-portfolio/portfolio-100.json`에서 `kh-b13`을 grep해 `ki-b13-02`가 이미 `travel-accommodation-04` 슬롯(verified tier, occupied, `attemptHistory` 빈 배열)에 `core20-annotation-009`로 반영돼 있음을 확인했다. `catalog-annotations.jsonl`의 `sourceFrozenRowSha256`을 `kh-b13-candidate-freeze/frozen-candidates.staging.jsonl`의 실제 행에서 직접 재계산해 일치를 검증했다(`db708a9c...5ea87`). `kh-b13-post-freeze/comparison.jsonl`까지 있어 comparator 단계도 끝나 있었다 -- 남은 것은 측정 설계뿐이었다. 이미 포트폴리오에 반영된 verified 후보이므로 이번 저작이 낭비되지 않고, `std-b13`을 처음부터 다시 만드는 것보다 정확하다.

## 3. 저작 실행

격리 컨텍스트(Agent tool, 저장소 다른 파일 접근·탐색 금지 명시)에 `ki-b13-02`의 frozen candidate와 comparison 결과, `role-prompts.md` §10 원문, `mica.measurement-asset/v3` 스키마 전체(신규 v3 필드 4종 포함), 실제 designable 자산(`std-b10/ma-b10-01`)에서 추출한 필드-shape 스켈레톤(내용 없이 구조만)을 전달했다. 저작자는 fixture 8개 오브젝트, variant 5개(정상 성공 1·실패 2·복구 2, 후보의 prohibitedStates 6개·failureRecoveryEvents 5개에 결속), gate 9개, `scripts/mica-measurement-asset.py validate`를 스스로 실행해 PASS를 받은 뒤 제출했다.

controller가 동일 JSON을 별도 파일로 재저장해 독립적으로 다시 검증했다 -- 저작자의 PASS 주장을 그대로 신뢰하지 않고 재실행했다. 최종 위치(`work/mica-scenario-exchange/kh-b13-measurement/measurement-assets.staging.jsonl`)에서도 PASS를 재확인했다.

```
{"assetId": "ma-kh-b13-02", "schemaVersion": "mica.measurement-asset/v3", "status": "pass"}
```

## 4. 저장 위치와 형식 결정

`work/mica-scenario-batches/kh-b13/`을 새로 만들지 않았다 -- 그 경로는 이미 한 번 시도됐다가 되돌려진 전례가 있다(`14408cd revert: remove kh-b13 batch materialization, wrong fix`, "site-visibility gap는 데이터 복사가 아니라 build-site-data.py 스캔 로직에서 고쳐야 한다"). 대신 기존 명명 규칙(`kh-b13-<stage>`)을 그대로 따라 `work/mica-scenario-exchange/kh-b13-measurement/`를 새로 만들었다.

이 job에는 `READY.json`/`INPUT-MANIFEST.json`/`PACKAGE-SHA256.txt` 전체 packet 의례를 재현하지 않았다 -- `mica-cleanroom.py verify`를 기존 `kh-b13-post-freeze`(controller가 직접 comparator를 실행하고 `CONTROLLER-RECEIPT.md`만 남긴, worker job-packet이 아닌 stage)에 실행해 그것도 동일하게 `ready-missing`으로 실패함을 확인했다 -- 즉 이 packet 의례는 완전히 격리된 worker에게 넘기는 stage(source-research 등)에만 쓰이고, controller가 직접 종합하는 stage(post-freeze, 그리고 이번 measurement)는 `CONTROLLER-RECEIPT.md`만 남기는 것이 기존 관례임을 전례로 확인한 뒤 같은 패턴을 따랐다.

## 5. 검증

- `python3 scripts/mica-measurement-asset.py validate` -- 저작자 자가 실행 PASS + controller 독립 재실행 PASS(스크래치 경로, 최종 경로 각 1회).
- 기존 회귀 6종 전부 그린: `test-mica-portfolio.py`(30) `test-mica-scenario-production.py`(5) `test-mica-batch-control.py`(5) `test-mica-cleanroom.py`(16) `test-mica-isolated-agent-runner.py`(6) `test-mica-measurement-asset.py`(26).
- `git status`로 `kh-b13-candidate-freeze/`·`kh-b13-post-freeze/`·portfolio 3파일 무변화 확인 -- 상류 산출물과 슬롯 상태는 읽기만 했다.
- `mica-cleanroom.py verify work/mica-scenario-exchange/kh-b13-measurement`가 기존 `kh-b13-post-freeze`와 동일하게 `ready-missing`으로 실패함을 확인해, 이것이 이 job 유형의 정상 상태(packet 의례 대상이 아님)임을 전례 대조로 검증했다.

## 6. 범위 밖 (2026-08-18 시점, 하지 않은 것)

- oracle reviewer, measurement reviewer, exposure preparer, blind-agent rehearsal은 포함하지 않았다. 사용자가 승인한 범위는 "1건 저작 + 검증기 실행"까지였다. 자산은 `designable-pending-exposure`에도 못 미치는 측정 설계 1단계(구조 검증 PASS) 상태로 남았다. **2026-08-19에 이어서 완결했다 -- §8 참조.**
- `mica-scenario-production` 스킬 문서의 std-b* lane 폐기 반영, `.claude/skills/`·`.agents/skills/`의 std-b* 언급 정리는 하지 않았다 -- 이번 세션의 요청 범위 밖이며 별도 판단이 필요하다.
- `ki-b13-02`의 포트폴리오 슬롯 상태는 이 job으로 바뀌지 않는다(이미 verified·occupied였고 그대로다).

## 7. 다음 (2026-08-18 시점)

- 처리량 가설 반증(2026-08-14 throughput-analysis §4)의 완전한 검증은 이 1건이 아니라 앞으로의 여러 배치 저작에서 계속 관찰해야 한다. 이번 1건은 "검증기가 실제 신규 저작 워크플로에 끼워 넣어져 정상 작동한다"는 것만 보여준다.
- oracle review·measurement review로 이어가려면 별도 세션에서 격리 컨텍스트로 진행한다.
- `mica-scenario-production` 스킬의 std-b* 안내를 clean-room exchange 중심으로 갱신할지는 사용자·Codex 판단이 필요하다.

## 8. 완결 (2026-08-19 추가): oracle review → measurement review → exposure → rehearsal → controller 결속

사용자가 "ki-b13-02 마무리부터 시작해줘. 마무리까지 진행해보자"고 명시적으로 요청해 §6이 남겨둔 4단계를 전부 이어갔다. 전 단계 격리 원칙(저작자·oracle reviewer·measurement reviewer·exposure preparer·blind-agent rehearsal 전부 서로 다른 컨텍스트, 후행 역할은 선행 역할의 대화 과정을 모르고 산출물 텍스트만 받음)을 그대로 유지했다.

- **oracle review**(`or-kh-b13-02`, `mica.oracle-review/v2`): 격리 Agent가 frozen candidate + 측정 자산만으로 5개 variant 전부 `binaryDecidability.decidable=true`를 판정하고, `commonConditions` 4개·`perVariant passConditions` 31개·`prohibitedConductOracle`을 작성했다. issues 6건을 정직하게 남겼다(전부 자기 판정은 non-blocking) -- 그중 IS-KB1302-02는 **내가 작성한 프롬프트 자체의 결함**이었다: 저작 지침 원문에 std-b10 전례의 "EXP-MISSING" 표현을 그대로 옮겨 썼는데, 이 자산의 `expLabelRegistry`에는 그 라벨이 없다. oracle reviewer가 이를 그대로 베끼지 않고 자산이 실제로 정의한 `EXP-STRICT-BEFORE-NOT-APPLICABLE`로 대체한 것이 격리 검토의 실효성을 보여주는 사례다.
- **measurement review**(`mr-kh-b13-02`, `mica.measurement-review/v2`): std-b10 전례의 15개 체크포인트 전부를 1회 시도했다가 답변이 장황해 **출력 토큰 64,000 한도를 초과해 실패**했다. 체크 1~8과 9~15+issue 재정을 각각 독립 컨텍스트로 분할하고 "basis는 2~4문장으로 간결하게"를 명시해 재시도, 양쪽 다 성공했다(15/15 pass, oracle review의 issue 6건을 재정해 전부 non-blocking/resolved-by-interpretation으로 확정, 새로운 blocking 사유 0건).
- **exposure prep**(`agent-visible.jsonl`, `mica.agent-visible/v1`): 격리 Agent가 frozen candidate만으로 userRequest(verbatim)·userKnownConstraints 4개·commonSafetyPolicy 5개·allowedTools 4개를 분리했다. `confirmationBoundary`·`prohibitedStates`·`failureRecoveryEvents`·`canonicalFinalState`는 평가자 전용으로 명시 배제했다.
- **blind-agent rehearsal**(`blind-agent-rehearsal.jsonl`, `mica.blind-agent-rehearsal/v2`): 완전 격리 Agent(agent-visible 행만, 후보 명세·측정 자산·oracle 일체 비공개)가 `verdict=pass`(5개 조건 전부 요구 방향대로 성립)를 판정했다.
- **controller 최종 결속**(`measurement-contracts.jsonl`): 위 산출물들의 상호 참조·해시를 controller가 직접 재계산·대조해 종합했다(새 판단이 아니라 이미 나온 독립 판단들의 검증된 결합) -- `sourceFrozenRowSha256`·`agentVisibleRowSha256` 재계산 일치, 5개 산출물 파일의 assetId/oracleId/reviewId/candidateId/batchId 교차 대조, `agent-visible.jsonl` 전체를 40개 내부 식별자 토큰으로 기계 스캔(검출 0건)까지 직접 수행한 뒤 `measurementDecision: "designable"`로 종결했다.

저장 위치는 `../kh-b13-exposure/`(새 stage 디렉터리, `agent-visible.jsonl`+`blind-agent-rehearsal.jsonl`)와 기존 `kh-b13-measurement/`(oracle-review·measurement-review·measurement-contracts 추가)로 나눴다. 두 곳 모두 `CONTROLLER-RECEIPT.md`를 갱신·신설했다. 회귀 6종 재실행, `git status`로 상류 산출물 무변화 재확인했다.

### 남은 것 (2026-08-19 시점)

- `designable`은 측정 설계 완결이지 실행 검증이 아니다. 실제 시뮬레이터 구축은 이번 범위 밖이다.
- measurement review가 남긴 정리 항목 7건 중 가장 실질적인 것: 이 자산이 후보 `confirmationBoundary` 5개 중 취소 제출(submit_cancellation) 경로만 실제로 시험하고 나머지 4개(환불요청·결제수단처리·개인정보전달·이의제기)는 대응 도구 자체가 없다. designable 판정을 막지는 않았으나 시뮬레이터 구축 전 선결 조건이다.
- §6·§7의 나머지 항목(스킬 문서 std-b* 폐기 반영, throughput 가설의 다중 배치 반증)은 여전히 미착수다.
