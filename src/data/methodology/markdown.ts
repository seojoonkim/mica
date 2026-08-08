import {
  AMENDMENT_STEPS,
  EDITORIAL_REFERENCES,
  GLOSSARY,
  POLICY_REGISTER,

  REFERENCE_COUNT,
  REFERENCE_GROUPS,
  STATUS_MATRIX,
  WIKI_BADGES,
  WIKI_CHAPTERS,
  WIKI_FACTS,
  badgeById,
  primaryReferencesInGroup,
} from "@/data/methodology/wiki";
import { DIAGNOSTIC_AXES, OUTCOME_AXES } from "@/data/policy/axes";
import {
  EVIDENCE_LABELS,
  PUBLICATION_RULES,
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
} from "@/data/policy/publication";
import type { Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dictionary";

/**
 * The agent-readable Markdown pack, built from the same canonical records the
 * `/methodology` page renders. Nothing is retyped here, so the download cannot
 * describe a method the site does not publish.
 *
 * The body is English; the current policy register is restated in Korean at the
 * end, because that register is the part a Korean reader most needs verbatim.
 *
 * It carries no private names, no internal dates, no deliberation history and
 * no measured figure. Every count comes from `WIKI_FACTS`.
 */

const HEADING = "MICA — Methodology & References";

function line(...parts: string[]): string {
  return parts.join("");
}

function chapterById(id: string) {
  const chapter = WIKI_CHAPTERS.find((candidate) => candidate.id === id);
  if (!chapter) throw new Error(`unknown wiki chapter "${id}"`);
  return chapter;
}

/** Chapters whose bodies are generated from a dedicated record set. */
const BESPOKE = new Set([
  "implemented-vs-planned",
  "policy-register",
  "research-references",
  "publication-references",
  "glossary",
  "amendments",
]);

function bespokeBody(id: string): string[] {
  switch (id) {
    case "implemented-vs-planned":
      return [
        ...STATUS_MATRIX.filter((item) => item.state === "implemented").map(
          (item) => line("- **Implemented — ", item.label.en, "** ", item.detail.en),
        ),
        "",
        ...STATUS_MATRIX.filter((item) => item.state === "planned").map((item) =>
          line("- **Planned — ", item.label.en, "** ", item.detail.en),
        ),
      ];
    case "policy-register":
      return POLICY_REGISTER.map((entry) =>
        line("- **", entry.term.en, ".** ", entry.rule.en),
      );
    case "amendments":
      return AMENDMENT_STEPS.map((step) =>
        line(
          "- **",
          step.term.en,
          ".** ",
          step.detail.en,
          step.href ? ` (see \`${step.href}\`)` : "",
        ),
      );
    case "research-references":
      return REFERENCE_GROUPS.flatMap((group) => [
        `### ${group.label.en}`,
        "",
        group.lead.en,
        "",
        ...primaryReferencesInGroup(group.id).flatMap((reference) => [
          `- [${reference.name}](${reference.url}) — ${reference.title}. ${reference.venue}.`,
          `  - Borrowed: ${reference.borrowed.en}`,
          `  - Not adopted: ${reference.notAdopted.en}`,
        ]),
        "",
      ]);
    case "publication-references":
      return EDITORIAL_REFERENCES.map((reference) =>
        line(
          "- [",
          reference.name,
          "](",
          reference.url,
          ") — ",
          reference.title,
          ". ",
          reference.influence.en,
        ),
      );
    case "glossary":
      return GLOSSARY.map((entry) =>
        line("- **", entry.term.en, ".** ", entry.definition.en),
      );
    default:
      return [];
  }
}

type MarkdownItem = { term: string; detail: string };

function operationalSections(lang: Locale): Array<{ title: string; items: MarkdownItem[] }> {
  const dict = getDict(lang);
  return [
    {
      title: dict.methodology.publicationTitle,
      items: [
        { term: dict.methodology.minRunsTerm, detail: PUBLICATION_RULES.minEligibleRuns === null ? dict.methodology.minRunsUnset : `${PUBLICATION_RULES.minEligibleRuns} ${dict.methodology.minRunsSuffix}` },
        { term: dict.methodology.minCoverageTerm, detail: PUBLICATION_RULES.minCoverage === null ? dict.methodology.minCoverageUnset : `${(PUBLICATION_RULES.minCoverage * 100).toFixed(0)}% ${dict.methodology.minCoverageSuffix}` },
        { term: dict.methodology.thresholdsTerm, detail: dict.thresholdsNotSet },
        { term: dict.methodology.safetyTerm, detail: PUBLICATION_RULES.criticalSafetyBlocks ? dict.methodology.safetyBlocks : dict.methodology.safetyNonBlocking },
        { term: dict.methodology.verificationTerm, detail: dict.methodology.verificationDetail },
        { term: dict.methodology.dataStatusTerm, detail: dict.methodology.dataStatusDetail },
      ],
    },
    {
      title: dict.methodology.axesTitle,
      items: OUTCOME_AXES.map((axis) => ({ term: `${dict.outcomeAxes[axis.id].label} · ${dict.outcomeAxes[axis.id].unit}`, detail: dict.outcomeAxes[axis.id].description })),
    },
    {
      title: dict.methodology.scoringTitle,
      items: [
        { term: dict.methodology.scoringFormulaLabel, detail: `${dict.methodology.scoringFormula} ${dict.methodology.scoringFormulaNote}` },
        ...dict.methodology.scoringComponents,
        { term: dict.methodology.scoringAggregationTerm, detail: dict.methodology.scoringAggregationDetail },
        { term: dict.methodology.scoringOverallTerm, detail: dict.methodology.scoringOverallDetail },
        { term: dict.methodology.scoringExclusionTerm, detail: dict.methodology.scoringExclusionDetail },
        { term: dict.methodology.scoringRawTerm, detail: dict.methodology.scoringRawDetail },
        { term: dict.methodology.scoringCostTerm, detail: dict.methodology.scoringCostDetail },
        { term: dict.methodology.scoringStatusTerm, detail: dict.methodology.scoringStatusDetail },
      ],
    },
    {
      title: dict.methodology.countingTitle,
      items: [
        { term: dict.methodology.eligibleRunTerm, detail: dict.methodology.countingEligible },
        { term: dict.methodology.accuracyTerm, detail: dict.methodology.countingAccuracy },
        { term: dict.methodology.speedTerm, detail: dict.methodology.countingSpeed },
        { term: dict.methodology.costTerm, detail: `${dict.methodology.countingCostPrefix}${dict.missing.noSuccess}${dict.methodology.countingCostSuffix}` },
        { term: dict.methodology.macroTerm, detail: `${dict.methodology.countingMacroPrefix}${dict.methodology.countingMacroSuffix}` },
      ],
    },
    { title: dict.methodology.routingTitle, items: [...dict.methodology.routingItems] },
    {
      title: dict.methodology.diagnosticsTitle,
      items: DIAGNOSTIC_AXES.map((axis) => ({ term: dict.diagnosticAxes[axis.id].label, detail: dict.diagnosticAxes[axis.id].description })),
    },
    {
      title: dict.methodology.evidenceTitle,
      items: [
        ...VERIFICATION_STATUSES.map((status) => ({ term: `${dict.verification[status.id].label} · ${dict.verification[status.id].short}`, detail: `${dict.verification[status.id].description} ${status.publicationTrack ? dict.methodology.onPublicationTrack : dict.methodology.neverOfficial}` })),
        ...RESULT_TRACKS.map((track) => ({ term: dict.tracks[track.id].label, detail: dict.tracks[track.id].description })),
      ],
    },
    {
      title: dict.methodology.missingTitle,
      items: [
        { term: dict.missing.noSuccess, detail: dict.methodology.missingNoSuccess },
        { term: dict.missing.noData, detail: dict.methodology.missingNoData },
        { term: dict.missing.notMeasured, detail: dict.methodology.missingNotMeasured },
      ],
    },
    {
      title: dict.methodology.claimsTitle,
      items: Object.values(EVIDENCE_LABELS).map((item) => ({ term: dict.evidenceLabels[item.id].label, detail: dict.evidenceLabels[item.id].description })),
    },
    { title: dict.taskPolicy.platformTitle, items: dict.taskPolicy.platformRules.map(({ label: term, detail }) => ({ term, detail })) },
    { title: dict.taskPolicy.localityTitle, items: dict.taskPolicy.localityRules.map(({ label: term, detail }) => ({ term, detail })) },
    { title: dict.taskPolicy.valueTitle, items: dict.taskPolicy.valueRules.map(({ label: term, detail }) => ({ term, detail })) },
    {
      title: dict.integration.methodologyTitle,
      items: [...dict.integration.methodologyItems, { term: dict.integration.methodologyEyebrow, detail: dict.integration.methodologyStatus }],
    },
    {
      title: dict.methodology.limitsTitle,
      items: dict.methodology.limits.map((detail, index) => ({ term: String(index + 1), detail })),
    },
  ];
}

function pushOperationalSections(lines: string[], lang: Locale): void {
  lines.push(lang === "ko" ? "## 현재 운영 계약" : "## Current operational contract", "");
  for (const section of operationalSections(lang)) {
    lines.push(`### ${section.title}`, "");
    for (const item of section.items) lines.push(`- **${item.term}.** ${item.detail}`);
    lines.push("");
  }
}

export function buildMethodologyMarkdown(): string {
  const lines: string[] = [];

  lines.push(`# ${HEADING}`);
  lines.push("");
  lines.push(
    "Generated from the canonical wiki records in `src/data/methodology/wiki.ts`. Do not edit this file by hand: run `pnpm export:data`.",
  );
  lines.push("");
  lines.push("This document states MICA's current final methodology and its evidence base.");
  lines.push("");

  lines.push("## Current status");
  lines.push("");
  lines.push(`- Canonical public domain: ${WIKI_FACTS.domain}`);
  lines.push(
    `- Markets: ${WIKI_FACTS.markets} (${WIKI_FACTS.marketCodes
      .map((code) => code.toUpperCase())
      .join(", ")})`,
  );
  lines.push(`- Task families: ${WIKI_FACTS.families}`);
  lines.push(
    `- Canonical task definitions: ${WIKI_FACTS.canonicalTasks} (${WIKI_FACTS.candidateTasks} provisional public-set candidates, ${WIKI_FACTS.validatedTasks} validated)`,
  );
  lines.push(
    `- Canonical task text languages: ${WIKI_FACTS.taskTextLanguages.join(", ")}`,
  );
  lines.push(`- Registered systems: ${WIKI_FACTS.systems}`);
  lines.push(`- Run cells: ${WIKI_FACTS.runCells}`);
  lines.push(
    `- Publication eligible: ${String(WIKI_FACTS.publicationEligible)}`,
  );
  lines.push(
    `- Minimum eligible runs: ${WIKI_FACTS.minEligibleRuns === null ? "not set" : String(WIKI_FACTS.minEligibleRuns)}`,
  );
  lines.push(
    `- Minimum coverage: ${WIKI_FACTS.minCoverage === null ? "not set" : String(WIKI_FACTS.minCoverage)}`,
  );
  lines.push(
    `- Per-task final score: ${WIKI_FACTS.formula}, each factor normalized to the interval from 0 to 1, bounded by 0 and ${WIKI_FACTS.maxTaskScore}`,
  );
  lines.push(`- References in this document: ${REFERENCE_COUNT}`);
  lines.push("");

  lines.push("## Reading vocabulary");
  lines.push("");
  for (const badge of WIKI_BADGES) {
    lines.push(`- **${badge.label.en}.** ${badge.meaning.en}`);
  }
  lines.push("");

  for (const chapter of WIKI_CHAPTERS) {
    lines.push(`## ${chapter.title.en}`);
    lines.push("");
    lines.push(chapter.lead.en);
    lines.push("");
    if (BESPOKE.has(chapter.id)) {
      lines.push(...bespokeBody(chapter.id));
    } else {
      for (const entry of chapter.entries) {
        const refs = entry.refs?.length
          ? ` (see: ${entry.refs.join(", ")})`
          : "";
        lines.push(
          line(
            "- **[",
            badgeById(entry.badge).label.en,
            "] ",
            entry.term.en,
            ".** ",
            entry.detail.en,
            refs,
          ),
        );
      }
    }
    lines.push("");
  }

  pushOperationalSections(lines, "en");
  pushOperationalSections(lines, "ko");

  lines.push("## 현재 정책 등록부 (Korean policy register)");
  lines.push("");
  lines.push(chapterById("policy-register").lead.ko);
  lines.push("");
  for (const entry of POLICY_REGISTER) {
    lines.push(`- **${entry.term.ko}.** ${entry.rule.ko}`);
  }
  lines.push("");

  // A single trailing newline, and no blank line doubled at the seams.
  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}
