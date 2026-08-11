# 재현 가이드

## 실행 환경

저장소 루트에서 Codex 또는 Claude Code를 시작한다. Codex는 `.agents/skills/mica-scenario-production/`, Claude Code는 `.claude/skills/mica-scenario-production/`을 프로젝트 스킬로 읽는다. 개인 홈 디렉터리 설치나 특정 컴퓨터의 절대경로는 필요하지 않다.

```bash
python3 scripts/mica-scenario-production.py preflight
python3 scripts/mica-scenario-production.py profiles
```

에이전트는 첫 응답에서 표준 5건·6–12시간과 Lean 3건·3–5시간의 역할·모델 자원을 비교해 보여주고 하나를 추천한다. 사용자가 방식을 선택한 뒤에만 다음 중 하나로 빈 배치를 만든다.

```bash
# 표준 방식
python3 scripts/mica-scenario-production.py new-batch \
  --profile standard --batch-id <batch-id>

# Lean 방식
python3 scripts/mica-scenario-production.py new-batch \
  --profile lean --batch-id <batch-id>
```

빈 배치는 즉시 생산하지 않는다. Codex가 방법 revision을 커밋한 뒤 다음 두 관문을 실행한다.

```bash
python3 scripts/mica-scenario-production.py lock-method \
  work/mica-scenario-batches/<batch-id>

python3 scripts/mica-scenario-production.py validate-ready \
  work/mica-scenario-batches/<batch-id>
```

`lock-method`는 커밋된 방법 source와 파일별 SHA-256을 배치에 결속한다. `validate-ready`가 빈 산출물·열린 closure·미할당 역할·현재 방법 파일의 일치를 확인한 뒤에만 역할 실행을 시작한다.

그 뒤 Codex에서는 `$mica-scenario-production <batch-id>`, Claude Code에서는 `/mica-scenario-production <batch-id>`로 시작한다. 역할별 새 컨텍스트에는 [`role-prompts.md`](./role-prompts.md)의 해당 블록과 허용 입력만 전달한다.

## 두 실행 방식

- `standard`: 저장소에서 처음 재현하거나 방법론·schema·검증 도구가 바뀐 경우, 고위험·민감 과업, 반복 결함, 독립 판정 충돌에 사용한다.
- `lean`: 표준 계약과 도구가 안정된 상태에서 다음 중간 결과를 빠르게 공유할 때 사용한다. 최대 3건과 선택적 추론 자원으로 줄이지만 필수 관문은 유지한다.

후보 수를 맞추기 위해 수락하거나 거절 원문을 조용히 수정하지 않는다. Lean에서 공정 결함이나 판정 충돌이 발견되면 배치를 닫고 표준으로 복귀한다.

기존에 생성된 v1 배치는 프로필을 추정해 덮어쓰지 않고 `legacy-v1`로 구조 검증한다. 새 배치부터는 `--profile`을 반드시 명시한다.

## 실행 순서

1. 공식 과제 목록이 아닌 1차 자료에서 선택한 프로필 상한만큼 bounded evidence를 고정한다.
2. 독립 출처 검토자가 발행 주체·원문 위치·관찰 범위·한계를 확인한다.
3. 격리된 작성자가 해결책 없는 생활 필요 관찰만 작성한다.
4. 운반 담당자는 응답을 의미 수정 없이 저장하고 원문 행 해시를 기록한다.
5. 독립 검토자가 근거 정렬·비처방성·창작 사실 금지·상태 변화 명료성을 판정한다.
6. 수락 관찰만 동결한다.
7. 새 번역자가 동결 관찰과 과업 schema만 받아 종단 간 상태 변화를 설계한다.
8. 독립 후보 검토자가 추적성·실행 단위·권한·금지 상태·문서형 종료를 판정한다.
9. 수락 후보만 동결한다.
10. 동결 뒤 대조자가 기존 과제를 열어 `duplicate/transformation/independent-finding/hold`를 판정한다.
11. 별도 역할이 fixture, reset, attempt eligibility를 만든다.
12. 독립 oracle 역할이 정상·실패·복구의 이분 판정을 작성한다.
13. 별도 measurement reviewer가 실제 파일 결속과 모든 분기를 확인한다.
14. 후보별 `agent-visible`, `evaluator-visible`, `harness-private` 묶음을 분리한다.
15. 별도 컨텍스트가 `agent-visible`만 받아 blind-agent rehearsal을 수행한다.
16. measurement reviewer가 누출 여부, 최소 충분 oracle, 숨은 경로 차단을 판정한다.
17. coverage readback과 결함 원장을 작성한다.
18. typed audit가 건수·역할·해시·역류 금지를 확인한 뒤 배치를 닫는다.

새 `v4` 배치는 18번 종료 전에 공개 입력과 블라인드 리허설의 집합·원문 SHA·누출 여부를 별도 관문으로 검사한다.

```bash
python3 scripts/mica-scenario-production.py validate-exposure \
  work/mica-scenario-batches/<batch-id>
```

기존 `v3` 배치에는 이 파일을 소급 생성하지 않는다. `v3`는 당시 동결된 method lock으로 재검증하고, 이후 새 배치부터 `v4` 노출면 관문을 사용한다.

각 producer→reviewer 인계에서는 controller가 입력 파일의 SHA-256과 artifact owner를 먼저 기록한다. reviewer는 시작 전·쓰기 직전·완료 후 같은 SHA-256을 확인하며, 값이 달라지면 결과를 저장하지 않는다. 런타임을 바꿀 때도 기존 owner가 입력을 닫고 새 owner가 SHA를 readback한 뒤에만 시작한다.

동결 담당자는 accepted row의 원문 JSONL 행 전체 SHA-256을 기록한다. 후보와 simulator 자산에서는 source evidence에 등장한 실제 사업자명을 기능적 권위 역할 또는 합성 식별자로 일반화한다.

## Codex와 Claude Code의 순환

1. Claude Code가 동결된 방법으로 신규 배치를 완료하거나 fail-closed로 닫는다.
2. Codex가 defect ledger, 거절·수정 이력과 회귀 결과를 분석한다.
3. Codex가 필요한 방법·검증기 변경을 다음 revision으로 커밋한다.
4. 빈 다음 배치에 method lock을 기록한다.
5. Claude Code가 새 revision으로 다음 생산을 시작한다.

진행 중인 배치의 방법 파일을 바꾸지 않는다. 결함이 발견되면 원문을 보존하고 현재 배치를 닫은 뒤 새 배치 경계에서만 수정한다. 전체 규칙은 [`codex-claude-operating-model.md`](./codex-claude-operating-model.md)에 있다.

## 배치별 필수 기록

- input manifest와 허용/금지 입력
- 원천 관찰, 독립 검토, accepted-only freeze
- 과업 후보, 독립 검토, accepted-only freeze
- 사후 대조와 측정 계약
- fixture/reset/eligibility/oracle
- coverage readback, 결함 원장, 완료 증거
- 다음 배치의 유지·승격·중단 판정

## 즉시 중단 조건

- 작성자 또는 번역자에게 기존 과제·후보·gap 힌트가 노출됨
- 필수 path·hash·schema가 없는데 값을 추측함
- 작성자와 검토자 역할이 합쳐짐
- 근거가 지지하지 않는 시장 사실·당사자·수치가 추가됨
- 요청·접수·문서만으로 외부 상태 완료를 주장함
- 승인 없는 외부 변경 또는 민감정보 전송이 포함됨
- 원문과 판정을 사후에 덮어씀
- 피측정 에이전트 입력에 최종 상태·금지 상태·fixture·oracle·probe·채점 식별자가 포함됨
- 특정 문구·내부 레코드·클릭 순서를 따르지 않으면 같은 사용자 결과도 실패하도록 설계됨

## 다음 단계

이 15건을 이어서 사용하려면 후보 제작보다 먼저 실행 노출면을 분리하고 정적 누출 감사를 수행한다. 실제 실행에 올릴 소수 후보부터 blind-agent rehearsal, simulator 교정 사전등록, 실제 자산 재검증을 거친다. 시장별 근거 검토, live 실행이나 점수 산출은 그 뒤의 별도 승인 대상이다.
