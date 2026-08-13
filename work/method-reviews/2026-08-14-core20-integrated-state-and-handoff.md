---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: integrated-state-handoff
scope: std-b12-closure-and-core20-transition
language: ko
asOf: 2026-08-14
---

# std-b12 종결과 Core 20 전환 통합 기록

## 0. 한 줄 결론

`std-b12`는 `standard-v1.3.4`로 정직하게 0건 수락 종결됐고, 다음 작업은 상세 합성 측정 자산을 모든 후보에 선행시키지 않고 기존 동결 후보 56건을 사후 annotation해 서로 다른 20개 슬롯을 먼저 확정하는 저비용 `Core 20` 단계다.

이 20개는 최종 목표 100개를 줄인 수량이 아니다. 10개 카테고리별 10개, 총 100개 슬롯을 채우기 위한 첫 중간 마일스톤이다.

## 1. 현재 확인된 상태

| 항목 | 현재 값 | 해석 |
|---|---:|---|
| 파일럿 후보 | 15 | 초기 패키지로 보존된 후보 |
| 종결 배치의 동결 후보 | 41 | `std-b12`의 2건을 포함하며, 측정 설계 통과 수와 같지 않음 |
| 사후 annotation 대상 | 56 | 파일럿 15 + 종결 배치 동결 41 |
| 기존 측정 설계 통과 재고 | 52 | 파일럿 `designable` 15 + 종결 배치 measurement contract 37, 실제 실행 성공 수가 아님 |
| std-b12 측정 설계 수락 | 0 | 후보 계보는 보존하되 측정 자산 단계에서 수락되지 않음 |
| core-slot-qualified | 0 | 새 slot ledger와 annotation review를 적용하기 전 상태 |
| 내일 중간 목표 | 20 | 서로 다른 슬롯을 실제로 점유한 `core-slot-qualified` 후보 |
| 실제 외부 서비스 실행 | 0 | 합성 실행과 구분 |

`raw frozen candidate 56`을 `완성 슬롯 56개`로 표현하지 않는다. 후보는 중복·변형·동일 슬롯 충돌을 포함할 수 있으므로, annotation review와 portfolio apply receipt가 끝나야 한 슬롯으로 센다.

## 2. std-b12 종결 결과

- 방법 버전: `standard-v1.3.4`
- closure: `zero-accepted`
- source evidence: 4건
- source review: 4건
- frozen observation: 3건
- frozen candidate: 2건
- post-freeze comparison: 2건
- measurement review: 2건 검토, 수락 0건
- defect ledger: 5건, major 4건
- 검증: `validate-exposure` PASS, `validate-batch` PASS, controller close PASS

근거·관찰·후보 관문은 작동했지만 상세 측정 자산의 내부 정합성에서 두 후보가 모두 멈췄다. 수량을 맞추기 위해 판정을 완화하지 않았다. 두 후보의 계보와 사후 비교 결과는 보존하고, `standard-v1.3.5` annotation 대상에는 포함한다.

측정 단계 분석에서는 최근 실패의 주원인을 단순한 variant 수 증가보다 저작 중 반복 검증 루프의 소실로 보았다. 따라서 대표 실행 후보의 측정 자산을 다시 만들 때는 다음 순서를 따른다.

1. 작성 중 preflight validator를 먼저 적용한다.
2. 공통 core와 variant 레코드를 분리한다.
3. variant 수 축소는 앞의 두 조치로도 통과율이 회복되지 않을 때만 검토한다.
4. `closingShaLedger`는 사람이 적지 않고 도구가 파일에서 도출·대조한다.

## 3. 다음 상태 모델

### Core 축

```text
frozen-candidate
  -> post-freeze-compared
  -> catalog-annotated
  -> annotation-reviewed
  -> core-slot-qualified
```

### 실행 축

```text
core-slot-qualified
  -> measurement-selected
  -> measurement-designed
  -> rehearsal-passed
  -> system-attempted
```

Core 축은 10x10 포트폴리오가 얼마나 채워졌는지를 나타낸다. 실행 축은 실제 합성·시스템 실행에 얼마나 가까운지를 나타낸다. 두 축을 같은 숫자로 합치지 않는다.

`measurement-designed`는 core slot 점유의 선행 조건이 아니다. 다만 공식 표면으로 승격할 때는 최소 채점 의도를 설명할 수 있어야 하므로 annotation에 짧은 `measurementIntent`를 둔다. 상세 fixture, reset, eligibility, oracle은 대표 실행 후보 2~3건에만 먼저 만든다.

## 4. Core 20 착수 전 필수 수정

Claude Code의 독립 검토를 반영해 다음 세 건을 blocking으로 둔다.

1. compact packet에 `taskAction`과 `unknowns`를 포함한다.
2. slot ledger와 annotation ledger는 배치 산출물과 충돌하지 않는 저장 위치와 기록 경로를 먼저 확정한다.
3. `catalogAnnotator`와 `catalogAnnotationReviewer`를 정식 역할로 등록해 같은 컨텍스트의 작성·검토 재사용을 기계적으로 막는다.

다음 항목은 같은 revision에서 병행한다.

- annotation에 짧은 `measurementIntent`를 추가한다.
- 공식 표면 매핑 시 `markets`, 영문·한국어 짝, `title` 매핑이 필요함을 명시한다.
- `expectedDiagnosticAxes`는 근거가 있는 경우에만 제안하고, 측정 전 확정값으로 오인하지 않는다.
- `closingShaLedger` 자동 도출과 `validate-batch` 실측 대조를 추가한다.

## 5. 저비용 실행 방식

1. 스크립트가 56건의 계보, review verdict, comparison, category metadata와 raw-row SHA를 먼저 추출한다.
2. 중복이 아니고 비어 있는 슬롯을 채울 가능성이 높은 후보를 우선 정렬한다.
3. 의미 annotation에는 10건씩 두 개의 compact packet만 전달한다.
4. annotation 작성자와 검토자를 분리한다.
5. 수락된 후보만 portfolio apply하고 receipt로 고유 슬롯 점유를 증명한다.
6. 20개가 되지 않으면 부족 수량만 5건 단위 clean-room 배치로 생산한다.
7. Core 20 뒤 대표 2~3건만 상세 측정 자산과 합성 rehearsal로 보낸다.

모델 입력에는 전체 세션 기록, Notion, Slack, 과거 후보 본문, fixture, oracle을 넣지 않는다. 역할별로 필요한 최소 packet만 제공한다. 독립 검토가 필요한 판정 자체는 생략하지 않는다.

## 6. 시간·리소스 예상

Claude 검토 전 4~6시간 추정은 구현 범위를 낙관적으로 잡은 값이었다. 현재는 다음처럼 기록한다.

| 조건 | 예상 시간 |
|---|---:|
| v1.3.5 최소 구현 + 기존 후보에서 Core 20 확보 | 6~9시간 |
| 기존 후보만으로 20개가 안 되어 신규 0~5건이 필요한 경우 | 8~12시간 |

기존 전체 공정 대비 모델 입력·출력 60~75% 절감을 목표로 한다. 절대 토큰량은 계정 크레딧 잔량과 모델별 과금에 따라 달라 보장하지 않는다.

## 7. 역할 분담

### Codex

- v1.3.5 최소 schema·validator 구현
- ledger 저장 위치·역할 계약·SHA 자동 도출 확정
- 56건 deterministic prefilter와 compact packet 생성
- annotation 결과 기계 검증과 독립 review
- portfolio apply, 10x10 slot ledger, 진행판·Notion·Obsidian·PR 정합 관리

### Claude Code

- controller가 제공한 compact packet만 읽고 semantic annotation 작성
- 기존 전체 catalog, 과거 후보 본문, measurement asset은 읽지 않음
- 필요할 때만 빈 슬롯 brief를 받아 부족 수량을 clean-room으로 생산
- 결과는 역할 산출물과 closure로만 반환

### 신기헌

- 20개 중간 마일스톤과 최종 100개 목표의 우선순위 승인
- 공식 MICA 100과 연구 포트폴리오의 병존·대체 여부 같은 거버넌스 결정
- 팀 공유, PR 병합, 공개·정본 반영 판단

## 8. 외부 공유 시 사용할 표현

> 현재 56개의 동결 후보 계보가 있지만, 이것을 56개의 완성 과제로 세지 않습니다. 다음 단계에서 중복·카테고리·종료 유형·복잡도·시장 적용 범위를 독립적으로 annotation하고 검토해, 서로 다른 20개 포트폴리오 슬롯을 먼저 확정합니다. 이는 10개 카테고리별 10개, 총 100개를 채우기 위한 중간 마일스톤입니다. 상세 합성 측정 자산은 실제 실행 우선순위가 높은 2~3건에만 먼저 적용합니다.

## 9. 남아 있는 경계

- 공식 카탈로그의 기존 100건을 자동 대체하지 않는다.
- 연구 포트폴리오 100건은 필수 목표지만, 공식 편입은 별도 거버넌스 결정이다.
- 공개 후보와 비공개 holdout은 새 생산분부터 분리하고 export 단계에서 강제한다.
- 기존 공개 후보는 영구 공개 core로 취급하며 다시 holdout으로 돌리지 않는다.
- 실제 시장 성립, 현지 검토, 외부 서비스 실행, 점수 산출, PR 병합은 아직 승인된 결과가 아니다.

## 10. 관련 기록

- `2026-08-14-std-b12-closure-handoff.md`
- `2026-08-14-measurement-throughput-analysis.md`
- `2026-08-14-standard-v1.3.5-final-convergence.md`
- `2026-08-14-low-resource-core-20-plan.md`
- `2026-08-14-low-resource-core-20-claude-review.md`
