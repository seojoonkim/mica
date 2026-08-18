# draft-r1 전수 감사 원자료 인덱스

63건 전체, 3라운드(12/12/39), 각 건 독립 격리 컨텍스트+Opus 5 xhigh+WebFetch 원문 재확인.
전체 판정 근거 원문은 scratchpad의 audit-result*.json에 있고 커밋 시점 workflow run id로 재현 가능하다.

## MAJOR 32건 요약

| candidateId | category | evReal | catM | lifeN | authR | consis | 한줄 요약 |
|---|---|---|---|---|---|---|---|
| res2-draft-03 | restaurants-local | O | O | O | O | X | 원문(https://partners.coupangeats.com/news/policies/10189/)을 W… |
| mbi-draft-05 | money-banking-investing | X | O | O | O | X | [1] 원문 재확인 = FAIL (핵심 사실관계 역전) |
| mob2-draft-05 | mobility-transit | X | O | O | O | O | 원문(https://news.seoul.go.kr/traffic/archives/34997, 수정일 2026… |
| mob2-draft-02 | mobility-transit | O | O | O | X | O | 원문(https://bustago.or.kr/newweb/kr/support/faq/faq.do)을 WebF… |
| mbi-draft-04 | money-banking-investing | O | O | O | O | X | 원문(https://obank.kbstar.com/quics?page=C102304)을 WebFetch로 두… |
| res3-draft-03 | restaurants-local | X | O | O | O | X | 원문(https://www.gov.kr/portal/service/serviceInfo/PTR00005139… |
| trv2-draft-06 | travel-accommodation | O | O | O | O | X | 원문(https://www.ngonews.kr/news/articleView.html?idxno=231415… |
| eml-draft-01 | email-calendar | X | O | O | O | X | 원문 재확인 방법: sourceUrl(https://support.google.com/accounts/ans… |
| eml-draft-03 | telecom-subscriptions | X | O | O | O | X | 원문 재확인: evidence.sourceUrl(법제처 찾기쉬운 생활법령정보 "정기구독 결제 서비스 유료전환… |
| eml2-draft-02 | email-calendar | O | X | O | O | X | 원문 재확인: https://www.kisa.or.kr/303 을 WebFetch로 두 번(다른 질의로) 열… |
| eml3-draft-03 | email-calendar | O | O | O | O | X | 원문(https://support.google.com/calendar/answer/13155911?hl=ko… |
| hca-draft-04 | healthcare-administration | X | O | O | O | O | 원문 재확인: evidence.sourceUrl(https://www.k-medi.or.kr/web/lay1… |
| hca-draft-05 | healthcare-administration | X | O | O | O | X | 원문 재확인 완료. sourceUrl을 실제로 열었고 HTTP 200, 본문 전문 확보. 원문 구조는 제목 … |
| hca-draft-08 | healthcare-administration | O | X | O | O | O | 원문(https://www.kca.go.kr/odr/bj/br/osBjDecisionExamDetW.do?d… |
| hut-draft-05 | home-utilities | X | O | O | O | X | 원문(consumer.go.kr trublMdatCaseSn=12610)을 WebFetch로 3회 열어 사건… |
| hut-draft-06 | home-utilities | X | O | O | O | X | 원문(https://www.law.go.kr/LSW/precInfoP.do?precSeq=71180)을 We… |
| hut2-draft-01 | home-utilities | X | O | O | O | X | [원문 재확인 절차] evidence.sourceUrl(https://namc.molit.go.kr/dpco… |
| hut2-draft-05 | home-utilities | O | O | O | O | X | 원문 재확인 방법: WebFetch 2회가 "하자심사분쟁조정위원회" 등장 여부에서 서로 엇갈려, easyla… |
| mbi-draft-01 | money-banking-investing | X | O | O | O | X | 원문(https://fins.kdic.or.kr/ir/aplygudn/MtrsGvbkSprtProc/sele… |
| mob-draft-01 | mobility-transit | X | O | O | X | X | 원문을 실제로 열어 확인했다. WebFetch 요약이 표를 두 번 서로 다르게 뭉갰기 때문에(첫 회 "출발 … |
| mob-draft-04 | mobility-transit | X | O | O | O | X | 원문(https://www.socar.kr/fare)을 WebFetch로 직접 열어 전체 가시 텍스트를 확보… |
| mob-draft-05 | mobility-transit | X | O | O | X | X | 원문(https://pay.tmoney.co.kr/ncs/pct/cuscent/ReadClmtAcmpCard… |
| mob2-draft-01 | mobility-transit | X | O | O | O | X | 원문(consumer.go.kr trublMdatCaseSn=12493)을 WebFetch로 3회(사례 전문… |
| res2-draft-02 | restaurants-local | X | O | X | O | X | 원문(https://manager.catchtable.co.kr/static/html/terms_of_use… |
| res3-draft-01 | restaurants-local | X | O | O | O | X | 원문(소비자24 분쟁조정 사례 trublMdatCaseSn=12357, 한국소비자원 "돌잔치 계약해제에 따른… |
| res3-draft-02 | restaurants-local | X | X | O | O | X | 원문 재확인 완료. evidence.sourceUrl을 실제로 열어 전문을 확보했다(제목·출처 한국소비자원·… |
| res3-draft-04 | restaurants-local | X | O | O | O | X | 원문(WebFetch 2회, 요기요 사장님 파트너센터 '배달한 음식에서 이물이 나온다면')을 직접 열어 문장… |
| shp-draft-01 | shopping-delivery | X | O | O | O | X | 원문 재확인 결과(sourceUrl 3회 WebFetch, 실재 확인). 사건명 "배송지연 등에 따른 청약철… |
| shp-draft-05 | shopping-delivery | X | O | O | O | X | 원문(consumer.go.kr trublMdatCaseSn=13167)을 3회 재확인해 문장 단위로 대조했… |
| shp-draft-07 | shopping-delivery | X | O | O | O | X | 원문 재확인 결과(관세청 "수입 통관", cntntsId=817, "수입통관 흐름도" 8단계 및 "통관보류 … |
| shp-draft-08 | shopping-delivery | X | O | O | O | X | 원문(http://mobile.gmarket.co.kr/customercenter/FaqDetail?seq=… |
| trv-draft-01 | travel-accommodation | X | O | O | O | X | 원문(consumer.go.kr trublMdatCaseSn=12435)을 WebFetch로 3회 열어 문장… |

## 항목별 실패(63건)

| 항목 | 실패 |
|---|---:|
| evidenceReal | 27/63 |
| categoryMatch | 3/63 |
| lifeNeedSupportPass | 1/63 |
| authorityRoleCompliant | 3/63 |
| internallyConsistent | 35/63 |
