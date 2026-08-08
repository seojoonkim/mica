# MICA Task Measurement and Copy Tightening Implementation Plan

> **For Hermes:** Execute this plan task-by-task with controller-owned RED/GREEN checks and exact `claude-opus-5` bounded edit packs.

**Goal:** Make all 100 public task candidates auditable for numerical accuracy, speed, and cost measurement while shortening site-wide copy and rewriting Korean into natural prose.

**Architecture:** Extend the canonical task schema with a per-task measurement contract. Accuracy is binary and evidence-gated; speed is wall-clock time between declared events; cost is model plus tool/API execution spend in USD, excluding transaction value. Candidate tasks may carry calibration-pending references, but only pre-registered validated references can produce normalized scores. Render the contract in each task disclosure and keep all result/publication gates fail-closed.

**Tech Stack:** Next.js 15, TypeScript, Zod, Vitest, Playwright, exact `claude-opus-5` monitored print-mode editing.

---

### Task 1: Freeze the measurement contract with failing tests

**Files:**
- Modify: `tests/task-catalogue.test.ts`
- Modify: `tests/score.test.ts` only if score behavior needs a new fail-closed assertion

**Steps:**
1. Add tests requiring every canonical task to expose a versioned measurement contract.
2. Require 2–8 unique evidence-backed accuracy checks and binary all-required-pass scoring.
3. Require explicit wall-clock start/stop events and a positive timeout.
4. Require USD model + tool/API cost scope and exclusion of transaction value.
5. Require scoring references to remain calibration-pending on all current candidates.
6. Run the focused test and observe the expected failure because the schema/data do not yet provide the contract.

### Task 2: Implement the schema contract

**Files:**
- Modify: `src/lib/schema.ts`

**Steps:**
1. Add Zod schemas and types for accuracy checks, timing measurement, cost measurement, and reference readiness.
2. Add cross-field checks that reject duplicate criteria, invalid start/stop pairs, and references inconsistent with their status.
3. Add the contract to canonical task records.
4. Keep normalized scoring fail-closed until both references are pre-registered.
5. Run the focused tests; schema-only work should still fail because the 100 records are not populated.

### Task 3: Populate all 100 task contracts with exact Opus 5

**Files:**
- Modify: `src/data/demo/tasks.ts`

**Steps:**
1. Give exact `claude-opus-5` only the canonical task module and schema contract.
2. Add task-specific accuracy checks grounded in each declared final state and confirmation boundary.
3. Add an observable stop event and bounded timeout appropriate to each task.
4. Use one common cost-accounting contract without inventing transaction costs.
5. Mark references calibration-pending with no fabricated target values.
6. Run the focused test and confirm GREEN.

### Task 4: Render the measurement contract

**Files:**
- Modify: `src/app/[lang]/tasks/page.tsx`
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/lib/i18n/ko.ts`

**Steps:**
1. Show accuracy checks, timing boundary, timeout, cost scope, and calibration state inside each task disclosure.
2. State clearly that raw accuracy/speed/cost are measurable now but normalized scores remain unavailable until references are registered.
3. Add DOM tests or Playwright assertions for the rendered contract.

### Task 5: Tighten global copy and naturalize Korean

**Files:**
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/lib/i18n/ko.ts`

**Steps:**
1. Shorten hero and public-page titles; move scope details into one supporting sentence.
2. Remove repeated explanations and redundant clauses.
3. Rewrite Korean sentence structure idiomatically rather than translating English syntax.
4. Remove avoidable English UI fragments while retaining proper nouns, formulas, IDs, file formats, and necessary technical labels.
5. Preserve the scoped world-first claim, prior-benchmark acknowledgements, publication status, and zero-result truth.

### Task 6: Verify and release

**Files:**
- Modify only files needed to resolve verified failures.

**Steps:**
1. Run focused tests, full Vitest, lint, strict TypeScript, and a clean production build sequentially where `.next` is shared.
2. Run EN/KO responsive QA at 390 and 1280 pixels and inspect title wrapping and task contracts.
3. Freeze the complete diff with SHA-256 and `# END OF PACK` marker.
4. Run exact `claude-opus-5` final review; resolve every blocker and important finding.
5. Commit, push `main`, deploy Vercel production, and verify canonical live pages and data counts.
