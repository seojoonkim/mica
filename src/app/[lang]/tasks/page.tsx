import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import { PUBLIC_TASK_FAMILIES } from "@/data/demo/tasks";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { OUTCOME_AXES } from "@/data/policy/axes";
import {
  DataList,
  PageHeader,
  PublicationStatus,
  Section,
} from "@/components/editorial";
import { TaskFamilyIcon } from "@/components/task-family-icon";
import { hasPublishedResults } from "@/lib/i18n/coverage";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.tasks.metaTitle,
    description: dict.tasks.metaDescription,
    alternates: localeAlternates(lang, "/tasks"),
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
        <PublicationStatus text={dict.tasks.publicationStatus} />
        {/*
         * Ten families are defined by the taxonomy; none carries a published
         * result. Both counts are read from the fixtures.
         */}
        <p className="mica-notice mt-4 max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
          <span className="mica-eyebrow mr-2">{dict.coverage.headline}</span>
          {dict.coverage.detail}
        </p>
      </PageHeader>

      {/*
       * A validated task earns one multiplicative final score; the raw axes
       * below it stay disclosed in their own units. Nothing on this page has
       * either, which the copy says outright rather than leaving to inference.
       */}
      <Section
        id="scoring"
        eyebrow={dict.tasks.scoringEyebrow}
        title={dict.tasks.scoringTitle}
        intro={dict.tasks.scoringIntro}
      >
        <div
          data-score-formula
          className="border border-[var(--color-rule)] p-4 sm:p-5"
        >
          <p className="mica-eyebrow m-0 text-[var(--color-atlas)]">
            {dict.tasks.scoringFormulaLabel}
          </p>
          <p className="mica-display mt-2 mb-0 text-[19px] leading-snug break-words sm:text-[24px]">
            {dict.tasks.scoringFormula}
          </p>
          <p className="mica-micro mt-2 mb-0 max-w-[70ch]">
            {dict.tasks.scoringFormulaNote}
          </p>
        </div>
        <div data-score-components className="mt-6">
          <DataList items={dict.tasks.scoringComponents} />
        </div>
        <div data-score-semantics className="mt-6">
          <DataList
            items={[
              {
                term: dict.tasks.scoringAggregationTerm,
                detail: dict.tasks.scoringAggregationDetail,
              },
              {
                term: dict.tasks.scoringRawTerm,
                detail: dict.tasks.scoringRawDetail,
              },
              {
                term: dict.tasks.scoringRoutingTerm,
                detail: dict.tasks.scoringRoutingDetail,
              },
              {
                term: dict.tasks.scoringStatusTerm,
                detail: dict.tasks.scoringStatusDetail,
              },
            ]}
          />
        </div>
        <div data-raw-axes className="mt-6 grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] md:grid-cols-3">
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

      <Section
        id="completion-policy"
        eyebrow={dict.tasks.scoringEyebrow}
        title={dict.taskPolicy.completionTitle}
        intro={dict.taskPolicy.noPartialCredit}
      >
        <div data-completion-policy>
          <ol className="mica-policy-list" role="list">
            {dict.taskPolicy.completionLevels.map((level, index) => (
              <li key={level.label} data-completion-level>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{level.label}</h3>
                  <p>{level.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <nav className="mica-task-index" aria-label={dict.tasks.catalogueNavigationLabel}>
        <ol>
          {PUBLIC_TASK_FAMILIES.map((family, index) => (
            <li key={family.id} data-icon-surface="task-jump">
              <a href={`#${family.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <TaskFamilyIcon family={family.id} />
                {dict.families[family.id].label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {PUBLIC_TASK_FAMILIES.map((family, index) => {
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
            title={
              <span className="mica-task-family-title" data-icon-surface="task-heading">
                <TaskFamilyIcon family={family.id} />
                <span>{dict.families[family.id].label}</span>
              </span>
            }
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
                <li key={task.id} data-canonical-task data-task-id={task.id}>
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
                    <details className="mica-task-contract" data-task-contract>
                      <summary aria-label={`${dict.tasks.showTaskContract}: ${copy.title}`}>
                        <span>{dict.tasks.showTaskContract}</span>
                      </summary>
                      <dl className="mica-task-details mica-task-contract-content">
                        <div>
                          <dt>{dict.tasks.declaredFinalState}</dt>
                          <dd>{copy.finalState}</dd>
                        </div>
                        <div className="mica-task-boundary">
                          <dt>{dict.common.confirmationBoundary}</dt>
                          <dd>{copy.confirmationBoundary}</dd>
                        </div>
                      </dl>
                    </details>
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
