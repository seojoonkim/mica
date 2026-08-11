---
name: mica-scenario-production
description: MICA 생활과업 시나리오를 독립 근거에서 표준 최대 5개 또는 Lean 최대 3개로 제작하고 역할 분리 검토·동결·사후 대조·simulator 측정 설계까지 재현할 때 사용한다. 시작 전에 두 방식의 작업량·시간·필요 자원을 먼저 안내하고 하나를 선택해야 한다.
---

# MICA 시나리오 제작

이 저장소 안의 방법론과 도구만 사용해 `origin=kiheon-ideation` 시나리오 배치를 만든다. 개인 홈 디렉터리, 특정 컴퓨터의 절대경로, 별도 vooy 저장소를 요구하지 않는다.

## 시작 전 필수 선택

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
   | 표준 `standard` | 최대 5건 | 6–12시간 | 8–12개 분리 역할, 동시 최대 2–3개 | 의미 역할 high/xhigh 중심 | 첫 재현·방법 변경·고위험·반복 결함·판정 충돌 |
   | 압축 `lean` | 최대 3건 | 3–5시간 | 독립 의미 역할 유지, 동시 최대 2개 | 정형 medium·의미 high·예외만 xhigh 이상 | 안정된 계약에서 빠른 후속 공유 |

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
   ```

   `validate-ready`가 PASS하기 전에는 production 역할을 시작하지 않는다.

## Codex·Claude Code 분업

- Codex는 완료 배치의 결함 분석, 방법론·검증기 수정, 회귀 검사, revision 커밋과 다음 빈 배치 동결을 맡는다.
- Claude Code는 동결된 revision으로 신규 자료 조사·관찰·후보·측정 산출물을 생산하고 결함 원장과 closure를 반환한다.
- 진행 중인 배치에 방법 변경을 끼워 넣지 않는다. 결함은 현재 배치에 기록하고 다음 배치 경계에서만 새 revision으로 반영한다.
- 자세한 책임과 교차 검토 주기는 `docs/kiheon-ideation-pilot-15/codex-claude-operating-model.md`를 따른다.

## 절대 경계

- 작성자와 번역자에게 `candidate-specs.json`, 기존 MICA 과제, 웹 과제 목록, 과거 후보, 비교 판정, gap·카테고리 할당을 보여주지 않는다.
- 공식 자료는 방법론과 사후 비교 근거로만 쓴다. 기존 문항의 소재·표현·수량을 발상 seed로 쓰지 않는다.
- source researcher, source reviewer, need writer, observation reviewer, translator, candidate reviewer, comparator, measurement asset author, oracle reviewer, measurement reviewer를 서로 다른 컨텍스트로 실행한다.
- 한 모델이나 한 대화에서 역할 이름만 바꿔 자기심사하지 않는다. 독립 컨텍스트를 만들 수 없으면 중단하고 별도 세션으로 인계한다.
- 근거에 없는 사업자명, 시장 수치, 표본수, 당사자, 기간, 비용, 성공률을 만들지 않는다.
- 단순 요청·접수·문서 생성으로 외부 상태 완료를 주장하지 않는다. 권위 있는 readback 또는 명시된 안전한 인계 상태가 있어야 한다.
- 시장 검토, 실제 실행, 점수 산출, 공개·정본 편입은 이 스킬의 승인 범위가 아니다.
- Notion·Slack·배포·정본 변경·git push는 사람의 명시 승인을 받은 별도 단계다.

## 실행 단위

- 표준은 최대 5개, Lean은 최대 3개의 독립 생활 필요만 다룬다.
- 선택한 프로필, 예상 시간과 동시 실행 한도를 `batch-manifest.json`에 기록한다.
- 방법 revision, source commit과 파일별 SHA-256을 `methodLock`에 기록한다.
- 한 활성 배치의 같은 artifact path는 한 런타임만 쓴다. producer가 입력 SHA-256을 닫기 전 reviewer를 시작하지 않으며 reviewer는 시작 전·쓰기 직전·완료 후 같은 SHA를 확인한다.
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
8. controller가 결함 원장과 종료 판정을 기록한다.

observation·candidate custodian은 별도 context에서 accepted 원문 행 전체 SHA-256을 기록한다. measurement asset author는 EXP literal label registry, 누락 성분 단일 formula, 사건 부재 시 strict-order `NOT-APPLICABLE`을 적용한다. 후보·fixture·oracle에는 실제 사업자명 대신 기능적 권위 역할 또는 합성 식별자를 쓴다.

## 모델 기준

- 정형 수집·파일 형식·운반·기계 검사: 균형형 모델 `medium`. 구조 오류가 반복될 때만 `high`로 승급한다.
- 생활 필요 작성·과업 번역: 상위 추론 모델 `high`. 근거나 상태 변화가 모호하면 `xhigh`로 승급한다.
- 일반 의미 검토·사후 대조·측정 검토: 상위 추론 모델 `high`. 고위험·민감 과업이거나 독립 판정이 충돌하면 `xhigh`로 승급한다.
- 반복 실패나 독립 판정 충돌에만 `max` 또는 Ultra를 사용한다. 이 조건 밖에서는 사용하지 않는다.
- 모델명·버전 또는 alias·사고 수준·실행 시각·역할별 context ID를 `batch-manifest.json`의 `modelRecord`에 기록한다.
- 모델 사양은 역할 분리, 증거 결속, 독립 검토를 대체하지 않는다.

## 완료

다음을 실행해 구조를 확인한다.

```bash
python3 scripts/mica-scenario-production.py validate-batch \
  work/mica-scenario-batches/<batch-id>
```

구조 검증 PASS는 의미 품질이나 벤치마크 채택 승인이 아니다. 사람에게는 수락·거절·보류, 발견한 결함, 다음 배치 유지·중단 판단을 함께 보고한다.
