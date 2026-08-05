import {
  systemSchema,
  assertDemoInvariants,
  type SystemRecord,
} from "@/lib/schema";
import { z } from "zod";

/**
 * Demo system snapshots.
 *
 * A MICA entry is always a complete, versioned consumer-agent system — an
 * orchestrator, the models it routes to, its tools and its memory — never a
 * base model on its own. Two entries here deliberately share a base model to
 * make that point legible.
 */
const raw: unknown[] = [
  {
    slug: "atlas-concierge",
    name: "Atlas Concierge",
    operator: "Demo Operator A",
    snapshotVersion: "2026.07-rc3",
    snapshotDate: "2026-07-14",
    composition: {
      orchestrator: "Plan-then-execute with a bounded repair loop (max 3 repairs)",
      models: ["frontier-class reasoning model", "small classifier for routing"],
      tools: [
        "headless browser with a supervised action allowlist",
        "market-specific address normaliser",
        "calendar and mail adapters",
      ],
      memory: "Persona store plus per-task scratchpad, cleared between runs",
    },
    summary:
      "A conservative orchestrator that stops early and often. Its accuracy comes from refusing ambiguous steps rather than from stronger reasoning, which shows up as careful behaviour at the confirmation boundary against modest speed.",
    verification: "independent-rerun",
    track: "simulator",
  },
  {
    slug: "meridian-agent",
    name: "Meridian Agent",
    operator: "Demo Operator B",
    snapshotVersion: "4.2.1",
    snapshotDate: "2026-06-28",
    composition: {
      orchestrator: "Single-loop ReAct with unbounded retries under a time budget",
      models: ["frontier-class reasoning model"],
      tools: ["headless browser", "generic HTTP tool", "calendar adapter"],
      memory: "Conversation transcript only",
    },
    summary:
      "Shares a base model with Atlas Concierge but no routing layer and no address normalisation. The gap between the two is the clearest illustrative demonstration in this preview that orchestration, not the model, carries the outcome.",
    verification: "independent-rerun",
    track: "simulator",
  },
  {
    slug: "hangang-assistant",
    name: "Hangang Assistant",
    operator: "Demo Operator C",
    snapshotVersion: "0.9.4",
    snapshotDate: "2026-07-02",
    composition: {
      orchestrator: "Market-specialised planner with per-market playbooks",
      models: [
        "mid-tier reasoning model",
        "locale-tuned drafting model",
        "small extraction model",
      ],
      tools: [
        "super-app adapters (supervised)",
        "domestic address normaliser",
        "mail adapter",
      ],
      memory: "Persistent persona profile with market preferences",
    },
    summary:
      "Deep coverage in two markets and thin coverage elsewhere. Included to show how the index reports partial coverage without averaging the gaps away.",
    verification: "provisional",
    track: "live-shadow",
  },
  {
    slug: "kaiyo-orchestrator",
    name: "Kaiyō Orchestrator",
    operator: "Demo Operator D",
    snapshotVersion: "2026.05",
    snapshotDate: "2026-05-19",
    composition: {
      orchestrator: "Graph executor with explicit form-field contracts",
      models: ["mid-tier reasoning model", "vision model for form capture"],
      tools: [
        "form-filling adapter with per-market field maps",
        "postal-code service",
        "calendar adapter",
      ],
      memory: "Typed persona record with per-market field variants",
    },
    summary:
      "Built around form correctness rather than conversation. Strong where a task fails on a field and weaker where it fails on judgement.",
    verification: "independent-rerun",
    track: "live-shadow",
  },
  {
    slug: "swift-errand",
    name: "Swift Errand",
    operator: "Demo Operator E",
    snapshotVersion: "1.1.0",
    snapshotDate: "2026-07-21",
    composition: {
      orchestrator: "Latency-optimised single pass, no repair loop",
      models: ["small fast model"],
      tools: ["aggregator APIs only"],
      memory: "None between steps",
    },
    summary:
      "The fastest and cheapest entry, and the least accurate. Present to demonstrate why MICA reports Accuracy, Speed and Cost separately: collapsing them would rank this system somewhere it does not belong.",
    verification: "self-reported",
    track: "simulator",
  },
  {
    slug: "nanyang-copilot",
    name: "Nanyang Copilot",
    operator: "Demo Operator F",
    snapshotVersion: "3.0.0-beta.2",
    snapshotDate: "2026-06-11",
    composition: {
      orchestrator: "Hierarchical planner with a critic pass before confirmation",
      models: ["frontier-class reasoning model", "mid-tier executor model"],
      tools: [
        "browser with allowlist",
        "payments-rail selector",
        "fee reconciliation checker",
      ],
      memory: "Persona store with held-instrument records",
    },
    summary:
      "A critic pass before the confirmation boundary catches late fee changes and wrong payment rails. Costs time; buys accuracy.",
    verification: "independent-rerun",
    track: "verified-live",
  },
];

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
