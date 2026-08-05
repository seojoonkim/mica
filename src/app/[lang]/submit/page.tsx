import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { PUBLICATION_RULES, VERIFICATION_STATUSES } from "@/data/policy/publication";
import { DataList, DemoDisclosure, PageHeader, Section } from "@/components/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.submit.metaTitle,
    description: dict.submit.metaDescription,
    alternates: { canonical: `/${lang}/submit` },
  };
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.submit.eyebrow}
        title={dict.submit.title}
        standfirst={dict.submit.standfirst}
      >
        <DemoDisclosure lang={lang} detail={dict.submit.disclosureDetail} />
      </PageHeader>

      <Section
        eyebrow={dict.submit.stepOneEyebrow}
        title={dict.submit.stepOneTitle}
        intro={dict.submit.stepOneIntro}
      >
        <DataList
          items={[
            {
              term: dict.submit.identityTerm,
              detail: dict.submit.identityDetail,
            },
            {
              term: dict.submit.compositionTerm,
              detail: dict.submit.compositionDetail,
            },
            {
              term: dict.submit.scopeTerm,
              detail: [
                dict.submit.scopeMarkets,
                COUNTRIES.map((c) => dict.markets[c.code]).join(", "),
                dict.submit.scopeFamilies,
                TASK_FAMILIES.map((f) => dict.families[f.id].label).join(", "),
                dict.submit.scopeSuffix,
              ].join(""),
            },
            { term: dict.submit.accessTerm, detail: dict.submit.accessDetail },
            { term: dict.submit.traceTerm, detail: dict.submit.traceDetail },
          ]}
        />
      </Section>

      <Section
        eyebrow={dict.submit.stepTwoEyebrow}
        title={dict.submit.stepTwoTitle}
        intro={dict.submit.stepTwoIntro}
      >
        <DataList
          items={VERIFICATION_STATUSES.map((status) => ({
            term: `${dict.verification[status.id].label} · ${dict.verification[status.id].short}`,
            detail: `${dict.verification[status.id].description} ${
              status.publicationTrack
                ? dict.methodology.onPublicationTrack
                : dict.methodology.neverOfficialLong
            }`,
          }))}
        />
      </Section>

      <Section
        eyebrow={dict.submit.stepThreeEyebrow}
        title={dict.submit.stepThreeTitle}
        intro={dict.submit.stepThreeIntro}
      >
        <DataList
          items={[
            {
              term: dict.submit.sampleSizeTerm,
              detail:
                PUBLICATION_RULES.minEligibleRuns === null
                  ? dict.submit.sampleSizeUnset
                  : `${dict.submit.sampleSizePrefix} ${PUBLICATION_RULES.minEligibleRuns} ${dict.submit.sampleSizeSuffix}`,
            },
            {
              term: dict.submit.coverageTerm,
              detail:
                PUBLICATION_RULES.minCoverage === null
                  ? dict.submit.coverageUnset
                  : `${dict.submit.coveragePrefix} ${(PUBLICATION_RULES.minCoverage * 100).toFixed(0)}% ${dict.submit.coverageSuffix}`,
            },
            { term: dict.submit.safetyTerm, detail: dict.submit.safetyDetail },
            {
              term: dict.submit.verificationTerm,
              detail: dict.submit.verificationDetail,
            },
          ]}
        />
      </Section>

      <Section
        eyebrow={dict.submit.termsEyebrow}
        title={dict.submit.termsTitle}
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {dict.submit.terms.map((term) => (
            <li
              key={term}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {term}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow={dict.submit.contactEyebrow}
        title={dict.submit.contactTitle}
      >
        <p className="mica-body">{dict.submit.contactBody}</p>
        <p className="mt-6 flex flex-wrap gap-x-6">
          <LocaleLink lang={lang} href="/methodology" className="mica-link">
            {dict.submit.readMethodology}
          </LocaleLink>
          <LocaleLink lang={lang} href="/about/governance" className="mica-link">
            {dict.submit.readGovernance}
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
