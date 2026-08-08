import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import { EVIDENCE_LABELS } from "@/data/policy/publication";
import { DataList, DemoDisclosure, PageHeader, Section } from "@/components/editorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.governance.metaTitle,
    description: dict.governance.metaDescription,
    alternates: localeAlternates(lang, "/about/governance"),
  };
}

export default async function GovernancePage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.governance.eyebrow}
        title={dict.governance.title}
        standfirst={dict.governance.standfirst}
      >
        <DemoDisclosure lang={lang} detail={dict.governance.disclosureDetail} />
      </PageHeader>

      <Section
        eyebrow={dict.governance.rulesEyebrow}
        title={dict.governance.rulesTitle}
        intro={dict.governance.rulesIntro}
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {dict.governance.rules.map((rule) => (
            <li
              key={rule}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {rule}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow={dict.governance.decisionsEyebrow}
        title={dict.governance.decisionsTitle}
        intro={dict.governance.decisionsIntro}
      >
        <DataList
          items={[
            {
              term: dict.governance.methodChangesTerm,
              detail: dict.governance.methodChangesDetail,
            },
            {
              term: dict.governance.signOffTerm,
              detail: dict.governance.signOffDetail,
            },
            {
              term: dict.governance.operatorTerm,
              detail: dict.governance.operatorDetail,
            },
            {
              term: dict.governance.conflictsTerm,
              detail: dict.governance.conflictsDetail,
            },
          ]}
        />
      </Section>

      <Section
        id="independence"
        eyebrow={dict.governance.independenceEyebrow}
        title={dict.governance.independenceTitle}
        intro={dict.governance.independenceIntro}
      >
        <DataList
          items={[
            {
              term: dict.governance.independenceInitiatorTerm,
              detail: dict.governance.independenceInitiatorDetail,
            },
            {
              term: dict.governance.independenceControlTerm,
              detail: dict.governance.independenceControlDetail,
            },
            {
              term: dict.governance.independenceFundingTerm,
              detail: dict.governance.independenceFundingDetail,
            },
            {
              term: dict.governance.independenceSetsTerm,
              detail: dict.governance.independenceSetsDetail,
            },
            {
              term: dict.governance.independenceStatusTerm,
              detail: dict.governance.independenceStatusDetail,
            },
          ]}
        />
      </Section>

      <Section
        eyebrow={dict.governance.correctionsEyebrow}
        title={dict.governance.correctionsTitle}
        intro={dict.governance.correctionsIntro}
      >
        <div className="mica-prose text-[15px] text-[var(--color-ink-soft)]">
          {dict.governance.corrections.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section
        eyebrow={dict.governance.claimsEyebrow}
        title={dict.governance.claimsTitle}
        intro={dict.governance.claimsIntro}
      >
        <DataList
          items={Object.values(EVIDENCE_LABELS).map((label) => ({
            term: dict.evidenceLabels[label.id].label,
            detail: dict.evidenceLabels[label.id].description,
          }))}
        />
      </Section>

      <Section
        eyebrow={dict.governance.provenanceEyebrow}
        title={dict.governance.provenanceTitle}
        intro={dict.governance.provenanceIntro}
      >
        <DataList
          items={[
            {
              term: dict.governance.sourceKindTerm,
              detail: dict.governance.sourceKindDetail,
            },
            {
              term: dict.governance.dataStatusTerm,
              detail: dict.governance.dataStatusDetail,
            },
            {
              term: dict.governance.editionTerm,
              detail: dict.governance.editionDetail,
            },
            {
              term: dict.governance.disclosureTerm,
              detail: dict.site.demoNotice,
            },
            {
              term: dict.governance.remoteTerm,
              detail: dict.governance.remoteDetail,
            },
          ]}
        />
        <p className="mt-6">
          <LocaleLink lang={lang} href="/methodology" className="mica-link">
            {dict.governance.readMethodology}
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
