---
name: mica-scenario-production
description: MICA 생활과업 시나리오를 standard-v1.3.5 clean-room exchange job으로 제작하고, 역할별 접근 프로필·검토·동결·사후 분류·100-slot 원장 적용을 재현할 때 사용한다. 저장소 전체 작업과 격리 저작자 작업을 먼저 구분한다.
---

# MICA 시나리오 제작

`origin=kiheon-ideation` 연구 포트폴리오를 만든다. controller는 이 저장소에서 계약·검증·원장을 관리하지만, 동결 전 의미 역할은 저장소 밖의 읽기 전용 입력 package를 받은 격리 job 디렉터리에서만 작업한다. 개인 홈 디렉터리의 특정 절대경로를 계약으로 요구하지 않는다.

## 현재 운영 기준

- 새 clean-room 생산 기준은 `standard-v1.3.5`다. 10개 카테고리 x 10개, 총 100개 고유 slot은 필수 목표이며, 수량을 맞추기 위해 의미 판정을 바꾸지 않는다.
- 카테고리 의미 판정과 slot 점유를 분리한다. 주 성공 경로의 완료 조건과 권위 있는 최종 상태로 카테고리를 판정한 뒤, 빈 slot이 있으면 `assigned`, 가득 찼으면 `category-overflow`로 보존한다.
- 공개 저장소, 진행판, Notion, Obsidian에 정보가 있다는 사실은 clean-room 입력 허용을 뜻하지 않는다. 허용 입력은 `READY.json`과 `INPUT-MANIFEST.json`이 정한다.
- 동결 뒤 comparator·catalog annotation·measurement에는 기존 재고를 의도적으로 열 수 있지만, 그 정보는 source·observation·candidate 역할로 되돌리지 않는다.
- 과거 `standard-v1.3.4`로 닫힌 배치는 수정하지 않는다. 현재 revision은 다음 빈 exchange job부터 적용한다.

## 시작 경로 판정

### 격리 exchange job을 받은 저작자·검토자

1. 저장소를 clone하거나 열지 않는다. controller가 저장소 밖에 복제한 job 디렉터리 하나만 연다.
2. `READY.json`을 먼저 읽고 `jobType`, `methodRevision`, `allowedInputs`, `forbiddenInputs`, output schema, 최대 행수를 확인한다.
3. `INPUT-MANIFEST.json`과 `PACKAGE-SHA256.txt`를 순서대로 읽고 package 파일의 바이트·SHA-256을 대조한다.
4. 허용 파일은 하나씩 순차로 읽는다. `find`, 재귀 검색, 여러 경로를 묶은 병렬 탐색으로 job 밖을 찾지 않는다.
5. 지정된 staging 출력과 `CLOSURE.json`만 작성하고 멈춘다. 다음 단계나 새 job을 자동 시작하지 않는다.
6. 입력 불일치나 금지 입력 접근이 한 번이라도 있으면 결과를 살리지 않고 fail-closed로 닫는다.

### controller·통합자

controller만 저장소에서 preflight, method lock, exchange package 발급, 구조 검증, 원장 적용, GitHub·Vercel·Notion·Obsidian 반영을 수행한다. 기존 batch 도구는 완료 배치 검증과 역사 회귀에 유지한다.

## controller용 기존 배치 프로필 선택

이 절은 저장소 안에서 전체 배치를 준비하는 controller용 보존 경로다. 이미 `READY`인 exchange job의 격리 역할은 프로필을 다시 선택하지 않는다.

1. 저장소 루트에서 다음을 실행한다.

   ```bash
   python3 scripts/mica-scenario-production.py preflight
   ```

2. 두 프로필의 작업량을 확인한다.

   ```bash
   python3 scripts/mica-scenario-production.py profiles
   ```

3. 다음 문서를 읽는다.
   - `docs/kiheon-ideation-pilot-15/methodology.md`
   - `docs/kiheon-ideation-pilot-15/methodology-lean-v1.md`
   - `docs/kiheon-ideation-pilot-15/reproduction.md`
   - `docs/kiheon-ideation-pilot-15/agent-production-contract.md`
   - `docs/kiheon-ideation-pilot-15/role-prompts.md`
4. 최초 응답에서 다음 표를 먼저 보여주고 한 방식을 추천한다.

   | 방식 | 배치 | 예상 시간 | 역할·동시 실행 | 추론 자원 | 권장 상황 |
   |---|---:|---:|---|---|---|
   | 표준 `standard` | 최대 5건 | 6–12시간 | 15개 역할 경계, 동시 최대 2–3개 | 의미 역할 high/xhigh 중심 | 첫 재현·방법 변경·고위험·반복 결함·판정 충돌 |
   | 압축 `lean` | 최대 3건 | 3–5시간 | 15개 역할 경계, 동시 최대 2개·정형 단계 저비용 실행 | 정형 medium·의미 high·예외만 xhigh 이상 | 안정된 계약에서 빠른 후속 공유 |

   시간은 계획값이며 자료 접근과 거절·재작업에 따라 달라진다. 두 방식 모두 0건 수락이 유효하다.

5. `$ARGUMENTS`나 사용자 요청에 프로필이 명시돼 있으면 리소스 안내 뒤 그 방식으로 진행한다. 명시가 없으면 위 기준으로 하나를 추천하고 사용자가 `standard` 또는 `lean`을 선택할 때까지 배치를 만들지 않는다.
6. 배치 ID가 없으면 짧은 영문 소문자 ID를 받는다. 선택된 프로필을 명시해 새 배치를 만든다.

   표준 방식:

   ```bash
   python3 scripts/mica-scenario-production.py new-batch \
     --profile standard --batch-id <batch-id>
   ```

   Lean 방식:

   ```bash
   python3 scripts/mica-scenario-production.py new-batch \
     --profile lean --batch-id <batch-id>
   ```

7. 빈 배치를 만든 뒤 바로 작성하지 않는다. Codex가 방법 변경을 커밋한 다음 method lock과 시작 검사를 통과시킨다.

   ```bash
   python3 scripts/mica-scenario-production.py lock-method \
     work/mica-scenario-batches/<batch-id>

   python3 scripts/mica-scenario-production.py validate-ready \
     work/mica-scenario-batches/<batch-id>

   python3 scripts/mica-batch-control.py claim \
     work/mica-scenario-batches/<batch-id> \
     --controller-context-id <controller-context-id> \
     --session-id <session-id>
   ```

   `validate-ready`와 controller `claim`이 모두 PASS하기 전에는 production 역할을 시작하지 않는다. 기본 lease는 180분이다. 각 역할은 쓰기 전에 `--json assign-role`로 권한 토큰을 받고, 종료 뒤 같은 토큰을 `complete-role --write-authorization-token`에 제출해야 산출물이 채택된다. `role-briefing`으로 manifest 허용 입력과 출력 계약을 그대로 전달한다. 중단 시 미완료 역할을 `--abandon-role`로 명시한 뒤 `park`, 새 세션 승계 시 사람 지시 참조가 포함된 `resume`을 사용한다.

## Codex·Claude Code 분업

- Codex는 완료 배치의 결함 분석, 방법론·검증기 수정, 회귀 검사, revision 커밋과 다음 빈 배치 동결을 맡는다.
- Claude Code는 동결된 revision으로 신규 자료 조사·관찰·후보·측정 산출물을 생산하고 결함 원장과 closure를 반환한다.
- 진행 중인 배치에 방법 변경을 끼워 넣지 않는다. 결함은 현재 배치에 기록하고 다음 배치 경계에서만 새 revision으로 반영한다.
- 자세한 책임과 교차 검토 주기는 `docs/kiheon-ideation-pilot-15/codex-claude-operating-model.md`를 따른다.

## 역할별 접근 프로필

| 단계 | 필수 접근 프로필 | 기존 후보·원장 노출 |
|---|---|---|
| source·observation·candidate 저작 | `job-packet-only` | 금지 |
| source·observation·candidate 의미 검토 | 별도 `job-packet-only` | 금지 |
| accepted-only custodian 동결 | producer·reviewer와 다른 컨텍스트 | 의미 판정 금지 |
| comparator·catalog annotation·annotation review | `post-freeze-catalog-read` | 허용 |
| measurement 역할 | `harness-maintainer` 또는 계약된 사후 검토 프로필 | 허용 |
| blind-agent rehearsal | `agent-visible-only` | 후보 명세·평가 계약 금지 |
| controller·통합·감사 | 전체 노출 | 허용 |

`authorId`, `authorAccessProfile`, `reviewerId`, `reviewerAccessProfile`을 CLOSURE나 역할 산출 계약에 결속한다. 저장소 전체나 기존 재고를 본 세션은 동결 전 의미 역할과 blind-agent rehearsal에 재사용하지 않는다.

## 절대 경계

- 작성자와 번역자에게 `candidate-specs.json`, 기존 MICA 과제, 웹 과제 목록, 과거 후보, 비교 판정, gap·카테고리 할당을 보여주지 않는다.
- 공식 자료는 방법론과 사후 비교 근거로만 쓴다. 기존 문항의 소재·표현·수량을 발상 seed로 쓰지 않는다.
- source researcher, source reviewer, need writer, observation reviewer, translator, candidate reviewer, comparator, measurement asset author, oracle reviewer, measurement reviewer를 서로 다른 컨텍스트로 실행한다.
- 한 모델이나 한 대화에서 역할 이름만 바꿔 자기심사하지 않는다. 독립 컨텍스트를 만들 수 없으면 중단하고 별도 세션으로 인계한다.
- 근거에 없는 사업자명, 시장 수치, 표본수, 당사자, 기간, 비용, 성공률을 만들지 않는다.
- 단순 요청·접수·문서 생성으로 외부 상태 완료를 주장하지 않는다. 권위 있는 readback 또는 명시된 안전한 인계 상태가 있어야 한다.
- 시장 검토, 실제 실행, 점수 산출, 공개·정본 편입은 이 스킬의 승인 범위가 아니다.
- Notion·Slack·배포·정본 변경·git push는 사람의 명시 승인을 받은 별도 단계다.

## catalog annotation과 slot 분리

- 카테고리는 요청 소재나 근거 수집처가 아니라 주 성공 경로의 완료 조건과 권위 있는 최종 상태가 성립하는 생활 영역으로 판정한다.
- 빈 slot이 있으면 `slotDisposition: assigned`와 가용 `proposedSlotId`를 쓴다.
- 판정 카테고리가 10/10이면 `slotDisposition: category-overflow`, `proposedSlotId: null`로 보존한다. 빈 slot이 있는 다른 카테고리로 밀어 넣지 않는다.
- `categoryProvisional: true`는 `READY.json`의 controller 승인 목록에 있는 후보만 사용할 수 있다. 잠정 표시는 자동 배정이나 의미 관문 우회가 아니다.
- `telecom-subscriptions`의 한국어 라벨은 `통신·구독·렌털`이다. 반복 결제라는 이유만으로 자동이체·관리비·정기검진을 포함하지 않는다.
- 종료 유형은 주 성공 경로의 종착점으로 판정한다. 실패 복구 분기에만 안전 인계가 있으면 `completed-final-state`를 유지하고, 주 경로의 종착점 자체가 승인 인계일 때만 `approval-handoff`다.

## 피측정 에이전트 노출면

상세 후보와 측정 자산은 피측정 에이전트에게 주는 프롬프트가 아니다. 다음 세 표면을 분리한다.

- `agent-visible`: 자연어 `userRequest`, 사용자가 알려 준 제약, 공통 안전정책, 허용 도구만 포함한다.
- `evaluator-visible`: 시작·최종 상태, 승인 경계, 금지 결과, 실패 복구, 안전 인계를 포함하며 피측정 에이전트에게 전달하지 않는다.
- `harness-private`: fixture, variant, reset, eligibility, full oracle, probe, registry, event ID, canary, tick·비용 계산을 포함하며 런타임에서 반드시 숨긴다.

`candidate-specs.json`, 후보 JSONL, comparison, measurement assets를 피측정 에이전트 입력으로 직렬화하지 않는다. 에이전트에게 내부 schema·판정 레코드·채점 토큰 생성을 요구하지 않고, 하네스가 도구 호출·외부 상태·최종 응답에서 판정 기록을 파생한다. 공개 저장소에 파일이 있어도 실행 sandbox가 하네스 전용 경로를 읽지 못하게 한다.

## 실행 단위

- 표준은 최대 5개, Lean은 최대 3개의 독립 생활 필요만 다룬다.
- 선택한 프로필, 예상 시간과 동시 실행 한도를 `batch-manifest.json`에 기록한다.
- 방법 revision, source commit과 파일별 SHA-256을 `methodLock`에 기록한다.
- 한 활성 배치의 같은 artifact path는 한 런타임만 쓴다. producer가 입력 SHA-256을 닫기 전 reviewer를 시작하지 않으며 reviewer는 시작 전·쓰기 직전·완료 후 같은 SHA를 확인한다.
- controller lease와 역할 context 선점은 `controller-state.json`에 기록한다. 중복 controller·role context는 차단하고, batch 역할 산출물은 해당 batch의 동결된 method revision과 현재 세대 권한 토큰이 일치할 때만 `complete-role`로 채택한다. 역할 원장 시각은 파일 mtime과 OS 관측 시각에서 파생한다.
- 거절 원문은 같은 배치에서 새 ID로 다시 쓰지 않는다. accepted-only 수량으로 진행하거나 닫고, 재시도는 다음 배치의 새 evidence·새 ID로 시작한다.
- 입력 SHA가 바뀐 review는 채택하지 않고 `stale-review-evidence/`에 격리한다.
- Lean도 작성·검토·동결·사후 대조·measurement 관문과 역할 독립성을 생략하지 않는다.
- 순서 의존 단계는 병렬화하지 않는다. 표준은 동시 최대 2–3개, Lean은 동시 최대 2개 컨텍스트만 활성화한다.
- 구조·해시·역할·건수 같은 기계 검사는 두 방식 모두 매번 전수 실행한다. Lean의 의미 재검토만 새 항목·변경 항목·고위험 항목에 집중한다.
- 수락 수량을 맞추지 않는다. 0개 수락도 유효한 결과다.
- 전체 공정을 닫고 새 실행 가능한 공정 결함이 없으며 회귀 검사가 통과한 뒤에만 다음 배치를 시작한다.
- 누적 목표의 분모는 초안 수가 아니라 `measurable-candidate` 수다.

## 역할별 실행

`role-prompts.md`에서 해당 역할의 프롬프트만 새 컨텍스트에 전달한다. 각 역할에 허용된 파일만 제공하고, 결과를 `work/mica-scenario-batches/<batch-id>/`의 대응 JSONL에 그대로 저장한다.

1. 독립 1차 자료를 고정하고 source reviewer가 범위와 한계를 확인한다.
2. need writer가 해결책 없는 관찰을 작성하고 observation reviewer가 독립 판정한다.
3. 수락 관찰만 동결한다.
4. translator가 상태 변화 과업으로 번역하고 candidate reviewer가 독립 판정한다.
5. 수락 후보만 동결한다.
6. 그 뒤에만 comparator가 기존 과제와 파일럿 15건을 열어 사후 대조한다.
7. measurement 역할들이 fixture·reset·eligibility·oracle을 분리 작성·검토한다.
8. 별도 exposure preparer가 공개 요청을 `agent-visible.jsonl`로 분리한다.
9. 별도 컨텍스트가 `agent-visible`만 받아 입력 충분성과 합리적인 해결·안전 인계 경로의 존재를 검토해 `blind-agent-rehearsal.jsonl`을 작성한다. 도구 실행이나 모델 성능 평가는 하지 않는다.
10. controller가 `validate-exposure`로 공개 입력 누출·원문 SHA·후보 집합·이분 판정을 확인하고 결함 원장과 종료 판정을 기록한다.

observation·candidate custodian은 별도 context에서 accepted 원문 행 전체 SHA-256을 기록한다. measurement asset author는 EXP literal label registry, 누락 성분 단일 formula, 사건 부재 시 strict-order `NOT-APPLICABLE`을 적용한다. 후보·fixture·oracle에는 실제 사업자명 대신 기능적 권위 역할 또는 합성 식별자를 쓴다.

`std-b6` 종료 감사 이후(`standard-v1.3`)에는 다음도 강제한다.

- 역할 산출물의 `*ContextId`와 동결 담당 표기는 `self`가 아니라 실제 실행 컨텍스트 ID여야 하며 `batch-manifest.json`의 `modelRecord`와 일치해야 한다.
- controller는 최종 측정 검토, `measurement-contracts.jsonl`, 결함 원장, closure의 SHA-256까지 종결 원장에 기록한다. `batch-manifest.json` 자체는 자기참조 때문에 제외한다.
- 측정 자산은 기록의 원자적 호출 단위와 최악 경로 호출 수를 선언한다. 합성 시계 상한 안에 든다는 증명이 없으면 실제 simulator 실행으로 승격하지 않는다.
- 열린 비차단 정리 항목이 있는 `designable` 후보는 측정 설계 완료일 뿐 실행 검증 완료가 아니다. 실제 실행 전에 정리 항목을 닫는다.
- oracle은 사용자 결과, 권위 있는 readback, 승인 경계, 금지 상태, 안전 인계를 이분 판정하는 최소 조건만 포함한다. 특정 문구·클릭 순서·내부 필드명을 강제하지 않는다.
- measurement review 뒤 `agent-visible`만 받은 별도 컨텍스트의 blind-agent rehearsal을 통과해야 `designable`로 종결한다. 그 전 상태는 `designable-pending-exposure`다. 리허설은 실제 도구 실행이 아니라 공개 입력만으로 합리적인 경로를 설명할 수 있는지 보는 검토다. `assessmentMode=instruction-sufficiency`, `actualExecutionObserved=false`, `performanceInferenceAllowed=false`를 기록하고, 한 번의 서술에서 가능한 단계가 빠졌다는 이유만으로 실패시키거나 특정 모델의 행동 순서를 정답으로 강제하지 않는다.

## 모델 기준

- 정형 수집·파일 형식·운반·기계 검사: 균형형 모델 `medium`. 구조 오류가 반복될 때만 `high`로 승급한다.
- 생활 필요 작성·과업 번역: 상위 추론 모델 `high`. 근거나 상태 변화가 모호하면 `xhigh`로 승급한다.
- 일반 의미 검토·사후 대조·측정 검토: 상위 추론 모델 `high`. 고위험·민감 과업이거나 독립 판정이 충돌하면 `xhigh`로 승급한다.
- 반복 실패나 독립 판정 충돌에만 `max` 또는 Ultra를 사용한다. 이 조건 밖에서는 사용하지 않는다.
- 모델명·버전 또는 alias·사고 수준·실행 시각·역할별 context ID를 `batch-manifest.json`의 `modelRecord`에 기록한다.
- 모델 사양은 역할 분리, 증거 결속, 독립 검토를 대체하지 않는다.

## 완료

exchange job은 controller가 저장소에서 다음을 실행해 검증한다.

```bash
python3 scripts/mica-portfolio.py validate-job --job-id <job-id>
python3 scripts/mica-portfolio.py validate
```

`validate-job` PASS는 구조·SHA·역할·행수·경계를 확인한 것이며 의미 품질이나 원장 적용을 뜻하지 않는다. 의미 검토가 끝난 accepted 행만 별도 apply transaction으로 반영한다.

기존 batch 경로는 다음 명령을 유지한다.

다음을 실행해 구조를 확인한다.

```bash
python3 scripts/mica-scenario-production.py validate-exposure \
  work/mica-scenario-batches/<batch-id>

python3 scripts/mica-scenario-production.py validate-batch \
  work/mica-scenario-batches/<batch-id>
```

`validate-exposure`는 `v4`와 `v5` 배치에서 사용한다. 완료·진행 중인 배치에 새 revision을 소급하지 않는다. source review의 7개 기준에는 `limitationsHonesty`가 반드시 포함되고, source·observation review는 필수 기준 하나라도 실패하면 reject여야 한다. `sourceFrozenRowSha256`은 `frozen-candidates.jsonl` 해당 후보의 원문 한 줄 전체(줄바꿈 제외) SHA-256으로만 기록하고 상류 source·observation hash를 대신 쓰지 않는다. 구조 검증 PASS는 의미 품질이나 벤치마크 채택 승인이 아니다. 사람에게는 수락·거절·보류, 발견한 결함, 다음 배치 유지·중단 판단을 함께 보고한다.
