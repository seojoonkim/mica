import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRIES } from "../src/data/demo/countries";
import { TASK_FAMILIES, HERO_MISSIONS } from "../src/data/demo/tasks";
import { SYSTEMS } from "../src/data/demo/systems";
import { RUN_CELLS } from "../src/data/demo/runs";
import { PROJECT_STATE } from "../src/data/project-state";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const exportRoot = process.env.MICA_EXPORT_ROOT
  ? resolve(process.env.MICA_EXPORT_ROOT)
  : repositoryRoot;
const outputDir = join(exportRoot, "public", "data", "demo");
mkdirSync(outputDir, { recursive: true });

function writeAtomic(path: string, content: string) {
  const temporaryPath = `${path}.tmp-${process.pid}`;
  writeFileSync(temporaryPath, content, "utf8");
  renameSync(temporaryPath, path);
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
