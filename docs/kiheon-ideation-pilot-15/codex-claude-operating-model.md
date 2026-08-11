# Codex·Claude Code 분업 운영 모델

- origin: `kiheon-ideation`
- status: `active-production-contract`
- current standard revision: `standard-v1.1-b4`
- current compressed revision: `lean-v1.1-b4`

## 1. 역할 선언

### Codex: 공정 관리와 품질 고도화

Codex는 생산 공정의 control plane을 맡는다.

- 완료 배치의 결함 원장과 거절·수정 이력을 분석한다.
- 방법론, 역할 계약, 검증 도구와 회귀 검사를 보완한다.
- 다음 배치가 사용할 방법 revision과 원문 파일 해시를 동결한다.
- 완료 배치가 역할 분리, accepted-only 동결, 사후 대조, 측정 결속을 지켰는지 통합 감사한다.
- 결함 수정은 진행 중인 배치에 끼워 넣지 않고 다음 배치 revision으로만 승격한다.

Codex가 신규 생활 필요를 대신 작성하거나, 생산 중인 후보를 의미 수정해 통과시키지 않는다.

### Claude Code: 동결된 공정으로 신규 배치 생산

Claude Code는 production lane을 맡는다.

- `batch-manifest.json`에 동결된 revision과 파일 해시만 사용한다.
- 독립 1차 자료 조사부터 관찰·후보·측정 계약까지 역할을 분리해 실행한다.
- 각 역할의 출력 원문을 수정하지 않고 수락된 행만 다음 단계로 동결한다.
- 실행 중 발견한 결함은 `defect-ledger.jsonl`에 기록하되 방법 파일을 직접 바꾸지 않는다.
- 배치를 완료하거나 fail-closed로 닫은 뒤 Codex에 결함과 회귀 결과를 돌려준다.

Claude Code가 배치 도중 방법 revision을 바꾸거나 비교 결과를 작성자에게 되돌리지 않는다.

## 2. 배치 경계

```text
완료 배치
  → Codex 결함 분석
  → 방법·검증기 수정
  → 회귀 검사
  → 방법 revision 커밋
  → 빈 배치에 method lock 기록
  → Claude Code 신규 생산
  → 독립 검토·동결·측정
  → 완료 또는 fail-closed 종료
```

배치가 시작된 뒤에는 method lock을 바꾸지 않는다. 수정이 필요하면 현재 산출물을 보존하고 배치를 닫은 다음, 새 revision과 새 배치 ID로 다시 시작한다.

## 3. 자동 관문

새 배치는 다음 세 상태를 순서대로 지난다.

1. `prepared-unlocked`: 빈 배치만 생성된 상태. 생산 금지.
2. `prepared-locked`: 커밋된 방법 revision과 파일별 SHA-256이 결속된 상태.
3. `in-progress`: `validate-ready` 통과 후 production lane이 역할 실행을 시작한 상태.

```bash
python3 scripts/mica-scenario-production.py lock-method \
  work/mica-scenario-batches/<batch-id>

python3 scripts/mica-scenario-production.py validate-ready \
  work/mica-scenario-batches/<batch-id>
```

`validate-ready`는 빈 산출물, 열린 closure, 미할당 역할, 현재 checkout의 방법 파일과 동결 해시 일치를 확인한다. PASS는 생산 시작 조건만 확인하며 의미 품질이나 후보 수락을 승인하지 않는다.

## 4. standard-v1.1-b4에 반영된 회귀 규칙

`std-b4`에서 발견한 결함과 비차단 관찰을 다음 revision의 공통 규칙으로 승격했다.

1. measurement asset 작성 전에 기대 판정표의 모든 성공·실패·복구 행이 같은 trace에서 동시에 성립 가능한지 확인한다.
2. 자격 gate의 각 항목은 차단되는 locked path와 1:1로 연결한다.
3. 재검사 때 과거 값이 되살아나는 일회성 injector 대신 variant 자체의 상태로 실패를 고정한다.
4. 판정 규칙은 위에서 아래로 첫 일치 규칙을 적용한다. 규정 threshold와 사용자의 실제 값은 별도 필드이며, 값 차이만으로 source conflict로 분류하지 않는다.
5. 원문 페이지가 첨부 링크를 제공하면 `download.do`, `fileDown.do` 같은 직접 첨부 경로를 먼저 시도하고, 2차 자료 재구성은 최후 수단으로 남긴다.

## 5. 교차 런타임 점검

- Claude Code는 매 배치 closure에 method revision, source commit, 역할별 모델·context ID를 기록한다.
- Codex는 매 배치 종료 뒤 결함 원장과 구조 회귀를 확인한다.
- 두 배치마다 또는 의미 판정 충돌이 생길 때, 다른 런타임이 원문 산출물만 받아 blind review를 한 번 수행한다.
- 같은 결함이 재발하거나 method lock이 어긋나면 다음 생산을 중단하고 표준 프로필로 복귀한다.

## 6. 현재 인수인계

다음 생산 배치는 `std-b5`다. 카테고리 09 주거·공과금의 독립 1차 자료를 조사하는 표준 최대 5건 배치이며, 현재 작성 산출물은 0건이다. `standard-v1.1-b4` 동결과 `validate-ready` PASS 뒤에만 Claude Code가 시작한다.

이 인수인계는 신규 후보의 수락 수량을 예약하지 않는다. 0건 수락도 유효하며, 시장 검토·실제 실행·공개·정본 편입·push는 별도 사람 승인 대상이다.
