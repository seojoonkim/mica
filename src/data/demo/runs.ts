import { runCellSchema, assertDemoInvariants, type RunCell } from "@/lib/schema";
import { z } from "zod";

/**
 * Canonical run cells — one aggregate per system × market × task family.
 *
 * There are none. MICA has measured nothing it can publish, so the array is
 * empty rather than filled with a seeded generator's output. The generator, the
 * per-system performance profiles and the market difficulty factors that once
 * produced this fixture have been deleted; keeping them would have left a
 * one-line switch between an empty index and an invented one.
 *
 * The schema and the demo invariants still run over the array, so the shape and
 * the publication guard stay under test even while the array is empty.
 */
const raw: unknown[] = [];

export const RUN_CELLS: readonly RunCell[] = assertDemoInvariants(
  z.array(runCellSchema).parse(raw),
  (cell) => `run cell ${cell.system}/${cell.country}/${cell.family}`,
);
