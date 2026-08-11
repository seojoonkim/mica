---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: prepared-locked
batch_id: cat04-lean-001
production_profile: lean
human_profile_label: 간소화 탐색형
language: ko
canonical: false
internal_only: true
---

# 카테고리 04 간소화 탐색형 배치 — 독립 자료 조사 인계

## 현재 상태

- 배치: `cat04-lean-001`
- 연구 영역: 외식·예약 생활 영역
- 상한: 독립 1차 자료 최대 3건
- 현재 산출물: 빈 배치와 입력 경계만 준비됨
- 시작 조건: 이 준비 컨텍스트와 분리된 새 source researcher 컨텍스트
- 종료 조건: `source-evidence.jsonl` 저장 후 별도 source reviewer에게 인계

수량을 맞추지 않는다. 직접 지지되는 생활 필요가 없으면 0건으로 종료할 수 있다.

## source researcher 허용 입력

1. 이 문서
2. `docs/kiheon-ideation-pilot-15/agent-production-contract.md`의 bounded source evidence 필드 계약
3. 연구 중 직접 확인한 권위 있는 1차 자료

다음 정보는 열거나 입력으로 사용하지 않는다.

- 기존 MICA 과제와 웹 과제 목록
- `docs/kiheon-ideation-pilot-15/candidate-specs.json`
- 과거 후보, 거절·보류 기록, comparison 결과
- 포트폴리오 진행판, 카테고리별 완료 수, 빈 슬롯, gap·quota 힌트
- 다른 진행 중 배치의 자료와 산출물

## 조사 계약

- 발행 주체가 책임지는 원문에서 현재 부담과 미해결 결과를 직접 확인한다.
- 해결책, 에이전트 행동, 과업 문안, 시장 일반화, 사업자명, 점유율, 창작 수치·기간·비용을 쓰지 않는다.
- 공식 자료가 특정 시장에만 적용되면 그 범위를 그대로 제한하고 다른 시장으로 일반화하지 않는다.
- 동일 문제를 반복하는 자료보다 서로 다른 생활 필요를 우선하되, 수량 때문에 약한 근거를 포함하지 않는다.
- source reviewer 판정을 미리 쓰거나 자기심사하지 않는다.

## 출력

`source-evidence.jsonl`에 JSON 객체를 한 줄에 하나씩 기록한다. 각 행은 최소한 다음 필드를 포함한다.

- `origin` — 항상 `kiheon-ideation`
- `evidenceId`
- `sourceTitle`
- `publisher`
- `sourceUrl`
- `retrievedAt`
- `sourceLocation`
- `boundedObservation`
- `populationAndScope`
- `knownLimits`
- `reviewerContextId`

source researcher 단계의 `reviewerContextId`는 비워 두거나 `pending-independent-review`로 표시하고, 독립 source reviewer가 원문을 검증한 뒤 별도 `source-reviews.jsonl`에 판정을 남긴다. 원문 행을 사후 수정해 수락시키지 않는다.

## 다음 인계

source researcher와 다른 컨텍스트의 source reviewer에게 다음만 전달한다.

1. `source-evidence.jsonl`
2. 각 행이 인용한 1차 자료의 정확한 위치
3. `docs/kiheon-ideation-pilot-15/agent-production-contract.md`

source reviewer가 수락한 행만 need writer 입력으로 승격한다. 준비 컨텍스트, source researcher, source reviewer는 서로 다른 역할 기록으로 남긴다.
