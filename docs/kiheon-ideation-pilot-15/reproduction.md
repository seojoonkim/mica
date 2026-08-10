# 재현 가이드

## 실행 환경

저장소 루트에서 Codex 또는 Claude Code를 시작한다. Codex는 `.agents/skills/mica-scenario-production/`, Claude Code는 `.claude/skills/mica-scenario-production/`을 프로젝트 스킬로 읽는다. 개인 홈 디렉터리 설치나 특정 컴퓨터의 절대경로는 필요하지 않다.

```bash
python3 scripts/mica-scenario-production.py preflight
python3 scripts/mica-scenario-production.py new-batch --batch-id <batch-id> --count 5
```

그 뒤 Codex에서는 `$mica-scenario-production <batch-id>`, Claude Code에서는 `/mica-scenario-production <batch-id>`로 시작한다. 역할별 새 컨텍스트에는 [`role-prompts.md`](./role-prompts.md)의 해당 블록과 허용 입력만 전달한다.

## 한 배치의 권장 크기

처음에는 최대 5개의 생활 필요로 전체 공정을 끝까지 반복한다. 새 구조 결함이 없고 기존 결함 회귀 검사가 통과한 뒤에만 10개로 늘린다. 후보 수를 맞추기 위해 수락하거나, 거절된 원문을 조용히 수정하지 않는다.

## 실행 순서

1. 공식 과제 목록이 아닌 1차 자료에서 최대 5개의 bounded evidence를 고정한다.
2. 독립 출처 검토자가 발행 주체·원문 위치·관찰 범위·한계를 확인한다.
3. 격리된 작성자가 해결책 없는 생활 필요 관찰만 작성한다.
4. 운반 담당자는 응답을 의미 수정 없이 저장하고 원문 행 해시를 기록한다.
5. 독립 검토자가 근거 정렬·비처방성·창작 사실 금지·상태 변화 명료성을 판정한다.
6. 수락 관찰만 동결한다.
7. 새 번역자가 동결 관찰과 과업 schema만 받아 종단 간 상태 변화를 설계한다.
8. 독립 후보 검토자가 추적성·실행 단위·권한·금지 상태·문서형 종료를 판정한다.
9. 수락 후보만 동결한다.
10. 동결 뒤 대조자가 기존 과제를 열어 `duplicate/transformation/independent-finding/hold`를 판정한다.
11. 별도 역할이 fixture, reset, attempt eligibility를 만든다.
12. 독립 oracle 역할이 정상·실패·복구의 이분 판정을 작성한다.
13. 별도 measurement reviewer가 실제 파일 결속과 모든 분기를 확인한다.
14. coverage readback과 결함 원장을 작성한다.
15. typed audit가 건수·역할·해시·역류 금지를 확인한 뒤 배치를 닫는다.

## 배치별 필수 기록

- input manifest와 허용/금지 입력
- 원천 관찰, 독립 검토, accepted-only freeze
- 과업 후보, 독립 검토, accepted-only freeze
- 사후 대조와 측정 계약
- fixture/reset/eligibility/oracle
- coverage readback, 결함 원장, 완료 증거
- 다음 배치의 유지·승격·중단 판정

## 즉시 중단 조건

- 작성자 또는 번역자에게 기존 과제·후보·gap 힌트가 노출됨
- 필수 path·hash·schema가 없는데 값을 추측함
- 작성자와 검토자 역할이 합쳐짐
- 근거가 지지하지 않는 시장 사실·당사자·수치가 추가됨
- 요청·접수·문서만으로 외부 상태 완료를 주장함
- 승인 없는 외부 변경 또는 민감정보 전송이 포함됨
- 원문과 판정을 사후에 덮어씀

## 다음 단계

이 15건을 이어서 사용하려면 후보 제작보다 먼저 시장별 근거 검토, simulator 교정 사전등록, 실제 자산 전수 재검증, public/private 분리를 수행한다. live 실행이나 점수 산출은 그 뒤의 별도 승인 대상이다.
