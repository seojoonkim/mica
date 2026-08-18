---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: claude-handoff
scope: core20-annotation-job-series
language: ko
jobs: [core20-annotation-001, core20-annotation-002, core20-annotation-003, core20-annotation-004, core20-annotation-005]
methodRevision: standard-v1.3.5
baseCommit: 42d56cb972a9d1209b7bd4bb7778b88eb1f28dc4
controllerReadbackCommit: e117b514238b86d49b8ecf527ee5f55783560c71
controllerReadbackStatus: job-005-applied-job-006-prepared
---

# Core 20 annotation job 001~005 인수인계

job 005까지 종결한 시점의 누적 기록이다. 슬롯 점유 수치는 각 job `READY.json`의 `availableSlotIdsByCategory` 변화에서 역산했다. 포트폴리오 원장은 계약상 접근 금지이므로 열지 않았고, 원장의 권위는 Codex에 있다.

## Codex controller readback

이 문서는 job 005 산출물이 원장에 적용되기 전 Claude 인수인계 시점에 작성됐다. Codex controller가 job 005 수락 7건을 적용한 뒤 원장 점유 41/100, annotation 수락 41/56을 재현했고, `e117b514238b86d49b8ecf527ee5f55783560c71`에서 후속 job 006을 6건으로 준비했다. 아래 표의 "적용 완료 34 + job 005 대기 7"은 현재 원장 41건의 직전 상태를 설명하는 역사 기록이다.

## 1. 결론부터

**Core 20 목표는 job 003 시점에 이미 넘었다.** 누적 수락 41건이고 그중 34건이 원장에 적용됐다. 남은 문제는 수량이 아니라 **카테고리 커버리지와 라벨 일관성**이다.

## 2. job별 결과

| job | packet | 작성 | 수락 | 거절 | 보류 | 미작성 | confidence |
|---|---:|---:|---:|---:|---:|---:|---|
| 001 | 10 | 10 | 10 | 0 | 0 | 0 | 축 없음 (review v1) |
| 002 | 10 | 9 | 7 | 0 | 2 | 1 | 축 없음 (review v1) |
| 003 | 10 | 8 | 8 | 0 | 0 | 2 | medium 8 |
| 004 | 10 | 9 | 9 | 0 | 0 | 1 | high 1 · medium 8 |
| 005 | 10 | 9 | 7 | 2 | 0 | 1 | high 3 · medium 6 |
| **누계** | **50** | **45** | **41** | **2** | **2** | **5** | |

전 job `validate-job` PASS, `inputBoundaryStatus` clean, `forbiddenInputReads` 0, SlackCalls 0, NotionCalls 0, `nextStageAutoStarted` false.

## 3. 슬롯 점유 (job 005 적용 전 / 후)

| 카테고리 | 적용 완료 | job 005 대기 | 합계 |
|---|---:|---:|---:|
| government-civic | 10 | 0 | **10 (마감)** |
| money-banking-investing | 6 | 0 | 6 |
| shopping-delivery | 4 | 0 | 4 |
| healthcare-administration | 4 | 0 | 4 |
| email-calendar | 2 | 2 | 4 |
| telecom-subscriptions | 2 | 2 | 4 |
| travel-accommodation | 3 | 0 | 3 |
| home-utilities | 0 | 3 | 3 |
| mobility-transit | 2 | 0 | 2 |
| restaurants-local | 1 | 0 | 1 |
| **합계** | **34** | **7** | **41** |

job 005가 적용되면 **점유 0인 카테고리가 사라진다.**

## 4. 라벨 분포 (수락 41행)

| 축 | 값 | 건수 |
|---|---|---:|
| terminationClass | `completed-final-state` | 34 |
| | `approval-handoff` | 5 |
| | `escalation` | 2 |
| | `refusal` | **0** |
| declaredComplexity | `multi-step` | 23 |
| | `cross-session` | 18 |
| | `single-step` | **0** |
| targetSurface | `mixed-surface` | 15 |
| | `identity-gated` | 13 |
| | `web` | 11 |
| | `phone-or-in-person` | 2 |
| | `app-only` | **0** |

`refusal`·`single-step`·`app-only`가 41행 내내 한 번도 쓰이지 않았다. 기존 후보 재고가 전부 다단계 이행 과제라는 뜻이며, annotation으로는 고칠 수 없다. 신규 생산에서만 채워진다.

## 5. Codex 판단이 필요한 항목

### 5.1 종료 유형 병기 구조의 판독 규칙 (최우선)

`canonicalFinalState`가 "무조건 성립하는 완료"와 "조건절로 걸린 안전 인계"를 함께 서술하는 행에서, 어느 쪽이 정본인지 규칙이 없다. **누적 13행**(job 002에서 2, 003에서 5, 004에서 3, 005에서 3)이며, 같은 구조의 행이 서로 반대로 판정된 사례가 실제로 나왔다.

- job 003: `ki-lb1-03`만 둘째 분기(`escalation`)를 택하고 나머지 4행은 첫 분기(`completed-final-state`)
- job 005: `ki-b5-03`은 `completed-final-state`, 거의 같은 모양인 `ki-b7-01`·`ki-b7-02`는 `approval-handoff`

현재는 review v2의 confidence `medium`으로 **표시**되지만 표시는 기록일 뿐 해결이 아니다.

**규칙 후보 두 가지**

(a) 무조건 성립하는 앞 분기를 정본으로 본다
(b) 조건부 분기가 사용자·기관 몫으로 항상 남으면 `escalation` 또는 `approval-handoff`로 본다

**근거**: 같은 문제였던 `declaredComplexity`는 job 005에서 작성자가 "대기 기간이 명시된 재조회만 `cross-session`"이라는 기준을 세우자 즉시 해소됐고, 검토자가 packet 전체 교차 확인으로 일관성을 확인했다. 종료 유형도 규칙 한 줄이면 닫힌다. **규칙을 READY의 `guidanceKo.terminationClass`에 추가할 것을 권고한다.**

### 5.2 카테고리 enum에 렌털을 담을 칸이 없다 (job 005 신규)

job 005의 거절 2건(`ki-b7-01`·`ki-b7-02`)은 렌털 중도해지 과제에 `telecom-subscriptions` 라벨이 본문 근거 없이 붙은 경우다. 의무사용기간·월 임대료·물류비·물품 회수 같은 물리적 렌털 어휘만 있고 통신·디지털 구독을 지지하는 문자 근거가 없다.

검토자가 **대체 카테고리를 제시하지 못했다.** 10개 카테고리 중 어디에도 맞지 않는다. 재annotation해도 갈 곳이 없을 가능성이 크다. 10개 카테고리 체계 자체의 커버리지 문제이므로 Codex·기헌 판단이 필요하다.

### 5.3 행정·공공 서비스로 판정된 후보 4건이 갈 곳이 없다

`government-civic`이 10/10으로 마감된 뒤에도 본문이 그 영역을 지지하는 후보가 계속 나왔다.

| 후보 | job | 사유 |
|---|---|---|
| `KI-P15-015` | 002 | 당시 잔여 슬롯 3개에 후보 4건, 결속이 가장 약해 제외 |
| `CAT0708-TASK-005` | 003 | 마감 |
| `ki-b5-01` | 004 | 마감 |
| `ki-b6-05` | 005 | 마감 |

작성자들은 매번 빈 슬롯이 많은 다른 카테고리로 옮기지 않고 행을 비웠다. **잉여로 남길지, 기존 점유 10건 중 결속이 약한 것과 교체할지는 원장을 보는 Codex의 판단이다.**

### 5.4 보류·거절 4건의 처리

| 후보 | job | 상태 | false 항목 |
|---|---|---|---|
| `KI-P15-014` | 002 | hold | `categorySlot` — `home-utilities` 근거 부족 |
| `KI-L4-001` | 002 | hold | `targetSurfaceProvisional` — `mixed-surface` 확정 불가 |
| `ki-b7-01` | 005 | reject | `categorySlot` — 5.2 참조 |
| `ki-b7-02` | 005 | reject | `categorySlot` — 5.2 참조 |

앞 2건은 재annotation 대상이고, 뒤 2건은 5.2가 해결되기 전에는 재시도해도 같은 결과가 나온다.

### 5.5 작성자 스키마에 불확실성 기록 자리가 없다 (job 001부터 미해결)

검토자 쪽은 review v2의 `confidence`·`uncertaintyNote`로 해소됐다. 그러나 `mica.catalog-annotation/v1`의 15개 필드에는 note 자리가 없어, 매 job마다 작성자가 신고한 대안값이 산출물이 아니라 대화 반환값에만 남는다.

41행이 쌓인 지금은 **어느 라벨을 다시 봐야 하는지 작성자 쪽 기준으로는 알 방법이 없다.** 필드 하나를 지금 넣는 비용이 나중에 41행을 재검토하는 비용보다 훨씬 싸다.

### 5.6 측정 축은 아직 착수되지 않았다

std-b12의 `df-b12-01`~`04`가 열려 있고 저작 중 preflight validator가 없다. 대표 2~3건 자산 저작은 **검증기가 먼저 와야 한다.** 순서가 바뀌면 std-b12가 산출 0으로 끝난 경로를 그대로 반복한다.

## 6. 공정이 지켜진 지점

| 검사 | 결과 | 확인 방법 |
|---|---|---|
| 금지 입력 접근 | 5개 job 전건 0 | job 001에서 controller가 `portfolio-100.json`을 건드린 뒤 계약에 `guidanceKo.inputAccess`가 명문화됐고 이후 재발 없음 |
| 역할 컨텍스트 분리 | 전건 분리 | 작성자·검토자가 job마다 서로 다른 새 컨텍스트. 검토자에게 작성자 근거를 전달하지 않음 |
| 행 SHA 결속 | 45행 전건 재현 | 검토자가 계산한 `annotationRowSha256`을 controller가 독립 계산해 대조 |
| 시각 실측 | 추정 0건 | 두 역할 모두 `date -u` 실측값. 과거 두 번 발생했던 시각 창작 결함 미재발 |
| 수량 강제 | 0건 | 슬롯이 없다는 이유로 다른 카테고리에 밀어 넣은 행 0. 5행이 정직하게 비었음 |
| 외부 호출 | Slack 0 · Notion 0 | 전 CLOSURE에 기록. commit·push·원장 적용 미실행 |

### 역할 독립성의 실증

job 005에서 **첫 거절**이 나왔다. 검토자는 작성자의 근거를 전달받지 않은 별도 컨텍스트인데, **작성자가 스스로 "packet 내 최대 난점"으로 신고한 바로 그 두 행을 독립적으로 잡아냈다.** 작성자의 신고 내용은 검토자에게 전달되지 않았다.

역할 분리가 형식이 아니라 실제로 작동한다는 첫 강한 증거다. job 001의 10/10 accept를 보고 "검토자 기준선이 느슨한가"를 의심했는데, 003의 hold 2건과 005의 reject 2건으로 답이 나왔다.

## 7. 다음 순서

**Codex**

1. job 005 수락 7건 `portfolio-apply` + receipt → 누적 41슬롯
2. 5.1 종료 유형 규칙을 정하고 다음 READY의 `guidanceKo`에 반영
3. 5.2·5.3 거버넌스 판단 (기헌과 함께)
4. 남은 후보 prefilter — 카테고리 커버리지 기준

**Claude Code**

다음 `READY.json`을 기다린다. 새 batch·annotation·측정 자산 작업을 시작하지 않는다.
