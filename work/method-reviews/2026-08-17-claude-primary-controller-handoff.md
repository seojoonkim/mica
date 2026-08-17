---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: active-controller-handoff
scope: claude-code-primary-controller-transition
language: ko
asOf: 2026-08-17
sourceSnapshotSha: ffb3e8500a8adea6b6b58ee6ffcc5e4eb63a5dda
---

# Claude Code 주 컨트롤러 인수인계

## 0. 문서의 지위와 대상

이 문서는 MICA 신기헌 아이데이션 작업의 주 컨트롤러를 Codex에서 Claude Code로 넘기기 위한 단일 시작 문서다. 이전 대화의 요약본이 아니라, 다음 실행을 재개하는 데 필요한 현재 상태, 불변 규칙, 역할 분리, 실행 순서, 기록 규칙을 함께 고정한다.

- 대상: 저장소 전체를 볼 수 있는 Claude Code 주 컨트롤러 세션
- 금지: 이 문서를 sourceResearcher, needWriter, taskTranslator 같은 동결 전 clean-room 역할의 입력 패키지에 포함하지 않는다.
- 기준 저장소: `/Users/kiheon/vooy/mica`
- 기준 브랜치: `codex/mica-kiheon-pilot-15`
- 운영 상태 기준 commit: `ffb3e8500a8adea6b6b58ee6ffcc5e4eb63a5dda`
- 작업 PR: <https://github.com/seojoonkim/mica/pull/1>
- 진행판: <https://mica-kiheon-progress.vercel.app/>

이 문서의 수치는 위 commit에서 읽은 스냅샷이다. 재개할 때는 아래 검증 명령으로 현재 값을 다시 계산하고, 문서의 숫자를 현재값으로 오인하지 않는다.

## 1. 60초 요약

최종 목표는 선택 사항이 아닌 `10개 카테고리 x 10개 = 고유 슬롯 100개`다. 현재 상태는 다음과 같다.

| 항목 | 현재 값 | 의미 |
|---|---:|---|
| 동결 후보 계보 | 57 | 근거부터 후보 동결까지 계보가 남은 누적 후보 |
| catalog annotation 완료 | 56 / 57 | `ki-b13-02` 한 건만 남음 |
| 고유 슬롯 점유 | 48 / 100 | 독립 annotation 검토와 원장 적용까지 끝난 슬롯 |
| 정원 외 추가 후보 | 8 | 카테고리가 이미 10칸 찼지만 품질상 보존한 후보 |
| 빈 고유 슬롯 | 52 | 앞으로 채워야 할 최종 포트폴리오 자리 |
| 측정 설계 보유 | 52 / 57 | 합성 시험 설계가 있는 후보, 실제 실행 횟수와 다름 |
| 외부 실서비스 실행 | 0 | 실제 기관이나 서비스에 연결해 실행하지 않음 |

현재 자동으로 이어갈 새 생산 배치는 없다. 먼저 이미 `READY`인 `core20-annotation-009`를 서로 다른 annotation 작성자와 검토자로 종결하고, `ki-b13-02`를 포트폴리오 원장에 적용해야 한다.

## 2. 프로젝트 경계와 절대 바꾸지 않을 원칙

### 2.1 정본과의 관계

- 이 포트폴리오는 `kiheon-ideation`에서 만든 병렬 연구 포트폴리오다.
- 공식 MICA 100개 카탈로그를 대체하거나 정본에 채택된 상태가 아니다.
- `relationToCanonical=parallel-research-portfolio`, `canonicalAdoptionStatus=not-adopted`를 유지한다.
- 공식 MICA 100개는 작성 답안, 발상 seed, 수량 힌트로 쓰지 않는다. 후보 동결 뒤의 comparator와 거버넌스 판단에서만 연다.
- 최종 100개는 실제 고유 슬롯 100개를 뜻한다. 동결 후보 수, annotation 수, 측정 설계 수로 대신하지 않는다.

### 2.2 저작과 검토 원칙

- 개인 소비자의 실제 생활 부담에서 출발한다.
- 시장 고유 사실, 수치, 제도 주장은 공식 1차 근거와 한계를 보존한다.
- 사업자명, 점유율, 근거 없는 표본수, 근거 없는 처리 기간과 수치를 만들지 않는다.
- 작성자가 자기 산출물의 의미 검토자를 겸하지 않는다.
- 카테고리의 빈 슬롯 때문에 후보 의미를 다른 카테고리에 밀어 넣지 않는다.
- 카테고리가 가득 찼다면 `category-overflow`로 보존한다. 먼저 만들어진 10개가 자동으로 더 우수하다는 뜻은 아니다.
- 후보 동결 전에는 기존 후보, 비교 결과, 슬롯 결속 정보가 의미 판단에 역류하지 않게 한다.
- 후보 동결 뒤에는 comparator, annotation, 측정 검토가 각 계약에 따라 기존 재고를 볼 수 있다.

### 2.3 에이전트에게 보이는 것과 숨기는 것

| 층 | 내용 | 테스트 대상 에이전트 공개 |
|---|---|---|
| 사용자 요청 | 자연어 요청과 사용자에게 알려진 제약 | 공개 |
| 공통 안전 정책 | 승인 필요 행동과 허용 도구 범위 | 공개 |
| 합성 환경 | 계정 상태, fixture, 실패 변형, reset | 비공개 |
| 평가 기준 | canonical final state, 금지 상태, oracle | 비공개 |
| 채점 내부 장치 | token registry, probe, event ID, tick 계산 | 반드시 비공개 |

상세한 측정 계약은 평가자와 하네스용이다. 테스트 대상 에이전트에게 정답과 실패 분기까지 전달하지 않는다.

## 3. 현재 포트폴리오 상태

다음 값은 `python3 scripts/mica-portfolio.py status`의 2026-08-17 readback이다.

| 카테고리 ID | 한국어 표시 | 점유 / 목표 | 남은 자리 |
|---|---|---:|---:|
| `email-calendar` | 이메일·캘린더 | 4 / 10 | 6 |
| `shopping-delivery` | 쇼핑·배송 | 4 / 10 | 6 |
| `travel-accommodation` | 여행 계획·숙박 | 3 / 10 | 7 |
| `restaurants-local` | 외식·예약 | 2 / 10 | 8 |
| `money-banking-investing` | 금융·은행·투자 | 6 / 10 | 4 |
| `mobility-transit` | 이동·대중교통 | 2 / 10 | 8 |
| `healthcare-administration` | 의료 행정 | 4 / 10 | 6 |
| `government-civic` | 행정·공공 서비스 | 10 / 10 | 0 |
| `home-utilities` | 주거·공과금 | 3 / 10 | 7 |
| `telecom-subscriptions` | 통신·구독·렌털 | 10 / 10 | 0 |

다음 신규 생산은 외식·예약, 이동·대중교통, 여행 계획·숙박, 주거·공과금처럼 빈 자리가 많은 영역을 우선할 수 있다. 그러나 저작자에게 전달하는 slot brief는 카테고리와 필요 수량까지만 포함한다. 기존 후보 제목, 소재, 슬롯별 정답, 비교 판정은 노출하지 않는다.

## 4. kh-b13 clean-room 실행 결과

`kh-b13`은 저장소 밖 역할별 패키지와 신규 컨텍스트 분리를 실제 생산 체인에 적용한 첫 배치다.

```text
공식 1차 근거 5
  -> 독립 원천 검토 수락 5
  -> 필요 관찰 4
  -> 독립 관찰 검토 수락 2 / 거절 2
  -> 관찰 동결 2
  -> 과업 후보 1 / 미번역 관찰 1
  -> 독립 후보 검토 수락 1
  -> 후보 동결 1
  -> 사후 대조 transformation 1
  -> catalog annotation 대기 1
```

- 최종 동결 후보: `ki-b13-02`
- 내용: 숙박 예약 취소와 환불 요청 처리
- 현재 단계: post-freeze comparison 완료, catalog annotation 대기
- 미완료: 고유 슬롯 적용, measurement design, 합성 실행, 외부 실서비스 실행

### 4.1 거절과 미번역은 정상적인 품질 신호다

- `ob-kh-b13-01`: 개인 소비자의 생활 부담보다 사업자 운영과 정책 기준 적용이 중심이라 `needBoundary`와 `stateChangeClarity`에서 거절했다.
- `ob-kh-b13-02`: 개인 소비자 부담이 아니라 사업체의 영업 손실이 중심이라 `needBoundary`에서 거절했다.
- `ob-kh-b13-03`: 집단 통근 통계만으로는 한 개인의 시작 상태, 권한, 변경 가능한 외부 상태, readback을 발명 없이 만들 수 없어 번역하지 않았다.

수량을 맞추려고 이 판정을 완화하지 않는다. 5개 근거에서 1개 후보가 나온 것은 실패가 아니라 관문이 실제로 작동한 결과다.

### 4.2 세션 수와 accepted 체인을 혼동하지 않는다

Claude Code 화면에 같은 job 이름의 세션이 여러 개 보이거나 일부 세션이 삭제될 수 있다. 화면의 세션 수는 정본이 아니다. accepted 체인은 다음 네 종류의 파일로 재구성한다.

1. 역할별 `READY.json`, `INPUT-MANIFEST.json`, `ROLE-CONTRACT.md`
2. 역할 산출물과 `CLOSURE.json`
3. controller가 다시 계산한 SHA-256과 `CONTROLLER-RECEIPT.md`
4. 이 파일들을 보존한 Git commit

관찰 동결 첫 시도에서는 이전 closure receipt가 64자리 SHA-256이 아니어서 거절됐다. 실패 증거는 `work/mica-scenario-exchange/kh-b13-observation-freeze/attempt-001-rejected/`에 보존돼 있다. 수리한 새 패키지와 신규 custodian 컨텍스트만 accepted 체인에 포함한다.

전체 context ID, 행별 SHA, closure 결속은 `work/method-reviews/2026-08-17-kh-b13-clean-room-run-record.md`를 정본으로 사용한다.

## 5. Claude Code 주 컨트롤러 운영 구조

### 5.1 역할 분담

| 역할 | 주 담당 | 접근 범위 | 자기심사 가능 여부 |
|---|---|---|---|
| 주 컨트롤러 | Claude Code 메인 세션 | 저장소 전체, 원장, Git, 기록 표면 | 의미 저작과 의미 심사를 동시에 하지 않음 |
| sourceResearcher | 신규 clean-room 컨텍스트 | 해당 job package와 공개 웹 | 같은 source review 금지 |
| sourceReviewer | 신규 clean-room 컨텍스트 | review package와 공식 출처 | researcher와 분리 |
| needWriter | 신규 clean-room 컨텍스트 | 수락된 근거 packet | observation review 금지 |
| observationReviewer | 신규 clean-room 컨텍스트 | observation review packet | writer와 분리 |
| observationCustodian | 기계 처리 컨텍스트 또는 스크립트 | 수락 행과 receipt | 의미 재판정 금지 |
| taskTranslator | 신규 clean-room 컨텍스트 | 동결 관찰 packet | candidate review 금지 |
| candidateReviewer | 신규 clean-room 컨텍스트 | candidate review packet | translator와 분리 |
| candidateCustodian | 기계 처리 컨텍스트 또는 스크립트 | 수락 행과 receipt | 의미 재판정 금지 |
| comparator | post-freeze catalog-read 컨텍스트 | 동결 후보와 기존 재고 | 동결 전 역할로 복귀 금지 |
| catalog annotator / reviewer | 서로 다른 post-freeze 컨텍스트 | 지정 packet과 원장 계약 | 같은 job 겸직 금지 |
| blind-agent rehearsal | agent-visible-only 신규 컨텍스트 | 공개 요청과 공개 정책만 | 후보 명세, oracle, fixture 금지 |

주 컨트롤러 한 세션이 전체 공정을 관리할 수는 있지만, 위 의미 역할을 한 컨텍스트 안에서 연속 수행하면 안 된다. Claude Code가 격리 subagent나 별도 context를 만들 수 있으면 controller가 직접 생성하고 수거한다. 사용자가 각 단계마다 메시지를 중계하도록 요구하지 않는다.

### 5.2 접근 프로파일

- `job-packet-only`: 동결 전 저작자와 의미 검토자
- `mechanical-custodian`: 수락 행의 바이트와 SHA만 보존하는 동결 담당
- `post-freeze-catalog-read`: comparator, catalog annotation, measurement 사후 검토
- `agent-visible-only`: 실제 테스트 대상 에이전트의 공개 입력 재현

사후 역할에서 얻은 기존 재고와 비교 정보는 동결 전 역할로 되돌려 보내지 않는다.

## 6. 재개 직후 실행 순서

### 6.1 저장소 확인

```bash
cd /Users/kiheon/vooy/mica
git status --short --branch
git rev-parse HEAD
python3 scripts/mica-scenario-production.py preflight
python3 scripts/mica-portfolio.py validate
python3 scripts/mica-portfolio.py status
```

macOS 기본 `/usr/bin/python3`가 3.9이면 `scripts/test-mica-isolated-agent-runner.py`의 `dataclass(slots=True)`를 실행할 수 없다. 전체 회귀 검증은 설치된 `/opt/homebrew/bin/python3.13`을 사용한다. 이 환경 차이는 격리 runner의 코드 실패로 기록하지 않는다.

그 다음 아래 두 문서를 순서대로 읽는다.

1. `work/method-reviews/2026-08-17-claude-primary-controller-handoff.md`
2. `.claude/skills/mica-scenario-production/SKILL.md`

기존 `READY` job이 있으면 새 job을 만들지 않는다.

### 6.2 현재 활성 job: core20-annotation-009

| 항목 | 값 |
|---|---|
| job 경로 | `work/mica-scenario-exchange/core20-annotation-009/` |
| 상태 | `READY` |
| jobType | `catalog-annotation` |
| 대상 | `ki-b13-02` |
| sourceCommitSha | `f44fc802aba16de5235eee414aeaf8aeeb83484d` |
| packet SHA-256 | `f64ee6f01fa45698ac5a29d03d67cc23f334ebc701ab021c6f48ab52c22bf92d` |
| maxRows | 1 |
| author output | 비어 있음 |
| reviewer output | 비어 있음 |

진행 순서:

1. 신규 `catalogAnnotator` 컨텍스트가 `READY.json`, `INPUT-MANIFEST.json`, `packet.jsonl`만 보고 `author-output.staging.jsonl` 한 행을 작성한다.
2. annotation 저작 내용을 이어받지 않은 별도 `catalogAnnotationReviewer` 컨텍스트가 독립 판정해 `review-output.staging.jsonl` 한 행을 작성한다.
3. controller가 job을 검증한다.

```bash
python3 scripts/mica-portfolio.py validate-job --job-id core20-annotation-009
```

4. PASS일 때만 실제 controller context ID와 UTC 시각으로 원장에 적용한다.

```bash
python3 scripts/mica-portfolio.py apply \
  --job-id core20-annotation-009 \
  --applied-by-context-id <controller-context-id> \
  --observed-at <YYYY-MM-DDTHH:MM:SSZ>
python3 scripts/mica-portfolio.py validate
python3 scripts/mica-portfolio.py status
```

5. 결과를 commit한 뒤에만 Notion, Obsidian, 진행판, PR 본문에 새 commit SHA와 readback 수치를 기록한다.

`Clean Room Current` 링크는 현재 과거 `kh-b13-candidate-freeze` 임시 폴더를 가리키는 편의 링크다. 현재 활성 job의 정본으로 사용하지 않는다. 활성 상태는 exchange job의 `READY.json`, outputs, `CLOSURE.json`, controller receipt, Git commit으로 판단한다.

## 7. core20-annotation-009 다음 생산 배치

새 배치는 009 적용과 기록이 끝난 뒤에 연다.

### 7.1 우선 영역

1. 외식·예약 2/10
2. 이동·대중교통 2/10
3. 여행 계획·숙박 3/10
4. 주거·공과금 3/10

카테고리마다 같은 수를 억지로 생산하지 않는다. 근거가 개인 소비자 부담과 상태 변화를 지지하지 않으면 0행 또는 거절이 유효하다.

### 7.2 source 단계의 조기 적합성 확인

공식 자료를 수집할 때 아래 질문을 먼저 적용하면 후반 거절 비용을 줄일 수 있다.

1. 부담 주체가 개인 소비자인가, 사업자나 정책 운영자인가?
2. 현재 상태와 바뀌어야 할 상태를 근거에서 직접 읽을 수 있는가?
3. 해결책이나 에이전트 행동을 근거 단계에서 미리 쓰지 않았는가?
4. 개별 과업의 시작 상태, 권한, 외부 상태, readback을 발명 없이 번역할 가능성이 있는가?

이는 후보 답을 미리 쓰는 검사가 아니다. 명백히 개인 생활과업으로 이어지지 않는 근거를 조기에 제외하는 적합성 검사다.

### 7.3 예상 수율과 시간

`kh-b13`의 5개 근거에서 1개 후보가 나온 결과를 고정 수율로 일반화하지 않는다. 현재 실무 가정은 다음과 같다.

| 작업 단위 | 예상 에이전트 시간 | 비고 |
|---|---:|---|
| annotation 009 종결 | 20~40분 | 작성, 독립 검토, controller apply 포함 |
| 공식 근거 최대 5건의 한 clean-room 생산 배치 | 60~150분 | 의미 경계와 재시도 수에 따라 변동 |
| 기계 동결과 SHA 검증 | 5~15분 | 가능한 한 스크립트로 자동화 |
| 배치 commit과 기록 readback | 15~30분 | Git, Notion, Obsidian, 진행판 중 변경 표면에 따라 변동 |

빈 슬롯 52개를 현재의 최대 깊이로 모두 채우면 시간이 매우 커진다. 다음 단계의 목표는 품질 관문을 없애는 것이 아니라, 반복되는 패키지 생성, SHA 결속, accepted-only freeze, closure 작성을 자동화해 의미 역할의 토큰을 줄이는 것이다.

## 8. 모델과 비용 운영 원칙

| 작업 | 권장 모델과 사고 수준 |
|---|---|
| controller 상태 확인, 패키지 생성, Git, 기록 | Claude Sonnet급, 중간 사고 |
| 공개 1차 자료 조사와 구조화 | Claude Sonnet급, 중간 사고 |
| observation과 candidate 의미 검토 | Claude Opus급 또는 동급 상위 모델, 높은 사고 |
| custodian freeze, SHA, manifest, closure | 스크립트 우선, 낮은 사고 |
| comparator, annotation | Sonnet급으로 시작, 모호한 경계만 상위 모델 |
| 방법론 충돌, 거버넌스, 심각 결함 | 상위 모델, 높은 사고 |

모든 역할을 최고 모델로 돌리지 않는다. 특히 SHA 계산, exact-key 검사, accepted-only 필터링, manifest 갱신은 모델 판단이 아니라 프로그램으로 수행한다.

## 9. 아직 열려 있는 결함과 거버넌스

### 9.1 측정 축

- `df-b12-01`부터 `df-b12-04`까지 측정 자산 내부 정합 결함이 열려 있다.
- 대표 2~3건의 깊은 측정 자산을 다시 만들기 전에 저작 중 preflight validator를 먼저 구현해야 한다.
- 후보 수를 빨리 채우는 core-slot 축과 깊은 measurement 축은 분리한다.
- 측정 설계 보유는 실제 합성 실행 통과나 외부 서비스 성공을 뜻하지 않는다.

### 9.2 public core와 private holdout

- 현재 공개 후보와 비공개 holdout을 어떻게 나눌지는 채택 전 거버넌스 결정이다.
- 이미 공개된 후보를 사후 비공개 holdout으로 되돌렸다고 주장하지 않는다.
- 안정적 public core와 새로 만든 private holdout의 분리 원칙을 기헌과 서준이 결정해야 한다.

### 9.3 공식 정본 채택

- PR #1의 존재, Vercel preview 성공, 병렬 포트폴리오 100개 완성은 각각 별개다.
- PR merge와 공식 MICA 정본 채택은 저장소 소유자의 결정이다.
- `100/100`을 달성해도 자동으로 공식 카탈로그를 대체하지 않는다.

## 10. Git과 외부 기록 순서

작업 기록의 순서는 항상 다음과 같다.

```text
repo 변경
  -> 로컬 검증
  -> 로컬 commit
  -> commit SHA를 인용한 외부 기록
  -> Notion/Obsidian/사이트 readback
  -> 사용자 승인 뒤 push 또는 배포
```

- 로컬 commit은 controller가 할 수 있다.
- `git push`, 배포, Notion 쓰기, Slack 전송은 기헌의 명시적 승인 뒤에 한다.
- Notion과 Obsidian 기록은 clean-room 입력이 아니다. 기록은 계속하되 동결 전 역할의 package로 되돌리지 않는다.
- Claude UI에서 세션을 삭제했는지는 기록의 완전성을 결정하지 않는다.

### 10.1 기록 표면

| 표면 | 링크 또는 경로 | 용도 |
|---|---|---|
| GitHub 저장소 | <https://github.com/seojoonkim/mica> | 코드와 산출물 |
| 작업 PR | <https://github.com/seojoonkim/mica/pull/1> | 팀 공유와 검토 |
| 진행판 | <https://mica-kiheon-progress.vercel.app/> | 사람이 보는 현재 수치와 후보 |
| Notion 상위 페이지 | <https://app.notion.com/p/3b54b283be4480158da8f4a67e8597a7> | MICA 문서 트리 |
| Notion 운영 허브 | <https://app.notion.com/p/00-MICA-SSOT-3b84b283be44816f8e78dde63590b462> | 최신 상태와 문서 지도 |
| Notion 32번 기록 | <https://app.notion.com/p/32-MICA-48-3bc4b283be44816d8d44d63e3319d324> | 48개 슬롯 전환 기록 |
| Notion kh-b13 기록 | <https://app.notion.com/p/3bf4b283be448111adfbf4c8b2513eb4> | clean-room 역할 분리 실행 기록 |
| Obsidian 운영 노트 | `/Users/kiheon/obsidian/vooy-works/docs/mica-project-ops.md` | 로컬 운영 요약과 링크 허브 |
| Slack | <https://vooy-hq.slack.com/archives/C0BNQ1C55DF/p1786068623857789> | 팀 맥락, 자동 전송 금지 |

## 11. 하지 말아야 할 것

1. 과거 장기 Claude 세션을 신규 source, observation, candidate 저작자로 재사용하지 않는다.
2. 한 컨텍스트가 같은 job의 저작과 의미 검토를 모두 하지 않는다.
3. `Clean Room Current` 링크나 Claude 화면의 세션 개수로 현재 상태를 판정하지 않는다.
4. 동결 후보 57건을 고유 슬롯 57건이라고 보고하지 않는다.
5. 빈 슬롯을 채우기 위해 근거가 지지하지 않는 카테고리로 옮기지 않는다.
6. 이미 가득 찬 카테고리의 추가 후보를 삭제하지 않는다. `category-overflow`로 보존한다.
7. fixture, oracle, failure variant, 채점 내부 장치를 테스트 대상 에이전트에게 공개하지 않는다.
8. 기존 공식 MICA 100개 또는 이전 후보를 신규 저작자에게 보여주지 않는다.
9. 한 단계 완료 후 다음 단계를 자동 시작하지 않는다. controller가 receipt를 확인하고 새 package를 발급한다.
10. commit이 존재하기 전에 Notion이나 진행판에 완료됐다고 기록하지 않는다.

## 12. 주요 문서 지도

| 문서 | 역할 |
|---|---|
| `.claude/skills/mica-scenario-production/SKILL.md` | 현재 실행 계약과 역할별 접근 규칙 |
| `work/method-reviews/2026-08-17-kh-b13-clean-room-run-record.md` | kh-b13 accepted 체인과 SHA 정본 |
| `work/method-reviews/2026-08-14-standard-v1.3.5-implementation-status.md` | v1.3.5 구현 상태 |
| `work/method-reviews/2026-08-14-core20-integrated-state-and-handoff.md` | std-b12 종결과 Core 20 전환 |
| `work/method-reviews/2026-08-14-low-resource-core-20-plan.md` | 저비용 포트폴리오 확정 전략 |
| `work/method-reviews/2026-08-14-measurement-throughput-analysis.md` | 측정 자산 병목과 validator 우선순위 |
| `work/method-reviews/2026-08-14-team-production-manual.md` | 다중 저작자 운영 제안 |
| `work/method-reviews/2026-08-14-core20-annotation-008-handoff.md` | overflow와 annotation 종결 상태 |
| `docs/kiheon-ideation-pilot-15/manifest.json` | 배포 패키지 파일 해시와 크기 결속 |

## 13. Claude Code 새 주 컨트롤러 세션 시작 메시지

아래 메시지와 이 문서 경로를 새 Claude Code 세션에 전달한다.

```text
MICA 신기헌 아이데이션의 주 컨트롤러를 인수하라.

먼저 아래 문서를 끝까지 읽어라.
/Users/kiheon/vooy/mica/work/method-reviews/2026-08-17-claude-primary-controller-handoff.md

그 다음 아래 실행 계약을 읽어라.
/Users/kiheon/vooy/mica/.claude/skills/mica-scenario-production/SKILL.md

저장소는 /Users/kiheon/vooy/mica, 브랜치는 codex/mica-kiheon-pilot-15다.
주 컨트롤러로서 저장소 전체 상태를 재검증하고, 이미 READY인 core20-annotation-009를 먼저 종결하라.

동결 전 의미 역할은 각각 신규 job-packet-only 컨텍스트로 분리하고, 작성자와 검토자를 겸직시키지 마라. 기계 동결과 SHA 계산은 스크립트 우선으로 처리하라. clean-room 역할에 이 인수인계 문서, 기존 후보, 원장, Notion, Slack, Obsidian을 전달하지 마라.

사용자에게 단계별 복사와 세션 중계를 요구하지 말고, 가능한 범위에서 Claude Code의 격리 subagent 또는 신규 context를 controller가 직접 관리하라. 외부 쓰기와 git push는 사용자 승인 전에는 하지 마라.

먼저 수행할 명령은 git 상태, preflight, portfolio validate, portfolio status다. 결과가 문서 스냅샷과 다르면 실제 파일과 검증기 결과를 우선하고 차이를 보고하라.
```

## 14. 인수인계 완료 조건

Claude Code 주 컨트롤러 인수인계는 다음을 만족할 때 완료된 것으로 본다.

1. 이 문서와 현재 skill을 읽었다.
2. preflight와 portfolio validate가 PASS다.
3. `core20-annotation-009`가 중복 실행 없이 먼저 처리된다.
4. annotation 작성자와 검토자의 context가 분리된다.
5. 원장 apply 뒤 새 수치를 commit SHA와 함께 기록한다.
6. 다음 clean-room 배치는 009 종결 뒤 빈 영역 우선으로 별도 발급한다.
7. 사용자는 배치 시작 승인, 외부 공유, push, 배포 같은 결정 지점에서만 개입한다.
