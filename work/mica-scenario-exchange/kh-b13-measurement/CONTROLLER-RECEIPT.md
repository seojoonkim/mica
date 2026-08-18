# kh-b13 measurement receipt

- origin: kiheon-ideation
- controllerStatus: ACCEPTED-DESIGNABLE-PENDING-REVIEW
- sourceJob: kh-b13-candidate-freeze, kh-b13-post-freeze
- measurementJob: kh-b13-measurement
- methodRevision: standard-v1.3.5 (measurement asset uses schema mica.measurement-asset/v3, additive on top of the job's v1.3.5 lock)
- authorContextId: claude-agent-c04f7e76-13b9-43a7-b465-bb0ef5fe809b-kh-b13-02
- candidateId: ki-b13-02
- assetId: ma-kh-b13-02
- sourceFrozenRowSha256: db708a9c9b23c1d19a44af96d2019653dca8c7ece8c5c340fc39d095dec5ea87 (재계산해 kh-b13-candidate-freeze/frozen-candidates.staging.jsonl의 ki-b13-02 행과 일치 확인, catalog-annotations.jsonl의 sourceFrozenRowSha256과도 일치)
- validator: `python3 scripts/mica-measurement-asset.py validate` -- PASS(저작자 자가 실행 + controller 독립 재실행 2회 모두 PASS)

## 왜 이 job이 존재하는가

`ki-b13-02`(travel-accommodation-04 슬롯, verified tier, `core20-annotation-009`로 이미 포트폴리오에 반영됨)는 kh-b13의 candidate-freeze와 post-freeze(comparison)까지만 끝난 채 측정 자산이 없었다. 같은 세션에서 새로 구현한 `mica.measurement-asset/v3` preflight validator(`work/method-reviews/2026-08-18-measurement-asset-preflight-validator.md`)를 실제 신규 저작에 적용해 검증하는 것이 목적이며, `2026-08-18-std-b11-abandoned-superseded-lane.md`가 확인한 대로 이제 유효한 메커니즘은 이 job-packet clean-room exchange뿐이라 여기 이어 붙였다.

## 저작 범위

frozen candidate(`ki-b13-02`)와 comparison(`post-freeze/comparison.jsonl`)만 입력으로 격리 컨텍스트에 전달했다. fixture 8개 오브젝트, 5개 variant(정상 성공 1·실패 2·복구 2), attemptEligibility 9개 gate, prohibitedStateChecks 6개(후보의 prohibitedStates 6개와 1:1 대응), verdictTaxonomy 3클래스 3규칙을 저작했다. v3 신규 필드 4종(`syntheticClock.worstPathProof.perVariantCalls`/`simultaneityGate.perVariant[].worstPathCalls` 일치, `sinks.*`의 `sinkId`+`reachCondition`만, `gates`+`expectedVerdicts[].justifiedBy`, `approvalModel.anchorUnconditionalOnMissingValue`+`variants[].missingConfirmedValues`+`terminalRequiresApproval`)를 모두 채웠다.

## 검증

- 저작자가 스스로 `scripts/mica-measurement-asset.py validate`를 돌려 PASS를 받은 뒤 제출했다.
- controller(이 receipt 작성자)가 동일 JSON을 별도로 파일에 써서 독립적으로 재실행해 PASS를 재확인했다(저작자의 PASS 주장을 그대로 신뢰하지 않음).
- `git status work/mica-scenario-exchange/kh-b13-candidate-freeze/ work/mica-scenario-exchange/kh-b13-post-freeze/` 무변화 확인 -- 상류 frozen candidate·comparison은 읽기만 했다.

## 범위 밖 (하지 않은 것)

- oracle reviewer, measurement reviewer, exposure preparer, blind-agent rehearsal은 이번 job에 포함하지 않았다. 이 자산은 `designable-pending-exposure`에도 못 미치는 **측정 설계 1단계 저작 완료(구조 검증 PASS)** 상태다.
- `ki-b13-02`의 포트폴리오 슬롯 상태(`travel-accommodation-04`, verified, occupied)는 이 job과 무관하게 이미 유효하며 이 job이 바꾸지 않는다.
- 시장·현지 검토, 실제 실행, 공개 적합성 승인은 하지 않는다.

## 다음에 필요하면

oracle reviewer(별도 컨텍스트)가 이 자산을 입력으로 실채점 oracle을 작성하고, measurement reviewer가 fixture·reset·eligibility·oracle·frozen candidate를 전수 대조해야 `designable-pending-exposure`로 올라간다. 그 뒤 exposure prep + blind-agent rehearsal을 통과해야 `designable`이 확정된다.
