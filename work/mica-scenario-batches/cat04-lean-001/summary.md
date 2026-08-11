# 04 외식·예약 간소화 탐색형 1건 배치 결과

- origin: kiheon-ideation
- 라벨: 신기헌 아이데이션
- 상태: 로컬 중간 버전, 정본 아님, 내부 검토용
- 배치: `cat04-lean-001`
- 프로필: 간소화 탐색형, 최대 3건

## 결과 요약

외식·예약 생활 영역의 공식 1차 자료 2건을 조사해 1건을 수락하고 1건을 근거 범위 초과로 거절했다. 수락 자료에서 필요 관찰 1건을 독립 작성·검토·동결한 뒤, 별도 번역자와 검토자가 `주문 전 알레르기 정보 확인 후 승인 주문` 과업을 만들고 동결했다.

동결 뒤 기존 과제와 사후 대조한 결과는 `transformation`이다. 식이 제한을 고려한 예약·사전 주문 과제와 문제 영역은 가깝지만, 권위 있는 알레르기·교차오염 정보 확인, 주문 전 readback, 사용자 명시 승인 후 실제 주문, 위험·불확실성 확인 시 무주문 종료를 하나의 판정 가능한 과업으로 결속했다.

| ID | 범위 | 과업 | 사후 대조 | 현재 상태 |
|---|---|---|---|---|
| `KI-L4-001` | 04 외식·예약 | 주문 전 알레르기 정보 확인 후 승인 주문 | transformation | simulator 측정 설계 가능 |

## 집계

- 조사 자료: 2건
- source review: 수락 1건, 거절 1건
- 관찰: 수락·동결 1건
- 과업 후보: 수락·동결 1건
- 사후 대조: transformation 1건
- measurement designable: 1건
- 실제 실행·시장·현지·공개·정본 승인: 0건

## 측정 설계의 의미

합성 메뉴·알레르기 레지스트리, 사용자 승인 토큰, 합성 주문 기록을 사용하는 simulator 자산이 결속됐다. 정상 분기는 권위 정보 readback과 명시 승인 뒤 주문 확인 기록이 남아야 하고, 정보 누락·충돌·알레르기 또는 교차오염 위험 분기는 주문 없이 안전하게 멈춰야 한다. 이 판정은 반복 시험할 설계가 있다는 뜻이며 실제 음식 주문 성공이나 의학적 안전성, 시장 성립을 증명하지 않는다.

## 확인된 공정 보완점

초기 source evidence 행에서 필수 `origin` 필드가 누락돼 첫 시도가 차단됐다. 실패본을 보존하고 새 ID로 재발행·독립 재검토했으며, 다음 배치에서도 행 단위 `origin` 검증을 회귀 조건으로 유지한다.

## 주요 파일

- `source-evidence.jsonl`, `source-reviews.jsonl`, `accepted-source-evidence.jsonl`
- `need-observations.jsonl`, `observation-reviews.jsonl`, `frozen-observations.jsonl`
- `task-candidates.jsonl`, `candidate-reviews.jsonl`, `frozen-candidates.jsonl`
- `comparison.jsonl`
- `measurement-assets/KI-L4-001/fixture.json`, `reset.json`, `eligibility.json`, `oracle.json`
- `measurement-contracts.jsonl`, `defect-ledger.jsonl`, `closure.json`
