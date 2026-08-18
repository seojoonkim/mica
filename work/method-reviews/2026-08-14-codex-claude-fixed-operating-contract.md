- 한 줄 요약: Codex는 MICA의 공정·검증·통합을, Claude Code는 허용된 입력 안에서 의미 판정·신규 후보 생산을 전담하며 파일 계약으로만 작업을 이어 간다.
- 작성일: 2026-08-14
- 상태: 초안
- 이 문서가 답하는 질문: Codex와 Claude Code가 추가 대화 조율 없이 장기간 분리 실행하려면 무엇을 각각 소유하고 어떤 파일로 인계해야 하는가?

# MICA Codex·Claude Code 고정 운영 계약

- origin: kiheon-ideation
- 적용 시작점: `std-b12` 종결 이후 `standard-v1.3.5`와 Core 20
- 선행 기준: `2026-08-14-core20-integrated-state-and-handoff.md`
- 최종 필수 목표: 10개 카테고리 x 10개 슬롯, 총 100개

## 1. 운영 결정

두 런타임은 같은 문제를 함께 토론하거나 같은 파일을 번갈아 수정하지 않는다. 한 작업의 소유자, 입력, 출력, 완료 조건을 미리 고정하고 파일 상태로만 인계한다.

- Codex는 방법론 구현자이자 controller다.
- Claude Code는 의미 annotation과 신규 후보 생산자다.
- 의미 작성자와 의미 검토자는 Claude Code 안에서도 서로 다른 컨텍스트를 사용한다.
- repo-level 원장 적용, 외부 기록, push와 배포는 Codex만 수행한다.
- 사용자는 우선순위와 거버넌스만 결정하며 런타임 사이의 중간 메시지를 계속 전달하지 않는다.

## 2. Codex 단독 소유 범위

Codex만 다음 파일과 행위를 소유한다.

1. `standard-v1.3.5` schema·validator·회귀 검사 구현
2. `catalogAnnotator`, `catalogAnnotationReviewer` 역할 계약과 컨텍스트 충돌 차단
3. `work/mica-scenario-portfolio/` 아래 repo-level 포트폴리오 원장과 receipt
4. 기존 동결 후보 56건의 deterministic prefilter
5. Claude Code에 전달할 최소 입력 packet 생성과 SHA 결속
6. Claude Code 산출물의 구조·SHA·역할·수량 검증
7. 수락된 annotation의 deterministic `portfolio-apply`
8. 10 x 10 슬롯 집계와 Core 20·최종 100 진행 관리
9. `closingShaLedger` 자동 도출·대조와 검증기 자동화
10. GitHub PR, Vercel 진행판·매뉴얼, Notion, Obsidian 상태 통합
11. future public core와 private holdout의 저장·export 분리

Codex는 자신이 만든 후보를 의미적으로 자기심사하지 않는다. 신규 생활 필요 관찰이나 과업 의미를 직접 발명해 슬롯 수를 채우지 않는다.

## 3. Claude Code 단독 소유 범위

Claude Code는 Codex가 `READY`로 동결한 packet 안에서만 다음 작업을 수행한다.

1. 기존 동결 후보의 semantic catalog annotation
2. 별도 컨텍스트를 사용한 annotation 독립 검토
3. 빈 슬롯이 남을 때 controller가 제공한 slot brief에 따른 clean-room 신규 후보 생산
4. 신규 후보의 근거·관찰·과업 번역·독립 검토·accepted-only 동결
5. 실행 우선순위로 지정된 소수 후보의 측정 자산 초안 작성
6. 할당 작업의 closure와 defect 기록

Claude Code는 다음을 하지 않는다.

- 검증기·공정 코드·repo-level 포트폴리오 원장 수정
- 진행 웹·매뉴얼·Notion·Obsidian 수정
- GitHub PR 본문 수정, push, 배포
- 공식 MICA 100 또는 과거 후보 본문을 신규 아이디어 seed로 사용
- reviewer 결과를 author에게 역류
- `READY`가 아닌 packet이나 다른 배치 파일 탐색
- controller 승인 없이 다음 stage 또는 새 배치 시작

## 4. 장기 실행 순서

### 단계 A. Codex가 v1.3.5 기반을 완성한다

완료 조건:

- 10 x 10 `portfolio-100.json` 검사
- annotation·review schema와 raw-row SHA 결속
- annotator·reviewer 역할 분리
- closed batch의 reviewed annotation만 apply
- 중복 슬롯과 미검토 행 거부
- blocked slot의 시도 이력 검사
- `targetSurface`에서 `confirmedSurface`로의 자동 승격 거부
- holdout public export 거부
- ledger 실패 시 batch scan fallback 거부
- `closingShaLedger` 자동 도출·검증
- 대상 회귀 검사 PASS

이 단계가 끝나기 전 Claude Code는 annotation이나 신규 생산을 시작하지 않는다.

### 단계 B. 기존 56건에서 Core 20을 확보한다

1. Codex가 prefilter 후 최대 10건 단위 packet을 만든다.
2. Claude Code의 annotator가 의미 annotation을 작성한다.
3. Claude Code의 별도 reviewer가 각 행을 수락·거절·보류한다.
4. Codex가 산출물을 기계 검증한다.
5. Codex가 수락 행만 `portfolio-apply`한다.
6. 서로 다른 occupied slot이 20개가 되면 Core 20을 닫는다.

56건은 후보 재고일 뿐 56개 슬롯으로 세지 않는다. receipt가 발급된 고유 슬롯만 완료 수에 포함한다.

### 단계 C. 부족 슬롯만 신규 생산한다

Core 20 또는 이후 100 슬롯 진행에서 부족한 카테고리·슬롯만 다룬다.

- Codex가 기존 정답을 노출하지 않는 slot brief를 만든다.
- Claude Code가 5건 이하의 clean-room 생산 배치를 수행한다.
- Codex가 검증·apply하고 다음 빈 슬롯을 계산한다.
- 이미 채운 슬롯과 편중 영역의 생산은 중단한다.

### 단계 D. 측정과 실행은 별도 축으로 진행한다

Core slot 점유를 위해 모든 후보의 상세 fixture·reset·eligibility·oracle을 먼저 만들지 않는다.

- 모든 Core 후보에는 짧은 `measurementIntent`를 둔다.
- Core 20 이후 대표 2~3건만 먼저 `measurement-selected`로 보낸다.
- 저작 중 preflight validator와 core·variant 분해를 사용한다.
- measurement design, rehearsal, system attempt를 별도 상태로 기록한다.

## 5. 파일 인수인계 계약

### 5.1 Codex가 여는 작업

각 작업은 controller가 고유 `jobId`와 디렉터리를 만든 뒤 시작한다.

```text
work/mica-scenario-exchange/<job-id>/
  READY.json
  INPUT-MANIFEST.json
  packet.jsonl
  author-output.staging.jsonl
  review-output.staging.jsonl
  CLOSURE.json
```

`READY.json` 최소 필드:

- `jobId`
- `jobType`: `catalog-annotation` 또는 `clean-room-production`
- `methodRevision`
- `sourceCommitSha`
- `packetPath`와 `packetSha256`
- 허용 입력 경로
- 금지 입력 경로와 도구
- author·reviewer context 제약
- 출력 경로와 exact schema version
- 최대 행수
- 완료·fail-closed 조건
- `status: READY`

`INPUT-MANIFEST.json`은 허용된 모든 입력 파일의 경로·바이트 수·SHA-256을 기록한다. Claude Code는 목록 밖의 파일을 읽지 않는다.

### 5.2 Claude Code가 닫는 작업

Claude Code는 지정된 staging 파일과 `CLOSURE.json`만 쓴다.

`CLOSURE.json` 최소 필드:

- `jobId`
- 읽은 입력 경로와 실제 SHA-256
- Slack·Notion 호출 수
- author·reviewer context ID
- 작성·수락·거절·보류 행수
- 출력 파일 경로·바이트 수·SHA-256
- 발견한 결함과 미확정 항목
- `status`: `COMPLETED`, `ZERO-ACCEPTED`, `INPUT-BOUNDARY-BREACH`, `BLOCKED`
- 다음 단계 자동 진입 금지 표시

입력 SHA 불일치, 금지 파일·도구 노출, 역할 컨텍스트 충돌이 있으면 의미 작업을 중단하고 `INPUT-BOUNDARY-BREACH`로 닫는다. 수량을 맞추기 위해 결과를 보충하지 않는다.

### 5.3 Codex의 수령 조건

Codex는 다음을 모두 통과한 경우에만 결과를 수령한다.

1. `READY.json`과 `CLOSURE.json`의 `jobId` 일치
2. 입력·출력 SHA 재현
3. exact schema·key·행수 검증
4. author·reviewer 컨텍스트 분리
5. source frozen row SHA 결속
6. 금지 도구 호출 0
7. review 수락 행만 apply 대상에 포함

실패 결과는 원장에 적용하지 않고 defect만 보존한다.

## 6. 파일 소유권과 충돌 방지

| 영역 | Codex | Claude Code |
|---|---|---|
| `scripts/`, 검증기, 테스트 | 읽기·쓰기 | 읽기만 |
| `work/mica-scenario-portfolio/` | 읽기·쓰기 | 접근 금지 |
| `work/mica-scenario-exchange/<job-id>/packet*` | 생성·동결 | 허용 입력만 읽기 |
| 같은 job의 author staging | 검증만 | author 컨텍스트만 쓰기 |
| 같은 job의 review staging | 검증만 | 별도 reviewer 컨텍스트만 쓰기 |
| 기존 closed batch | 읽기·검증 | packet에 포함된 행만 읽기 |
| 신규 생산 batch | controller·검증 | 지정 역할 산출물만 쓰기 |
| GitHub·Vercel·Notion·Obsidian | 쓰기 | 쓰기 금지 |

두 런타임은 같은 파일을 동시에 수정하지 않는다. Claude Code는 기존 closed artifact를 고치지 않고 새 staging 행이나 새 batch artifact만 추가한다.

## 7. 보고와 중단 규칙

중간 대화 보고는 기본적으로 생략한다. 다음 사건만 `CLOSURE.json` 또는 defect ledger로 보고한다.

- 입력 경계 위반
- schema나 SHA 불일치
- 동일 context의 역할 충돌
- 근거 부족으로 의미 판정 불가
- 기존 슬롯과 중복·충돌
- 검증기 자체 결함
- 사용자만 결정할 수 있는 거버넌스 문제

한 작업이 끝나면 Claude Code는 다음 packet을 기다린다. Codex는 검증과 apply가 끝난 뒤에만 새 `READY`를 만든다.

## 8. 외부 반영 규칙

- Claude Code는 로컬 커밋까지만 허용한다.
- Codex는 Claude 산출물을 수령·검증한 뒤 필요한 경우 통합 커밋을 만든다.
- GitHub push, PR 수정, Vercel 배포, Notion·Obsidian 기록은 Codex가 수행한다.
- Slack 메시지는 사용자가 명시적으로 요청할 때만 준비하거나 전송한다.
- 공식 MICA canonical 변경과 PR 병합은 사용자와 저장소 소유자의 거버넌스 결정이다.

## 9. 현재 첫 작업

### Codex

`standard-v1.3.5`의 최소 기반과 회귀 검사를 구현하고 첫 `catalog-annotation` job을 `READY`로 만든다.

### Claude Code

Codex의 첫 `READY.json`이 생성될 때까지 새 batch·annotation·측정 자산 작업을 시작하지 않는다. 받은 job에서는 목록에 적힌 입력만 읽고 author staging, independent review staging, `CLOSURE.json`을 작성한 뒤 정지한다.

## 10. 성공 기준

이 운영 계약은 다음 상태에서 목적을 달성한다.

1. 사용자가 런타임 사이의 중간 답변을 전달하지 않아도 각 작업이 파일 상태로 이어진다.
2. Codex와 Claude Code가 같은 파일을 동시에 수정하지 않는다.
3. 의미 작성·독립 검토·기계 검증·원장 적용이 서로 분리된다.
4. Core 20 이후에도 같은 계약으로 10 x 10, 총 100개 슬롯까지 반복할 수 있다.
5. 실행 설계와 실제 실행 상태가 포트폴리오 슬롯 수와 혼동되지 않는다.
