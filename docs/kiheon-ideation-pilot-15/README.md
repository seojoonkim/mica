# MICA 독립 아이데이션 파일럿: 측정 가능 후보 15건

> English summary: This draft contribution documents an intermediate, iteration-based clean-room method and 15 of a planned 100 simulator-designable task candidates. It is not a final methodology, canonical catalogue update, or benchmark result. The remaining 85 measurable candidates are planned as later reviewed batches, followed by a full-set analysis.

- provenance: `origin=kiheon-ideation`
- status: `research-pilot-not-canonical`
- maturity: `intermediate-iteration-release`
- progress: `15 / 100 measurable-candidate`
- publication eligibility: `false`
- scope: 방법론, 재현 절차, 공개용 후보 명세, 통합 한계

## 현재 완성도와 진행 위치

이 패키지는 100% 완성된 방법론이나 최종 벤치마크가 아니다. 서로 다른 배치에서 제작·독립 검토·동결·사후 대조·측정 설계를 반복하며 얻은 **근거 기반 중간 버전**이다. 방법론의 신뢰도는 정량 백분율이 아니라, 실제 이터레이션에서 결함을 발견하고 유효하지 않은 산출물을 차단한 기록으로 뒷받침한다.

현재 `measurable-candidate`는 15건이다. 목표 100건까지 남은 85건도 같은 관문으로 단계적으로 제작한다. 새 실행 가능한 공정 결함이 있는 동안에는 5개 단위를 유지하고, 결함 회귀가 통과하며 새 보완점이 발견되지 않을 때만 10개 단위로 늘린다. 100건에 도달한 뒤에는 전수 중복·coverage·측정·시장·실행 적합성을 다시 분석한다.

## 왜 이 패키지를 공유하는가

이 작업은 MICA의 현재 100개 과제를 정답이나 발상 seed로 복제하지 않고, 공식 1차 자료에서 관찰한 생활 필요를 독립적으로 과업 후보로 번역할 수 있는지 시험했다. 공식 MICA 과제와 내부 비교 자료는 후보가 동결된 뒤에만 대조에 사용했다.

평가 단위는 단일 모델이 아니라 라우팅·메모리·도구·현지화·안전·복구를 포함하는 완성형 에이전트 시스템이다. 과업 완료는 에이전트 자기 보고가 아니라 외부 상태 변화와 권위 있는 readback으로 판정한다.

## 파일럿 결과

| 항목 | 결과 |
|---|---:|
| 원천 관찰 | 18 |
| 독립 검토 후 동결 관찰 | 17 |
| 번역 후보 | 17 |
| 독립 후보 검토 수락 | 15 |
| 독립 후보 검토 거절 | 2 |
| 사후 대조 `transformation` | 12 |
| 사후 대조 `independent-finding` | 3 |
| measurement v0.4 `designable` | 15 |

15건 모두 합성 simulator에서 fixture, reset, attempt eligibility, 독립 oracle을 설계할 수 있는 상태다. 실제 실행 성공, 시장별 성립, 대표성 또는 공개 평가 적합성을 뜻하지 않는다.

## 15개 후보

| ID | 공개용 과업 라벨 | 측정하려는 상태 변화 | 사후 대조 |
|---|---|---|---|
| KI-P15-001 | 접수 후 문제 상태 추적 | 해결 근거 또는 책임 있는 인계 확인 | transformation |
| KI-P15-002 | 재활 보조제품 접근 계획 | 적합성·제공 경로·훈련 계획 결속 | transformation |
| KI-P15-003 | 다기관 공통 사실 접수 | 두 접수의 독립 수신과 공통 필드 일치 | transformation |
| KI-P15-004 | 공공서비스 관할 접수 | 책임 기관 수리·담당 단위·다음 행동 확인 | transformation |
| KI-P15-005 | 기관 간 사례 인계 | 출발·도착 사건 연결과 양방향 상태 확인 | transformation |
| KI-P15-006 | 근무조정·돌봄지원 결합 | 충돌 시간대의 승인 일정 또는 확정 예약 확인 | transformation |
| KI-P15-007 | 소득충격 납기·지원 조정 | 필수 의무의 지급 가능 또는 확정 연기 확인 | transformation |
| KI-P15-008 | 출생 등록·증명서 발급 | 등록 완료와 증명서 발급의 독립 상태 확인 | transformation |
| KI-P15-009 | 국경 간 학력·자격 평가 | 권한 기관의 최종 판정·이유·이의 경로 확인 | independent-finding |
| KI-P15-010 | 취소 항공편 구제 실행 | 승인 선택과 환불·재예약 외부 이행 결속 | transformation |
| KI-P15-011 | 국경 이동 사회보장 권리 | 기간·권리·급여 결정의 기관 기록 조정 | independent-finding |
| KI-P15-012 | 신용정보 분쟁 처리 | 접수·조사·보고서 반영의 결과 분기 확인 | transformation |
| KI-P15-013 | 사망 후 후속 상태 처리 | 권한·선행 상태별 등록·통지·처리 결과 확인 | transformation |
| KI-P15-014 | 불용 의약품 안전 처분 | 품목별 지침·수용 경로·처분 readback 확인 | transformation |
| KI-P15-015 | 비동의 친밀 콘텐츠 피해 회복 | 증거 보존 뒤 제거·위협 중단·지원 상태 확인 | independent-finding |

상세 공개용 초안은 [`candidate-specs.json`](./candidate-specs.json), 공정은 [`methodology.md`](./methodology.md), 반복 실행 절차는 [`reproduction.md`](./reproduction.md)에서 확인할 수 있다.

## 이 PR이 채택되면 저장소 보유자가 할 수 있는 일

- 15개 후보를 기존 MICA 문항과 분리된 연구 초안으로 검토하고 토론할 수 있다.
- 각 후보의 사용자 요청, 실행 행동, 완료 상태, 승인 경계, 금지 상태, 실패·복구 구조를 구현 명세의 출발점으로 사용할 수 있다.
- [`reproduction.md`](./reproduction.md)의 역할 분리와 중단 조건으로 다음 배치를 독립 재현할 수 있다.
- 후보별 simulator fixture·reset·attempt eligibility·oracle을 구현하고 실제 시스템을 반복 평가할 수 있는지 검증할 수 있다.
- 후속 배치의 수락·거절·보완 이력을 별도 PR로 누적하면서 100건 원장을 구성할 수 있다.
- 시장별 성립, 현지화, 실행, 공개·비공개 편입 여부를 시나리오 제작과 분리해 심사할 수 있다.

채택은 이 15건을 canonical task나 공개 벤치마크 문항으로 자동 승인하는 행위가 아니다. 저장소 안에서 팀이 같은 방법론을 검토·재현하고 다음 결정을 이어갈 수 있도록 **버전이 고정된 중간 연구 기준점**을 추가하는 것이다.

## 100건까지의 후속 계획

1. 현재 15건과 방법론을 팀이 검토하고 재현한다.
2. 다음 후보는 5개 단위로 근거 조사부터 측정 판정까지 전체 관문을 반복한다.
3. 새 공정 결함이 없고 이전 결함의 회귀가 통과하면 10개 단위로 승격한다.
4. 결함이 재발하면 즉시 5개 단위로 돌아가 계약과 검증을 보완한다.
5. 추가로 통과한 `measurable-candidate`만 원장에 누적해 최소 85건을 더 확보한다.
6. 총 100건에서 실질 중복, coverage 편중, oracle·reset 일관성, 시장·실행·공개 경계를 전수 분석한다.

수량을 맞추기 위해 거절·보류 후보를 통과로 바꾸지 않는다. 따라서 작성되는 raw 초안 수는 남은 85건보다 많을 수 있다.

## 핵심 한계

- 6개 시장 적용 상태는 전 후보에서 `unverified`다.
- 모든 측정 준비는 simulator 기준이며 live 실행은 하지 않았다.
- timeout, 목표 비용, 반복 수, 공개 threshold는 교정되지 않았다.
- 공공·제도·권리·민감 행정성 과업이 많아 전체 생활과업 대표성을 주장할 수 없다.
- 공개 후보와 비공개 평가 후보의 분리 설계는 후속 거버넌스 과제다.

## 이 PR이 바꾸지 않는 것

기존 100개 canonical task, demo 데이터, 점수 정책, 사이트 화면을 변경하지 않는다. 이 패키지는 팀 검토와 재현을 위한 독립 연구 초안이다.
