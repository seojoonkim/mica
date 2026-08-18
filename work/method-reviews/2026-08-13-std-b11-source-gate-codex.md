# std-b11 자료 관문 Codex 선검토

- origin: kiheon-ideation
- 검토 언어: 한국어
- 상태: 조치 요청
- 기준일: 2026-08-13
- 검토 범위: std-b11 source evidence와 독립 source review 단계
- 제외 범위: 생활 필요 관찰, 과업 후보, 사후 비교, 측정 자산, 기존 후보 내용

## 결론

구조 관문과 standard-v1.3.3 회귀는 통과했다. 그러나 `ev-b11-02`의 한계 서술과 `sr-b11-02`의 accept 판정이 역할 계약과 충돌하므로 need writer 시작 전 보정이 필요하다.

## 통과한 항목

1. controller 상태는 active이고 generation 2다.
2. source researcher와 source reviewer는 서로 다른 context다.
3. source evidence 5행과 source review 5행이 ID 기준으로 일대일 대응한다.
4. source researcher와 source reviewer의 역할 선점, 완료 시각, 산출물 SHA 원장이 기록돼 있다.
5. `validate-batch`는 in-progress 상태에서 통과했다.
6. 전체 preflight와 생산 스크립트 테스트 2건, controller 테스트 3건이 통과했다.
7. 아직 need writer, 후보 작성, 비교, 측정 단계 산출물은 생성되지 않았다.

## 차단 항목

`ev-b11-02.limitations`는 신청 급증에 통신사 침해사고 등 개별 사건의 영향이 있다고 자료가 밝혔다고 서술한다. 독립 reviewer는 원문에 그러한 인과 서술이 없다고 확인했다. 그런데 `sr-b11-02`는 이를 nonBlockingNotes에만 남기고 verdict를 accept로 기록했다.

이 상태는 다음 계약과 충돌한다.

- `role-prompts.md`: source reviewer는 발행 주체, 관찰 범위, 인구·시장 범위, 한계를 확인하며 범위를 넘는 주장이 있으면 reject한다.
- `agent-production-contract.md`: source 단계의 관문은 독립 reviewer가 범위와 한계를 수락하는 것이다.
- `SKILL.md`: source reviewer가 범위와 한계를 확인한 뒤에만 다음 단계로 진행한다.

검사 키 집합에 `limitationsHonesty`가 빠졌다는 `df-b11-02` 기록은 원인을 보존하지만, 이미 확인된 범위 밖 주장을 accept해도 된다는 근거는 아니다.

## 최신성 보강 확인

`ev-b11-01`은 2023년 보도자료를 근거로 현재형 제도 상태를 서술한다. Codex가 국가법령정보센터의 현행 행정규칙을 별도로 확인한 결과, 2025년 1월 1일 시행본에서도 제6조제11호 가목의 관리비 비목 표시 단서가 유지돼 있다. 따라서 현재형 상태 자체는 공식 현행 자료로 보강 가능하다. 다만 이 확인은 원본 source evidence를 고치는 근거가 아니며, controller 또는 독립 reviewer가 별도 근거 포인터로 기록할지 판단해야 한다.

- 현행 행정규칙: https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000250356&chrClsCd=010201
- 시행 정보: 2025년 1월 1일, 국토교통부고시 제2024-748호

## 필요한 조치

1. 원본 `source-evidence.jsonl` 행은 수정하지 않는다.
2. `sr-b11-02`를 reject로 정정하고 accepted-only source 집합으로 계속하거나, 계약상 허용되는 별도 독립 재심 절차와 새 reviewer context로 다시 판정한다.
3. 같은 배치에서 원문 evidence를 새 ID로 다시 작성하지 않는다.
4. source review 산출물, 역할 완료 기록, SHA 원장, 결함 원장을 다시 결속한다.
5. `validate-batch`를 다시 실행한 뒤 need writer를 시작한다.

## 다음 revision 후보

active 배치의 method lock은 변경하지 않는다. std-b11 종결 뒤 다음 revision에서 아래를 검토한다.

- source review의 최소 검사 키를 계약에 고정한다.
- `limitationsHonesty`를 필수 키로 둔다.
- controller가 역할 브리핑에 스키마와 키 개수를 손으로 다시 쓰지 않고 계약에서 기계적으로 불러오게 한다.
- reviewer가 원문에 없는 사실이나 인과를 확인한 경우 accept를 구조적으로 금지한다.

## 실행 증거

```text
PASS batchId=std-b11 controllerStatus=active generation=2 roleClaims=3 roleCompletions=2
PASS batchId=std-b11 productionProfile=standard batchStatus=in-progress
PASS skill=mica-scenario-production selectionRequired=True
test-mica-scenario-production.py: 2 tests OK
test-mica-batch-control.py: 3 tests OK
```
