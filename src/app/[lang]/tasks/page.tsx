import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";
import { hasPublishedResults } from "@/lib/i18n/coverage";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.tasks.metaTitle,
    description: dict.tasks.metaDescription,
    alternates: { canonical: `/${lang}/tasks` },
  };
}

export default async function TasksPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.tasks.eyebrow}
        title={dict.tasks.title}
        standfirst={dict.tasks.standfirst}
      >
        <DemoDisclosure lang={lang} detail={dict.tasks.disclosureDetail} />
        {/*
         * Ten families are defined by the taxonomy; none carries a published
         * result. Both counts are read from the fixtures.
         */}
        <p className="mica-notice mt-4 max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
          <span className="mica-eyebrow mr-2">{dict.coverage.headline}</span>
          {dict.coverage.detail}
        </p>
      </PageHeader>

      <Section
        eyebrow={dict.tasks.scoringEyebrow}
        title={dict.tasks.scoringTitle}
        intro={dict.tasks.scoringIntro}
      >
        <div className="grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] md:grid-cols-3">
          {OUTCOME_AXES.map((axis) => (
            <article key={axis.id} className="bg-[var(--color-paper)] p-5">
              <h3 className="mica-display text-[20px]">
                {dict.outcomeAxes[axis.id].label}
              </h3>
              <p className="mica-eyebrow mt-1.5">
                {dict.outcomeAxes[axis.id].unit}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <nav className="mica-task-index" aria-label={dict.tasks.title}>
        <ol>
          {TASK_FAMILIES.map((family, index) => (
            <li key={family.id}>
              <a href={`#${family.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {dict.families[family.id].label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {TASK_FAMILIES.map((family, index) => {
        const categoryNumber = String(index + 1).padStart(2, "0");

        return (
          <Section
            key={family.id}
            id={family.id}
            eyebrow={`${dict.common.categoryLabel} ${categoryNumber} · ${family.canonicalTasks.length} ${dict.common.canonicalTasks} · ${
              hasPublishedResults(family.id)
                ? dict.coverage.measuredBadge
                : dict.coverage.unmeasuredBadge
            }`}
            title={dict.families[family.id].label}
            intro={dict.families[family.id].summary}
          >
          <p className="mica-notice mica-body-sm">
            <span className="mica-eyebrow mr-2">{dict.common.whyItIsHard}</span>
            {dict.families[family.id].whyItIsHard}
          </p>
          <ol className="mica-task-list mt-6">
            {family.canonicalTasks.map((task, taskIndex) => {
              const copy = lang === "ko" ? task.translations.ko : task;
              const markets = task.markets
                .map((code) => dict.markets[code] ?? COUNTRY_BY_CODE.get(code)?.name ?? code)
                .join(", ");

              return (
                <li key={task.id} data-canonical-task>
                  <article className="mica-task-entry">
                    <div className="mica-task-heading">
                      <span aria-hidden="true">
                        {categoryNumber}.{String(taskIndex + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3>{copy.title}</h3>
                        <p>{task.id} · {markets}</p>
                      </div>
                    </div>
                    <dl className="mica-task-details">
                      <div>
                        <dt>{dict.tasks.declaredFinalState}</dt>
                        <dd>{copy.finalState}</dd>
                      </div>
                      <div className="mica-task-boundary">
                        <dt>{dict.common.confirmationBoundary}</dt>
                        <dd>{copy.confirmationBoundary}</dd>
                      </div>
                    </dl>
                  </article>
                </li>
              );
            })}
          </ol>
          </Section>
        );
      })}

    </div>
  );
}
