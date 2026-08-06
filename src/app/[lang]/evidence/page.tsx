import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
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
    title: dict.evidence.metaTitle,
    description: dict.evidence.metaDescription,
    alternates: localeAlternates(lang, "/evidence"),
  };
}

/**
 * The index of run cells, with no run cells in it. The evidence model is still
 * stated in full — it is the commitment being made about every figure MICA will
 * publish — but there is no filter, no table and no cell link, because there is
 * nothing to filter, tabulate or open. `searchParams` is still accepted so an
 * old bookmarked slice resolves to this honest page rather than a 404.
 */
export default async function EvidenceIndexPage({
  params,
  searchParams,
}: {
  params: Promise<LangParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  await searchParams;

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.evidence.eyebrow}
        title={dict.evidence.title}
        standfirst={dict.evidence.standfirst}
      >
        <DemoDisclosure lang={lang} detail={dict.evidence.disclosureDetail} />
      </PageHeader>

      <Section
        eyebrow={dict.evidence.emptyEyebrow}
        title={dict.evidence.emptyTitle}
      >
        <p className="mica-notice max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
          {dict.evidence.emptyNotice}
        </p>
      </Section>

      <Section
        eyebrow={dict.evidence.modelEyebrow}
        title={dict.evidence.modelTitle}
        intro={dict.evidence.modelIntro}
      >
        <DataList
          items={[
            { term: dict.evidence.unitTerm, detail: dict.evidence.unitDetail },
            { term: dict.evidence.holdsTerm, detail: dict.evidence.holdsDetail },
            {
              term: dict.evidence.notHoldsTerm,
              detail: dict.evidence.notHoldsDetail,
            },
            {
              term: dict.evidence.derivedTerm,
              detail: dict.evidence.derivedDetail,
            },
            {
              term: dict.evidence.standingTerm,
              detail: dict.evidence.standingDetail,
            },
          ]}
        />
      </Section>

    </div>
  );
}
