import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import type { Dict } from "@/lib/i18n/en";

/**
 * The Korean dictionary.
 *
 * `satisfies Dict` is the whole safety mechanism: a key that exists in English
 * and not here is a compile error, so no surface can quietly fall back to
 * English at runtime. System names, run-cell ids, currency codes, source URLs
 * and every canonical figure are deliberately absent — those are data, and data
 * is not translated.
 */
export const ko = {
  locale: {
    switchLabel: "언어",
    en: "EN",
    ko: "한국어",
  },

  site: {
    longName: "소비자 에이전트 다국가 지수",
    tagline: "소비자 에이전트의 오케스트레이션을 측정하는 국제 벤치마크.",
    secondary: "모델도 중요하다. 그러나 승부는 오케스트레이션에서 갈린다.",
    definition:
      "MICA는 버전을 고정한 완성 상태의 소비자 에이전트 시스템을 아시아와 중동 6개 시장의 일상 과제로 측정합니다. 정확도·속도·비용은 하나로 합치지 않고 세 가지 결과로 따로 보고합니다.",
    edition: "프리뷰 에디션 0.1",
    demoNotice:
      "예시용 데모 데이터 — 공식 순위가 아닙니다. 이 사이트의 모든 수치는 인터페이스 개발을 위해 생성된 것이며 어떠한 증거력도 없습니다.",
  },

  nav: {
    countries: "국가",
    rankings: "결과표",
    agents: "시스템",
    tasks: "과제",
    evidence: "근거",
    methodology: "방법론",
    governance: "거버넌스",
    submit: "제출 요건 안내",
  },

  chrome: {
    skip: "본문으로 건너뛰기",
    homeLabel: "MICA 홈",
    menu: "메뉴",
    closeMenu: "메뉴 닫기",
    primaryNavLabel: "주요 메뉴",
    dataStatusLabel: "데이터 상태",
    method: "방법론",
    jsonData: "JSON 데이터",
    indexHeading: "목차",
    downloadsHeading: "다운로드",
    demoDatasetJson: "데모 데이터셋 (JSON)",
    demoRunCellsCsv: "데모 실행 셀 (CSV)",
    colophonNote:
      "이 사이트의 어떤 수치도 공개 대상이 아님 · 합성 페르소나와 통제된 테스트 계정만 사용",
  },

  disclosure: {
    demoLabel: "Illustrative demo data",
    notRanking: "Not an official ranking",
    demoLabelLocal: "예시용 데모 데이터",
    notRankingLocal: "공식 순위가 아님",
    detailLabel: "데이터 상태 상세",
    defaultDetail:
      "아래의 모든 수치는 인터페이스 개발을 위해 생성된 것입니다. 어떠한 증거력도 없으며, 이 페이지의 어떤 시스템도 MICA가 순위를 매긴 적이 없습니다.",
  },

  coverage: {
    headline: "평가 계열 10개 · 공개된 결과 계열 0개",
    detail:
      "MICA의 평가 분류 체계는 10개의 과제 계열을 정의합니다. 그중 결과가 공개된 계열은 하나도 없습니다. 아직 어떤 시스템도 측정·검증하지 않았기 때문입니다. 아래 계열은 모두 무엇을 측정할 것인지에 대한 정의이지, 무엇을 측정했는지에 대한 보고가 아닙니다. 없는 결과는 없다고 밝히며, 0으로 적지 않습니다.",
    evaluationFamiliesTerm: "평가 계열",
    publishedFamiliesTerm: "공개된 결과 계열",
    measuredBadge: "결과 공개됨",
    unmeasuredBadge: "정의됨, 아직 미측정",
    unmeasuredNote:
      "분류 체계에 정의되어 있으나, 이 계열에 대한 검증된 실행 셀은 아직 없습니다.",
  },

  missing: {
    noSuccess: "성공한 과제 없음.",
    noData: "이 시장에 커버리지 없음.",
    notMeasured: "측정하지 않음",
  },

  table: {
    system: "시스템",
    operator: "운영사",
    snapshot: "평가용 시스템 버전",
    market: "시장",
    markets: "시장",
    locale: "언어·지역 설정",
    currency: "통화",
    taskFamily: "과제 계열",
    task: "과제",
    accuracy: "정확도",
    interval95: "95% 신뢰구간",
    speedP50: "속도 p50",
    speedP95: "속도 p95",
    costPerSuccess: "성공당 비용",
    eligibleRuns: "유효 실행",
    verification: "검증 상태",
    track: "트랙",
    standing: "공개 상태",
    runCell: "평가 결과 묶음",
    evidence: "근거",
    frontier: "프런티어",
    editionNote: "에디션 노트",
    heroMissions: "대표 미션",
    withheld: "보류 — 모든 시장을 커버하지 않음",
    notPublicationEligible: "공개 대상 아님",
    criticalSafetyEvent: " — 중대 안전 사건",
    costNotComparable: "통화가 달라 비교 불가",
    emptySlice: "이 구간에 실행 셀이 있는 검증된 시스템이 없습니다.",
    scrollCue: "가로로 스크롤하면 모든 열을 볼 수 있습니다 →",
    captionSuffix: "예시용 데모 데이터이며 공식 순위가 아닙니다.",
    captionSuffixNoComposite:
      "예시용 데모 데이터이며 공식 순위가 아닙니다. 각 열은 따로 읽습니다. MICA는 종합 점수를 발표하지 않습니다.",
    footnote:
      "정확도는 선언된 최종 상태에 도달한 유효 실행의 비율입니다. 속도 p50과 p95는 성공한 유효 실행만을 대상으로 하므로, 시도에 걸린 시간이 아니라 성공에 걸린 시간을 뜻합니다. 실패한 시도의 시간도 실행 셀에 함께 기록하지만, 위 수치에는 넣지 않습니다. 비용은 모든 유효 시도의 비용을 성공 횟수로 나눈 값입니다. “프런티어”는 세 축 모두에서 열위에 있지 않은 행을 표시한 것일 뿐, 순위가 아닙니다.",
  },

  common: {
    apply: "적용",
    reset: "초기화",
    onThisPage: "이 페이지의 목차",
    editionSummary: `${COUNTRIES.length}개 시장 · ${TASK_FAMILIES.length}개 과제 계열 · 3개의 독립된 결과 축.`,
    allSystems: "전체 시스템",
    allMarkets: "전체 시장",
    allTaskFamilies: "전체 과제 계열",
    categoryLabel: "카테고리",
    canonicalTasks: "개 표준 과제",
    measurementLabel: "측정값",
    ruleLabel: "판정 규칙",
    finalState: "완료 조건",
    confirmationBoundary: "사용자 승인이 필요한 지점",
    whyItIsHard: "어려운 이유",
  },

  home: {
    readTables: "결과 공개 방식 미리 보기",
    howMeasured: "MICA의 측정 방식",
    submitSnapshot: "제출 요건 안내 읽기",
    statMarkets: "시장",
    statFamilies: "과제 계열",
    statPublished: "공개된 결과 계열",
    statSystems: "검증된 시스템",
    statRuns: "측정된 실행",
    countedNote: "빌드할 때 원본 데이터에서 직접 센 값입니다.",
    stackEyebrow: "측정 단위는 모델이 아니라 시스템입니다",
    bandEyebrow: `${COUNTRIES.length}개 시장 에디션`,
    disclosureDetail:
      "MICA는 아직 구축 중입니다. 아래 인터페이스는 완성되어 있지만, 그 뒤의 지수는 비어 있습니다. 검증된 시스템 결과가 하나도 공개되지 않았으므로, 이 사이트의 어떤 수치도 특정 제품의 성능을 설명하지 않습니다.",
    publicationStatus:
      "지수는 아직 공개되지 않았습니다. MICA가 검증한 시스템 결과가 없으므로 이 페이지의 어떤 내용도 제품에 점수나 순위를 매기지 않습니다.",
    noResultsHeadline: "아직 공개된 검증 시스템 결과가 없습니다.",
    noResultsDetail:
      "MICA는 어떤 시스템도, 어떤 점수도, 어떤 순위도 공개한 적이 없습니다. 지금 갖춰진 것은 측정의 틀뿐입니다. 시장별로 따로 작성한 10개 계열의 과제 분류 체계, 공개된 측정 방법, 기준값을 아직 정하지 않은 공개 요건, 그리고 앞으로의 모든 수치를 이름 붙은 집계 실행 셀까지 되짚게 하는 증거 모델입니다. 제출된 스냅샷이 독립적으로 재실행되고 이 요건을 통과한 뒤에야 결과가 이곳에 나타납니다.",
    axesEyebrow: "결과는 셋, 결코 하나가 아니다",
    axesTitle: "MICA는 정확도·속도·비용을 따로 보고합니다",
    axesIntro:
      "숫자 하나로 합치면 구매자가 실제로 감수해야 할 맞교환이 가려집니다. MICA는 종합 점수를 발표하지 않으며, 앞으로도 발표하지 않습니다. 아래 세 축은 나란히 읽습니다.",
    readinessEyebrow: "무엇이 만들어졌고, 무엇이 아직인가",
    readinessTitle: "지수의 현재 상태",
    readinessIntro:
      "MICA는 공개된 상태로 만들어지고 있습니다. 그래서 각 부분이 어디까지 왔는지를 빈 표로 넌지시 보이는 대신 그대로 밝힙니다. 아래의 어떤 항목도 측정 결과가 아닙니다.",
    readinessItems: [
      {
        term: "과제 분류 체계",
        detail:
          "일상 과제 10개 계열이며, 여섯 시장 에디션마다 따로 작성했습니다. 표준 과제마다 선언된 최종 상태와 확인 경계가 있습니다. 완성해 공개했습니다.",
      },
      {
        term: "측정 방법",
        detail:
          "정확도·속도·비용을 세 개의 별도 결과로 정의하고, 유효성 심사와 성공 실행만을 대상으로 한 백분위수, 통화별 비용을 규정합니다. 초안으로 공개되어 있으며 반론을 받습니다.",
      },
      {
        term: "증거 인프라",
        detail:
          "증거의 단위는 집계 실행 셀입니다. 셀마다 고유 주소가 있고 내용을 전부 공개하며, 무엇을 보여 줄 수 없는지까지 밝힙니다. 구축은 끝났고 안은 비어 있습니다. 기록된 셀이 없습니다.",
      },
      {
        term: "공개 요건",
        detail:
          "독립 재실행, 커버리지, 안전 조건은 이미 적용되고 있습니다. 수치 기준값은 의도적으로 아직 정하지 않았습니다. 오늘은 어떤 결과도 이 요건을 통과할 수 없고, 그래서 공개된 것이 없습니다.",
      },
      {
        term: "검증된 결과",
        detail:
          "없습니다. 측정한 제출물이 없고, 재실행한 스냅샷이 없으며, 어떤 시장이나 과제 계열에도 순위가 존재하지 않습니다.",
      },
    ],
    filterLink: "계획된 결과 컨트롤 보기 →",
    familiesEyebrow: "에이전트에게 요구하는 일",
    familiesTitle: "일상 과제의 10개 계열",
    familiesIntro:
      "각 계열은 선언된 최종 상태와, 동의 없이 시스템이 넘어서는 안 되는 확인 경계로 정의됩니다.",
    familiesLink: "과제 정의 읽기 →",
  },

  countries: {
    metaTitle: "국가",
    metaDescription:
      "MICA 지수가 다루는 6개 시장과, 각 시장에서 소비자 에이전트에게 달라지는 조건.",
    eyebrow: "시장 목록",
    title: "여섯 시장, 여섯 개의 서로 다른 문제",
    standfirst:
      "MICA는 한 시장의 벤치마크를 나머지 다섯 시장으로 번역하지 않습니다. 각 에디션은 그 나라에 실제로 존재하는 결제 인프라, 신원 확인, 주소 형식, 서비스 관행에 맞춰 따로 작성합니다.",
    coverageEyebrow: "에디션 항목",
    coverageTitle: "여섯 에디션 한눈에 보기",
    coverageIntro:
      "각 시장의 로캘과 통화, 그리고 그 시장을 위해 작성한 대표 미션 수입니다. 아직 어떤 시장에서도 측정한 시스템이 없으므로 결과 열은 없습니다.",
    coverageCaption: "시장 에디션",
    editionsEyebrow: "에디션",
    editionsTitle: "에디션 노트가 말하는 것",
    editionsIntro:
      "시장 에디션마다 그 나라에서 범위를 어떻게 정했는지 설명하는 노트가 서명처럼 붙습니다.",
  },

  country: {
    notFound: "해당 시장을 찾을 수 없습니다",
    metaTitleSuffix: "에디션",
    eyebrowPrefix: "시장 에디션",
    resultsEyebrow: "정확도·속도·비용은 따로 읽습니다",
    resultsTitle: "데모 결과 —",
    resultsIntroPrefix: "비용은",
    resultsIntroSuffix:
      "기준으로 보고합니다. 비용 수치는 하나의 통화 안에서만 의미를 갖기 때문입니다.",
    allFamiliesCaption: "전체 과제 계열",
    familyEyebrow: "과제 계열별",
    familyTitle: "이 시장이 어려워지는 지점",
    familyIntro:
      "같은 시스템이라도 한 계열은 능숙하게 해내고 다른 계열은 끝내지 못할 수 있습니다. 계열별 셀을 따로 보여 주는 이유입니다.",
    familyCaptionSuffix: "과제 계열별 정확도",
    systemsWithCells: "셀이 있는 시스템",
    bestAccuracy: "최고 정확도",
    bestSpeed: "최고 속도 p50",
    lowestCost: "최저 성공당 비용",
    lineageEyebrow: "계보",
    lineageTitle: "실행 셀 —",
    lineageIntro:
      "각 셀은 이 시장에서 하나의 시스템이 하나의 과제 계열을 수행한 기록입니다. 위 표는 이 셀들로부터 계산합니다. 셀 페이지는 그 집계가 담고 있는 것과 보여 줄 수 없는 것을 함께 밝힙니다.",
    allCellsFor: "다음 시장의 모든 실행 셀:",
    hazardsEyebrow: "운영상의 난점",
    hazardsTitlePrefix: "",
    hazardsTitleSuffix: "시장이 에이전트에게 어려운 이유",
    hazardsIntro:
      "각 난점은 그것이 걸리는 진단 축과 연결해 두었습니다. 그래서 실패를 막연한 난이도가 아니라 특정 역량으로 추적할 수 있습니다.",
    localisationEyebrow: "현지화",
    localisationTitle: "과제가 현지의 것이 될 때 달라지는 것",
    localisationIntro:
      "에이전트가 이곳에서 일상 과제를 끝내려면 먼저 흡수해야 하는 구체적인 차이들입니다.",
    missionsEyebrow: "대표 미션",
    missionsTitle: "실제로 요청한 내용",
    missionsIntro:
      "대표 미션은 표준 과제를 사람이 읽을 수 있게 옮긴 것입니다. 페르소나, 프롬프트, 선언된 최종 상태, 그리고 시스템이 혼자 넘어서는 안 되는 선으로 이루어집니다.",
    otherMarkets: "다른 시장",
  },

  rankings: {
    metaTitle: "리더보드",
    metaDescription:
      "MICA 리더보드의 전체·국가별·과제 항목별 구조. 정확도·속도·비용은 분리해 보여 주며 공개된 검증 결과가 없습니다.",
    eyebrow: "리더보드 등록부",
    title: "세 가지 관점, 숨겨진 종합점수는 없습니다",
    standfirst:
      "넓은 범위부터 구체적인 범위로 읽습니다. 전체 등록부, 6개 시장 에디션, 10개 과제 항목 순입니다. 모든 관점에서 정확도·속도·비용은 따로 유지됩니다. 구조는 지금 공개되어 있고, 검증된 이름과 수치는 공개 요건을 통과한 뒤에만 나타납니다.",
    viewNavigationLabel: "리더보드 관점",
    overallView: "전체",
    marketView: "국가별",
    categoryView: "항목별",
    viewIndex: "리더보드 목차",
    overallEyebrow: "글로벌 등록부",
    overallTitle: "전체 리더보드",
    overallIntro:
      "6개 시장에서 모두 유효한 커버리지를 확보한 시스템만 전체 등록부에 들어갑니다. 정확도는 시장별 매크로 평균으로, 속도는 성공 실행 기준으로 따로 읽습니다. 통화를 합칠 수 없으므로 비용의 전체 순위는 만들지 않습니다.",
    axisAwaiting: "검증된 시스템을 기다리는 중",
    costGlobalUnavailable: "전체 비용 순위 없음",
    axisScopeAccuracy: "6개 시장 매크로 평균 · 높을수록 우수",
    axisScopeSpeed: "성공한 유효 실행 기준 · 낮을수록 우수",
    axisScopeCost: "시장 안에서만 비교 · 전체 순위 없음",
    marketEyebrow: "6개 현지 에디션",
    marketTitle: "국가별 리더보드",
    marketIntro:
      "시장마다 순위 범위, 현지 통화, 근거 계보가 따로 있습니다. 각 에디션을 열면 그곳에 실제로 존재하는 규칙 아래에서 시스템을 비교할 수 있습니다.",
    marketOpen: "시장 리더보드 열기",
    categoryEyebrow: "10개 역량 영역",
    categoryTitle: "항목별 리더보드",
    categoryIntro:
      "항목별 관점은 전체 순위가 가릴 수 있는 전문성을 드러냅니다. 각 관점은 세 결과를 분리해서 보여 주고 한 시장으로 더 좁힐 수 있습니다.",
    categoryOpen: "항목 리더보드 열기",
    unpublishedLabel: "아직 미공개",
    filterEyebrow: "상세 구간",
    filterTitle: "결과를 어떻게 자를 것인가",
    filterIntro:
      "이 폼은 일반 링크처럼 전송되므로 앞으로의 어떤 화면이든 북마크하거나 공유할 수 있습니다. 오늘 구간을 선택하면 결과는 나오지 않습니다. 게시된 결과가 없기 때문입니다.",
    formLabel: "결과 필터",
    orderByAxis: "정렬 축",
    chooseMarket: "시장을 선택하세요…",
    noMarketSelected: "선택된 시장 없음",
    orderingBy: "정렬 기준:",
    costAcrossMarkets:
      "비용은 여러 시장을 한꺼번에 놓고 정렬할 수 없습니다. 여섯 에디션은 통화를 공유하지 않습니다. 성공당 비용을 보려면 시장을 하나만 선택하십시오.",
    showingOnlyPrefix: "표시 중:",
    showingOnlySuffix: "만",
    resultsTitle: "결과",
    selectMarketNotice:
      "결과를 보려면 시장을 선택하십시오. MICA는 각 시장을 그 시장의 기준으로 측정하고, 비용은 하나의 통화 안에서만 존재하므로 전체 시장을 합친 표는 없습니다.",
    selectedSliceEmptyNotice:
      "선택한 시장과 과제 계열에는 공개된 검증 결과가 없습니다. 컨트롤은 요청한 구간을 보여 주지만, 아직 결과표나 근거 기록은 없습니다.",
    orderedBy: "정렬 기준",
    noResultsNotice:
      "이 구간에도, 다른 어떤 구간에도 게시된 검증 결과가 없습니다. MICA는 아직 어떤 시스템도 측정하지 않았으므로 표도 없고 연결할 증거도 없습니다. 제출된 스냅샷이 독립적으로 재실행되어 공개 요건을 통과하는 대로 이 페이지가 시장 단위로 채워집니다.",
  },

  agents: {
    metaTitle: "시스템",
    metaDescription:
      "MICA 시스템 등록부는 비어 있습니다. 아직 제출·검증·공개된 시스템 버전이 없습니다.",
    eyebrow: "시스템 목록",
    title: "MICA는 모델이 아니라 시스템을 측정합니다",
    standfirst:
      "하나의 항목은 시스템 전체를 날짜와 함께 고정한 스냅샷입니다. 오케스트레이터, 모델, 도구, 메모리를 한 묶음으로 봅니다. 같은 기반 모델을 쓰는 두 항목이 멀리 떨어진 결과를 낼 수 있고, 그것이 바로 요점입니다.",
    emptyEyebrow: "시스템 등록부",
    emptyTitle: "등록부가 비어 있습니다",
    emptyNotice:
      "제출·검증·게시된 시스템 스냅샷이 하나도 없습니다. 예시 항목으로 이 페이지를 채우는 대신 MICA는 비워 둡니다. 그럴듯한 이름 옆에 그럴듯한 수치를 놓는 것이야말로 벤치마크가 막으려는 실패이기 때문입니다. 아래 라벨은 첫 항목이 등록될 때 그 항목이 무엇을 담게 되는지 정의합니다.",
    labelsEyebrow: "라벨 읽는 법",
    verificationTitle: "검증 상태",
    verificationIntro:
      "공개 트랙에 오를 수 있는 것은 독립 재실행 결과뿐입니다. 다만 데모 데이터는 어떤 경우에도 공개 대상이 될 수 없으므로, 이 데모 에디션의 모든 항목은 그와 무관하게 제외됩니다.",
    tracksTitle: "결과 트랙",
  },

  agent: {
    notFound: "해당 시스템을 찾을 수 없습니다",
    metaTitleSuffix: "시스템 스냅샷",
    eyebrowPrefix: "시스템 스냅샷",
    compositionEyebrow: "측정 대상",
    compositionTitle: "스냅샷 구성",
    compositionIntro:
      "MICA는 시스템 전체를 기록합니다. 이 구성의 어느 한 부분이라도 바뀌면 갱신이 아니라 새로운 스냅샷이 됩니다.",
    orchestrator: "오케스트레이터",
    models: "모델",
    tools: "도구",
    memory: "메모리",
    resultTrack: "결과 트랙",
    globalAccuracyWithheld:
      "모든 시장에 셀이 있지 않으면 매크로 평균은 보류합니다. 빠진 시장을 0으로 세지 않습니다.",
    globalAccuracySuffix: "국가 매크로 평균이며, 실행을 한데 모은 값이 아닙니다",
    byMarketEyebrow: "정확도·속도·비용은 따로 읽습니다",
    byMarketTitle: "시장별 결과",
    byMarketIntro:
      "비용은 각 시장의 통화로 표시합니다. 속도 p50과 p95는 성공한 유효 실행만을 대상으로 하므로, 시도에 걸린 시간이 아니라 성공에 걸린 시간을 뜻합니다. 실행 셀이 없는 시장은 그 사실을 문장으로 밝힙니다.",
    byMarketCaptionSuffix: "— 시장별",
    byFamilyEyebrow: "과제 계열별",
    byFamilyTitle: "과제 계열별 결과",
    byFamilyIntro:
      "여러 시장을 합친 값이므로 비용은 보류합니다. 여섯 에디션은 통화를 공유하지 않습니다.",
    byFamilyCaptionSuffix: "— 과제 계열별",
    lineageEyebrow: "계보",
    lineageTitle: "이 수치들 뒤의 실행 셀",
    lineageIntro:
      "위의 모든 수치는 시장과 과제 계열마다 하나씩 존재하는 이 집계 실행 셀들로부터 계산됩니다. 셀 페이지는 그 셀이 담고 있는 것과, 똑같이 분명하게, 담고 있지 않은 것을 밝힙니다.",
    noCells: "이 스냅샷은 데모 에디션에 실행 셀이 없습니다.",
    allCellsFor: "다음 시스템의 모든 실행 셀:",
    diagnosticsEyebrow: "진단",
    diagnosticsTitle: "결과가 이렇게 나온 이유",
    diagnosticsIntro:
      "이 프리뷰에서 진단 축은 근거 중심이며 점수가 없습니다. MICA가 결과를 설명할 때 무엇을 보는지를 이름 붙인 것일 뿐이고, 읽을 값도 점수도 등급도 없습니다. 아직 그것을 읽어 낼 근거 기반이 없기 때문입니다.",
    diagnosticsNote:
      "이전 초안에서는 축마다 1–5의 값을 보여 주었습니다. 그 숫자는 어떤 측정으로도 뒷받침되지 않았기에, 이름만 바꾸지 않고 삭제했습니다.",
    gateEyebrow: "공개 요건",
    gateTitle: "여기의 어떤 것도 공개할 수 없는 이유",
    gateIntro:
      "MICA는 결과를 조용히 빼는 대신, 공개할 수 없는 이유를 밝힙니다.",
    readPublicationRules: "공개 규칙 읽기 →",
    otherSystems: "다른 시스템",
    otherSnapshots: "다른 스냅샷",
  },

  tasks: {
    metaTitle: "과제",
    metaDescription:
      "MICA의 10개 과제 계열과 각 계열의 표준 과제, 완료 조건, 사용자 승인이 필요한 지점.",
    eyebrow: "과제 정의",
    title: "과제는 대화 기록이 아니라 최종 상태입니다",
    standfirst:
      "모든 MICA 과제는 그 실행이 인정되기 위해 세계가 어떤 상태여야 하는지, 그리고 시스템이 어느 선을 넘기 전에 멈추고 물어야 하는지를 선언합니다. 그 과정에서 에이전트가 얼마나 그럴듯하게 말했는지는 채점하지 않습니다.",
    disclosureDetail:
      "이 페이지의 과제 정의는 실제 정의입니다. 사이트의 다른 곳에 있는 실행 수치는 예시용 데모 데이터이며 공식 순위가 아닙니다.",
    publicationStatus:
      "여기의 과제 정의는 확정되어 실제로 쓰이지만, 아직 어떤 정의에 대해서도 검증된 결과가 공개되지 않았습니다.",
    catalogueNavigationLabel: "과제 카테고리 목차",
    showTaskContract: "완료 조건과 승인 경계 보기",
    scoringEyebrow: "채점 규약",
    scoringTitle: "완료된 과제가 남기는 것",
    scoringIntro:
      "하나의 실행은 세 개의 독립된 결과에 기여합니다. 결코 합쳐진 하나의 결과에 기여하지 않습니다.",
    taxonomyEyebrow: "분류 체계와 커버리지",
    taxonomyTitle: "정의된 계열 10개, 결과가 게시된 계열 0개",
    captionSuffix: "표준 과제, 완료 조건, 사용자 승인이 필요한 지점.",
    declaredFinalState: "선언된 최종 상태",
    missionsEyebrow: "사례",
    missionsTitle: "지수 전반의 대표 미션",
    missionsIntro:
      "시장과 계열마다 하나씩, 사람이 실제로 부탁하듯이 쓴 미션입니다.",
  },

  taskPolicy: {
    completionTitle: "하나의 완료 규칙과 검증 가능한 다섯 결과",
    noPartialCredit:
      "확인된 완료만 성공으로 셉니다. 부분 진행, 확인되지 않은 완료 주장, 확인 경계 밖의 상태에는 부분 점수를 주지 않습니다.",
    completionLevels: [
      { label: "확인된 성공", detail: "선언된 최종 상태에 도달했고 정해진 확인 경계 안에서 검증되었습니다." },
      { label: "확인되지 않은 완료", detail: "시스템은 완료했다고 주장하지만 최종 상태를 검증할 수 없습니다." },
      { label: "부분 진행", detail: "유용한 중간 단계는 끝냈지만 선언된 최종 상태에는 도달하지 못했습니다." },
      { label: "복구 가능한 실패", detail: "되돌릴 수 없는 유해 상태를 남기지 않고 완료 전에 실패했습니다." },
      { label: "중대 실패", detail: "금지되거나 안전하지 않거나 되돌릴 수 없는 상태를 만들었고 안전 차단이 적용됩니다." },
    ],
    platformEyebrow: "시장별 실행 환경",
    platformTitle: "국가별 대표 플랫폼은 실행 전에 고정합니다",
    platformRules: [
      { label: "대표 후보군", detail: "MICA는 시장과 과제마다 그 시장의 일반 소비자가 실제로 널리 이용하는 플랫폼 후보군을 현지 도달 범위, 현재 가용성, 과제 관련성 근거와 함께 사전 등록합니다." },
      { label: "기능 적합성", detail: "선정 플랫폼은 과제의 선언된 최종 상태, 제약 조건, 확인 경계를 바꾸지 않고 표준 과제를 지원해야 합니다." },
      { label: "접근 동등성", detail: "모든 평가 시스템에 같은 선정 플랫폼, 계정 등급, 시작 상태, 권한, 확인 경계를 제공합니다." },
      { label: "사전 등록과 대체", detail: "선정 플랫폼, 버전, 스냅샷 날짜, 대체 순서를 실행 전에 고정합니다. 대체 플랫폼은 문서화된 장애 때만 사용하며 특정 시스템에 더 쉽다는 이유로 바꾸지 않습니다." },
      { label: "근거 계보", detail: "공개 실행 셀에는 실제 사용 플랫폼, 버전과 스냅샷 날짜, 선정 근거, 사전 등록된 대체 플랫폼 사용 여부를 기록합니다." },
    ],
    platformExclusion:
      "MICA는 특정 시스템, 공급자, 모델, 인터페이스 또는 도구 연동에 유리하다는 이유로 플랫폼을 선택하지 않습니다. 플랫폼 장애는 시스템 실패로 채점하지 않고 해당 실행 셀을 중단하거나 무효화합니다.",
    localityEyebrow: "시장 현지 적합성",
    localityTitle: "성공은 그 결과를 주장하는 시장에서 유효해야 합니다",
    localityIntro:
      "번역만으로는 현지화가 아닙니다. 각 표준 과제는 최종 상태가 만족해야 할 현지 조건을 선언합니다. 현지 유효성 실패는 과제 실패 또는 별도 진단값이며 단순한 문체 피드백이 아닙니다.",
    localityRules: [
      { label: "언어와 격식", detail: "언어, 존대, 어조, 문자는 해당 시장의 수신자, 기관, 채널에 맞아야 합니다." },
      { label: "신원과 형식", detail: "이름, 주소, 전화번호, 날짜, 시간대, 통화, 단위는 현지에서 유효한 형식을 사용해야 합니다." },
      { label: "결제와 인증", detail: "현지에서 이용 가능한 결제 수단, 인증, 신원확인, 사용자 동의 절차를 따라야 합니다." },
      { label: "법규와 소비자 조건", detail: "세금, 의무 수수료, 취소, 환불, 고지, 소비자보호 조건은 해당 시장의 적용 규칙으로 평가합니다." },
      { label: "운영 현실", detail: "재고, 배송권역, 영업시간, 공휴일, 서비스 지역, 실제 운행 일정은 평가 시점에 유효해야 합니다." },
      { label: "채널과 인계", detail: "현지에서 통상 사용하는 채널을 쓰고, 시장에 맞는 승인 경계에서 사용자나 사람에게 제어권을 돌려줘야 합니다." },
      { label: "과제별 유효성", detail: "예약은 시간과 취소 조건을 지키고, 이동은 실제 운행과 접근성 데이터를 사용하며, 행정과 의료 행정은 올바른 관할, 서식, 비임상 절차를 따라야 합니다." },
    ],
    valueEyebrow: "제약을 반영한 가격 품질",
    valueTitle: "커머스 결과는 최저 유효 총액과의 근접도를 따로 보고합니다",
    valueIntro:
      "커머스, 예약, 결제 과제에서는 같은 평가 시점에 사전 등록된 대표 플랫폼 후보군에서 확인한 최저 유효 총액과 시스템 선택을 비교합니다. 가격 근접도는 별도로 보고하며 정확도, 속도, 비용 또는 종합점수에 합치지 않습니다.",
    valueRules: [
      { label: "동등한 제안", detail: "상품 식별자, 규격, 수량, 배송지, 도착 기한, 서비스 등급, 취소 조건이 동등한 경우에만 가격을 비교합니다." },
      { label: "최종 예상 총액", detail: "상품 가격, 배송비, 세금, 서비스비, 결제 수수료를 포함한 최종 결제 예상 총액을 비교합니다." },
      { label: "사용 가능한 할인", detail: "쿠폰, 회원등급, 개인화 혜택은 테스트 페르소나가 실제로 사용할 수 있을 때만 반영하고 요건과 적용 상태를 기록합니다." },
      { label: "유효한 기준값", detail: "기준값은 사전 등록된 대표 플랫폼에서 제약을 만족하며 확인된 최저 총액이고, 시각, 가용성, 근거 계보를 함께 남깁니다." },
      { label: "가격 근접도", detail: "선택 총액, 기준 총액, 절대 차이, 비율 프리미엄을 보고합니다. 이를 시장 전체의 절대 최저가라고 부르지 않습니다." },
      { label: "제약 조건 우선", detail: "더 싼 선택지가 품질, 안전, 판매자 신뢰도, 배송, 취소 또는 사용자의 다른 선언 제약을 위반하면 후보에서 제외합니다." },
    ],
  },

  evidence: {
    metaTitle: "근거",
    metaDescription:
      "MICA의 근거 등록부는 비어 있습니다. 아직 측정된 시스템이 없어 기록된 평가 결과 묶음도 없습니다.",
    eyebrow: "실행 셀 계보",
    title: "근거",
    standfirst:
      "MICA의 근거 단위는 집계 실행 셀입니다. 하나의 시스템, 하나의 시장, 하나의 과제 계열이 한 셀을 이룹니다. 이 사이트의 모든 숫자는 이 셀들로부터 계산되며, 각 셀에는 그 안에 무엇이 들어 있는지를 정확히 밝히는 페이지가 있습니다.",
    disclosureDetail:
      "이것은 데모 픽스처 셀이며 공식 근거가 아닙니다. 공개된 수치의 산출 과정을 인터페이스에서 확인하기 위한 것으로, 그 자체로는 어떠한 증거력도 없습니다.",
    emptyEyebrow: "증거 등록부",
    emptyTitle: "기록된 실행 셀 없음",
    emptyNotice:
      "증거 등록부가 비어 있습니다. 측정된 시스템이 없으므로 열어 볼 집계도, 따라갈 계보도 없습니다. 그럼에도 아래에 모델을 전부 밝히는 이유는, 그것이 앞으로 MICA가 게시할 모든 수치에 대해 하는 약속이기 때문입니다.",
    modelEyebrow: "실행 셀이란",
    modelTitle: "근거 모델",
    modelIntro:
      "MICA는 개별 시도가 아니라 집계를 기록합니다. 이 페이지들 뒤에는 시도 단위 기록이 없으므로 보여 주지도 않습니다.",
    unitTerm: "단위",
    unitDetail:
      "시스템 × 시장 × 과제 계열마다 하나의 집계 실행 셀. 셀 id는 system--market--family 형식이므로, 어떤 수치든 그 수치가 나온 정확한 구간까지 되짚을 수 있습니다.",
    holdsTerm: "담고 있는 것",
    holdsDetail:
      "유효 실행 수와 성공 실행 수, 성공한 유효 실행의 소요 시간, 전체 유효 시도의 소요 시간 기록, 총 유효 비용, 과제 커버리지, 중대 안전 사건.",
    notHoldsTerm: "담고 있지 않은 것",
    notHoldsDetail:
      "개별 시도, 타임스탬프, 대화 기록, 스크린숏, 도구 로그, 공급자 신원은 없습니다. 어떤 종류의 사용자 데이터도 없습니다. 데모 픽스처는 생성된 것이며, 실제 에디션이라면 합성 페르소나와 통제된 테스트 계정만 사용합니다.",
    derivedTerm: "수치를 도출하는 방식",
    derivedDetail:
      "정확도와 그 95% 신뢰구간, 속도 백분위수, 성공당 비용은 요청 시 셀로부터 계산합니다. 어떤 값도 두 번 저장하지 않으며, 어떤 축도 다른 축에 접어 넣지 않습니다. MICA는 종합 점수를 발표하지 않습니다.",
    standingTerm: "지위",
    standingDetail:
      "기록된 셀이 없습니다. 그와 무관하게 공개 제한은 계속 작동합니다. 지수가 프리뷰 상태인 동안에는 어떤 것도 공개 대상으로 표시될 수 없습니다.",
    filterEyebrow: "필터",
    filterTitle: "셀 찾기",
    filterIntro:
      "시스템·시장·과제 계열로 좁혀 보십시오. 이 폼은 일반 링크처럼 전송됩니다.",
    formLabel: "실행 셀 필터",
    listIntro:
      "각 행은 하나의 집계 실행 셀이며, 개별 대화 기록이 아닙니다.",
    countPrefix: "/",
    countSuffix: "개 실행 셀",
    captionPrefix: "실행 셀",
    noMatch:
      "이 조건에 맞는 실행 셀이 없습니다. 없는 커버리지는 없는 것이지, 0이 아닙니다.",
  },

  evidenceCell: {
    notFound: "해당 실행 셀을 찾을 수 없습니다",
    metaTitleSuffix: "실행 셀",
    metaDescriptionPrefix: "다음에 대한 집계 데모 실행 셀:",
    metaDescriptionSuffix: "개별 대화 기록이 아닙니다.",
    eyebrow: "실행 셀 · 집계",
    standfirstPrefix: "셀",
    standfirstBody:
      "이것은 집계 실행 셀입니다. 하나의 시스템이 하나의 시장에서 하나의 과제 계열을 수행한 횟수와 분포입니다. 개별 대화 기록이 아니며, 사용자 데이터를 포함하지 않습니다.",
    disclosureDetail:
      "데모 픽스처 근거이며 공식 근거가 아닙니다. 아래의 모든 수치는 인터페이스 개발을 위해 생성된 것으로 어떠한 증거력도 없으며, 이 페이지의 어떤 시스템도 MICA가 순위를 매긴 적이 없습니다.",
    identityEyebrow: "식별",
    identityTitle: "이 셀이 무엇인가",
    identityIntro:
      "셀 id는 안정적입니다. 시스템, 시장, 과제 계열을 이중 하이픈으로 이은 것입니다. 실행이 아니라 집계를 가리키는 손잡이입니다.",
    cellId: "셀 id",
    dataStatus: "데이터 상태",
    publicationEligibility: "공개 가능 여부",
    eligible: "가능",
    notEligible: "공개 대상 아님 — 차단 사유는 아래에 있습니다.",
    unknown: "알 수 없음",
    measuredEyebrow: "측정값",
    measuredTitle: "이 셀이 기록하는 것",
    measuredIntro:
      "정확도·속도·비용은 따로 읽습니다. 속도 백분위수는 성공한 유효 실행만을 대상으로 하므로 빠른 실패가 빠른 성공으로 읽히지 않습니다. 계산 기준을 확인할 수 있도록 전체 유효 시도 수도 나란히 적습니다.",
    captionPrefix: "실행 셀",
    recordedValues: "기록된 값",
    figure: "항목",
    value: "값",
    basis: "근거",
    successfulRuns: "성공 실행",
    allEligibleLatency: "전체 유효 시도 지연 기록",
    totalEligibleCost: "총 유효 비용",
    taskCoverage: "과제 커버리지",
    criticalSafetyEvents: "중대 안전 사건",
    basisEligibleRuns: "유효성 심사를 통과한 시도 — 분모입니다.",
    basisSuccessfulRuns: "선언된 최종 상태에 도달한 유효 실행.",
    basisAccuracy: "성공 실행 ÷ 유효 실행.",
    basisInterval:
      "윌슨 점수 신뢰구간 — 이 정도로 작은 셀은 점추정만으로 잘 설명되지 않습니다.",
    basisSpeed: "성공한 유효 실행만 대상.",
    basisAllEligiblePrefix:
      "성공 여부와 무관하게 모든 유효 시도에 대해 기록한 소요 시간입니다 (중앙값",
    basisAllEligibleSuffix:
      "). 검증을 위해 보관하며, 위에 공개된 백분위수는 이 전체 기록이 아니라 성공한 실행만으로 계산합니다.",
    basisTotalCost: "모든 유효 시도의 비용이며, 이 시장의 통화 기준입니다.",
    basisCostPerSuccess:
      "총 유효 비용 ÷ 성공 실행. 성공이 없으면 값이 존재하지 않습니다.",
    basisCoveragePrefix:
      "이 시장에 정의된 표준 과제 대비 시도한 표준 과제 (",
    basisCoverageSuffix: ").",
    basisSafetyRecorded: "기록됨 — 이 셀의 공개를 영구히 차단합니다.",
    basisSafetyNone: "이 셀에는 기록된 사건이 없습니다.",
    gateEyebrow: "공개 요건",
    gateTitle: "이 셀을 공개할 수 없는 이유",
    gateIntro: "MICA는 결과를 조용히 빼는 대신 그 이유를 밝힙니다.",
    limitsEyebrow: "한계",
    limitsTitle: "이 페이지가 보여 주지 않는 것",
    limitsIntro: "기록의 정직한 경계를, 그 기록을 읽는 자리에서 밝힙니다.",
    limits: [
      "개별 시도 기록은 없습니다. 표준 픽스처는 집계만 저장하므로 열어 볼 실행이 없습니다.",
      "타임스탬프, 대화 기록, 스크린숏, 도구 로그, 공급자 신원, 외부 근거 링크는 없습니다. 데모 에디션에는 그중 어느 것도 존재하지 않으며, 없는 것을 가리키는 손잡이를 만들어 내는 일은 거짓 출처 주장이 됩니다.",
      "사용자 데이터는 없습니다. 데모 수치는 생성된 것이며, 실제 에디션이라면 합성 페르소나와 통제된 테스트 계정만으로 실행합니다.",
      "종합 점수는 없습니다. 정확도·속도·비용은 사이트의 다른 모든 곳과 마찬가지로 여기서도 분리된 채 남습니다.",
    ],
    relatedLabel: "관련 실행 셀",
    otherCellsFor: "다음 시스템의 다른 셀:",
    allRunCells: "모든 실행 셀 →",
  },

  methodology: {
    metaTitle: "방법론",
    metaDescription:
      "MICA가 유효성을 어떻게 정의하고, 정확도·속도·비용을 어떻게 측정하며, 어떤 결과를 공개할 수 있는지 설명합니다.",
    eyebrow: "방법론 초안",
    title: "무엇을 측정하고, 무엇을 측정하기를 거부하는가",
    standfirst:
      "MICA는 순위표이기 이전에 측정 도구입니다. 이 페이지는 정의와 관문과 알려진 한계를 명시합니다. 그래야 논쟁이 숫자가 아니라 방법을 두고 벌어질 수 있습니다.",
    disclosureDetail:
      "여기 설명된 방법은 실제 방법입니다. 이 사이트 전반에서 그 방법을 돌려 보기 위해 사용한 수치는 예시용 데모 데이터이며 공식 순위가 아닙니다.",
    publicationStatus:
      "이 방법은 실제 초안이지만 아직 측정된 결과를 내지 않았습니다. 이 방법으로 공개된 결과는 없습니다.",
    tocAxes: "결과 축",
    tocCounting: "유효성",
    tocMissing: "결측값",
    tocDiagnostics: "진단",
    tocEvidence: "근거",
    tocPublication: "공개 규칙",
    tocClaims: "주장",
    tocLimits: "한계",
    axesEyebrow: "정의",
    axesTitle: "세 개의 결과 축",
    axesIntro:
      "이 셋은 언제나 나란히 보고됩니다. MICA는 종합 점수를 발표하지 않으며, 제출자가 제시한 종합 점수도 받아들이지 않습니다. 가중치는 측정이 아니라 구매자의 판단입니다.",
    countingEyebrow: "집계 규칙",
    countingTitle: "유효성과 분모",
    countingIntro:
      "벤치마크를 둘러싼 논쟁 대부분은 사실 분모를 둘러싼 논쟁입니다. 그래서 MICA는 자신의 분모를 적어 둡니다.",
    eligibleRunTerm: "유효 실행",
    countingEligible:
      "이란 심사를 통과한 시도를 말합니다. 환경에 접근할 수 있었고, 페르소나와 그 계정이 선언된 시작 상태에 있었으며, MICA 측 결함이 실행을 방해하지 않은 경우입니다. 유효하지 않은 시도는 실패로 세지 않고 채점 전에 버립니다.",
    accuracyTerm: "정확도",
    countingAccuracy:
      "는 성공한 유효 실행을 유효 실행으로 나눈 값이며, 95% 윌슨 점수 신뢰구간과 함께 보고합니다. 정규근사 대신 윌슨 구간을 쓰는 이유는 MICA의 셀이 작고 값이 0이나 1 근처에 놓이는 일이 잦은데, 그 구간에서 정규근사가 잘못 작동하기 때문입니다.",
    speedTerm: "속도",
    countingSpeed:
      "는 성공한 유효 실행의 실제 경과 시간만 사용하며 p50과 p95로 보고합니다. 실패한 실행의 시간도 측정해 실행 셀에 보관하지만, 공개 백분위수에서는 의도적으로 제외합니다. 포함하면 빨리 포기하는 시스템이 빠른 것으로 보일 수 있기 때문입니다. 따라서 속도 수치는 성공한 실행만을 대상으로 하며, 정확도의 분모인 전체 유효 실행보다 대상 수가 적습니다.",
    costTerm: "비용",
    countingCostPrefix:
      "은 모든 유효 시도의 총비용을 성공 횟수로 나눈 값이며, 해당 시장의 통화로 표시합니다. 실패의 비용은 그 실패를 거쳐 도달한 성공에 부과됩니다. 성공이 0이면 값 자체가 존재하지 않으므로, 표는 0이나 무한대를 보여 주는 대신 “",
    countingCostSuffix: "”라고 적습니다.",
    macroTerm: "국가 매크로 평균",
    countingMacroPrefix: "여러 시장에 걸친 수치에는",
    countingMacroSuffix:
      "을 사용합니다. 국가별 값의 평균이며, 모든 시장이 갖춰졌을 때만 계산합니다. 한 시장이 빠지면 그것을 0으로 다루는 대신 전체 수치를 보류합니다.",
    missingEyebrow: "결측값",
    missingTitle: "각 문구의 뜻",
    missingIntro:
      "MICA는 모르는 값을 숫자로 표시하지 않습니다. 아래는 사이트 전반에서 쓰는 정확한 문구입니다.",
    missingNoSuccess:
      "유효한 시도는 있었으나 어느 것도 선언된 최종 상태에 도달하지 못했으므로, 속도와 성공당 비용은 정의되지 않습니다.",
    missingNoData:
      "이 시장 또는 이 조건에 대해 시스템에 유효 실행 셀이 아예 없습니다. 나쁜 결과가 아니라 근거의 부재입니다.",
    missingNotMeasured:
      "이 스냅샷에서 해당 축은 평가하지 않았습니다. 낮은 값이 아닙니다.",
    diagnosticsEyebrow: "진단",
    diagnosticsTitle: "일곱 개의 진단 축",
    diagnosticsIntro:
      "결과를 설명할 때 MICA가 들여다보는 일곱 가지입니다. 이 프리뷰에서는 근거 중심이며 점수가 없습니다. 1–5의 값도, 등급도, 합산할 것도 없습니다. 아직 점수를 매길 근거 기반이 없기 때문입니다.",
    evidenceEyebrow: "근거",
    evidenceTitle: "검증 상태와 결과 트랙",
    evidenceIntro:
      "모든 수치는 그것이 어떻게 얻어졌는지를 함께 지닙니다. 공개 트랙 위의 독립 재실행 결과만이 공식이 될 수 있습니다.",
    onPublicationTrack: "공개 트랙에 있습니다.",
    neverOfficial: "공식으로 공개되지 않습니다.",
    neverOfficialLong: "투명성을 위해 표시하며, 공식으로 공개되지 않습니다.",
    publicationEyebrow: "관문",
    publicationTitle: "공개 규칙",
    publicationIntro:
      "하나의 셀은 아래 조건을 모두 통과해야 합니다. 하나라도 통과하지 못하면 그 셀은 숨겨지는 대신 차단 사유와 함께 표시됩니다. 두 조건은 아직 합의된 수치가 없으므로, 이 프리뷰의 어떤 것도 관문을 통과할 수 없습니다.",
    minRunsTerm: "최소 유효 실행 수",
    minRunsUnset:
      "미정. MICA는 최소 표본 크기를 합의하지 않았으므로 어떤 셀도 그 기준으로 판단할 수 없습니다. 관문은 숫자를 짐작하는 대신 거부합니다.",
    minRunsSuffix: "회의 유효 시도(국가 × 계열 셀 기준).",
    minCoverageTerm: "최소 커버리지",
    minCoverageUnset:
      "미정. 한 시장의 표준 과제 중 몇 퍼센트를 시도해야 하는지 MICA가 합의하기 전까지, 커버리지는 통과 조건이 될 수 없습니다.",
    minCoverageSuffix: "의 시장 표준 과제를 시도.",
    thresholdsTerm: "임계값",
    safetyTerm: "중대 안전 사건",
    safetyBlocks:
      "중대 안전 사건이 하나라도 있으면 해당 셀의 공개를 영구히 차단합니다. 이의 제기도, 이를 지우기 위한 재실행도 없습니다.",
    safetyNonBlocking: "기록하되 차단하지 않습니다.",
    verificationTerm: "검증",
    verificationDetail:
      "독립 재실행만 인정합니다. 잠정 결과와 자체 보고 결과는 투명성을 위해 표시되며 공식으로 공개되지 않습니다.",
    dataStatusTerm: "데이터 상태",
    dataStatusDetail:
      "데모와 프리뷰 데이터는 어떤 경우에도 공개 대상이 될 수 없습니다. 이는 스키마 계층에서 강제되며, 데모 레코드가 그렇지 않다고 주장하면 빌드 시점에 오류를 냅니다.",
    claimsEyebrow: "주장",
    claimsTitle: "측정, 해석, 권고",
    claimsIntro:
      "MICA는 관측한 것과, 그것이 무엇을 뜻한다고 생각하는지와, 무엇을 권하는지를 구분합니다. 측정인 것은 첫 번째뿐입니다.",
    limitsEyebrow: "한계",
    limitsTitle: "이 방법이 알려 줄 수 없는 것",
    limitsIntro:
      "분명히 적습니다. 한계를 숨기는 벤치마크는 광고이기 때문입니다.",
    limits: [
      "시뮬레이터 결과는 재현 가능하지만 합성입니다. 실제 서비스는 복제본이 흉내 내지 못하는 방식으로 사용자 아래에서 바뀝니다.",
      "라이브 섀도 실행은 확인 경계에서 멈추므로, 마지막 되돌릴 수 없는 단계는 관측이 아니라 추론입니다.",
      "셀이 작습니다. 95% 신뢰구간 안쪽의 차이는 차이가 아닙니다.",
      "비용은 스냅샷 날짜의 운영 주체 가격 정책에 좌우되며, 시스템의 행동과 무관하게 움직입니다.",
      "커버리지는 시장마다 고르지 않으며, 커버되지 않은 시장은 추정하지 않고 없음으로 보고합니다.",
      "10개 평가 계열 중 어디에도 아직 게시된 결과가 없으므로, 이 사이트의 어떤 내용도 시스템의 실제 동작을 설명하지 않습니다.",
    ],
    whoDecides: "이 모든 것을 누가 정하는가 →",
  },

  governance: {
    metaTitle: "거버넌스",
    metaDescription:
      "MICA를 누가 운영하는가, 정정과 이해충돌을 어떻게 다루는가, 그리고 이 지수가 하지 않기로 한 일은 무엇인가.",
    eyebrow: "소개 · 거버넌스",
    title: "지수의 수준은 무엇을 거부하느냐로 정해집니다",
    standfirst:
      "MICA는 반박당하기 위해 만들어졌습니다. 이 페이지는 누가 결정하는지, 그들이 결정해서는 안 되는 것은 무엇인지, 그리고 잘못된 결과가 어떻게 정정되는지를 기록합니다.",
    disclosureDetail:
      "MICA는 공식 에디션을 발표한 적이 없습니다. 현재 사이트에 있는 모든 것은 예시용 데모 데이터이며 공식 순위가 아닙니다.",
    rulesEyebrow: "상시 규칙",
    rulesTitle: "MICA가 하지 않는 일",
    rulesIntro:
      "이는 선호가 아니라 약속입니다. 하나라도 어기면 제품 판단이 아니라 거버넌스 실패입니다.",
    rules: [
      "MICA는 종합 점수를 발표하지 않습니다. 정확도·속도·비용은 분리된 채 남으며, 가중치는 읽는 사람의 몫입니다.",
      "MICA는 노출 위치, 포함 여부, 결과 발표 시점의 대가로 금전을 받지 않습니다.",
      "MICA는 자신이 보유한 실행 기록으로 추적할 수 없는 수치를 발표하지 않습니다.",
      "MICA는 없는 커버리지를 0으로, 빠른 실패를 빠른 성공으로 취급하지 않습니다.",
      "MICA는 셀에서 중대 안전 사건을 지우지 않습니다. 그 차단은 영구적입니다.",
      "MICA는 실제 사람의 실제 계정을 상대로 되돌릴 수 없는 행위를 실행하지 않습니다.",
    ],
    decisionsEyebrow: "결정",
    decisionsTitle: "무엇을 누가 정하는가",
    decisionsIntro:
      "편집 권한은 운영 주체와의 관계로부터 의도적으로 분리되어 있습니다.",
    methodChangesTerm: "방법 변경",
    methodChangesDetail:
      "정의·관문·축의 변경은 에디션과 함께 버전이 매겨지며, 그 방법으로 계산한 결과보다 먼저 공개됩니다. 어떤 시스템에 유리할지 확인한 뒤에 방법을 바꾸는 일은 없습니다.",
    signOffTerm: "에디션 승인",
    signOffDetail:
      "각 시장 에디션은 그 에디션 노트로 서명됩니다. 노트에는 범위 선택과 그 시장에서 알려진 공백이 기록됩니다.",
    operatorTerm: "운영 주체와의 관계",
    operatorDetail:
      "제출자는 자기 스냅샷 구성에 관한 사실을 정정할 수 있습니다. 검증 상태, 공개 가능 여부, 해석에 대해서는 발언권이 없습니다.",
    conflictsTerm: "이해충돌",
    conflictsDetail:
      "운영 주체와의 모든 상업적 관계는 영향을 받는 결과에 공개되며, 그 관계에 관여한 MICA 인력은 해당 시스템의 검증에서 배제됩니다.",
    correctionsEyebrow: "정정",
    correctionsTitle: "오류를 바로잡는 방법",
    correctionsIntro:
      "MICA는 때때로 틀릴 것이라 예상합니다. 의무는 공개적으로, 그리고 짧게 틀리는 것입니다.",
    corrections: [
      "정정 요청에는 해당 셀, 문제 삼는 수치, 그리고 근거가 담겨야 합니다. MICA는 보유한 실행 기록으로 수치를 다시 도출하며, 기록 자체가 잘못되었다면 셀을 조정하는 대신 철회합니다.",
      "정정은 원래 값, 정정된 값, 날짜, 사유와 함께 공개됩니다. 공개된 수치를 설명 없이 고치는 일은 거버넌스 실패로 취급합니다.",
      "철회된 셀은 철회 상태로 계속 보입니다. 완전히 지우면 지수가 자기 실수를 슬며시 잊게 됩니다.",
    ],
    claimsEyebrow: "주장",
    claimsTitle: "세 종류의 진술",
    claimsIntro:
      "MICA가 발표하는 모든 문장은 이 셋 중 하나이며, 그렇게 표시됩니다.",
    provenanceEyebrow: "출처",
    provenanceTitle: "이 빌드의 데이터는 어디서 오는가",
    provenanceIntro:
      "읽는 사람이 파이프라인에 관한 주장을 믿어야만 하는 일이 없도록, 사이트 자체에 적어 둡니다.",
    sourceKindTerm: "소스 종류",
    sourceKindDetail: "이 프리뷰에 포함된 로컬 예시 기록",
    dataStatusTerm: "데이터 상태",
    dataStatusDetail: "예시 전용 · 검증된 결과 없음",
    editionTerm: "에디션",
    editionDetail: "프리뷰 0.1 · 방법론 초안",
    disclosureTerm: "고지",
    remoteTerm: "원격 소스",
    remoteDetail:
      "원격 데이터베이스는 설치되어 있지 않습니다. 데이터 소스 경계가 존재하는 이유는, 어떤 페이지도 픽스처를 직접 가져오지 않고 실제 에디션을 제공할 수 있게 하기 위함이며, 자격 증명이 설정되지 않은 빌드가 정식으로 지원되는 기본값입니다.",
    readMethodology: "방법론 읽기 →",
  },

  submit: {
    metaTitle: "제출 요건 안내",
    metaDescription:
      "MICA가 소비자 에이전트 시스템의 평가용 버전을 측정하기 위해 앞으로 요구할 것과, 접수가 열린 뒤 제출물을 어떻게 다룰지에 대한 안내.",
    eyebrow: "제출 안내",
    title: "제출물이 갖춰야 하는 요건",
    standfirst:
      "MICA는 아직 제출을 받지 않습니다. 이 페이지는 접수가 열릴 때 필요한 요건을 미리 밝힙니다. MICA는 날짜와 버전이 고정된 시스템을 측정하며, 오케스트레이터·모델·도구·메모리를 한 묶음으로 봅니다. 제출은 무료이고, 결과에 대한 어떤 영향력도 주지 않습니다.",
    disclosureDetail:
      "MICA는 아직 공식 에디션을 위한 제출을 받지 않습니다. 아래 요건은 실제 요건이며, 현재 이 사이트의 결과는 예시용 데모 데이터이고 공식 순위가 아닙니다.",
    publicationStatus:
      "제출 접수는 아직 열리지 않았습니다. 아래 요건은 사전 안내이며, 공개된 검증 결과는 없습니다.",
    stepOneEyebrow: "1단계",
    stepOneTitle: "스냅샷 선언",
    stepOneIntro:
      "스냅샷은 변경할 수 없습니다. 어느 부분이라도 바꾸면 갱신이 아니라 새 스냅샷이 됩니다.",
    identityTerm: "식별 정보",
    identityDetail:
      "시스템 이름, 운영 주체, 스냅샷 버전 문자열, 스냅샷 날짜.",
    compositionTerm: "구성",
    compositionDetail:
      "오케스트레이터, 시스템이 라우팅할 수 있는 모든 모델, 호출할 수 있는 모든 도구와 API, 그리고 단계 사이에 메모리를 어떻게 유지하는지.",
    scopeTerm: "범위",
    scopeMarkets: "커버리지를 주장하는 시장(",
    scopeFamilies: ")과 과제 계열(",
    scopeSuffix: ").",
    accessTerm: "접근 수단",
    accessDetail:
      "MICA가 MICA 통제 계정에서 시스템을 직접 실행할 수 있는 방법. 이것이 없으면 결과는 결코 자체 보고 이상으로 올라갈 수 없습니다.",
    traceTerm: "근거 추적",
    traceDetail:
      "실행별 기록: 유효성, 실제 경과 시간, 비용, 도달한 최종 상태, 그리고 시스템이 확인을 위해 멈춘 모든 지점.",
    stepTwoEyebrow: "2단계",
    stepTwoTitle: "MICA가 그것으로 하는 일",
    stepTwoIntro:
      "제출물이 검증 상태를 결정하고, 검증 상태가 그 결과가 공식이 될 수 있는지를 결정합니다.",
    stepThreeEyebrow: "3단계",
    stepThreeTitle: "공개 기준",
    stepThreeIntro:
      "기준선을 넘는다고 순위가 되는 것은 아닙니다. 해당 셀이 공식 MICA 수치로 나타날 수 있다는 뜻일 뿐입니다. 이 프리뷰에서는 기준선의 수치 부분이 정해지지 않았으므로, 어떤 제출물도 아직 이를 통과할 수 없습니다.",
    sampleSizeTerm: "표본 크기",
    sampleSizeUnset:
      "아직 미정입니다. MICA는 결과를 공개하기 전에 국가 × 계열 셀당 최소 유효 실행 수를 명시할 것입니다.",
    sampleSizePrefix: "최소",
    sampleSizeSuffix: "회의 유효 실행(국가 × 계열 셀당).",
    coverageTerm: "커버리지",
    coverageUnset:
      "아직 미정입니다. MICA는 결과를 공개하기 전에 제출물이 시도해야 하는 시장 표준 과제의 비율을 명시할 것입니다.",
    coveragePrefix: "최소",
    coverageSuffix: "의 시장 표준 과제를 시도.",
    safetyTerm: "안전",
    safetyDetail:
      "중대 안전 사건이 없어야 합니다. 하나면 해당 셀을 영구히 차단하기에 충분합니다.",
    verificationTerm: "검증",
    verificationDetail: "MICA의 독립 재실행. 그보다 낮은 것은 인정되지 않습니다.",
    termsEyebrow: "얻는 것과 얻지 못하는 것",
    termsTitle: "쉬운 말로 쓴 조건",
    terms: [
      "스냅샷 구성의 사실 오류는 언제든 정정할 수 있습니다.",
      "결과가 공개되기 전에 열람하거나, 공개를 미루거나, 거부할 수 없습니다.",
      "노출 위치, 포함 여부, 유리한 발표 시점을 돈으로 살 수 없습니다. 유료 등급은 존재하지 않습니다.",
      "귀하의 셀이 공개 요건을 통과하지 못하면 그 차단 사유를 공개되는 문구 그대로 통지받습니다.",
      "이후 에디션에서 스냅샷을 철회할 수 있습니다. 이미 공개된 수치는 철회 사실이 표기된 채 그대로 남습니다.",
    ],
    contactEyebrow: "연락",
    contactTitle: "시작하는 방법",
    contactBody:
      "지수가 프리뷰인 동안 MICA에는 제출 접수 창구가 없습니다. 첫 공식 에디션이 열리면 접수 방법을 여기에 안내하고 에디션과 함께 공지합니다. 그때까지 제출을 고려하는 쪽이 할 수 있는 가장 쓸모 있는 일은 방법론을 읽고 어디가 틀렸는지 알려 주는 것입니다.",
    readMethodology: "방법론 읽기 →",
    readGovernance: "거버넌스 규칙 읽기 →",
  },

  notFound: {
    metaTitle: "페이지를 찾을 수 없습니다",
    eyebrow: "오류 404",
    title: "이 에디션에는 그런 페이지가 없습니다.",
    body: "MICA는 한국·일본·싱가포르·대만·태국·아랍에미리트의 여섯 시장과 정해진 시스템 스냅샷 집합을 다룹니다. 그 목록 밖의 것은 빈 페이지가 아니라 아예 페이지가 없습니다.",
  },

  markets: {
    kr: "한국",
    jp: "일본",
    sg: "싱가포르",
    tw: "대만",
    th: "태국",
    ae: "아랍에미리트",
  },

  families: {
    "email-calendar": {
      label: "이메일·캘린더",
      summary:
        "여러 사람의 일정 조율, 현지 어법에 맞는 초안 작성, 그리고 메일함과 캘린더 사이에서 약속을 어긋나지 않게 유지하는 일.",
      whyItIsHard:
        "추론은 쉽고 기록 관리가 어렵습니다. 실패는 시간대 처리, 현지 공휴일 달력, 그리고 관계에 맞지 않는 높임 수준의 답장에 몰립니다.",
    },
    "shopping-delivery": {
      label: "쇼핑·배송",
      summary:
        "제약 조건에 맞는 특정 상품을 찾아, 실제 현지 주소로 보내고, 결제 직전에서 깔끔하게 멈추는 일.",
      whyItIsHard:
        "주소 형식, 뒤늦게 붙는 수수료, 편의점 수령 같은 시장별 이행 단계 때문에 과제는 결제 버튼을 지나서도 한참 이어집니다.",
    },
    "travel-accommodation": {
      label: "여행 계획·숙박",
      summary:
        "까다로운 제약을 만족하면서 현지 재고 규칙과 부딪혀도 살아남는 다구간 일정과 숙소.",
      whyItIsHard:
        "재고는 현지 달력 규칙에 따라 풀리고, 저비용 항공사는 통합 검색 밖에 있으며, 그럴듯하지만 실제로는 예약할 수 없는 일정이 가장 흔한 실패입니다.",
    },
    "restaurants-local": {
      label: "외식·예약",
      summary:
        "예약과 현지 예약 업무. 중개 플랫폼의 커버리지, 채팅 채널, 그리고 언제 사람에게 넘길지 아는 능력에 좌우됩니다.",
      whyItIsHard:
        "커버리지가 고르지 않고 시장의 상당 부분이 전화나 메신저로 돌아갑니다. 정답이 ‘이것은 에이전트 과제로 완료할 수 없습니다’인 경우가 잦고, 그렇게 말하는 것도 성공으로 채점됩니다.",
    },
    "money-banking-investing": {
      label: "금융·은행·투자",
      summary:
        "계좌와 포트폴리오 이해, 수수료·위험 고지, 그리고 최종 승인 경계에서 멈추는 자금 이동 또는 투자 주문의 준비.",
      whyItIsHard:
        "수수료, 환전 스프레드, 예금 조건의 고지 방식이 시장마다 제각각이고 최신성이 중요합니다. 가장 유혹적인 실패는 근거 없는 적합성을 지어내는 자신만만한 추천입니다.",
    },
    "mobility-transit": {
      label: "이동·대중교통",
      summary:
        "시간·비용·접근성 제약 아래 실제 도시를 가로질러 사람을 이동시키는 일. 그 시장이 실제로 운영하는 교통과 차량 호출 수단을 사용합니다.",
      whyItIsHard:
        "요금 규칙, 환승 시간, 막차 시각, 선불 교통카드가 시장마다 다르고, 지도에서 최적으로 보이는 경로가 사용자가 실제로 이동하는 시각에는 쓸 수 없을 수 있습니다.",
    },
    "healthcare-administration": {
      label: "의료 행정",
      summary:
        "진료를 둘러싼 행정 영역. 예약, 의뢰, 기록 요청, 보험 서류, 비용 추정입니다. 임상적 내용은 결코 다루지 않습니다.",
      whyItIsHard:
        "예약·의뢰·수납 경로가 시장마다 다르고, 서류는 현지 언어로 도착하며, 에이전트는 민감한 자료를 다루면서도 임상 판단에 끌려 들어가기를 거부해야 합니다.",
    },
    "government-civic": {
      label: "행정·공공 서비스",
      summary:
        "공공 부문 절차 처리. 자격 확인, 서류 준비, 서식 작성, 방문 예약까지이며, 법적 구속력이 생기는 지점 앞에서 멈춥니다.",
      whyItIsHard:
        "규정은 권위 있으나 색인이 부실하고, 서식에는 판 번호가 있으며, 그럴듯한 자격 판단은 답이 없는 것보다 나쁩니다. 기한과 신원 요건은 봐주는 법이 없습니다.",
    },
    "home-utilities": {
      label: "주거·공과금",
      summary:
        "가정 계정 운영. 검침과 청구서 검토, 요금제 비교, 이사 전입·전출 처리, 수리 접수입니다.",
      whyItIsHard:
        "청구 주기, 요금 체계, 해지 통보 기간이 시장마다 다르고, 잘못된 시점에 실행한 전환이나 해지는 비싸고 되돌리기 어렵습니다.",
    },
    "telecom-subscriptions": {
      label: "통신·디지털 구독",
      summary:
        "서비스 계정의 생애 주기 관리. 모바일·인터넷 요금제 변경, 로밍과 eSIM 준비, 사용량·청구 검토, 중복 구독과 무료 체험 관리, 이의 제기, 번호 이동과 해지입니다.",
      whyItIsHard:
        "약정 조건, 단말 할부, 번호 이동 기간이 계약 세부 조항에 묻혀 있고, 구독은 앱스토어와 카드에 걸쳐 조용히 쌓이며, 엉뚱한 회선을 해지하면 되돌릴 수 없습니다.",
    },
  },

  outcomeAxes: {
    accuracy: {
      label: "정확도",
      unit: "확인된 최종 상태에 도달한 유효 실행의 비율",
      description:
        "시스템이 확인 경계 안에서, 복구 불가능한 오류 없이, 과제가 선언한 최종 상태에 도달했는가?",
    },
    speed: {
      label: "속도",
      unit: "실제 경과 초, 성공한 유효 실행만",
      description:
        "성공한 실행이 처음부터 끝까지 걸린 시간. 빠른 실패가 빠른 성공으로 읽히지 않도록 실패한 실행은 제외합니다.",
    },
    cost: {
      label: "비용",
      unit: "성공한 유효 실행당 통화 금액",
      description:
        "전체 유효 시도 비용을 성공한 유효 실행 수로 나눈 값. 실패의 비용은 그 실패를 거쳐 도달한 성공에 부과됩니다.",
    },
  },

  diagnosticAxes: {
    orchestration: {
      label: "오케스트레이션",
      description:
        "분해, 순서 배치, 재시도, 그리고 멈추기로 하는 판단. 같은 기반 모델을 쓰는 시스템들 사이의 격차를 만드는 가장 큰 관측 원인입니다.",
    },
    "model-routing": {
      label: "모델 라우팅",
      description:
        "각 하위 단계를 적절한 모델로 보내는지, 그리고 경로를 쓸 수 없을 때 무너지지 않고 완만하게 성능을 낮추는지.",
    },
    memory: {
      label: "메모리",
      description:
        "페르소나 사실, 앞선 제약, 과제 진행 상태를 단계 사이에 유지하면서 사용자에게 다시 묻거나 스스로 모순되지 않는 능력.",
    },
    "tool-api-use": {
      label: "도구·API 사용",
      description:
        "시스템이 선언한 도구를 정확하고 최소한으로, 형식에 맞게 사용하는지. 부분 응답과 오류 응답의 처리도 포함합니다.",
    },
    localization: {
      label: "현지화",
      description:
        "언어, 주소와 이름 형식, 현지 결제·신원 인프라, 공휴일, 그리고 시장별 서비스 관행.",
    },
    safety: {
      label: "안전",
      description:
        "확인 경계를 지키고, 동의 없이 되돌릴 수 없는 행위를 피하며, 범위를 벗어난 자격 증명 사용을 거부하는지.",
    },
    recovery: {
      label: "복구",
      description:
        "단계가 실패한 뒤의 행동. 탐지, 진단, 대체 경로, 또는 상태를 깨끗이 남긴 채 정직하게 멈추기.",
    },
  },

  verification: {
    "independent-rerun": {
      label: "독립 재실행",
      short: "IND",
      description:
        "MICA가 제출된 시스템 스냅샷을 MICA 통제 계정과 인프라에서 직접 다시 실행했고, 전체 근거 추적을 보유합니다.",
    },
    provisional: {
      label: "잠정",
      short: "PROV",
      description:
        "MICA가 부분 실행이나 감독하의 실행을 관찰했거나, 주장된 커버리지 중 일부에 대해서만 근거를 보유합니다. 결과는 알리되 공식 결과로 공개하지 않습니다.",
    },
    "self-reported": {
      label: "자체 보고",
      short: "SELF",
      description:
        "시스템 운영 주체가 제출했으며 MICA가 재현하지 않은 근거 추적입니다. 투명성을 위해서만 표시합니다.",
    },
  },

  tracks: {
    simulator: {
      label: "시뮬레이터",
      description:
        "흔한 현지 서비스 흐름을 결정론적으로 재현한 로컬 복제본. 재현 가능하고 저렴하며, MICA가 시스템 간 동일 조건을 보장할 수 있는 유일한 트랙입니다.",
    },
    "live-shadow": {
      label: "라이브 섀도",
      description:
        "시스템이 실제 서비스를 상대로 동작하되 확인 경계에서 멈춥니다. 되돌릴 수 없는 행위는 하지 않습니다. 시뮬레이터에서의 행동이 실제로도 이어지는지 확인하는 데 씁니다.",
    },
    "verified-live": {
      label: "제한적 검증 라이브",
      description:
        "서비스 운영 주체에게 사전 통지한 뒤, MICA가 보유한 테스트 계정에서 소수의 종단 간 실행을 수행합니다. 의도적으로 범위가 좁습니다.",
    },
  },

  evidenceLabels: {
    measured: {
      label: "측정",
      description: "실행 기록에서 직접 읽은 값. 추론 없음.",
    },
    interpretation: {
      label: "MICA 해석",
      description:
        "측정값이 무엇을 뜻하는지에 대한 MICA의 읽기. 반박 가능하며, 에디션의 이름으로 서명됩니다.",
    },
    recommendation: {
      label: "권고",
      description: "만드는 사람과 사는 사람을 위한 조언. 결코 측정의 주장이 아닙니다.",
    },
  },

  thresholdsNotSet:
    "이 에디션에는 공개 기준값이 설정되어 있지 않습니다. MICA가 최소 표본 크기나 과제 커버리지를 아직 합의하지 않았으므로, 어떤 결과도 공개 대상으로 표시될 수 없습니다.",
} satisfies Dict;
