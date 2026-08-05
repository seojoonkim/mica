import { RUN_CELLS } from "@/data/demo/runs";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import type { TaskFamilyId } from "@/lib/schema";

/**
 * The evaluation taxonomy and the seeded demo results are two different things,
 * and the interface has to say so. Ten families are defined; only the families
 * that actually appear in a run cell carry demo results. Both counts are read
 * from the fixtures so neither can be overstated by a typo in copy.
 */
export function seededFamilyIds(): TaskFamilyId[] {
  const seeded = new Set(RUN_CELLS.map((cell) => cell.family));
  return TASK_FAMILIES.map((family) => family.id).filter((id) => seeded.has(id));
}

export function isSeededFamily(id: TaskFamilyId): boolean {
  return seededFamilyIds().includes(id);
}

export function evaluationFamilyCount(): number {
  return TASK_FAMILIES.length;
}
