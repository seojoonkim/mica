---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b14-source-research
role: sourceResearcher
accessProfile: job-packet-only
language: ko
---

# kh-b14 source researcher 계약

이 job은 신규 clean-room 생산의 첫 단계인 근거 조사만 수행한다. 기존 MICA 과제, 기존 후보, 포트폴리오 원장, 카테고리별 기존 소재, 비교 결과를 열거나 추론하지 않는다.

## 허용 범위

1. 이 디렉터리 안의 `READY.json`, `INPUT-MANIFEST.json`, `SLOT-BRIEF.json`, 이 계약만 읽는다.
2. `SLOT-BRIEF.json`에 지정된 한국 시장 생활 영역에서 공개된 권위 있는 1차 자료를 조사한다.
3. 발행 주체와 범위를 확인할 수 있는 1차 자료면 **아래 네 계열이 모두 동등하게 허용된다.** 어느 하나를 우선하지 않는다.
   1. 정부·공공기관·규제기관의 조사 보고서, 실태조사, 공식 안내
   2. 분쟁조정·피해구제 기관의 사례집과 결정문
   3. 민간 사업자의 공식 약관·환불규정·취소수수료표·이용조건·도움말
   4. 법령·고시 원문
4. 원문 페이지와 직접 첨부 문서만 사용한다. 검색 결과 요약은 원문을 대신할 수 없다.
5. 결과는 `source-evidence.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
6. 작업이 끝나면 `CLOSURE.json`을 작성하고 정지한다. 관찰, 후보, 비교, 측정 단계로 넘어가지 않는다.

### 3-3 민간 사업자 문서의 경계

발행 주체가 그 사업자 자신이고 그 문서가 개인과 사업자 사이의 **계약 조건을 실제로 규정**하면 1차 자료다. 취소수수료표는 개인이 실제로 부담할 금액을 정하는 원문이다.

홍보 문구, 상품 소개, 가격 마케팅, 보도자료는 1차 자료가 **아니다.**

사업자명은 `boundedObservation`에 원문 그대로 보존한다. 익명화는 이 단계가 아니라 후보 단계에서 한다.

### 3-4 법령·고시의 한계

조문을 재현하기만 한 근거는 다음 단계의 `lifeNeedSupport` 검사를 통과하지 못한다. 조문과 함께 개인의 잔존 부담 또는 개별 사례가 원문에 있을 때만 사용한다.

## 작성 전 자가 점검

각 자료에 네 질문을 적용한다. **하나라도 `아니오`면 그 자료로 근거 행을 쓰지 않는다.** 이 때문에 요청 행수를 못 채워도 된다.

1. 부담을 지는 주체가 **개인 소비자**인가. 사업자 영업 손익이나 기관 집행 성과가 아닌가
2. 원문에 개인이 **자기 이름의 계약·신청·거래·이용 건**에서 지는 잔존 부담 또는 개별 사례 서사가 실재하는가
3. 개인이 외부 상태를 바꾸려고 접근할 **공식 상대방·창구·절차가 원문 안에** 있는가. 원문이 제시하는 변화가 법령 개정이나 약관 변경뿐이면 `아니오`다
4. 현재 상태와 바뀌어야 할 상태를 **근거에서 직접** 읽을 수 있는가

이는 후보 답을 미리 쓰는 검사가 아니다. 명백히 개인 생활과업으로 이어지지 않는 근거를 조기에 제외하는 적합성 검사다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub의 MICA 저장소와 기존 PR을 열지 않는다.
- 기존 MICA 100개 과제, 기존 후보, 포트폴리오 원장, 정원 외 후보를 열지 않는다.
- Slack, Notion, Obsidian을 호출하지 않는다.
- 해결책, 에이전트 행동, 제품 기능, 성공 기준, 측정 oracle을 작성하지 않는다.
- 근거에 없는 수치, 기간, 비용, 시장 일반화, 당사자, 제약을 만들지 않는다.
- 수량을 맞추기 위해 약한 자료나 인접 분야 자료를 끌어오지 않는다.

## source evidence exact fields

각 행은 아래 순서의 16개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `schemaVersion`: 항상 `mica.source-evidence/v3`
3. `batchId`: 항상 `kh-b14`
4. `researchCategoryId`: `SLOT-BRIEF.json`에 있는 두 categoryId 중 해당 근거를 조사한 영역
5. `evidenceId`: `ev-kh-b14-01`부터 순차 부여
6. `evidenceType`: 직접 원문이면 `direct-primary`
7. `sourceChannel`: `public-agency`, `dispute-resolution`, `private-operator`, `statute` 중 하나
8. `sourceTitle`
9. `publisher`
10. `sourceUrl`
11. `retrievedAt`: 작성 시점의 실제 UTC ISO-8601
12. `sourceLocation`: 제목, 절, 표, 문단 등 재확인 가능한 위치
13. `boundedObservation`: 원문이 직접 지지하는 현재 부담 또는 미해결 상태
14. `populationAndScope`: 원문이 실제로 다루는 대상과 범위
15. `knownLimits`: 자료가 말하지 않는 범위와 일반화 한계
16. `researcherContextId`: 현재 신규 세션의 실제 컨텍스트 ID

`sourceChannel`은 `standard-v1.3.6`에서 신설했다. 채널별 통과율을 측정하기 위한 것이며 어느 채널을 우선하라는 뜻이 아니다.

`boundedObservation`은 원문의 뜻을 좁게 보존한다. 해결책이나 과업 표현으로 바꾸지 않는다. 동일 URL을 여러 행에 재사용하지 않는다.
각 categoryId의 행수는 `requestedEvidenceRows`를 넘을 수 없다. 직접 근거가 부족한 카테고리는 더 적은 행 또는 0행으로 남긴다.

## 종료 규칙

- 최대 4행이다. 0행도 유효하다.
- `CLOSURE.json`에는 실제로 읽은 입력 SHA, 금지 입력 접근 수, Slack·Notion 호출 수, 출력 SHA와 바이트 수, 실제 UTC 종료 시각을 기록한다.
- 금지 입력을 한 번이라도 읽으면 산출물을 살리지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르면 작성하지 않고 `BLOCKED`로 종결한다.
- 정상 완료 상태는 `COMPLETED`, 근거가 없어 0행이면 `ZERO-EVIDENCE`다.
