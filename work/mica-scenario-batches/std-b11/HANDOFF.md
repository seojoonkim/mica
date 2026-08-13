# std-b11 Claude Code 생산 인수인계

- origin: `kiheon-ideation`
- 상태: `PARKED-READY-FOR-CLAUDE-RESUME`
- 프로필: 표준 `standard`, 최대 5건, 계획 시간 6–12시간
- 방법 revision: `standard-v1.3.3`
- 방법 source commit: `e75aa1b28ef7a6bb5982bfdbf06b883d99a9c500`
- 목적: std-b10의 공정 결함 5건을 보정한 첫 실증 배치

## 시작

저장소 루트에서 현재 브랜치와 clean worktree를 확인한 뒤 아래 명령으로 controller를 승계한다. `<claude-session-id>`는 현재 Claude Code 세션을 식별할 수 있는 값으로 바꾼다.

```bash
python3 scripts/mica-batch-control.py resume \
  work/mica-scenario-batches/std-b11 \
  --controller-context-id claude-std-b11-controller \
  --session-id <claude-session-id> \
  --authorization-ref user-message:2026-08-13-continue-codex-claude
```

PASS 전에는 어떤 배치 산출물도 수정하지 않는다. PASS 뒤 `python3 scripts/mica-scenario-production.py validate-batch work/mica-scenario-batches/std-b11`을 실행한다.

## 생산 범위

- 독립 1차 자료에서 서로 다른 생활 부담을 최대 5건 조사한다. 수량을 채우지 않는다.
- source researcher와 need writer에게 기존 MICA 과제, 기존 50개 후보, 카테고리 분포, gap, comparison을 보여주지 않는다.
- 카테고리는 후보 동결 뒤 controller·comparator 단계에서만 사후 부착한다.
- 역할은 `role-prompts.md` 순서대로 서로 다른 컨텍스트에서 실행한다. 동시에 활성화하는 컨텍스트는 최대 2–3개이며 순서 의존 단계는 병렬화하지 않는다.
- 역할이 파일을 쓰기 전에 `assign-role`, 종료 뒤 실제 산출물 경로로 `complete-role`을 실행한다. 장시간 역할은 controller lease 만료 전에 `renew`한다.
- 거절 원문은 같은 배치에서 새 ID로 다시 쓰지 않는다. accepted-only 집합으로 계속하거나 0건으로 닫는다.
- 피측정 에이전트에는 `agent-visible.jsonl`만 전달한다. evaluator-visible·harness-private 정보는 숨긴다.

## 중단·종결

- 중단 전에는 `park --reason <reason>`으로 checkpoint를 만든다. 파일을 고친 뒤 소급 파킹하지 않는다.
- 중간 보고는 source review 종료, candidate freeze 종료, measurement·closure 종료 시점에만 간결하게 남긴다.
- 최종적으로 `validate-exposure`, `validate-batch`, 전 역할 완료 기록과 SHA 원장을 확인한다.
- manifest와 closure를 닫은 뒤 `mica-batch-control.py close`로 controller 상태도 닫는다.
- Notion·Slack 호출, git push, Vercel 배포, 정본 변경은 하지 않는다.

## 보고 형식

원천 수, 관찰 수락·거절, 후보 수락·거절, comparison 분포, 공개 입력 리허설 결과, 최종 designable 수, 공정 결함, 다음 배치 판단을 한국어로 보고한다. 구조 검증 PASS를 의미 품질·시장 타당성·실제 실행 성공으로 표현하지 않는다.
