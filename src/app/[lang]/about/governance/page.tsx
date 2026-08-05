import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { SITE } from "@/lib/site";
import { DATA_SOURCE } from "@/lib/data/source";
import { EVIDENCE_LABELS } from "@/data/policy/publication";
import { DataList, DemoDisclosure, PageHeader, Section } from "@/components/editorial";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "Who runs MICA, how corrections and conflicts of interest are handled, and what the index refuses to do.",
  alternates: { canonical: "/about/governance" },
};

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
        eyebrow="Standing rules"
        title="What MICA will not do"
        intro="These are commitments, not preferences. Breaking one is a governance failure, not a product decision."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {[
            "MICA will not publish a composite score. Accuracy, speed and cost stay separate, and any weighting belongs to the reader.",
            "MICA will not accept payment for placement, for inclusion, or for the timing of a result.",
            "MICA will not publish a figure it cannot trace to a run record it holds.",
            "MICA will not treat missing coverage as a zero, or a fast failure as a fast success.",
            "MICA will not remove a critical safety event from a cell. The block is permanent.",
            "MICA will not run irreversible actions against real accounts belonging to real people.",
          ].map((rule) => (
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
        eyebrow="Decisions"
        title="Who decides what"
        intro="Editorial authority is separated from operator relationships on purpose."
      >
        <DataList
          items={[
            {
              term: "Method changes",
              detail:
                "Changes to definitions, gates or axes are versioned with the edition and published before the results computed under them. A method is never changed after seeing which system it would favour.",
            },
            {
              term: "Edition sign-off",
              detail:
                "Each market edition is signed by its edition note. The note records scope choices and known gaps in that market.",
            },
            {
              term: "Operator relationships",
              detail:
                "Submitters may correct facts about their own snapshot composition. They have no say over verification status, publication eligibility or interpretation.",
            },
            {
              term: "Conflicts of interest",
              detail:
                "Any commercial relationship with an operator is disclosed on the affected results, and disqualifies MICA staff involved in it from verification of that system.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Corrections"
        title="How an error is fixed"
        intro="MICA expects to be wrong sometimes. The obligation is to be wrong in public and briefly."
      >
        <div className="mica-prose text-[15px] text-[var(--color-ink-soft)]">
          <p>
            A correction request should identify the cell, the figure disputed,
            and the evidence. MICA re-derives the figure from the run records it
            holds; if the records are wrong, the cell is withdrawn rather than
            adjusted.
          </p>
          <p>
            Corrections are published with the original value, the corrected
            value, the date, and the reason. Silent edits to a published figure
            are treated as a governance failure.
          </p>
          <p>
            A withdrawn cell stays visible as withdrawn. Removing it entirely
            would let the index quietly forget its own mistakes.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Claims"
        title="Three kinds of statement"
        intro="Every sentence MICA publishes is one of these, and is labelled as such."
      >
        <DataList
          items={Object.values(EVIDENCE_LABELS).map((label) => ({
            term: label.label,
            detail: label.description,
          }))}
        />
      </Section>

      <Section
        eyebrow="Provenance"
        title="Where this build's data comes from"
        intro="Stated on the site itself so that a reader never has to trust a claim about the pipeline."
      >
        <DataList
          items={[
            { term: "Source kind", detail: DATA_SOURCE.kind },
            { term: "Data status", detail: DATA_SOURCE.dataStatus },
            { term: "Edition", detail: SITE.edition },
            {
              term: "Disclosure",
              detail: SITE.demoNotice,
            },
            {
              term: "Remote source",
              detail:
                "No remote database is installed. The data-source boundary exists so a real edition can be served without any page importing a fixture directly, and a build with no credentials configured is the supported default.",
            },
          ]}
        />
        <p className="mt-6">
          <LocaleLink lang={lang} href="/methodology" className="mica-link">
            Read the methodology →
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
