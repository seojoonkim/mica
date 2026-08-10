# 01·02·04 Lean 배치 결과

- origin: kiheon-ideation
- 라벨: 신기헌 아이데이션
- 상태: 로컬 중간 버전, 정본 아님, 내부 검토용
- 배치: `lean-010204-001`
- 프로필: Lean v1, 최대 3건

## 결과 요약

01 이메일·캘린더, 02 쇼핑·배송, 04 외식·예약에서 최대 3건을 조사했다. 공식·1차 자료 3건 중 본문을 직접 검증하지 못한 외식·예약 자료 1건은 거절했고, 나머지 2건은 독립 작성·검토·동결·사후 대조·simulator 측정 설계까지 완료했다.

두 후보 모두 기존 과제와 같은 문제군은 있으나 시작 상태, 실행 메커니즘, 최종 상태와 권위 있는 확인 근거가 달라 `transformation`으로 판정됐다. `designable`은 합성 simulator에서 정상·실패·복구를 반복 측정할 자산이 결속됐다는 뜻이며, 실제 서비스 실행 성공·시장 성립·현지 검토·점수 산출·공개 적격·정본 편입을 뜻하지 않는다.

| ID | 범위 | 과업 | 사후 대조 | 현재 상태 |
|---|---|---|---|---|
| `LEAN010204-TASK-001` | 01 이메일·캘린더 | 회의 일정 변경 동기화 | transformation | simulator 측정 설계 가능 |
| `LEAN010204-TASK-002` | 02 쇼핑·배송 | 놓친 배송 후속 조치 완료 | transformation | simulator 측정 설계 가능 |

## 집계

- 조사 자료: 3건
- source review: 수락 2건, 거절 1건
- 관찰: 수락 2건, 거절 0건
- 과업 후보: 수락 2건, 거절 0건
- 사후 대조: transformation 2건, duplicate 0건, independent-finding 0건, hold 0건
- measurement designable: 2건
- 실제 실행·시장·공개 승인: 0건

## 확인된 공정 보완점

1. oracle 역할은 독립 검토자이면서 지정 출력 파일을 쓸 수 있는 컨텍스트로 라우팅해야 한다.
2. JSONL 행 해시는 줄바꿈을 제외한 원시 행 바이트로 계산한다는 규칙을 portable 계약과 자동 검증기에 명시해야 한다.
3. 두 보완점은 이번 배치 안에서 교정했고 최종 measurement review는 교정된 현재 바이트를 기준으로 통과했다. 다음 Lean 배치 전 계약·검증기 반영 여부를 확인한다.

## 주요 파일

- `source-evidence.jsonl`, `source-reviews.jsonl`, `accepted-source-evidence.jsonl`
- `need-observations.jsonl`, `observation-reviews.jsonl`, `frozen-observations.jsonl`
- `task-candidates.jsonl`, `candidate-reviews.jsonl`, `frozen-candidates.jsonl`
- `comparison.jsonl`
- `measurement-assets/<candidateId>/fixture.json`, `reset.json`, `eligibility.json`, `oracle.json`
- `measurement-contracts.jsonl`, `defect-ledger.jsonl`, `closure.json`
