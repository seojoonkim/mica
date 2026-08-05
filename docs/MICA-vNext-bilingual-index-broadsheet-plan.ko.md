# MICA vNext 웹사이트 기획안

## Bilingual Index Broadsheet

- 프로젝트: **MICA — Multinational Index of Consumer Agents**
- 부제: **The global benchmark for consumer agent orchestration.**
- 핵심 메시지: **Models matter. Orchestration wins.**
- 문서 상태: 구현 기준 확정안
- 대상 릴리스: 패셔너블 모던 리디자인, 영어·한국어 지원, 10개 평가 카테고리 확장

## 1. 프로젝트 정의

MICA는 단일 기반 모델의 지식이나 추론 능력만 측정하는 벤치마크가 아니다. 실제 소비자 태스크를 완료하기 위해 모델 라우팅, 메모리, 도구와 API, 브라우저 제어, 현지화, 안전 경계, 오류 복구를 조합하는 **완성된 소비자 에이전트 시스템**을 평가한다.

초기 시장은 다음 5개국이다.

- 대한민국
- 일본
- 싱가포르
- 대만
- 태국

모든 결과는 국가별 현실 조건에서 먼저 계산한다. 글로벌 정확도는 국가별 점수를 동일 가중하는 macro-average로 계산한다. 국가별 통화와 실행 환경이 다른 Speed와 Cost는 무리하게 하나의 글로벌 수치로 합치지 않는다.

## 2. 첫 화면에서 반드시 전달할 차별성

사용자는 첫 화면만 보고도 다음 세 가지를 이해할 수 있어야 한다.

1. MICA는 모델 단독이 아니라 **완성된 에이전트 시스템**을 평가한다.
2. 5개 국가의 **현지화된 실제 일상 태스크**를 평가한다.
3. **Accuracy, Speed, Cost**를 하나의 종합점수로 합치지 않고 각각 공개한다.

이를 설명문에만 의존하지 않고 시각 구조로 표현한다.

- 시스템 구성식: `Base model + Orchestration + Tools & Memory = The system MICA measures`
- 시장 밴드: `KR / JP / SG / TW / TH`와 각 국가의 고유 문자 표기
- 결과축 트라이어드: Accuracy, Speed, Cost를 서로 다른 색상, 기호, 위치로 고정
- demo 고지: 화면에서 가장 명확한 반전 잉크 블록으로 표시

## 3. 아트디렉션

### 콘셉트

**Bilingual Index Broadsheet**

현대 아시아 독립출판물과 통계 연감을 결합한다. 패션 에디토리얼의 대담한 타이포그래피를 사용하되, 표와 근거를 읽는 데이터 인터페이스의 명료함을 우선한다.

### 기억에 남는 시각 장치

- 대형 에디토리얼 헤드라인
- 따뜻한 종이색 배경과 선명한 검정 잉크
- 1px 헤어라인으로 구획된 시장 밴드와 데이터 셀
- 페이지마다 하나의 강한 반전 블록
- 결과축마다 고정 색상과 기호 사용
  - Accuracy: 파란색 + 원
  - Speed: 감색이 아닌 주황빛 적색 + 삼각형
  - Cost: 이끼색 + 사각형
- 카드, 둥근 모서리, 그림자, 유리 효과를 배제한 평면 출판 구조

### 금지 사항

- 흔한 SaaS 카드 그리드
- 보라색 그라데이션
- glassmorphism과 glow
- 과도한 스크롤 애니메이션
- 숫자가 늦게 나타나는 count-up 효과
- 근거 없는 단일 MICA 점수, 별점, 메달, 등급
- 색상만으로 의미를 구분하는 설계

## 4. 타이포그래피와 재질

### 타이포그래피 원칙

- 디스플레이: 패션 에디토리얼 성격의 고대비 세리프
- 본문: 영어와 한국어 가독성이 높은 산세리프
- 데이터: tabular numerals를 지원하는 모노스페이스
- 한국어 본문은 영어보다 넉넉한 행간과 짧은 읽기 폭을 사용
- 빌드 중 외부 네트워크에 의존하지 않도록 폰트를 로컬 호스팅하거나 안정적인 로컬 스택으로 구성

### 권장 색상

- Paper: `#F0EDE6`
- Paper deep: `#E4DFD4`
- Surface: `#FAF8F4`
- Ink: `#14120F`
- Ink soft: `#45403A`
- Rule: `#D5CFC3`
- Accuracy: `#1A3E6E`
- Speed: `#C2461E`
- Cost: `#4C5A2A`

## 5. 첫 화면 구성

### Masthead

- MICA 워드마크
- 정식 명칭
- 주요 내비게이션
- EN / 한국어 전환
- Preview edition 상태

### Hero

- 가장 큰 문장: 글로벌 소비자 에이전트 오케스트레이션 벤치마크
- 보조 문장: 모델보다 오케스트레이션의 완성도가 실제 태스크 성공을 결정한다는 메시지
- 시스템 구성식
- 5개 시장과 10개 평가 카테고리, 현재 demo coverage 수치

### Market band

- 대한민국, 일본, 싱가포르, 대만, 태국
- 국가 코드, 영어명, 현지 문자명
- 국가 상세 페이지로 연결

### Outcome triad

- Accuracy
- Speed
- Cost

세 축은 동일한 위계로 배치하고, 하나의 종합점수를 만들지 않는다는 점을 구조적으로 보여준다.

### Demo disclosure

다음 영문은 두 언어 화면 모두에 그대로 노출한다.

- `Illustrative demo data`
- `Not an official ranking`

한국어 설명도 함께 제공한다.

- 예시용 데모 데이터
- 공식 순위가 아님

## 6. 10개 평가 카테고리

### 1. Email & Calendar

**한국어:** 이메일·캘린더

- 이메일 확인과 요약
- 답장 초안과 승인 후 발송
- 일정 등록, 변경, 삭제
- 다자간 일정 조율
- 시간대와 공휴일 처리

핵심은 사람과 약속에 대한 커뮤니케이션 실행과 일관성이다.

### 2. Shopping & Delivery

**한국어:** 쇼핑·배송

- 조건 기반 상품 탐색
- 가격과 수수료 비교
- 장바구니 구성
- 대체 상품 처리
- 현지 주소와 픽업 방식 처리
- 결제 직전 상태까지 준비

### 3. Travel Planning & Accommodation

**한국어:** 여행 계획·숙박

- 다구간 일정 구성
- 교통과 숙소 탐색
- 예산과 날짜 제약 반영
- 접근성 조건 확인
- 취소나 운행 중단 시 재계획
- 실제 예약 가능한 옵션 검증

### 4. Dining & Reservations

**한국어:** 식당·예약

- 식당 탐색
- 인원과 식이 조건 반영
- 호텔, 시설, 지역 서비스 예약
- 전화나 메신저 전용 채널 인식
- 카드 홀드나 본인 확인 단계에서 안전하게 중단

### 5. Money, Banking & Investing

**한국어:** 금융·은행·투자

- 계좌와 카드 내역 확인 및 지출 요약
- 수수료, 환율, 예금상품 비교
- 포트폴리오 현황과 위험 노출 요약
- ETF와 펀드 탐색 및 비교
- 배당과 세금 문서 정리
- 투자 주문서 작성과 승인 직전 검증

#### 안전 경계

- 수익을 보장하지 않는다.
- 사용자 적합성을 근거 없이 추정하지 않는다.
- 최신성과 출처, 수수료, 위험을 공개한다.
- 송금, 매수, 매도, 계좌 개설은 명시적 최종 승인 전에 실행하지 않는다.
- demo에서는 controlled account와 synthetic portfolio만 사용한다.

### 6. Mobility & Local Transit

**한국어:** 이동·대중교통

- 도어 투 도어 경로 계획
- 막차와 환승 조건 처리
- 교통비 계산
- 접근 가능한 이동 경로 확인
- 현지 교통카드와 승차 규칙 반영
- 승차 호출이나 결제 전에 중단

### 7. Healthcare Administration

**한국어:** 의료 행정

- 진료 예약
- 의뢰서와 기록 요청 준비
- 보험 청구 서류 정리
- 비용과 필요 문서 확인
- 개인정보 전송 전 승인

진단이나 치료 조언은 평가 범위가 아니다. 의료 행정만 다룬다.

### 8. Government & Civic Services

**한국어:** 정부·공공 서비스

- 자격 조건 확인
- 공식 출처와 최신 양식 확인
- 필요 문서 체크리스트 작성
- 민원과 신청서 초안 작성
- 공공기관 방문 예약

법적 효력이 있는 제출은 명시적 승인과 controlled track 조건 없이는 실행하지 않는다.

### 9. Home & Utilities

**한국어:** 주거·공과금

- 전기, 수도, 가스, 관리비 확인
- 청구 이상 분석
- 요금제 비교
- 입주와 퇴거 시 서비스 이전 준비
- 수리 서비스 문의와 견적 준비
- 해지와 단전 같은 비가역 조치 전 중단

### 10. Telecom & Digital Subscriptions

**한국어:** 통신·디지털 구독

- 휴대폰과 인터넷 요금제 비교
- 로밍과 eSIM 준비
- 데이터 사용량과 청구 확인
- 중복 구독과 무료 체험 탐지
- 구독 해지 준비
- 부당 청구 이의제기 초안
- 번호이동과 위약금 조건 확인

#### 1번과의 구분

- Email & Calendar는 사람과 일정에 대한 메시지와 약속을 관리한다.
- Telecom & Digital Subscriptions는 통신사와 디지털 서비스 계정의 가입, 변경, 청구, 해지 생애주기를 관리한다.
- 10번에는 일반 이메일 답장이나 일정 관리 태스크를 포함하지 않는다.

## 7. 데이터 정직성

평가 taxonomy는 10개지만 게시된 결과는 하나도 없다.

- 평가 범위: 10개 카테고리
- 현재 게시된 result coverage: 0개 카테고리
- 어떤 카테고리에도 가짜 run cell이나 점수를 만들지 않는다.
- 결과가 없는 영역은 0점이 아니라 `Not measured` 또는 `아직 측정되지 않음`으로 표시한다.
- 모든 fixture 결과는 publication eligible이 아니다.

현재 게시된 coverage: 없음. 검증된 스냅숏이 publication gate를 통과할 때 채워진다.

## 8. 영어·한국어 지원

### URL 구조

- `/en/**`
- `/ko/**`

루트 경로는 저장된 언어, 브라우저 언어, 영어 기본값 순서로 이동한다.

### 언어 전환

- Masthead에 `EN / 한국어`
- 현재 경로와 Rankings 검색 조건을 유지
- 언어 선택을 cookie에 저장
- 내부 링크가 현재 언어를 유지

### 번역 범위

- 내비게이션
- 페이지 제목과 설명
- 버튼과 폼 라벨
- 빈 상태와 오류 상태
- Methodology와 Governance
- Tasks와 Evidence 설명
- 국가 페이지 설명
- Footer와 metadata

번역하지 않는 항목:

- 시스템 이름
- run-cell ID
- 통화 코드
- 원본 데이터 값
- 출처 URL

### 접근성

- `<html lang="en">` 또는 `<html lang="ko">`
- 국가 고유 문자에는 적절한 `lang` 속성
- 언어 전환 링크에 `hrefLang`와 활성 상태
- 영문 demo 계약 문구는 한국어 화면에서도 유지

## 9. 핵심 화면

### Home

MICA의 차별성과 5개국, 10개 taxonomy, 3개 결과축을 첫 화면에서 이해하게 한다.

### Rankings

- country-first
- verified-first
- Accuracy, Speed, Cost 개별 정렬
- 게시된 결과가 없으므로 정직한 empty state만 제공
- 필터와 언어 상태 유지

### Countries

국가별로 로컬 플랫폼, 주소, 통화, 언어, 공휴일, 규제, 예약 채널 차이가 에이전트 실행을 어떻게 바꾸는지 보여준다.

### Tasks

10개 카테고리와 대표 태스크, final state, confirmation boundary를 공개한다. 현재 결과가 있는 4개와 아직 측정되지 않은 6개를 구분한다.

### Evidence

canonical aggregate run cell의 계보를 공개한다. 존재하지 않는 개별 transcript나 스크린샷은 만들지 않는다.

### Methodology

Accuracy, Speed, Cost, Wilson interval, macro-average, verification status, publication guard를 설명한다.

## 10. 모션과 인터랙션

- 링크와 버튼의 짧은 색상 전환만 사용
- locale 전환은 일반 내비게이션
- 표 숫자와 bar는 즉시 표시
- 스크롤 reveal, parallax, count-up을 사용하지 않음
- `prefers-reduced-motion` 지원 유지

## 11. 반응형 기준

### 390px

- 단일 열
- Hero 가독성 유지
- 시장 밴드는 2열 또는 수평 스크롤 없이 줄바꿈
- 결과축은 세로 배치
- 표만 자체 영역에서 수평 스크롤
- 페이지 전체 overflow 0

### 768px와 899px

- 12열 전환 구간의 span 불일치 금지
- Hero와 ledger가 과도하게 좁아지지 않음
- 내비게이션과 언어 전환 접근 가능

### 1280px

- 첫 화면에 시스템 구성식, 시장 밴드, 결과축의 핵심이 보임
- 데이터 밀도와 여백의 균형 유지

## 12. 검증 기준

- task taxonomy 정확히 10개
- 게시된 result family 정확히 0개
- system registry와 run cell 배열 비어 있음
- 어떤 카테고리에도 점수 없음
- 영어와 한국어 주요 경로 정적 생성
- 언어 전환 시 현재 경로와 query 유지
- 한국어 dictionary 누락 시 typecheck 실패
- demo 계약 문구가 두 언어 화면 모두에 노출
- preview `noindex, nofollow` 유지
- 테스트, lint, strict TypeScript, production build 통과
- 390, 768, 899, 1280에서 overflow와 접근성 확인
- GitHub main push 후 Vercel production 배포
- live route, metadata, 언어, disclosure 재검증

## 13. 출시 원칙

- 디자인 개선이 평가 신뢰 계약을 약화시키지 않는다.
- 읽기 쉬움이 시각적 장식보다 우선한다.
- 카테고리 확장이 결과 데이터 확장처럼 오해되지 않게 한다.
- 실제 persisted evaluator workflow가 생기기 전에는 Supabase를 만들지 않는다.
- 공식 결과가 준비되기 전까지 모든 공개 수치는 illustrative demo로 유지한다.
