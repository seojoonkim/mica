import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import {
  RESULT_TRACKS,
  VERIFICATION_STATUSES,
} from "@/data/policy/publication";
import {
  DataList,
  DemoDisclosure,
  PageHeader,
  Section,
} from "@/components/editorial";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.agents.metaTitle,
    description: dict.agents.metaDescription,
    alternates: localeAlternates(lang, "/agents"),
  };
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.agents.eyebrow}
        title={dict.agents.title}
        standfirst={dict.agents.standfirst}
      >
        <DemoDisclosure lang={lang} />
      </PageHeader>

      {/*
       * An empty registry, said in words. There is no table here because there
       * is nothing to tabulate, and an empty table with live headers would
       * still promise a shape of result MICA has not earned.
       */}
      <Section
        eyebrow={dict.agents.emptyEyebrow}
        title={dict.agents.emptyTitle}
      >
        <p className="mica-notice max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
          {dict.agents.emptyNotice}
        </p>
        <p className="mt-6">
          <LocaleLink lang={lang} href="/submit" className="mica-link">
            {dict.home.submitSnapshot} →
          </LocaleLink>
        </p>
      </Section>

      <Section
        eyebrow={dict.agents.labelsEyebrow}
        title={dict.agents.verificationTitle}
        intro={dict.agents.verificationIntro}
      >
        <DataList
          items={VERIFICATION_STATUSES.map((status) => ({
            term: `${dict.verification[status.id].label} · ${dict.verification[status.id].short}`,
            detail: dict.verification[status.id].description,
          }))}
        />
      </Section>

      <Section
        eyebrow={dict.agents.labelsEyebrow}
        title={dict.agents.tracksTitle}
      >
        <DataList
          items={RESULT_TRACKS.map((track) => ({
            term: dict.tracks[track.id].label,
            detail: dict.tracks[track.id].description,
          }))}
        />
      </Section>
    </div>
  );
}
