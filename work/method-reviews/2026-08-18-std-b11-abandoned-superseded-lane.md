---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: controller-decision
scope: std-b11-lane-status
language: ko
asOf: 2026-08-18
decidedBy: 신기헌 (컨트롤러 권고에 따름)
appliesFrom: std-b11 인수 시도, 이후 이 lane 재개 판단
---

# std-b11 폐기 -- 두 번 대체된 구식 갈래

## 0. 결정

`work/mica-scenario-batches/std-b11`은 재개하지 않는다. controller lease는 승계했다가(`generation: 2`) 즉시 재파킹했고, 산출물 파일 13개는 전부 0줄인 원래 상태 그대로 남겨둔다. `batch-manifest.json`의 status는 `in-progress`로 두고 `completed`로 조작하지 않는다 -- 실제로 생산 단계가 하나도 실행되지 않았으므로 `completed`나 `zero-accepted` 어느 쪽도 사실이 아니다.

## 1. 왜 재개하지 않는가

`HANDOFF.md`는 std-b11을 "`PARKED-READY-FOR-CLAUDE-RESUME`"로, 표준 생산(최대 5건, 6-12시간)으로 설명한다. 문면만 보면 그대로 이어받을 수 있어 보였다. 실제로 lease를 승계하고 절차를 따라가려는 과정에서 산출물 13개 파일이 전부 0줄임을 발견했고(자료 조사조차 시작되지 않음), 이어서 이 lane 자체의 위치를 확인하는 과정에서 다음을 발견했다.

1. **방법론 버전이 두 세대 뒤처졌다.** std-b11은 `methodRevision: standard-v1.3.3`에 잠겨 있다. 그런데 `role-briefing` CLI는 `standard-v1.3.4`가 아니면 즉시 거부하고(`role-briefing-requires-standard-v1.3.4`), 현재 운영 정본은 `standard-v1.3.5`를 쓴다. v1.3.3에서 v1.3.5까지 두 번의 방법론 개정이 있었다.
2. **생산 메커니즘 자체가 대체됐다.** std-b11이 쓰는 "저장소 내부 배치"(`work/mica-scenario-batches/std-bN/*.jsonl`을 직접 쓰는 방식)는 `kh-b13` 이후 "job-packet clean-room exchange"(`work/mica-scenario-exchange/kh-bNN-<stage>/`에 역할별 패키지를 격리해 주고받는 방식, `scripts/mica-cleanroom.py`가 검증)로 완전히 바뀌었다. `work/method-reviews/2026-08-17-source-eligibility-check-restoration.md`는 구 lane을 "휴면 상태이므로 지금 하지 않는다"고 명시한다.
3. **현재 운영 정본(`work/method-reviews/2026-08-17-claude-primary-controller-handoff.md`, `asOf: 2026-08-17`)은 std-b11을 언급조차 하지 않는다.** 이 문서가 서술하는 "다음 배치" 계획(외식·예약, 이동·대중교통, 여행 계획·숙박, 주거·공과금 우선)은 job-packet clean-room lane을 전제로 한다. 이 문서 작성 시점 슬롯 점유는 48/100이었다.
4. **그 계획조차 이미 다른 경로로 추월당했다.** 사용자가 이후 draft-r1 경량 tier로 피벗했고, 이 세션에서 그 결과 100/100 슬롯이 채워졌다(`verified` 49 + `draft-r1` 51, 이후 재작업으로 조정). 즉 std-b11이 존재하는 이유(빈 슬롯을 채운다)는 이미 다른 방식으로 달성됐다.

정리하면 std-b11은 (구 in-repo lane, v1.3.3) → (job-packet clean-room, v1.3.5) → (draft-r1 경량 tier, 100/100 달성) 세 세대 이전의 화석이다. 지금 문자 그대로 재개하면 이미 두 번 대체된 파이프라인으로 6-12시간을 쓰고, 산출물도 현재 원장(`catalog-annotation`)에 바로 붙지 않아 별도 통합 작업이 필요하다.

## 2. 확인 과정에서 바로잡은 것

- 이 세션의 task 목록에 std-b11의 5단계(source research·review, need observation, task candidate, comparison, measurement)가 전부 "completed"로 잘못 기록돼 있었다. 실제로는 0건. 잘못된 상태를 사용자에게 그대로 전달할 뻔했으나, lease 승계 직전 파일을 직접 열어 재확인하며 발견해 정정했다.
- std-b12는 반대로 이미 정당하게 종료된 배치였다(`closedAt: 2026-08-13T17:20:00Z`, `status: zero-accepted`, 측정 자산 검토 1단계에서 후보 2건 모두 reject -- 근거 문제가 아니라 측정 설계 내부 정합성 결함). "이어서 진행"할 대상이 아니었다.

## 3. 하지 않은 것

- `batch-manifest.json`의 status를 `completed`로 바꾸지 않았다. `closure.json`의 status를 `zero-accepted`나 다른 종결값으로 바꾸지 않았다. 둘 다 실제로 일어나지 않은 생산·검토 활동을 있었다고 기록하는 것이므로 거짓이다.
- 산출물 파일(source-evidence.jsonl 등 13개)을 건드리지 않았다. 원래도 비어 있었고 지금도 비어 있다 -- 정직한 상태다.
- controller lease는 `parked` 상태로 남겨뒀다. 나중에 이 lane을 정말 재개하기로 결정이 바뀌면 `mica-batch-control.py resume`으로 다시 승계할 수 있다.

## 4. 대신 필요하면

verified tier 후보를 더 원하면, std-b11을 재개하는 대신 현재 유효한 메커니즘(job-packet clean-room exchange, `standard-v1.3.5`)으로 새 배치를 여는 편이 맞다. 우선순위는 여전히 `2026-08-17-claude-primary-controller-handoff.md` §7.1이 짚은 영역(외식·예약, 이동·대중교통, 여행 계획·숙박, 주거·공과금)과 겹칠 가능성이 높다 -- 이 영역들은 draft-r1 감사에서도 결함률이 가장 높았던 곳과 같다(구조적으로 1차 자료 조달이 어려운 영역).

이번 세션에서는 사용자가 아직 새 배치 착수를 명시적으로 요청하지 않았으므로 시작하지 않는다.
