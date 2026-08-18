---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-candidate-freeze
role: candidateCustodian
accessProfile: job-packet-only
language: ko
---

# kh-b13 candidate custodian 계약

이 job은 `kh-b13`의 task candidate 1행과 candidate review 1행만 사용해 수락 후보를 accepted-only로 동결한다. custodian은 앞선 모든 역할과 다른 신규 컨텍스트여야 한다. 의미를 다시 판정하거나 후보를 고치지 않고 수락 행의 값과 raw-row SHA만 보존한다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `task-candidates.staging.jsonl`, `candidate-reviews.staging.jsonl`, `candidate-review-closure.json`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. candidate와 review가 1행씩 1:1로 대응하고 candidate ID가 같은지 확인한다.
3. `candidate-review-closure.json`의 실제 SHA-256이 READY의 `candidateReviewClosure.sha256`과 `candidateReviewReceipt.closureSha256`에 정확히 일치하는지 확인한다.
4. candidate review output의 실제 SHA-256이 READY의 `candidateReviewPacket.sha256`, `candidateReviewClosure.outputSha256`, `candidateReviewReceipt.outputSha256`에 모두 일치하는지 확인한다.
5. review의 열 checks가 모두 `pass`이고 verdict가 `accept`인 candidate만 선택한다.
6. 선택된 원본 candidate 객체를 값과 필드 순서 그대로 `candidate`에 복사하고 아래 exact fields를 사용한다.
7. 결과는 `frozen-candidates.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
8. 작성 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub MICA 저장소와 PR을 열지 않는다.
- 앞선 역할의 대화, 자기평가와 완료 보고를 읽지 않는다.
- source evidence, observation, source URL, 기존 MICA 과제, 기존 후보, portfolio, comparison, annotation과 holdout을 열지 않는다.
- Notion, Slack, Obsidian과 진행 웹을 호출하지 않는다.
- review의 verdict나 checks를 다시 판단하거나 바꾸지 않는다.
- candidate 문구, 배열 순서, 수치와 값을 수정하거나 대체 후보를 작성하지 않는다.
- reject 또는 hold 후보를 frozen output에 포함하지 않는다.
- category, slot, termination, complexity, surface, measurement와 oracle을 설계하지 않는다.

## frozen candidate exact fields

각 행은 아래 순서의 10개 필드를 정확히 사용한다.

1. `origin`: `kiheon-ideation`
2. `schemaVersion`: `mica.frozen-task-candidate/v1`
3. `batchId`: 원본 candidate의 `batchId`
4. `candidateId`: 원본 candidate의 `candidateId`
5. `candidate`: 원본 candidate 객체 전체를 값과 필드 순서 그대로 복사
6. `candidateRowSha256`: `task-candidates.staging.jsonl`에서 줄바꿈을 제외한 정확한 원본 JSON 한 줄의 SHA-256
7. `reviewRowSha256`: 같은 candidate ID를 가진 `candidate-reviews.staging.jsonl` 원본 JSON 한 줄에서 줄바꿈을 제외한 SHA-256
8. `taskReceiptSha256`: `candidate-review-closure.json` 파일 전체의 SHA-256
9. `custodianContextId`: 현재 신규 custodian 세션의 실제 context ID
10. `frozenAt`: 현재 세션에서 직접 측정한 ISO 8601 UTC 시각

## accepted-only 규칙

- review가 `accept`이면서 열 checks가 모두 `pass`인 행만 동결한다.
- review가 `reject`, `hold`이거나 check 하나라도 `fail` 또는 `hold`이면 제외한다.
- 수량 목표는 없으며 입력 review에서 기계적으로 도출된 수만 쓴다.
- frozen output 순서는 원본 candidate 순서를 유지한다.
- `candidateRowSha256`, `reviewRowSha256`, `taskReceiptSha256`은 SHA-256 소문자 64자리여야 한다.
- nested `candidate`를 JSON으로 다시 읽었을 때 원본 후보의 값과 배열 순서가 완전히 같아야 한다.
- U+2014 EM DASH 문자를 새로 사용하지 않는다.
- 출력은 한 줄에 JSON 객체 하나만 쓰며 Markdown 설명을 섞지 않는다.

## 종료 규칙

- 정상 완료는 accepted-only frozen output과 CLOSURE를 모두 작성한 상태다.
- 금지 입력을 한 번이라도 읽으면 output을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 candidate와 review의 1:1 대응이 깨졌으면 추정하지 말고 `BLOCKED`로 종결한다.
- candidate review closure 또는 output의 실제 SHA가 READY의 세 결속 위치 중 하나라도 다르면 `BLOCKED`로 종결한다.
- `COMPLETED`로 종결할 때는 `candidateReviewReceiptVerified`를 `true`로 기록하고 `inputsRead`에 실제 입력 SHA를 남긴다.
- `CLOSURE.json` 작성 뒤 comparison, annotation, measurement 단계를 자동 시작하지 않는다.
