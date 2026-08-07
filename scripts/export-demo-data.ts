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
import { COUNTRIES } from "../src/data/demo/countries";
import { TASK_FAMILIES, HERO_MISSIONS } from "../src/data/demo/tasks";
import { SYSTEMS } from "../src/data/demo/systems";
import { RUN_CELLS } from "../src/data/demo/runs";
import { PROJECT_STATE } from "../src/data/project-state";
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

const payload = {
  notice: "Illustrative demo data. Not an official ranking.",
  dataStatus: "demo",
  publicationEligible: false,
  countries: COUNTRIES,
  taskFamilies: TASK_FAMILIES,
  heroMissions: HERO_MISSIONS,
  systems: SYSTEMS,
  runCells: RUN_CELLS,
};

writeAtomic(
  join(outputDir, "mica-demo.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);

const headers = [
  "system",
  "country",
  "family",
  "eligibleRuns",
  "successfulRuns",
  "tasksAttempted",
  "tasksDefined",
  "totalEligibleCost",
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

console.log(
  `Exported ${RUN_CELLS.length} run cells and project state to ${outputDir}`,
);
