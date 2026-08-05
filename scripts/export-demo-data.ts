import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { COUNTRIES } from "../src/data/demo/countries";
import { TASK_FAMILIES, HERO_MISSIONS } from "../src/data/demo/tasks";
import { SYSTEMS } from "../src/data/demo/systems";
import { RUN_CELLS } from "../src/data/demo/runs";

const outputDir = join(process.cwd(), "public", "data", "demo");
mkdirSync(outputDir, { recursive: true });

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

writeFileSync(
  join(outputDir, "mica-demo.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
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
writeFileSync(join(outputDir, "mica-demo.csv"), `${csv}\n`, "utf8");

console.log(`Exported ${RUN_CELLS.length} run cells to ${outputDir}`);
