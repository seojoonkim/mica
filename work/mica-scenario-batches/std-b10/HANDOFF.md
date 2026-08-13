# std-b10 교차 런타임 인수인계

> 역사적 시작 인수인계다. 현재 배치는 `completed`로 종결됐으며 이 문서의 `prepared-locked`·`생산 시작: 아직 안 함`은 시작 당시 상태를 보존한 기록이다. 최종 결과는 `closure.json`, 공정 결함의 후속 해소는 `PROCESS-DEFECT-RESOLUTION.md`를 따른다.

- origin: `kiheon-ideation`
- 시작 당시 상태: `prepared-locked`
- 현재 상태: `completed`
- 생산 프로필: `standard`
- 방법 revision: `standard-v1.3.2`
- 최대 초안: 3건
- 예상 작업량: 6–12시간
- 시작 당시 생산 상태: 아직 안 함

## 이번 배치의 역할 경계

- Claude Code는 `work/mica-scenario-batches/std-b10/`의 신규 생산 산출물만 소유한다.
- Claude Code는 방법 문서, 스킬, 검증 스크립트, 실행 러너를 수정하지 않는다.
- Codex는 완료 배치의 결함 분석, 방법·검증기와 별도 execution pilot 경로만 소유한다.
- 두 런타임은 같은 artifact path를 동시에 수정하지 않는다.

## 조사 방향

상대적으로 적게 다룬 저위험 일상 유지 영역을 우선한다. 다만 source researcher와 need writer에게 기존 MICA 과제명, 이전 후보, comparison, 카테고리 quota나 gap 힌트를 전달하지 않는다. 수락 수량을 목표로 강제하지 않으며 0건 수락도 유효하다.

## Claude Code 시작 순서

1. 역할 context를 만들기 전에 아래 명령이 PASS인지 확인한다. 이 관문은 빈 산출물, 열린 closure, 현재 method lock과 모든 역할의 미할당 상태를 확인한다.

   ```bash
   python3 scripts/mica-scenario-production.py validate-ready \
     work/mica-scenario-batches/std-b10
   ```

2. PASS 뒤 source research부터 역할별 새 컨텍스트를 만들고, 각 역할이 시작될 때 실제 context ID를 `batch-manifest.json`의 `roles`와 `modelRecord`에 기록한다. 과거 배치의 역할 context를 재사용하지 않는다.
3. 발견한 공정 결함은 `defect-ledger.jsonl`에 기록하고 방법 파일은 고치지 않는다.
4. 완료 또는 fail-closed closure 뒤 Codex에 배치 경로와 결함 원장을 반환한다.

시장 검토, 실제 서비스 실행, 공개·정본 편입, Notion·Slack 기록과 push는 이 배치의 자동 승인 범위가 아니다.
