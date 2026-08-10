---
name: mica-scenario-production
description: MICA 생활과업 시나리오를 독립 근거에서 최대 5개씩 제작하고, 역할 분리 검토·동결·사후 대조·simulator 측정 설계까지 재현할 때 사용한다. 기존 과제나 앞선 후보를 발상 입력으로 쓰거나, 작성자가 자기 결과를 심사하거나, 시장·실행·공개 적격을 추정하는 작업에는 사용하지 않는다.
---

# MICA 시나리오 제작

이 저장소 안의 방법론과 도구만 사용해 `origin=kiheon-ideation` 시나리오 배치를 만든다. 개인 홈 디렉터리, 특정 컴퓨터의 절대경로, 별도 vooy 저장소를 요구하지 않는다.

## 시작

1. 저장소 루트에서 다음을 실행한다.

   ```bash
   python3 scripts/mica-scenario-production.py preflight
   ```

2. 다음 문서를 전부 읽는다.
   - `docs/kiheon-ideation-pilot-15/methodology.md`
   - `docs/kiheon-ideation-pilot-15/reproduction.md`
   - `docs/kiheon-ideation-pilot-15/agent-production-contract.md`
   - `docs/kiheon-ideation-pilot-15/role-prompts.md`
3. 새 배치를 만든다. `$ARGUMENTS`에 배치 ID가 있으면 사용하고, 없으면 사용자에게 짧은 영문 소문자 ID를 받는다.

   ```bash
   python3 scripts/mica-scenario-production.py new-batch --batch-id <batch-id> --count 5
   ```

## 절대 경계

- 작성자와 번역자에게 `candidate-specs.json`, 기존 MICA 과제, 웹 과제 목록, 과거 후보, 비교 판정, gap·카테고리 할당을 보여주지 않는다.
- 공식 자료는 방법론과 사후 비교 근거로만 쓴다. 기존 문항의 소재·표현·수량을 발상 seed로 쓰지 않는다.
- source researcher, source reviewer, need writer, observation reviewer, translator, candidate reviewer, comparator, measurement asset author, oracle reviewer, measurement reviewer를 서로 다른 컨텍스트로 실행한다.
- 한 모델이나 한 대화에서 역할 이름만 바꿔 자기심사하지 않는다. 독립 컨텍스트를 만들 수 없으면 중단하고 별도 세션으로 인계한다.
- 근거에 없는 사업자명, 시장 수치, 표본수, 당사자, 기간, 비용, 성공률을 만들지 않는다.
- 단순 요청·접수·문서 생성으로 외부 상태 완료를 주장하지 않는다. 권위 있는 readback 또는 명시된 안전한 인계 상태가 있어야 한다.
- 시장 검토, 실제 실행, 점수 산출, 공개·정본 편입은 이 스킬의 승인 범위가 아니다.
- Notion·Slack·배포·정본 변경·git push는 사람의 명시 승인을 받은 별도 단계다.

## 실행 단위

- 한 배치는 최대 5개의 독립 생활 필요만 다룬다.
- 수락 수량을 맞추지 않는다. 0개 수락도 유효한 결과다.
- 전체 공정을 닫고 새 실행 가능한 공정 결함이 없으며 회귀 검사가 통과한 뒤에만 다음 배치를 시작한다.
- 누적 목표의 분모는 초안 수가 아니라 `measurable-candidate` 수다.

## 역할별 실행

`role-prompts.md`에서 해당 역할의 프롬프트만 새 컨텍스트에 전달한다. 각 역할에 허용된 파일만 제공하고, 결과를 `work/mica-scenario-batches/<batch-id>/`의 대응 JSONL에 그대로 저장한다.

1. 독립 1차 자료를 고정하고 source reviewer가 범위와 한계를 확인한다.
2. need writer가 해결책 없는 관찰을 작성하고 observation reviewer가 독립 판정한다.
3. 수락 관찰만 동결한다.
4. translator가 상태 변화 과업으로 번역하고 candidate reviewer가 독립 판정한다.
5. 수락 후보만 동결한다.
6. 그 뒤에만 comparator가 기존 과제와 파일럿 15건을 열어 사후 대조한다.
7. measurement 역할들이 fixture·reset·eligibility·oracle을 분리 작성·검토한다.
8. controller가 결함 원장과 종료 판정을 기록한다.

## 모델 기준

- 권장: 사용 가능한 최상위 추론 모델, 높은 추론 설정. Codex에서는 GPT-5.6 Sol `xhigh` 이상을 기준으로 삼는다.
- 최소: 도구 사용과 장문 구조화가 가능한 최신 상위권 모델의 `high` 추론 설정.
- 더 낮은 모델을 쓰면 source 정리나 형식 검사처럼 좁은 역할에만 배치하고, 의미 검토·번역·oracle·최종 판정은 권장 사양으로 재검토한다.
- 모델 사양은 역할 분리, 증거 결속, 독립 검토를 대체하지 않는다.

## 완료

다음을 실행해 구조를 확인한다.

```bash
python3 scripts/mica-scenario-production.py validate-batch \
  work/mica-scenario-batches/<batch-id>
```

구조 검증 PASS는 의미 품질이나 벤치마크 채택 승인이 아니다. 사람에게는 수락·거절·보류, 발견한 결함, 다음 배치 유지·중단 판단을 함께 보고한다.
