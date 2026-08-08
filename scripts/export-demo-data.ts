import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  COUNTRIES,
  MARKET_INTEGRATION_AUDIT,
} from "../src/data/demo/countries";
import {
  PUBLIC_TASK_FAMILIES,
  TASK_CATALOGUE_STATUS,
  HERO_MISSIONS,
} from "../src/data/demo/tasks";
import {
  assertNoHoldoutTasks,
  INTEGRATION_COVERAGE_MINIMUMS,
} from "../src/lib/schema";
import { SYSTEMS } from "../src/data/demo/systems";
import { RUN_CELLS } from "../src/data/demo/runs";
import { PROJECT_STATE } from "../src/data/project-state";
import { buildMethodologyMarkdown } from "../src/data/methodology/markdown";
import { resolveExportRoot } from "./export-path";

const exportRoot = resolveExportRoot(import.meta.url, process.env.MICA_EXPORT_ROOT);
const outputDir = join(exportRoot, "public", "data", "demo");
mkdirSync(outputDir, { recursive: true });

function writeAtomic(path: string, content: string) {
  const temporaryPath = `${path}.tmp-${process.pid}`;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporaryPath, "w");
    writeFileSync(descriptor, content, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporaryPath, path);
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temporaryPath);
    } catch {
      // Preserve the original write/rename error.
    }
    throw error;
  }
}

// Last line of defence before anything is written: the payload is built from
// the already-filtered public catalogue, and re-checked here so a leak fails
// the export rather than reaching a published file.
assertNoHoldoutTasks(PUBLIC_TASK_FAMILIES, "demo export payload");

const payload = {
  notice: "Illustrative demo data. Not an official ranking.",
  dataStatus: "demo",
  publicationEligible: false,
  taskCatalogue: {
    /**
     * Honest readiness metadata travels with the data, so a consumer of the
     * export cannot mistake drafted definitions for a settled benchmark set.
     */
    lifecycle: "provisional-public-candidates",
    taskSet: "public",
    holdoutIncluded: false,
    publicTasks: TASK_CATALOGUE_STATUS.publicTasks,
    candidateTasks: TASK_CATALOGUE_STATUS.candidateTasks,
    validatedTasks: TASK_CATALOGUE_STATUS.validatedTasks,
    promotionFields: TASK_CATALOGUE_STATUS.promotionFields,
    taskTextLanguages: TASK_CATALOGUE_STATUS.taskTextLanguages,
    note: "Task definitions are provisional public-set candidates. None has been validated, exercised against a system, or holdout-assigned. Task text exists in English and Korean only.",
  },
  marketIntegration: {
    /**
     * The declared market integration profile travels with the export, with its
     * own status attached, so a consumer cannot read a coverage plan as a
     * record of systems having been run against these conditions.
     */
    status: "declared-not-exercised",
    minimums: INTEGRATION_COVERAGE_MINIMUMS,
    coverage: MARKET_INTEGRATION_AUDIT,
    note: "Representative local execution conditions declared per market edition. Nothing here has been exercised against a system, and no vendor endpoint or third-party server is named.",
  },
  countries: COUNTRIES,
  taskFamilies: PUBLIC_TASK_FAMILIES,
  heroMissions: HERO_MISSIONS,
  systems: SYSTEMS,
  runCells: RUN_CELLS,
};

writeAtomic(
  join(outputDir, "mica-demo.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);

// Flat scalar columns only. Attempt artifact manifests are structured records,
// so the JSON export stays canonical for them rather than collapsing a manifest
// into an ambiguous CSV cell.
const headers = [
  "system",
  "country",
  "family",
  "eligibleRuns",
  "successfulRuns",
  "tasksAttempted",
  "tasksDefined",
  "totalEligibleCostUsd",
  "criticalSafetyEvents",
  "dataStatus",
  "publicationEligible",
];
const csv = [
  `# Illustrative demo data. Not an official ranking.`,
  headers.join(","),
  ...RUN_CELLS.map((cell) =>
    headers
      .map((header) => JSON.stringify(cell[header as keyof typeof cell] ?? ""))
      .join(","),
  ),
].join("\n");
writeAtomic(join(outputDir, "mica-demo.csv"), `${csv}\n`);

writeAtomic(
  join(exportRoot, "project-state.json"),
  `${JSON.stringify(PROJECT_STATE, null, 2)}\n`,
);

// The methodology pack is generated from the same canonical wiki records the
// /methodology page renders, so the download cannot drift from the page.
const methodologyDir = join(exportRoot, "public", "methodology");
mkdirSync(methodologyDir, { recursive: true });
writeAtomic(
  join(methodologyDir, "mica-methodology-and-references.md"),
  buildMethodologyMarkdown(),
);

console.log(
  `Exported ${RUN_CELLS.length} run cells, the methodology pack and project state to ${outputDir}`,
);
