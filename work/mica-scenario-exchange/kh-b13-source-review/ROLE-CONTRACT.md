---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-source-review
role: sourceReviewer
accessProfile: job-packet-only
language: ko
---

# kh-b13 source reviewer 계약

이 job은 `kh-b13` source evidence 5행의 원문 정합성만 독립 검토한다. source researcher와 다른 신규 컨텍스트에서 수행하며, 기존 MICA 과제·후보·포트폴리오·비교 결과를 열지 않는다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `source-evidence.staging.jsonl`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. 각 source row의 `sourceUrl`과 해당 공식 페이지의 직접 첨부 문서를 열어 원문을 대조한다.
3. 검색은 공식 원문 위치를 다시 찾는 용도로만 사용하며, 검색 결과 요약을 판정 근거로 사용하지 않는다.
4. 결과는 `source-reviews.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
5. 5행을 모두 판정한 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub의 MICA 저장소와 기존 PR을 열지 않는다.
- source researcher 세션의 대화, 자기평가, 완료 보고를 판정 근거로 사용하지 않는다.
- 기존 MICA 100개 과제, 기존 후보, 포트폴리오, comparison, annotation, holdout 산출물을 열지 않는다.
- Slack, Notion, Obsidian을 호출하지 않는다.
- 원문에 없는 수치·분모·기간·당사자·시장 일반화를 보충하거나 고쳐 쓰지 않는다.
- 관찰, 후보, 해결책, 에이전트 행동, 성공 기준, 측정 oracle을 작성하지 않는다.

## source review exact fields

각 행은 source evidence와 같은 순서로 1:1 대응하며 아래 순서의 10개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `schemaVersion`: 항상 `mica.source-review/v1`
3. `batchId`: 항상 `kh-b13`
4. `reviewId`: `sr-kh-b13-01`부터 순차 부여
5. `evidenceId`: 대응 source row의 ID
6. `verdict`: `accept` 또는 `reject`
7. `checks`: 아래 일곱 키를 정확한 순서로 사용하고 값은 `pass` 또는 `fail`
8. `reasons`: 판정 근거 문자열의 배열. 원문 위치, 수치, 분모, 범위가 재확인 가능해야 한다.
9. `nonBlockingNotes`: 판정을 바꾸지 않는 주의사항 문자열의 배열
10. `reviewerContextId`: 현재 신규 세션의 실제 컨텍스트 ID

`checks`의 정확한 키 순서는 다음과 같다.

1. `publisher`: 발행 주체와 URL이 공식 원문인가
2. `scope`: 대상·기간·지역·분모가 source row의 서술 범위와 일치하는가
3. `verbatim`: 수치·날짜·비율·상태 표현이 원문과 일치하는가
4. `directSupport`: `boundedObservation`의 각 주장이 지정 원문에서 직접 지지되는가
5. `typeAccuracy`: `direct-primary` 분류가 실제 자료 유형과 맞는가
6. `recency`: 자료 시점이 정확히 표시되고, 오래된 자료라면 현재 사실로 오인되지 않도록 한계가 보존됐는가
7. `limitationsHonesty`: 일반화 한계, 누락 범위, 분모·기간 차이가 정직하게 기록됐는가

일곱 check가 모두 `pass`일 때만 `accept`다. 하나라도 `fail`이면 `reject`다. 원문이나 직접 첨부를 재확인할 수 없으면 추정으로 통과시키지 않는다.

## 종료 규칙

- 정상 완료는 source evidence 5행 전부에 대한 review 5행이다.
- 금지 입력을 한 번이라도 읽으면 review 산출물을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 공식 원문 접근 자체가 불가능해 job 전체 판정을 완료할 수 없으면 `BLOCKED`로 종결한다.
- 정상 판정 완료 상태는 `COMPLETED`다. reject 행이 있어도 5행 전부 판정했다면 `COMPLETED`다.
- `CLOSURE.json` 작성 뒤 관찰·후보·비교·annotation·측정 단계를 자동 시작하지 않는다.
