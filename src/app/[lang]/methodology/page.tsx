import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeHref } from "@/lib/i18n/config";
import { OUTCOME_AXES, DIAGNOSTIC_AXES } from "@/data/policy/axes";
import {
  PUBLICATION_RULES,
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
  EVIDENCE_LABELS,
} from "@/data/policy/publication";
import {
  DataList,
  OnThisPage,
  PageHeader,
  PublicationStatus,
  Section,
} from "@/components/editorial";

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
    alternates: { canonical: localeHref(lang, "/methodology") },
  };
}

/**
 * Section ids are structural and stay in English; every label the reader sees
 * comes from the dictionary, so the anchor nav reads in the page's own language.
 */
const SECTION_IDS = [
  { id: "axes", key: "tocAxes" },
  { id: "counting", key: "tocCounting" },
  { id: "missing-values", key: "tocMissing" },
  { id: "diagnostics", key: "tocDiagnostics" },
  { id: "evidence", key: "tocEvidence" },
  { id: "publication", key: "tocPublication" },
  { id: "claims", key: "tocClaims" },
  { id: "limits", key: "tocLimits" },
] as const;

export default async function MethodologyPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  const sections = SECTION_IDS.map(({ id, key }) => ({
    id,
    label: dict.methodology[key],
  }));

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.methodology.eyebrow}
        title={dict.methodology.title}
        standfirst={dict.methodology.standfirst}
      >
        <PublicationStatus text={dict.methodology.publicationStatus} />
        <OnThisPage lang={lang} items={sections} />
      </PageHeader>

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

      <Section
        id="platform-policy"
        eyebrow={dict.taskPolicy.platformEyebrow}
        title={dict.taskPolicy.platformTitle}
        intro={dict.taskPolicy.platformExclusion}
      >
        <div data-platform-policy>
          <ol className="mica-policy-list" role="list">
            {dict.taskPolicy.platformRules.map((rule, index) => (
              <li key={rule.label} data-platform-rule>
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

      <Section
        id="locality-policy"
        eyebrow={dict.taskPolicy.localityEyebrow}
        title={dict.taskPolicy.localityTitle}
        intro={dict.taskPolicy.localityIntro}
      >
        <div data-locality-policy>
          <ol className="mica-policy-list" role="list">
            {dict.taskPolicy.localityRules.map((rule, index) => (
              <li key={rule.label} data-locality-rule>
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

      <Section
        id="value-policy"
        eyebrow={dict.taskPolicy.valueEyebrow}
        title={dict.taskPolicy.valueTitle}
        intro={dict.taskPolicy.valueIntro}
      >
        <div data-value-policy>
          <ol className="mica-policy-list" role="list">
            {dict.taskPolicy.valueRules.map((rule, index) => (
              <li key={rule.label} data-value-rule>
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

      <Section
        id="missing-values"
        eyebrow={dict.methodology.missingEyebrow}
        title={dict.methodology.missingTitle}
        intro={dict.methodology.missingIntro}
      >
        <DataList
          items={[
            {
              term: dict.missing.noSuccess,
              detail: dict.methodology.missingNoSuccess,
            },
            {
              term: dict.missing.noData,
              detail: dict.methodology.missingNoData,
            },
            {
              term: dict.missing.notMeasured,
              detail: dict.methodology.missingNotMeasured,
            },
          ]}
        />
      </Section>

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
            {
              term: dict.methodology.thresholdsTerm,
              detail: dict.thresholdsNotSet,
            },
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
        <p className="mt-6">
          <LocaleLink lang={lang} href="/about/governance" className="mica-link">
            {dict.methodology.whoDecides}
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
