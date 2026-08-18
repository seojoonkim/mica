import { z } from "zod";
import { COUNTRIES } from "@/data/demo/countries";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_CATALOGUE_STATUS, TASK_FAMILIES } from "@/data/demo/tasks";
import { areResultsPublicationEligible } from "@/lib/calc";
import { INTEGRATION_COVERAGE_MINIMUMS } from "@/lib/schema";
import { PUBLICATION_RULES } from "@/data/policy/publication";
import { MAX_TASK_SCORE } from "@/lib/score";

/**
 * The canonical Methodology & References wiki.
 *
 * This module is the single source for the `/methodology` page and for the
 * generated Markdown pack at `public/methodology/mica-methodology-and-references.md`.
 * Both render from the same records, so the human page and the agent-readable
 * file cannot drift apart.
 *
 * Two rules govern everything below.
 *
 * 1. It states MICA's current method only. There is no change log here, no
 *    superseded rule, and no account of how a decision was reached. A reader
 *    who wants to argue with MICA should be arguing with what MICA holds now.
 * 2. Numbers that can be counted are never written as prose. Market count,
 *    family count, task count, system count and publication eligibility are
 *    read from the live data in {@link WIKI_FACTS}, so a copy edit cannot
 *    overstate the index.
 */

export interface Bilingual {
  en: string;
  ko: string;
}

/**
 * The reader-facing epistemic vocabulary. Every entry in the wiki carries one
 * of these four, rendered as text — never as colour alone — so the difference
 * between a rule MICA enforces, a question it has not answered, a finding it
 * borrowed and a choice that is its own survives greyscale and a printout.
 */
export const WIKI_BADGES = [
  {
    id: "current-rule",
    label: { en: "Current rule", ko: "현재 규칙" },
    meaning: {
      en: "A rule MICA applies today. Binding on the method as it stands.",
      ko: "MICA가 지금 적용하는 규칙입니다. 현재 방법론에 구속력이 있습니다.",
    },
  },
  {
    id: "mica-policy",
    label: { en: "MICA policy", ko: "MICA 정책" },
    meaning: {
      en: "A normative choice MICA made for itself. No external work endorses it, and it is open to challenge on its own terms.",
      ko: "MICA가 스스로 내린 규범적 선택입니다. 어떤 외부 연구도 이를 승인하지 않았으며, 그 자체로 반박할 수 있습니다.",
    },
  },
  {
    id: "external-evidence",
    label: { en: "External evidence", ko: "외부 근거" },
    meaning: {
      en: "A finding or practice taken from published work, cited in the reference chapters. Borrowing is not endorsement by the cited authors.",
      ko: "공개된 연구에서 가져온 결과나 관행이며, 레퍼런스 장에 출처를 밝힙니다. 인용은 원저자의 승인을 뜻하지 않습니다.",
    },
  },
  {
    id: "open-question",
    label: { en: "Open question", ko: "미해결 질문" },
    meaning: {
      en: "Not settled. MICA states the question rather than implying an answer it does not have.",
      ko: "아직 정해지지 않았습니다. MICA는 갖고 있지 않은 답을 암시하는 대신 질문을 그대로 밝힙니다.",
    },
  },
] as const;

export type BadgeId = (typeof WIKI_BADGES)[number]["id"];

export interface WikiEntry {
  /** Stable within its chapter; used for anchors and for the Markdown pack. */
  id: string;
  badge: BadgeId;
  term: Bilingual;
  detail: Bilingual;
  /** Reference ids this entry leans on, primary or editorial. */
  refs?: readonly string[];
}

export interface WikiChapter {
  /** Stable section id. Anchors and tests depend on these strings. */
  id: string;
  title: Bilingual;
  lead: Bilingual;
  entries: readonly WikiEntry[];
}

/* ------------------------------------------------------------------ facts */

const canonicalTaskCount = TASK_CATALOGUE_STATUS.publicTasks;

/**
 * Every changing figure the wiki is allowed to state, counted from the live
 * records rather than written down. Prose in this module refers to these
 * fields; it never restates their values.
 */
export const WIKI_FACTS = {
  domain: "micabench.com",
  markets: COUNTRIES.length,
  marketCodes: COUNTRIES.map((country) => country.code),
  marketNames: COUNTRIES.map((country) => country.name),
  families: TASK_FAMILIES.length,
  canonicalTasks: canonicalTaskCount,
  candidateTasks: TASK_CATALOGUE_STATUS.candidateTasks,
  validatedTasks: TASK_CATALOGUE_STATUS.validatedTasks,
  taskTextLanguages: TASK_CATALOGUE_STATUS.taskTextLanguages,
  systems: SYSTEMS.length,
  runCells: RUN_CELLS.length,
  publicationEligible: areResultsPublicationEligible(SYSTEMS, RUN_CELLS),
  maxTaskScore: MAX_TASK_SCORE,
  formula: `${MAX_TASK_SCORE} × accuracy × speed × cost`,
  formulaKo: `${MAX_TASK_SCORE} × 정확도 × 속도 × 비용`,
  minEligibleRuns: PUBLICATION_RULES.minEligibleRuns,
  minCoverage: PUBLICATION_RULES.minCoverage,
  integrationMinimums: INTEGRATION_COVERAGE_MINIMUMS,
} as const;

/* ------------------------------------------------------------- references */

export const REFERENCE_GROUPS = [
  {
    id: "agent-environments",
    label: { en: "Agent and web environments", ko: "에이전트·웹 환경" },
    lead: {
      en: "Where MICA takes its execution-based, final-state notion of a task from, and where those environments stop short of a localized consumer market.",
      ko: "MICA가 실행 기반 최종 상태라는 과제 개념을 어디에서 가져왔는지, 그리고 그 환경들이 현지화된 소비자 시장 앞에서 어디까지만 다루는지 정리합니다.",
    },
  },
  {
    id: "tool-interaction",
    label: { en: "Tool use and stateful interaction", ko: "도구 사용과 상태 기반 상호작용" },
    lead: {
      en: "Work on tool calls, policies, backend state and repeated reliability, which shapes what MICA demands as invocation evidence.",
      ko: "도구 호출, 정책, 백엔드 상태, 반복 신뢰도를 다룬 연구이며 MICA가 요구하는 호출 근거의 형태를 결정합니다.",
    },
  },
  {
    id: "measurement",
    label: { en: "Measurement, composites and uncertainty", ko: "측정·합성지표·불확실성" },
    lead: {
      en: "The literature MICA uses to criticize its own product score, not to justify it. Nothing here endorses multiplying heterogeneous factors.",
      ko: "MICA가 자신의 곱셈 점수를 정당화하기 위해서가 아니라 비판하기 위해 사용하는 문헌입니다. 이질적인 인자를 곱하는 방식을 승인하는 연구는 하나도 없습니다.",
    },
  },
  {
    id: "consumer-platforms",
    label: {
      en: "Consumer-platform execution controls",
      ko: "소비자 플랫폼 실행 통제",
    },
    lead: {
      en: "Official platform documentation, cited as evidence of the conditions under which a consumer action can be executed in production. None of these vendors has reviewed, approved or endorsed MICA.",
      ko: "소비자 행위를 실제 운영 환경에서 실행하려면 어떤 조건이 필요한지 보여 주는 근거로 인용한 공식 플랫폼 문서입니다. 여기 실린 어떤 사업자도 MICA를 검토하거나 승인한 바 없습니다.",
    },
  },
  {
    id: "integrity",
    label: {
      en: "Contamination, reproducibility, localization and governance",
      ko: "오염·재현성·현지화·거버넌스",
    },
    lead: {
      en: "How a benchmark stays honest over time: exposure control, documentation, per-language reporting and documented ownership.",
      ko: "벤치마크가 시간이 지나도 정직할 수 있게 하는 조건입니다. 노출 통제, 문서화, 언어별 보고, 소유 구조 명시가 여기 속합니다.",
    },
  },
] as const;

export type ReferenceGroupId = (typeof REFERENCE_GROUPS)[number]["id"];

export interface PrimaryReference {
  id: string;
  group: ReferenceGroupId;
  /** Benchmark or project name, as it is known. */
  name: string;
  /** Full title or descriptive subtitle. */
  title: string;
  /** Venue and year, or a dated-resource note for evolving leaderboards. */
  venue: string;
  url: string;
  /** What MICA takes from it. */
  borrowed: Bilingual;
  /** What MICA deliberately does not take from it. */
  notAdopted: Bilingual;
}

export const PRIMARY_REFERENCES: readonly PrimaryReference[] = [
  {
    id: "webarena",
    group: "agent-environments",
    name: "WebArena",
    title: "A Realistic Web Environment for Building Autonomous Agents",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2307.13854",
    borrowed: {
      en: "Realistic resettable websites with task-specific final-state validators, rather than a judge scoring a transcript.",
      ko: "기록을 채점하는 심판이 아니라, 초기화 가능한 현실적 웹사이트와 과제별 최종 상태 검증기를 사용하는 방식입니다.",
    },
    notAdopted: {
      en: "Its site set is generic and English-first. MICA extends the same validator idea to localized consumer markets and to surfaces that have no browsable equivalent.",
      ko: "사이트 구성이 일반적이고 영어 중심입니다. MICA는 같은 검증기 개념을 현지 소비자 시장과, 브라우저로 대체할 수 없는 표면까지 확장합니다.",
    },
  },
  {
    id: "visualwebarena",
    group: "agent-environments",
    name: "VisualWebArena",
    title: "Evaluating Multimodal Agents on Realistic Visual Web Tasks",
    venue: "ACL 2024",
    url: "https://aclanthology.org/2024.acl-long.50/",
    borrowed: {
      en: "Rendered-state tasks and visual evidence: what the user can actually see is part of the task, not an implementation detail.",
      ko: "렌더링된 상태를 과제로 삼고 시각 근거를 남기는 방식입니다. 사용자가 실제로 보는 것은 구현 세부가 아니라 과제의 일부입니다.",
    },
    notAdopted: {
      en: "MICA does not assume DOM-only access anywhere in the method, so a system that only reads markup is not privileged by the design.",
      ko: "MICA는 방법론 어디에서도 DOM 전용 접근을 전제하지 않으므로, 마크업만 읽는 시스템이 설계상 유리해지지 않습니다.",
    },
  },
  {
    id: "workarena",
    group: "agent-environments",
    name: "WorkArena",
    title: "How Capable Are Web Agents at Solving Common Knowledge Work Tasks?",
    venue: "ICML 2024",
    url: "https://proceedings.mlr.press/v235/drouin24a.html",
    borrowed: {
      en: "Parameterized task templates validated against backend state, so one task definition yields many checkable instances.",
      ko: "백엔드 상태로 검증하는 매개변수화 과제 템플릿입니다. 정의 하나가 검증 가능한 여러 사례를 만들어 냅니다.",
    },
    notAdopted: {
      en: "Its domain is enterprise knowledge work on one platform. MICA's unit is a household consumer journey across independent local services.",
      ko: "대상이 단일 플랫폼 위의 기업 지식 업무입니다. MICA의 단위는 서로 독립적인 현지 서비스를 가로지르는 생활 소비자 여정입니다.",
    },
  },
  {
    id: "osworld",
    group: "agent-environments",
    name: "OSWorld",
    title: "Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments",
    venue: "NeurIPS 2024",
    url: "https://arxiv.org/abs/2404.07972",
    borrowed: {
      en: "Snapshot and reset discipline, and execution-based evaluators that read computer state instead of trusting a claim of success.",
      ko: "스냅샷과 초기화 원칙, 그리고 성공 주장 대신 컴퓨터 상태를 읽는 실행 기반 평가기입니다.",
    },
    notAdopted: {
      en: "A resettable desktop cannot reset a third-party merchant, a bank or a carrier. MICA's parity conditions do that work instead.",
      ko: "초기화 가능한 데스크톱이 제3자 판매처나 은행, 통신사를 초기화해 주지는 못합니다. MICA에서는 접근 동일 조건이 그 역할을 대신합니다.",
    },
  },
  {
    id: "androidworld",
    group: "agent-environments",
    name: "AndroidWorld",
    title: "A Dynamic Benchmarking Environment for Autonomous Agents",
    venue: "arXiv 2024 / ICLR 2025",
    url: "https://arxiv.org/abs/2405.14573",
    borrowed: {
      en: "Parameterized mobile tasks with executable app-state checks, which is the closest published analogue to app-enclosed consumer journeys.",
      ko: "실행 가능한 앱 상태 점검을 갖춘 매개변수화 모바일 과제이며, 앱 안에 갇힌 소비자 여정에 가장 가까운 공개 사례입니다.",
    },
    notAdopted: {
      en: "Its apps are installed and controlled by the harness. MICA's markets include signed-in channels the harness will never own.",
      ko: "그 앱들은 하니스가 설치하고 통제합니다. MICA의 시장에는 하니스가 소유할 수 없는 로그인 채널이 포함됩니다.",
    },
  },
  {
    id: "mind2web",
    group: "agent-environments",
    name: "Mind2Web",
    title: "Towards a Generalist Agent for the Web",
    venue: "NeurIPS 2023",
    url: "https://arxiv.org/abs/2306.06070",
    borrowed: {
      en: "Breadth: a task taxonomy spanning many websites and domains, and an explicit test of generalization to unseen sites.",
      ko: "폭넓음입니다. 여러 웹사이트와 영역에 걸친 과제 분류 체계, 그리고 처음 보는 사이트로의 일반화를 명시적으로 시험하는 설계입니다.",
    },
    notAdopted: {
      en: "Offline action matching against recorded traces is not proof of final state. MICA does not accept step agreement as success.",
      ko: "녹화된 기록과 행동을 오프라인으로 대조하는 것은 최종 상태의 증명이 아닙니다. MICA는 단계 일치를 성공으로 인정하지 않습니다.",
    },
  },
  {
    id: "weblinx",
    group: "agent-environments",
    name: "WebLINX",
    title: "Real-World Website Navigation with Multi-Turn Dialogue",
    venue: "ICML 2024",
    url: "https://proceedings.mlr.press/v235/lu24d.html",
    borrowed: {
      en: "Multi-turn conversational traces and website-disjoint splits, which is how MICA thinks about a user who changes their mind mid-journey.",
      ko: "다중 턴 대화 기록과 사이트가 겹치지 않는 분할입니다. 여정 도중 마음을 바꾸는 사용자를 MICA가 다루는 방식이 여기서 왔습니다.",
    },
    notAdopted: {
      en: "Offline trace metrics stay diagnostic in MICA. They never become the primary success criterion for a task.",
      ko: "오프라인 기록 지표는 MICA에서 진단용으로 남습니다. 과제의 1차 성공 기준이 되지 않습니다.",
    },
  },
  {
    id: "assistantbench",
    group: "agent-environments",
    name: "AssistantBench",
    title: "Can Web Agents Solve Realistic and Time-Consuming Tasks?",
    venue: "2024",
    url: "https://arxiv.org/abs/2407.15711",
    borrowed: {
      en: "Long-horizon realistic tasks, and the practice of reporting the effort a task actually cost alongside whether it succeeded.",
      ko: "장기 호흡의 현실적 과제, 그리고 성공 여부와 함께 실제로 들어간 노력을 보고하는 관행입니다.",
    },
    notAdopted: {
      en: "Its outcomes are largely information answers. MICA's unit is a persistent state change in a real consumer service.",
      ko: "결과가 대체로 정보 응답입니다. MICA의 단위는 실제 소비자 서비스에 남는 지속적 상태 변화입니다.",
    },
  },
  {
    id: "webshop",
    group: "agent-environments",
    name: "WebShop",
    title: "Towards Scalable Real-World Web Interaction with Grounded Language Agents",
    venue: "NeurIPS 2022",
    url: "https://arxiv.org/abs/2207.01206",
    borrowed: {
      en: "Scalable consumer shopping goals expressed as constraint satisfaction over an instruction, which MICA reuses in its shopping family contracts.",
      ko: "지시문에 대한 제약 충족으로 표현한 확장 가능한 쇼핑 목표이며, MICA의 쇼핑 계열 과제 계약에서 다시 사용합니다.",
    },
    notAdopted: {
      en: "A single simulated store is narrower than a market. MICA's shopping tasks cross payment, identity and delivery rails that a single store hides.",
      ko: "시뮬레이션된 단일 상점은 시장보다 좁습니다. MICA의 쇼핑 과제는 단일 상점이 감추는 결제·본인확인·배송 경로를 가로지릅니다.",
    },
  },
  {
    id: "webvoyager",
    group: "agent-environments",
    name: "WebVoyager",
    title: "Building an End-to-End Web Agent with Large Multimodal Models",
    venue: "ACL 2024 / arXiv v1 25 January 2024",
    url: "https://arxiv.org/abs/2401.13919",
    borrowed: {
      en: "Operation on live websites rather than a frozen replica: 643 tasks across 15 real sites, which is the published precedent for evaluating against services the harness does not own.",
      ko: "고정된 복제본이 아니라 실제 운영 웹사이트에서 동작시키는 방식입니다. 실제 사이트 15곳에 걸친 과제 643개이며, 하니스가 소유하지 않은 서비스를 대상으로 평가한 공개 선례입니다.",
    },
    notAdopted: {
      en: "There is no systematic per-country localized suite, and success is judged in part by a GPT-4V reading of screenshots and agent output rather than by authoritative market-side completion. MICA requires a receipt, readback or handoff record instead.",
      ko: "국가별로 체계적으로 현지화한 과제 묶음이 없고, 성공 판정에 시장 쪽의 권위 있는 완료 근거 대신 GPT-4V가 스크린샷과 에이전트 출력을 읽는 방식이 일부 사용됩니다. MICA는 그 대신 확인 응답이나 되읽기, 인계 기록을 요구합니다.",
    },
  },
  {
    id: "appworld",
    group: "agent-environments",
    name: "AppWorld",
    title: "A Controllable World of Apps and People for Benchmarking Interactive Coding Agents",
    venue: "ACL 2024 / arXiv v1 26 July 2024",
    url: "https://arxiv.org/abs/2407.18901",
    borrowed: {
      en: "Everyday consumer domains spanning multiple interacting apps and people, checked by state-based tests rather than by output matching.",
      ko: "여러 앱과 사람이 얽히는 일상 소비 영역을 다루고, 출력 대조가 아니라 상태 기반 시험으로 확인하는 방식입니다.",
    },
    notAdopted: {
      en: `Its apps are a controllable simulated world authored for the benchmark, not ${WIKI_FACTS.markets} independently localized real-life markets with their own payment, identity and messaging rails.`,
      ko: `그 앱들은 벤치마크를 위해 저작된 통제 가능한 시뮬레이션 세계이며, 각자의 결제와 본인확인과 메시징 경로를 가진 ${WIKI_FACTS.markets}개의 독립적인 현지 실생활 시장이 아닙니다.`,
    },
  },
  {
    id: "tau-bench",
    group: "tool-interaction",
    name: "tau-bench",
    title: "A Benchmark for Tool-Agent-User Interaction in Real-World Domains",
    venue: "2024",
    url: "https://arxiv.org/abs/2406.12045",
    borrowed: {
      en: "Stateful user, agent and tool interaction judged against domain policy and backend state, plus repeated-trial reliability rather than one lucky run.",
      ko: "도메인 정책과 백엔드 상태로 판정하는 사용자·에이전트·도구 간 상태 기반 상호작용, 그리고 운 좋은 한 번이 아닌 반복 시행 신뢰도입니다.",
    },
    notAdopted: {
      en: `It covers two simulated service domains, retail and airline, in a single language. They are not ${WIKI_FACTS.markets} country-localized real consumer markets, and MICA's policies are the authorization conventions those markets actually apply.`,
      ko: `대상은 단일 언어로 된 두 개의 시뮬레이션 서비스 도메인, 곧 소매와 항공입니다. 국가별로 현지화된 ${WIKI_FACTS.markets}개의 실제 소비자 시장이 아니며, MICA의 정책은 그 시장들이 실제로 적용하는 승인 관행입니다.`,
    },
  },
  {
    id: "api-bank",
    group: "tool-interaction",
    name: "API-Bank",
    title: "A Comprehensive Benchmark for Tool-Augmented LLMs",
    venue: "EMNLP 2023",
    url: "https://aclanthology.org/2023.emnlp-main.187/",
    borrowed: {
      en: "The decomposition of tool use into deciding a tool is needed, retrieving it, forming arguments, executing and reading the response.",
      ko: "도구 사용을 도구 필요 판단, 검색, 인자 구성, 실행, 응답 해석으로 나누는 분해 방식입니다.",
    },
    notAdopted: {
      en: "A well-formed call is not a completed errand. MICA scores the final state, and uses call diagnostics only to explain it.",
      ko: "형식이 맞는 호출만으로 소비자 과제가 완료되지는 않습니다. MICA는 최종 상태를 채점하고, 호출 진단은 그것을 설명하는 데만 씁니다.",
    },
  },
  {
    id: "bfcl",
    group: "tool-interaction",
    name: "Berkeley Function-Calling Leaderboard",
    title: "Structured function-call evaluation, including non-use, multi-call and multi-turn categories",
    venue: "Evolving leaderboard; cite with the access date",
    url: "https://gorilla.cs.berkeley.edu/leaderboard.html",
    borrowed: {
      en: "Call normalization before comparison, and the insight that correctly declining to call a tool is a measurable behaviour.",
      ko: "비교 전에 호출을 정규화하는 방식과, 도구를 호출하지 않기로 올바르게 판단하는 것도 측정 가능한 행동이라는 통찰입니다.",
    },
    notAdopted: {
      en: "It is a live, versionless surface. MICA cites it as a dated evolving resource and never treats a snapshot of it as a fixed standard.",
      ko: "버전이 고정되지 않은 상시 갱신 자원입니다. MICA는 접근 시점을 밝혀 인용하며, 그 스냅샷을 고정 표준으로 다루지 않습니다.",
    },
  },
  {
    id: "agentbench",
    group: "tool-interaction",
    name: "AgentBench",
    title: "Evaluating LLMs as Agents",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2308.03688",
    borrowed: {
      en: "Heterogeneous interactive environments reported per environment, so a strength in one setting cannot be laundered into a general claim.",
      ko: "이질적인 대화형 환경을 환경별로 보고하는 방식입니다. 한 환경의 강점이 일반적 주장으로 세탁되지 않습니다.",
    },
    notAdopted: {
      en: "MICA does not aggregate unlike rewards into one figure. Family and market means are taken only over commensurable per-task scores.",
      ko: "MICA는 성질이 다른 보상을 하나의 수치로 합치지 않습니다. 계열과 시장 평균은 서로 비교 가능한 과제별 점수 위에서만 계산합니다.",
    },
  },
  {
    id: "gaia",
    group: "tool-interaction",
    name: "GAIA",
    title: "A Benchmark for General AI Assistants",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2311.12983",
    borrowed: {
      en: "Real-world multimodal tool tasks with unambiguous answers, and a hidden split held back from the public set.",
      ko: "답이 모호하지 않은 실제 멀티모달 도구 과제, 그리고 공개 세트에서 떼어 둔 비공개 분할입니다.",
    },
    notAdopted: {
      en: "A correct final answer is not a persistent state change. MICA requires an authoritative receipt or readback, not a string match.",
      ko: "정답 문자열은 지속적 상태 변화가 아닙니다. MICA는 문자열 일치가 아니라 권위 있는 확인 응답이나 되읽기를 요구합니다.",
    },
  },
  {
    id: "swe-bench",
    group: "tool-interaction",
    name: "SWE-bench",
    title: "Can Language Models Resolve Real-World GitHub Issues?",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.06770",
    borrowed: {
      en: "Success as positive obligations plus regression and invariant checks, with a per-instance artifact that makes a claim auditable.",
      ko: "성공을 충족 의무와 함께 회귀·불변 조건 점검으로 정의하고, 사례마다 검증 가능한 산출물을 남기는 방식입니다.",
    },
    notAdopted: {
      en: "Its invariants are test suites the harness owns. MICA has to express the same idea as prohibited-state checks on services it does not own.",
      ko: "그 불변 조건은 하니스가 소유한 테스트 묶음입니다. MICA는 소유하지 않은 서비스 위에서 같은 개념을 금지 상태 점검으로 표현해야 합니다.",
    },
  },
  {
    id: "helm",
    group: "measurement",
    name: "HELM",
    title: "Holistic Evaluation of Language Models",
    venue: "TMLR 2023",
    url: "https://arxiv.org/abs/2211.09110",
    borrowed: {
      en: "The separation of scenario, system, metric and run, and the discipline of multidimensional disclosure instead of one headline number.",
      ko: "시나리오·시스템·지표·실행을 분리하는 구조와, 대표 수치 하나 대신 여러 차원을 공개하는 원칙입니다.",
    },
    notAdopted: {
      en: "HELM does not justify a single universal product score. MICA's per-task product is its own decision and is defended as such.",
      ko: "HELM은 보편적인 단일 곱셈 점수를 정당화하지 않습니다. MICA의 과제별 곱은 MICA 자신의 결정이며 그렇게 방어합니다.",
    },
  },
  {
    id: "mlperf-inference",
    group: "measurement",
    name: "MLPerf Inference",
    title: "MLPerf Inference Benchmark",
    venue: "ISCA 2020",
    url: "https://doi.org/10.1109/ISCA45697.2020.00045",
    borrowed: {
      en: "Latency is comparable only under a fixed workload, a fixed quality target and a declared system boundary. MICA fixes all three before timing anything.",
      ko: "지연은 작업 부하와 품질 목표와 시스템 경계를 고정했을 때만 비교할 수 있습니다. MICA는 시간을 재기 전에 이 셋을 모두 고정합니다.",
    },
    notAdopted: {
      en: "Its workloads are deterministic and hardware-bounded. A consumer market changes under the runner, so MICA reports speed with the conditions attached.",
      ko: "그 작업 부하는 결정적이고 하드웨어 경계 안에 있습니다. 소비자 시장은 실행 중에도 변하므로 MICA는 속도를 조건과 함께 보고합니다.",
    },
  },
  {
    id: "oecd-jrc-composite",
    group: "measurement",
    name: "OECD / JRC",
    title: "Handbook on Constructing Composite Indicators: Methodology and User Guide",
    venue: "2008",
    url: "https://doi.org/10.1787/9789264043466-en",
    borrowed: {
      en: "Normalization, weighting and compensability are substantive decisions that must be documented and tested, not formatting choices.",
      ko: "정규화, 가중치, 보상 가능성은 서식 선택이 아니라 문서화하고 검증해야 하는 실질적 결정이라는 관점입니다.",
    },
    notAdopted: {
      en: "MICA uses this handbook to criticize its own product and to require sensitivity analysis. It is not an endorsement of MICA's formula.",
      ko: "MICA는 이 안내서를 자신의 곱셈을 비판하고 민감도 분석을 의무화하는 데 사용합니다. MICA 산식을 승인한 문헌이 아닙니다.",
    },
  },
  {
    id: "keeney-raiffa",
    group: "measurement",
    name: "Keeney & Raiffa",
    title: "Decisions with Multiple Objectives: Preferences and Value Tradeoffs",
    venue: "Cambridge University Press edition",
    url: "https://doi.org/10.1017/CBO9781139174084",
    borrowed: {
      en: "The conditions under which a multiplicative form is a legitimate utility function: stated preference structure and specific independence assumptions.",
      ko: "곱셈 형태가 정당한 효용 함수가 되기 위한 조건, 즉 명시된 선호 구조와 특정한 독립성 가정입니다.",
    },
    notAdopted: {
      en: "MICA has not established those assumptions, so its per-task product is a scoring policy and is not claimed to be a formal utility.",
      ko: "MICA는 그 가정을 확립하지 않았으므로, 과제별 곱은 채점 정책일 뿐 형식적 효용이라고 주장하지 않습니다.",
    },
  },
  {
    id: "fleming-wallace",
    group: "measurement",
    name: "Fleming & Wallace",
    title: "How Not to Lie with Statistics: The Correct Way to Summarize Benchmark Results",
    venue: "CACM 1986",
    url: "https://doi.org/10.1145/5666.5673",
    borrowed: {
      en: "Geometric means are the right summary for commensurable positive ratios, which is exactly the shape of a normalized speed or cost component.",
      ko: "기하평균은 비교 가능한 양의 비율을 요약하는 올바른 방법이며, 정규화된 속도·비용 성분이 정확히 그 형태입니다.",
    },
    notAdopted: {
      en: "It does not license multiplying heterogeneous metrics in general, and MICA does not cite it as if it did.",
      ko: "이질적인 지표를 일반적으로 곱해도 된다는 근거는 아니며, MICA는 그런 근거인 것처럼 인용하지 않습니다.",
    },
  },
  {
    id: "sokolova-lapalme",
    group: "measurement",
    name: "Sokolova & Lapalme",
    title: "A Systematic Analysis of Performance Measures for Classification Tasks",
    venue: "Information Processing & Management, 2009",
    url: "https://doi.org/10.1016/j.ipm.2009.03.002",
    borrowed: {
      en: "The macro versus micro distinction: whether you average over items or over groups is a weighting decision with visible consequences.",
      ko: "매크로와 마이크로의 구분입니다. 항목 단위로 평균할지 그룹 단위로 평균할지는 결과가 눈에 보이는 가중치 결정입니다.",
    },
    notAdopted: {
      en: "The original setting is classification metrics. MICA applies only the weighting concept, to tasks within a family and families within a market.",
      ko: "원 논문의 맥락은 분류 지표입니다. MICA는 가중치 개념만을 계열 안의 과제와 시장 안의 계열에 적용합니다.",
    },
  },
  {
    id: "agarwal-statistical",
    group: "measurement",
    name: "Agarwal et al.",
    title: "Deep Reinforcement Learning at the Edge of the Statistical Precipice",
    venue: "NeurIPS 2021",
    url: "https://arxiv.org/abs/2108.13264",
    borrowed: {
      en: "Few-run point estimates mislead. Report repeated runs, uncertainty intervals and performance distributions rather than a single mean.",
      ko: "실행 수가 적을 때의 점 추정은 오해를 부릅니다. 평균 하나 대신 반복 실행과 불확실성 구간, 성능 분포를 보고합니다.",
    },
    notAdopted: {
      en: "Its estimators assume continuous returns. MICA's outcomes are binary and hierarchical, so the adaptation has to be justified, not copied.",
      ko: "그 추정량은 연속형 보상을 전제합니다. MICA의 결과는 이진이며 계층적이므로, 그대로 옮기지 않고 적용 근거를 밝혀야 합니다.",
    },
  },
  {
    id: "kakao-app",
    group: "consumer-platforms",
    name: "Kakao Developers",
    title: "App",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.kakao.com/docs/latest/en/getting-started/app",
    borrowed: {
      en: "The documentation establishes that use of the platform begins with a registered application holding app keys and per-product configuration, so the registered app is the unit access is granted against.",
      ko: "이 문서는 플랫폼 이용이 앱 키와 제품별 설정을 가진 등록 애플리케이션에서 시작한다는 점을 확인해 줍니다. 접근 권한이 부여되는 단위가 등록된 앱이라는 뜻입니다.",
    },
    notAdopted: {
      en: "It does not establish that registration grants every capability. What a registered app may actually do is set per product and per scope, so MICA does not infer execution rights from registration.",
      ko: "등록만으로 모든 기능이 허용된다는 뜻은 아닙니다. 등록된 앱이 실제로 무엇을 할 수 있는지는 제품과 스코프 단위로 정해지므로, MICA는 등록 사실에서 실행 권한을 추론하지 않습니다.",
    },
  },
  {
    id: "kakao-message",
    group: "consumer-platforms",
    name: "Kakao Developers",
    title: "Kakao Talk Message · REST API",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.kakao.com/docs/latest/en/message/rest-api",
    borrowed: {
      en: "The documentation establishes that sending a message depends on a user access token, a consented scope, a supported message template and a permitted recipient relationship, which is a materially different condition from read-oriented local search.",
      ko: "메시지 전송이 사용자 액세스 토큰과 동의된 스코프, 지원되는 메시지 템플릿, 허용된 수신자 관계에 달려 있음을 확인해 줍니다. 읽기 중심의 지역 검색과는 조건이 실질적으로 다릅니다.",
    },
    notAdopted: {
      en: "It does not establish that messaging is unavailable, and MICA does not read it that way. It establishes that the send path is conditioned, which is why declared coverage is never treated as executable coverage.",
      ko: "메시징이 불가능하다는 근거는 아니며 MICA도 그렇게 읽지 않습니다. 전송 경로에 조건이 붙는다는 사실을 보여 줄 뿐이고, 그래서 선언된 커버리지를 실행 가능한 커버리지로 취급하지 않습니다.",
    },
  },
  {
    id: "line-channels",
    group: "consumer-platforms",
    name: "LINE Developers",
    title: "Creating a channel",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.line.biz/en/docs/line-developers-console/creating-channel/",
    borrowed: {
      en: "The documentation establishes a provider and channel structure as the control plane: a channel is created for a specific product and carries its own credentials.",
      ko: "프로바이더와 채널 구조가 통제 지점임을 확인해 줍니다. 채널은 특정 제품을 위해 생성되고 자체 자격 증명을 갖습니다.",
    },
    notAdopted: {
      en: "Creating a channel is not blanket product approval, and this page does not say it is. Individual products keep their own eligibility and review conditions.",
      ko: "채널 생성이 모든 제품에 대한 포괄 승인은 아니며, 이 문서도 그렇게 말하지 않습니다. 개별 제품은 저마다의 자격 요건과 심사 조건을 유지합니다.",
    },
  },
  {
    id: "line-messaging",
    group: "consumer-platforms",
    name: "LINE Developers",
    title: "Sending messages",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.line.biz/en/docs/messaging-api/sending-messages/",
    borrowed: {
      en: "The documentation establishes that a send depends on an Official Account channel and its access token, on the recipient relationship, and on which send method applies, rather than on a generic outbound call.",
      ko: "전송이 일반적인 외부 호출이 아니라 공식 계정 채널과 그 액세스 토큰, 수신자와의 관계, 적용되는 전송 방식에 달려 있음을 확인해 줍니다.",
    },
    notAdopted: {
      en: "It does not establish anything about non-messaging surfaces, and MICA does not generalize from it to payment, commerce or account operations on the same platform.",
      ko: "메시징 이외의 표면에 대해서는 아무것도 확인해 주지 않으며, MICA는 이를 같은 플랫폼의 결제나 커머스, 계정 기능으로 일반화하지 않습니다.",
    },
  },
  {
    id: "line-mini-app",
    group: "consumer-platforms",
    name: "LINE Developers",
    title: "LINE MINI App development flow",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.line.biz/en/docs/line-mini-app/develop/development-flow/",
    borrowed: {
      en: "The documentation establishes a lifecycle in which development and testing precede a review step before release, so reaching production is a gated transition rather than a deployment.",
      ko: "개발과 테스트를 거친 뒤 공개 전에 심사 단계가 있는 수명주기를 확인해 줍니다. 운영 환경 도달이 단순 배포가 아니라 관문을 통과하는 전환이라는 뜻입니다.",
    },
    notAdopted: {
      en: "It does not establish uniform worldwide availability. Regional availability and per-region conditions can differ, so MICA records executability per market rather than per platform.",
      ko: "전 세계에서 동일하게 제공된다는 근거는 아닙니다. 지역별 제공 여부와 조건이 다를 수 있으므로, MICA는 실행 가능성을 플랫폼 단위가 아니라 시장 단위로 기록합니다.",
    },
  },
  {
    id: "wechat-release",
    group: "consumer-platforms",
    name: "WeChat Mini Program",
    title: "Release",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developers.weixin.qq.com/miniprogram/en/dev/framework/quickstart/release.html",
    borrowed: {
      en: "The documentation establishes an account-controlled runtime bound to an AppID, where a build is uploaded, submitted for review and only then released to users.",
      ko: "AppID에 묶인 계정 통제 런타임을 확인해 줍니다. 빌드를 업로드하고 심사를 받은 뒤에야 사용자에게 공개됩니다.",
    },
    notAdopted: {
      en: "The English page is not a complete statement of current conditions. It can lag the Chinese documentation and the admin console, so MICA cites it for the shape of the control and verifies specifics per market edition.",
      ko: "영문 문서가 현재 조건을 온전히 서술한다고 보지 않습니다. 중국어 문서나 관리자 콘솔보다 갱신이 늦을 수 있으므로, MICA는 통제의 형태에 한해 인용하고 세부 사항은 시장 에디션에서 따로 확인합니다.",
    },
  },
  {
    id: "grab-docs",
    group: "consumer-platforms",
    name: "Grab Developer",
    title: "Grab Developer Documentation",
    venue: "Official documentation · accessed 8 August 2026",
    url: "https://developer.grab.com/docs/",
    borrowed: {
      en: "The documentation root establishes that access is organized around a developer application and product-specific onboarding, with some production capabilities conditioned by country or partner status.",
      ko: "접근이 개발자 애플리케이션과 제품별 온보딩을 중심으로 구성되며, 일부 운영 기능은 국가나 파트너 지위에 따라 조건이 붙는다는 점을 문서 루트에서 확인할 수 있습니다.",
    },
    notAdopted: {
      en: "It does not establish which specific capability is open in which market on a given date. MICA cites the documentation root rather than a deep link because product pages move, and it verifies specifics per market edition.",
      ko: "특정 시점에 어느 시장에서 어떤 기능이 열려 있는지를 확인해 주지는 않습니다. 제품 문서 경로는 자주 바뀌므로 MICA는 개별 링크 대신 문서 루트를 인용하고, 세부 사항은 시장 에디션에서 확인합니다.",
    },
  },
  {
    id: "gpt3-contamination",
    group: "integrity",
    name: "Brown et al. (GPT-3)",
    title: "Language Models are Few-Shot Learners",
    venue: "NeurIPS 2020",
    url: "https://arxiv.org/abs/2005.14165",
    borrowed: {
      en: "Benchmark overlap audits and clean-subset comparison as a routine, published part of a result rather than an afterthought.",
      ko: "벤치마크 중복 감사와 비오염 부분집합 비교를, 나중에 덧붙이는 항목이 아니라 결과의 정규 구성 요소로 공개하는 방식입니다.",
    },
    notAdopted: {
      en: "Overlap auditing is not a proof of cleanliness. MICA states residual contamination risk rather than declaring a set uncontaminated.",
      ko: "중복 감사는 청결의 증명이 아닙니다. MICA는 오염이 없다고 선언하는 대신 잔여 오염 위험을 명시합니다.",
    },
  },
  {
    id: "magar-schwartz",
    group: "integrity",
    name: "Magar & Schwartz",
    title: "Data Contamination: From Memorization to Exploitation",
    venue: "ACL 2022",
    url: "https://aclanthology.org/2022.acl-long.18/",
    borrowed: {
      en: "Exposure, memorization and score exploitation are three different things, and only the third necessarily corrupts a comparison.",
      ko: "노출, 암기, 점수 악용은 서로 다른 세 가지이며, 비교를 반드시 훼손하는 것은 세 번째뿐이라는 구분입니다.",
    },
    notAdopted: {
      en: "MICA cannot measure exploitation directly today, so it controls exposure and records provenance instead of claiming exploitation is absent.",
      ko: "MICA는 지금 악용을 직접 측정할 수 없으므로, 악용이 없다고 주장하는 대신 노출을 통제하고 출처를 기록합니다.",
    },
  },
  {
    id: "dynabench",
    group: "integrity",
    name: "Dynabench",
    title: "Rethinking Benchmarking in NLP",
    venue: "NAACL 2021",
    url: "https://aclanthology.org/2021.naacl-main.324/",
    borrowed: {
      en: "Human and model in the loop challenge collection, which is how MICA intends to keep a rotating challenge set adversarial.",
      ko: "사람과 모델이 함께 참여하는 난제 수집 방식이며, MICA가 순환 난제 세트를 계속 도전적으로 유지하려는 방법입니다.",
    },
    notAdopted: {
      en: "Adversarial collection skews toward edge cases. MICA keeps a stable longitudinal core so the index does not drift into a corner-case suite.",
      ko: "적대적 수집은 예외 사례로 치우칩니다. MICA는 안정적인 장기 코어를 유지해 지수가 예외 모음으로 흘러가지 않게 합니다.",
    },
  },
  {
    id: "livebench",
    group: "integrity",
    name: "LiveBench",
    title: "A Challenging, Contamination-Free LLM Benchmark",
    venue: "2024 / ICLR 2025",
    url: "https://arxiv.org/abs/2406.19314",
    borrowed: {
      en: "Regular refresh from recent material with objectively verifiable answers, which limits how long an exposed item stays worth exploiting.",
      ko: "객관적으로 검증 가능한 최신 자료로 정기 갱신하는 방식이며, 노출된 항목이 악용 가치를 유지하는 기간을 줄입니다.",
    },
    notAdopted: {
      en: "MICA will not claim contamination freedom. Refresh reduces risk; it does not eliminate it, and the wiki says so.",
      ko: "MICA는 오염이 없다고 주장하지 않습니다. 갱신은 위험을 줄일 뿐 없애지 못하며, 이 문서는 그 사실을 밝힙니다.",
    },
  },
  {
    id: "pineau-reproducibility",
    group: "integrity",
    name: "Pineau et al.",
    title: "Improving Reproducibility in Machine Learning Research (Reproducibility Program Report)",
    venue: "JMLR 2021",
    url: "https://jmlr.org/papers/v22/20-303.html",
    borrowed: {
      en: "A reproducibility checklist attached to every published result: what was run, on what, how many times, and what was reported.",
      ko: "공개하는 모든 결과에 재현성 점검표를 붙이는 관행입니다. 무엇을 무엇 위에서 몇 번 실행했고 무엇을 보고했는지 밝힙니다.",
    },
    notAdopted: {
      en: "Full artifact release is impossible where a trace contains account state. MICA publishes redacted traces and keeps originals access-controlled.",
      ko: "기록에 계정 상태가 들어 있는 경우 전체 산출물 공개는 불가능합니다. MICA는 비식별 처리한 기록을 공개하고 원본은 접근 통제 아래 둡니다.",
    },
  },
  {
    id: "datasheets",
    group: "integrity",
    name: "Datasheets for Datasets",
    title: "Documentation of motivation, composition, collection, uses, distribution and maintenance",
    venue: "CACM 2021",
    url: "https://doi.org/10.1145/3458723",
    borrowed: {
      en: "The documentation frame MICA applies to each edition of the task catalogue, one datasheet section per axis.",
      ko: "MICA가 과제 목록의 에디션마다 적용하는 문서화 틀이며, 축마다 하나의 데이터시트 절을 씁니다.",
    },
    notAdopted: {
      en: "A datasheet describes a dataset. MICA's catalogue is a set of executable contracts, so it also documents environment and authorization conditions.",
      ko: "데이터시트는 데이터셋을 설명합니다. MICA의 목록은 실행 가능한 계약이므로 환경과 승인 조건까지 함께 문서화합니다.",
    },
  },
  {
    id: "mega",
    group: "integrity",
    name: "MEGA",
    title: "Multilingual Evaluation of Generative AI",
    venue: "EMNLP 2023",
    url: "https://aclanthology.org/2023.emnlp-main.258/",
    borrowed: {
      en: "Per-language reporting as a requirement, because an average across languages hides exactly the market where a system fails.",
      ko: "언어별 보고를 의무로 두는 원칙입니다. 언어를 가로지르는 평균은 시스템이 실패하는 바로 그 시장을 감추기 때문입니다.",
    },
    notAdopted: {
      en: "Multilingual coverage is not cultural localization. MICA treats language as one input to locality, not as locality itself.",
      ko: "다국어 지원은 문화적 현지화가 아닙니다. MICA는 언어를 현지성의 한 입력으로 다루며 현지성 자체로 보지 않습니다.",
    },
  },
  {
    id: "blend",
    group: "integrity",
    name: "BLEnD",
    title: "A Benchmark for LLMs on Everyday Knowledge in Diverse Cultures and Languages",
    venue: "NeurIPS 2024",
    url: "https://arxiv.org/abs/2406.09948",
    borrowed: {
      en: "Everyday cultural knowledge collected locally rather than inferred, which is the standard MICA holds its task authors to.",
      ko: "추론이 아니라 현지에서 수집한 일상 문화 지식이며, MICA가 과제 저자에게 요구하는 기준입니다.",
    },
    notAdopted: {
      en: "A country is not homogeneous. MICA records the region, channel and register a task assumes rather than labelling it with a flag.",
      ko: "한 국가는 균질하지 않습니다. MICA는 과제에 국기를 붙이는 대신 그 과제가 전제하는 지역·채널·화계를 기록합니다.",
    },
  },
  {
    id: "m3exam",
    group: "integrity",
    name: "M3Exam",
    title: "A Multilingual, Multimodal, Multilevel Benchmark for Examining Large Language Models",
    venue: "AAAI 2024",
    url: "https://arxiv.org/abs/2306.05179",
    borrowed: {
      en: "Locally sourced material behaves differently from translated English material, which is why MICA requires local authorship rather than translation.",
      ko: "현지에서 수집한 자료는 번역된 영어 자료와 다르게 작동합니다. MICA가 번역이 아니라 현지 저작을 요구하는 이유입니다.",
    },
    notAdopted: {
      en: "Exam items have fixed answers. A consumer errand's correct outcome depends on live local state, so MICA validates final state instead.",
      ko: "시험 문항에는 고정된 정답이 있습니다. 소비자 과제의 올바른 결과는 실제 현지 상태에 달려 있으므로 MICA는 최종 상태를 검증합니다.",
    },
  },
  {
    id: "data-statements",
    group: "integrity",
    name: "Data Statements for NLP",
    title: "Toward Mitigating System Bias and Enabling Better Science",
    venue: "TACL 2018",
    url: "https://aclanthology.org/Q18-1041/",
    borrowed: {
      en: "Documenting language variety, collection context and the situation of the people who authored and reviewed the material.",
      ko: "언어 변종, 수집 맥락, 자료를 작성하고 검토한 사람들의 상황을 문서화하는 방식입니다.",
    },
    notAdopted: {
      en: "MICA records reviewer context at the level of role and market competence only. No individual is identifiable from a published statement.",
      ko: "MICA는 검토자 맥락을 역할과 시장 역량 수준으로만 기록합니다. 공개되는 문서에서 개인이 식별되지 않습니다.",
    },
  },
  {
    id: "nist-ai-rmf",
    group: "integrity",
    name: "NIST AI RMF 1.0",
    title: "Artificial Intelligence Risk Management Framework",
    venue: "NIST, 2023",
    url: "https://doi.org/10.6028/NIST.AI.100-1",
    borrowed: {
      en: "The GOVERN, MAP, MEASURE and MANAGE structure, and its demand for documented ownership, validity criteria and ongoing monitoring.",
      ko: "GOVERN, MAP, MEASURE, MANAGE 구조와, 소유 주체·타당성 기준·지속 모니터링을 문서화하라는 요구입니다.",
    },
    notAdopted: {
      en: "MICA claims no NIST alignment. A conformance claim would require a published mapping, and MICA has not produced one.",
      ko: "MICA는 NIST 정합성을 주장하지 않습니다. 적합성 주장은 공개된 대응표를 요구하는데 MICA는 그것을 만들지 않았습니다.",
    },
  },
  {
    id: "benchmark-lottery",
    group: "integrity",
    name: "The Benchmark Lottery",
    title: "How benchmark, task and metric choice can change the conclusion",
    venue: "2021",
    url: "https://arxiv.org/abs/2107.07002",
    borrowed: {
      en: "The warning that a ranking can be an artifact of the suite. MICA publishes task-level results so a conclusion can be recomputed differently.",
      ko: "순위가 평가 묶음의 산물일 수 있다는 경고입니다. MICA는 결론을 다르게 다시 계산할 수 있도록 과제 단위 결과를 공개합니다.",
    },
    notAdopted: {
      en: "The lesson is not that ranking is impossible. It is that a ranking without sensitivity analysis is not evidence, which MICA accepts as a requirement.",
      ko: "순위가 불가능하다는 교훈이 아닙니다. 민감도 분석 없는 순위는 근거가 아니라는 뜻이며, MICA는 이를 요건으로 받아들입니다.",
    },
  },
];

export interface EditorialReference {
  id: string;
  name: string;
  title: string;
  url: string;
  influence: Bilingual;
}

/**
 * Product and publication influences. They are kept in their own chapter and
 * never mixed with the scientific precedents, because an interface convention
 * is not evidence about how to measure an agent.
 */
export const EDITORIAL_REFERENCES: readonly EditorialReference[] = [
  {
    id: "inspect",
    name: "Inspect",
    title: "Evaluation framework with per-sample trace drilldown",
    url: "https://inspect.aisi.org.uk/",
    influence: {
      en: "The shape of a trace drilldown: from an aggregate straight to the sample and the calls behind it. Internal observability is not independent benchmark evidence, and MICA does not present it as such.",
      ko: "집계에서 개별 표본과 그 뒤의 호출까지 곧장 내려가는 추적 화면의 형태입니다. 내부 관측 도구는 독립적인 벤치마크 근거가 아니며, MICA도 그렇게 제시하지 않습니다.",
    },
  },
  {
    id: "braintrust",
    name: "Braintrust",
    title: "Experiment and evaluation tooling for LLM products",
    url: "https://www.braintrust.dev/",
    influence: {
      en: "Experiment records that keep the input, the output and the grader together. Useful as a product pattern, not as a source of external verification.",
      ko: "입력과 출력과 채점자를 함께 묶어 두는 실험 기록입니다. 제품 패턴으로는 유용하지만 외부 검증의 출처는 아닙니다.",
    },
  },
  {
    id: "rtings",
    name: "RTINGS",
    title: "Product testing with published methodology versions",
    url: "https://www.rtings.com/",
    influence: {
      en: "Published test definitions with explicit version histories, and raw measured values shown beside any derived rating.",
      ko: "버전 이력을 명시한 시험 정의와, 도출된 등급 옆에 원측정값을 함께 보여 주는 방식입니다.",
    },
  },
  {
    id: "wirecutter",
    name: "Wirecutter",
    title: "Conditional recommendations with stated scope",
    url: "https://www.nytimes.com/wirecutter/",
    influence: {
      en: "Recommendations written as conditional on a use case, with the scope of testing stated rather than implied.",
      ko: "사용 맥락을 조건으로 삼아 추천을 쓰고, 시험 범위를 암시가 아니라 문장으로 밝히는 방식입니다.",
    },
  },
  {
    id: "ookla",
    name: "Ookla Speedtest Global Index",
    title: "Country-first entry into a measured index",
    url: "https://www.speedtest.net/global-index",
    influence: {
      en: "Country-first navigation into a measurement index, and a visible statement of what the median figure does and does not represent.",
      ko: "국가를 먼저 고르게 하는 측정 지수 탐색 구조와, 중앙값이 무엇을 나타내고 무엇을 나타내지 않는지 눈에 보이게 밝히는 방식입니다.",
    },
  },
  {
    id: "ti-cpi",
    name: "Transparency International CPI",
    title: "Composite country index with published source and limits",
    url: "https://www.transparency.org/en/cpi",
    influence: {
      en: "A composite country index that publishes its sources, its construction and its limits together, and warns against year-on-year over-reading.",
      ko: "출처와 구성 방식과 한계를 함께 공개하고, 연도 간 차이를 과하게 읽지 말라고 경고하는 국가 합성지표입니다.",
    },
  },
  {
    id: "freedom-house",
    name: "Freedom House",
    title: "Freedom in the World: scored country reports with method notes",
    url: "https://freedomhouse.org/report/freedom-world",
    influence: {
      en: "Country reports where the narrative and the score are published side by side, so the number can be argued with using the report's own text.",
      ko: "서술과 점수를 나란히 공개하여, 보고서 본문으로 그 숫자를 반박할 수 있게 하는 국가 보고 형식입니다.",
    },
  },
  {
    id: "wjp",
    name: "World Justice Project",
    title: "Rule of Law Index: sub-factor disclosure beneath a headline",
    url: "https://worldjusticeproject.org/rule-of-law-index",
    influence: {
      en: "Sub-factor scores always reachable beneath a headline figure, so a country's position can be decomposed rather than taken on trust.",
      ko: "대표 수치 아래에서 항상 세부 요인 점수에 도달할 수 있게 하여, 국가의 위치를 신뢰가 아니라 분해로 확인하게 하는 방식입니다.",
    },
  },
  {
    id: "wcag22",
    name: "WCAG 2.2",
    title: "Web Content Accessibility Guidelines 2.2",
    url: "https://www.w3.org/TR/WCAG22/",
    influence: {
      en: "The conformance target for this site: text alternatives to colour, focus visibility, reflow without horizontal scrolling and meaningful link text.",
      ko: "이 사이트의 준수 목표입니다. 색에만 의존하지 않는 텍스트 대안, 초점 가시성, 가로 스크롤 없는 재배치, 뜻이 통하는 링크 문구를 포함합니다.",
    },
  },
  {
    id: "wai-tables",
    name: "W3C WAI Tables Tutorial",
    title: "Accessible data table patterns",
    url: "https://www.w3.org/WAI/tutorials/tables/",
    influence: {
      en: "Header association, captions and scope for any data table MICA eventually publishes results into.",
      ko: "MICA가 결과를 담게 될 데이터 표에 적용할 헤더 연결, 캡션, 범위 지정 방식입니다.",
    },
  },
  {
    id: "govuk-content",
    name: "GOV.UK Content Design",
    title: "Guidance on writing for a public audience",
    url: "https://www.gov.uk/guidance/content-design",
    influence: {
      en: "Plain, front-loaded sentences and a refusal of promotional register in factual public content.",
      ko: "핵심을 앞세운 평이한 문장과, 사실을 전달하는 공공 문서에서 홍보 어투를 배제하는 원칙입니다.",
    },
  },
  {
    id: "our-world-in-data",
    name: "Our World in Data",
    title: "Public data communication with sources and definitions attached",
    url: "https://ourworldindata.org/",
    influence: {
      en: "Every chart carries its definition, its source and its coverage gaps in reach of the reader, not in a separate appendix.",
      ko: "모든 도표가 정의와 출처와 커버리지 공백을 별도 부록이 아니라 독자의 손이 닿는 자리에 함께 싣는 방식입니다.",
    },
  },
  {
    id: "ft-visual-vocabulary",
    name: "FT Visual Vocabulary",
    title: "Chart-type selection by analytical intent",
    url: "https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary",
    influence: {
      en: "Choosing a chart from the relationship being shown rather than from what looks impressive, which is why MICA has no dashboard.",
      ko: "인상적으로 보이는 형태가 아니라 보여 주려는 관계에서 도표를 고르는 원칙이며, MICA에 대시보드가 없는 이유입니다.",
    },
  },
];

/* ------------------------------------------------------- status and register */

export interface StatusItem {
  id: string;
  state: "implemented" | "planned";
  label: Bilingual;
  detail: Bilingual;
}

export const STATUS_MATRIX: readonly StatusItem[] = [
  {
    id: "public-site",
    state: "implemented",
    label: {
      en: "Bilingual public site and published method",
      ko: "이중 언어 공개 사이트와 공개된 방법론",
    },
    detail: {
      en: "This wiki, the market editions, the task catalogue and the machine-readable exports are live and generated from typed source data.",
      ko: "이 위키와 시장 에디션, 과제 목록, 기계 판독 가능한 내보내기 파일이 모두 타입이 지정된 원본 데이터에서 생성되어 공개되어 있습니다.",
    },
  },
  {
    id: "data-contract",
    state: "implemented",
    label: { en: "Validated data and publication contract", ko: "검증된 데이터·공개 계약" },
    detail: {
      en: "Schema validation, holdout separation on export, the fail-closed publication gate and the per-task scoring functions all run in code and fail the build when violated.",
      ko: "스키마 검증, 내보내기 시 홀드아웃 분리, 실패 시 차단되는 공개 관문, 과제별 채점 함수가 모두 코드로 동작하며 위반 시 빌드를 실패시킵니다.",
    },
  },
  {
    id: "declared-profiles",
    state: "implemented",
    label: { en: "Declared market integration profiles", ko: "선언된 시장 연동 프로필" },
    detail: {
      en: "Every market edition declares representative surfaces, authorization boundaries, completion semantics, recovery conditions and evidence requirements. Declared coverage is a plan, not a measurement.",
      ko: "모든 시장 에디션이 대표 표면, 승인 경계, 완료 의미, 복구 조건, 근거 요건을 선언합니다. 선언된 커버리지는 계획이며 측정이 아닙니다.",
    },
  },
  {
    id: "harness",
    state: "planned",
    label: { en: "Execution harness and evaluators", ko: "실행 하니스와 평가기" },
    detail: {
      en: "A resettable environment, a run recorder, deterministic final-state evaluators and a cost and latency ledger. None of it exists yet, so no attempt has ever been executed.",
      ko: "초기화 가능한 환경, 실행 기록기, 결정적 최종 상태 평가기, 비용·지연 원장이 여기 해당합니다. 아직 아무것도 존재하지 않으므로 어떤 시도도 실행된 적이 없습니다.",
    },
  },
  {
    id: "validated-scenarios",
    state: "planned",
    label: { en: "Validated localized scenarios", ko: "검증된 현지화 시나리오" },
    detail: {
      en: "Locally authored and locally reviewed executable scenarios with pre-registered speed and cost references. The current catalogue is candidate definitions only.",
      ko: "현지에서 저작하고 검토한, 속도·비용 기준값이 사전 등록된 실행 가능 시나리오입니다. 현재 목록은 후보 정의뿐입니다.",
    },
  },
  {
    id: "holdout",
    state: "planned",
    label: { en: "Private holdout set", ko: "비공개 홀드아웃 세트" },
    detail: {
      en: "The separation is enforced in the export today, but no holdout item has been authored, so there is nothing being held back yet.",
      ko: "분리 자체는 지금도 내보내기 단계에서 강제되지만, 홀드아웃 항목이 아직 저작되지 않았으므로 실제로 감춰 둔 것은 없습니다.",
    },
  },
  {
    id: "repeated-runs",
    state: "planned",
    label: { en: "Repeated runs and uncertainty reporting", ko: "반복 실행과 불확실성 보고" },
    detail: {
      en: "Interval estimates, repeated-trial reliability and sensitivity analysis over the scoring policy. All of it waits on the harness.",
      ko: "구간 추정, 반복 시행 신뢰도, 채점 정책에 대한 민감도 분석입니다. 모두 하니스 구축을 기다리고 있습니다.",
    },
  },
  {
    id: "live-tracks",
    state: "planned",
    label: { en: "Live shadow and limited verified-live tracks", ko: "라이브 섀도우와 제한적 실거래 트랙" },
    detail: {
      en: "No vendor integration exists, no live account is held and no run has been performed against a real service.",
      ko: "공급자 연동이 없고, 보유한 실계정이 없으며, 실제 서비스를 대상으로 수행한 실행도 없습니다.",
    },
  },
  {
    id: "thresholds",
    state: "planned",
    label: { en: "Publication thresholds", ko: "공개 기준값" },
    detail: {
      en: "Minimum sample size and minimum coverage are unset by design. Until they are agreed, the gate refuses every result rather than guessing a number.",
      ko: "최소 표본 수와 최소 커버리지는 의도적으로 정하지 않았습니다. 합의되기 전까지 관문은 숫자를 추측하지 않고 모든 결과를 거부합니다.",
    },
  },
  {
    id: "committee",
    state: "planned",
    label: { en: "Independent decision body", ko: "독립 의사결정 기구" },
    detail: {
      en: "No committee, board or review panel has been constituted, and no membership exists. Nothing on this site should be read as the output of one.",
      ko: "위원회나 이사회, 심의 패널이 구성된 적이 없고 구성원도 없습니다. 이 사이트의 어떤 내용도 그런 기구의 산출물로 읽혀서는 안 됩니다.",
    },
  },
];

export interface RegisterEntry {
  id: string;
  term: Bilingual;
  rule: Bilingual;
}

/**
 * The current policy register: the seven statements MICA is prepared to be held
 * to today. Each is a present-tense rule. None records when it was adopted or
 * what it replaced, because a public register of current policy is not a log.
 */
export const POLICY_REGISTER: readonly RegisterEntry[] = [
  {
    id: "definition",
    term: { en: "Project definition", ko: "프로젝트 정의" },
    rule: {
      en: `MICA, the Multinational Index of Consumer Agents, is a benchmark for complete versioned consumer-agent systems. Its canonical public domain is ${WIKI_FACTS.domain}.`,
      ko: `MICA, 곧 다국적 소비자 에이전트 지수는 버전이 고정된 완성 상태의 소비자 에이전트 시스템을 평가하는 벤치마크입니다. 표준 공개 도메인은 ${WIKI_FACTS.domain}입니다.`,
    },
  },
  {
    id: "market-scope",
    term: { en: "Market scope", ko: "시장 범위" },
    rule: {
      en: `The index covers ${WIKI_FACTS.markets} markets: ${WIKI_FACTS.marketCodes.map((code) => code.toUpperCase()).join(", ")}. This is the scope of the index, and no other market is in it.`,
      ko: `지수가 다루는 시장은 ${WIKI_FACTS.markets}개입니다. ${WIKI_FACTS.marketCodes.map((code) => code.toUpperCase()).join(", ")}이며, 이것이 지수의 범위이고 그 밖의 시장은 포함되지 않습니다.`,
    },
  },
  {
    id: "task-catalogue",
    term: { en: "Task catalogue", ko: "과제 목록" },
    rule: {
      en: `${WIKI_FACTS.families} task families hold ${WIKI_FACTS.canonicalTasks} canonical definitions. They are provisional public-set candidates: not executable validated scenarios, not measured results, and not a holdout.`,
      ko: `${WIKI_FACTS.families}개 과제 계열에 ${WIKI_FACTS.canonicalTasks}개의 표준 정의가 있습니다. 모두 공개 세트의 잠정 후보이며, 실행 가능한 검증 시나리오도, 측정된 결과도, 홀드아웃도 아닙니다.`,
    },
  },
  {
    id: "scoring",
    term: { en: "Derived per-attempt audit score", ko: "실행별 파생 감사 점수" },
    rule: {
      en: `Raw accuracy, latency and metered evaluation cost are the record and stay separately disclosed. MICA may derive ${WIKI_FACTS.formula} for each eligible validated attempt, but during the pilot the product is an audit value, not a headline result or ranking key. Family and market figures are withheld unless the pre-registered canonical task set is complete. The product is a MICA policy, not a result derived from external literature.`,
      ko: `정확도·지연·계측된 평가 비용의 원값이 기록이며 각각 따로 공개됩니다. 유효하고 검증된 실행마다 ${WIKI_FACTS.formulaKo}을 파생할 수 있지만, 파일럿 동안 이 곱은 대표 결과나 순위 기준이 아닌 감사값입니다. 사전 등록한 canonical 과제 집합이 완결되지 않으면 계열·시장 수치는 비공표합니다. 이 곱셈은 MICA의 정책이며 외부 문헌에서 도출한 결과가 아닙니다.`,
    },
  },
  {
    id: "sets",
    term: { en: "Public candidates and holdout", ko: "공개 후보와 홀드아웃" },
    rule: {
      en: "The public candidate set and the private holdout set are separate, and separation is enforced at export. Creation, exposure, version and provenance are recorded per item.",
      ko: "공개 후보 세트와 비공개 홀드아웃 세트는 분리되어 있으며, 분리는 내보내기 단계에서 강제됩니다. 항목마다 생성, 노출, 버전, 출처를 기록합니다.",
    },
  },
  {
    id: "integration-profiles",
    term: { en: "Market integration profiles", ko: "시장 연동 프로필" },
    rule: {
      en: `Each of the ${WIKI_FACTS.markets} market editions declares representative surfaces, authorization boundaries, completion semantics, recovery conditions and evidence requirements. These declare planned coverage, never measured coverage.`,
      ko: `${WIKI_FACTS.markets}개 시장 에디션은 각각 대표 표면, 승인 경계, 완료 의미, 복구 조건, 근거 요건을 선언합니다. 이는 계획된 커버리지를 선언할 뿐 측정된 커버리지를 뜻하지 않습니다.`,
    },
  },
  {
    id: "governance",
    term: { en: "Neutral governance intent", ko: "중립 거버넌스 의도" },
    rule: {
      en: "MICA must be neutral. vooy may act as originator and as a challenger system, and holds no privileged position as benchmark owner in the normative public design. Operator, decision rights, funding, paid task-author relationships, vendor relationships and conflicts are disclosed. Structural independence is an open requirement, not a solved claim.",
      ko: "MICA는 중립이어야 합니다. vooy는 발의자이자 도전 시스템일 수 있으나, 규범적 공개 설계에서 벤치마크 소유자로서의 특권적 지위를 갖지 않습니다. 운영 주체, 결정 권한, 자금, 유상 과제 저작 관계, 공급자 관계, 이해충돌을 공개합니다. 구조적 독립성은 해결된 주장이 아니라 미해결 요건입니다.",
    },
  },
];

export interface GlossaryEntry {
  id: string;
  term: Bilingual;
  definition: Bilingual;
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    id: "system-snapshot",
    term: { en: "System snapshot", ko: "시스템 스냅샷" },
    definition: {
      en: "A complete consumer-agent system frozen at a stated version, including scaffold, routing, memory, tools, permissions, localization and recovery behaviour. The unit MICA evaluates.",
      ko: "스캐폴드, 라우팅, 메모리, 도구, 권한, 현지화, 복구 동작까지 포함해 특정 버전으로 고정한 완성 상태의 소비자 에이전트 시스템입니다. MICA가 평가하는 단위입니다.",
    },
  },
  {
    id: "task-contract",
    term: { en: "Task contract", ko: "과제 계약" },
    definition: {
      en: "The declared final state of a task, its confirmation boundary, its termination class and the evidence a run must produce for the outcome to count.",
      ko: "과제의 선언된 최종 상태, 확인 경계, 종료 유형, 그리고 결과가 인정되기 위해 실행이 남겨야 할 근거를 규정한 것입니다.",
    },
  },
  {
    id: "confirmation-boundary",
    term: { en: "Confirmation boundary", ko: "확인 경계" },
    definition: {
      en: "The point past which an action is irreversible or requires an authorization the agent must not perform on the user's behalf. Stopping there correctly is a defined outcome, not a failure.",
      ko: "그 지점을 넘으면 행위가 되돌릴 수 없게 되거나, 에이전트가 사용자를 대신해서는 안 되는 승인이 필요해지는 경계입니다. 여기서 올바르게 멈추는 것은 실패가 아니라 정의된 결과입니다.",
    },
  },
  {
    id: "eligible-attempt",
    term: { en: "Eligible attempt", ko: "유효 시도" },
    definition: {
      en: "An attempt that passed screening: the environment was reachable, the persona and accounts were in the declared starting state, and no evaluator-side fault interrupted it.",
      ko: "심사를 통과한 시도입니다. 환경에 접근할 수 있었고, 페르소나와 계정이 선언된 시작 상태에 있었으며, 평가자 측 결함이 실행을 방해하지 않은 경우입니다.",
    },
  },
  {
    id: "confirmed-success",
    term: { en: "Confirmed success", ko: "확인된 성공" },
    definition: {
      en: "The declared final state was reached and evidenced by an authoritative receipt, readback or handoff record. The only outcome that scores 1 on the accuracy factor.",
      ko: "선언된 최종 상태에 도달했고, 권위 있는 확인 응답이나 되읽기 또는 인계 기록으로 입증된 경우입니다. 정확도 인자에서 1을 받는 유일한 결과입니다.",
    },
  },
  {
    id: "unverified-completion",
    term: { en: "Unverified completion", ko: "미검증 완료" },
    definition: {
      en: "The system reports it finished, but the required authoritative evidence is absent. Diagnostically distinct from failure; scored 0 on accuracy all the same.",
      ko: "시스템은 완료했다고 보고하지만 요구되는 권위 있는 근거가 없는 경우입니다. 진단상 실패와 구별되지만 정확도 인자에서는 똑같이 0입니다.",
    },
  },
  {
    id: "evaluation-cost",
    term: { en: "Evaluation execution cost", ko: "평가 실행 비용" },
    definition: {
      en: "Model, routing, retry, subagent, browser, search, maps and paid tool spend for running the attempt, in USD. Never the purchase price of goods or services the agent handled.",
      ko: "시도를 실행하는 데 든 모델, 라우팅, 재시도, 하위 에이전트, 브라우저, 검색, 지도, 유료 도구 비용이며 단위는 USD입니다. 에이전트가 다룬 상품이나 서비스의 구매 가격은 포함되지 않습니다.",
    },
  },
  {
    id: "integration-situation",
    term: { en: "Integration situation", ko: "연동 상황" },
    definition: {
      en: "One representative local execution condition in a market edition, carrying its surfaces, authorization boundary, completion semantics, recovery conditions and evidence requirements.",
      ko: "한 시장 에디션의 대표적인 현지 실행 조건 하나이며, 표면과 승인 경계, 완료 의미, 복구 조건, 근거 요건을 함께 지닙니다.",
    },
  },
  {
    id: "public-candidate",
    term: { en: "Public candidate", ko: "공개 후보" },
    definition: {
      en: "A published task definition available for inspection and criticism. Design material for the method, not an item of the final executable benchmark.",
      ko: "검토하고 비판할 수 있도록 공개한 과제 정의입니다. 방법론을 위한 설계 자료이며, 최종 실행 벤치마크의 문항이 아닙니다.",
    },
  },
  {
    id: "holdout",
    term: { en: "Holdout", ko: "홀드아웃" },
    definition: {
      en: "An item withheld from publication so that exposure cannot be converted into score. Never exported, and never reachable from a public artifact.",
      ko: "노출이 점수로 전환되지 않도록 공개하지 않고 남겨 두는 항목입니다. 내보내지 않으며, 공개 산출물에서 도달할 수 없습니다.",
    },
  },
  {
    id: "evidence-lineage",
    term: { en: "Evidence lineage", ko: "근거 계보" },
    definition: {
      en: "The unbroken chain from edition to suite and task contract, market situation, system snapshot, attempt, model and tool calls, evaluator evidence and final-state readback, up to the aggregate.",
      ko: "에디션에서 시작해 과제 묶음과 계약, 시장 상황, 시스템 스냅샷, 시도, 모델과 도구 호출, 평가자 근거와 최종 상태 되읽기를 거쳐 집계까지 끊기지 않고 이어지는 연결입니다.",
    },
  },
  {
    id: "fail-closed",
    term: { en: "Fail closed", ko: "실패 시 차단" },
    definition: {
      en: "When a required condition is unset or unmet, the gate refuses to publish rather than substituting a default. Absence never becomes a passing value.",
      ko: "필요한 조건이 정해지지 않았거나 충족되지 않으면, 관문은 기본값으로 대체하지 않고 공개를 거부합니다. 부재가 통과 값이 되는 일은 없습니다.",
    },
  },
];

export interface AmendmentStep {
  id: string;
  term: Bilingual;
  detail: Bilingual;
  /** Logical internal route a reader can act on, if any. */
  href?: string;
}

export const AMENDMENT_STEPS: readonly AmendmentStep[] = [
  {
    id: "what-counts",
    term: { en: "What counts as a challenge", ko: "무엇이 이의 제기가 되는가" },
    detail: {
      en: "A specific claim in this wiki, named by its section id, with the reason it is wrong and what would replace it. A preference is not a challenge; a counter-example, a citation or a reproducible discrepancy is.",
      ko: "이 위키의 특정 주장을 절 식별자로 지목하고, 왜 틀렸는지와 무엇으로 대체해야 하는지를 함께 제시하는 것입니다. 선호는 이의 제기가 아니며, 반례나 인용, 재현 가능한 불일치가 이의 제기입니다.",
    },
  },
  {
    id: "evidence-required",
    term: { en: "Evidence a challenge must carry", ko: "이의 제기가 갖춰야 할 근거" },
    detail: {
      en: "For a method claim, a citation or a worked counter-example. For a locality claim, the market, the channel and the convention being misdescribed. For a scoring claim, the inputs and the resulting figure so the disagreement is reproducible.",
      ko: "방법론 주장에는 인용이나 계산이 끝난 반례가 필요합니다. 현지성 주장에는 잘못 기술된 시장과 채널과 관행이 필요합니다. 채점 주장에는 입력값과 그 결과 수치가 필요하며, 그래야 이견을 재현할 수 있습니다.",
    },
  },
  {
    id: "route",
    term: { en: "Where to send it", ko: "어디로 보내는가" },
    detail: {
      en: "Through the submission route, which states the evidence requirements MICA applies to anything it receives.",
      ko: "제출 경로를 통해 보냅니다. 그 페이지에 MICA가 접수한 자료에 적용하는 근거 요건이 적혀 있습니다.",
    },
    href: "/submit",
  },
  {
    id: "who-decides",
    term: { en: "Who decides", ko: "누가 결정하는가" },
    detail: {
      en: "The governance page states who holds decision rights today and which of those rights are not yet independently held. MICA does not describe an authority it does not have.",
      ko: "거버넌스 페이지가 현재 누가 결정 권한을 갖는지, 그중 무엇이 아직 독립적으로 보유되지 않았는지를 밝힙니다. MICA는 갖고 있지 않은 권한을 설명하지 않습니다.",
    },
    href: "/about/governance",
  },
  {
    id: "versioning",
    term: { en: "How the method changes", ko: "방법론은 어떻게 바뀌는가" },
    detail: {
      en: "The method is versioned with the edition. A change ships as a new edition of this wiki and of the generated Markdown pack, both of which state the current rule in full so a reader never has to reconstruct it.",
      ko: "방법론은 에디션과 함께 버전이 매겨집니다. 변경은 이 위키와 생성된 마크다운 팩의 새 에디션으로 배포되며, 둘 다 현재 규칙을 온전히 서술하므로 독자가 규칙을 재구성할 필요가 없습니다.",
    },
  },
  {
    id: "corrections",
    term: { en: "Corrections", ko: "정정" },
    detail: {
      en: "A figure MICA cannot re-derive from the record it holds is withdrawn, not annotated. A correction is published with the same prominence as the claim it corrects.",
      ko: "보유한 기록에서 다시 도출할 수 없는 수치는 주석을 붙이는 것이 아니라 철회합니다. 정정은 그것이 바로잡는 주장과 같은 비중으로 공개합니다.",
    },
  },
];

/* ---------------------------------------------------------------- chapters */

export const WIKI_CHAPTERS: readonly WikiChapter[] = [
  {
    id: "why-mica",
    title: { en: "Why MICA exists", ko: "MICA가 존재하는 이유" },
    lead: {
      en: `MICA is the world's first public benchmark initiative designed for outcome-verified end-to-end consumer-agent execution across ${WIKI_FACTS.markets} country-localized real-life markets and multiple everyday consumer domains. Published agent benchmarks measure capability in environments the benchmark controls, while the thing a household actually buys is a whole system working inside local services nobody controls. MICA exists in that gap, and it is an initiative designed to evaluate rather than a benchmark reporting results.`,
      ko: `MICA는 ${WIKI_FACTS.markets}개의 국가별 현지 실생활 시장과 여러 일상 과제 영역에 걸쳐, 결과가 검증되는 소비자 에이전트의 엔드투엔드 실행을 평가하도록 설계된 세계 최초의 공개 벤치마크 이니셔티브입니다. 공개된 에이전트 벤치마크는 벤치마크가 통제하는 환경에서 능력을 측정하지만, 가정이 실제로 구매하는 것은 아무도 통제하지 않는 현지 서비스 안에서 동작하는 시스템 전체입니다. MICA는 그 간극에 있으며, 결과를 보고하는 벤치마크가 아니라 평가하도록 설계된 이니셔티브입니다.`,
    },
    entries: [
      {
        id: "first-mover-scope",
        badge: "external-evidence",
        term: { en: "The world-first claim, and its scope", ko: "세계 최초 주장과 그 범위" },
        detail: {
          en: `MICA is the world's first public benchmark initiative designed for outcome-verified end-to-end consumer-agent execution across ${WIKI_FACTS.markets} country-localized real-life markets and multiple everyday consumer domains. The claim is the conjunction of four conditions at once: ${WIKI_FACTS.markets} country-localized real-life markets, multiple everyday consumer domains, end-to-end execution rather than navigation or answering, and an authoritative outcome or final-state evidence requirement. It is a scoped category claim. It does not say prior work lacked live websites, shopping, travel, apps, transactions or state checks individually, because prior work has each of those. Review cutoff is 8 August 2026, and the claim is made to our knowledge from a finite literature review. MICA is currently an initiative designed to evaluate, with ${WIKI_FACTS.systems} systems and ${WIKI_FACTS.runCells} run cells, so it is not a benchmark reporting measured superiority over anything.`,
          ko: `MICA는 ${WIKI_FACTS.markets}개의 국가별 현지 실생활 시장과 여러 일상 소비 영역에 걸쳐, 결과가 검증되는 소비자 에이전트의 엔드투엔드 실행을 평가하도록 설계된 세계 최초의 공개 벤치마크 이니셔티브입니다. 이 주장은 네 조건이 동시에 성립하는 결합을 가리킵니다. ${WIKI_FACTS.markets}개의 국가별 현지 실생활 시장, 여러 일상 소비 영역, 탐색이나 응답이 아닌 엔드투엔드 실행, 그리고 권위 있는 결과 또는 최종 상태 근거 요건입니다. 이는 범위가 한정된 범주 주장입니다. 선행 연구에 실제 웹사이트, 쇼핑, 여행, 앱, 거래, 상태 점검이 개별적으로 없었다는 뜻이 아니며, 선행 연구에는 그 각각이 존재합니다. 검토 기준일은 2026년 8월 8일이고, 유한한 문헌 검토에 근거해 저희가 아는 범위에서 밝히는 주장입니다. MICA는 현재 시스템 ${WIKI_FACTS.systems}개, 실행 셀 ${WIKI_FACTS.runCells}개인 평가 설계 단계의 이니셔티브이며, 무엇에 대해서도 측정된 우위를 보고하는 벤치마크가 아닙니다.`,
        },
        refs: ["webarena", "webvoyager", "webshop", "androidworld", "appworld", "tau-bench"],
      },
      {
        id: "gap",
        badge: "external-evidence",
        term: { en: "The measurable gap", ko: "측정되지 않고 있는 간극" },
        detail: {
          en: `Execution-based benchmarks established that a task can be graded on final state rather than on a transcript, and they are not confined to controlled environments: WebVoyager operates on live websites, WebArena, WebShop, AndroidWorld and AppWorld use controlled or simulated ones, and tau-bench judges interaction against simulated domain policy and backend state. What none of them assembles is the conjunction: ${WIKI_FACTS.markets} country-localized real-life markets, multiple everyday consumer domains, execution carried through to the end, and an authoritative completion record, in the language and register the user actually uses.`,
          ko: `실행 기반 벤치마크들은 과제를 기록이 아니라 최종 상태로 채점할 수 있음을 확립했고, 통제된 환경에만 머무르지도 않습니다. WebVoyager는 실제 운영 웹사이트에서 동작하고, WebArena와 WebShop, AndroidWorld, AppWorld는 통제되거나 시뮬레이션된 환경을 쓰며, tau-bench는 시뮬레이션된 도메인 정책과 백엔드 상태로 상호작용을 판정합니다. 다만 어느 쪽도 다음 결합을 함께 갖추지는 않습니다. ${WIKI_FACTS.markets}개의 국가별 현지 실생활 시장, 여러 일상 소비 영역, 끝까지 수행되는 실행, 권위 있는 완료 기록, 그리고 사용자가 실제로 쓰는 언어와 화계입니다.`,
        },
        refs: ["webarena", "webvoyager", "webshop", "androidworld", "appworld", "tau-bench", "osworld"],
      },
      {
        id: "orchestration",
        badge: "current-rule",
        term: { en: "The system is the subject", ko: "시스템이 평가 대상이다" },
        detail: {
          en: "A base model score does not predict whether an errand completes. Scaffolding, routing, memory, permissions and recovery decide that, and they are the parts a buyer chooses between. MICA therefore measures the assembled system and never a model in isolation.",
          ko: "기반 모델의 점수는 소비자 과제의 완료 여부를 예측하지 못합니다. 그것을 결정하는 것은 스캐폴딩과 라우팅, 메모리, 권한, 복구이며, 구매자가 실제로 고르는 대상도 그것들입니다. 그래서 MICA는 조립된 시스템을 측정하고 모델을 단독으로 측정하지 않습니다.",
        },
      },
      {
        id: "locality",
        badge: "mica-policy",
        term: { en: "Locality is the hard part", ko: "어려운 부분은 현지성이다" },
        detail: {
          en: "A benchmark that translates English tasks measures translation. MICA's markets differ in which channel a journey lives on, who has to approve it, when it is actually complete and what counts as proof, and those differences are the point rather than a complication.",
          ko: "영어 과제를 번역하는 벤치마크는 번역을 측정합니다. MICA의 시장들은 여정이 어느 채널에 있는지, 누가 승인해야 하는지, 언제 실제로 완료되는지, 무엇이 증명이 되는지에서 서로 다르며, 그 차이는 부수적 복잡성이 아니라 측정의 핵심입니다.",
        },
        refs: ["blend", "m3exam", "mega"],
      },
      {
        id: "refusal",
        badge: "current-rule",
        term: { en: "What MICA refuses to be", ko: "MICA가 되기를 거부하는 것" },
        detail: {
          en: "Not a marketing surface for the systems it measures, not a leaderboard that publishes a figure it cannot re-derive, and not an index that treats an absent measurement as a low one.",
          ko: "측정 대상 시스템의 홍보 지면이 아니고, 다시 도출할 수 없는 수치를 공개하는 순위표가 아니며, 측정이 없는 것을 낮은 값으로 취급하는 지수가 아닙니다.",
        },
      },
    ],
  },
  {
    id: "construct",
    title: { en: "Construct and evaluation unit", ko: "구성 개념과 평가 단위" },
    lead: {
      en: "What exactly is being measured, stated precisely enough that a submitter knows what to freeze and a reader knows what a score is about.",
      ko: "무엇을 측정하는지를, 제출자가 무엇을 고정해야 하는지 알고 독자가 점수의 대상이 무엇인지 알 만큼 정확하게 규정합니다.",
    },
    entries: [
      {
        id: "unit",
        badge: "current-rule",
        term: { en: "The evaluation unit", ko: "평가 단위" },
        detail: {
          en: "A complete versioned consumer-agent system snapshot. It includes the scaffold and orchestration, task-specific model routing, memory, APIs, tools, browser and app operation, permissions, localization, safety behaviour and recovery. It is never a base model.",
          ko: "버전이 고정된 완성 상태의 소비자 에이전트 시스템 스냅샷입니다. 스캐폴드와 오케스트레이션, 과제별 모델 라우팅, 메모리, API와 도구, 브라우저와 앱 조작, 권한, 현지화, 안전 동작, 복구를 포함합니다. 기반 모델이 아닙니다.",
        },
      },
      {
        id: "versioning",
        badge: "current-rule",
        term: { en: "Versioning obligation", ko: "버전 고정 의무" },
        detail: {
          en: "A snapshot is identified by a stated version and date. A system that changes mid-evaluation is a different snapshot, and results do not carry across.",
          ko: "스냅샷은 명시된 버전과 날짜로 식별됩니다. 평가 도중 변경된 시스템은 다른 스냅샷이며, 결과가 이어지지 않습니다.",
        },
      },
      {
        id: "not-a-model-score",
        badge: "external-evidence",
        term: { en: "Why not a model score", ko: "왜 모델 점수가 아닌가" },
        detail: {
          en: "Heterogeneous interactive benchmarks already show that per-environment behaviour diverges sharply for systems sharing a base model, which is why aggregation across unlike settings is avoided and the assembled system is the subject.",
          ko: "이질적인 대화형 벤치마크들은 같은 기반 모델을 쓰는 시스템들도 환경마다 크게 다르게 동작함을 이미 보여 줍니다. 성질이 다른 환경을 가로질러 합산하지 않고, 조립된 시스템을 대상으로 삼는 이유입니다.",
        },
        refs: ["agentbench", "helm"],
      },
      {
        id: "declared-composition",
        badge: "current-rule",
        term: { en: "Declared composition", ko: "선언된 구성" },
        detail: {
          en: "A submitted snapshot declares its orchestrator, the models it may route to, the tools it may call and its memory behaviour. An undeclared capability used during a run invalidates the run.",
          ko: "제출된 스냅샷은 오케스트레이터, 라우팅 가능한 모델, 호출 가능한 도구, 메모리 동작을 선언합니다. 선언하지 않은 기능을 실행 중에 사용하면 그 실행은 무효가 됩니다.",
        },
      },
    ],
  },
  {
    id: "lifecycle-status",
    title: { en: "Current benchmark lifecycle and status", ko: "현재 벤치마크 수명주기와 상태" },
    lead: {
      en: "Where the index actually stands. Every figure in this chapter is counted from the live records rather than written into the copy.",
      ko: "지수가 실제로 어디에 있는지를 밝힙니다. 이 장의 모든 수치는 문장에 적어 넣은 것이 아니라 살아 있는 기록에서 세어 온 값입니다.",
    },
    entries: [
      {
        id: "counts",
        badge: "current-rule",
        term: { en: "Scope in force", ko: "현재 적용되는 범위" },
        detail: {
          en: `${WIKI_FACTS.markets} markets, ${WIKI_FACTS.families} task families and ${WIKI_FACTS.canonicalTasks} canonical task definitions. That is the whole of the current scope.`,
          ko: `${WIKI_FACTS.markets}개 시장, ${WIKI_FACTS.families}개 과제 계열, ${WIKI_FACTS.canonicalTasks}개 표준 과제 정의입니다. 현재 범위는 이것이 전부입니다.`,
        },
      },
      {
        id: "no-results",
        badge: "current-rule",
        term: { en: "No measured results", ko: "측정된 결과 없음" },
        detail: {
          en: `${WIKI_FACTS.systems} systems are registered and ${WIKI_FACTS.runCells} run cells exist. Publication eligibility is ${String(WIKI_FACTS.publicationEligible)}. Nothing on this site describes how any system behaves.`,
          ko: `등록된 시스템은 ${WIKI_FACTS.systems}개, 실행 셀은 ${WIKI_FACTS.runCells}개입니다. 공개 적격 여부는 ${String(WIKI_FACTS.publicationEligible)}입니다. 이 사이트의 어떤 내용도 특정 시스템의 실제 동작을 설명하지 않습니다.`,
        },
      },
      {
        id: "catalogue-status",
        badge: "current-rule",
        term: { en: "Catalogue status", ko: "과제 목록 상태" },
        detail: {
          en: `All ${WIKI_FACTS.candidateTasks} public definitions are provisional candidates and ${WIKI_FACTS.validatedTasks} are validated. Canonical task text exists in ${WIKI_FACTS.taskTextLanguages.join(" and ")} only, which is translation support and not linguistic validation of every market.`,
          ko: `공개된 ${WIKI_FACTS.candidateTasks}개 정의는 모두 잠정 후보이며 검증된 것은 ${WIKI_FACTS.validatedTasks}개입니다. 표준 과제 본문은 ${WIKI_FACTS.taskTextLanguages.join(", ")}로만 존재하며, 이는 번역 지원일 뿐 모든 시장에 대한 언어적 검증이 아닙니다.`,
        },
      },
      {
        id: "not-reverse-engineered",
        badge: "mica-policy",
        term: { en: "Candidates are design material", ko: "후보는 설계 자료다" },
        detail: {
          en: "The published definitions exist so the method can be criticized before it produces a number. They must not be reverse-engineered into the final benchmark: future task authoring follows this methodology independently of them.",
          ko: "공개된 정의는 방법론이 숫자를 만들어 내기 전에 비판받도록 존재합니다. 이를 역설계해 최종 벤치마크로 삼아서는 안 되며, 앞으로의 과제 저작은 이 정의들과 독립적으로 이 방법론을 따릅니다.",
        },
      },
      {
        id: "fail-closed-gate",
        badge: "current-rule",
        term: { en: "Fail-closed publication", ko: "실패 시 차단되는 공개" },
        detail: {
          en: "Minimum sample size and minimum coverage are unset, and the gate refuses rather than assuming a value. Demo and preview data can never become publication eligible, which the schema layer enforces at build time.",
          ko: "최소 표본 수와 최소 커버리지가 정해지지 않았고, 관문은 값을 가정하는 대신 거부합니다. 데모와 프리뷰 데이터는 공개 적격이 될 수 없으며, 이는 스키마 계층이 빌드 시점에 강제합니다.",
        },
      },
    ],
  },
  {
    id: "implemented-vs-planned",
    title: { en: "What is implemented now, and what is planned", ko: "지금 구현된 것과 앞으로 계획된 것" },
    lead: {
      en: "A design intent stated confidently reads as a shipped capability. This chapter separates the two item by item, and nothing marked planned exists.",
      ko: "설계 의도를 자신 있게 서술하면 이미 구현된 기능처럼 읽힙니다. 이 장은 그 둘을 항목마다 분리하며, 계획으로 표시된 것은 존재하지 않습니다.",
    },
    entries: [],
  },
  {
    id: "task-authoring",
    title: { en: "Task authoring and market localization", ko: "과제 저작과 시장 현지화" },
    lead: {
      en: "How a task becomes a MICA task, and what makes it local rather than translated.",
      ko: "무엇이 MICA의 과제가 되는지, 그리고 무엇이 그것을 번역이 아니라 현지의 과제로 만드는지 설명합니다.",
    },
    entries: [
      {
        id: "orthogonal-fields",
        badge: "current-rule",
        term: { en: "Three orthogonal design fields", ko: "직교하는 세 가지 설계 항목" },
        detail: {
          en: "Every task declares an interaction surface, a termination or completion class, and a declared cognitive complexity. They vary independently, so difficulty cannot be smuggled in through the surface, and the catalogue can be balanced on each field separately.",
          ko: "모든 과제는 상호작용 표면, 종료 또는 완료 유형, 선언된 인지 복잡도를 명시합니다. 세 항목은 서로 독립적으로 변하므로 표면을 통해 난이도를 몰래 끼워 넣을 수 없고, 목록을 항목별로 따로 균형 잡을 수 있습니다.",
        },
      },
      {
        id: "local-authorship",
        badge: "mica-policy",
        term: { en: "Locally authored, locally reviewed", ko: "현지 저작, 현지 검토" },
        detail: {
          en: "A task is authored and reviewed by someone who uses the market's services. Translation of an English task is not localization, and a task that survives translation unchanged is usually testing nothing local.",
          ko: "과제는 해당 시장의 서비스를 실제로 사용하는 사람이 저작하고 검토합니다. 영어 과제를 번역하는 것은 현지화가 아니며, 번역해도 그대로인 과제는 대개 현지적인 것을 전혀 시험하지 않습니다.",
        },
        refs: ["m3exam", "blend", "data-statements"],
      },
      {
        id: "what-locality-covers",
        badge: "current-rule",
        term: { en: "What locality has to cover", ko: "현지성이 포괄해야 하는 것" },
        detail: {
          en: "Actual service and channel conventions, address and name formats, date, time and currency handling, language register and script, holidays, payment and identity rails, the points where a user must take over, and what makes a final state valid in that market.",
          ko: "실제 서비스와 채널 관행, 주소와 이름 형식, 날짜와 시간과 통화 처리, 언어의 화계와 문자, 공휴일, 결제와 본인확인 경로, 사용자가 이어받아야 하는 지점, 그리고 그 시장에서 최종 상태를 유효하게 만드는 조건입니다.",
        },
      },
      {
        id: "translation-limit",
        badge: "open-question",
        term: { en: "The current translation limit", ko: "현재 번역 지원의 한계" },
        detail: {
          en: `Canonical task text exists in ${WIKI_FACTS.taskTextLanguages.join(" and ")}. Reaching locally authored text and local review in every market edition is required before any market's results could be published, and it is not done.`,
          ko: `표준 과제 본문은 ${WIKI_FACTS.taskTextLanguages.join(", ")}로 존재합니다. 모든 시장 에디션에서 현지 저작 본문과 현지 검토에 도달하는 것은 그 시장의 결과를 공개하기 위한 선결 요건이며, 아직 이루어지지 않았습니다.`,
        },
      },
      {
        id: "documentation",
        badge: "external-evidence",
        term: { en: "Documentation per edition", ko: "에디션별 문서화" },
        detail: {
          en: "Each catalogue edition carries a datasheet-style record of motivation, composition, collection, intended uses, distribution and maintenance, plus a data-statement record of language variety and reviewer context at role level.",
          ko: "각 목록 에디션은 동기와 구성, 수집, 의도된 용도, 배포, 유지관리를 담은 데이터시트 형식의 기록과, 언어 변종 및 역할 수준의 검토자 맥락을 담은 데이터 스테이트먼트 기록을 함께 지닙니다.",
        },
        refs: ["datasheets", "data-statements"],
      },
      {
        id: "parameterization",
        badge: "external-evidence",
        term: { en: "Parameterized instances", ko: "매개변수화된 사례" },
        detail: {
          en: "One definition should yield many checkable instances rather than a single memorizable script, following parameterized-task practice from business and mobile agent environments.",
          ko: "정의 하나는 외울 수 있는 단일 시나리오가 아니라 검증 가능한 여러 사례를 만들어야 합니다. 업무·모바일 에이전트 환경의 매개변수화 과제 관행을 따릅니다.",
        },
        refs: ["workarena", "androidworld"],
      },
      {
        id: "unseen-generalization",
        badge: "current-rule",
        term: { en: "Generalization beyond known templates", ko: "알려진 템플릿 밖의 일반화" },
        detail: {
          en: "MICA reports performance on familiar task families separately from transfer to an unseen task family or unseen service. A system that succeeds only on parameter variants of known templates is not described as generally capable, and no aggregate may hide the transfer result.",
          ko: "MICA는 익숙한 과제 계열의 성능과 처음 보는 과제 계열 또는 처음 보는 서비스로의 전이 성능을 별도로 보고합니다. 알려진 템플릿의 매개변수 변형에서만 성공한 시스템을 일반적 역량이 있는 것으로 설명하지 않으며, 어떠한 집계도 전이 결과를 가릴 수 없습니다.",
        },
      },
    ],
  },
  {
    id: "access-parity",
    title: { en: "Access parity and market integration conditions", ko: "접근 동일 조건과 시장 연동 조건" },
    lead: {
      en: "If two systems face different starting conditions, the comparison measures the conditions. MICA fixes them, and declares what each market edition will require.",
      ko: "두 시스템이 서로 다른 출발 조건에 놓이면 그 비교는 조건을 측정합니다. MICA는 조건을 고정하고, 각 시장 에디션이 요구할 것을 선언합니다.",
    },
    entries: [
      {
        id: "parity-fixed",
        badge: "current-rule",
        term: { en: "What is fixed equally", ko: "동일하게 고정되는 것" },
        detail: {
          en: "The selected representative platforms, the account tier, the granted permissions, the initial state and the confirmation boundary are identical across systems for a given task version.",
          ko: "선택된 대표 플랫폼, 계정 등급, 부여된 권한, 초기 상태, 확인 경계는 특정 과제 버전에 대해 모든 시스템에서 동일합니다.",
        },
        refs: ["mlperf-inference"],
      },
      {
        id: "enclosure",
        badge: "current-rule",
        term: { en: "Enclosure is a condition, not a bonus", ko: "앱 폐쇄성은 조건이지 가산점이 아니다" },
        detail: {
          en: "App enclosure and identity handoff are controlled conditions of the environment. A system is not awarded extra credit for operating inside an enclosed channel, and is not excused for failing to.",
          ko: "앱 폐쇄성과 신원 인계는 환경의 통제된 조건입니다. 폐쇄된 채널 안에서 동작한다고 해서 가산점을 주지 않고, 그러지 못했다고 해서 면제해 주지도 않습니다.",
        },
      },
      {
        id: "platform-controlled-layer",
        badge: "external-evidence",
        term: {
          en: "Execution is platform-controlled, separately from whether an API exists",
          ko: "실행은 API 존재 여부와 별개로 플랫폼이 통제한다",
        },
        detail: {
          en: "Official platform documentation shows that discovery and read access is often credentialed but broadly documented, while state-changing execution is conditioned. Messaging, payment, account operations and mini-app execution can require a registered application or channel, OAuth or platform consent, reviewed scopes, a permitted recipient relationship, merchant or partner onboarding, a user gesture, a controlled runtime and a release review. None of that means a market has no APIs; it means the presence of an API does not establish that a consumer errand can be completed in production by a given system on a given date. MICA therefore records production executability as a separate fact from API existence, per market edition, and treats it as a condition of the environment rather than a property of a system.",
          ko: "공식 플랫폼 문서를 보면 탐색과 읽기 접근은 자격 증명이 필요하더라도 대체로 폭넓게 문서화되어 있는 반면, 상태를 바꾸는 실행에는 조건이 붙습니다. 메시징, 결제, 계정 기능, 미니앱 실행에는 등록된 애플리케이션이나 채널, OAuth 또는 플랫폼 동의, 심사를 거친 스코프, 허용된 수신자 관계, 가맹점이나 파트너 온보딩, 사용자 조작, 통제된 런타임, 배포 심사가 요구될 수 있습니다. 이는 어떤 시장에 API가 없다는 뜻이 아니며, API가 있다는 사실만으로 특정 시점에 특정 시스템이 소비자 과제를 운영 환경에서 완료할 수 있음이 성립하지는 않는다는 뜻입니다. 그래서 MICA는 운영 환경에서의 실행 가능성을 API 존재 여부와 분리된 사실로 시장 에디션마다 기록하고, 시스템의 속성이 아니라 환경의 조건으로 다룹니다.",
        },
        refs: [
          "kakao-app",
          "kakao-message",
          "line-channels",
          "line-messaging",
          "line-mini-app",
          "wechat-release",
          "grab-docs",
        ],
      },
      {
        id: "profiles",
        badge: "current-rule",
        term: { en: "Market integration profiles", ko: "시장 연동 프로필" },
        detail: {
          en: `Each of the ${WIKI_FACTS.markets} market editions declares at least ${WIKI_FACTS.integrationMinimums.situations} representative situations, spanning at least ${WIKI_FACTS.integrationMinimums.surfaces} surfaces, ${WIKI_FACTS.integrationMinimums.authorizations} authorization boundaries, ${WIKI_FACTS.integrationMinimums.completions} completion semantics, ${WIKI_FACTS.integrationMinimums.recoveries} recovery conditions and ${WIKI_FACTS.integrationMinimums.evidence} evidence types.`,
          ko: `${WIKI_FACTS.markets}개 시장 에디션은 각각 최소 ${WIKI_FACTS.integrationMinimums.situations}개의 대표 상황을 선언하며, 최소 ${WIKI_FACTS.integrationMinimums.surfaces}개 표면, ${WIKI_FACTS.integrationMinimums.authorizations}개 승인 경계, ${WIKI_FACTS.integrationMinimums.completions}개 완료 의미, ${WIKI_FACTS.integrationMinimums.recoveries}개 복구 조건, ${WIKI_FACTS.integrationMinimums.evidence}개 근거 유형을 포괄합니다.`,
        },
      },
      {
        id: "declared-not-exercised",
        badge: "current-rule",
        term: { en: "Declared, not exercised", ko: "선언되었을 뿐 수행되지 않음" },
        detail: {
          en: "A profile declares planned coverage. No situation has been exercised against a system, no vendor endpoint is named, and no market may be described as covered by evidence.",
          ko: "프로필은 계획된 커버리지를 선언합니다. 어떤 상황도 시스템을 대상으로 수행된 적이 없고, 공급자 엔드포인트를 명시하지 않으며, 어떤 시장도 근거로 커버되었다고 기술할 수 없습니다.",
        },
      },
      {
        id: "environment-fault",
        badge: "current-rule",
        term: { en: "Environment faults are not agent failures", ko: "환경 결함은 에이전트 실패가 아니다" },
        detail: {
          en: "An unreachable service, an evaluator defect or a broken starting state makes an attempt ineligible. It is discarded with a reason before scoring, never counted as a failure.",
          ko: "서비스에 접근할 수 없거나 평가기에 결함이 있거나 시작 상태가 깨진 경우 그 시도는 무효가 됩니다. 채점 전에 사유와 함께 제외하며, 실패로 세지 않습니다.",
        },
      },
    ],
  },
  {
    id: "completion-evidence",
    title: { en: "Completion, handoff, safety and final-state evaluation", ko: "완료와 인계, 안전, 최종 상태 평가" },
    lead: {
      en: "The hardest definitional problem in the method: deciding when an errand is actually done, in services that finish asynchronously and off the agent's own surface.",
      ko: "이 방법론에서 정의상 가장 어려운 문제입니다. 비동기 방식으로 에이전트의 자체 인터페이스 밖에서 완료되는 서비스에서 소비자 과제의 실제 완료 여부를 판정해야 합니다.",
    },
    entries: [
      {
        id: "final-state",
        badge: "current-rule",
        term: { en: "Final state, not transcript", ko: "기록이 아니라 최종 상태" },
        detail: {
          en: "Success is a declared final state that an evaluator can check, expressed as positive obligations the state must satisfy together with invariants and prohibited-state checks the run must not have violated.",
          ko: "성공은 평가기가 확인할 수 있는 선언된 최종 상태이며, 그 상태가 충족해야 할 의무와 함께 실행이 위반하지 않아야 할 불변 조건 및 금지 상태 점검으로 표현합니다.",
        },
        refs: ["swe-bench", "webarena", "osworld"],
      },
      {
        id: "correct-stop",
        badge: "current-rule",
        term: { en: "A correct stop can be completion", ko: "올바른 정지도 완료가 될 수 있다" },
        detail: {
          en: "Stopping and handing back at an OTP, a carrier identity check, a government identity check, a QR or device payment, or an account-holder approval is valid completion when the task contract declares that boundary as the completion point.",
          ko: "일회용 비밀번호, 통신사 본인확인, 정부 신원확인, QR 또는 기기 결제, 계정 소유자 승인 지점에서 멈추고 사용자에게 넘기는 것은, 과제 계약이 그 경계를 완료 지점으로 선언한 경우 유효한 완료입니다.",
        },
      },
      {
        id: "api-not-proof",
        badge: "current-rule",
        term: { en: "A successful call is not proof", ko: "성공한 호출은 증명이 아니다" },
        detail: {
          en: "For asynchronous or divergent-state journeys, an accepted API or tool response does not establish the final state. The run must produce an authoritative receipt, a post-action readback, or a handoff record.",
          ko: "비동기이거나 상태가 갈라지는 여정에서는 API나 도구가 응답을 수락했다는 사실만으로 최종 상태가 성립하지 않습니다. 실행은 권위 있는 확인 응답이나 행위 후 되읽기, 또는 인계 기록을 남겨야 합니다.",
        },
        refs: ["api-bank", "gaia", "tau-bench"],
      },
      {
        id: "retry-guard",
        badge: "current-rule",
        term: { en: "Non-idempotent retries are guarded", ko: "멱등하지 않은 재시도는 통제한다" },
        detail: {
          en: "Where a repeat could create a second order, a second booking or a second charge, the task contract requires an idempotency record. A duplicate created by a retry is a failure of the attempt, not a second chance at it.",
          ko: "반복이 두 번째 주문이나 예약, 결제를 만들 수 있는 경우 과제 계약은 멱등성 기록을 요구합니다. 재시도로 생긴 중복은 그 시도의 실패이며, 다시 얻은 기회가 아닙니다.",
        },
      },
      {
        id: "diagnostic-outcomes",
        badge: "current-rule",
        term: { en: "Five diagnostic outcomes, one binary factor", ko: "다섯 가지 진단 결과, 하나의 이진 인자" },
        detail: {
          en: "Every attempt is classified as confirmed success, unverified completion, partial progress, recoverable failure or critical failure. The classification explains the outcome; the accuracy factor still admits no partial credit.",
          ko: "모든 시도는 확인된 성공, 미검증 완료, 부분 진행, 복구 가능한 실패, 치명적 실패 중 하나로 분류합니다. 분류는 결과를 설명하며, 정확도 인자는 여전히 부분 점수를 인정하지 않습니다.",
        },
      },
      {
        id: "safety-block",
        badge: "current-rule",
        term: { en: "Critical safety blocks permanently", ko: "치명적 안전 사건은 영구 차단한다" },
        detail: {
          en: "A critical safety event permanently blocks publication of the cell it occurred in. The blocked cell is not dropped from aggregation: every family and market figure above it is withheld. There is no re-run that erases it and no appeal that removes it from the record.",
          ko: "치명적 안전 사건은 그것이 발생한 셀의 공개를 영구히 차단합니다. 차단된 셀을 집계에서 빼지 않고 그 위의 계열·시장 수치도 모두 비공표합니다. 그것을 지우는 재실행도, 기록에서 삭제하는 이의 절차도 없습니다.",
        },
      },
    ],
  },
  {
    id: "scoring",
    title: { en: "Per-task scoring and aggregation", ko: "과제별 채점과 집계" },
    lead: {
      en: "The three raw axes are the record. A product may be derived per eligible validated attempt for audit, but it is not a headline result or ranking key until references, repeat runs and uncertainty are calibrated in the pilot. The product is MICA's own normative choice.",
      ko: "세 축의 원값이 기록입니다. 유효하고 검증된 실행마다 감사용 곱을 파생할 수 있지만, 참조값·반복 실행·불확실성을 파일럿에서 보정하기 전에는 대표 결과나 순위 기준으로 쓰지 않습니다. 곱셈은 MICA 자신의 규범적 선택입니다.",
    },
    entries: [
      {
        id: "zero-veto",
        badge: "mica-policy",
        term: { en: "Zero veto", ko: "0의 거부권" },
        detail: {
          en: "Because accuracy is binary and the form is multiplicative, any outcome other than a confirmed success sends the whole product to zero. Speed and cost cannot compensate for not finishing, and that non-compensatory behaviour is deliberate.",
          ko: "정확도가 이진이고 형태가 곱셈이므로, 확인된 성공이 아닌 모든 결과는 곱 전체를 0으로 만듭니다. 속도와 비용은 완료하지 못한 것을 보상하지 못하며, 이 비보상적 성질은 의도된 것입니다.",
        },
        refs: ["oecd-jrc-composite"],
      },
      {
        id: "scaling-assumption",
        badge: "mica-policy",
        term: { en: "Scaling assumptions", ko: "척도 가정" },
        detail: {
          en: "Multiplying normalized components assumes the ratio scales are commensurable and that a proportional loss on one factor is worth the same as the equivalent loss on another. MICA has not established that this holds and does not present the product as a formal utility.",
          ko: "정규화된 성분을 곱하는 것은 비율 척도들이 서로 비교 가능하고, 한 인자의 비례적 손실이 다른 인자의 같은 비율 손실과 동등하다고 가정합니다. MICA는 이 가정이 성립함을 확립하지 않았고, 이 곱을 형식적 효용으로 제시하지도 않습니다.",
        },
        refs: ["keeney-raiffa", "fleming-wallace"],
      },
      {
        id: "not-endorsed",
        badge: "mica-policy",
        term: { en: "No external endorsement", ko: "외부의 승인 없음" },
        detail: {
          en: "No cited work derives or endorses this multiplication. The composite-indicator and multi-objective literature is cited here to state the conditions MICA has not met, not to lend the formula authority.",
          ko: "인용된 어떤 연구도 이 곱셈을 도출하거나 승인하지 않았습니다. 합성지표와 다목적 의사결정 문헌은 MICA가 충족하지 못한 조건을 밝히기 위해 인용한 것이지, 산식에 권위를 빌려주기 위한 것이 아닙니다.",
        },
        refs: ["oecd-jrc-composite", "keeney-raiffa", "fleming-wallace"],
      },
      {
        id: "sensitivity",
        badge: "current-rule",
        term: { en: "Sensitivity and audit requirement", ko: "민감도 분석과 감사 요건" },
        detail: {
          en: "No official figure may be published without a sensitivity analysis over the scoring policy, showing how a ranking moves under alternative normalizations and aggregations, and task-level results are published so the analysis can be redone independently.",
          ko: "채점 정책에 대한 민감도 분석 없이는 어떤 공식 수치도 공개할 수 없습니다. 대안적 정규화와 집계에서 순위가 어떻게 달라지는지 보여야 하며, 분석을 독립적으로 다시 할 수 있도록 과제 단위 결과를 공개합니다.",
        },
        refs: ["oecd-jrc-composite", "benchmark-lottery"],
      },
      {
        id: "metered-cost",
        badge: "current-rule",
        term: { en: "Zero cost is not a perfect score", ko: "비용 0은 만점이 아니다" },
        detail: {
          en: "The cost component requires a strictly positive metered evaluation cost. Zero or unmetered cost is recorded as not measured and receives no score; it is never treated as perfect efficiency.",
          ko: "비용 성분에는 0보다 큰 계측 평가 비용이 필요합니다. 비용이 0이거나 계측되지 않았으면 미측정으로 기록하고 점수를 주지 않으며, 완벽한 효율로 간주하지 않습니다.",
        },
      },
      {
        id: "macro-micro",
        badge: "external-evidence",
        term: { en: "Macro and micro weighting", ko: "매크로와 마이크로 가중" },
        detail: {
          en: "Averaging over tasks and averaging over markets are different weightings with different meanings. MICA applies the distinction explicitly at the family, market and cross-market level rather than letting a denominator decide it silently.",
          ko: "과제 단위로 평균하는 것과 시장 단위로 평균하는 것은 의미가 다른 서로 다른 가중입니다. MICA는 분모가 조용히 결정하게 두지 않고 계열, 시장, 시장 간 수준에서 이 구분을 명시적으로 적용합니다.",
        },
        refs: ["sokolova-lapalme"],
      },
    ],
  },
  {
    id: "model-routing",
    title: { en: "Model routing, memory and tool evidence", ko: "모델 라우팅과 메모리, 도구 근거" },
    lead: {
      en: "A system may use whichever models it judges best, including several within one attempt. What it may not do is decline to show what it used.",
      ko: "시스템은 가장 적합하다고 판단하는 모델을 자유롭게 사용할 수 있고, 한 번의 시도에서 여러 모델을 쓸 수도 있습니다. 다만 무엇을 사용했는지 밝히지 않는 것은 허용되지 않습니다.",
    },
    entries: [
      {
        id: "routing-is-the-system",
        badge: "current-rule",
        term: { en: "Routing is part of the evaluated system", ko: "라우팅은 평가 대상 시스템의 일부다" },
        detail: {
          en: "Choosing a model per task, and calling several models within one attempt, are legitimate design decisions that carry no penalty of their own. They are scored only through the accuracy, speed and evaluation cost the whole system delivered.",
          ko: "과제마다 모델을 고르는 것과 한 시도에서 여러 모델을 호출하는 것은 정당한 설계 결정이며 그 자체로 감점되지 않습니다. 시스템 전체가 낸 정확도와 속도와 평가 비용을 통해서만 점수에 반영됩니다.",
        },
      },
      {
        id: "invocation-evidence",
        badge: "current-rule",
        term: { en: "Required invocation evidence", ko: "필수 호출 근거" },
        detail: {
          en: "Every model invocation records provider, model, version, purpose, tokens, cost, latency and its order within the attempt. An attempt with an unaccounted invocation is not scored.",
          ko: "모든 모델 호출은 공급자, 모델, 버전, 목적, 토큰, 비용, 지연, 그리고 시도 안에서의 순서를 기록합니다. 설명되지 않은 호출이 있는 시도는 채점하지 않습니다.",
        },
        refs: ["bfcl", "api-bank"],
      },
      {
        id: "memory",
        badge: "current-rule",
        term: { en: "Memory is in scope", ko: "메모리는 평가 범위 안에 있다" },
        detail: {
          en: "Carrying persona facts, prior constraints and in-task state without re-asking the user or contradicting itself is part of the system under evaluation, and memory declared but not exercised is recorded as such.",
          ko: "사용자에게 다시 묻거나 스스로 모순되지 않으면서 페르소나 정보와 앞선 제약, 과제 중 상태를 이어 가는 것은 평가 대상 시스템의 일부입니다. 선언했지만 사용되지 않은 메모리도 그 사실을 기록합니다.",
        },
      },
      {
        id: "non-use",
        badge: "external-evidence",
        term: { en: "Correct non-use counts", ko: "올바르게 호출하지 않는 것도 평가된다" },
        detail: {
          en: "Deciding correctly that no tool is needed, or that a tool must not be called, is measurable behaviour and is recorded rather than ignored.",
          ko: "도구가 필요 없다고, 또는 도구를 호출해서는 안 된다고 올바르게 판단하는 것은 측정 가능한 행동이며, 무시하지 않고 기록합니다.",
        },
        refs: ["bfcl"],
      },
    ],
  },
  {
    id: "tracks-uncertainty",
    title: { en: "Tracks, reliability, uncertainty and missing data", ko: "트랙과 신뢰도, 불확실성, 결측 데이터" },
    lead: {
      en: "How a result would be produced, how confident anyone could be in it, and what MICA writes when there is nothing to write.",
      ko: "결과가 어떻게 만들어질 것인지, 그것을 얼마나 신뢰할 수 있는지, 그리고 쓸 것이 없을 때 MICA가 무엇을 적는지 설명합니다.",
    },
    entries: [
      {
        id: "tracks",
        badge: "current-rule",
        term: { en: "Three tracks", ko: "세 가지 트랙" },
        detail: {
          en: "Simulator runs against deterministic local replicas; live shadow runs stop at the confirmation boundary against real services; limited verified live covers a small number of end-to-end runs on MICA-held test accounts. All three are design intent, not an implemented harness.",
          ko: "시뮬레이터는 결정적인 현지 복제본을 대상으로 실행합니다. 라이브 섀도우는 실제 서비스를 대상으로 하되 확인 경계에서 멈춥니다. 제한적 실거래는 MICA가 보유한 시험 계정에서 소수의 종단 간 실행만을 다룹니다. 셋 모두 설계 의도이며 구현된 하니스가 아닙니다.",
        },
      },
      {
        id: "no-live",
        badge: "current-rule",
        term: { en: "No live integration exists", ko: "실서비스 연동은 존재하지 않는다" },
        detail: {
          en: "There is no vendor integration, no live account and no measured run on any track. The track vocabulary describes what a future run would be, not what has happened.",
          ko: "공급자 연동도, 실계정도, 어떤 트랙에서의 측정된 실행도 없습니다. 트랙 용어는 앞으로의 실행이 어떤 것일지를 설명할 뿐, 일어난 일을 설명하지 않습니다.",
        },
      },
      {
        id: "repeats",
        badge: "external-evidence",
        term: { en: "Repetition before comparison", ko: "비교에 앞선 반복" },
        detail: {
          en: "Single-run point estimates mislead, especially on small cells near 0 or 1. Repeated attempts, interval estimates and reliability across repeats are required before any comparison between systems is published.",
          ko: "단일 실행의 점 추정은 오해를 부르며, 값이 0이나 1에 가까운 작은 셀에서 특히 그렇습니다. 시스템 간 비교를 공개하기 전에 반복 시도와 구간 추정, 반복에 걸친 신뢰도가 필요합니다.",
        },
        refs: ["agarwal-statistical", "tau-bench"],
      },
      {
        id: "submission-attempt-control",
        badge: "current-rule",
        term: { en: "Submission and attempt control", ko: "제출과 시도 횟수 통제" },
        detail: {
          en: "The evaluation budget, number of attempts and publication rule are pre-registered for each system snapshot. Every eligible attempt is retained and reported; a submitter cannot repeat the same snapshot until a favorable run appears, cherry-pick the best score, or replace a declared snapshot after seeing holdout feedback.",
          ko: "평가 예산, 시도 횟수, 공개 규칙은 시스템 스냅샷별로 사전 등록합니다. 모든 적격 시도를 보존하고 보고하며, 제출자는 유리한 실행이 나올 때까지 같은 스냅샷을 반복 제출하거나 최고점만 선택하거나 홀드아웃 피드백을 본 뒤 선언한 스냅샷을 교체할 수 없습니다.",
        },
      },
      {
        id: "binary-hierarchical",
        badge: "open-question",
        term: { en: "Uncertainty for binary hierarchical outcomes", ko: "이진·계층 결과의 불확실성" },
        detail: {
          en: "MICA's outcomes are binary and nested inside task, family and market. Which interval and resampling procedure is correct for a product score over that structure is not settled, and the choice will be published with its justification before any interval appears.",
          ko: "MICA의 결과는 이진이며 과제, 계열, 시장 안에 중첩되어 있습니다. 그런 구조 위의 곱셈 점수에 어떤 구간 추정과 재표집 절차가 옳은지는 정해지지 않았으며, 어떤 구간이든 공개되기 전에 그 선택과 근거를 함께 밝힙니다.",
        },
        refs: ["agarwal-statistical"],
      },
      {
        id: "absence",
        badge: "current-rule",
        term: { en: "Absence is not zero", ko: "부재는 0이 아니다" },
        detail: {
          en: "A task that was not attempted, was not eligible, or has no pre-registered reference has no score and remains listed with a reason. If the pre-registered canonical task set is incomplete, the family and market aggregate is withheld rather than computed over a shrinking denominator. A missing market likewise withholds any cross-market figure.",
          ko: "시도되지 않았거나 유효하지 않거나 사전 등록된 기준값이 없는 과제에는 점수가 없으며 사유와 함께 목록에 남깁니다. 사전 등록한 canonical 과제 집합이 불완전하면 줄어든 분모로 평균을 내지 않고 계열·시장 집계를 비공표합니다. 시장이 빠져도 시장 간 수치를 보류합니다.",
        },
      },
      {
        id: "secondary-reporting",
        badge: "current-rule",
        term: { en: "Compatible secondary reporting", ko: "병행 가능한 보조 보고" },
        detail: {
          en: "MICA reports raw success rates, latency distributions and metered evaluation cost as the primary record, with reliability across repeats when available. The per-attempt product is a derived audit view of that record during the pilot, not a competing headline score.",
          ko: "MICA는 성공률 원값과 지연 분포, 계측된 평가 비용을 주 기록으로 보고하고 가능하면 반복 신뢰도를 함께 제공합니다. 실행별 곱셈값은 파일럿 동안 그 기록에서 파생한 감사용 보기이며, 경쟁하는 대표 점수가 아닙니다.",
        },
        refs: ["helm", "agarwal-statistical"],
      },
    ],
  },
  {
    id: "lineage-privacy",
    title: { en: "Evidence lineage, reproducibility and privacy", ko: "근거 계보와 재현성, 프라이버시" },
    lead: {
      en: "Every published figure must be walkable back to the thing that produced it, without publishing anything that identifies a person or exposes an account.",
      ko: "공개된 모든 수치는 그것을 만들어 낸 대상까지 되짚을 수 있어야 하며, 그 과정에서 개인을 식별하거나 계정을 노출하는 것은 공개하지 않습니다.",
    },
    entries: [
      {
        id: "chain",
        badge: "current-rule",
        term: { en: "The lineage chain", ko: "계보의 연결" },
        detail: {
          en: "Edition, then suite and task contract, then country and local situation, then system snapshot, then attempt or run, then model and tool calls, then evaluator evidence and final-state readback, then the aggregate. A figure that cannot be walked back along this chain is not published.",
          ko: "에디션, 과제 묶음과 계약, 국가와 현지 상황, 시스템 스냅샷, 시도 또는 실행, 모델과 도구 호출, 평가자 근거와 최종 상태 되읽기, 그리고 집계로 이어집니다. 이 연결을 따라 되짚을 수 없는 수치는 공개하지 않습니다.",
        },
      },
      {
        id: "redaction",
        badge: "current-rule",
        term: { en: "Redacted public traces", ko: "비식별 처리한 공개 기록" },
        detail: {
          en: "Public traces are redacted. Originals are retained under access control, so an independent reviewer can be given the unredacted record without it becoming a public artifact.",
          ko: "공개되는 기록은 비식별 처리합니다. 원본은 접근 통제 아래 보관하므로, 독립 검토자에게 비식별 처리 이전의 기록을 제공하면서도 그것이 공개 산출물이 되지 않게 할 수 있습니다.",
        },
        refs: ["pineau-reproducibility"],
      },
      {
        id: "personas",
        badge: "current-rule",
        term: { en: "Synthetic personas only", ko: "합성 페르소나만 사용" },
        detail: {
          en: "Runs use synthetic personas and MICA-held test accounts. No irreversible action is ever performed against an account belonging to a real person.",
          ko: "실행에는 합성 페르소나와 MICA가 보유한 시험 계정만 사용합니다. 실존 인물의 계정을 대상으로 되돌릴 수 없는 행위를 수행하는 일은 없습니다.",
        },
      },
      {
        id: "checklist",
        badge: "external-evidence",
        term: { en: "Reproducibility record", ko: "재현성 기록" },
        detail: {
          en: "Each published result carries what was run, on which snapshot, how many times, under which track and conditions, and what was reported, following established reproducibility reporting practice.",
          ko: "공개하는 각 결과는 무엇을 어떤 스냅샷 위에서 몇 번, 어떤 트랙과 조건으로 실행했고 무엇을 보고했는지를 함께 지닙니다. 확립된 재현성 보고 관행을 따릅니다.",
        },
        refs: ["pineau-reproducibility", "helm"],
      },
      {
        id: "derived-not-stored",
        badge: "current-rule",
        term: { en: "Scores are derived, not stored", ko: "점수는 저장되지 않고 도출된다" },
        detail: {
          en: "The raw outcome, latency and evaluation cost are the record. Any score is computed from them on request, so a published figure cannot drift away from the evidence it claims to summarize.",
          ko: "원래의 결과와 지연, 평가 비용이 곧 기록입니다. 점수는 요청 시 그로부터 계산하므로, 공개된 수치가 자신이 요약한다고 주장하는 근거와 어긋날 수 없습니다.",
        },
      },
    ],
  },
  {
    id: "public-set-holdout",
    title: { en: "Public set, holdout, contamination and maintenance", ko: "공개 세트와 홀드아웃, 오염, 유지관리" },
    lead: {
      en: "A benchmark that is fully public becomes a training target. One that is fully private cannot be criticized. MICA keeps both halves and states which is which.",
      ko: "완전히 공개된 벤치마크는 학습 표적이 됩니다. 완전히 비공개인 벤치마크는 비판받을 수 없습니다. MICA는 두 부분을 모두 유지하고 어느 쪽이 어느 쪽인지 밝힙니다.",
    },
    entries: [
      {
        id: "separation",
        badge: "current-rule",
        term: { en: "Separated sets", ko: "분리된 세트" },
        detail: {
          en: "Public candidates and the private holdout are separate sets, and the separation is enforced at export time rather than trusted to editorial care. A holdout item is never reachable from a public artifact.",
          ko: "공개 후보와 비공개 홀드아웃은 서로 다른 세트이며, 분리는 편집상의 주의에 맡기지 않고 내보내기 시점에 강제합니다. 홀드아웃 항목은 공개 산출물에서 접근할 수 없습니다.",
        },
      },
      {
        id: "provenance",
        badge: "current-rule",
        term: { en: "Item provenance", ko: "항목 출처" },
        detail: {
          en: "Each item records when it was created, when and where it was exposed, its version and its provenance, so exposure can be reasoned about instead of guessed at.",
          ko: "각 항목은 생성 시점, 노출 시점과 경로, 버전, 출처를 기록합니다. 그래야 노출을 추측이 아니라 추론의 대상으로 다룰 수 있습니다.",
        },
        refs: ["magar-schwartz", "gpt3-contamination"],
      },
      {
        id: "core-and-rotation",
        badge: "current-rule",
        term: { en: "Stable core, rotating challenge", ko: "안정적 코어와 순환 난제" },
        detail: {
          en: "The intended shape is a stable longitudinal core that supports comparison over time, plus a rotating challenge and holdout portion that limits how long exposure stays valuable. It is a design, and it is labelled planned until it is implemented.",
          ko: "의도한 형태는 시간에 걸친 비교를 지탱하는 안정적 장기 코어에, 노출의 가치가 유지되는 기간을 제한하는 순환 난제와 홀드아웃을 더한 구조입니다. 이는 설계이며, 구현되기 전까지 계획으로 표시합니다.",
        },
        refs: ["livebench", "dynabench", "gaia"],
      },
      {
        id: "no-clean-claim",
        badge: "current-rule",
        term: { en: "No claim of contamination freedom", ko: "오염 없음을 주장하지 않는다" },
        detail: {
          en: "MICA will not claim a set is uncontaminated. It controls exposure, records provenance, refreshes items and reports residual risk, and distinguishes exposure from memorization and from score exploitation.",
          ko: "MICA는 어떤 세트가 오염되지 않았다고 주장하지 않습니다. 노출을 통제하고 출처를 기록하며 항목을 갱신하고 잔여 위험을 보고하고, 노출과 암기와 점수 악용을 구분합니다.",
        },
        refs: ["magar-schwartz", "livebench", "gpt3-contamination"],
      },
      {
        id: "contamination-classification",
        badge: "current-rule",
        term: { en: "Contamination is classified, not reduced to a label", ko: "오염 상태의 구분" },
        detail: {
          en: "Every item and result records separately whether there is evidence of exposure, memorization, or score exploitation. Exposure alone does not prove memorization, and memorization alone does not establish score exploitation; unknown status remains unknown rather than being reported as clean.",
          ko: "각 항목과 결과에는 노출, 암기, 점수 악용의 근거 여부를 구분해 기록합니다. 노출만으로 암기를 입증하지 않고, 암기만으로 점수 악용이 성립한다고 보지 않으며, 상태를 알 수 없으면 청정하다고 보고하지 않고 미확인으로 유지합니다.",
        },
      },
      {
        id: "clean-subset-comparison",
        badge: "current-rule",
        term: { en: "Clean-subset comparison", ko: "청정 부분집합 비교" },
        detail: {
          en: "When exposure risk differs across items, MICA publishes the full result beside a clean-subset result restricted to items with no known exposure evidence. A material gap is reported as a limitation and blocks claims of broad generalization; the subset is never selected after inspecting which choice favors a system.",
          ko: "항목별 노출 위험이 다르면 전체 결과와 함께 알려진 노출 근거가 없는 항목으로 제한한 청정 부분집합 결과를 공개합니다. 두 결과의 유의미한 차이는 한계로 보고하며 광범위한 일반화 주장을 차단합니다. 부분집합은 어느 선택이 특정 시스템에 유리한지 확인한 뒤 선택하지 않습니다.",
        },
      },
      {
        id: "suite-dependence",
        badge: "open-question",
        term: { en: "Suite dependence", ko: "평가 묶음 의존성" },
        detail: {
          en: "Which tasks are in the suite changes which system looks best. MICA publishes task-level results and requires sensitivity analysis, but how to choose a suite that is not itself a hidden preference is unresolved.",
          ko: "어떤 과제가 묶음에 들어가는지에 따라 어떤 시스템이 가장 좋아 보이는지가 달라집니다. MICA는 과제 단위 결과를 공개하고 민감도 분석을 요구하지만, 그 자체로 숨은 선호가 되지 않는 묶음을 어떻게 고를지는 미해결입니다.",
        },
        refs: ["benchmark-lottery"],
      },
    ],
  },
  {
    id: "governance",
    title: { en: "Governance, independence and disclosure", ko: "거버넌스와 독립성, 공시" },
    lead: {
      en: "An index that measures systems whose makers can fund it has to say who decides what, and where that separation is not yet real.",
      ko: "평가 대상의 제작자가 자금을 댈 수 있는 지수라면, 누가 무엇을 결정하는지와 그 분리가 아직 실질적이지 않은 지점을 밝혀야 합니다.",
    },
    entries: [
      {
        id: "neutrality",
        badge: "current-rule",
        term: { en: "Neutrality requirement", ko: "중립성 요건" },
        detail: {
          en: "MICA must be neutral. vooy may be an originator and may be measured as a challenger system, and holds no privileged position as benchmark owner in the normative public design.",
          ko: "MICA는 중립이어야 합니다. vooy는 발의자일 수 있고 도전 시스템으로 측정될 수 있으나, 규범적 공개 설계에서 벤치마크 소유자로서의 특권적 지위를 갖지 않습니다.",
        },
      },
      {
        id: "disclosure",
        badge: "current-rule",
        term: { en: "What must be disclosed", ko: "공시해야 하는 것" },
        detail: {
          en: "The operator, who holds decision rights, funding and its terms, paid task-author relationships, vendor relationships, conflicts of interest, the publication process, and the corrections and appeals procedure.",
          ko: "운영 주체, 결정 권한 보유자, 자금과 그 조건, 유상 과제 저작 관계, 공급자 관계, 이해충돌, 공개 절차, 그리고 정정과 이의 절차입니다.",
        },
        refs: ["nist-ai-rmf"],
      },
      {
        id: "role-level-conflicts",
        badge: "current-rule",
        term: { en: "Role-level conflicts and holdout access", ko: "역할별 이해관계와 홀드아웃 접근" },
        detail: {
          en: "Before results are published, MICA discloses the task author, reviewer, evaluator and funder roles, each role's financial or organizational relationship to evaluated parties, and every person's holdout access. A person with a material conflict or unauthorized holdout access is excluded from scoring and publication decisions for the affected system.",
          ko: "결과 공개 전에 과제 저작자, 검토자, 평가자, 자금 제공자의 역할과 평가 대상과의 재정적·조직적 관계, 각 개인의 홀드아웃 접근 여부를 공개합니다. 중대한 이해관계가 있거나 승인되지 않은 홀드아웃 접근 이력이 있는 사람은 해당 시스템의 채점과 공개 결정에서 배제합니다.",
        },
      },
      {
        id: "structural-transition",
        badge: "open-question",
        term: { en: "Structural independence", ko: "구조적 독립성" },
        detail: {
          en: "Decision rights over method changes, verification outcomes and publication must rest with a body no evaluated party controls. No such body has been constituted, so this is an open risk and not a solved claim.",
          ko: "방법론 변경과 검증 결과, 공개에 대한 결정 권한은 어떤 평가 대상도 통제하지 않는 기구에 있어야 합니다. 그런 기구는 구성된 적이 없으므로, 이는 해결된 주장이 아니라 미해결 위험입니다.",
        },
      },
      {
        id: "no-paid-placement",
        badge: "current-rule",
        term: { en: "No paid placement", ko: "유상 게재 없음" },
        detail: {
          en: "MICA does not accept payment for placement, for inclusion, or for the timing of a result, and does not accept a submitter's own score or weighting in place of a measurement.",
          ko: "MICA는 게재나 포함, 결과 공개 시점에 대한 대가를 받지 않으며, 측정 대신 제출자가 제시한 점수나 가중치를 받아들이지 않습니다.",
        },
      },
    ],
  },
  {
    id: "amendments",
    title: { en: "How to challenge or amend the method", ko: "방법론에 이의를 제기하거나 개정하는 방법" },
    lead: {
      en: "This wiki is written to be argued with. A challenge that names a section and carries evidence is the fastest way to change what MICA does.",
      ko: "이 위키는 반박당하기 위해 쓰였습니다. 절을 지목하고 근거를 갖춘 이의 제기가 MICA의 방식을 바꾸는 가장 빠른 길입니다.",
    },
    entries: [],
  },
  {
    id: "limitations",
    title: { en: "Limitations and open research questions", ko: "한계와 미해결 연구 질문" },
    lead: {
      en: "The parts of the method MICA does not consider settled. A benchmark that hides these is advertising.",
      ko: "MICA가 아직 정리되었다고 보지 않는 부분입니다. 이런 항목을 감추는 벤치마크는 광고입니다.",
    },
    entries: [
      {
        id: "product-justification",
        badge: "open-question",
        term: { en: "Is the product the right form", ko: "곱셈이 옳은 형태인가" },
        detail: {
          en: "The multiplicative form is a policy choice with strong non-compensatory consequences. Whether a different aggregation would better reflect what a buyer values is genuinely open, and the sensitivity requirement exists so the question stays answerable.",
          ko: "곱셈 형태는 강한 비보상적 결과를 낳는 정책적 선택입니다. 다른 집계 방식이 구매자가 중시하는 바를 더 잘 반영할지는 실제로 열려 있는 질문이며, 그 질문이 계속 답할 수 있는 상태로 남도록 민감도 분석을 요건으로 둡니다.",
        },
        refs: ["oecd-jrc-composite", "keeney-raiffa"],
      },
      {
        id: "priority-claim-limit",
        badge: "open-question",
        term: { en: "The limit of the priority claim", ko: "최초 주장의 한계" },
        detail: {
          en: "Worldwide priority cannot be proven. A finite literature review establishes what MICA found, not what exists, so the world-first claim is dated to its 8 August 2026 cutoff, scoped to a stated conjunction of conditions, and open to challenge through the amendment process on the same evidence terms as any other claim here. If a prior public initiative meeting the complete conjunction is identified, the claim is revised or withdrawn rather than defended.",
          ko: "세계 최초라는 사실은 증명할 수 없습니다. 유한한 문헌 검토는 MICA가 무엇을 찾았는지를 보여 줄 뿐 무엇이 존재하는지를 보여 주지 않습니다. 그래서 이 주장은 2026년 8월 8일 검토 기준일에 묶여 있고, 명시된 조건 결합으로 범위가 한정되며, 이 위키의 다른 주장과 같은 근거 요건 아래 개정 절차로 반박할 수 있습니다. 그 조건 결합을 모두 충족하는 선행 공개 이니셔티브가 확인되면, 이 주장은 방어하는 대신 수정하거나 철회합니다.",
        },
        refs: ["webarena", "webvoyager", "webshop", "androidworld", "appworld", "tau-bench"],
      },
      {
        id: "reference-setting",
        badge: "open-question",
        term: { en: "How references should be set", ko: "기준값을 어떻게 정할 것인가" },
        detail: {
          en: "Speed and cost references are pre-registered per task version and never re-derived from the cohort being scored. How to set them so they are demanding but attainable, without anchoring on any one system, is unresolved.",
          ko: "속도와 비용 기준값은 과제 버전마다 사전 등록하며 채점 대상 집단에서 다시 도출하지 않습니다. 특정 시스템에 정박하지 않으면서도 도전적이되 달성 가능하게 정하는 방법은 미해결입니다.",
        },
      },
      {
        id: "simulator-transfer",
        badge: "open-question",
        term: { en: "Does simulator behaviour transfer", ko: "시뮬레이터의 결과는 전이되는가" },
        detail: {
          en: "Deterministic replicas are reproducible but synthetic, and live services change under the runner. How much simulator performance predicts live performance is exactly what the shadow track is meant to test, and it has not been tested.",
          ko: "결정적 복제본은 재현 가능하지만 합성이며, 실서비스는 실행 도중에도 변합니다. 시뮬레이터 성능이 실서비스 성능을 얼마나 예측하는지는 섀도우 트랙이 시험하려는 바로 그 질문이며, 아직 시험되지 않았습니다.",
        },
      },
      {
        id: "coverage-unevenness",
        badge: "open-question",
        term: { en: "Uneven market coverage", ko: "고르지 않은 시장 커버리지" },
        detail: {
          en: "Markets differ in how much of a journey is reachable at all. A cross-market figure computed over unevenly reachable markets may compare accessibility rather than capability, and MICA withholds such figures rather than estimating them.",
          ko: "시장마다 여정의 어느 만큼에 도달할 수 있는지가 다릅니다. 도달 가능성이 고르지 않은 시장들 위에서 계산한 시장 간 수치는 역량이 아니라 접근성을 비교하는 것일 수 있으므로, MICA는 추정하는 대신 그런 수치를 보류합니다.",
        },
      },
      {
        id: "locality-depth",
        badge: "open-question",
        term: { en: "How deep locality must go", ko: "현지성은 얼마나 깊어야 하는가" },
        detail: {
          en: "A country is not homogeneous, and a task assumes a region, a channel and a register. How finely a market edition must be stratified before it is fair to call a result a result for that market is not settled.",
          ko: "한 국가는 균질하지 않으며, 과제는 특정 지역과 채널과 화계를 전제합니다. 어떤 결과를 그 시장의 결과라고 부르기 위해 시장 에디션을 얼마나 세밀하게 층화해야 하는지는 정해지지 않았습니다.",
        },
        refs: ["blend", "mega"],
      },
      {
        id: "cost-volatility",
        badge: "open-question",
        term: { en: "Cost moves independently of behaviour", ko: "비용은 동작과 무관하게 변한다" },
        detail: {
          en: "Evaluation cost depends on provider pricing on the snapshot date, which moves for reasons that have nothing to do with the system. Physical usage quantities and dated price schedules are preserved so cost can be recomputed, but the volatility is real.",
          ko: "평가 비용은 스냅샷 시점의 공급자 가격에 좌우되며, 그 가격은 시스템과 무관한 이유로 변합니다. 비용을 다시 계산할 수 있도록 물리적 사용량과 날짜가 붙은 가격표를 보존하지만, 변동성 자체는 실재합니다.",
        },
      },
    ],
  },
  {
    id: "policy-register",
    title: { en: "Current policy register", ko: "현재 정책 등록부" },
    lead: {
      en: "The current statements MICA is prepared to be held to. Every line is present tense: this register is not a log, and it records no earlier value.",
      ko: "MICA가 책임지겠다고 밝히는 현재의 진술입니다. 모든 줄이 현재형이며, 이 등록부는 이력이 아니고 이전 값을 기록하지 않습니다.",
    },
    entries: [],
  },
  {
    id: "research-references",
    title: { en: "Research references by methodological contribution", ko: "방법론 기여별 연구 레퍼런스" },
    lead: {
      en: "Grouped by what MICA takes from each, with what it deliberately does not take. Citation is not endorsement: no work listed here has reviewed or approved MICA.",
      ko: "각 연구에서 무엇을 가져왔고 무엇을 의도적으로 가져오지 않았는지에 따라 묶었습니다. 인용은 승인이 아니며, 여기 실린 어떤 연구도 MICA를 검토하거나 승인한 바 없습니다.",
    },
    entries: [],
  },
  {
    id: "publication-references",
    title: { en: "Publication and interface references", ko: "공개 방식과 인터페이스 레퍼런스" },
    lead: {
      en: "Product and editorial influences on how MICA publishes. They are kept separate from the scientific precedents because an interface convention is not evidence about measurement.",
      ko: "MICA가 결과를 공개하는 방식에 영향을 준 제품·편집 사례입니다. 인터페이스 관행은 측정에 관한 근거가 아니므로 과학적 선행 연구와 분리해 둡니다.",
    },
    entries: [],
  },
  {
    id: "glossary",
    title: { en: "Glossary", ko: "용어" },
    lead: {
      en: "The terms this wiki uses in a specific sense. Where a word could mean two things, this is the one MICA means.",
      ko: "이 위키가 특정한 뜻으로 사용하는 용어입니다. 한 단어가 두 가지를 뜻할 수 있는 경우, MICA가 뜻하는 것은 여기 적힌 쪽입니다.",
    },
    entries: [],
  },
];

/** Chapters that render a generic entry list; the rest have bespoke bodies. */
export const WIKI_CHAPTER_IDS = WIKI_CHAPTERS.map((chapter) => chapter.id);

/* -------------------------------------------------------------- validation */

const bilingualSchema = z.object({
  en: z.string().min(1),
  /** House rule: Korean copy never uses the long dash. */
  ko: z.string().min(1).refine((value) => !value.includes("—"), {
    message: "Korean copy must not contain the long dash character",
  }),
});

const badgeIds = WIKI_BADGES.map((badge) => badge.id) as [BadgeId, ...BadgeId[]];

const entrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  badge: z.enum(badgeIds),
  term: bilingualSchema,
  detail: bilingualSchema,
  refs: z.array(z.string()).optional(),
});

const chapterSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  title: bilingualSchema,
  lead: bilingualSchema,
  entries: z.array(entrySchema),
});

const primaryReferenceSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  group: z.enum(
    REFERENCE_GROUPS.map((group) => group.id) as [
      ReferenceGroupId,
      ...ReferenceGroupId[],
    ],
  ),
  name: z.string().min(1),
  title: z.string().min(1),
  venue: z.string().min(1),
  url: z.string().url().startsWith("https://"),
  borrowed: bilingualSchema,
  notAdopted: bilingualSchema,
});

const editorialReferenceSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().startsWith("https://"),
  influence: bilingualSchema,
});

function assertUniqueIds(ids: readonly string[], what: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`${what}: duplicate id "${id}"`);
    seen.add(id);
  }
}

/**
 * Structural validation runs at module load, so a malformed record fails the
 * build rather than shipping a broken wiki or a dead citation.
 */
z.array(chapterSchema).parse(WIKI_CHAPTERS);
z.array(primaryReferenceSchema).parse(PRIMARY_REFERENCES);
z.array(editorialReferenceSchema).parse(EDITORIAL_REFERENCES);
z.array(z.object({ id: z.string(), term: bilingualSchema, rule: bilingualSchema })).parse(
  POLICY_REGISTER,
);
z.array(
  z.object({
    id: z.string(),
    state: z.enum(["implemented", "planned"]),
    label: bilingualSchema,
    detail: bilingualSchema,
  }),
).parse(STATUS_MATRIX);
z.array(z.object({ id: z.string(), term: bilingualSchema, definition: bilingualSchema })).parse(
  GLOSSARY,
);
z.array(
  z.object({
    id: z.string(),
    term: bilingualSchema,
    detail: bilingualSchema,
    href: z.string().startsWith("/").optional(),
  }),
).parse(AMENDMENT_STEPS);

assertUniqueIds(WIKI_CHAPTER_IDS, "wiki chapters");
assertUniqueIds(
  PRIMARY_REFERENCES.map((reference) => reference.id),
  "primary references",
);
assertUniqueIds(
  EDITORIAL_REFERENCES.map((reference) => reference.id),
  "editorial references",
);
assertUniqueIds(
  PRIMARY_REFERENCES.map((reference) => reference.url),
  "primary reference urls",
);

const referenceIds = new Set<string>([
  ...PRIMARY_REFERENCES.map((reference) => reference.id),
  ...EDITORIAL_REFERENCES.map((reference) => reference.id),
]);
for (const chapter of WIKI_CHAPTERS) {
  assertUniqueIds(
    chapter.entries.map((entry) => entry.id),
    `entries of chapter "${chapter.id}"`,
  );
  for (const entry of chapter.entries) {
    for (const ref of entry.refs ?? []) {
      if (!referenceIds.has(ref)) {
        throw new Error(
          `wiki entry "${chapter.id}/${entry.id}" cites unknown reference "${ref}"`,
        );
      }
    }
  }
}

export const REFERENCE_COUNT =
  PRIMARY_REFERENCES.length + EDITORIAL_REFERENCES.length;

export function primaryReferencesInGroup(
  group: ReferenceGroupId,
): readonly PrimaryReference[] {
  return PRIMARY_REFERENCES.filter((reference) => reference.group === group);
}

export function referenceById(id: string): PrimaryReference | EditorialReference | undefined {
  return (
    PRIMARY_REFERENCES.find((reference) => reference.id === id) ??
    EDITORIAL_REFERENCES.find((reference) => reference.id === id)
  );
}

export function badgeById(id: BadgeId) {
  const badge = WIKI_BADGES.find((candidate) => candidate.id === id);
  if (!badge) throw new Error(`unknown wiki badge "${id}"`);
  return badge;
}
