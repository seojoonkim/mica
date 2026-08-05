import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEM_BY_SLUG } from "@/data/demo/systems";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { evaluatePublicationEligibility } from "@/lib/calc";
import type { RunCell, SystemRecord, TaskFamilyId } from "@/lib/schema";

/**
 * The evaluation taxonomy and the published results are two different things,
 * and the interface has to say so. Ten families are defined; a family counts as
 * published only when a verified run cell exists for it, which today is none of
 * them. Both counts are read from the fixtures, so neither can be overstated by
 * a typo in copy.
 */
export function isPublishedResult(
  cell: RunCell,
  system: SystemRecord | undefined,
): boolean {
  if (!system) return false;
  if (cell.dataStatus !== "official" || system.dataStatus !== "official") return false;
  if (!cell.publicationEligible || !system.publicationEligible) return false;
  if (system.verification !== "independent-rerun") return false;

  return evaluatePublicationEligibility({
    dataStatus: cell.dataStatus,
    verification: system.verification,
    eligibleRuns: cell.eligibleRuns,
    tasksAttempted: cell.tasksAttempted,
    tasksDefined: cell.tasksDefined,
    criticalSafetyEvents: cell.criticalSafetyEvents,
  }).eligible;
}

export function publishedResultFamilyIds(): TaskFamilyId[] {
  const published = new Set(
    RUN_CELLS.filter((cell) =>
      isPublishedResult(cell, SYSTEM_BY_SLUG.get(cell.system)),
    ).map((cell) => cell.family),
  );
  return TASK_FAMILIES.map((family) => family.id).filter((id) => published.has(id));
}

export function hasPublishedResults(id: TaskFamilyId): boolean {
  return publishedResultFamilyIds().includes(id);
}

export function evaluationFamilyCount(): number {
  return TASK_FAMILIES.length;
}
