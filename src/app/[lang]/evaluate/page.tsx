import type { Metadata } from "next";
import { EvaluationPlanner } from "@/components/evaluation-planner";
import { PageHeader, PublicationStatus, Section } from "@/components/editorial";
import { getDict } from "@/lib/i18n/dictionary";
import { localeAlternates } from "@/lib/i18n/config";
import { readLocale, type LangParams } from "@/lib/i18n/route";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.evaluate.metaTitle,
    description: dict.evaluate.metaDescription,
    alternates: localeAlternates(lang, "/evaluate"),
  };
}

export default async function EvaluatePage({ params }: { params: Promise<LangParams> }) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return (
    <div>
      <PageHeader
        lang={lang}
        eyebrow={dict.evaluate.eyebrow}
        title={dict.evaluate.title}
        standfirst={dict.evaluate.standfirst}
      >
        <PublicationStatus text={dict.evaluate.boundary} />
      </PageHeader>
      <Section title={dict.evaluate.summaryTitle} intro={dict.evaluate.boundary}>
        <EvaluationPlanner dict={dict} lang={lang} />
      </Section>
    </div>
  );
}
