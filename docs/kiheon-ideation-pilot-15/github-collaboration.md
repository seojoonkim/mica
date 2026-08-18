# MICA 시나리오 공동작업을 위한 GitHub 안내

> 이 문서는 GitHub 경험이 적은 작업자도 Draft PR #1에서 안전하게 협업할 수 있도록 현재 구조와 실행 순서를 설명한다.

- origin: `kiheon-ideation`
- status: `research-pilot-not-canonical`
- 대상 저장소: `seojoonkim/mica`
- 현재 작업 브랜치: `codex/mica-kiheon-pilot-15`
- 현재 검토면: [Draft PR #1](https://github.com/seojoonkim/mica/pull/1)

## 먼저 이해할 네 가지

1. **브랜치**는 팀의 `main`을 바로 바꾸지 않고 변경을 쌓는 별도 작업선이다.
2. **커밋**은 선택한 파일 변경을 설명과 함께 브랜치의 로컬 이력으로 묶는 일이다. 커밋만으로 GitHub나 사이트는 바뀌지 않는다.
3. **push**는 로컬 커밋을 GitHub의 같은 브랜치로 전송한다. 현재 브랜치를 push하면 Draft PR #1이 자동 갱신된다.
4. **PR 병합**은 검토를 마친 변경을 `main`에 합치는 팀 결정이다. push와 병합은 다른 일이며, 저장소 관리자 또는 팀이 병합한다.

## 현재 권장 운영 방식

- 방법론 보완과 후속 MICA 배치는 기존 `codex/mica-kiheon-pilot-15` 브랜치와 Draft PR #1에 이어서 쌓는다.
- 사이트 기능 변경, 점수 정책 변경, canonical 과제 변경처럼 성격과 위험이 다른 작업은 새 브랜치와 별도 Draft PR로 분리한다.
- Notion 포트폴리오 SSOT에서 배치 ID·카테고리·문제 가족·런타임을 예약한 뒤에만 새 자료 조사를 시작한다.
- Codex와 Claude Code가 같은 브랜치를 사용하더라도 각각 자신이 소유한 배치 경로만 커밋한다.
- 동결 전 후보 본문은 런타임 사이에 공유하지 않고, 상태·수량·해시·다음 행동만 공유한다.

## 안전한 커밋 순서

아래 명령은 저장소 루트에서 실행한다.

```bash
git switch codex/mica-kiheon-pilot-15
git status --short --branch
python3 scripts/mica-scenario-production.py preflight
python3 scripts/mica-scenario-production.py validate-batch work/mica-scenario-batches/<batch-id>
```

검증이 통과하면 자신이 소유한 파일만 명시해서 추가한다. 공유 작업장에서는 `git add .`를 사용하지 않는다.

```bash
git add work/mica-scenario-batches/<batch-id>/ \
  docs/kiheon-ideation-pilot-15/<수정한-문서>
git diff --cached --name-only
git diff --cached --check
git commit -m "mica: complete <batch-id> <stage>"
```

`git diff --cached --name-only`에 다른 런타임의 배치나 의도하지 않은 파일이 보이면 커밋하지 말고 선별 상태를 다시 정리한다.

## push와 PR 갱신

현재 저장소에 쓰기 권한이 있는 작업자는 아래 명령으로 기존 Draft PR을 갱신할 수 있다.

```bash
git push origin codex/mica-kiheon-pilot-15
```

이 명령은 `main`을 바꾸거나 PR을 병합하지 않는다. GitHub의 Draft PR #1에 새 커밋과 파일 차이를 추가할 뿐이다. 외부 push는 기헌이 변경 파일과 커밋을 확인한 뒤 실행한다.

쓰기 권한이 없는 작업자는 저장소를 자신의 계정으로 fork하고, fork의 브랜치에서 원본 저장소 `main`을 향하는 PR을 만든다. 현재 Draft PR #1은 원본 저장소 안의 브랜치를 사용하므로 fork가 필요하지 않다.

## 새 브랜치와 별도 PR이 필요한 경우

다음 중 하나면 현재 PR에 섞지 않는다.

- canonical 100개 과제나 점수 정책을 바꾸는 경우
- 사이트 UI 또는 배포 동작을 바꾸는 경우
- MICA 시나리오 제작과 무관한 리팩터링이나 인프라 변경
- 독립적으로 되돌리거나 별도 승인해야 하는 고위험 변경

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/mica-<짧은-작업명>
```

새 작업도 처음에는 Draft PR로 열고, 목적·범위·검증·남은 한계를 본문에 적는다.

## 이슈는 언제 쓰는가

Issue는 필수 단계가 아니다. 다음처럼 저장소 안에서 오래 추적할 문제에만 사용한다.

- 팀 판단이 필요한 방법론 변경
- 여러 PR에 걸쳐 해결할 검증기 결함
- 담당자와 완료 조건이 필요한 후속 85건 계획
- 재현 가능한 버그나 공개 전 차단 조건

개별 소규모 배치의 실시간 상태는 Notion 포트폴리오 SSOT와 배치 manifest로 관리하고, 저장소 전체가 알아야 할 문제만 Issue로 승격한다.

## 금지 사항과 복구 원칙

- `main` 직접 push, 강제 push, 다른 사람 변경 되돌리기, `git add .`를 하지 않는다.
- 원격과 로컬이 갈라졌다면 강제 정리하지 말고 `git fetch origin` 후 차이를 확인한다.
- 공유 브랜치를 당겨야 할 때는 작업장이 깨끗한지 먼저 확인하고 `git pull --ff-only`를 사용한다.
- 충돌이 나면 후보 내용을 임의로 합치지 말고 배치 소유자와 controller가 파일 소유권을 먼저 확인한다.
- PR 병합, canonical 반영, 공개 배포는 시나리오 제작 완료와 별도 승인이다.

## 팀 검토자가 확인할 것

- 변경 파일이 선언한 배치와 문서 범위에 한정됐는가
- 작성자·검토자·동결 담당자가 분리됐는가
- `preflight`와 해당 `validate-batch`가 통과했는가
- 수락·거절·보류가 수량 목표 때문에 바뀌지 않았는가
- 실제 실행·시장 성립·공개 적합성을 완료로 과장하지 않았는가
- 다음 작업자가 배치 manifest와 closure만으로 이어갈 수 있는가
