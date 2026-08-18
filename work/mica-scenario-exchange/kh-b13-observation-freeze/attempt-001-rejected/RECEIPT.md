---
origin: kiheon-ideation
jobId: kh-b13-observation-freeze
attempt: 1
status: REJECTED-CONTROLLER-RECEIPT
---

# kh-b13 observation freeze attempt 1 보존 기록

이 attempt의 accepted-only 출력 내용과 행 SHA는 계약에 맞았지만 controller가 제공한 `READY.json.observationReviewReceipt.closureSha256`이 62자리였다. 실제 이전 단계 `CLOSURE.json`의 SHA-256은 `e98a35fb1b45ea90076f2c171c64d52d1d1d1cd3b256409b037cf2b75fee9d2c`이다.

입력 권한 영수증이 잘못된 package에서 실행됐으므로 이 attempt의 출력은 원장이나 다음 단계 입력으로 적용하지 않는다. 실패 증거로만 보존한다.

- custodian context: `7a3eeb06-5aa3-4dc2-8ca7-79de4ef42456`
- frozen output SHA-256: `1dad35f3959ee462c4aa0635e59b87eb0d61f5cb3c71ea06e07528ec77cf2f31`
- closure SHA-256: `3b0e68292e1f0e4558b21e83e2f63d484996f3f3bcf0cd83cc20e905888122b1`
- 판정: controller package defect, output not applied
- 후속: receipt 수정, package 재결속, 신규 custodian context에서 재실행
