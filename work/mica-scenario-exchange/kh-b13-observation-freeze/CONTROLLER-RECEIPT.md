# kh-b13 observation freeze controller receipt

- 상태: ACCEPTED
- 방법 버전: standard-v1.3.5
- 입력 경계: clean
- 성공 custodian context: `efd61526-3cbf-4a5e-91ba-1998471fa584`
- 동결 행: 2건 (`ob-kh-b13-03`, `ob-kh-b13-04`)
- 출력 SHA-256: `f2a4493c794acd25f3c7450c066a00d48abe96db7c76d4f63dfea0717bc362bb`
- 출력 바이트: 5650
- closure SHA-256: `71f74c3ba94a0789df471779ed86c319a64c1be012e8b73a91335bc27a1ebf88`
- review closure SHA-256: `e98a35fb1b45ea90076f2c171c64d52d1d1d1cd3b256409b037cf2b75fee9d2c`

## Controller 판정

실제 review closure 파일 SHA, `READY.json`의 review closure 결속값, controller receipt 값이 모두 같은 소문자 64자리 SHA-256이다. 입력 관찰 4행과 검토 4행은 ID와 순서가 1:1로 대응한다. reviewer가 accept했고 다섯 checks가 모두 pass인 2행만 동결됐으며 reject 2행은 제외됐다. 동결 행의 앞 12개 필드는 원본 관찰과 값 및 배열 순서가 같고, 원본 관찰 행 SHA와 검토 행 SHA가 각각 결속됐다.

1차 실패 custodian context `7a3eeb06-5aa3-4dc2-8ca7-79de4ef42456`은 당시 `READY.json`의 `forbiddenPriorContextIds`에 추가되지 않았지만, 성공 context와 서로 다르고 새 런타임에는 1차 출력이 없었으며 성공 closure가 재사용하지 않았다고 기록했다. controller는 두 context의 차이, 새 런타임의 빈 출력 상태, 3중 SHA 대조를 직접 확인했다. 이 누락은 결과 의미를 바꾸지 않는 controller 계약 결함으로 기록하고, 이후 job의 금지 context 목록에는 실패 역할 context도 포함한다.

이 receipt는 의미를 재심사하거나 후보 수량을 승인하지 않는다. accepted-only 동결의 구조, 역할 분리, 계보와 입력 경계만 승인한다.
