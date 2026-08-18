---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: claude-review-complete
scope: low-resource-core-20-review
language: ko
verdict: MODIFY
respondsTo: work/method-reviews/2026-08-14-low-resource-core-20-plan.md
respondsToSha256: 0445b9618965207dccc55426e43a784235ecbfafc569ebdaff1e35d25e00bc64
---

# 저비용 Core 20 계획 — Claude Code 검토

읽기 전용 검토. 코드·방법론·배치·사이트 미수정, 신규 배치 미시작, commit·push·Notion·Slack 없음. 대상 문서 SHA-256 대조 일치 확인 후 검토했다.

## 판정: MODIFY

방향은 타당하다. 측정 설계를 임계경로에서 빼는 것이 공식 방법론과 충돌하지 않고, 절감 목표도 근거가 있다. **다만 착수 전에 blocking 3건을 고쳐야 한다.**

---

## Q1. `measurement-designed` 제외가 공식 방법론과 충돌하는가 — 충돌하지 않는다

두 가지를 구분해야 한다.

| | 공식 `measurement` 필드 | 우리 `measurement-designed` |
|---|---|---|
| 내용 | 이 과제가 **어떻게 채점되는지**의 계약(accuracy 기준 2~8개, speed clock, timeout) | fixture·reset·eligibility·variant·oracle·합성시계 전체 simulator 자산 |
| 공식 요구 | **모든 레코드에 필수**(candidate 포함) | 요구하지 않음 |
| 승격 조건 | `references.status`가 `calibration-pending`이 아닐 것 | 해당 없음 |

`src/lib/schema.ts`의 주석이 명시한다 — *"Required for every record, including candidates: a task that cannot say how it would be scored is not a task definition. A candidate may hold calibration-pending references."*

즉 공식이 요구하는 것은 **"어떻게 채점될지 말할 수 있는가"**이지 **"simulator 자산을 다 만들었는가"**가 아니다. 계획이 빼는 것은 후자이므로 충돌하지 않는다. std-b12에서 산출을 0으로 만든 것도 후자였다.

다만 이 구분 때문에 Q2의 누락이 생긴다.

---

## Q2. 공개 시점 필수 필드 누락 — 있다

### 연구 포트폴리오 목적에는 충분하다

v1.3.5 수렴에 따라 연구 100은 공식 100을 자동 교체하지 않으므로, slot ledger가 공식 스키마를 만족할 의무는 없다.

### 공식 표면에 닿는 순간 필요한 것 (누락)

`baseCanonicalTaskSchema`가 **모든 레코드에 필수**로 요구하는데 §2 annotation 목록에 없는 것:

1. **`measurement`** — Q1의 그 필드. `calibration-pending`이어도 되지만 **존재는 해야 한다.** Core 20 annotation에 채점 계약이 한 줄도 없으면, "채점 방법을 말할 수 없는 정의"가 20개 생긴다.
2. **`markets`** (countryCode 배열, min 1) — `marketApplicability`와 다른 필드다. 전자는 "어느 시장 에디션 소속인가", 후자는 "각 시장에서 적용 가능한가"다.
3. **`translations.ko`와 영문 원문** — 공식 표면은 EN+KO다. 우리 후보는 한국어 전용이라 `title`·`finalState`·`confirmationBoundary`의 영문 짝이 없다.
4. **`title`** — 우리는 `label`을 쓴다. 매핑 규칙 필요.

`lifecycle`·`taskSet`은 default가 있어 문제없다.

**권고**: Core 20 annotation에 최소한 `measurementIntent`(2~3문장, 무엇을 성공으로 볼지 + 어떤 readback으로 확인할지)를 추가한다. 이는 상세 자산이 아니라 공식 `measurement`가 요구하는 "말할 수 있음"의 최소 충족이며, 나중에 자산으로 확장하는 seed가 된다. 나머지 3건은 공식 매핑 시점에 필요하다는 사실만 계획에 명시하면 된다.

---

## Q3. compact packet이 의미 판정에 충분한가 — 부족하다 (blocking)

annotation 5개가 무엇에 의존하는지 대조하면 한 필드가 결정적으로 빠져 있다.

| annotation | 필요한 근거 | packet에 있는가 |
|---|---|---|
| `terminationClass` | finalState + approvalBoundary + failureRecoveryEvents | ✅ |
| `declaredComplexity` | **taskAction**(몇 단계·세션을 걸치는 행동인가) | ❌ |
| `targetSurface` | **taskAction**(어떤 채널을 거치는가) | ❌ |
| `expectedDiagnosticAxes` | **taskAction**(어떤 메커니즘을 시험하는가) | ❌ |
| `marketApplicability` | marketScope + unknowns | 부분(`unknowns` 없음) |

**`taskAction`이 없다.** 동결 후보에는 있는 필드다(`startState`·`taskAction`·`canonicalFinalState` 3종). 시작 상태와 최종 상태만 주고 "몇 단계인가", "어떤 표면인가", "어떤 축을 시험하는가"를 물으면 **annotator가 추론으로 채우게 된다.** 이는 이 방법론이 반복해서 실패해 온 지점이다(df-b11-02, df-b12-05).

**권고**: packet에 `taskAction`과 `unknowns`를 추가한다. 두 필드는 짧고 토큰 비용이 작다.

---

## Q4. 4~6시간·60~75% 절감 추정 — 시간은 낙관적, 절감은 타당

### 시간: 문서 내부가 어긋난다

§7 표의 합계는 **270~455분 = 4.5~7.6시간**(신규 생산 제외)인데 본문은 "4~6시간"이라 적었다. 상한이 표와 맞지 않는다.

가장 낙관적인 항목은 **v1.3.5 최소 schema·validator 1.5~2.5시간**이다. 여기에는 slot ledger + annotation schema + review 결속 + portfolio apply + SHA 자동 도출 + validate 대조 + 회귀가 들어간다. `closingShaLedger` 패치 하나만 해도 closure 작성 경로·validate-batch·테스트 세 곳을 건드린다.

**권고**: 표와 본문을 일치시키고 **6~9시간**(신규 생산 제외)으로 잡는다. 하한을 지키려면 §10의 축소 조건("validator가 3시간을 넘기면 annotation validator와 slot ledger만 남긴다")을 처음부터 기본값으로 두는 편이 낫다.

### 절감: 60~75%는 타당하며 오히려 보수적일 수 있다

std-b12 실측 기준, 측정 단계(자산 저작 1504s + oracle 920s + 측정 검토 926s = 3350s)가 전체 에이전트 시간 6934s의 **약 48%**였고, 산출물 크기로는 자산 103KB + oracle 53KB + 검토 ~40KB로 배치 산출의 대부분이었다.

20건 중 17~18건에서 이 단계를 제거하고, 나머지를 compact packet 10건씩 2회로 처리하면 60~75% 절감은 달성 가능하다.

---

## Q5. Core 20 전에 반드시 고쳐야 할 std-b12 결함 — `closingShaLedger` 외에 없다. 그러나 별개 blocker가 둘 있다

### df-b12-01~04는 Core 20을 막지 않는다

넷 다 **측정 자산** 결함이고 Core 20은 측정 자산을 만들지 않는다. §5의 preflight validator 최소 검사 목록이 이미 넷을 정확히 덮고 있다(동시 성립·terminal 도달·worstPath 일치·판정 클래스 단일성·금지 상태 결속 근거). **대표 2~3건 작업 전에는 반드시 선행**이며, 그때까지는 미결로 두어도 된다.

### 다만 std-b12 결함 목록 밖에서 두 blocker가 남아 있다

앞선 v1.3.5 검토(`2026-08-13-standard-v1.3.5-claude-final-response.md`)에서 제기한 O1·O2가 이 계획에서 여전히 미해결이다.

**B2. slot ledger·annotation ledger의 저장 위치와 원장 기록 경로가 정해지지 않았다.**
`_validate_recorded_artifacts`는 배치 디렉토리의 비어 있지 않은 모든 `.json`/`.jsonl`이 `artifactShaLedger`에 있어야 `resume`을 통과시킨다. 두 원장은 어느 역할의 `complete-role`에도 귀속되지 않으므로, 배치 안에 두면 std-b11의 df-b11-03과 같은 차단이 재발한다. 배치 밖(리포 레벨)에 두거나 `record-artifact` 허용 목록을 확장해야 하며, **파일을 쓰기 전에 정해야 한다.**

**B3. annotation 역할이 role claim 체계에 없다.**
§4는 annotation을 Claude, review를 Codex로 나눠 런타임 수준 독립은 확보했다. 그러나 `catalogAnnotator`·`catalogAnnotationReviewer`가 `roles`에 등록되지 않으면 컨텍스트 재사용 차단이 작동하지 않아 독립성이 문서상 약속에 그친다.

---

## 수정 요구 정리

### Blocking (착수 전)

| # | 항목 | 근거 |
|---|---|---|
| B1 | compact packet에 `taskAction`·`unknowns` 추가 | annotation 5개 중 3개가 메커니즘에 의존하는데 packet에 없다 (Q3) |
| B2 | slot ledger·annotation ledger의 저장 위치와 원장 기록 경로 확정 | 배치 안에 두면 resume 차단 재발(df-b11-03 계열) |
| B3 | `catalogAnnotator`·`catalogAnnotationReviewer`를 정식 역할로 등록 | 미등록 시 컨텍스트 재사용 차단 미작동 |

### Non-blocking (병행 가능)

| # | 항목 |
|---|---|
| N1 | Core 20 annotation에 `measurementIntent`(2~3문장) 추가 — 공식 `measurement`의 "말할 수 있음" 최소 충족 |
| N2 | `markets`·`translations`(EN 짝)·`title` 매핑은 공식 표면 매핑 시점에 필요하다는 사실을 계획에 명시 |
| N3 | §7 표 합계와 본문 추정 불일치 정정, 6~9시간으로 조정 |
| N4 | `expectedDiagnosticAxes`를 Core 20 필수에서 optional로 — 앞선 수렴(D)은 이를 measurement design 단계에 배치했고, 측정 설계를 임계경로에서 빼면서 이 필드만 annotation으로 올리면 근거 없는 라벨이 된다 |
| N5 | §10의 "validator 3시간 초과 시 축소"를 예외가 아니라 기본 계획으로 |

---

## 그대로 유지할 것

- 측정 설계를 core slot 점유에서 분리 — 공식 계약과 충돌하지 않고 std-b12 병목을 정확히 겨냥한다.
- `blocked`/교체 규칙 — raw 20이 아니라 accepted unique slot 20을 세는 것이 옳다.
- §5의 preflight validator 최소 검사 8종 — df-b12-01~04를 정확히 덮는다.
- §6 `closingShaLedger` 자동 도출·대조 — df-b12-05의 정확한 처방이다.
- §9 보고 수치 분리와 *"raw candidate 56을 slot 56개 완성으로 표현하지 않는다"* — 필수다.
- §8의 "같은 자료를 여러 독립 모델에 반복 입력하지 않는다" — 다만 **독립 검토가 필요한 판정에는 적용하지 말 것.** 비용 절감이 역할 독립성을 잠식하면 std-b11의 의미 관문 실패가 재발한다.
