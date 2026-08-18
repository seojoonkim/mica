---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: claude-proposal
scope: pr-hygiene-and-multi-author-structure
language: ko
baseCommit: f63d656d4bbaa903b2e392891d2f1fb4dc298bad
relatedPr: https://github.com/seojoonkim/mica/pull/1
priority: 결과물 무결성 > 팀 협업 > 통합 편의
---

# PR 정리와 다중 저작자 구조 제안

job 006 종결 보고, PR #1에서 제외해야 할 항목, 그리고 이 작업을 다른 팀원과 함께 하려면 무엇을 바꿔야 하는지를 한 문서에 담는다. 실행 권한이 Codex에 있는 항목은 그렇게 표시했다.

## 0. job 006 종결 (완료)

| 항목 | 값 |
|---|---:|
| packet | 6 (= maxRows) |
| 작성 | 4 |
| 수락 | 4 |
| 거절 | 0 |
| 보류 | 0 |
| 미작성 | 2 |

- `validate-job` PASS · `packet=6 annotated=4 accepted=4`
- confidence high 2 / medium 2 / low 0
- `forbiddenInputReads` 0 · `inputBoundaryStatus` clean · Slack 0 · Notion 0
- authorContextId `claude-core20-annotation-006-annotator`
- reviewerContextId `claude-core20-annotation-006-reviewer`
- authorOutput `bb7deba1131e6931111c93085099ab476b996829ad70dbb6bbd75730a5ba3284`
- reviewOutput `20ffce002e4620ccb25b36b84d05bb56d37b0bb53be506dff95750ec25fcf139`
- CLOSURE `699b305471f81cb42dae8b27e462df4f8b4b9c6a7ce9ed51a6a9a7341687882a`

수락 4건은 전부 `telecom-subscriptions`(슬롯 04·05·07·08, 결번 06 정확히 회피), 종료 유형 전건 `completed-final-state`.

### 주 성공 경로 규칙이 작동했다

READY에 들어온 `guidanceKo.terminationClass`의 주 성공 경로 기준으로 판정한 결과, **작성자와 검토자가 독립적으로 같은 값에 도달했고 갈린 행이 0이다.** `ki-b8-02`·`ki-b9-02`는 승인 게이트가 굵어 이전 규칙 아래에서는 `approval-handoff`로 갈렸을 구조인데, 양쪽 모두 "승인은 중간 관문, 종착점은 접수 확인·발신 기록"으로 판단했다. 조건절 안전 인계는 실패 복구 분기로 분류해 종료 유형을 바꾸지 않았다.

누적 13행을 갈랐던 축이 규칙 한 줄로 닫혔다.

### 미작성 2건 — 렌털 카테고리 부재가 재현됐다

`ki-b9-01`(수소수 생성기 렌털)·`ki-b9-03`(안마의자 렌털). 작성자가 세 대안을 명시적으로 기각했다.

- `telecom-subscriptions` — 월 요금 계속 계약이라는 기제만 닮았고 통신·디지털을 지지하는 문자 근거가 없음
- `home-utilities` — 집·주거·설치 장소·공과금을 지지하는 문장이 하나도 없음. 가정용 가전이라는 통념으로 메우면 없는 사실을 만드는 것
- `shopping-delivery` — "수거"가 반품 기제와 형태만 닮았을 뿐 구매·배송 근거 없음

검토자도 독립적으로 같은 결론에 도달했다. **직전 인수인계 5.2가 가설이 아니라 재현된 사실이 됐다.** 렌털 계열 후보는 카테고리 체계가 바뀌기 전까지 계속 미작성으로 남는다.

---

## 1. PR #1에서 제외해야 할 항목

PR 자체는 건강하다. 420 파일 +30,902줄이지만 정크·비밀값이 없고 CI가 통과하며 본문도 최신이다. 크기는 15개 배치의 계보를 통째로 보존하는 방식의 자연스러운 결과다. **제외가 필요한 건 두 종류뿐이다.**

### 1.1 std-b11 파킹분 — 배치 파일은 건드리면 안 된다

**정정.** 이 문서 초안에서 `batch-manifest.json`의 `status`를 `parked`로 고치라고 권고했는데, **그 조치는 실행하면 안 된다.** 검증기를 확인한 결과 다음이 성립한다.

- `mica_batch_lifecycle.py:322` — 파킹된 배치의 `resume`은 `checkpoint == _checkpoint(resolved)`를 요구한다
- 저장된 checkpoint에 `HANDOFF.md` 해시(`aca9e8db…`)가 들어 있다. 즉 checkpoint는 `.md`까지 포함한다
- 따라서 **디렉터리 안 어떤 파일이든 추가·수정하면 `parked-checkpoint-mismatch`로 resume이 막힌다.** 상태 파일 수정도, 별도 NOTICE 파일 추가도 마찬가지다

그리고 실제 위험은 처음 판단보다 좁다.

| 확인한 것 | 결과 |
|---|---|
| 기계 기록에 파킹이 남아 있는가 | **있다.** `controller-state.json` → `status: "parked"`, `parkReason` 존재 |
| 원장이 오염되는가 | **아니다.** `mica-portfolio.py:569`가 `manifest.status == "completed"`이고 `closure.status ∈ {completed, zero-accepted}`인 배치만 apply한다. std-b11은 `in-progress`/`open`이라 **이미 구조적으로 제외된다** |

남는 문제는 하나뿐이고 성격이 다르다. **`HANDOFF.md` 첫머리가 `PARKED-READY-FOR-CLAUDE-RESUME`이다.** 의미 관문 실패로 중단된 배치를 "재개 준비 완료"로 광고한다. `controller-state.parkReason`도 최초 인계 사유(`Claude Code production handoff…`)만 남아 있고, 이후의 실제 중단 사유(`ob-b11-01`의 근거 확장, `ob-b11-02`의 원문 밖 인과 서술, observation review가 둘 다 놓치고 전건 accept)는 배치 안에 없다.

**따라서 수정은 배치 바깥에서 한다.**

(a) **PR 본문에 std-b11 문단을 추가한다** — 이 배치는 의미 관문 실패로 중단된 회귀 자료이며 재개 대상이 아니라고 명시하고, 중단 사유 문서(`work/method-reviews/2026-08-13-std-b11-source-gate-codex.md`, `…-observation-gate-codex.md`)를 링크한다. **권고안이다.** 배치 무결성을 건드리지 않고 읽는 사람의 오해만 정확히 막는다.

(b) PR에서 std-b11 19개 파일을 빼고 `codex/std-b11-parked` 브랜치에만 둔다. 실패 기록이 공개 계보에서 사라지므로 권고하지 않는다.

어느 쪽이든 **`work/mica-scenario-batches/std-b11/` 안의 파일은 한 바이트도 바꾸지 않는다.**

### 1.2 하네스 전용 자산 84건 — 이미 공개돼 있다 (거버넌스 결정)

`seojoonkim/mica`는 **공개 저장소**이고, 브랜치가 이미 푸시돼 있어 **머지 여부와 무관하게 지금 공개 접근이 된다.** 미인증 요청으로 확인했다.

```
curl -sI https://raw.githubusercontent.com/seojoonkim/mica/codex/mica-kiheon-pilot-15/work/mica-scenario-batches/std-b9/measurement-contracts.jsonl
→ 200
```

PR에 포함된 `fixture.json`·`oracle.json`·`eligibility.json`·`reset.json`·`measurement-contracts.jsonl`이 84건이다. main에는 아직 0건이지만 브랜치에는 전부 있다.

방법론은 `harness-private`을 "런타임에서 반드시 숨긴다"로 정의하고, 운영 계약 §2-11이 "future public core와 private holdout의 저장·export 분리"를 Codex 소유로 명시했다. **그 분리가 구현되기 전에 오라클이 먼저 공개된 순서다.**

**되돌릴 수 없다는 점을 먼저 인정해야 한다.** 히스토리 재작성은 파괴적이고, 이미 크롤링됐을 가능성을 되돌리지 못한다. 그래서 제안은 삭제가 아니라 **재정의**다.

> 지금까지의 15개 배치를 **public core(공개 개발셋)**로 선언한다. 오염 가능성을 전제로 하고, 이 집합의 성적을 대표 수치로 보고하지 않는다. 그리고 **holdout은 여기서 처음부터 분리해 새로 만든다.**

공개 dev set + 비공개 test set은 벤치마크의 표준 구성이며, v1.3.5가 이미 쓰고 있는 언어와 일치한다. 잃는 것은 "기존 52건을 대표 성적에 쓸 수 있다"는 가정 하나이고, 얻는 것은 **앞으로 만드는 모든 것이 오염되지 않는다**는 보장이다.

이 선택은 서준님과의 거버넌스 결정이다. Claude Code는 PR 본문 수정·push·머지를 하지 않는다.

---

## 2. 다중 저작자 구조 제안

우선순위: **결과물 무결성 > 팀 협업 > 통합 편의.** 아래는 그 순서로 배치했다.

### 2.1 지금 구조가 팀에서 깨지는 지점

현재 clean-room은 **구조가 아니라 규율로** 지켜진다. 내가 역할 프롬프트를 쓰고 READY가 입력을 제한하기 때문에 성립한다. 사람 팀원이 합류하면 다음이 즉시 깨진다.

| 깨지는 것 | 왜 |
|---|---|
| 저작 오염 비반증성 | 팀원이 GitHub를 훑는 순간 기존 후보·공식 카탈로그·comparison·오라클을 본다. 그 뒤 저작한 것이 오염되지 않았음을 **증명할 방법이 없다** |
| 노출면 경계 부재 | `agent-visible`·`evaluator-visible`·`harness-private`은 같은 디렉터리 안 파일의 **라벨**일 뿐이다. 저장 경계도 권한 경계도 아니다 |
| 귀속 추적 불가 | 모든 것이 `origin: kiheon-ideation`이다. 누가 무엇을 어떤 접근 상태에서 저작했는지 사후 감사가 안 된다 |
| 동시성 충돌 | 두 사람이 동시에 생산하면 배치 ID와 슬롯이 충돌한다 |
| 자기심사 | 사람은 역할 이름만 바꿔 자기 것을 검토하기가 더 쉽다 |

가장 큰 것은 첫 줄이다. 이 방법론의 핵심 주장이 **"공식 카탈로그를 발상 seed로 쓰지 않았다"**인데, 팀원 한 명이 리포를 클론하는 순간 그 주장이 그 사람 기여분에 대해 소급 무효가 된다.

### 2.2 핵심 이동 — 저장소를 클론하지 않고 job 디렉터리만 받는다

**우리는 이미 답을 만들어 뒀다.** `work/mica-scenario-exchange/<job-id>/`가 그것이다. 런타임 간 인계용으로 만들었지만 실체는 **clean-room 작업 지시서 시스템**이다.

```
<job-id>/
  READY.json          이 job에서 볼 수 있는 것의 전부 + 금지 목록 + 출력 계약
  INPUT-MANIFEST.json 허용 파일별 경로·바이트·SHA-256
  packet.jsonl        허용된 입력만
  *.staging.jsonl     산출물
  CLOSURE.json        읽은 입력 실측 SHA, 컨텍스트 ID, 경계 위반 수
```

annotation job 6회에서 이 패턴이 실제로 작동했다. 금지 입력 접근 0회, 입력 SHA 전건 재현, 역할 컨텍스트 분리 전건, 수량 강제 0건. **저작(authoring) job으로 확장하면 그대로 사람 팀원에게 쓸 수 있다.**

> **원칙: 저작자는 리포를 클론하지 않는다. job 디렉터리 하나만 받는다.**

이것이 clean-room을 약속에서 물리적 사실로 바꾸는 유일한 이동이다. 팀원은 볼 수 없는 것을 애초에 손에 쥐지 않는다.

### 2.3 저장 경계를 노출면에 맞춘다

라벨 3종을 **저장소 3종**으로 승격한다.

| 노출면 | 위치 | 접근 |
|---|---|---|
| `agent-visible` + 방법론 + 검증기 + 진행판 | `seojoonkim/mica` (PUBLIC) | 누구나 |
| `evaluator-visible` + `harness-private` (동결 후보 본문, comparison, annotation, fixture·oracle·eligibility·reset·contracts) | 신규 비공개 리포 (예: `mica-harness`) | 하네스 유지자만 |
| holdout | 별도 비공개 경로 | **저작자 전원 접근 불가** |

기존 84건은 §1.2에 따라 public core로 남기고, **신규 생산분부터 이 경계를 적용한다.**

슬롯 원장은 공개 쪽에 **수치만** 둔다. 카테고리별 점유 수는 공개해도 되지만 어느 후보가 어느 슬롯인지는 저작자에게 힌트가 된다. 지금 READY의 `availableSlotIdsByCategory`가 정확히 그 방식이다. 이미 맞게 하고 있다.

### 2.4 저작 오염을 사후 감사 가능하게 만든다

산출 행에 접근 프로파일을 결속한다.

- `authorId` — 사람·런타임 식별자
- `authorAccessProfile` — 저작 시점에 그 저작자가 접근 가능했던 범위(`job-packet-only` / `public-core-read` / `harness-maintainer`)
- CLOSURE의 읽은 입력 실측 SHA 목록 (이미 있다)

그러면 오염 여부가 **가정이 아니라 기록**이 된다. 나중에 "이 후보는 public core를 본 사람이 만들었나"를 물으면 답할 수 있다. 이 필드가 없으면 의심이 생겼을 때 전수 재작업 외에 방법이 없다.

### 2.5 역할을 사람 사이로 벌린다 — 이건 개선이다

방법론은 이미 저작자 ≠ 검토자를 요구한다. 팀에서는 이를 **다른 사람**으로 못박는다.

- 의미 관문(source review, observation review, candidate review, annotation review)의 검토자는 저작자와 **다른 사람**이어야 한다
- `authorContextId`·`reviewerContextId`에 사람과 런타임을 함께 기록한다
- controller는 같은 사람이 두 역할을 선점하면 `assign-role`에서 차단한다 (지금 컨텍스트 중복 차단과 같은 자리)

한 사람이 두 에이전트 컨텍스트를 돌리는 현재보다 **독립성이 실제로 올라간다.** 팀 확대가 무결성에 기여하는 유일한 지점이며, 여기를 살려야 한다.

### 2.6 동시성

- **배치 ID를 사람으로 네임스페이스한다.** `std-b13` → `kh-b13` / `sj-b1` / `<이니셜>-b<n>`
- **슬롯은 controller만 발급한다.** 저작자가 고르지 않고 READY의 가용 목록에서만 선택한다. 지금 방식 그대로다
- 한 활성 job의 같은 artifact path는 한 사람만 쓴다 (현행 규칙 유지)

### 2.7 통합 경로 — 기헌은 PR 제출까지

```
팀원  →  job 디렉터리 수령 → staging 산출물 + CLOSURE 작성 → 정지
Codex →  기계 검증(SHA·schema·역할·수량) → 수락분만 원장 적용
기헌  →  배치 단위 PR 제출
서준  →  머지
```

**팀원은 `seojoonkim/mica`에 push 권한이 필요 없다.** 공개 리포에서 이게 더 안전하고, 기헌의 역할(PR 제출까지)과도 정확히 맞는다.

**PR 단위를 쪼갠다.** 현재 420 파일 PR은 "파일럿 + 방법론 baseline"으로 닫고, 이후에는 **종결 배치 1개 = PR 1개**로 간다. 이유 세 가지: 서준님이 실제로 검토할 수 있고, 문제가 생겨도 한 배치에 격리되며, 머지 결정이 작아진다.

### 2.8 팀원 온보딩에 필요한 것

새 팀원이 첫날 받아야 하는 것은 리포 접근이 아니라 이 셋이다.

1. **방법론 문서**(공개) — 왜 이렇게 하는지
2. **역할 계약 한 장** — 당신은 무엇을 보고 무엇을 보지 않는가, 무엇을 쓰는가
3. **job 디렉터리 하나** — 실제 작업

리포 클론을 요청받으면 그것 자체가 경계 위반 신호다.

---

## 3. 실행 순서 제안

| 순서 | 항목 | 주체 |
|---|---|---|
| 1 | std-b11 `status`를 `parked`로 정정 (§1.1) | Codex |
| 2 | public core / holdout 분리 선언 — 기존 15배치를 public core로 확정 (§1.2) | 서준·기헌 거버넌스 |
| 3 | 비공개 하네스 리포 생성, 신규 생산분부터 적용 (§2.3) | Codex |
| 4 | 저작 job 계약 작성 — annotation job READY를 저작용으로 확장 (§2.2) | Codex |
| 5 | `authorId`·`authorAccessProfile` 필드 추가 (§2.4) | Codex |
| 6 | 배치 ID 네임스페이스·사람 단위 역할 분리 규칙 (§2.5·2.6) | Codex |
| 7 | PR 단위 분할 — 이번 PR을 baseline으로 닫고 이후 배치 1개 = PR 1개 (§2.7) | 기헌 |

1·2는 이번 PR 머지 전에 끝나야 한다. 3~6은 다음 신규 생산 배치 착수 전에 필요하다. 7은 이번 PR이 닫힌 뒤부터 적용한다.

## 4. 하지 않은 것

Claude Code는 PR 본문 수정, push, 머지, 배치 파일 수정, 원장 적용을 하지 않았다. 위 항목 중 어느 것도 실행하지 않았고 제안만 남긴다. 실행에는 각 항목의 주체 판단이 필요하다.
