import { COUNTRIES } from "@/data/demo/countries";
import { PUBLIC_TASK_FAMILIES } from "@/data/demo/tasks";

export const EVALUATION_MODES = [
  "country-focused",
  "task-focused",
  "custom",
  "full-benchmark",
] as const;

export type EvaluationMode = (typeof EVALUATION_MODES)[number];

export type EvaluationScope = {
  mode: EvaluationMode;
  countries: string[];
  tasks: string[];
  valid: boolean;
};

export type EvaluationScopeInput = {
  mode?: string;
  countries?: readonly string[];
  tasks?: readonly string[];
};

const COUNTRY_IDS = COUNTRIES.map((country) => country.code);
const TASK_IDS = PUBLIC_TASK_FAMILIES.flatMap((family) =>
  family.canonicalTasks.map((task) => task.id),
);
const TASK_MARKETS = new Map(
  PUBLIC_TASK_FAMILIES.flatMap((family) =>
    family.canonicalTasks.map((task) => [task.id, new Set<string>(task.markets)] as const),
  ),
);

function canonicalSelection(values: readonly string[] | undefined, canonical: readonly string[]) {
  const selected = new Set(values ?? []);
  return canonical.filter((id) => selected.has(id));
}

/**
 * Parses untrusted planner input against public catalogues only. Unknown values
 * disappear, duplicates collapse, and output follows fixture order.
 */
export function parseEvaluationScope(input: EvaluationScopeInput): EvaluationScope {
  const mode = EVALUATION_MODES.includes(input.mode as EvaluationMode)
    ? (input.mode as EvaluationMode)
    : "custom";
  const selectedCountries = canonicalSelection(input.countries, COUNTRY_IDS);
  const selectedTasks = canonicalSelection(input.tasks, TASK_IDS);

  if (mode === "full-benchmark") {
    return { mode, countries: [...COUNTRY_IDS], tasks: [...TASK_IDS], valid: true };
  }
  if (mode === "country-focused") {
    return {
      mode,
      countries: selectedCountries,
      tasks: [...TASK_IDS],
      valid: selectedCountries.length > 0,
    };
  }
  if (mode === "task-focused") {
    return {
      mode,
      countries: [...COUNTRY_IDS],
      tasks: selectedTasks,
      valid: selectedTasks.length > 0,
    };
  }
  return {
    mode,
    countries: selectedCountries,
    tasks: selectedTasks,
    valid: selectedCountries.length > 0 && selectedTasks.length > 0,
  };
}

export type ScopeSummary = {
  planned: number;
  executionEligible: number;
  executed: number;
  failed: number;
  harnessFailed: number;
  notApplicable: number;
};

/**
 * Eligibility means the selected task declares the selected market. It does not
 * mean a run is queued or executable by this website. Published aggregate
 * results remain outside this scope planner so they cannot be mistaken for jobs.
 */
export function summarizeEvaluationScope(scope: EvaluationScope): ScopeSummary {
  const planned = scope.valid ? scope.countries.length * scope.tasks.length : 0;
  const executionEligible = scope.valid
    ? scope.tasks.reduce(
        (count, task) =>
          count + scope.countries.filter((country) => TASK_MARKETS.get(task)?.has(country)).length,
        0,
      )
    : 0;
  return {
    planned,
    executionEligible,
    executed: 0,
    failed: 0,
    harnessFailed: 0,
    notApplicable: planned - executionEligible,
  };
}

export const PUBLIC_EVALUATION_COUNTRIES = COUNTRY_IDS;
export const PUBLIC_EVALUATION_TASKS = TASK_IDS;
