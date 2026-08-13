# 저장소 내 에이전트 제작 계약

## 목적

이 계약은 특정 컴퓨터나 개인 에이전트 설치 없이, 이 저장소를 clone한 팀원이 Codex 또는 Claude Code에서 다음 MICA 시나리오 배치를 재현하기 위한 최소 실행 계약이다. 현재 15건은 방법의 중간 검증 결과이며 다음 배치의 발상 입력이 아니다.

## 자동 발견 위치

- Codex: `.agents/skills/mica-scenario-production/SKILL.md`
- Claude Code: `.claude/skills/mica-scenario-production/SKILL.md`

저장소 루트에서 각 도구를 시작하면 프로젝트 스킬로 발견된다. 개인 홈 디렉터리 복사, 환경변수, 절대경로, 별도 저장소 설치는 필요하지 않다. 새 디렉터리가 현재 세션에 보이지 않으면 도구를 한 번 다시 시작한다.

## 호출

- Codex: `$mica-scenario-production <batch-id>`
- Claude Code: `/mica-scenario-production <batch-id>`
- 공통 사전검사: `python3 scripts/mica-scenario-production.py preflight`
- 프로필 안내: `python3 scripts/mica-scenario-production.py profiles`

## 시작 전 프로필 선택 계약

- 에이전트는 배치를 만들기 전에 아래 두 방식의 작업량·예상 시간·필요 자원을 사람에게 먼저 안내한다.
- 사용자가 이미 프로필을 지정했다면 안내 뒤 진행하고, 지정하지 않았다면 하나를 추천한 뒤 선택을 기다린다.
- 선택값은 `standard` 또는 `lean`이며 `batch-manifest.json`과 `closure.json`에 기록한다.
- 표준은 [`methodology.md`](./methodology.md), Lean은 [`methodology-lean-v1.md`](./methodology-lean-v1.md)를 실행 기준으로 사용한다.
- 프로필 필드가 없던 기존 v1 배치는 `legacy-v1`로 계속 구조 검증할 수 있지만, 새 배치는 반드시 두 프로필 중 하나를 명시한다.

| 방식 | 배치 상한 | 1회 예상 | 역할·동시 실행 | 모델 자원 | 선택 기준 |
|---|---:|---:|---|---|---|
| 표준 `standard` | 5건 | 6–12시간 | 15개 역할 경계, 동시 2–3개 | 의미 역할 high/xhigh 중심 | 첫 재현·방법 변경·고위험·결함 또는 판정 충돌 |
| 압축 `lean` | 3건 | 3–5시간 | 15개 역할 경계, 동시 최대 2개·정형 단계 저비용 실행 | 정형 medium·의미 high·예외만 xhigh 이상 | 계약이 안정된 후속 배치와 빠른 중간 공유 |

두 시간값은 계획 추정이며 자료 접근, 거절과 재작업에 따라 달라진다. Lean도 역할 독립성, accepted-only freeze, 사후 대조, measurement 관문을 생략하지 않는다.

## 공통 운영 기준

- 순서 의존 단계는 병렬화하지 않는다.
- 구조·해시·역할·건수 검사는 두 방식 모두 전수 실행한다.
- Lean의 의미 재검토만 새 항목·변경 항목·고위험 항목에 집중한다.
- 역할별 허용 입력과 출력은 `batch-manifest.json`의 `roleInputAllowlist`와 `roleOutputContract`로 고정한다. controller는 `role-briefing` 출력만 역할에 전달하고 수동 문구로 입력을 추가하지 않는다.
- 신규 배치는 커밋된 방법 revision과 파일별 SHA-256을 `methodLock`에 기록하고 `validate-ready`를 통과하기 전까지 생산하지 않는다.
- `validate-ready` 통과 뒤 controller는 `mica-batch-control.py claim`으로 기본 180분 OS 시각 기반 lease를 얻고 만료 전 `renew`한다. 각 역할은 산출물을 쓰기 전에 `assign-role`로 실제 context ID와 현재 세대의 채택 토큰을 선점하고, 종료 시 같은 토큰을 `complete-role`에 제출해 파일 mtime 기반 원장과 모델 기록을 닫는다.
- 세션을 넘길 때는 미완료 역할을 명시적으로 abandon하고 `park`가 만든 전수 SHA checkpoint와 사람 지시 참조를 `resume`이 함께 검증한다. 연결된 다른 세션의 요약이나 전달문만으로 controller 소유권을 바꾸지 않는다.
- 진행 중인 배치에는 방법 변경을 소급하지 않는다. 결함은 원장에 남기고 다음 배치 revision에서만 반영한다.
- 한 활성 배치의 같은 artifact path는 한 런타임만 쓴다. 각 reviewer는 controller가 확정한 입력 SHA-256을 시작 전·쓰기 직전·완료 후 확인한다.
- 입력 SHA-256이 바뀐 review는 결과 수량에서 제외하고 stale evidence로 격리한다.

## 런타임 책임

- Codex는 결함 분석, 방법·검증 도구 수정, 회귀 검사, revision 커밋과 다음 빈 배치 동결을 맡는다.
- Claude Code는 동결된 revision으로 독립 역할 생산을 실행하고 defect ledger와 closure를 반환한다.
- Codex는 신규 후보의 의미 원문을 대신 고치지 않고, Claude Code는 배치 도중 방법 파일을 고치지 않는다.
- 세부 운영·교차 검토 규칙은 [`codex-claude-operating-model.md`](./codex-claude-operating-model.md)를 따른다.

## 공정 상태

| 단계 | 산출물 | 다음 단계 조건 |
|---|---|---|
| source | `source-evidence.jsonl` | 독립 reviewer가 범위·한계 수락 |
| observation | `need-observations.jsonl` | 독립 의미 검토 수락 |
| frozen observation | `frozen-observations.jsonl` | accepted-only 집합 |
| task candidate | `task-candidates.jsonl` | 독립 후보 검토 수락 |
| frozen candidate | `frozen-candidates.jsonl` | accepted-only 집합 |
| comparison | `comparison.jsonl` | 동결 뒤에만 기존 과제 대조 |
| measurement | `measurement-contracts.jsonl` | fixture·reset·eligibility·oracle 결속, 상태는 `designable-pending-exposure` |
| exposure | `agent-visible.jsonl`, `blind-agent-rehearsal.jsonl` | 공개 입력의 정적 누출 검사와 블라인드 리허설을 모두 통과해야 `designable` 확정 |
| close | `defect-ledger.jsonl`, `closure.json` | 수량보다 결함·한계 보존 |

## 입력 방화벽

작성 전 허용 입력은 독립 1차 자료와 그 자료의 bounded evidence뿐이다. need writer와 translator에게 다음을 제공하지 않는다.

- `docs/kiheon-ideation-pilot-15/candidate-specs.json`
- 기존 MICA 100개 과제와 사이트 과제 문안
- 이전 후보·거절·holdout·comparison 결과
- 카테고리별 부족 수나 목표 슬롯

controller도 역할별 입력 목록을 `batch-manifest.json`에 기록한다. 금지 입력이 노출되면 결과를 수정해 살리지 않고 배치를 닫은 뒤 새 컨텍스트로 다시 시작한다.

source reviewer는 7개 기준을 정확히 기록하며 `limitationsHonesty`를 생략할 수 없다. source·observation review는 필수 기준이 전부 pass일 때만 accept다. 같은 배치의 기존 review를 controller나 작성자가 수정하지 않으며, 재판정은 다음 배치의 새 독립 reviewer가 새 review 행으로 남긴다.

## 기본 필드

### bounded source evidence

`origin`, `evidenceId`, `sourceTitle`, `publisher`, `sourceUrl`, `retrievedAt`, `sourceLocation`, `boundedObservation`, `populationAndScope`, `knownLimits`, `reviewerContextId`

### need observation

`origin`, `observationId`, `sourceRefs`, `burdenBearer`, `affectedParty`, `contextOrTrigger`, `currentState`, `desiredStateChange`, `unresolvedConsequence`, `evidenceStatus`, `marketScope`, `authorContextId`

### task candidate

`origin`, `candidateId`, `sourceObservationIds`, `label`, `userRequest`, `startState`, `taskAction`, `canonicalFinalState`, `confirmationBoundary`, `prohibitedStates`, `failureRecoveryEvents`, `unknowns`, `translatorContextId`

### measurable candidate

동결 후보에 `comparisonVerdict`, `executionTrack`, `fixtureRefs`, `resetRef`, `attemptEligibilityRef`, `oracleRef`, `measurementDecision`, `measurementReviewerContextId`가 결속된 상태다. `designable`은 실제 실행 성공이나 시장 성립을 뜻하지 않는다.

## 실행 노출면 계약

상세한 후보 명세와 측정 자산은 피측정 에이전트의 프롬프트가 아니다. 실행 전에 후보별 내용을 다음 세 묶음으로 나눈다.

### `agent-visible`

- `userRequest`: 일반 사용자가 말할 법한 1~2문장
- `userKnownConstraints`: 사용자가 알고 직접 제공한 조건만
- `commonSafetyPolicy`: 승인 필요 행동과 공통 금지 행동
- `allowedTools`: 이번 실행에서 사용할 수 있는 도구 범위

### `evaluator-visible`

- `startState`, `taskAction`, `canonicalFinalState`
- `confirmationBoundary`, `prohibitedStates`, `failureRecoveryEvents`
- 권위 있는 readback과 안전 인계 요약

### `harness-private`

- fixture의 계정·서비스 상태와 정상·실패·복구 variant
- deterministic reset과 fail-closed eligibility
- full oracle, probe, token registry, event ID, canary, tick·비용 계산

실행기는 `agent-visible`만 피측정 에이전트에게 전달한다. `candidate-specs.json`, `task-candidates.jsonl`, `frozen-candidates.jsonl`, comparison, measurement assets는 런타임에서 읽을 수 없어야 한다. 공개 저장소에 파일이 있더라도 실행 sandbox의 허용 경로에서 제외한다.

에이전트는 자연어 요청에 답하고 허용 도구를 사용한다. 내부 JSON schema·판정 레코드·probe·event ID·token registry 생성은 요구하지 않는다. 하네스가 도구 호출, 외부 상태, 최종 응답을 원자료로 보존하고 평가 레코드로 파생한다.

measurement review 뒤 별도 컨텍스트의 `blind-agent rehearsal`을 수행한다. 이 역할은 `agent-visible`만 받고 정답 단서 없이 합리적인 수행 또는 안전 인계 경로가 존재하는지 확인한다. 실제 도구 실행 여부나 한 모델의 성공·실패를 성능 표본으로 사용하지 않는다. measurement reviewer는 리허설 기록과 비공개 계약을 대조해 누출, 특정 문구·구현 순서 강제, 숨은 파일 접근 가능성이 없을 때만 `designable`을 확정한다.

새 `v5` 배치는 이 경계를 파일로 고정한다. `agent-visible.jsonl`의 각 행은 `origin`, `schemaVersion`, `batchId`, `candidateId`, `userRequest`, `userKnownConstraints`, `commonSafetyPolicy`, `allowedTools`, `preparedByContextId`만 가진다. `blind-agent-rehearsal.jsonl`은 공개 행 원문 SHA-256, 독립 context ID, 요청 이해 여부, 성공 또는 안전 인계 가능성, 숨은 정보 필요 여부, 특정 구현 순서 강제 여부, 숨은 경로 접근 여부와 이분 verdict를 기록한다. v5는 여기에 `assessmentMode=instruction-sufficiency`, 실제 실행 관측 여부 `false`, 성능 추론 허용 여부 `false`, 경로 존재성 근거를 결속한다. 기존 `v3`·`v4` 배치는 역사적 검증 대상으로 유지하고 새 필드를 소급하지 않는다.

controller는 종료 전에 다음을 실행한다.

```bash
python3 scripts/mica-scenario-production.py validate-exposure \
  work/mica-scenario-batches/<batch-id>
```

이 명령은 공개 입력의 내부 필드·채점 식별자 누출, 공개 행 해시 불일치, 리허설 역할·판정 불일치, 측정 후보 집합 누락을 거부한다. PASS는 실행 성능이나 시장 성립이 아니라 입력 방화벽과 리허설 기록의 구조적 완결만 뜻한다.

## 독립성

한 컨텍스트에서 생성과 검토를 함께 하지 않는다. 도구가 격리된 하위 에이전트를 제공하지 않으면 별도 채팅을 사용한다. reviewer는 작성자의 대화 요약이나 의도를 받지 않고 고정 산출물과 계약만 받는다. comparator 결과를 다음 작성자에게 되돌리지 않는다.

custodian은 controller의 기계적 대행 역할이 아니다. 작성자·reviewer와 다른 context에서 accepted row 원문 전체의 SHA-256을 결속한다. 후보와 측정 자산은 실제 사업자명 대신 기능적 권위 역할 또는 합성 식별자를 사용한다.

## 판정

- 수락은 모든 필수 기준이 통과할 때만 가능하다.
- 거절 원문과 review는 보존한다. 현재 배치에서 같은 관찰을 새 ID로 재작성하지 않으며, 수락 수가 줄어도 그대로 진행하거나 닫는다. 재시도는 다음 배치에서 새 evidence와 새 ID로 시작한다.
- 근거 부족, 권한 불명, 완료 readback 부재, 안전한 반복 실행 불가 중 하나라도 있으면 hold 또는 reject다.
- 목표 수량 때문에 통과시키지 않는다.
- `userRequest`가 내부 필드명, 정답 상태, 실패 분기, 채점 식별자를 노출하면 reject다. 수정 재시도는 현재 배치 행을 덮지 않고 다음 배치로 넘긴다.
- oracle은 사용자 결과를 판정하는 최소 조건만 포함한다. 결과와 무관한 특정 문구·클릭 순서·내부 표현을 강제하면 reject다.

## 모델과 재현성

역할 난도에 따라 모델과 사고 수준을 구분한다. 정형 수집·파일 형식·운반·기계 검사는 균형형 모델 `medium`, 생활 필요 작성·과업 번역과 일반 의미 검토·사후 대조·측정 검토는 상위 추론 모델 `high`, 모호하거나 고위험인 항목만 `xhigh`, 반복 실패나 독립 판정 충돌만 `max` 또는 Ultra를 사용한다. 모든 배치는 모델명, 모델 버전 또는 alias, 추론 설정, 실행 시각, 역할별 context ID를 기록한다. 모델이 달라도 계약과 산출물 형식은 같아야 하며, 낮은 사양 결과가 의미 판정에 걸리면 상위 사양 reviewer가 재검토한다.

## 사람이 승인해야 하는 것

시장별 성립, 현지 검토, live 실행, 점수 정책, 공개 저장 정책과 런타임 접근 통제의 최종 승인, canonical 편입, Notion·Slack 공유, 배포와 push는 이 계약의 자동 승인 범위 밖이다.
