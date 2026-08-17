---
origin: kiheon-ideation
label: 신기헌 아이데이션
jobId: kh-b14-source-review
role: sourceReviewer
accessProfile: job-packet-only
language: ko
---

# kh-b14 source reviewer 계약

이 job은 `kh-b14` source evidence 3행을 독립 검토한다. source researcher와 다른 신규 컨텍스트에서 수행하며, 기존 MICA 과제·후보·포트폴리오·비교 결과를 열지 않는다.

`standard-v1.3.6`에서 검사 키가 7개에서 **8개**로 늘었다. 8번째 `lifeNeedSupport`는 원문 정합성이 아니라 **근거 적격성**을 묻는다. 2절에 판정 기준이 있다.

## 허용 범위

1. 이 디렉터리의 `READY.json`, `INPUT-MANIFEST.json`, `source-evidence.staging.jsonl`, 이 계약, `CLOSURE.template.json`만 읽는다.
2. 각 source row의 `sourceUrl`과 해당 공식 페이지의 직접 첨부 문서를 열어 원문을 대조한다.
3. 검색은 공식 원문 위치를 다시 찾는 용도로만 사용하며, 검색 결과 요약을 판정 근거로 사용하지 않는다.
4. 결과는 `source-reviews.staging.jsonl` 한 파일에 UTF-8 JSONL로 작성한다.
5. 3행을 모두 판정한 뒤 `CLOSURE.json`을 작성하고 정지한다.

## 금지 범위

- 이 디렉터리 밖의 로컬 파일과 상위 디렉터리를 열지 않는다.
- 저장소를 clone하거나 GitHub의 MICA 저장소와 기존 PR을 열지 않는다.
- source researcher 세션의 대화, 자기평가, 완료 보고를 판정 근거로 사용하지 않는다.
- 기존 MICA 100개 과제, 기존 후보, 포트폴리오, comparison, annotation, holdout 산출물을 열지 않는다.
- Slack, Notion, Obsidian을 호출하지 않는다.
- 원문에 없는 수치·분모·기간·당사자·시장 일반화를 보충하거나 고쳐 쓰지 않는다.
- 관찰, 후보, 해결책, 에이전트 행동, 성공 기준, 측정 oracle을 작성하지 않는다.
- **수락 수량 목표를 두지 않는다.** 3행 전부 `reject`도 유효한 결과다.
- **`sourceChannel` 값을 판정 가중치로 쓰지 않는다.** 어느 채널이 더 신뢰할 만하다고 전제하지 않는다. 네 채널에 같은 기준을 적용한다.

## source review exact fields

각 행은 source evidence와 같은 순서로 1:1 대응하며 아래 순서의 10개 필드를 정확히 사용한다.

1. `origin`: 항상 `kiheon-ideation`
2. `schemaVersion`: 항상 `mica.source-review/v2`
3. `batchId`: 항상 `kh-b14`
4. `reviewId`: `sr-kh-b14-01`부터 순차 부여
5. `evidenceId`: 대응 source row의 ID
6. `verdict`: `accept` 또는 `reject`
7. `checks`: 아래 **여덟 키**를 정확한 순서로 사용하고 값은 `pass` 또는 `fail`
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
8. `lifeNeedSupport`: 그 원문이 **개인의 생활 필요를 지지하는가** (2절)

여덟 check가 모두 `pass`일 때만 `accept`다. 하나라도 `fail`이면 `reject`다. 원문이나 직접 첨부를 재확인할 수 없으면 추정으로 통과시키지 않는다.

## 2. `lifeNeedSupport` 판정 기준

### 2.1 `directSupport`와 다른 질문이다

혼동하기 쉬우므로 명시한다.

| 키 | 묻는 것 |
|---|---|
| `directSupport` | `boundedObservation`의 각 주장이 **지정 원문에서 직접 지지되는가** (원문 정합성) |
| `lifeNeedSupport` | 그 원문이 **개인의 생활 필요를 지지하는가** (근거 적격성) |

원문을 정확히 인용해도 그 원문이 제도 조문이거나 집단 통계이면 개인 생활과업으로 번역할 수 없다. 앞의 키는 통과하고 뒤에서 죽는다. **두 키를 같은 이유로 판정하지 않는다.**

### 2.2 세 항목을 모두 만족해야 `pass`다

1. 원문에 개인이 **자기 이름의 계약·신청·거래·이용 건에서 지는 잔존 부담**의 서술 또는 개별 사례 서사가 최소 하나 실재하는가
2. 부담의 귀속처가 **사업자 영업 손익·기관 집행 성과·정책 목표가 아닌가**
3. 그 개별 국면에서 개인이 외부 상태를 바꾸려고 접근할 **공식 상대방·창구·절차가 원문 안에서 식별되는가**. 원문이 제시하는 변화가 법령 개정·제도 확대·사업자 약관 변경뿐이면 `fail`

### 2.3 `fail` 유형

과거 배치의 실제 거절 문구다. 새로 만들 필요가 없다.

- **제도 도입 사실만**: boundedObservation 전체가 의무 신설이라는 제도 도입 사실과 그 의무 내용·시한 기술로만 구성되어, 개인의 현재 부담이나 미해결 결과를 직접 보여주지 않음
- **규범 조문 재현만**: 배상 기준 규범 조문(대상 요건·산식·기산 기준·제외 사유)의 재현으로만 구성되어, 개인의 현재 부담이나 미해결 결과를 전혀 보여주지 않음
- **제도 변경 설명만**: 약관 개정에 따른 기준 강화라는 제도 변경 설명과 일반적 배경 문구로만 구성
- **법리 설명 + 서사 한 문장**: 개인 서사는 한 문장뿐. 계약 시점·금액·경과·요구와 그 결과가 없어 개인의 현재 부담과 미해결 결과를 특정할 수 없음
- **집계 통계 + 제언**: 집계 통계와 제도개선 제언·소비자 당부로만 구성되고 개별 소비자의 사례 서사가 전혀 없음

### 2.4 `pass` 유형

- 제도 설명에 그치지 않고 개인의 미해결 결과가 직접 제시됨: 이용자가 9개월~1년간 실제로 요금할인을 받지 못한 상태가 서술됨
- 39개월 계약 사용 중 세 차례 고장과 매회 열흘 이상 수리로 정상 사용이 어려웠고, 위약금 없는 해지 또는 수리기간 렌탈료 감면을 요구

### 2.5 경계 사례에 대한 지침

**조건표는 그 자체로 통과도 탈락도 아니다.** 약관의 위약금표나 수수료 기준표는 개인이 실제로 지는 부담의 크기를 정하는 원문일 수 있고(2.2의 1번 충족), 단순한 규범 재현일 수도 있다. 그 문서가 **개인이 밟을 절차와 그 결과로 개인에게 남는 부담**을 함께 보여주는지로 가른다.

`reasons`에 어느 항목이 왜 충족되었는지 또는 왜 실패했는지 **세 항목별로** 쓴다. 통과든 탈락이든 마찬가지다.

## 종료 규칙

- 정상 완료는 source evidence 3행 전부에 대한 review 3행이다.
- 금지 입력을 한 번이라도 읽으면 review 산출물을 적용하지 않고 `INPUT-BOUNDARY-BREACH`로 종결한다.
- 입력 SHA가 다르거나 공식 원문 접근 자체가 불가능해 job 전체 판정을 완료할 수 없으면 `BLOCKED`로 종결한다.
- 정상 판정 완료 상태는 `COMPLETED`다. reject 행이 있어도 3행 전부 판정했다면 `COMPLETED`다.
- `CLOSURE.json` 작성 뒤 관찰·후보·비교·annotation·측정 단계를 자동 시작하지 않는다.
