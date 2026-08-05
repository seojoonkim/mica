/**
 * The English dictionary. This is the contract: `ko.ts` is declared
 * `satisfies typeof en`, so a missing or misspelt Korean key fails typecheck
 * rather than falling back silently at runtime.
 *
 * Nothing here is data. System names, run-cell ids, currencies, source URLs and
 * every canonical figure stay in the fixtures untranslated; this file holds
 * site-owned copy only, plus overlays keyed by fixture id.
 */

import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { DIAGNOSTIC_AXES, OUTCOME_AXES } from "@/data/policy/axes";
import {
  EVIDENCE_LABELS,
  RESULT_TRACKS,
  THRESHOLDS_NOT_SET,
  VERIFICATION_STATUSES,
} from "@/data/policy/publication";
import type { CountryCode } from "@/lib/schema";

/**
 * Build an id-keyed overlay from a canonical record list. The key union comes
 * from the fixture, so the Korean overlay is forced to cover every id.
 */
function overlay<T extends { id: string }, V>(
  records: readonly T[],
  pick: (record: T) => V,
): Record<T["id"], V> {
  return Object.fromEntries(records.map((record) => [record.id, pick(record)])) as Record<
    T["id"],
    V
  >;
}

/** Market names are site-owned copy, not fixture data, but share its key set. */
function marketNames(names: Record<CountryCode, string>): Record<CountryCode, string> {
  return names;
}

export const en = {
  locale: {
    switchLabel: "Language",
    en: "EN",
    ko: "한국어",
  },

  site: {
    longName: "Multinational Index of Consumer Agents",
    tagline: "The global benchmark for consumer agent orchestration.",
    secondary: "Models matter. Orchestration wins.",
    definition:
      "MICA measures complete, versioned consumer-agent systems on everyday tasks in six markets across Asia and the Middle East, reporting accuracy, speed and cost as three separate results.",
    edition: "Preview edition 0.1",
    demoNotice:
      "Illustrative demo data — not an official ranking. Every figure on this site is generated for interface development and carries no evidentiary weight.",
  },

  nav: {
    countries: "Countries",
    rankings: "Rankings",
    agents: "Systems",
    tasks: "Tasks",
    evidence: "Evidence",
    methodology: "Methodology",
    governance: "Governance",
    submit: "Submission requirements",
  },

  chrome: {
    skip: "Skip to main content",
    homeLabel: "MICA home",
    menu: "Menu",
    closeMenu: "Close menu",
    primaryNavLabel: "Primary",
    dataStatusLabel: "Data status",
    method: "Method",
    jsonData: "JSON data",
    indexHeading: "Index",
    downloadsHeading: "Downloads",
    demoDatasetJson: "Demo dataset (JSON)",
    demoRunCellsCsv: "Demo run cells (CSV)",
    colophonNote:
      "Nothing on this site is publication eligible · Synthetic personas and controlled test accounts only",
  },

  disclosure: {
    demoLabel: "Illustrative demo data",
    notRanking: "Not an official ranking",
    demoLabelLocal: "Illustrative demo data",
    notRankingLocal: "Not an official ranking",
    detailLabel: "Data status detail",
    defaultDetail:
      "Every figure below is generated for interface development. It carries no evidentiary weight and no system on this page has been ranked by MICA.",
  },

  coverage: {
    headline: "10 evaluation families · 0 published result families",
    detail:
      "MICA's evaluation taxonomy defines ten task families. None of them carries a published result: no system has been measured and verified yet. Every family below is a definition of what will be measured, not a report of what was. An absent result is stated as absent and is never shown as a zero.",
    evaluationFamiliesTerm: "Evaluation families",
    publishedFamiliesTerm: "Published result families",
    measuredBadge: "Published results",
    unmeasuredBadge: "Defined, not yet measured",
    unmeasuredNote:
      "Defined in the taxonomy; no verified run cells exist for this family yet.",
  },

  missing: {
    noSuccess: "No successful task.",
    noData: "No coverage in this market.",
    notMeasured: "Not measured",
  },

  table: {
    system: "System",
    operator: "Operator",
    snapshot: "Evaluated system version",
    market: "Market",
    markets: "Markets",
    locale: "Language and region",
    currency: "Currency",
    taskFamily: "Task family",
    task: "Task",
    accuracy: "Accuracy",
    interval95: "95% interval",
    speedP50: "Speed p50",
    speedP95: "Speed p95",
    costPerSuccess: "Cost per success",
    eligibleRuns: "Eligible runs",
    verification: "Verification",
    track: "Track",
    standing: "Standing",
    runCell: "Result set",
    evidence: "Evidence",
    frontier: "Frontier",
    editionNote: "Edition note",
    heroMissions: "Hero missions",
    withheld: "Withheld — not in every market",
    notPublicationEligible: "Not publication eligible",
    criticalSafetyEvent: " — critical safety event",
    costNotComparable: "Not comparable across currencies",
    emptySlice: "No verified system has run cells for this slice.",
    scrollCue: "Scroll horizontally for all columns →",
    captionSuffix:
      "Illustrative demo data, not an official ranking.",
    captionSuffixNoComposite:
      "Illustrative demo data, not an official ranking. Columns are read separately; MICA publishes no composite score.",
    footnote:
      "Accuracy is the share of eligible runs reaching the confirmed final state. Speed p50 and p95 describe successful eligible runs only, so they say how long success took, not how long an attempt took; failed attempts are timed and kept with the run cell but are not in this population. Cost divides the cost of all eligible attempts by the successful ones. “Frontier” marks rows not dominated on all three axes at once; it is not a rank.",
  },

  common: {
    apply: "Apply",
    reset: "Reset",
    onThisPage: "On this page",
    editionSummary: `${COUNTRIES.length} markets · ${TASK_FAMILIES.length} task families · 3 separate outcome axes.`,
    allSystems: "All systems",
    allMarkets: "All markets",
    allTaskFamilies: "All task families",
    categoryLabel: "Category",
    canonicalTasks: "canonical tasks",
    finalState: "Completion condition",
    confirmationBoundary: "Point that needs user approval",
    whyItIsHard: "Why it is hard",
  },

  home: {
    readTables: "Preview how results will be published",
    howMeasured: "How MICA measures",
    submitSnapshot: "Read the submission requirements",
    statMarkets: "Markets",
    statFamilies: "Task families",
    statPublished: "Published result families",
    statSystems: "Verified systems",
    statRuns: "Measured runs",
    countedNote: "Counted from the canonical records at build time.",
    stackEyebrow: "The unit of measurement is the system",
    bandEyebrow: `${COUNTRIES.length} market editions`,
    disclosureDetail:
      "MICA is under construction. The interface below is complete; the index behind it is empty. No verified system results have been published, so no figure on this site describes the performance of any product.",
    noResultsHeadline: "No verified system results have been published yet.",
    noResultsDetail:
      "MICA has published no system, no score and no ranking. What exists today is the apparatus: a ten-family task taxonomy written per market, a stated measurement method, a publication gate with its thresholds still unset, and an evidence model in which every future figure will resolve to a named aggregate run cell. Results appear here only after a submitted snapshot has been independently rerun and cleared that gate.",
    axesEyebrow: "Three results, never one",
    axesTitle: "MICA reports accuracy, speed and cost separately",
    axesIntro:
      "A single number would hide the trade a buyer actually has to make. MICA publishes no composite score and never will; the axes below are read side by side.",
    readinessEyebrow: "What is built, and what is not",
    readinessTitle: "Where the index stands",
    readinessIntro:
      "MICA is being built in the open, so the state of each part is stated plainly rather than implied by an empty table. Nothing below is a measurement.",
    readinessItems: [
      {
        term: "Task taxonomy",
        detail:
          "Ten families of everyday task, each written separately for the six market editions, with a declared final state and a confirmation boundary per canonical task. Complete and published.",
      },
      {
        term: "Measurement method",
        detail:
          "Accuracy, speed and cost defined as three separate results, with eligibility screening, successful-runs-only percentiles and per-currency cost. Published as a draft and open to challenge.",
      },
      {
        term: "Evidence infrastructure",
        detail:
          "The aggregate run cell is the unit of evidence, addressable and stated in full, including what it cannot show. Built and empty: no cell has been recorded.",
      },
      {
        term: "Publication gate",
        detail:
          "Independent rerun, coverage and safety conditions are in force, and the numeric thresholds are deliberately not set yet. Nothing can pass the gate today, which is why nothing is published.",
      },
      {
        term: "Verified results",
        detail:
          "None. No submission has been measured, no snapshot has been rerun, and no ranking exists in any market or task family.",
      },
    ],
    filterLink: "See the planned result controls →",
    familiesEyebrow: "What we ask the agent to do",
    familiesTitle: "Ten families of everyday task",
    familiesIntro:
      "Each family is defined by a declared final state and a confirmation boundary the system must not cross without consent.",
    familiesLink: "Read the task definitions →",
  },

  countries: {
    metaTitle: "Countries",
    metaDescription:
      "The six markets in the MICA index and what changes for a consumer agent in each.",
    eyebrow: "Market index",
    title: "Six markets, six different problems",
    standfirst:
      "MICA does not translate one market's benchmark into the other five. Each edition is written against the payment rails, identity checks, address formats and service conventions that actually exist there.",
    coverageEyebrow: "Edition parameters",
    coverageTitle: "The six editions at a glance",
    coverageIntro:
      "Locale, currency and the number of hero missions written for each market. No system has been measured in any of them, so no result column exists.",
    coverageCaption: "Market editions",
    editionsEyebrow: "Editions",
    editionsTitle: "What the edition note says",
    editionsIntro:
      "Each market edition is signed with a note explaining the choices MICA made about scope in that country.",
  },

  country: {
    notFound: "Market not found",
    metaTitleSuffix: "edition",
    eyebrowPrefix: "Market edition",
    resultsEyebrow: "Accuracy, speed and cost read separately",
    resultsTitle: "Demo results in",
    resultsIntroPrefix: "Cost is reported in",
    resultsIntroSuffix:
      "because a cost figure only means anything inside one currency.",
    allFamiliesCaption: "all task families",
    familyEyebrow: "By task family",
    familyTitle: "Where the market gets hard",
    familyIntro:
      "The same system can be competent in one family and unable to finish in another. Family cells are shown separately for that reason.",
    familyCaptionSuffix: "accuracy by task family",
    systemsWithCells: "Systems with cells",
    bestAccuracy: "Best accuracy",
    bestSpeed: "Best speed p50",
    lowestCost: "Lowest cost per success",
    lineageEyebrow: "Lineage",
    lineageTitle: "Run cells for",
    lineageIntro:
      "Each cell is one system on one task family in this market. The tables above are computed from them; the cell pages state what each aggregate holds and what it cannot show.",
    allCellsFor: "All run cells for",
    hazardsEyebrow: "Operational hazards",
    hazardsTitlePrefix: "Why",
    hazardsTitleSuffix: "is hard for an agent",
    hazardsIntro:
      "Each hazard is tied to the diagnostic axis it loads onto, so a failure can be traced to a capability rather than to a vague sense of difficulty.",
    localisationEyebrow: "Localisation",
    localisationTitle: "What changes when the task is local",
    localisationIntro:
      "These are the concrete differences an agent has to absorb before it can finish an everyday task here.",
    missionsEyebrow: "Hero missions",
    missionsTitle: "What we actually asked for",
    missionsIntro:
      "A hero mission is the human-readable version of a canonical task: a persona, a prompt, a declared final state, and the line the system must not cross alone.",
    otherMarkets: "Other markets",
  },

  rankings: {
    metaTitle: "Rankings",
    metaDescription:
      "No verified results are published. Planned controls separate market, task family and outcome axis; accuracy, speed and cost are never combined.",
    eyebrow: "Result tables",
    title: "Ordered by one axis at a time",
    standfirst:
      "No verified results are published, so this page orders nothing today. The controls below are the methodology made concrete: a market first, then a task family, an outcome axis and a verification level. They are shown so the shape of a future table can be checked and argued with before any number exists.",
    filterEyebrow: "Planned controls",
    filterTitle: "How results will be sliced",
    filterIntro:
      "The form submits as a normal link, so any future view can be bookmarked or shared. Selecting a slice today returns no results, because none have been published.",
    formLabel: "Filter results",
    orderByAxis: "Order by axis",
    chooseMarket: "Choose a market…",
    noMarketSelected: "No market selected",
    orderingBy: "Ordering by",
    costAcrossMarkets:
      "Cost cannot be ordered across markets at once: the six editions do not share a currency. Choose a single market to see cost per success.",
    showingOnlyPrefix: "Showing",
    showingOnlySuffix: "only",
    resultsTitle: "Results",
    selectMarketNotice:
      "Select a market to see results. MICA measures each market on its own terms, and cost only exists inside one currency, so there is no all-markets table to show.",
    orderedBy: "ordered by",
    noResultsNotice:
      "No verified results are published for this slice, or for any other. MICA has measured no system yet, so there is no table and no evidence to link to. This page will fill in market by market as submitted snapshots are independently rerun and clear the publication gate.",
  },

  agents: {
    metaTitle: "Systems",
    metaDescription:
      "The MICA system registry is empty: no system snapshot has been submitted, verified or published yet.",
    eyebrow: "System index",
    title: "MICA measures systems, not models",
    standfirst:
      "An entry is a dated snapshot of a whole system: orchestrator, models, tools and memory together. Two entries can share a base model and still land far apart, which is the point.",
    emptyEyebrow: "System registry",
    emptyTitle: "The registry is empty",
    emptyNotice:
      "No system snapshot has been submitted, verified and published. Rather than fill this page with illustrative entries, MICA leaves it empty: an invented name beside an invented figure is the exact failure a benchmark exists to prevent. The labels below define what an entry will carry when the first one is admitted.",
    labelsEyebrow: "Reading the labels",
    verificationTitle: "Verification status",
    verificationIntro:
      "Only independently rerun results are ever on the publication track. Everything in this demo edition is excluded regardless, because demo data can never be publication eligible.",
    tracksTitle: "Result tracks",
  },

  agent: {
    notFound: "System not found",
    metaTitleSuffix: "system snapshot",
    eyebrowPrefix: "System snapshot",
    compositionEyebrow: "What was measured",
    compositionTitle: "Snapshot composition",
    compositionIntro:
      "MICA records the whole system. A change to any part of this composition makes a new snapshot, not an update to this one.",
    orchestrator: "Orchestrator",
    models: "Models",
    tools: "Tools",
    memory: "Memory",
    resultTrack: "Result track",
    globalAccuracyWithheld:
      "A macro-average is withheld unless the system has cells in every market; a missing market is never counted as a zero.",
    globalAccuracySuffix: "country macro-average, not a pooling of runs",
    byMarketEyebrow: "Accuracy, speed and cost read separately",
    byMarketTitle: "Results by market",
    byMarketIntro:
      "Cost appears in each market's own currency. Speed p50 and p95 cover successful eligible runs only, so they describe how long success took, not how long an attempt took. Markets with no run cells say so in words.",
    byMarketCaptionSuffix: "by market",
    byFamilyEyebrow: "By task family",
    byFamilyTitle: "Results by task family",
    byFamilyIntro:
      "Pooled across markets, so cost is withheld — the six editions do not share a currency.",
    byFamilyCaptionSuffix: "by task family",
    lineageEyebrow: "Lineage",
    lineageTitle: "Run cells behind these figures",
    lineageIntro:
      "Every figure above is computed from these aggregate run cells — one per market and task family. A cell page states what the cell holds and, just as plainly, what it does not.",
    noCells: "This snapshot has no run cells in the demo edition.",
    allCellsFor: "All run cells for",
    diagnosticsEyebrow: "Diagnostics",
    diagnosticsTitle: "Why the outcome looks like this",
    diagnosticsIntro:
      "Diagnostic axes are evidence-led in this preview: they name what MICA looks at when explaining an outcome. They carry no reading, no score and no rating, because MICA has no evidence base to read them from yet.",
    diagnosticsNote:
      "Earlier drafts of this interface showed a 1–5 reading per axis. Those numbers were not supported by any measurement and have been removed rather than relabelled.",
    gateEyebrow: "Publication gate",
    gateTitle: "Why nothing here is publishable",
    gateIntro:
      "MICA states the reasons a result is not publishable rather than quietly omitting it.",
    readPublicationRules: "Read the publication rules →",
    otherSystems: "Other systems",
    otherSnapshots: "Other snapshots",
  },

  tasks: {
    metaTitle: "Tasks",
    metaDescription:
      "The ten MICA task families, their canonical tasks, completion conditions and points that require user approval.",
    eyebrow: "Task definitions",
    title: "A task is a final state, not a transcript",
    standfirst:
      "Every MICA task declares the state the world must be in for the run to count, and the line past which the system must stop and ask. Nothing is scored on how convincing the agent sounded along the way.",
    disclosureDetail:
      "The task definitions on this page are the real thing; the run figures elsewhere on the site are illustrative demo data and not an official ranking.",
    scoringEyebrow: "Scoring contract",
    scoringTitle: "What a completed task earns",
    scoringIntro:
      "A run contributes to three separate results. It never contributes to a combined one.",
    taxonomyEyebrow: "Taxonomy and coverage",
    taxonomyTitle: "Ten families defined, none carrying published results",
    captionSuffix:
      "canonical tasks, declared final states and confirmation boundaries.",
    declaredFinalState: "Declared final state",
    missionsEyebrow: "Worked examples",
    missionsTitle: "Hero missions across the index",
    missionsIntro:
      "One mission per market and family, written the way a person would actually ask.",
  },

  evidence: {
    metaTitle: "Evidence",
    metaDescription:
      "MICA's evidence registry is empty. No aggregate run cell has been recorded because no system has been measured yet.",
    eyebrow: "Run-cell lineage",
    title: "Evidence",
    standfirst:
      "MICA's unit of evidence is the aggregate run cell: one system, one market, one task family. Every number on this site is computed from these cells, and each one has a page stating exactly what it contains.",
    disclosureDetail:
      "These are demo fixture cells, not official evidence. They exist so the lineage of a published figure can be checked in the interface; they carry no evidentiary weight.",
    emptyEyebrow: "Evidence registry",
    emptyTitle: "No run cells recorded",
    emptyNotice:
      "The evidence registry is empty. No system has been measured, so there is no aggregate to open and no lineage to trace. The model below is stated in full anyway, because it is the promise being made about every figure MICA will eventually publish.",
    modelEyebrow: "What a run cell is",
    modelTitle: "The evidence model",
    modelIntro:
      "MICA records aggregates, not individual attempts. There is no per-attempt record behind these pages, so none is shown.",
    unitTerm: "Unit",
    unitDetail:
      "One aggregate run cell per system × market × task family. Cell ids read system--market--family, so a figure can always be traced to the exact slice it came from.",
    holdsTerm: "What it holds",
    holdsDetail:
      "Eligible and successful run counts, latencies for successful eligible runs, the latency population for all eligible attempts, total eligible cost, task coverage and critical safety events.",
    notHoldsTerm: "What it does not hold",
    notHoldsDetail:
      "No individual attempts, timestamps, transcripts, screenshots, tool logs or provider identities. No user data of any kind: the demo fixture is generated, and a real edition would use synthetic personas and controlled test accounts only.",
    derivedTerm: "How figures are derived",
    derivedDetail:
      "Accuracy, its 95% interval, speed percentiles and cost per success are computed from the cell on request. Nothing is stored twice, and no axis is folded into another — MICA publishes no composite score.",
    standingTerm: "Standing",
    standingDetail:
      "No cell has been recorded. The publication guard is in force regardless: nothing can be marked publication eligible while the index is in preview.",
    filterEyebrow: "Filter",
    filterTitle: "Find a cell",
    filterIntro:
      "Narrow by system, market or task family. The form submits as a normal link.",
    formLabel: "Filter run cells",
    listIntro: "Each row is one aggregate run cell, not an individual transcript.",
    countPrefix: "of",
    countSuffix: "run cells",
    captionPrefix: "Run cells",
    noMatch:
      "No run cell matches this slice. Missing coverage is missing, never a zero.",
  },

  evidenceCell: {
    notFound: "Run cell not found",
    metaTitleSuffix: "run cell",
    metaDescriptionPrefix: "Aggregate demo run cell for",
    metaDescriptionSuffix: "Not an individual transcript.",
    eyebrow: "Run cell · aggregate",
    standfirstPrefix: "Cell",
    standfirstBody:
      "This is an aggregate run cell — the counts and distributions for one system in one market on one task family. It is not an individual transcript, and it contains no user data.",
    disclosureDetail:
      "Demo fixture evidence, not official evidence. Every figure below is generated for interface development, carries no evidentiary weight, and no system on this page has been ranked by MICA.",
    identityEyebrow: "Identity",
    identityTitle: "What this cell is",
    identityIntro:
      "A cell id is stable: system, market and task family, joined by a double dash. It is a handle on an aggregate, not on a run.",
    cellId: "Cell id",
    dataStatus: "Data status",
    publicationEligibility: "Publication eligibility",
    eligible: "Eligible",
    notEligible: "Not publication eligible — the blockers are listed below.",
    unknown: "Unknown",
    measuredEyebrow: "Measured",
    measuredTitle: "What the cell records",
    measuredIntro:
      "Accuracy, speed and cost are read separately. Speed percentiles cover successful eligible runs only, so fast failure never reads as fast success; the all-eligible population is stated beside them so the reported denominator is auditable.",
    captionPrefix: "Run cell",
    recordedValues: "recorded values",
    figure: "Figure",
    value: "Value",
    basis: "Basis",
    successfulRuns: "Successful runs",
    allEligibleLatency: "All-eligible latency records",
    totalEligibleCost: "Total eligible cost",
    taskCoverage: "Task coverage",
    criticalSafetyEvents: "Critical safety events",
    basisEligibleRuns:
      "Attempts that passed eligibility screening — the denominator.",
    basisSuccessfulRuns: "Eligible runs that reached the declared final state.",
    basisAccuracy: "Successful runs over eligible runs.",
    basisInterval:
      "Wilson score interval — cells this small are not well described by a point estimate.",
    basisSpeed: "Successful eligible runs only.",
    basisAllEligiblePrefix:
      "Latencies recorded for every eligible attempt, successful or not (median",
    basisAllEligibleSuffix:
      "). Kept for auditing; the published percentiles above are not taken from it.",
    basisTotalCost: "Cost of all eligible attempts, in this market’s own currency.",
    basisCostPerSuccess:
      "Total eligible cost over successful runs; undefined with no success.",
    basisCoveragePrefix:
      "Canonical tasks attempted over canonical tasks defined for this market (",
    basisCoverageSuffix: ").",
    basisSafetyRecorded:
      "Recorded — a permanent publication block for this cell.",
    basisSafetyNone: "None recorded in this cell.",
    gateEyebrow: "Publication gate",
    gateTitle: "Why this cell is not publishable",
    gateIntro:
      "MICA states the reasons rather than quietly omitting the result.",
    limitsEyebrow: "Limits",
    limitsTitle: "What this page does not show",
    limitsIntro:
      "The honest boundary of the record, stated where the record is read.",
    limits: [
      "No individual attempt records. The canonical fixture stores aggregates only, so there is no run to open.",
      "No timestamps, transcripts, screenshots, tool logs, provider identities or external evidence links. None of these exist in the demo edition, and inventing a handle for them would be a false provenance claim.",
      "No user data. Demo figures are generated; a real edition would run synthetic personas and controlled test accounts only.",
      "No composite score. Accuracy, speed and cost stay separate here as everywhere else on the site.",
    ],
    relatedLabel: "Related run cells",
    otherCellsFor: "Other cells for",
    allRunCells: "All run cells →",
  },

  methodology: {
    metaTitle: "Methodology",
    metaDescription:
      "How MICA defines eligibility, measures accuracy, speed and cost, and decides what may be published.",
    eyebrow: "Methodology draft",
    title: "What we measure, and what we refuse to measure",
    standfirst:
      "MICA is a measurement instrument before it is a league table. This page states the definitions, the gates and the known limits, so a disagreement can be about the method rather than about the number.",
    disclosureDetail:
      "The method described here is real. The figures used to exercise it across this site are illustrative demo data and not an official ranking.",
    tocAxes: "Outcome axes",
    tocCounting: "Eligibility",
    tocMissing: "Missing values",
    tocDiagnostics: "Diagnostics",
    tocEvidence: "Evidence",
    tocPublication: "Publication rules",
    tocClaims: "Claims",
    tocLimits: "Limits",
    axesEyebrow: "Definitions",
    axesTitle: "The three outcome axes",
    axesIntro:
      "These are reported side by side, always. MICA publishes no composite score, and will not accept one from a submitter either — a weighting is a buyer's judgement, not a measurement.",
    countingEyebrow: "Counting rules",
    countingTitle: "Eligibility and denominators",
    countingIntro:
      "Most disputes about benchmarks are really disputes about denominators, so MICA writes its own down.",
    eligibleRunTerm: "eligible run",
    countingEligible:
      " is an attempt that passed screening: the environment was reachable, the persona and its accounts were in the declared starting state, and no MICA-side fault interrupted the run. Ineligible attempts are discarded before scoring rather than counted as failures.",
    accuracyTerm: "Accuracy",
    countingAccuracy:
      " is successful eligible runs divided by eligible runs, reported with a 95% Wilson score interval. The Wilson interval is used instead of the normal approximation because MICA cells are small and often sit near 0 or 1, where the normal approximation misbehaves.",
    speedTerm: "Speed",
    countingSpeed:
      " uses wall-clock seconds from successful eligible runs only, reported as p50 and p95. Failed runs are timed and kept with the run cell, but they are excluded from the reported percentiles deliberately: if they were included, a system that gives up quickly would read as fast. The population behind a speed figure is therefore the successes, and it is smaller than the eligible-run denominator behind accuracy.",
    costTerm: "Cost",
    countingCostPrefix:
      " is the total cost of all eligible attempts divided by the number of successful ones, in the market’s own currency. The cost of failure is charged to the successes it took to get there. With zero successes the value does not exist, and the table says “",
    countingCostSuffix: "” rather than showing a zero or an infinity.",
    macroTerm: "country macro-average",
    countingMacroPrefix: "Cross-market figures use a ",
    countingMacroSuffix:
      ": the mean of per-country values, computed only when every market is present. A missing market withholds the global figure instead of being treated as a zero.",
    missingEyebrow: "Missing values",
    missingTitle: "What each phrase means",
    missingIntro:
      "MICA never renders an unknown as a number. These are the exact strings used across the site.",
    missingNoSuccess:
      "There were eligible attempts, but none reached the declared final state, so speed and cost per success are undefined.",
    missingNoData:
      "The system has no eligible run cells for this market or slice at all. This is an absence of evidence, not a poor result.",
    missingNotMeasured:
      "The axis was not assessed for this snapshot. It is not a low reading.",
    diagnosticsEyebrow: "Diagnostics",
    diagnosticsTitle: "Seven diagnostic axes",
    diagnosticsIntro:
      "The seven things MICA looks at when explaining an outcome. In this preview they are evidence-led and unscored: there is no 1–5 reading, no rating and nothing to sum, because MICA has no evidence base to score them from yet.",
    evidenceEyebrow: "Evidence",
    evidenceTitle: "Verification status and result tracks",
    evidenceIntro:
      "Every figure carries how it was obtained. Only independently rerun results on a publication track can ever become official.",
    onPublicationTrack: "On the publication track.",
    neverOfficial: "Never published as official.",
    neverOfficialLong:
      "Displayed for transparency; never published as official.",
    publicationEyebrow: "The gate",
    publicationTitle: "Publication rules",
    publicationIntro:
      "A cell must clear every condition below. Failing any one of them means the cell is shown with its blockers stated, not hidden. Two of the conditions have no agreed number yet, so nothing in this preview can clear the gate.",
    minRunsTerm: "Minimum eligible runs",
    minRunsUnset:
      "Not set. MICA has not agreed a minimum sample size, so no cell can be judged against one. The gate refuses rather than guessing a number.",
    minRunsSuffix: "eligible attempts on a country × family cell.",
    minCoverageTerm: "Minimum coverage",
    minCoverageUnset:
      "Not set. Until MICA agrees what share of a market's canonical tasks must be attempted, coverage cannot be a pass condition.",
    minCoverageSuffix: "of the market's canonical tasks attempted.",
    thresholdsTerm: "Thresholds",
    safetyTerm: "Critical safety events",
    safetyBlocks:
      "Any critical safety event permanently blocks publication of the cell. There is no appeal and no re-run to erase it.",
    safetyNonBlocking: "Recorded but non-blocking.",
    verificationTerm: "Verification",
    verificationDetail:
      "Independent rerun only. Provisional and self-reported results are displayed for transparency and never published as official.",
    dataStatusTerm: "Data status",
    dataStatusDetail:
      "Demo and preview data can never be publication eligible. This is enforced in the schema layer, which throws at build time if a demo record claims otherwise.",
    claimsEyebrow: "Claims",
    claimsTitle: "Measurement, interpretation, recommendation",
    claimsIntro:
      "MICA separates what it observed from what it thinks it means and from what it advises. Only the first is a measurement.",
    limitsEyebrow: "Limits",
    limitsTitle: "What this method cannot tell you",
    limitsIntro:
      "Stated plainly, because a benchmark that hides its limits is advertising.",
    limits: [
      "Simulator results are reproducible but synthetic; real services change under you in ways a replica does not.",
      "Live-shadow runs stop at the confirmation boundary, so the final irreversible step is inferred rather than observed.",
      "Cells are small. A difference inside the 95% interval is not a difference.",
      "Cost depends on the operator's pricing on the snapshot date and moves independently of the system's behaviour.",
      "Coverage is uneven across markets, and an uncovered market is reported as missing rather than estimated.",
      "None of the ten evaluation families carries a published result yet, so nothing on this site describes how any system behaves.",
    ],
    whoDecides: "Who decides all of this →",
  },

  governance: {
    metaTitle: "Governance",
    metaDescription:
      "Who runs MICA, how corrections and conflicts of interest are handled, and what the index refuses to do.",
    eyebrow: "About · Governance",
    title: "An index is only as good as its refusals",
    standfirst:
      "MICA is built to be argued with. This page records who decides, what they are not allowed to decide, and how a result gets corrected when it is wrong.",
    disclosureDetail:
      "MICA has published no official edition. Everything currently on the site is illustrative demo data and not an official ranking.",
    rulesEyebrow: "Standing rules",
    rulesTitle: "What MICA will not do",
    rulesIntro:
      "These are commitments, not preferences. Breaking one is a governance failure, not a product decision.",
    rules: [
      "MICA will not publish a composite score. Accuracy, speed and cost stay separate, and any weighting belongs to the reader.",
      "MICA will not accept payment for placement, for inclusion, or for the timing of a result.",
      "MICA will not publish a figure it cannot trace to a run record it holds.",
      "MICA will not treat missing coverage as a zero, or a fast failure as a fast success.",
      "MICA will not remove a critical safety event from a cell. The block is permanent.",
      "MICA will not run irreversible actions against real accounts belonging to real people.",
    ],
    decisionsEyebrow: "Decisions",
    decisionsTitle: "Who decides what",
    decisionsIntro:
      "Editorial authority is separated from operator relationships on purpose.",
    methodChangesTerm: "Method changes",
    methodChangesDetail:
      "Changes to definitions, gates or axes are versioned with the edition and published before the results computed under them. A method is never changed after seeing which system it would favour.",
    signOffTerm: "Edition sign-off",
    signOffDetail:
      "Each market edition is signed by its edition note. The note records scope choices and known gaps in that market.",
    operatorTerm: "Operator relationships",
    operatorDetail:
      "Submitters may correct facts about their own snapshot composition. They have no say over verification status, publication eligibility or interpretation.",
    conflictsTerm: "Conflicts of interest",
    conflictsDetail:
      "Any commercial relationship with an operator is disclosed on the affected results, and disqualifies MICA staff involved in it from verification of that system.",
    correctionsEyebrow: "Corrections",
    correctionsTitle: "How an error is fixed",
    correctionsIntro:
      "MICA expects to be wrong sometimes. The obligation is to be wrong in public and briefly.",
    corrections: [
      "A correction request should identify the cell, the figure disputed, and the evidence. MICA re-derives the figure from the run records it holds; if the records are wrong, the cell is withdrawn rather than adjusted.",
      "Corrections are published with the original value, the corrected value, the date, and the reason. Silent edits to a published figure are treated as a governance failure.",
      "A withdrawn cell stays visible as withdrawn. Removing it entirely would let the index quietly forget its own mistakes.",
    ],
    claimsEyebrow: "Claims",
    claimsTitle: "Three kinds of statement",
    claimsIntro:
      "Every sentence MICA publishes is one of these, and is labelled as such.",
    provenanceEyebrow: "Provenance",
    provenanceTitle: "Where this build's data comes from",
    provenanceIntro:
      "Stated on the site itself so that a reader never has to trust a claim about the pipeline.",
    sourceKindTerm: "Source kind",
    sourceKindDetail: "Local illustrative records included with this preview",
    dataStatusTerm: "Data status",
    dataStatusDetail: "Illustrative only · no verified results",
    editionTerm: "Edition",
    editionDetail: "Preview 0.1 · methodology draft",
    disclosureTerm: "Disclosure",
    remoteTerm: "Remote source",
    remoteDetail:
      "No remote database is installed. The data-source boundary exists so a real edition can be served without any page importing a fixture directly, and a build with no credentials configured is the supported default.",
    readMethodology: "Read the methodology →",
  },

  submit: {
    metaTitle: "Submission requirements",
    metaDescription:
      "What MICA will need in order to measure a consumer-agent system snapshot, and what it will do with a submission once intake opens.",
    eyebrow: "Submissions",
    title: "What a submission will have to carry",
    standfirst:
      "MICA has no submission intake open yet, so this page states the requirements in advance. MICA measures a dated, versioned system: orchestrator, models, tools and memory together. Submission will be free and will buy no influence over the result.",
    disclosureDetail:
      "MICA is not yet accepting submissions for an official edition. The requirements below are real; the results currently on this site are illustrative demo data and not an official ranking.",
    stepOneEyebrow: "Step one",
    stepOneTitle: "Declare the snapshot",
    stepOneIntro:
      "A snapshot is immutable. Change any part of it and you have a new snapshot, not an update.",
    identityTerm: "Identity",
    identityDetail:
      "System name, operator, snapshot version string and snapshot date.",
    compositionTerm: "Composition",
    compositionDetail:
      "Orchestrator, every model the system may route to, every tool or API it may call, and how memory is held between steps.",
    scopeTerm: "Scope",
    scopeMarkets: "The markets (",
    scopeFamilies: ") and task families (",
    scopeSuffix: ") you are claiming coverage in.",
    accessTerm: "Access",
    accessDetail:
      "A way for MICA to run the system itself on MICA-controlled accounts. Without this, the result can never rise above self-reported.",
    traceTerm: "Evidence trace",
    traceDetail:
      "Per-run records: eligibility, wall-clock duration, cost, the final state reached, and every point where the system stopped for confirmation.",
    stepTwoEyebrow: "Step two",
    stepTwoTitle: "What MICA does with it",
    stepTwoIntro:
      "The submission decides the verification status, and the verification status decides whether the result can ever be official.",
    stepThreeEyebrow: "Step three",
    stepThreeTitle: "The bar for publication",
    stepThreeIntro:
      "Meeting the bar is not a ranking. It only means the cell may appear as an official MICA figure. In this preview the numeric parts of the bar are not set, so no submission can clear it yet.",
    sampleSizeTerm: "Sample size",
    sampleSizeUnset:
      "Not set yet. MICA will state a minimum number of eligible runs per country × family cell before anything is published.",
    sampleSizePrefix: "At least",
    sampleSizeSuffix: "eligible runs per country × family cell.",
    coverageTerm: "Coverage",
    coverageUnset:
      "Not set yet. MICA will state the share of a market's canonical tasks a submission must attempt before anything is published.",
    coveragePrefix: "At least",
    coverageSuffix: "of the market's canonical tasks attempted.",
    safetyTerm: "Safety",
    safetyDetail:
      "No critical safety event. One is enough to block the cell permanently.",
    verificationTerm: "Verification",
    verificationDetail: "Independent rerun by MICA. Nothing less qualifies.",
    termsEyebrow: "What you get, and do not get",
    termsTitle: "Terms in plain words",
    terms: [
      "You may correct factual errors in your snapshot composition at any time.",
      "You may not review, embargo or veto a result before it is published.",
      "You may not purchase placement, inclusion, or favourable timing. There is no paid tier.",
      "You will be told the blockers on any cell of yours that fails the publication gate, in the same words the public sees.",
      "You may withdraw a snapshot from future editions; already-published figures stay published, with the withdrawal noted.",
    ],
    contactEyebrow: "Contact",
    contactTitle: "How to start",
    contactBody:
      "MICA has no submission intake while the index is in preview. When the first official edition opens, the intake will be listed here and announced with the edition. Until then, the most useful thing a prospective submitter can do is read the method and tell us where it is wrong.",
    readMethodology: "Read the methodology →",
    readGovernance: "Read the governance rules →",
  },

  notFound: {
    metaTitle: "Page not found",
    eyebrow: "Error 404",
    title: "No such page in this edition.",
    body: "MICA covers six markets — South Korea, Japan, Singapore, Taiwan, Thailand and the United Arab Emirates — and a fixed set of system snapshots. Anything outside that list has no page, rather than an empty one.",
  },

  /** Market display names. Native names stay on the fixture, untranslated. */
  markets: marketNames({
    kr: "South Korea",
    jp: "Japan",
    sg: "Singapore",
    tw: "Taiwan",
    th: "Thailand",
    ae: "United Arab Emirates",
  }),

  /**
   * Fixture-keyed overlays. The English side is read straight off the canonical
   * records so it can never drift from the data; only the Korean file restates
   * the strings, and it must cover every id or typecheck fails.
   */
  families: overlay(TASK_FAMILIES, (family) => ({
    label: family.label,
    summary: family.summary,
    whyItIsHard: family.whyItIsHard,
  })),

  outcomeAxes: overlay(OUTCOME_AXES, (axis) => ({
    label: axis.label,
    unit: axis.unit,
    description: axis.description,
  })),

  diagnosticAxes: overlay(DIAGNOSTIC_AXES, (axis) => ({
    label: axis.label,
    description: axis.description,
  })),

  verification: overlay(VERIFICATION_STATUSES, (status) => ({
    label: status.label,
    short: status.short,
    description: status.description,
  })),

  tracks: overlay(RESULT_TRACKS, (track) => ({
    label: track.label,
    description: track.description,
  })),

  evidenceLabels: overlay(Object.values(EVIDENCE_LABELS), (label) => ({
    label: label.label,
    description: label.description,
  })),

  thresholdsNotSet: THRESHOLDS_NOT_SET as string,
};

/**
 * Structural view of the English dictionary.
 *
 * The fixture-keyed overlays above read their English strings straight off
 * `as const` records, so TypeScript infers literal unions for those leaves —
 * which would make `ko satisfies Dict` demand the English wording rather than a
 * Korean translation. `Widen` relaxes every leaf to its base primitive while
 * leaving the key structure exactly as inferred, so a missing or misspelt
 * Korean key is still a compile error.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? Widen<U>[]
        : { [K in keyof T]: Widen<T[K]> };

export type Dict = Widen<typeof en>;
