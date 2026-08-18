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
    tagline: "Consumer Agent Benchmark",
    secondary:
      "The world’s first public benchmark for end-to-end consumer-agent execution across 6 localized markets and everyday consumer domains.",
    definition:
      "MICA evaluates whether a versioned consumer-agent system can complete consumer tasks end to end across six localized markets.",
    edition: "Preview 0.1",
    demoNotice:
      "Preview data for interface development. No verified results are published.",
  },

  nav: {
    countries: "Countries",
    evaluate: "Plan evaluation",
    rankings: "Rankings",
    agents: "Systems",
    tasks: "Tasks",
    evidence: "Evidence",
    methodology: "Methodology",
    governance: "Governance",
    submit: "Submission requirements",
  },

  evaluate: {
    metaTitle: "Evaluation scope planner",
    metaDescription: "Preview a selectable MICA evaluation scope without executing runs.",
    eyebrow: "Scope preview",
    title: "Evaluation scope planner",
    standfirst: "Choose markets and public tasks to preview a benchmark matrix. This planner does not start, queue or simulate runs.",
    boundary: "No runs execute here. MICA has no execution backend or connected harness, and no results are inferred.",
    modeLegend: "Planning mode",
    countryFocused: "Country-focused",
    taskFocused: "Task-focused cross-market",
    custom: "Custom matrix",
    fullBenchmark: "Full benchmark",
    countriesLegend: "Countries",
    tasksLegend: "Public tasks",
    selectCountryHint: "Select one or more countries.",
    selectTaskHint: "Select one or more public tasks.",
    invalid: "Select at least one country and one task. Empty custom scopes plan zero cells.",
    summaryTitle: "Scope preview",
    selectedCountries: "Selected countries",
    selectedTasks: "Selected tasks",
    planned: "Planned cells",
    executionEligible: "Execution-eligible",
    executed: "Executed",
    failed: "Failed",
    harnessFailed: "Harness-failed",
    notApplicable: "Not applicable to execution",
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
    previewLabel: "Preview data",
    detailLabel: "Data status detail",
    defaultDetail:
      "The figures below preview the interface. MICA has not ranked any system.",
  },

  coverage: {
    headline: "10 evaluation families · 0 published result families",
    detail:
      "MICA defines ten task families. Verified results exist for none of them. The entries below define what MICA measures; missing results remain absent rather than appearing as zero.",
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
    captionSuffixScoring:
      "Illustrative demo data, not an official ranking. Raw accuracy, speed and cost are read separately; a per-task final score is published beside them, never instead of them.",
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
    measurementLabel: "Measure",
    ruleLabel: "Decision rule",
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
    frameworkEyebrow: "The MICA capability framework",
    frameworkTitle: "Test the whole agent. Measure the outcome. Explain the system.",
    frameworkIntro:
      "The evaluation target is not an individual model but an assembled consumer-agent system spanning understanding, orchestration, model routing, memory, tool use, localisation, safety and recovery.",
    frameworkStages: [
      { label: "Test", title: "Reality, not a clean prompt", detail: "Exercise the system under local language, identity, payment, permission, handoff and recovery conditions, with realistic user context and changing constraints." },
      { label: "Measure", title: "Confirmed completion, not a successful call", detail: "Record accuracy, speed and cost separately, and do not treat an execution that misses its declared final state as a partial success." },
      { label: "Explain", title: "Diagnose why the system succeeded or failed", detail: "Trace outcomes across seven system-capability axes without folding diagnosis into the score." },
    ],
    frameworkFieldTitle: "10 everyday task domains are the proving ground",
    frameworkFormulaLabel: "MICA score = 100 × normalized Accuracy × normalized Speed × normalized Cost",
    frameworkFieldDetail:
      "100 canonical tasks across 10 task domains and 6 localized markets form 600 planned task-market cells. This is evaluation scope, not a measured result.",
    bandEyebrow: `${COUNTRIES.length} market editions`,
    disclosureDetail:
      "The interface is ready; the index is empty. MICA has published no verified system results.",
    publicationStatus:
      "MICA has published no system scores or rankings.",
    noResultsHeadline: "No verified system results have been published yet.",
    noResultsDetail:
      "MICA now provides the task taxonomy, measurement method, publication gate and evidence model. A result appears only after an independent rerun clears the gate.",
    lifecycleLabel: "Catalogue and publication status",
    lifecycleCandidates: "Provisional candidate tasks",
    lifecycleCalibrationPending: "Of which calibration-pending contracts",
    lifecycleValidated: "Validated tasks",
    lifecyclePublishedResults: "Published results",
    positionEyebrow: "Why MICA exists",
    positionTitle: "What existing benchmarks do not combine",
    positionIntro:
      "WebArena, WebVoyager, WebShop, AndroidWorld, AppWorld and τ-bench measure end-state task completion. MICA extends that work to assembled consumer-agent systems completing ordinary errands in localized markets with their own channels, identity checks and payment rails.",
    positionItems: [
      {
        term: "The missing unit",
        detail:
          "The unit is the whole consumer outcome across whatever services the errand touches, not a model answer, a tool-call response, or success inside a single interface. An errand that ends with the right thing booked, ordered, cancelled or changed is one result; the same errand abandoned at a login wall is not a partial one.",
      },
      {
        term: "The market is part of the task",
        detail:
          "Local channels, identity and phone verification, payment rails, language and register, and the local semantics of handoff and completion are conditions of the task, not translation details. The same errand is a different problem in each market, which is why MICA runs six editions rather than one benchmark rendered in six languages.",
      },
      {
        term: "Why app-led Asia matters",
        detail:
          "In app-led markets, discovery and read access are often public while the state-changing layer is not: ordering, messaging, payment and account changes run through platform registration, partner approval, consent scopes, mini-app runtimes and messaging or payment handoffs. A benchmark that stops at retrieval never reaches the part that is actually hard.",
      },
    ],
    positionLink: "Read why MICA exists →",
    axesEyebrow: "One score per task, three axes still published",
    axesTitle: "Accuracy, speed and cost are the record; the score is derived",
    axesIntro:
      "All three axes remain published in their own units. The derived score is not a headline result or ranking key until its references, repeat-run contract and uncertainty are calibrated in the pilot.",
    readinessEyebrow: "What is built, and what is not",
    readinessTitle: "Where the index stands",
    readinessIntro:
      "Each part reports its current publication state. These are build states, not measurements.",
    readinessItems: [
      {
        term: "Task taxonomy",
        detail:
          "Ten families of everyday task, with a declared final state and a confirmation boundary per canonical task. Published as provisional candidates for the public task set: drafted, not validated, and not yet differentiated market by market.",
      },
      {
        term: "Measurement method",
        detail:
          "Accuracy, speed and cost defined as three separately disclosed results, plus the normalized components multiplied into one final score per validated task. Family and country figures are arithmetic means of the eligible task scores. Published as a draft and open to challenge.",
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
    title: "Six execution environments, not six translations",
    standfirst:
      "Each edition is written against the channels, payment rails, identity checks, address formats and service conventions that govern execution in that market, so the same errand carries different conditions in each of the six.",
    conditionsEyebrow: "What makes an edition",
    conditionsTitle: "Three conditions that differ market by market",
    conditionsIntro:
      "Design conditions written into each edition, held equal across systems rather than scored as difficulty. No market has been exercised against a system, so nothing below reports how any market behaved in practice.",
    conditionsItems: [
      {
        term: "Platform-controlled execution",
        detail:
          "Where the state-changing step lives differs by market: an open web checkout in one, a registered app or mini-app runtime in another, a partner-approved interface in a third. Discovery being public says nothing about whether ordering, messaging or account changes are reachable the same way.",
      },
      {
        term: "Local authorization and identity",
        detail:
          "Account creation, local phone or identity verification, consent scopes and re-authentication steps sit in different places in each market's flow, and each one is a point where an agent can be legitimately stopped.",
      },
      {
        term: "Local completion and handoff",
        detail:
          "What counts as done differs: a confirmation record, a messaging-channel reply, an in-app status change, or a handoff back to the person. Each edition declares the authoritative signal MICA will read, and where the system must stop and ask instead.",
      },
    ],
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

  /**
   * The market integration profile: taxonomy labels plus the copy that frames
   * it on the country and methodology pages. Every string here describes a
   * declared plan; none of it reports a run.
   */
  integration: {
    eyebrow: "Market integration profile",
    title: "Representative local execution conditions",
    intro:
      "How everyday journeys in this market are actually reached, authorised, completed and evidenced. This is the declared profile for the edition, not evidence that any system has been run against it.",
    statusNote:
      "Declared, not exercised. No system has attempted any of these conditions, and no result is claimed for them.",
    parityNote:
      "These are fixed execution conditions held equal across systems. An app-only, identity-gated or QR-completed journey is not a harder task and earns no bonus or penalty.",
    surfaceLabel: "Surface",
    authorizationLabel: "Authorisation",
    completionLabel: "Completion",
    recoveryLabel: "Recovery",
    evidenceLabel: "Evidence",
    capabilityLabel: "Capability area",
    surfaces: {
      "open-web": "Open web",
      "official-api": "Official API or tool",
      "signed-in-app": "Signed-in app",
      "super-app-channel": "Super-app or messaging channel",
      "qr-device-handoff": "QR or device handoff",
      "human-handoff": "Phone, in person or human handoff",
    },
    authorizations: {
      "session-only": "None or session",
      otp: "One-time code",
      "carrier-identity": "Carrier identity",
      "government-identity": "Government identity",
      "payment-approval": "Payment approval",
      "account-holder-confirmation": "Account-holder confirmation",
    },
    completions: {
      "synchronous-confirmed": "Confirmed synchronously",
      "asynchronous-pending": "Pending, resolves later",
      "out-of-band-completion": "Completed off the agent's surface",
      "human-confirmed": "Confirmed by the user",
    },
    recoveries: {
      "partial-success": "Partial success",
      "stale-inventory-or-late-fee": "Stale inventory or late fee",
      "duplicate-or-retry-risk": "Duplicate or retry risk",
      "whole-form-invalidation": "Whole-form invalidation",
      "channel-unavailable": "Channel unavailable",
      "identity-handoff-timeout": "Identity handoff timeout",
    },
    evidence: {
      "tool-call-lineage": "Request and tool-call lineage",
      "authoritative-response": "Authoritative response or receipt",
      "post-action-readback": "Post-action state readback",
      "handoff-checkpoint": "Handoff checkpoint",
      "retry-idempotency-record": "Retry and idempotency record",
      "locale-formatted-artifact": "Locale-formatted artifact",
    },
    methodologyEyebrow: "Market integration",
    methodologyTitle: "The integration coverage contract",
    methodologyIntro:
      "Every market edition declares the representative local conditions its validated tasks must span, and every future run states which of them it exercised. The contract is published before any task is executable, so it can be argued with while it still costs nothing to change.",
    methodologyItems: [
      {
        term: "Access parity",
        detail:
          "Surface and authorisation are fixed conditions held equal across systems. They describe what a journey requires here, never how hard the task is, and they carry no bonus and no penalty.",
      },
      {
        term: "Handoff correctness",
        detail:
          "Where the task contract says so, stopping at a one-time code, an identity approval, a QR payment or a card approval is a correct completion. The run must preserve enough state for the user to continue.",
      },
      {
        term: "Completion is not a tool response",
        detail:
          "When completion is asynchronous or happens off the agent's surface, a successful call is not proof of the final state. A receipt, an authoritative response or a state readback is required.",
      },
      {
        term: "Retry and idempotency",
        detail:
          "Retrying an action that is not idempotent must be guarded and recorded, so a duplicate order, booking or payment can be detected rather than inferred.",
      },
      {
        term: "Evidence linkage",
        detail:
          "A validated localized attempt names the market situation it exercised. The link is checked against the market's own declared situations, so a situation from another market or an unknown one is rejected.",
      },
      {
        term: "What this is not",
        detail:
          "It is a coverage plan, not a result. No task claims to cover every situation, no system has attempted one, and MICA names no vendor endpoint, private interface or third-party server anywhere in it.",
      },
    ],
    methodologyStatus:
      "Six markets carry a declared profile. Nothing in it has been exercised, and no market is described as covered by evidence.",
  },

  rankings: {
    metaTitle: "Leaderboards",
    metaDescription:
      "The MICA leaderboard architecture: overall, by market and by task category. Category and country figures are arithmetic means of individual task scores, with raw accuracy, speed and cost still shown separately. No verified results are published yet.",
    eyebrow: "Leaderboard register",
    title: "Three views, one score per task",
    standfirst:
      "Read the field from wide to specific: the overall register, six market editions, then ten task categories. A category or market figure is the arithmetic mean of the eligible individual task scores behind it, and raw accuracy, speed and cost stay published beside it. The structure is live now; verified names and figures appear only after publication.",
    viewNavigationLabel: "Leaderboard views",
    overallView: "Overall",
    marketView: "By market",
    categoryView: "By category",
    viewIndex: "Leaderboard index",
    overallEyebrow: "Global register",
    overallTitle: "Overall leaderboard",
    overallIntro:
      "A system enters the overall register only with eligible coverage across all six markets. Market and category figures are arithmetic means of the individual task scores inside them; a single cross-market, cross-category overall score is not defined yet, and MICA will not invent a weighting to produce one. Raw accuracy uses a market macro-average, raw speed remains a separate successful-run measure, and raw cost per success has no global rank because currencies cannot be combined.",
    axisAwaiting: "Awaiting verified systems",
    costGlobalUnavailable: "No global cost rank",
    axisScopeAccuracy: "Six-market macro-average · higher is better",
    axisScopeSpeed: "Successful eligible runs · lower is better",
    axisScopeCost: "Market-only comparison · no global rank",
    marketEyebrow: "Six local editions",
    marketTitle: "Leaderboards by market",
    marketIntro:
      "Each market has its own ranked field, local currency and evidence lineage. Open an edition to compare systems under the rules that actually exist there.",
    marketOpen: "Open market view",
    categoryEyebrow: "Ten capability fields",
    categoryTitle: "Leaderboards by category",
    categoryIntro:
      "Category views reveal specialization that an overall standing can hide. Each view keeps the three outcomes apart and can be narrowed to one market.",
    categoryOpen: "Open category view",
    unpublishedLabel: "Not yet published",
    scoreEyebrow: "Score architecture",
    scoreTitle: "What a published ranking column will hold",
    scoreIntro:
      "Stated in advance so the structure can be argued with before any figure exists. Nothing below has been computed: no system has been measured and no task carries a final score today.",
    scoreItems: [
      {
        term: "Per-task final score",
        detail:
          "One validated, executable task attempt earns 100 × accuracy × speed × cost. Each factor is a normalized component between 0 and 1, so the score is bounded by 0 and 100.",
      },
      {
        term: "Category score",
        detail:
          "The arithmetic mean of the eligible individual task scores in that category. There is no weighting and no geometric mean at the aggregate level.",
      },
      {
        term: "Country score",
        detail:
          "The arithmetic mean of the eligible individual task scores in that market, on exactly the same rule as the category score.",
      },
      {
        term: "Overall register",
        detail:
          "A single cross-market, cross-category overall score is not defined by the methodology yet. Until it is, the overall register reports coverage and the separate axis measures, and no overall number is implied.",
      },
      {
        term: "Excluded tasks",
        detail:
          "A task that was not attempted, was not eligible, or has no pre-registered reference is excluded from the mean with a stated reason. It never enters as a zero, and the shrinking denominator stays visible.",
      },
      {
        term: "Raw axes",
        detail:
          "Raw accuracy, raw wall-clock latency and raw evaluation cost stay published in their own units beside every score.",
      },
    ],
    filterEyebrow: "Detailed slice",
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
    selectedSliceEmptyNotice:
      "No verified result is published for the selected market and task family. The controls describe the requested slice, but there is no result table or evidence record yet.",
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
      "An entry is a dated snapshot of a whole system: orchestrator, models, tools and memory together. No global model is required: a system may route each task to whichever model it judges best and call several inside one attempt, as long as every invocation is disclosed. Two entries can share a base model and still land far apart, which is the point.",
    emptyEyebrow: "System registry",
    emptyTitle: "The registry is empty",
    emptyNotice:
      "No system snapshot has been submitted, verified and published. MICA leaves the page empty rather than fill it with illustrative entries: an invented name beside an invented figure is the exact failure a benchmark exists to prevent. The labels below define what an entry will carry when the first one is admitted.",
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
    title: "Tasks measure real-world change",
    standfirst:
      "Each task defines the required final state and the point where the system must stop for approval. A response or successful tool call alone does not count.",
    crossingEyebrow: "What one task can cross",
    crossingTitle: "One errand crosses several services",
    crossingIntro:
      "A task may cross search, apps, identity checks, payments and messaging. It ends only when the service that holds the result confirms the required state. These definitions are candidates: none has been validated or run against a system.",
    disclosureDetail:
      "The task definitions on this page are the real thing; the run figures elsewhere on the site are illustrative demo data and not an official ranking.",
    publicationStatus:
      "These task definitions are provisional candidates for the public task set. None has been validated or run against any system, and no verified result has been published against any of them.",
    lifecycleEyebrow: "Catalogue status",
    lifecycleTitle: "A public draft, not a settled task set",
    lifecycleIntro:
      "Drafts published early so they can be challenged before they harden. They are usable as definitions; they are not a finished benchmark set, and nothing here has been measured.",
    lifecycleStatusTerm: "Lifecycle",
    lifecycleStatusDetail:
      "Every task is a candidate. A candidate is a drafted definition; a validated task is one that has passed the promotion contract below. No task has been promoted yet.",
    lifecycleSetTerm: "Public and holdout",
    lifecycleSetDetail:
      "Everything on this page belongs to the public set. A separate holdout set is kept apart by construction and is never published, exported, or shown here; no task listed here will be reused as holdout.",
    lifecycleTranslationTerm: "Languages",
    lifecycleTranslationDetail:
      "Task text exists in English and Korean only. The site is published in these two languages, and no task translation exists for any other market's language.",
    lifecycleMarketsTerm: "Market applicability",
    lifecycleMarketsDetail:
      "Candidates are listed against MICA's markets as drafted scope. Per-market applicability has not been decided task by task, so the listing states intended reach, not a validated per-market assignment.",
    promotionEyebrow: "Promotion contract",
    promotionTitle: "What validation requires",
    promotionIntro:
      "These fields are checked by machine before a candidate can be promoted. They are orthogonal on purpose: none of them is a difficulty rating, and none is combined into one.",
    promotionRequirements: [
      {
        label: "Surface",
        detail:
          "The execution surface the task runs on, including app-only or identity-gated access. This is a fixed condition held equal across systems under access parity, never a difficulty penalty.",
      },
      {
        label: "Termination class",
        detail:
          "How a correct run is expected to end: reaching the final state, handing off for approval, refusing, or escalating. Stopping correctly is a correct outcome, not a harder task.",
      },
      {
        label: "Declared complexity",
        detail:
          "How much work the task spans, declared independently of surface and termination so the three cannot be collapsed into a single ladder.",
      },
      {
        label: "Diagnostic axes",
        detail:
          "Which capabilities the task is meant to expose, so a failure can be read as a diagnosis rather than a score.",
      },
      {
        label: "Differentiated market applicability",
        detail:
          "An explicit decision for every market — applicable, variant required, or not applicable — with a stated reason, matching the markets the task declares.",
      },
    ],
    promotionGate:
      "A record that calls itself validated without all of these fails validation and cannot be published.",
    catalogueNavigationLabel: "Task category index",
    showTaskContract: "Show task contract",
    measurementContract: "Measurement contract",
    accuracyChecks: "Accuracy checks",
    speedWindow: "Speed window",
    costScope: "Cost scope",
    timeout: "Timeout",
    seconds: "sec",
    measurementStart: "Start",
    measurementStop: "Stop",
    referenceStatus: "Reference status",
    calibrationPending: "Calibration pending",
    calibrationPendingDetail:
      "Raw time and cost can be recorded, but normalized scores remain unavailable until pilot-median references are registered.",
    requiredEvidence: "Required evidence",
    allRequiredBinary:
      "Accuracy is 1 only when every final-state and approval-boundary check passes; otherwise it is 0.",
    includedCost: "Included",
    excludedCost: "Excluded",
    modelAndToolCost: "Model inference and metered tool/API fees in USD. A genuine zero is recorded as zero.",
    transactionValueExcluded: "Transaction value is excluded.",
    rawMetricsAvailable: "Raw metrics may be recorded before calibration.",
    finalStateCheck: "The complete declared final state must be confirmed.",
    boundaryCheck: "The attempt must stay within the declared approval boundary.",
    finalStateEvidence:
      "Authoritative post-action service readback or a traceable final artifact.",
    boundaryEvidence:
      "Complete tool and action lineage, including the approval record where required.",
    evidenceByFamily: {
      "email-calendar": { finalState: "Authoritative post-action readback from the calendar and mail providers.", boundary: "Complete calendar-change and message-send tool lineage, including required approvals." },
      "shopping-delivery": { finalState: "Authoritative readback of the merchant’s cart or order record, including itemized fees.", boundary: "Complete checkout and order-submission lineage, including required approvals." },
      "travel-accommodation": { finalState: "Authoritative carrier and property records for every itinerary, availability, and price claim.", boundary: "Complete booking, seat-hold, and payment-surface lineage, including required approvals." },
      "restaurants-local": { finalState: "Authoritative venue or booking-service record for the reservation or exact blocking step.", boundary: "Complete booking-channel, card-hold, verification, and message lineage, including required approvals." },
      "money-banking-investing": { finalState: "Authoritative institution record for balances, instructions, orders, and reference numbers.", boundary: "Complete lineage for every account-touching call, including required approvals." },
      "mobility-transit": { finalState: "Authoritative operator or platform record for rides, tickets, passes, schedules, and fares.", boundary: "Complete dispatch, ticketing, and payment-surface lineage, including required approvals." },
      "healthcare-administration": { finalState: "Authoritative provider or insurer record for appointments, referrals, prescriptions, and claims.", boundary: "Complete provider and insurer lineage, including submissions, approvals, and permitted data destinations." },
      "government-civic": { finalState: "Authoritative government-portal record for applications, filings, receipts, and issued documents.", boundary: "Complete filing, submission, fee, and identity-verification lineage, including required approvals." },
      "home-utilities": { finalState: "Authoritative provider record for service orders, appointments, meters, and billing.", boundary: "Complete account, scheduling, contract, and tariff-change lineage, including required approvals." },
      "telecom-subscriptions": { finalState: "Authoritative carrier or subscription record for plans, cancellations, ports, and billing.", boundary: "Complete plan, cancellation, port, and recurring-charge lineage, including required approvals." },
    },
    startEvent:
      "The evaluator releases the task, fixture state and required credentials.",
    stopEvent:
      "The evaluator records the terminal outcome and captures the required evidence.",
    scoringEyebrow: "Scoring contract",
    scoringTitle: "How a validated task is scored",
    scoringIntro:
      "A validated, executable task attempt earns one final score, and the raw axes behind it stay published. The definitions on this page are provisional candidates: none is executable or validated, none carries a pre-registered speed or cost reference, and none has been scored.",
    scoringFormulaLabel: "Per-task final score",
    scoringFormula: "100 × accuracy × speed × cost",
    scoringFormulaNote:
      "Each factor is a normalized component between 0 and 1, not a raw second and not a raw dollar.",
    scoringComponents: [
      {
        term: "Accuracy component",
        detail:
          "1 for a confirmed success, 0 for every other outcome. There is no partial credit, so a faster or cheaper failure still scores zero: the product runs through that zero.",
      },
      {
        term: "Speed component",
        detail:
          "min(1, speed reference ÷ observed seconds), against the reference pre-registered for that task version. Beating the reference is capped at 1, so speed cannot buy back accuracy.",
      },
      {
        term: "Cost component",
        detail:
          "min(1, cost reference ÷ observed evaluation cost in USD), or 1 when that cost is zero. This is the model, tool and API spend of running the evaluation, not the price of anything the agent bought.",
      },
    ],
    scoringAggregationTerm: "Family and country figures",
    scoringAggregationDetail:
      "The arithmetic mean of eligible attempt-derived task scores. A score is withheld unless the pre-registered canonical task set is complete. Exclusions remain listed and never disappear silently from the denominator.",
    scoringRawTerm: "Raw disclosure",
    scoringRawDetail:
      "The raw success outcome, the raw wall-clock latency and the raw evaluation cost stay on the record and are disclosed separately. The score is derived from them on request; it does not replace them.",
    scoringRoutingTerm: "Model routing",
    scoringRoutingDetail:
      "A system may route different tasks to different models and may call several models inside one attempt. Every invocation is disclosed as evidence with its provider, model, version, purpose, tokens, cost, latency and order.",
    scoringStatusTerm: "Current status",
    scoringStatusDetail:
      "No task on this page has a speed or cost reference, a result, or a score. The contract is published early so it can be challenged before it produces a number.",
    taxonomyEyebrow: "Taxonomy and coverage",
    taxonomyTitle: "Ten task families, no published results",
    captionSuffix:
      "canonical tasks, declared final states and confirmation boundaries.",
    declaredFinalState: "Declared final state",
    missionsEyebrow: "Worked examples",
    missionsTitle: "Hero missions across the index",
    missionsIntro:
      "One mission per market and family, written the way a person would actually ask.",
  },

  taskPolicy: {
    completionTitle: "One completion rule, five auditable outcomes",
    noPartialCredit:
      "Only confirmed completion counts as success. Partial progress, an unconfirmed claim, or a state outside the confirmation boundary receives no partial credit.",
    completionLevels: [
      { label: "Confirmed success", detail: "The declared final state is reached and verified inside the stated confirmation boundary." },
      { label: "Unconfirmed completion", detail: "The system claims completion, but the final state cannot be verified." },
      { label: "Partial progress", detail: "Useful intermediate steps are completed, but the declared final state is not reached." },
      { label: "Recoverable failure", detail: "The run fails before completion without leaving an irreversible harmful state." },
      { label: "Critical failure", detail: "The run causes a prohibited, unsafe, or irreversible state and triggers the safety block." },
    ],
    platformEyebrow: "Market execution environment",
    platformTitle: "Representative local platforms are fixed before a run",
    platformRules: [
      { label: "Representative set", detail: "For every market and task, MICA pre-registers a candidate set of platforms that ordinary consumers in that market commonly use, with evidence of local reach, current availability and task relevance." },
      { label: "Functional fit", detail: "The selected platform must support the canonical task without changing its declared final state, constraints or confirmation boundary." },
      { label: "Access parity", detail: "Every evaluated system receives the same selected platform, account tier, starting state, permissions and confirmation boundary." },
      { label: "Pre-registration and fallback", detail: "The selected platform, version, snapshot date and ordered fallback list are fixed before systems run. A fallback is used only for a documented platform outage, never because it is easier for one system." },
      { label: "Evidence lineage", detail: "Every published run cell names the platform actually used, its version and snapshot date, the selection evidence, and whether a pre-registered fallback was invoked." },
    ],
    platformExclusion:
      "MICA does not choose a platform because it favors a particular system, vendor, model, interface or tool integration. A platform outage pauses or invalidates the affected run cell instead of becoming a system failure.",
    localityEyebrow: "Market-local acceptance",
    localityTitle: "Success must be valid in the market where it is claimed",
    localityIntro:
      "Translation alone is not localization. Each canonical task declares the local conditions that its final state must satisfy; failed local validity is a task failure or a separately reported diagnostic, never cosmetic feedback.",
    localityRules: [
      { label: "Language and register", detail: "Language, honorifics, tone and script must fit the recipient, institution and channel used in that market." },
      { label: "Identity and formats", detail: "Names, addresses, phone numbers, dates, time zones, currencies and units must use locally valid formats." },
      { label: "Payment and verification", detail: "The flow must respect locally available payment rails, authentication, identity checks and user-consent steps." },
      { label: "Law and consumer terms", detail: "Taxes, mandatory fees, cancellation, refund, disclosure and consumer-protection conditions are evaluated under the market's applicable rules." },
      { label: "Operational reality", detail: "Inventory, delivery coverage, business hours, public holidays, service areas and real operating schedules must be valid at the evaluation time." },
      { label: "Channel and handoff", detail: "The system must use locally normal channels and hand control back to the user or a human at the market-appropriate approval boundary." },
      { label: "Task-specific validity", detail: "Reservations preserve time and cancellation constraints; transit uses real service and accessibility data; civic and healthcare administration use the correct jurisdiction, forms and non-clinical process." },
    ],
    valueEyebrow: "Constrained value quality",
    valueTitle: "Commerce results report proximity to the lowest valid total",
    valueIntro:
      "For commerce, booking and payment tasks, MICA compares the system's choice with the lowest valid total found across the pre-registered representative platform set at the same evaluation time. Price proximity is reported separately and is never folded into the accuracy, speed or cost components, and never into the per-task final score.",
    valueRules: [
      { label: "Equivalent offer", detail: "Product identity, specification, quantity, destination, delivery deadline, service level and cancellation conditions must be equivalent before prices are compared." },
      { label: "All-in total", detail: "The comparison uses the estimated payable total, including item price, delivery, taxes, service charges and payment fees." },
      { label: "Eligible discounts", detail: "Coupons, memberships and personalized offers count only when the test persona is eligible; the requirement and redemption state are recorded." },
      { label: "Valid baseline", detail: "The reference is the lowest constraint-satisfying total observed across the pre-registered representative platforms, with timestamp, availability and evidence lineage." },
      { label: "Price proximity", detail: "MICA reports the chosen total, reference total, absolute difference and percentage premium. No result is called the market-wide absolute lowest price." },
      { label: "Constraints outrank price", detail: "A cheaper option is excluded when it violates quality, safety, seller reliability, delivery, cancellation or another declared user constraint." },
    ],
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
      "Accuracy, its 95% interval, speed percentiles and cost per success are computed from the cell on request. Nothing is stored twice: the raw axes are the record, and any score is derived from them rather than stored in their place.",
    futureTerm: "What a scored record will have to carry",
    futureDetail:
      "Once tasks are executable, a scored record must name every model invocation behind the attempt — provider, model, version, purpose, tokens, cost, latency and order — alongside the raw accuracy outcome, raw latency and raw evaluation cost, and the pre-registered speed and cost references the components were computed against.",
    futureGapTerm: "What today's fixtures carry",
    futureGapDetail:
      "None of that. The demo fixtures are aggregate run cells only: no per-task route lineage, no score components and no final score. The shipped registry holds no cell at all.",
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
      "No per-task final score, and no route lineage or score components. This is an aggregate over a task family, so it carries none of them; raw accuracy, speed and cost stay separately disclosed here as everywhere else on the site.",
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
      "MICA is a measurement instrument before it is a league table. This page states the definitions, the gates and the known limits, so a disagreement can be about the method rather than the number.",
    disclosureDetail:
      "The method described here is real. The figures used to exercise it across this site are illustrative demo data and not an official ranking.",
    publicationStatus:
      "This method is a real draft, but it has not yet produced a measured result: nothing has been published under it.",
    tocAxes: "Outcome axes",
    tocScoring: "Scoring",
    tocRouting: "Model routing",
    tocCounting: "Eligibility",
    tocMissing: "Missing values",
    tocDiagnostics: "Diagnostics",
    tocIntegration: "Market integration",
    tocEvidence: "Evidence",
    tocPublication: "Publication rules",
    tocClaims: "Claims",
    tocLimits: "Limits",
    axesEyebrow: "Definitions",
    axesTitle: "The three outcome axes",
    axesIntro:
      "These three are reported side by side, always, in their own units. They are also normalized into components and multiplied into one final score per task, described in the next section. The raw axes remain the record, and MICA will not accept a submitter's own score or weighting in their place.",
    scoringEyebrow: "Scoring",
    scoringTitle: "Three raw axes first, one derived audit value",
    scoringIntro:
      "The score is derived from the raw record on request, but remains an audit value rather than a headline result until references, repeat runs and uncertainty are calibrated in the pilot. Nothing has been scored yet: the current task definitions are provisional candidates with no pre-registered references.",
    scoringFormulaLabel: "Per-task final score",
    scoringFormula: "100 × accuracy × speed × cost",
    scoringFormulaNote:
      "Each factor is a normalized component between 0 and 1, not a raw second and not a raw dollar. The product is therefore bounded by 0 and 100.",
    scoringComponents: [
      {
        term: "Accuracy component",
        detail:
          "1 for a confirmed success, 0 for every other outcome. No partial credit, so a faster or cheaper failure still scores zero: the product runs through that zero.",
      },
      {
        term: "Speed component",
        detail:
          "min(1, speed reference ÷ observed seconds). The reference is pre-registered per executable validated task version and is never re-derived from the cohort being scored, so a slow field cannot make a slow system look fast. Beating it is capped at 1.",
      },
      {
        term: "Cost component",
        detail:
          "min(1, cost reference ÷ metered evaluation cost in USD). Zero or unmetered cost is recorded as not measured rather than awarded a perfect component.",
      },
    ],
    scoringAggregationTerm: "Family and country scores",
    scoringAggregationDetail:
      "The arithmetic mean of eligible attempt-derived task scores in that family or market. It is withheld unless the pre-registered canonical task set is complete. Exclusions remain listed rather than silently shrinking the denominator.",
    scoringOverallTerm: "Cross-market, cross-category overall",
    scoringOverallDetail:
      "Not defined. A single overall figure would need a weighting across markets and categories that MICA has not agreed, so none is published and none is implied by the leaderboard structure.",
    scoringExclusionTerm: "Unscored tasks",
    scoringExclusionDetail:
      "A task that was not attempted, was not eligible, or has no pre-registered reference has no score at all. It is excluded from the mean with a stated reason and is never counted as a zero.",
    scoringRawTerm: "Raw disclosure",
    scoringRawDetail:
      "The raw success outcome, raw wall-clock latency and raw evaluation cost stay published in their own units beside every score, and remain auditable independently of it.",
    scoringCostTerm: "What cost means in the formula",
    scoringCostDetail:
      "Evaluation execution cost: the model, tool and API spend of running the task, in USD. It is not the price of an item, a booking or any transaction value the agent handled, so no currency conversion enters the product.",
    scoringStatusTerm: "Current status",
    scoringStatusDetail:
      "No system has been measured and no task carries a score. The formula is published as a draft so it can be challenged before it produces a number.",
    routingEyebrow: "System composition",
    routingTitle: "One system, many models",
    routingIntro:
      "MICA measures the whole agent system rather than a model, and does not require a system to run on one global model.",
    routingItems: [
      {
        term: "Per-task routing",
        detail:
          "A system may send different tasks to different models and select whichever model it judges best for a given task.",
      },
      {
        term: "Multiple invocations",
        detail:
          "One task attempt may call several models. That is a legitimate design choice and carries no penalty of its own.",
      },
      {
        term: "Invocation lineage",
        detail:
          "Every invocation is disclosed as evidence: provider, model, version, purpose, tokens, cost, latency and order within the attempt.",
      },
      {
        term: "What is scored",
        detail:
          "The attempt, not the route. Routing shows up in the score only through the accuracy, speed and evaluation cost the whole system actually delivered.",
      },
    ],
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
      "Any critical safety event permanently blocks publication of the cell. The blocked cell is not removed from its aggregate: family and country figures above it are withheld. There is no re-run to erase the event.",
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
      "Speed and cost references are market-specific, so country scores compare distance to a local reference rather than absolute performance across countries.",
      "The derived task score has no uncertainty interval yet and is not used for a headline ranking during the pilot.",
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
      "MICA is built to be argued with. What these rules protect is an open public benchmark initiative for consumer execution, not a vendor marketing surface. This page records who decides, what they are not allowed to decide, and how a result gets corrected when it is wrong.",
    disclosureDetail:
      "MICA has published no official edition. Everything currently on the site is illustrative demo data and not an official ranking.",
    rulesEyebrow: "Standing rules",
    rulesTitle: "What MICA will not do",
    rulesIntro:
      "These are commitments, not preferences. Breaking one is a governance failure, not a product decision.",
    rules: [
      "MICA will not publish a score it cannot re-derive from the raw record. A task score is the product of its accuracy, speed and cost components, and all three raw axes stay published beside it.",
      "MICA will not accept a score, a weighting or a self-declared component from a submitter in place of a measurement.",
      "MICA will not accept payment for placement, for inclusion, or for the timing of a result.",
      "MICA will not publish a figure it cannot trace to a run record it holds.",
      "MICA will not treat missing coverage as a zero, or a fast failure as a fast success.",
      "MICA will not remove a critical safety event from a cell. The block is permanent.",
      "MICA will not run irreversible actions against real accounts belonging to real people.",
    ],
    decisionsEyebrow: "Decisions",
    decisionsTitle: "Who decides what",
    decisionsIntro:
      "Separating editorial authority from operator relationships is a requirement MICA holds itself to, and the separation below is stated so it can be checked rather than assumed.",
    independenceEyebrow: "Independence",
    independenceTitle: "What is not settled yet",
    independenceIntro:
      "MICA is intended to be neutral, and it is not yet structurally independent. Stating the gap is more useful than claiming it is closed, so the open requirements are listed here and will be updated only when they are actually met.",
    independenceInitiatorTerm: "Initiator and challenger",
    independenceInitiatorDetail:
      "MICA was initiated by vooy, which also expects to be measured as a consumer-agent system. An initiator that may become a subject of the benchmark cannot also be its scoring authority; separating those roles is an open requirement, not a completed one.",
    independenceControlTerm: "Decision control",
    independenceControlDetail:
      "Method changes, verification outcomes and publication decisions must rest with a body that no evaluated party controls. That body has not been constituted, so no claim of independent decision control should be read into this site today.",
    independenceFundingTerm: "Funding and relationships",
    independenceFundingDetail:
      "Who funds MICA, on what terms, and what commercial relationships exist with any evaluated party must be disclosed publicly before results are published. No funding or operator relationship has been documented here yet.",
    independenceSetsTerm: "Public and holdout sets",
    independenceSetsDetail:
      "Ownership of the public task set and the holdout set must be separable, so that access to one confers no advantage on the other. The catalogue records this distinction per task; the holdout set is never published.",
    independenceStatusTerm: "Status",
    independenceStatusDetail:
      "Unresolved. These requirements gate the first official edition: MICA should not publish verified results until they are met and documented.",
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
      "MICA has no submission intake open yet, so this page states the requirements in advance. What is submitted is an assembled consumer-agent system, not a model endpoint: orchestrator, models, tools, memory and the means by which it actually executes in each claimed market, fixed at a dated version. Submission will be free and will buy no influence over the result.",
    disclosureDetail:
      "MICA is not yet accepting submissions for an official edition. The requirements below are real; the results currently on this site are illustrative demo data and not an official ranking.",
    publicationStatus:
      "Submissions are not open yet; the requirements below are advance guidance, and no verified result has been published.",
    stepOneEyebrow: "Step one",
    stepOneTitle: "Declare the snapshot",
    stepOneIntro:
      "A snapshot is an assembled system, not a model endpoint, and it is immutable. Change any part of it, including how it reaches a market, and you have a new snapshot rather than an update.",
    identityTerm: "Identity",
    identityDetail:
      "System name, operator, snapshot version string and snapshot date.",
    compositionTerm: "Composition",
    compositionDetail:
      "Orchestrator, every model the system may route to, every tool or API it may call, and how memory is held between steps. Routing each task to a different model, or calling several inside one attempt, is allowed; every model the system may reach has to be declared here.",
    scopeTerm: "Scope",
    scopeMarkets: "The markets (",
    scopeFamilies: ") and task families (",
    scopeSuffix: ") you are claiming coverage in.",
    executionTerm: "Market execution capability",
    executionDetail:
      "For every claimed market, how the system actually acts there: browser, app or mini-app runtime, API, platform or partner account standing, and the identity or consent handoff it relies on, together with the recovery path it takes when an authorization or verification step blocks it. Declare the capability and its limits, never secrets or raw credentials; MICA will not accept and does not want passwords, tokens or verification codes.",
    accessTerm: "Access",
    accessDetail:
      "A way for MICA to run the system itself on MICA-controlled accounts. Without this, the result can never rise above self-reported.",
    traceTerm: "Evidence trace",
    traceDetail:
      "Per-run records: eligibility, wall-clock duration, evaluation cost in USD, the final state reached, every point where the system stopped for confirmation, and every model invocation with its provider, model, version, purpose, tokens, cost, latency and order. For any state-changing task the record must also carry an authoritative post-action readback from the service that holds the state, or proof of the handoff where the system correctly stopped. A 2xx response or a reported tool success is not evidence of completion.",
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
