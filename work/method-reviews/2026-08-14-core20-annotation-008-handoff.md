---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: ready-handoff
scope: catalog-annotation
language: ko
jobId: core20-annotation-008
preparedBy: Codex
preparedAt: 2026-08-14
---

# core20-annotation-008 인수인계

## 목적

현재 동결 후보 56건 중 catalog annotation이 아직 적용되지 않은 9건을 한 번에 검토한다. 이 job이 정상 종결되고 수락 행이 원장에 적용되면 기존 재고의 annotation 단계는 끝난다.

## 실행 위치

- job: `work/mica-scenario-exchange/core20-annotation-008/`
- 시작 파일: `READY.json`
- 허용 입력: `READY.json`, `INPUT-MANIFEST.json`, `packet.jsonl`
- 작성 출력: `author-output.staging.jsonl`
- 독립 검토 출력: `review-output.staging.jsonl`
- 종결 출력: `CLOSURE.json`

## 대상 9건

1. `KI-P15-014`
2. `KI-P15-015`
3. `KI-L4-001`
4. `CAT0708-TASK-005`
5. `ki-lb1-01`
6. `ki-b5-01`
7. `ki-b6-05`
8. `ki-b7-01`
9. `ki-b7-02`

`ki-b7-01`, `ki-b7-02`는 렌털 과업이다. controller가 두 후보를 `categoryProvisional` 사용 가능 대상으로 승인했다. 두 후보가 `telecom-subscriptions`를 선택하면 `categoryProvisional: true`와 지정된 rationale이 필수다. 실제 카테고리 판정은 작성자와 별도 검토자가 packet 근거로 수행하며 자동 배정하지 않는다.

## 역할 경계

1. 새 `catalogAnnotator` 컨텍스트가 허용 입력만 순서대로 읽고 최대 9행을 작성한다.
2. 작성자와 다른 `catalogAnnotationReviewer` 컨텍스트가 각 행을 독립 검토한다.
3. 작성자와 검토자는 공식 과제 목록, 포트폴리오 점유 원장, 과거 검토 결과, Notion, Slack을 읽지 않는다.
4. 검토 전에는 `CLOSURE.json`을 만들지 않는다.
5. 수락 수량을 맞추지 않는다. 근거 부족은 hold, 잘못된 결속은 reject로 남긴다.
6. commit, push, Notion, Slack 반영은 controller가 맡는다.

## 사전 수리

종결·적용된 과거 재검토 packet을 활성 선점으로 잘못 세어 새 job 준비를 막던 controller 결함을 수정했다. 적용 receipt가 있는 job은 기록으로 보존하되 활성 후보 선점 집합에서는 제외한다. 회귀 테스트를 추가했다.

## job 007 확인 답변

Claude가 작성한 `categoryProvisional: false` 2행은 커밋 `63455a2`에 실패 시도로 보존돼 있다. controller가 승인된 렌털 후보의 재배치 추적성을 필수화한 뒤 새 author 컨텍스트가 두 행을 다시 작성했고 독립 검토를 거쳐 적용했다. 현재 원장 값은 두 행 모두 `categoryProvisional: true`다.

## 현재 외부 상태

- `vooy-mica` 진행판은 포트폴리오 47건 상태로 production 반영 완료다.
- `seojoonkim/mica` 작업 브랜치는 아직 원격보다 앞선 로컬 커밋을 포함한다.
- 이 READY 준비 자체는 push하지 않는다. 원격 공유는 기헌 승인 뒤 controller가 수행한다.
