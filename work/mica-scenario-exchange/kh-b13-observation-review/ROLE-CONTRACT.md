---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-observation-review
role: observationReviewer
accessProfile: job-packet-only
language: ko
---

# kh-b13 observation reviewer 계약

이 job은 `kh-b13`의 source evidence 5행과 need observation 4행만 사용해 관찰의 의미 경계를 독립 판정한다. source researcher, source reviewer, need writer와 다른 신규 컨텍스트에서 수행하며, 작성자의 대화, 자기평가, CLOSURE, 기존 MICA 과제, 후보, 포트폴리오, 비교 결과를 열지 않는다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `source-evidence.staging.jsonl`, `need-observations.staging.jsonl`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. source evidence와 observation을 직접 대조해 아래 5개 checks를 독립 판정한다.
3. 결과는 `observation-reviews.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
4. observation 4행과 정확히 1:1로, 원본 순서를 유지해 review 4행을 작성한다.
5. 작성 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub MICA 저장소와 기존 PR을 열지 않는다.
- source researcher, source reviewer, need writer 세션의 대화, 자기평가, 완료 보고, 판정 사유를 읽지 않는다.
- sourceUrl을 다시 조사하거나 외부 검색, 웹 탐색으로 입력을 보충하지 않는다.
- 기존 MICA 100개 과제, 기존 후보, 포트폴리오, comparison, annotation, holdout 산출물을 열지 않는다.
- Notion, Slack, Obsidian을 호출하지 않는다.
- observation 문구를 고치거나 대체 observation을 작성하지 않는다.
- 수량을 맞추기 위해 fail check를 pass로 바꾸지 않는다.
- reviewer가 solution, task candidate, success criteria, oracle을 새로 설계하지 않는다.

## observation review exact fields

각 행은 아래 순서의 10개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `schemaVersion`: 항상 `mica.observation-review/v1`
3. `batchId`: 항상 `kh-b13`
4. `reviewId`: `or-kh-b13-01`부터 순차 부여
5. `observationId`: 입력 observation ID
6. `verdict`: `accept` 또는 `reject`
7. `checks`: 아래 5개 key를 정확한 순서로 사용하고 값은 `pass` 또는 `fail`
8. `reasons`: 판정 근거를 담은 비어 있지 않은 문자열 배열
9. `nonBlockingNotes`: 판정을 바꾸지 않는 유의사항 배열, 없으면 빈 배열
10. `reviewerContextId`: 현재 신규 reviewer 세션의 실제 컨텍스트 ID

## checks exact order와 판정 기준

1. `evidenceAlignment`
   - sourceRefs가 허용 evidence를 가리키고 observation의 당사자, 수치, 기간, 범위, 현재 상태가 source evidence와 직접 맞아야 한다.
   - 서로 다른 evidence를 결합했다면 동일한 생활 필요와 상태 변화를 직접 지지해야 한다.
   - knownLimits와 populationAndScope가 약화되거나 서로 다른 대상과 시점이 하나의 사실처럼 합쳐지면 fail이다.
2. `needBoundary`
   - 해결책 이전에 존재하는 개인의 생활 부담과 미해결 상태를 관찰해야 한다.
   - 정책 목표, 사업자 운영 목표, 벤치마크 목표, 기능 요구나 과업 절차가 중심이면 fail이다.
   - burdenBearer가 MICA 생활과업의 개인 사용자 경계에서 벗어나는 경우 그 이유를 명시하고 fail 여부를 판정한다.
3. `nonPrescription`
   - 알림, 앱, 자동화, 에이전트 행동, 도구, 상담, 제출 순서, 특정 실행 수단을 지정하지 않아야 한다.
   - desiredStateChange가 수단이 아니라 관찰 가능한 전후 상태여야 한다.
4. `noInventedFacts`
   - source evidence에 없는 수치, 분모, 기간, 당사자, 인과, 의무, 성공률, 시장 일반화를 추가하지 않아야 한다.
   - 근거가 지지하지 않는 전제나 비교 기준을 desiredStateChange에 넣으면 fail이다.
5. `stateChangeClarity`
   - currentState와 desiredStateChange가 의미 있는 전후 상태로 구분되고 unresolvedConsequence가 미해결 부담과 연결돼야 한다.
   - `불편이 줄어든다`처럼 판정 불가능한 희망만 있거나 변화가 사실상 해결책이면 fail이다.

## verdict 규칙

- 다섯 checks가 모두 `pass`일 때만 `accept`다.
- 하나라도 `fail`이면 반드시 `reject`다.
- 각 행의 `reasons`에는 source evidence와 observation을 직접 대조한 판정 근거를 최소 1개 쓴다.
- `reject`는 유효한 결과다. 수락 수량 목표는 없다.
- U+2014 EM DASH 문자를 사용하지 않는다.
- 출력은 한 줄에 JSON 객체 하나만 쓰며 Markdown 설명을 섞지 않는다.

## 종료 규칙

- 정상 완료는 review 4행을 모두 쓴 상태다.
- 금지 입력을 한 번이라도 읽으면 review 산출물을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 observation 4행을 모두 판정할 수 없으면 추정하지 말고 `BLOCKED`로 종결한다.
- 정상 작성 완료 상태는 `COMPLETED`다.
- `CLOSURE.json` 작성 뒤 observation freeze, candidate, comparison, annotation, measurement 단계를 자동 시작하지 않는다.
