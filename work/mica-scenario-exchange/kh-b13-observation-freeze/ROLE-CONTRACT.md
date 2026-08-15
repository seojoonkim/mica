---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-observation-freeze
role: observationCustodian
accessProfile: job-packet-only
language: ko
---

# kh-b13 observation custodian 계약

이 job은 `kh-b13`의 need observation 4행과 observation review 4행만 사용해 수락된 관찰을 accepted-only로 동결한다. custodian은 researcher, source reviewer, need writer, observation reviewer와 다른 신규 컨텍스트여야 한다. 의미를 다시 판정하거나 문구를 고치지 않고 수락 행의 값과 raw-row SHA만 보존한다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `need-observations.staging.jsonl`, `observation-reviews.staging.jsonl`, `observation-review-closure.json`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. observation과 review가 4행씩 1:1로 대응하고 같은 순서를 유지하는지 확인한다.
3. `READY.json.observationReviewReceipt.closureSha256`이 소문자 64자리인지 확인하고, `observation-review-closure.json`의 실제 SHA-256 및 `READY.json.observationReviewClosure.sha256`과 정확히 일치하는지 대조한다.
4. review의 다섯 checks가 모두 `pass`이고 verdict가 `accept`인 observation만 선택한다.
5. 선택된 원본 observation의 12개 필드와 값을 원래 순서대로 복사하고, 아래 세 필드만 뒤에 붙인다.
6. 결과는 `frozen-observations.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
7. 작성 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub MICA 저장소와 기존 PR을 열지 않는다.
- 앞선 역할의 대화, 자기평가, 완료 보고를 읽지 않는다.
- source evidence, source URL, 기존 MICA 과제, 기존 후보, 포트폴리오, comparison, annotation, holdout을 열지 않는다.
- Notion, Slack, Obsidian을 호출하지 않는다.
- review의 verdict나 checks를 다시 판단하거나 바꾸지 않는다.
- observation 문구, 배열 순서, 수치, 공백을 의미상 수정하거나 대체 observation을 작성하지 않는다.
- reject observation을 frozen output에 포함하지 않는다.
- solution, task candidate, success criteria, oracle을 설계하지 않는다.

## frozen observation exact fields

각 행은 아래 순서의 15개 필드를 정확히 사용한다.

1. `origin`: 원본 observation 값을 그대로 복사
2. `observationId`: 원본 값을 그대로 복사
3. `sourceRefs`: 원본 배열과 순서를 그대로 복사
4. `burdenBearer`: 원본 값을 그대로 복사
5. `affectedParty`: 원본 값을 그대로 복사
6. `contextOrTrigger`: 원본 값을 그대로 복사
7. `currentState`: 원본 값을 그대로 복사
8. `desiredStateChange`: 원본 값을 그대로 복사
9. `unresolvedConsequence`: 원본 값을 그대로 복사
10. `evidenceStatus`: 원본 값을 그대로 복사
11. `marketScope`: 원본 값을 그대로 복사
12. `authorContextId`: 원본 값을 그대로 복사
13. `frozenRowSha256`: `need-observations.staging.jsonl`에서 줄바꿈을 제외한 정확한 원본 JSON 한 줄의 SHA-256
14. `reviewRowSha256`: 같은 observationId를 가진 `observation-reviews.staging.jsonl` 원본 JSON 한 줄에서 줄바꿈을 제외한 SHA-256
15. `frozenBy`: 현재 신규 custodian 세션의 실제 context ID

## accepted-only 규칙

- review가 `accept`이면서 다섯 checks가 모두 `pass`인 행만 동결한다.
- review가 `reject`이거나 check 하나라도 `fail`이면 제외한다.
- 수량 목표는 없으며 입력 review에서 기계적으로 도출된 수만 쓴다.
- frozen output 순서는 원본 observation 순서를 유지한다.
- `frozenRowSha256`와 `reviewRowSha256`은 SHA-256 소문자 64자리여야 한다.
- 원본 12개 필드를 JSON으로 다시 읽었을 때 값과 배열 순서가 완전히 같아야 한다.
- U+2014 EM DASH 문자를 새로 사용하지 않는다.
- 출력은 한 줄에 JSON 객체 하나만 쓰며 Markdown 설명을 섞지 않는다.

## 종료 규칙

- 정상 완료는 accepted-only frozen output과 CLOSURE를 모두 작성한 상태다.
- 금지 입력을 한 번이라도 읽으면 output을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 observation과 review의 1:1 대응이 깨졌으면 추정하지 말고 `BLOCKED`로 종결한다.
- `observationReviewReceipt.closureSha256`이 소문자 64자리 형식이 아니면 `BLOCKED`로 종결한다.
- `observation-review-closure.json`의 실제 SHA-256이 `READY.json.observationReviewClosure.sha256` 또는 `observationReviewReceipt.closureSha256`과 다르면 `BLOCKED`로 종결한다.
- `COMPLETED`로 종결할 때는 `CLOSURE.json.reviewClosureReceiptVerified`를 `true`로 기록하고, `inputsRead`에 `observation-review-closure.json`의 실제 SHA-256을 남긴다.
- 정상 완료 상태는 `COMPLETED`다.
- `CLOSURE.json` 작성 뒤 task candidate, comparison, annotation, measurement 단계를 자동 시작하지 않는다.
