# 카테고리 07·08 표준 5건 배치 결과

- origin: kiheon-ideation
- 라벨: 신기헌 아이데이션
- 상태: 로컬 중간 버전, 정본 아님, 내부 검토용
- 배치: `cat07-08-standard-001`
- 프로필: 표준, 최대 5건

## 결과 요약

공식 1차 자료 5건에서 독립적으로 생활 필요를 관찰하고, 작성·검토·동결·사후 대조·simulator 측정 설계까지 한 배치를 완료했다. 5건 모두 독립 관찰과 과업 검토를 통과했고, fixture·deterministic reset·fail-closed eligibility·binary oracle가 결속된 `designable` 상태다.

`designable`은 합성 simulator에서 반복 시험할 설계가 갖춰졌다는 뜻이다. 실제 기관 실행 성공, 6개 시장 성립, 현지 검토, 점수 산출, 공개 적격, 정본 편입을 뜻하지 않는다.

| ID | 연구 범위 | 과업 | 사후 대조 | 현재 상태 |
|---|---|---|---|---|
| `CAT0708-TASK-001` | 07 의료 행정 | 진료비 확인 요청 접수 완료 | transformation | simulator 측정 설계 가능 |
| `CAT0708-TASK-002` | 07 의료 행정 | 개인 진료정보 열람 가능 상태 확보 | transformation | simulator 측정 설계 가능 |
| `CAT0708-TASK-003` | 07 의료 행정 | 진료 접수 본인확인 완료 | independent-finding | simulator 측정 설계 가능 |
| `CAT0708-TASK-004` | 08 행정·공공 서비스 | 전입신고 처리 또는 방문 인계 완료 | transformation | simulator 측정 설계 가능 |
| `CAT0708-TASK-005` | 08 행정·공공 서비스 | 주민등록표 등본·초본 발급 완료 | transformation | simulator 측정 설계 가능 |

## 집계

- 공식 1차 자료: 5건
- 수락 관찰: 5건, 거절 0건
- 수락 과업 후보: 5건, 거절 0건
- 사후 대조: transformation 4건, independent-finding 1건, duplicate 0건, hold 0건
- measurement designable: 5건
- 실제 실행·시장·공개 승인: 0건

## 남은 보완

1. portable role prompt에 review·measurement JSONL exact schema를 정식 추가해야 한다.
2. 이번 need writer·translator·comparator는 표준 프로필의 high 권장치보다 낮은 medium 역할에서 실행됐다. 관찰과 후보는 별도 high reviewer를 통과했지만, 팀 채택 또는 공개·정본 승격 전에 comparator를 high로 재검토하는 편이 안전하다.
3. 실제 simulator 실행, 시장별 성립, 현지 검토, 점수 정책, 공개·비공개 분리와 정본 편입은 별도 승인 단계다.
4. 기존 완료 15건과 합산하거나 PR·Notion·Slack에 반영하는 작업은 사람 확인 전 수행하지 않는다.

## 주요 파일

- `source-evidence.jsonl`, `source-reviews.jsonl`: 공식 자료와 독립 검토
- `need-observations.jsonl`, `observation-reviews.jsonl`, `frozen-observations.jsonl`: 생활 필요 관찰과 동결
- `task-candidates.jsonl`, `candidate-reviews.jsonl`, `frozen-candidates.jsonl`: 과업 후보와 동결
- `comparison.jsonl`: 기존 MICA 100·파일럿 15와 사후 대조
- `measurement-assets/<candidateId>/`: 후보별 fixture·reset·eligibility·oracle
- `measurement-contracts.jsonl`: 최종 결속 검토
- `defect-ledger.jsonl`, `closure.json`: 결함과 종료 판정
