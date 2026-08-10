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

## Lean v1 운영 기준

- 기본 배치는 3건이다. 새 실행 가능한 공정 결함 없이 배치가 닫히고 기존 결함 회귀가 통과할 때만 5건, 이후 10건 승격을 검토한다.
- 동시에 최대 2개 컨텍스트만 실행하며, 순서 의존 단계는 병렬화하지 않는다.
- 구조·해시·역할·건수 검사는 전수 실행하고, 의미 재검토는 새 항목·변경 항목·고위험 항목에 집중한다.
- 역할별 허용 입력은 `batch-manifest.json`의 `roleInputAllowlist`로 고정하며, controller가 배치 시작 전에 확인한다.

## 공정 상태

| 단계 | 산출물 | 다음 단계 조건 |
|---|---|---|
| source | `source-evidence.jsonl` | 독립 reviewer가 범위·한계 수락 |
| observation | `need-observations.jsonl` | 독립 의미 검토 수락 |
| frozen observation | `frozen-observations.jsonl` | accepted-only 집합 |
| task candidate | `task-candidates.jsonl` | 독립 후보 검토 수락 |
| frozen candidate | `frozen-candidates.jsonl` | accepted-only 집합 |
| comparison | `comparison.jsonl` | 동결 뒤에만 기존 과제 대조 |
| measurement | `measurement-contracts.jsonl` | fixture·reset·eligibility·oracle 결속 |
| close | `defect-ledger.jsonl`, `closure.json` | 수량보다 결함·한계 보존 |

## 입력 방화벽

작성 전 허용 입력은 독립 1차 자료와 그 자료의 bounded evidence뿐이다. need writer와 translator에게 다음을 제공하지 않는다.

- `docs/kiheon-ideation-pilot-15/candidate-specs.json`
- 기존 MICA 100개 과제와 사이트 과제 문안
- 이전 후보·거절·holdout·comparison 결과
- 카테고리별 부족 수나 목표 슬롯

controller도 역할별 입력 목록을 `batch-manifest.json`에 기록한다. 금지 입력이 노출되면 결과를 수정해 살리지 않고 배치를 닫은 뒤 새 컨텍스트로 다시 시작한다.

## 기본 필드

### bounded source evidence

`evidenceId`, `sourceTitle`, `publisher`, `sourceUrl`, `retrievedAt`, `sourceLocation`, `boundedObservation`, `populationAndScope`, `knownLimits`, `reviewerContextId`

### need observation

`observationId`, `sourceRefs`, `burdenBearer`, `affectedParty`, `contextOrTrigger`, `currentState`, `desiredStateChange`, `unresolvedConsequence`, `evidenceStatus`, `marketScope`, `authorContextId`

### task candidate

`candidateId`, `sourceObservationIds`, `label`, `userRequest`, `startState`, `taskAction`, `canonicalFinalState`, `confirmationBoundary`, `prohibitedStates`, `failureRecoveryEvents`, `unknowns`, `translatorContextId`

### measurable candidate

동결 후보에 `comparisonVerdict`, `executionTrack`, `fixtureRefs`, `resetRef`, `attemptEligibilityRef`, `oracleRef`, `measurementDecision`, `measurementReviewerContextId`가 결속된 상태다. `designable`은 실제 실행 성공이나 시장 성립을 뜻하지 않는다.

## 독립성

한 컨텍스트에서 생성과 검토를 함께 하지 않는다. 도구가 격리된 하위 에이전트를 제공하지 않으면 별도 채팅을 사용한다. reviewer는 작성자의 대화 요약이나 의도를 받지 않고 고정 산출물과 계약만 받는다. comparator 결과를 다음 작성자에게 되돌리지 않는다.

## 판정

- 수락은 모든 필수 기준이 통과할 때만 가능하다.
- 거절 원문과 review는 보존한다. 원문을 수정해야 하면 새 ID와 새 검토가 필요하다.
- 근거 부족, 권한 불명, 완료 readback 부재, 안전한 반복 실행 불가 중 하나라도 있으면 hold 또는 reject다.
- 목표 수량 때문에 통과시키지 않는다.

## 모델과 재현성

역할 난도에 따라 모델과 사고 수준을 구분한다. 정형 수집·파일 형식·운반·기계 검사는 균형형 모델 `medium`, 생활 필요 작성·과업 번역과 일반 의미 검토·사후 대조·측정 검토는 상위 추론 모델 `high`, 모호하거나 고위험인 항목만 `xhigh`, 반복 실패나 독립 판정 충돌만 `max` 또는 Ultra를 사용한다. 모든 배치는 모델명, 모델 버전 또는 alias, 추론 설정, 실행 시각, 역할별 context ID를 기록한다. 모델이 달라도 계약과 산출물 형식은 같아야 하며, 낮은 사양 결과가 의미 판정에 걸리면 상위 사양 reviewer가 재검토한다.

## 사람이 승인해야 하는 것

시장별 성립, 현지 검토, live 실행, 점수 정책, 공개·비공개 분리, canonical 편입, Notion·Slack 공유, 배포와 push는 이 계약의 자동 승인 범위 밖이다.
