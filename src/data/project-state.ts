import { COUNTRIES } from "@/data/demo/countries";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_CATALOGUE_STATUS, TASK_FAMILIES } from "@/data/demo/tasks";
import { areResultsPublicationEligible } from "@/lib/calc";

const taskCount = TASK_FAMILIES.reduce(
  (count, family) => count + family.canonicalTasks.length,
  0,
);
const publicationEligible = areResultsPublicationEligible(SYSTEMS, RUN_CELLS);
const hasMeasuredResults = SYSTEMS.length > 0 && RUN_CELLS.length > 0;
const resultSummary = hasMeasuredResults
  ? "Measured results exist but remain subject to publication eligibility."
  : "It has no measured or publishable benchmark results yet.";
const resultRisk = hasMeasuredResults
  ? "Measured results must not be presented unless the publication policy marks every published cell eligible"
  : "No registered systems or run cells exist, so the site must not imply measured performance";

export const PROJECT_STATE = {
  schemaVersion: 1,
  slug: "mica",
  status:
    "Phase 0 public preview complete; Phase 1 executable benchmark contract and harness not implemented",
  summary: `MICA is a deployed bilingual public preview and canonical task catalogue for evaluating complete consumer-agent systems across localized everyday tasks. ${resultSummary}`,
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
    `Task lifecycle: ${TASK_CATALOGUE_STATUS.candidateTasks} provisional public-set candidates, ${TASK_CATALOGUE_STATUS.validatedTasks} validated`,
    `Canonical task text languages: ${TASK_CATALOGUE_STATUS.taskTextLanguages.join(", ")} only`,
    `${SYSTEMS.length} registered systems`,
    `${RUN_CELLS.length} run cells`,
    `Official publication eligibility: ${publicationEligible}`,
    "Per-task final score is 100 x normalized Accuracy x Speed x Cost; family and country scores are arithmetic means of eligible task scores, and raw Accuracy, Speed, and Cost stay separately disclosed",
    "No task carries a pre-registered speed/cost reference or a score yet, so no score has ever been computed or published",
  ],
  next: [
    "Write Benchmark Contract v0.1 for an initial country and task-family slice",
    "Implement a resettable simulator, run recorder, deterministic evaluator, and cost/latency ledger",
    "Run a controlled pilot before setting publication thresholds",
    "Connect micabench.com after the benchmark contract and metadata base are ready",
  ],
  risks: [
    `The current ${taskCount} tasks are provisional public-set candidate definitions, not validated or executable benchmark scenarios`,
    "Promotion from candidate to validated requires orthogonal metadata (surface, terminationClass, declaredComplexity, diagnosticAxes, differentiated market applicability) that is not yet authored",
    "Governance independence, decision control, and funding disclosure remain unresolved open requirements",
    resultRisk,
    "Publication thresholds remain unset and official publication must stay fail-closed",
    "Live orders and reservations require sandbox or partner-controlled inventory",
  ],
  evidence: [
    "project-state.json generated from canonical TypeScript data by pnpm export:data",
    "public/data/demo/mica-demo.json generated from the same canonical sources",
  ],
} as const;
