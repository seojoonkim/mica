import {
  systemSchema,
  assertDemoInvariants,
  type SystemRecord,
} from "@/lib/schema";
import { z } from "zod";

/**
 * The system registry.
 *
 * A MICA entry is always a complete, versioned consumer-agent system — an
 * orchestrator, the models it routes to, its tools and its memory — never a
 * base model on its own.
 *
 * The registry is empty, and that is the honest state of the index: MICA has
 * published no verified system results. Illustrative entries used to sit here
 * during interface development; they have been removed rather than relabelled,
 * because a plausible-looking name beside a plausible-looking number is exactly
 * the thing a benchmark must never ship. Entries appear here only once a real
 * snapshot has been submitted, run and verified.
 */
const raw: unknown[] = [];

/** Demo invariants are applied before the records are exported. */
export const SYSTEMS: readonly SystemRecord[] = assertDemoInvariants(
  z.array(systemSchema).parse(
    raw.map((record) => ({
      ...(record as object),
      dataStatus: "demo",
      publicationEligible: false,
    })),
  ),
  (record) => `system "${record.slug}"`,
);

export const SYSTEM_BY_SLUG: ReadonlyMap<string, SystemRecord> = new Map(
  SYSTEMS.map((system) => [system.slug, system]),
);

export function getSystem(slug: string): SystemRecord | undefined {
  return SYSTEM_BY_SLUG.get(slug);
}

export function systemName(slug: string): string {
  return SYSTEM_BY_SLUG.get(slug)?.name ?? slug;
}
