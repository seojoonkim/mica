# kh-b13 clean-room 실행 기록

- 기준일: 2026-08-17
- origin: `kiheon-ideation`
- 배치: `kh-b13`
- 방법: `standard-v1.3.5`, filesystem-isolated clean-room
- 기준 Git commit: `0d7f01c643085d1aefaa3fcfd6a28c5a0a3341b4`
- 작업 PR: <https://github.com/seojoonkim/mica/pull/1>
- 현재 상태: 후보 동결과 사후 대조 완료, catalog annotation 대기

## 1. 왜 이 기록이 필요한가

`kh-b13`은 저장소 밖 읽기 전용 job package와 역할별 신규 컨텍스트를 실제 생산 공정 전체에 적용한 첫 배치다. Claude Code 화면에는 역할마다 별도 세션이 열렸고, 수정 실행이나 사용자가 정리한 세션도 있다. 세션 목록은 실행 편의를 위한 UI이며 작업 정본이 아니다.

이 배치의 정본은 다음 네 가지다.

1. 역할별 `READY.json`, `INPUT-MANIFEST.json`, `ROLE-CONTRACT.md`
2. 역할 산출물과 `CLOSURE.json`
3. controller가 다시 계산한 SHA-256과 `CONTROLLER-RECEIPT.md`
4. 이 파일들을 보존한 Git commit

세션이 닫히거나 UI에서 삭제돼도 위 파일과 commit이 남아 있으면 accepted 체인을 재구성할 수 있다. 반대로 세션이 화면에 남아 있어도 controller가 수락하지 않은 산출물은 다음 단계의 입력이나 성과 수치로 세지 않는다.

## 2. 실행 결과 요약

```text
공식 1차 근거 5
  -> 독립 원천 검토 수락 5
  -> 필요 관찰 4
  -> 독립 관찰 검토 수락 2 / 거절 2
  -> 관찰 동결 2
  -> 과업 후보 1 / 미번역 관찰 1
  -> 독립 후보 검토 수락 1
  -> 후보 동결 1
  -> 사후 대조 transformation 1
  -> catalog annotation 대기 1
```

이번 배치에서 최종 동결된 후보는 `ki-b13-02`, 숙박 예약 취소와 환불 요청 처리다. 아직 catalog annotation, 고유 슬롯 배정, measurement design, 합성 실행, 외부 실서비스 실행을 완료한 상태는 아니다.

## 3. 역할별 accepted 체인

| 순서 | 역할과 job | context ID | 입력과 판정 | accepted 산출물 |
|---:|---|---|---|---|
| 1 | `sourceResearcher`, `kh-b13-source-research` | `1ef8863e-485f-42bf-a439-d3ec28b90a59` | 외식·예약, 이동·대중교통, 여행·숙박 영역의 공식 1차 출처 조사 | 근거 5행, SHA `730745b4f9fda570808845140fc53cd1788e0a2a547b8cc12ef687dcbf8ad57c` |
| 2 | `sourceReviewer`, `kh-b13-source-review` | `7f907f3c-d81c-4f59-b8af-ef4c4cf9109d` | 공식 게시 페이지와 첨부 원문을 독립 대조 | 수락 5, 거절 0, SHA `d8adfce47c21fdd9c55579f71e8238908d08b844115d73d7874a26aaf599e99c` |
| 3 | `needWriter`, `kh-b13-observation-write` | `4a1507bf-1c32-42de-90db-da1ec0691102` | 수락 근거 5건을 중복 없이 사용 | 필요 관찰 4행, SHA `1ca7f5713722c69d0a312530402c0dd933c665a3ed115da2dce736c7d8e6acda` |
| 4 | `observationReviewer`, `kh-b13-observation-review` | `913ff582-0dfe-4ab0-96ad-42c379853a71` | evidence alignment, need boundary, non-prescription, no invented facts, state change clarity 독립 판정 | 수락 2, 거절 2, SHA `ffc5df8fb304eed070d4ff9cc9b0b4c8c2e1c2adfb22007cbdcec2288322a01a` |
| 5 | `observationCustodian`, `kh-b13-observation-freeze` | `efd61526-3cbf-4a5e-91ba-1998471fa584` | review closure receipt 3중 SHA 확인, 의미 재판정 없이 accepted-only 동결 | 동결 관찰 2행, SHA `f2a4493c794acd25f3c7450c066a00d48abe96db7c76d4f63dfea0717bc362bb`, closure SHA `71f74c3ba94a0789df471779ed86c319a64c1be012e8b73a91335bc27a1ebf88` |
| 6 | `taskTranslator`, `kh-b13-task-translation` | `03472bb9-854a-4ceb-86bb-c7c0e5af9fa7` | 동결 관찰 2건 중 실행 계약으로 번역 가능한 1건만 사용 | 후보 `ki-b13-02` 1행, SHA `c5a3e394b5de3ac8bd1155d989e8b58815d34a808271d8367362908f076f0cba` |
| 7 | `candidateReviewer`, `kh-b13-candidate-review` | `791687fa-7033-43cf-bd1e-24a6d2fe6118` | 10개 열 기준을 독립 판정 | 수락 1, 거절 0, hold 0, SHA `5737f304395dcde66685760ca6796b251584ca320bc37d18c41be7d7d4bb876c` |
| 8 | `candidateCustodian`, `kh-b13-candidate-freeze` | `4b6a1bc7-7367-4d0f-8b4b-09d25b352a7f` | candidate와 review raw-row SHA 및 review closure receipt 확인, 의미 재판정 없이 accepted-only 동결 | 동결 후보 1행, SHA `d70986a23ed6e1b7c71afb7ed7b4003a506be15d24832409e87e3a0b1f5ccc80`, closure SHA `e67b6c4a116d04e8e1447afd90c9e3b75bc27254a297069100153cec1b35b91e` |
| 9 | `comparator`, `kh-b13-post-freeze` | `codex-kh-b13-comparator-20260817` | 동결 뒤 기존 재고와 사후 대조 | `transformation`, `travel-accommodation` 분류 힌트, comparison SHA `67041ae74be3f95488ff69a7e59297808b644ddabc79f5d3487c247baabb2f43` |

## 4. 관문에서 멈춘 항목

### 관찰 거절 2건

- `ob-kh-b13-01`: 소비자의 독립 생활 필요보다 음식점 사업자의 고시 적용과 운영 목표가 중심이었다. `needBoundary`와 `stateChangeClarity`를 통과하지 못했다.
- `ob-kh-b13-02`: 반복 노쇼로 인한 사업체 영업 손실이 중심이어서 개인 생활 필요 경계를 통과하지 못했다.

두 행은 수량을 맞추기 위해 고치거나 다음 단계로 넘기지 않았다.

### 미번역 관찰 1건

- `ob-kh-b13-03`: 통근 시간과 거리의 집단 통계는 생활 부담을 보여 주지만, 개인 사용자의 출발 상태, 권한, 바꿀 수 있는 외부 상태와 readback을 근거만으로 확정할 수 없었다.

발명 없이 실행 가능한 과업 계약을 만들 수 없어 후보로 번역하지 않았다.

### observation freeze 1차 시도 거부

첫 custodian 실행은 accepted 2행을 정확히 골랐지만 controller가 전달한 observation review closure receipt가 62자리였다. SHA-256 결속으로 인정할 수 없으므로 적용하지 않았다.

- 실패 증거: `work/mica-scenario-exchange/kh-b13-observation-freeze/attempt-001-rejected/`
- 실패 출력 SHA: `1dad35f3959ee462c4aa0635e59b87eb0d61f5cb3c71ea06e07528ec77cf2f31`
- 실패 closure SHA: `3b0e68292e1f0e4558b21e83e2f63d484996f3f3bcf0cd83cc20e905888122b1`

수정 package에는 실제 review closure 파일을 포함하고 파일 실제 SHA, READY, receipt의 3중 일치를 의무화했다. accepted 체인에는 수정 후 새 custodian 결과만 포함한다.

## 5. 입력 경계와 역할 분리

- 동결 전 모든 역할은 저장소 밖 `/private/tmp/mica-clean-room-jobs/<job-id>`의 읽기 전용 package에서 실행했다.
- package와 상위 경로에는 `.git`이 없고, 시작과 종료 시 `PACKAGE-SHA256.txt`를 검증했다.
- accepted 역할의 `forbiddenInputReads`는 모두 0이다.
- accepted 역할의 Slack과 Notion 호출은 모두 0이다.
- source researcher와 source reviewer의 공식 원문 접근만 역할 계약에 따라 허용했다. 이후 역할의 외부 조사와 웹 호출은 0이다.
- 각 의미 작성·검토·동결 역할은 앞선 역할과 다른 context ID를 사용했다.
- custodian은 의미를 다시 판정하지 않고 수락 행의 바이트, 순서와 SHA만 보존했다.
- GitHub, 진행 웹, Notion, Obsidian에 기록된 정보는 존재하더라도 `READY.json`과 `INPUT-MANIFEST.json`에 없으면 동결 전 역할의 허용 입력이 아니다.

## 6. Claude Code 세션 수와 삭제에 대한 해석

역할마다 새 Claude Code 세션을 연 것은 하나의 과업을 불필요하게 여러 번 만든 것이 아니라, 자기심사와 이전 재고 역류를 막기 위한 역할 분리다. 수정 package를 재실행하거나 사용자가 UI 세션을 정리하면 같은 job 이름의 세션이 둘 이상 보이거나 일부가 사라질 수 있다.

따라서 다음 원칙을 적용한다.

- 세션 제목과 화면의 개수는 진행률이 아니다.
- 삭제된 세션을 복원할 필요는 없다. accepted 산출물, CLOSURE, context ID, controller receipt와 Git commit이 남아 있으면 된다.
- 같은 job의 여러 실행 중 accepted 체인은 controller가 receipt로 수락한 한 실행뿐이다.
- 실패 실행은 성공으로 덮지 않고 `attempt-*-rejected`처럼 별도 보존한다.
- 다음 역할은 직전 세션 대화가 아니라 새 package만 받아야 한다.

## 7. 현재 상태와 다음 단계

`ki-b13-02`는 후보 동결과 사후 대조까지 완료됐다. `core20-annotation-009`가 이 후보 1건의 catalog annotation을 위해 준비됐다.

- annotation job: `core20-annotation-009`
- status: `READY`
- source commit: `f44fc802aba16de5235eee414aeaf8aeeb83484d`
- packet SHA: `f64ee6f01fa45698ac5a29d03d67cc23f334ebc701ab021c6f48ab52c22bf92d`
- 최대 행수: 1

다음 순서는 catalog annotator, 별도 annotation reviewer, controller apply다. 이 receipt가 적용된 뒤에만 고유 슬롯 또는 `category-overflow`로 집계한다. measurement design, 합성 실행과 외부 실서비스 실행은 별도 후속 단계다.

## 8. 인수인계 체크

1. 세션 UI가 아니라 이 문서의 accepted 체인과 실제 파일 SHA를 먼저 확인한다.
2. `core20-annotation-009`의 `READY.json`과 package SHA를 검증한다.
3. annotator와 reviewer는 서로 다른 context를 사용한다.
4. 빈 슬롯 때문에 의미상 다른 카테고리로 후보를 밀어 넣지 않는다.
5. annotation receipt가 적용되기 전에는 포트폴리오 수치를 올리지 않는다.
6. 실제 실행 0건이라는 상태를 유지하고, 후보 동결이나 설계 보유를 실서비스 성과로 표현하지 않는다.
