# std-b5 무효화된 측정 검토 증거

- origin: `kiheon-ideation`
- status: `invalidated-input-race`
- recordedAt: `2026-08-11T19:11+0900`

이 디렉터리의 파일은 삭제하지 않고 감사 증거로만 보존한다. 첫 독립 oracle 검토가
SHA-256 `28cc3d7246fe232d779d43b14c2e615c196ecc3146d8256290b223e791b947c5`인
측정 자산을 읽은 뒤, 기존 Claude Code 세션이 최종 측정 자산을 SHA-256
`01bc6f35c6e123f84746e8d7ed4f05f484a1b6196d3c8669c312a4fd9d99baec`로 교체했다.
이어진 측정 검토도 자산 교체 시점과 겹쳤으므로 세 파일 모두 최종 판정 입력으로
사용하지 않는다.

최종 자산을 기준으로 새 독립 oracle 검토와 측정 검토를 수행하며, 이 디렉터리의
결과는 후보 수락 수량·결함 판정·closure에 반영하지 않는다.
