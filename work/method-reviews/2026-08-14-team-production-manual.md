---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: claude-proposal
scope: multi-author-production-manual
language: ko
baseCommit: f63d656d4bbaa903b2e392891d2f1fb4dc298bad
adoptionNote: Codex가 채택하면 docs/kiheon-ideation-pilot-15/ 로 승격한다
---

# MICA 다중 저작자 생산 매뉴얼

시나리오 발굴을 여러 사람이 함께 하기 위한 운영 규약이다. 우선순위는 **결과물 무결성 > 팀 협업 > 통합 편의**이며, 아래 모든 규칙은 그 순서로 정렬돼 있다.

이 매뉴얼은 제안이다. Codex가 채택하면 `docs/kiheon-ideation-pilot-15/`로 승격하고, 그 전까지는 검토 문서다.

---

## 0. 한 줄 원칙

> **저작자는 저장소를 클론하지 않는다. job 디렉터리 하나만 받는다.**

이 방법론의 핵심 주장은 "공식 MICA 카탈로그를 발상 seed로 쓰지 않았다"이다. 지금은 그것이 규율로만 지켜진다. 팀원이 저장소를 훑는 순간 그 주장은 그 사람 기여분에 대해 소급 무효가 되고, **오염되지 않았음을 증명할 방법이 없다.** 위 한 줄이 clean-room을 약속에서 물리적 사실로 바꾼다.

---

## 1. 역할

| 역할 | 하는 일 | 보는 것 | 겸직 |
|---|---|---|---|
| **저작자** author | 근거 조사, 관찰 작성, 과업 번역, annotation 작성 | job 디렉터리만 | 같은 job의 검토자 겸직 불가 |
| **검토자** reviewer | 의미 관문 독립 판정 | job 디렉터리 + 저작자 산출물 | 같은 job의 저작자 겸직 불가 |
| **controller** | job 발급, 기계 검증, 원장 적용, 슬롯 관리 | 전부 | 자기 저작물 의미 심사 불가 |
| **통합자** | 배치 단위 PR 제출 | 전부 | — |
| **머지 승인자** | main 병합 | 전부 | — |

현재 배정: controller = Codex, 통합자 = 기헌, 머지 승인자 = 서준. 저작자·검토자는 사람 또는 런타임.

**의미 관문의 검토자는 저작자와 다른 사람이어야 한다.** 한 사람이 에이전트 컨텍스트 두 개를 돌리는 것보다 독립성이 실제로 높다. 팀 확대가 무결성에 기여하는 유일한 지점이므로 여기를 살린다.

---

## 2. 노출면과 저장 경계

라벨 3종을 저장소 3종으로 승격한다. 라벨은 접근을 막지 못한다.

| 노출면 | 무엇 | 어디 | 접근 |
|---|---|---|---|
| `agent-visible` | 자연어 요청, 사용자가 알려 준 제약, 공통 안전정책, 허용 도구 | 공개 저장소 | 누구나 |
| `evaluator-visible` | 시작·최종 상태, 승인 경계, 금지 결과, 실패 복구, 안전 인계 | **비공개 하네스 저장소** | 하네스 유지자 |
| `harness-private` | fixture, variant, reset, eligibility, oracle, probe, registry, event ID, canary, tick·비용 계산 | **비공개 하네스 저장소** | 하네스 유지자 |
| holdout | 오염 탐지용 예비 과제 | **별도 비공개 경로** | **저작자 전원 접근 불가** |

방법론·검증기·진행판은 공개에 둔다. 슬롯 원장은 공개에 **수치만** 둔다. 어느 후보가 어느 슬롯인지는 저작자에게 힌트가 되므로 공개하지 않는다. 현재 READY의 `availableSlotIdsByCategory`가 정확히 그 방식이며 이미 맞게 하고 있다.

### 기존 공개분 처리

`seojoonkim/mica`는 공개 저장소이고 브랜치가 이미 푸시돼 fixture·oracle 84건이 지금 공개 접근된다. 되돌릴 수 없다. 따라서 삭제가 아니라 재정의한다.

> 지금까지의 15개 배치를 **public core(공개 개발셋)**로 선언한다. 오염 가능성을 전제하고 이 집합의 성적을 대표 수치로 보고하지 않는다. **holdout은 여기서 처음부터 새로 분리한다.**

공개 dev set + 비공개 test set은 벤치마크 표준 구성이다. 잃는 것은 "기존 52건을 대표 성적에 쓸 수 있다"는 가정 하나, 얻는 것은 앞으로 만드는 모든 것이 오염되지 않는다는 보장이다.

---

## 3. job 디렉터리 — 유일한 작업 창구

모든 작업은 controller가 발급한 job 디렉터리에서만 시작한다.

```
work/mica-scenario-exchange/<job-id>/
  READY.json               계약. 볼 수 있는 것의 전부 + 금지 목록 + 출력 계약
  INPUT-MANIFEST.json      허용 파일별 경로·바이트·SHA-256
  packet.jsonl             허용된 입력만
  author-output.staging.jsonl
  review-output.staging.jsonl
  CLOSURE.json             종결 기록
```

### job 유형

| jobType | 저작자가 만드는 것 |
|---|---|
| `catalog-annotation` | 동결 후보에 카테고리·슬롯·종료 유형·복잡도·목표 접점 부착 |
| `clean-room-production` | 빈 슬롯 brief만 받아 근거 → 관찰 → 후보 동결까지 신규 생산 |
| `measurement-design` | 지정 후보의 fixture·oracle 초안 |

annotation job은 6회 실증됐다. 나머지 둘은 같은 계약 형태로 확장한다.

### READY.json 필수 필드

```
jobId, jobType, methodRevision, sourceCommitSha
packetPath, packetSha256
allowedInputs[]           이 경로 외에는 열지 않는다
forbiddenInputs[]         명시적 금지 목록
availableSlotIdsByCategory  controller가 발급한 슬롯만
roles.<역할>.output         출력 경로
roles.<역할>.schemaVersion
roles.<역할>.exactFields[]  키와 순서를 고정
roles.<역할>.mustUseDistinctContext
annotationEnums           허용값
guidanceKo                판정 기준 원문
maxRows                   상한
closureContract.exactFields
closureContract.inputBoundaryStatusValues  ["clean","breach"]
status: "READY"
```

`clean-room-production`은 여기에 `slotBrief`(채울 카테고리와 필요 수량만, **기존 정답을 노출하지 않는다**)를 더한다.

---

## 4. 저작자 절차

### 4.1 시작 전

1. job 디렉터리 하나만 받는다. **저장소를 클론하지 않는다.**
2. `READY.json`을 읽는다. `allowedInputs`와 `forbiddenInputs`를 확인한다.
3. `INPUT-MANIFEST.json`을 읽는다.
4. `shasum -a 256`으로 packet을 대조한다. **불일치하면 즉시 중단하고 보고한다.**

### 4.2 입력 접근 규율

- 허용 입력을 **순서대로 하나씩** 읽는다.
- `grep -r`, `find`, 여러 경로를 묶은 한 줄 명령을 **쓰지 않는다.** 병렬 탐색은 방화벽을 무력화한다.
- 확인할 것이 허용 파일에 없으면 뒤지지 말고 "READY에 없음"으로 보고에 남긴다.
- 금지 입력을 **한 번이라도** 읽으면 산출물을 살리지 않고 `INPUT-BOUNDARY-BREACH`로 닫는다.

> 이 조항은 실제 사고에서 나왔다. controller가 슬롯 형식을 찾다가 검증기 grep과 금지 파일 읽기를 한 명령에 묶어 실행했다. 평소 효율인 병렬 탐색이 방화벽이 있는 작업에서는 정확히 방화벽을 무너뜨린다.

### 4.3 작성

- 후보 원문이 지지하지 않는 **사업자명·시장 수치·표본수·당사자·기간·비용·성공률·제약**을 만들지 않는다.
- 카테고리 라벨은 **본문 근거로만** 붙인다. 인접 기제(예: 월 요금 계속 계약이라는 형태)만 닮았다고 특정 산업 라벨을 붙이지 않는다.
- 슬롯이 없다는 이유로 다른 카테고리에 밀어 넣지 않고, 슬롯이 많이 남았다는 이유로 그쪽으로 끌어당기지 않는다. **어느 카테고리가 비어 있든 판정 근거가 아니다.**
- `telecom-subscriptions`의 한국어 라벨은 **통신·구독·렌털**이다. 계속적 이용계약에서 월 단위 요금, 의무사용기간·위약금, 해지 절차가 계약의 축인 통신, 디지털 구독, 물품 렌털을 포함한다.
- 납부·정산이 핵심이면 **주거·공과금**, 자금 이동이 핵심이면 **금융·은행·투자**, 구매·배송이 핵심이면 **쇼핑·배송**으로 분류한다. 자동이체, 관리비, 정기검진처럼 반복된다는 이유만으로 통신·구독·렌털에 넣지 않는다.
- `categoryProvisional: true`는 READY에 해당 후보가 `controllerApprovedProvisionalCandidateIds`로 명시된 경우에만 쓴다. 이때 `categoryRationale`은 `정기계약 기제 공유. 분류 체계 개정 시 재배치 대상`으로 고정한다. 승인 목록은 분류 관문 우회나 자동 배정이 아니다.
- 정직하게 쓸 수 없는 행은 **쓰지 않고** 사유를 보고한다. 수량을 맞추지 않는다. **0행도 유효한 결과다.**
- 시각은 추정하지 않는다. 작성 직전 `date -u +%Y-%m-%dT%H:%M:%SZ` 실측값을 쓴다.

### 4.4 종료 유형 판정 — 주 성공 경로 규칙

먼저 **주 성공 경로**를 정한다. 모든 것이 잘 풀렸을 때 도달하는 종착점이다. 그다음 그 종착점으로 가른다.

| 값 | 조건 |
|---|---|
| `completed-final-state` | 주 경로에서 권위 있는 최종 상태에 도달. **실패 복구 분기에만 안전 인계가 있으면 이 값을 유지** |
| `approval-handoff` | 주 경로의 **목표 종착점 자체가** 사용자·권한자의 필수 승인 인계 |
| `refusal` | 범위 밖이거나 금지된 요청을 거절 |
| `escalation` | 주 경로를 에이전트가 완료할 수 없어 사람·권위 기관에 인계하는 것이 최종 상태 |

`canonicalFinalState`에 조건절로 걸린 안전 인계가 함께 적혀 있어도, 실패 복구 분기라면 종료 유형을 바꾸지 않는다.

> 이 규칙 이전에는 같은 구조의 후보가 서로 반대로 분류됐다(누적 13행). 규칙 도입 후 첫 job에서 저작자·검토자가 독립적으로 같은 값에 도달했고 갈린 행이 0이었다.

### 4.5 복잡도 판정

기준을 **한 job 안에서 일관되게** 적용하고 그 기준을 보고에 명시한다. 실증된 기준 예시: "정해진 대기 기간이 지난 뒤의 재조회를 본문이 명시적으로 요구할 때만 `cross-session`."

`declaredComplexity`와 `targetSurface`는 `taskAction`의 **행동 메커니즘**에서 판정한다. `userRequest`의 인상으로 추정하지 않는다.

### 4.6 종료

- 지정된 staging 파일과 `CLOSURE.json`만 쓴다.
- 다음 stage로 **자동 진입하지 않는다.** `nextStageAutoStarted: false`
- CLOSURE에 읽은 입력의 실측 SHA, 컨텍스트 ID, 행수, 산출물 SHA, `forbiddenInputReads`, `inputBoundaryStatus`, Slack·Notion 호출 수를 기록한다.

---

## 5. 검토자 절차

1. 저작자와 **다른 사람·다른 컨텍스트**여야 한다.
2. **저작자의 근거·대안값·고민을 전달받지 않는다.** packet 원문과 저작자 산출물만 본다.
3. 입력 SHA를 직접 대조한다.
4. 각 행의 다섯 항목을 **독립적으로** 판정한다: 후보 결속, 카테고리·슬롯, 종료 유형, 복잡도, 목표 접점.
5. 행 해시(`annotationRowSha256` 등)를 **직접 계산한다.** 남이 준 값을 옮겨 적지 않는다.
6. 다섯 개가 모두 true일 때만 `accept`. 근거 부족은 `hold`, 잘못된 결속은 `reject`.
7. 확신도를 `high` / `medium` / `low`로 기록한다. `medium`·`low`는 불확실 메모 필수, **`low`는 accept 불가**.

**accept는 목표가 아니다.** 근거가 얇으면 hold가 옳고 hold가 여러 건 나오는 것은 정상이다. 흠을 만들어내려고 reject하지도 않는다.

> 독립성이 실제로 작동한 사례: 저작자가 스스로 "최대 난점"으로 신고한 두 행을, 그 신고를 받지 못한 검토자가 독립적으로 잡아 reject했다.

---

## 6. controller 절차

1. **슬롯은 controller만 발급한다.** 저작자는 READY의 가용 목록에서만 고른다. 이것이 동시 생산의 슬롯 충돌을 막는 유일한 장치다.
2. 수령 조건을 모두 통과한 결과만 원장에 적용한다.
   - `READY.json`과 `CLOSURE.json`의 `jobId` 일치
   - 입력·출력 SHA 재현
   - exact schema·키 순서·행수 검증
   - 저작자·검토자 컨텍스트 분리
   - 원본 동결 행 SHA 결속
   - 금지 도구 호출 0
   - 검토 수락 행만 apply 대상
3. 실패 결과는 원장에 적용하지 않고 defect만 보존한다.
4. **자기 저작물을 의미 심사하지 않는다.** 신규 생활 필요나 과업 의미를 직접 발명해 슬롯 수를 채우지 않는다.
5. 배치 ID를 **사람으로 네임스페이스**한다. `std-b13` → `kh-b13` / `sj-b1` / `<이니셜>-b<n>`

---

## 7. 오염 감사 필드

산출 행에 접근 프로파일을 결속한다. 이게 없으면 나중에 의심이 생겼을 때 전수 재작업 외에 방법이 없다.

| 필드 | 값 |
|---|---|
| `authorId` | 사람·런타임 식별자 |
| `authorAccessProfile` | `job-packet-only` / `public-core-read` / `harness-maintainer` |
| `reviewerId` | 검토자 식별자 |

CLOSURE의 읽은 입력 실측 SHA 목록은 이미 있다. 위 세 필드를 더하면 **오염 여부가 가정이 아니라 기록이 된다.**

---

## 8. 통합 경로

```
저작자   →  job 디렉터리 수령 → staging + CLOSURE 작성 → 정지
검토자   →  독립 판정 → review staging 작성 → 정지
controller → 기계 검증 → 수락분만 원장 적용 → 다음 job 발급
통합자   →  배치 단위 PR 제출
승인자   →  main 병합
```

- **저작자·검토자는 공개 저장소에 push 권한이 필요 없다.** 공개 저장소에서 이게 더 안전하다.
- **배치 1개 = PR 1개.** 420 파일 PR은 실제로 검토되지 않는다. 쪼개면 검토 가능해지고, 문제가 한 배치에 격리되며, 머지 결정이 작아진다.
- 로컬 커밋은 저작자도 가능하다. push·PR 본문 수정·배포·머지는 아니다.

---

## 9. 파킹된 배치는 건드리지 않는다

파킹된 배치의 `resume`은 `checkpoint == _checkpoint(...)`를 요구하고, checkpoint는 `.md`를 포함한 디렉터리 전체를 덮는다. **파일을 추가하거나 수정하면 `parked-checkpoint-mismatch`로 재개가 막힌다.**

파킹 배치에 대한 설명·경고·정정은 **배치 바깥**에 쓴다. PR 본문, `work/method-reviews/`, 진행판 중 하나다.

---

## 10. 신규 팀원 온보딩

첫날 주는 것은 저장소 접근이 아니라 이 셋이다.

1. **방법론 문서**(공개) — 왜 이렇게 하는지
2. **역할 계약 한 장** — 무엇을 보고 무엇을 보지 않는가, 무엇을 쓰는가
3. **job 디렉터리 하나** — 실제 작업

**저장소 클론을 요청받으면 그것 자체가 경계 위반 신호다.** 필요한 것은 job 디렉터리이지 저장소가 아니다.

---

## 11. 체크리스트

### 저작자
- [ ] job 디렉터리만 받았다. 저장소를 클론하지 않았다
- [ ] packet SHA를 대조했다
- [ ] 허용 입력을 순서대로 하나씩 읽었다. `grep -r`·`find`·다중 경로 명령을 쓰지 않았다
- [ ] 금지 입력 접근 0회
- [ ] 없는 사실을 만들지 않았다
- [ ] 슬롯 사정이 의미 판정을 바꾸지 않았다
- [ ] 정직하게 쓸 수 없는 행은 쓰지 않고 사유를 남겼다
- [ ] 시각을 실측했다
- [ ] 지정 파일만 썼고 다음 stage로 넘어가지 않았다

### 검토자
- [ ] 저작자와 다른 사람·다른 컨텍스트다
- [ ] 저작자의 근거를 전달받지 않았다
- [ ] 입력 SHA를 직접 대조했다
- [ ] 행 해시를 직접 계산했다
- [ ] 다섯 항목을 독립 판정했다
- [ ] 확신도를 정직하게 기록했다. `low`를 accept하지 않았다

### controller
- [ ] 슬롯을 직접 발급했다
- [ ] 수령 조건 7개를 모두 확인했다
- [ ] 수락 행만 원장에 적용했다
- [ ] 자기 저작물을 의미 심사하지 않았다
- [ ] 배치 ID를 사람으로 네임스페이스했다
