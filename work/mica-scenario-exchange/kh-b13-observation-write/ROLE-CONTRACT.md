---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-observation-write
role: needWriter
accessProfile: job-packet-only
language: ko
---

# kh-b13 need writer 계약

이 job은 독립 source review에서 수락된 `kh-b13` source evidence만 사용해 해결책 없는 생활 필요 관찰을 작성한다. source researcher·source reviewer와 다른 신규 컨텍스트에서 수행하며, 기존 MICA 과제·후보·포트폴리오·비교 결과·카테고리 slot 현황을 열지 않는다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `source-evidence.staging.jsonl`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. `source-evidence.staging.jsonl`의 수락 근거 5행만 사실 입력으로 사용한다.
3. 결과는 `need-observations.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
4. 최대 5행을 작성하며 0행도 유효하다. 수량을 맞추기 위해 근거를 늘리거나 약한 관찰을 만들지 않는다.
5. 작성 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub의 MICA 저장소와 기존 PR을 열지 않는다.
- source researcher·source reviewer 세션의 대화, 자기평가, 완료 보고, review 판정 사유를 읽지 않는다.
- sourceUrl을 다시 조사하거나 외부 검색·웹 탐색으로 입력을 보충하지 않는다.
- 기존 MICA 100개 과제, 기존 후보, 포트폴리오, comparison, annotation, holdout 산출물을 열지 않는다.
- Notion, Slack, Obsidian을 호출하지 않는다.
- 해결책, 에이전트 행동, 도구, 기능, 과업 절차, 성공 기준, 측정 oracle을 작성하지 않는다.
- 원문에 없는 수치·분모·기간·당사자·사업자·시장 일반화를 만들지 않는다.
- 근거가 서로 다른 생활 필요를 수량 확보를 위해 하나로 결합하지 않는다.

## need observation exact fields

각 행은 아래 순서의 12개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `observationId`: `ob-kh-b13-01`부터 순차 부여
3. `sourceRefs`: 이 package의 evidence ID로만 구성한 비어 있지 않은 배열
4. `burdenBearer`: 현재 부담을 직접 지는 개인. 근거에 없는 사람을 추가하지 않는다.
5. `affectedParty`: 같은 상태 변화의 영향을 받는 당사자. 별도 당사자가 근거에 없으면 그 사실을 명시한다.
6. `contextOrTrigger`: 현재 부담이 드러나는 맥락이나 촉발 사건
7. `currentState`: 근거가 직접 지지하는 현재 상태
8. `desiredStateChange`: 특정 수단을 처방하지 않은 관찰 가능한 상태 변화
9. `unresolvedConsequence`: 상태 변화가 일어나지 않을 때 남는 결과
10. `evidenceStatus`: sourceRefs의 근거 유형·시점·한계가 드러나는 요약
11. `marketScope`: 자료의 대상·기간·지역·분모 범위를 넘지 않는 한정
12. `authorContextId`: 현재 신규 세션의 실제 컨텍스트 ID

## 작성 규칙

- `sourceRefs`의 허용값은 `ev-kh-b13-01`부터 `ev-kh-b13-05`까지다.
- 같은 evidence ID를 여러 observation 행에서 반복 사용하지 않는다.
- 여러 evidence를 한 행에서 함께 쓰려면 동일한 생활 필요와 상태 변화를 직접 지지해야 한다. 단지 카테고리가 같다는 이유로 결합하지 않는다.
- `currentState`와 `desiredStateChange`는 전후 상태로 읽혀야 한다. `불편이 줄어든다`처럼 판정할 수 없는 희망만 쓰지 않는다.
- `desiredStateChange`에는 알림, 앱, 자동 처리, 대행, 상담, 제출 순서 같은 해결 수단을 지정하지 않는다.
- `evidenceStatus`와 `marketScope`는 source evidence의 `knownLimits`와 `populationAndScope`를 약화하지 않는다.
- source evidence에 실사업자명이 있더라도 observation에서는 개인의 필요를 설명하는 데 불필요한 사업자명을 일반화한다. 정부·공공기관명은 출처 식별에 필요한 범위에서만 `evidenceStatus`에 쓸 수 있다.
- U+2014 EM DASH 문자를 사용하지 않는다.
- 출력은 한 줄에 JSON 객체 하나만 쓰며 Markdown 설명을 섞지 않는다.

## 종료 규칙

- 정상 완료는 0행부터 5행까지다. 0행이면 상태를 `ZERO-OBSERVATION`으로 기록한다.
- 금지 입력을 한 번이라도 읽으면 observation 산출물을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 허용 근거만으로 관찰을 작성할 수 없으면 추정하지 말고 `BLOCKED` 또는 `ZERO-OBSERVATION`으로 종결한다.
- 정상 작성 완료 상태는 `COMPLETED`다.
- `CLOSURE.json` 작성 뒤 observation review·동결·후보·비교·annotation·측정 단계를 자동 시작하지 않는다.
