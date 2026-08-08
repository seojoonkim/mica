import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LocaleLink } from "@/components/locale-link";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates, type Locale } from "@/lib/i18n/config";
import { DIAGNOSTIC_AXES, OUTCOME_AXES } from "@/data/policy/axes";
import {
  EVIDENCE_LABELS,
  PUBLICATION_RULES,
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
} from "@/data/policy/publication";
import {
  DataList,
  OnThisPage,
  PageHeader,
  PublicationStatus,
  Section,
} from "@/components/editorial";
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
  type BadgeId,
  type WikiChapter,
  type WikiEntry,
} from "@/data/methodology/wiki";

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.methodology.metaTitle,
    description: dict.methodology.metaDescription,
    alternates: localeAlternates(lang, "/methodology"),
  };
}

/** The generated Markdown pack. A static asset, so it keeps a raw href. */
const MARKDOWN_HREF = "/methodology/mica-methodology-and-references.md";

/**
 * Sections that come from the dictionary rather than from the wiki module, and
 * where each sits in the reading order. The wiki module owns the long-form
 * knowledge; these three carry the auditable operational rule lists, and their
 * copy is already translated and already asserted against.
 */
const DICT_SECTIONS: Record<string, readonly string[]> = {
  "lifecycle-status": ["publication"],
  "task-authoring": ["locality-policy"],
  "access-parity": ["platform-policy", "integration"],
  "completion-evidence": ["diagnostics"],
  scoring: ["axes", "scoring-contract", "counting", "value-policy"],
  "tracks-uncertainty": ["evidence", "missing-values"],
  "lineage-privacy": ["claims"],
  limitations: ["limits"],
};

/* --------------------------------------------------------------- primitives */

/**
 * The epistemic badge. It is text, never colour alone: a reader in greyscale,
 * on a printout, or with a screen reader gets the same four-way distinction as
 * a reader looking at the styled page.
 */
function Badge({ id, lang }: { id: BadgeId; lang: Locale }) {
  const badge = badgeById(id);
  return (
    <span className="mica-badge" data-methodology-badge={id}>
      {badge.label[lang]}
    </span>
  );
}

function EntryList({
  entries,
  lang,
}: {
  entries: readonly WikiEntry[];
  lang: Locale;
}) {
  return (
    <dl className="mica-wiki-list" data-methodology-entries>
      {entries.map((entry) => (
        <div key={entry.id} data-methodology-entry={entry.id}>
          <dt>
            <Badge id={entry.badge} lang={lang} />
            <span className="mica-wiki-term">{entry.term[lang]}</span>
          </dt>
          <dd>{entry.detail[lang]}</dd>
        </div>
      ))}
    </dl>
  );
}

function WikiSection({
  chapter,
  lang,
  children,
}: {
  chapter: WikiChapter;
  lang: Locale;
  children?: ReactNode;
}) {
  return (
    <Section id={chapter.id} title={chapter.title[lang]} intro={chapter.lead[lang]}>
      <div
        data-methodology-chapter={chapter.id}
        data-model-routing={chapter.id === "model-routing" ? "" : undefined}
      >
        {chapter.entries.length > 0 ? (
          <EntryList entries={chapter.entries} lang={lang} />
        ) : null}
        {children}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- chapter bodies */

function StatusMatrix({ lang }: { lang: Locale }) {
  return (
    <ul className="mica-status-list" data-methodology-status role="list">
      {STATUS_MATRIX.map((item) => (
        <li key={item.id} data-methodology-status-item={item.state}>
          <span className="mica-badge" data-methodology-state={item.state}>
            {item.state === "implemented"
              ? lang === "ko" ? "구현됨" : "Implemented"
              : lang === "ko" ? "계획됨" : "Planned"}
          </span>
          <div>
            <h3 className="mica-h3">{item.label[lang]}</h3>
            <p className="mica-body-sm">{item.detail[lang]}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PolicyRegister({ lang }: { lang: Locale }) {
  return (
    <div data-methodology-register>
      <DataList
        items={POLICY_REGISTER.map((entry) => ({
          term: entry.term[lang],
          detail: entry.rule[lang],
        }))}
      />
    </div>
  );
}

function ResearchReferences({ lang }: { lang: Locale }) {
  return (
    <div data-methodology-references="primary">
      {REFERENCE_GROUPS.map((group) => (
        <section
          key={group.id}
          id={`references-${group.id}`}
          className="mica-ref-group"
        >
          <h3 className="mica-h3">{group.label[lang]}</h3>
          <p className="mica-body-sm">{group.lead[lang]}</p>
          <ul className="mica-ref-list" role="list">
            {primaryReferencesInGroup(group.id).map((reference) => (
              <li key={reference.id} data-methodology-reference={reference.id}>
                <p className="mica-ref-cite">
                  <a
                    className="mica-link"
                    href={reference.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {reference.name}: {reference.title}
                  </a>{" "}
                  <span className="mica-micro">{reference.venue}</span>
                </p>
                <p className="mica-body-sm">
                  <span className="mica-eyebrow">
                    {lang === "ko" ? "차용한 점" : "Borrowed"}
                  </span>{" "}
                  {reference.borrowed[lang]}
                </p>
                <p className="mica-body-sm">
                  <span className="mica-eyebrow">
                    {lang === "ko" ? "채택하지 않은 점" : "Not adopted"}
                  </span>{" "}
                  {reference.notAdopted[lang]}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EditorialReferences({ lang }: { lang: Locale }) {
  return (
    <ul className="mica-ref-list" data-methodology-references="editorial" role="list">
      {EDITORIAL_REFERENCES.map((reference) => (
        <li key={reference.id} data-methodology-reference={reference.id}>
          <p className="mica-ref-cite">
            <a
              className="mica-link"
              href={reference.url}
              rel="noreferrer"
              target="_blank"
            >
              {reference.name}: {reference.title}
            </a>
          </p>
          <p className="mica-body-sm">{reference.influence[lang]}</p>
        </li>
      ))}
    </ul>
  );
}

function Amendments({ lang }: { lang: Locale }) {
  return (
    <div data-methodology-amendments>
      <DataList
        items={AMENDMENT_STEPS.map((step) => ({
          term: step.term[lang],
          detail: step.href ? (
            <>
              {step.detail[lang]}{" "}
              <LocaleLink lang={lang} href={step.href} className="mica-link">
                {step.href === "/submit"
                  ? getDict(lang).nav.submit
                  : getDict(lang).nav.governance}
              </LocaleLink>
            </>
          ) : (
            step.detail[lang]
          ),
        }))}
      />
    </div>
  );
}

function Glossary({ lang }: { lang: Locale }) {
  return (
    <div data-methodology-glossary>
      <DataList
        items={GLOSSARY.map((entry) => ({
          term: entry.term[lang],
          detail: entry.definition[lang],
        }))}
      />
    </div>
  );
}

/* --------------------------------------------------- dictionary-owned bodies */

/**
 * The scoring contract, unchanged in substance and still read from the
 * dictionary: the formula block, the three normalized components, and the
 * aggregation, exclusion, raw-disclosure, cost and status semantics beside it.
 */
function ScoringContract({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="scoring-contract"
      eyebrow={dict.methodology.scoringEyebrow}
      title={dict.methodology.scoringTitle}
      intro={dict.methodology.scoringIntro}
    >
      <div
        data-score-formula
        className="border border-[var(--color-rule)] p-4 sm:p-5"
      >
        <p className="mica-eyebrow m-0 text-[var(--color-atlas)]">
          {dict.methodology.scoringFormulaLabel}
        </p>
        <p className="mica-display mt-2 mb-0 text-[19px] leading-snug break-words sm:text-[24px]">
          {dict.methodology.scoringFormula}
        </p>
        <p className="mica-micro mt-2 mb-0 max-w-[70ch]">
          {dict.methodology.scoringFormulaNote}
        </p>
      </div>
      <div data-score-components className="mt-6">
        <DataList items={dict.methodology.scoringComponents} />
      </div>
      <div data-score-semantics className="mt-6">
        <DataList
          items={[
            {
              term: dict.methodology.scoringAggregationTerm,
              detail: dict.methodology.scoringAggregationDetail,
            },
            {
              term: dict.methodology.scoringOverallTerm,
              detail: dict.methodology.scoringOverallDetail,
            },
            {
              term: dict.methodology.scoringExclusionTerm,
              detail: dict.methodology.scoringExclusionDetail,
            },
            {
              term: dict.methodology.scoringRawTerm,
              detail: dict.methodology.scoringRawDetail,
            },
            {
              term: dict.methodology.scoringCostTerm,
              detail: dict.methodology.scoringCostDetail,
            },
            {
              term: dict.methodology.scoringStatusTerm,
              detail: dict.methodology.scoringStatusDetail,
            },
          ]}
        />
      </div>
    </Section>
  );
}

function PolicyRules({
  id,
  eyebrow,
  title,
  intro,
  rules,
  wrapperAttr,
  ruleAttr,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  rules: readonly { label: string; detail: string }[];
  wrapperAttr: string;
  ruleAttr: string;
}) {
  return (
    <Section id={id} eyebrow={eyebrow} title={title} intro={intro}>
      <div {...{ [wrapperAttr]: "" }}>
        <ol className="mica-policy-list" role="list">
          {rules.map((rule, index) => (
            <li key={rule.label} {...{ [ruleAttr]: "" }}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{rule.label}</h3>
                <p>{rule.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function IntegrationContract({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="integration"
      eyebrow={dict.integration.methodologyEyebrow}
      title={dict.integration.methodologyTitle}
      intro={dict.integration.methodologyIntro}
    >
      <div data-integration-contract>
        <DataList items={dict.integration.methodologyItems} />
      </div>
      <p className="mica-micro mt-4 max-w-[76ch]" data-integration-status>
        {dict.integration.methodologyStatus}
      </p>
    </Section>
  );
}

/** The three outcome axes, still reported side by side in their own units. */
function OutcomeAxes({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="axes"
      eyebrow={dict.methodology.axesEyebrow}
      title={dict.methodology.axesTitle}
      intro={dict.methodology.axesIntro}
    >
      <DataList
        items={OUTCOME_AXES.map((axis) => ({
          term: dict.outcomeAxes[axis.id].label,
          detail: (
            <>
              <span className="mica-eyebrow mr-2">
                {dict.outcomeAxes[axis.id].unit}
              </span>
              {dict.outcomeAxes[axis.id].description}
            </>
          ),
        }))}
      />
    </Section>
  );
}

/** Eligibility and denominators, written down so they can be argued with. */
function CountingRules({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="counting"
      eyebrow={dict.methodology.countingEyebrow}
      title={dict.methodology.countingTitle}
      intro={dict.methodology.countingIntro}
    >
      <div className="mica-prose text-[15px] text-[var(--color-ink-soft)]">
        <p>
          <strong>{dict.methodology.eligibleRunTerm}</strong>
          {dict.methodology.countingEligible}
        </p>
        <p>
          <strong>{dict.methodology.accuracyTerm}</strong>
          {dict.methodology.countingAccuracy}
        </p>
        <p>
          <strong>{dict.methodology.speedTerm}</strong>
          {dict.methodology.countingSpeed}
        </p>
        <p>
          <strong>{dict.methodology.costTerm}</strong>
          {dict.methodology.countingCostPrefix}
          {dict.missing.noSuccess}
          {dict.methodology.countingCostSuffix}
        </p>
        <p>
          {dict.methodology.countingMacroPrefix}
          <strong>{dict.methodology.macroTerm}</strong>
          {dict.methodology.countingMacroSuffix}
        </p>
      </div>
    </Section>
  );
}

function ModelRouting({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="model-routing"
      eyebrow={dict.methodology.routingEyebrow}
      title={dict.methodology.routingTitle}
      intro={dict.methodology.routingIntro}
    >
      <div data-model-routing>
        <DataList items={dict.methodology.routingItems} />
      </div>
    </Section>
  );
}

function MissingValues({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="missing-values"
      eyebrow={dict.methodology.missingEyebrow}
      title={dict.methodology.missingTitle}
      intro={dict.methodology.missingIntro}
    >
      <DataList
        items={[
          { term: dict.missing.noSuccess, detail: dict.methodology.missingNoSuccess },
          { term: dict.missing.noData, detail: dict.methodology.missingNoData },
          {
            term: dict.missing.notMeasured,
            detail: dict.methodology.missingNotMeasured,
          },
        ]}
      />
    </Section>
  );
}

function DiagnosticAxes({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="diagnostics"
      eyebrow={dict.methodology.diagnosticsEyebrow}
      title={dict.methodology.diagnosticsTitle}
      intro={dict.methodology.diagnosticsIntro}
    >
      <DataList
        items={DIAGNOSTIC_AXES.map((axis) => ({
          term: dict.diagnosticAxes[axis.id].label,
          detail: dict.diagnosticAxes[axis.id].description,
        }))}
      />
    </Section>
  );
}

function VerificationAndTracks({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="evidence"
      eyebrow={dict.methodology.evidenceEyebrow}
      title={dict.methodology.evidenceTitle}
      intro={dict.methodology.evidenceIntro}
    >
      <DataList
        items={[
          ...VERIFICATION_STATUSES.map((status) => ({
            term: `${dict.verification[status.id].label} · ${dict.verification[status.id].short}`,
            detail: `${dict.verification[status.id].description} ${
              status.publicationTrack
                ? dict.methodology.onPublicationTrack
                : dict.methodology.neverOfficial
            }`,
          })),
          ...RESULT_TRACKS.map((track) => ({
            term: dict.tracks[track.id].label,
            detail: dict.tracks[track.id].description,
          })),
        ]}
      />
    </Section>
  );
}

/** The gate itself, read from the live rules rather than restated in prose. */
function PublicationGate({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="publication"
      eyebrow={dict.methodology.publicationEyebrow}
      title={dict.methodology.publicationTitle}
      intro={dict.methodology.publicationIntro}
    >
      <DataList
        items={[
          {
            term: dict.methodology.minRunsTerm,
            detail:
              PUBLICATION_RULES.minEligibleRuns === null
                ? dict.methodology.minRunsUnset
                : `${PUBLICATION_RULES.minEligibleRuns} ${dict.methodology.minRunsSuffix}`,
          },
          {
            term: dict.methodology.minCoverageTerm,
            detail:
              PUBLICATION_RULES.minCoverage === null
                ? dict.methodology.minCoverageUnset
                : `${(PUBLICATION_RULES.minCoverage * 100).toFixed(0)}% ${dict.methodology.minCoverageSuffix}`,
          },
          { term: dict.methodology.thresholdsTerm, detail: dict.thresholdsNotSet },
          {
            term: dict.methodology.safetyTerm,
            detail: PUBLICATION_RULES.criticalSafetyBlocks
              ? dict.methodology.safetyBlocks
              : dict.methodology.safetyNonBlocking,
          },
          {
            term: dict.methodology.verificationTerm,
            detail: dict.methodology.verificationDetail,
          },
          {
            term: dict.methodology.dataStatusTerm,
            detail: dict.methodology.dataStatusDetail,
          },
        ]}
      />
    </Section>
  );
}

function ClaimLabels({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="claims"
      eyebrow={dict.methodology.claimsEyebrow}
      title={dict.methodology.claimsTitle}
      intro={dict.methodology.claimsIntro}
    >
      <DataList
        items={Object.values(EVIDENCE_LABELS).map((label) => ({
          term: dict.evidenceLabels[label.id].label,
          detail: dict.evidenceLabels[label.id].description,
        }))}
      />
    </Section>
  );
}

function MethodLimits({ lang }: { lang: Locale }) {
  const dict = getDict(lang);
  return (
    <Section
      id="limits"
      eyebrow={dict.methodology.limitsEyebrow}
      title={dict.methodology.limitsTitle}
      intro={dict.methodology.limitsIntro}
    >
      <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
        {dict.methodology.limits.map((limit) => (
          <li
            key={limit}
            className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
          >
            {limit}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function dictSection(id: string, lang: Locale): ReactNode {
  const dict = getDict(lang);
  switch (id) {
    case "axes":
      return <OutcomeAxes key={id} lang={lang} />;
    case "counting":
      return <CountingRules key={id} lang={lang} />;
    case "model-routing":
      return <ModelRouting key={id} lang={lang} />;
    case "missing-values":
      return <MissingValues key={id} lang={lang} />;
    case "diagnostics":
      return <DiagnosticAxes key={id} lang={lang} />;
    case "evidence":
      return <VerificationAndTracks key={id} lang={lang} />;
    case "publication":
      return <PublicationGate key={id} lang={lang} />;
    case "claims":
      return <ClaimLabels key={id} lang={lang} />;
    case "limits":
      return <MethodLimits key={id} lang={lang} />;
    case "scoring-contract":
      return <ScoringContract key={id} lang={lang} />;
    case "platform-policy":
      return (
        <PolicyRules
          key={id}
          id="platform-policy"
          eyebrow={dict.taskPolicy.platformEyebrow}
          title={dict.taskPolicy.platformTitle}
          intro={dict.taskPolicy.platformExclusion}
          rules={dict.taskPolicy.platformRules}
          wrapperAttr="data-platform-policy"
          ruleAttr="data-platform-rule"
        />
      );
    case "locality-policy":
      return (
        <PolicyRules
          key={id}
          id="locality-policy"
          eyebrow={dict.taskPolicy.localityEyebrow}
          title={dict.taskPolicy.localityTitle}
          intro={dict.taskPolicy.localityIntro}
          rules={dict.taskPolicy.localityRules}
          wrapperAttr="data-locality-policy"
          ruleAttr="data-locality-rule"
        />
      );
    case "value-policy":
      return (
        <PolicyRules
          key={id}
          id="value-policy"
          eyebrow={dict.taskPolicy.valueEyebrow}
          title={dict.taskPolicy.valueTitle}
          intro={dict.taskPolicy.valueIntro}
          rules={dict.taskPolicy.valueRules}
          wrapperAttr="data-value-policy"
          ruleAttr="data-value-rule"
        />
      );
    case "integration":
      return <IntegrationContract key={id} lang={lang} />;
    default:
      return null;
  }
}

function dictSectionLabel(id: string, lang: Locale): string {
  const dict = getDict(lang);
  switch (id) {
    case "publication":
      return dict.methodology.publicationTitle;
    case "axes":
      return dict.methodology.axesTitle;
    case "counting":
      return dict.methodology.countingTitle;
    case "missing-values":
      return dict.methodology.missingTitle;
    case "diagnostics":
      return dict.methodology.diagnosticsTitle;
    case "evidence":
      return dict.methodology.evidenceTitle;
    case "claims":
      return dict.methodology.claimsTitle;
    case "limits":
      return dict.methodology.limitsTitle;
    case "scoring-contract":
      return dict.methodology.scoringTitle;
    case "model-routing":
      return dict.methodology.routingTitle;
    case "platform-policy":
      return dict.taskPolicy.platformTitle;
    case "locality-policy":
      return dict.taskPolicy.localityTitle;
    case "value-policy":
      return dict.taskPolicy.valueTitle;
    case "integration":
      return dict.integration.methodologyTitle;
    default:
      throw new Error(`unknown dictionary methodology section "${id}"`);
  }
}

function chapterBody(id: string, lang: Locale): ReactNode {
  switch (id) {
    case "implemented-vs-planned":
      return <StatusMatrix lang={lang} />;
    case "policy-register":
      return <PolicyRegister lang={lang} />;
    case "research-references":
      return <ResearchReferences lang={lang} />;
    case "publication-references":
      return <EditorialReferences lang={lang} />;
    case "amendments":
      return <Amendments lang={lang} />;
    case "glossary":
      return <Glossary lang={lang} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------- page */

export default async function MethodologyPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  // The on-page navigation is the wiki's own table of contents: every chapter,
  // plus the dictionary-owned sections in the position they are read.
  const tocItems = WIKI_CHAPTERS.flatMap((chapter) => [
    { id: chapter.id, label: chapter.title[lang] },
    ...(
      DICT_SECTIONS[chapter.id as keyof typeof DICT_SECTIONS] ?? []
    ).map((id) => ({ id, label: dictSectionLabel(id, lang) })),
  ]);

  return (
    <div data-methodology-wiki>
      <PageHeader
        lang={lang}
        eyebrow={dict.methodology.eyebrow}
        title={dict.methodology.title}
        standfirst={dict.methodology.standfirst}
      >
        <PublicationStatus text={dict.methodology.publicationStatus} />

        <div className="mica-wiki-meta mt-6" data-methodology-meta>
          <p className="mica-body-sm m-0 max-w-[76ch]">
            {lang === "ko"
              ? "이 위키는 MICA의 현재 최종 방법론과 그 근거를 공개합니다."
              : "This wiki publishes MICA's current final methodology and its evidence base."}
          </p>
          <p className="m-0 mt-3">
            <a className="mica-link" href={MARKDOWN_HREF} download>
              {lang === "ko" ? "방법론 Markdown 다운로드" : "Download methodology Markdown"}
            </a>{" "}
            <span className="mica-micro">
              {lang === "ko"
                ? "이 페이지와 같은 정본 데이터에서 생성됩니다."
                : "Generated from the same canonical records as this page."}
            </span>
          </p>
        </div>

        {/*
         * The vocabulary legend. Four labels, each written out, so the badge on
         * an entry means something before the reader has learned the styling.
         */}
        <div className="mica-wiki-legend mt-6" data-methodology-legend>
          <p className="mica-eyebrow" id="wiki-vocabulary">
            {lang === "ko" ? "읽기 표식" : "Reading vocabulary"}
          </p>
          <dl className="mica-wiki-legend-list" aria-labelledby="wiki-vocabulary">
            {WIKI_BADGES.map((badge) => (
              <div key={badge.id} data-methodology-vocabulary={badge.id}>
                <dt>
                  <span className="mica-badge">{badge.label[lang]}</span>
                </dt>
                <dd className="mica-body-sm">{badge.meaning[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>

        <OnThisPage lang={lang} items={tocItems} />
      </PageHeader>

      {WIKI_CHAPTERS.map((chapter) => (
        <div key={chapter.id}>
          <WikiSection chapter={chapter} lang={lang}>
            {chapterBody(chapter.id, lang)}
          </WikiSection>
          {(DICT_SECTIONS[chapter.id as keyof typeof DICT_SECTIONS] ?? []).map(
            (id) => dictSection(id, lang),
          )}
        </div>
      ))}

      <Section
        id="wiki-colophon"
        title={lang === "ko" ? "위키 정보" : "About this wiki"}
        intro={
          lang === "ko"
            ? "방법론 페이지와 다운로드 문서는 하나의 타입 지정 정본에서 생성됩니다."
            : "The methodology page and downloadable document are generated from one typed canonical source."
        }
      >
        <p className="mica-body-sm max-w-[76ch]" data-methodology-count>
          {lang === "ko" ? "수록 레퍼런스" : "References included"} {REFERENCE_COUNT}
        </p>
        <p className="mica-body-sm max-w-[76ch]">
          <a className="mica-link" href={MARKDOWN_HREF} download>
            {lang === "ko" ? "방법론 Markdown 다운로드" : "Download methodology Markdown"}
          </a>
        </p>
        <p className="mica-body-sm max-w-[76ch]">
          <LocaleLink lang={lang} href="/about/governance" className="mica-link">
            {dict.methodology.whoDecides}
          </LocaleLink>
        </p>
        <p className="mica-micro max-w-[76ch]" data-methodology-domain>
          {WIKI_FACTS.domain}
        </p>
      </Section>
    </div>
  );
}
