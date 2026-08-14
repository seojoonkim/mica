---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b13-source-research
role: sourceResearcher
accessProfile: job-packet-only
language: ko
---

# kh-b13 source researcher 계약

이 job은 신규 clean-room 생산의 첫 단계인 근거 조사만 수행한다. 기존 MICA 과제, 기존 후보, 포트폴리오 원장, 카테고리별 기존 소재, 비교 결과를 열거나 추론하지 않는다.

## 허용 범위

1. 이 디렉터리 안의 `READY.json`, `INPUT-MANIFEST.json`, `SLOT-BRIEF.json`, 이 계약만 읽는다.
2. `SLOT-BRIEF.json`에 지정된 한국 시장 생활 영역에서 공개된 권위 있는 1차 자료를 조사한다.
3. 정부·공공기관·규제기관·공식 사업 규정처럼 원문 발행 주체와 범위를 확인할 수 있는 자료를 우선한다.
4. 원문 페이지와 직접 첨부 문서만 사용한다. 검색 결과 요약은 원문을 대신할 수 없다.
5. 결과는 `source-evidence.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
6. 작업이 끝나면 `CLOSURE.json`을 작성하고 정지한다. 관찰, 후보, 비교, 측정 단계로 넘어가지 않는다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub의 MICA 저장소와 기존 PR을 열지 않는다.
- 기존 MICA 100개 과제, 기존 후보 56건, 포트폴리오 원장, 정원 외 후보를 열지 않는다.
- Slack, Notion, Obsidian을 호출하지 않는다.
- 해결책, 에이전트 행동, 제품 기능, 성공 기준, 측정 oracle을 작성하지 않는다.
- 근거에 없는 수치, 기간, 비용, 시장 일반화, 당사자, 제약을 만들지 않는다.
- 수량을 맞추기 위해 약한 자료나 인접 분야 자료를 끌어오지 않는다.

## source evidence exact fields

각 행은 아래 순서의 15개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `schemaVersion`: 항상 `mica.source-evidence/v2`
3. `batchId`: 항상 `kh-b13`
4. `researchCategoryId`: `SLOT-BRIEF.json`에 있는 세 categoryId 중 해당 근거를 조사한 영역
5. `evidenceId`: `ev-kh-b13-01`부터 순차 부여
6. `evidenceType`: 직접 원문이면 `direct-primary`
7. `sourceTitle`
8. `publisher`
9. `sourceUrl`
10. `retrievedAt`: 작성 시점의 실제 UTC ISO-8601
11. `sourceLocation`: 제목, 절, 표, 문단 등 재확인 가능한 위치
12. `boundedObservation`: 원문이 직접 지지하는 현재 부담 또는 미해결 상태
13. `populationAndScope`: 원문이 실제로 다루는 대상과 범위
14. `knownLimits`: 자료가 말하지 않는 범위와 일반화 한계
15. `researcherContextId`: 현재 신규 세션의 실제 컨텍스트 ID

`boundedObservation`은 원문의 뜻을 좁게 보존한다. 해결책이나 과업 표현으로 바꾸지 않는다. 동일 URL을 여러 행에 재사용하지 않는다.
각 categoryId의 행수는 `requestedEvidenceRows`를 넘을 수 없다. 직접 근거가 부족한 카테고리는 더 적은 행 또는 0행으로 남긴다.

## 종료 규칙

- 최대 5행이다. 0행도 유효하다.
- `CLOSURE.json`에는 실제로 읽은 입력 SHA, 금지 입력 접근 수, Slack·Notion 호출 수, 출력 SHA와 바이트 수, 실제 UTC 종료 시각을 기록한다.
- 금지 입력을 한 번이라도 읽으면 산출물을 살리지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르면 작성하지 않고 `BLOCKED`로 종결한다.
- 정상 완료 상태는 `COMPLETED`, 근거가 없어 0행이면 `ZERO-EVIDENCE`다.
