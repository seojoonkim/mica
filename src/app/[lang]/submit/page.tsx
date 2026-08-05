import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { COUNTRIES } from "@/data/demo/countries";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { PUBLICATION_RULES, VERIFICATION_STATUSES } from "@/data/policy/publication";
import { DataList, DemoDisclosure, PageHeader, Section } from "@/components/editorial";

export const metadata: Metadata = {
  title: "Submit a system",
  description:
    "What MICA needs in order to measure a consumer-agent system snapshot, and what it does with the submission.",
  alternates: { canonical: "/submit" },
};

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
        eyebrow="Step one"
        title="Declare the snapshot"
        intro="A snapshot is immutable. Change any part of it and you have a new snapshot, not an update."
      >
        <DataList
          items={[
            {
              term: "Identity",
              detail:
                "System name, operator, snapshot version string and snapshot date.",
            },
            {
              term: "Composition",
              detail:
                "Orchestrator, every model the system may route to, every tool or API it may call, and how memory is held between steps.",
            },
            {
              term: "Scope",
              detail: `The markets (${COUNTRIES.map((c) => c.name).join(", ")}) and task families (${TASK_FAMILIES.map((f) => f.label).join(", ")}) you are claiming coverage in.`,
            },
            {
              term: "Access",
              detail:
                "A way for MICA to run the system itself on MICA-controlled accounts. Without this, the result can never rise above self-reported.",
            },
            {
              term: "Evidence trace",
              detail:
                "Per-run records: eligibility, wall-clock duration, cost, the final state reached, and every point where the system stopped for confirmation.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="Step two"
        title="What MICA does with it"
        intro="The submission decides the verification status, and the verification status decides whether the result can ever be official."
      >
        <DataList
          items={VERIFICATION_STATUSES.map((status) => ({
            term: `${status.label} · ${status.short}`,
            detail: `${status.description} ${
              status.publicationTrack
                ? "On the publication track."
                : "Displayed for transparency; never published as official."
            }`,
          }))}
        />
      </Section>

      <Section
        eyebrow="Step three"
        title="The bar for publication"
        intro="Meeting the bar is not a ranking. It only means the cell may appear as an official MICA figure. In this preview the numeric parts of the bar are not set, so no submission can clear it yet."
      >
        <DataList
          items={[
            {
              term: "Sample size",
              detail:
                PUBLICATION_RULES.minEligibleRuns === null
                  ? "Not set yet. MICA will state a minimum number of eligible runs per country × family cell before anything is published."
                  : `At least ${PUBLICATION_RULES.minEligibleRuns} eligible runs per country × family cell.`,
            },
            {
              term: "Coverage",
              detail:
                PUBLICATION_RULES.minCoverage === null
                  ? "Not set yet. MICA will state the share of a market's canonical tasks a submission must attempt before anything is published."
                  : `At least ${(PUBLICATION_RULES.minCoverage * 100).toFixed(0)}% of the market's canonical tasks attempted.`,
            },
            {
              term: "Safety",
              detail:
                "No critical safety event. One is enough to block the cell permanently.",
            },
            {
              term: "Verification",
              detail: "Independent rerun by MICA. Nothing less qualifies.",
            },
          ]}
        />
      </Section>

      <Section
        eyebrow="What you get, and do not get"
        title="Terms in plain words"
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {[
            "You may correct factual errors in your snapshot composition at any time.",
            "You may not review, embargo or veto a result before it is published.",
            "You may not purchase placement, inclusion, or favourable timing. There is no paid tier.",
            "You will be told the blockers on any cell of yours that fails the publication gate, in the same words the public sees.",
            "You may withdraw a snapshot from future editions; already-published figures stay published, with the withdrawal noted.",
          ].map((term) => (
            <li
              key={term}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {term}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Contact" title="How to start">
        <p className="max-w-[70ch] text-[15px] text-[var(--color-ink-soft)]">
          MICA has no submission intake while the index is in preview. When the
          first official edition opens, the intake will be listed here and
          announced with the edition. Until then, the most useful thing a
          prospective submitter can do is read the method and tell us where it
          is wrong.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-6">
          <LocaleLink lang={lang} href="/methodology" className="mica-link">
            Read the methodology →
          </LocaleLink>
          <LocaleLink lang={lang} href="/about/governance" className="mica-link">
            Read the governance rules →
          </LocaleLink>
        </p>
      </Section>
    </div>
  );
}
