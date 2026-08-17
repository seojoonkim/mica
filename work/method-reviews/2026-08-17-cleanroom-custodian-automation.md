---
origin: kiheon-ideation
label: 신기헌 아이데이션
status: controller-decision
scope: cleanroom-mechanical-steps
language: ko
asOf: 2026-08-17
decidedBy: Claude Code 주 컨트롤러
appliesFrom: 다음 clean-room-production 배치
baseCommit: df12509
---

# custodian 동결과 packet 검증 자동화

## 0. 결정

판단이 전혀 없는 두 단계를 `scripts/mica-cleanroom.py`로 옮긴다.

| 단계 | 지금 | 이후 |
|---|---|---|
| packet SHA 대조 | controller가 손으로 옮겨 적고 눈으로 확인 | `verify` |
| accepted-only 동결 | 격리 custodian 세션 2개 | `freeze` |

**의미 관문은 건드리지 않는다.** 원천 검토, 관찰 검토, 후보 검토는 그대로 격리 컨텍스트에서 사람이 지정한 모델이 판정한다. 자동화하는 것은 그 판정을 **읽어서 옮기는** 일뿐이다.

## 1. 왜 이 두 단계인가

### 1.1 custodian 계약에는 판정이 없다

`kh-b13-observation-freeze/ROLE-CONTRACT.md`가 custodian에게 요구하는 전부다.

1. observation과 review가 1:1로 대응하고 같은 순서인지 확인
2. closure SHA가 READY의 영수증과 일치하는지 대조
3. 다섯 checks가 모두 `pass`이고 verdict가 `accept`인 행만 선택
4. 12개 필드를 원래 순서대로 복사하고 SHA 3개를 계산해 붙임

계약이 명시적으로 금지하는 것도 있다.

> review의 verdict나 checks를 다시 판단하거나 바꾸지 않는다.

즉 이 역할은 **판단하지 않도록 설계된 역할**이다. 결정적 함수이고, 언어 모델이 할 이유가 없다.

### 1.2 실제로 사람 쪽 실수로 한 번 통째로 다시 했다

`kh-b13-observation-freeze/attempt-001-rejected/RECEIPT.md`의 기록이다.

> 이 attempt의 accepted-only 출력 내용과 행 SHA는 계약에 맞았지만 controller가 제공한 `READY.json.observationReviewReceipt.closureSha256`이 62자리였다.

**custodian은 맞았다.** controller가 64자리 SHA를 62자리로 옮겨 적었다. 그 결과 신규 격리 컨텍스트 하나, receipt 수정, package 재결속이 버려졌다.

이 배치에서 controller가 손으로 적은 SHA-256 리터럴은 **111개**다.

| job | SHA 리터럴 |
|---|---:|
| source-research | 10 |
| source-review | 10 |
| observation-write | 12 |
| observation-review | 15 |
| observation-freeze | 18 |
| task-translation | 13 |
| candidate-review | 15 |
| candidate-freeze | 18 |
| **합계** | **111** |

111개를 손으로 옮기면서 하나도 안 틀리기를 기대하는 것이 설계가 아니다.

### 1.3 제거되는 것

8개 role job 중 custodian이 2개다(**25%**). 이전 세션 실측에서 이 두 역할이 토큰의 12.2%를 썼다. 세션 2개가 사라지면 사람이 job을 열고 닫는 접점도 2개 줄어든다. 달력을 정하는 건 모델 속도가 아니라 사람의 가용 시간이므로 이쪽이 더 크다.

## 2. 무엇을 만들었는가

### 2.1 `verify` — 읽기 전용

```bash
python3 scripts/mica-cleanroom.py verify work/mica-scenario-exchange/<job-id>
```

- `PACKAGE-SHA256.txt`를 디스크와 대조
- `READY.json`의 모든 `{path, sha256, byteLength}` 포인터를 디스크와 대조
- 모든 digest 리터럴의 자릿수 검사. **키 이름으로 기대값을 정한다.** `*Sha256`은 64자리, `*commitSha`는 git SHA-1 40자리
- 영수증 SHA가 exchange 트리의 실제 파일을 가리키는지 확인
- `allowedInputs`의 파일이 실재하는지 확인

**62자리 결함을 잡는다.** 그것도 custodian 세션을 띄우기 전에 잡는다.

### 2.2 `freeze` — accepted-only 동결

```bash
python3 scripts/mica-cleanroom.py freeze <job-dir> --context-id <id> [--at <UTC>] [--check]
```

`verify`를 먼저 돌리고 실패하면 아무것도 쓰지 않는다. `observationCustodian`과 `candidateCustodian` 두 역할을 지원한다.

`--check`는 쓰지 않고 기존 출력과 재현 대조만 한다.

### 2.3 안전 장치

| 상황 | 동작 |
|---|---|
| packet 검증 실패 | 쓰지 않고 중단 |
| `--context-id`가 `forbiddenPriorContextIds`에 있음 | 거절. 역할 독립성 불변식 |
| 출력 파일이 이미 있음 | 덮어쓰지 않고 중단 |
| verdict=accept 인데 fail check 존재 | 거절. 모순을 해소하지 않는다 |
| 원본과 review 행수 불일치 | 거절 |
| `catalog-annotation` 등 다른 계약 | 판정하지 않고 SKIP. 다른 계약을 이 규칙으로 재면 거짓 결함이 된다 |
| 필드 값을 확정할 수 없음 | 추측하지 않고 fail-closed |

## 3. 어떻게 맞다고 확인했는가

**기존 산출물을 바이트 단위로 재현했다.** 사람과 모델이 만들고 controller가 검증해 원장에 적용한 결과물이다.

| 출력 | 바이트 | 재현 |
|---|---:|---|
| `kh-b13` `frozen-observations.staging.jsonl` | 3,103 | **일치** |
| `kh-b13` `frozen-candidates.staging.jsonl` | 3,005 | **일치** |

수락 선택도 당시 `CLOSURE.json`과 같다. 입력 4행 → 수락 2행(`ob-kh-b13-03`, `ob-kh-b13-04`), 기록된 `frozenRows: 2`와 일치한다.

`scripts/test-mica-cleanroom.py` 10건이 이걸 회귀로 고정한다. 거짓 양성 검사(닫힌 job 8개 전부 통과), 실제 결함 검사(62자리 거절), 재현 검사, 안전 장치 검사가 들어 있다.

### 3.1 스크립트가 내 규칙 두 개를 반증했다

첫 실행에서 닫힌 job 8개 중 6개가 실패했다. 데이터가 아니라 **내가 쓴 규칙이 틀렸다.**

- `sourceCommitSha`는 git SHA-1 40자리인데 SHA-256 64자리 규칙으로 쟀다
- 영수증은 설계상 **앞 단계 job 디렉터리**의 파일을 가리키는데 현재 packet에서만 찾았다

둘 다 고쳤다. 검증 도구를 만들 때 첫 실패가 대상의 결함이라고 단정하면 안 된다는 사례로 남긴다.

## 4. 하지 않은 것

- **의미 관문 자동화.** 원천·관찰·후보 검토는 그대로다. 수율이 낮은 건 관문이 작동하는 것이지 낭비가 아니다.
- **닫힌 배치 수정.** `kh-b13`을 포함해 아무것도 다시 쓰지 않았다. `--check`만 돌렸다.
- **구 in-repo lane 변경.** `scripts/mica-scenario-production.py`는 한 줄도 안 바꿨다.
- **역할 독립성 완화.** custodian 세션이 사라지는 것이지 검토자 격리가 사라지는 것이 아니다.
- **컨텍스트 ID 자동 생성.** `--context-id`는 반드시 사람이 넘긴다. 실행 주체 기록은 자동화 대상이 아니다.

## 5. 남은 자동화 후보

이번에 하지 않았고, 다음에 판단한다.

| 후보 | 판단 필요 | 비고 |
|---|---|---|
| packet 생성(`READY.json` 작성) | 없음 | SHA 111개의 출처. 가장 큰 남은 건 |
| `CLOSURE.json` 작성 | 없음 | 출력 SHA·바이트·행수는 전부 계산값 |
| 원장 적용(`portfolio apply`) | 없음 | 이미 스크립트가 있다 |
| 검토자 판정 | **있음** | 자동화 대상이 아니다 |

## 6. 검증 상태

```
preflight                        PASS
test-mica-scenario-production    5/5 OK
test-mica-portfolio              27/27 OK
test-mica-cleanroom              10/10 OK
portfolio validate               PASS occupied=49 blocked=0 empty=51
```
