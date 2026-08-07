import { COUNTRIES } from "@/data/demo/countries";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { areResultsPublicationEligible } from "@/lib/calc";

const taskCount = TASK_FAMILIES.reduce(
  (count, family) => count + family.canonicalTasks.length,
  0,
);
const publicationEligible = areResultsPublicationEligible(SYSTEMS, RUN_CELLS);

export const PROJECT_STATE = {
  schemaVersion: 1,
  slug: "mica",
  status:
    "Phase 0 public preview complete; Phase 1 executable benchmark contract and harness not implemented",
  summary:
    "MICA is a deployed bilingual public preview and canonical task catalogue for evaluating complete consumer-agent systems across localized everyday tasks. It has no measured or publishable benchmark results yet.",
  // Machine-local checkout and private planning paths belong to the external
  // catchup registry, not this public and portable implementation contract.
  paths: [],
  urls: [
    "https://mica-eta.vercel.app",
    "https://github.com/seojoonkim/mica",
  ],
  state: [
    `${COUNTRIES.length} benchmark markets`,
    `${TASK_FAMILIES.length} task families`,
    `${taskCount} canonical tasks`,
    `${SYSTEMS.length} registered systems`,
    `${RUN_CELLS.length} run cells`,
    `Official publication eligibility: ${publicationEligible}`,
    "Accuracy, Speed, and Cost are published separately; MICA has no official composite score",
  ],
  next: [
    "Write Benchmark Contract v0.1 for an initial country and task-family slice",
    "Implement a resettable simulator, run recorder, deterministic evaluator, and cost/latency ledger",
    "Run a controlled pilot before setting publication thresholds",
    "Connect micabench.com after the benchmark contract and metadata base are ready",
  ],
  risks: [
    "The current 100 tasks are catalogue definitions, not executable benchmark scenarios",
    "No registered systems or run cells exist, so the site must not imply measured performance",
    "Publication thresholds remain unset and official publication must stay fail-closed",
    "Live orders and reservations require sandbox or partner-controlled inventory",
  ],
  evidence: [
    "project-state.json generated from canonical TypeScript data by pnpm export:data",
    "public/data/demo/mica-demo.json generated from the same canonical sources",
  ],
} as const;
