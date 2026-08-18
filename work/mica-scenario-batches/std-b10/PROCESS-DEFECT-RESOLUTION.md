# std-b10 공정 결함 후속 해소

- origin: `kiheon-ideation`
- std-b10 산출물 상태: `completed`
- 후속 방법 revision: `standard-v1.3.3`
- 적용 범위: 다음 빈 표준 배치부터
- std-b10 소급 변경: 없음

`std-b10`은 후보 2건을 `designable`로 종결했지만 공정 결함 5건을 남겼다. 후보 내용이나 판정을 고치지 않고, 다음 배치에서 같은 결함이 재발하지 않도록 공정 계약과 검증 도구를 보완했다.

| 결함 | 종결 | 후속 강제 장치 |
|---|---|---|
| `df-b10-01` 재개 관문 부재 | resolved | `park`가 전수 파일 SHA checkpoint를 만들고 `resume`이 불변성과 사람 지시 참조를 검증한다. |
| `df-b10-02` 이중 controller·role 기동 | resolved | `claim`의 OS 시각 lease와 `assign-role`의 role/context 유일성 검사가 중복 기동을 차단한다. |
| `df-b10-03` 거절 재작성과 `maxDrafts` 충돌 | resolved-by-policy | 현재 배치 재작성을 금지한다. accepted-only 수량으로 진행하거나 닫고 다음 배치에서 새 evidence·새 ID로 재시도한다. |
| `df-b10-04` 세션 간 파킹 지시 검증 공백 | resolved | `resume`은 parked 또는 만료 lease, checkpoint 불변, `user-message:` 또는 `operator-approval:` 참조를 모두 요구한다. |
| `df-b10-05` 추정 시각 기록 | resolved | `complete-role`이 산출물 mtime에서 `at`·`executedAt`, OS 시각에서 `observedAt`을 파생한다. |

회귀 검사는 controller 중복 claim, role 중복·context 충돌, parked 파일 변조 후 resume, 시각 출처 기록을 포함한다. 완료된 `std-b10`에는 `controller-state.json`을 소급 생성하지 않으며 당시 파킹·보정 기록을 감사 증거로 보존한다.
