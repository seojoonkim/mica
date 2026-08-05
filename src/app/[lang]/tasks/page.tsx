import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { TASK_FAMILIES, HERO_MISSIONS, familyLabel } from "@/data/demo/tasks";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";
import { isSeededFamily } from "@/lib/i18n/coverage";

export const metadata: Metadata = {
  title: "Tasks",
  description:
    "The four MICA task families, their canonical tasks, declared final states and confirmation boundaries.",
  alternates: { canonical: "/tasks" },
};

function marketNames(codes: readonly string[]) {
  return codes
    .map((code) => COUNTRY_BY_CODE.get(code)?.name ?? code)
    .join(", ");
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
         * Ten families are defined by the taxonomy; four carry seeded demo
         * results. Both counts are read from the fixtures.
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

      {TASK_FAMILIES.map((family) => (
        <Section
          key={family.id}
          id={family.id}
          eyebrow={`${family.canonicalTasks.length} ${dict.common.canonicalTasks} · ${
            isSeededFamily(family.id)
              ? dict.coverage.measuredBadge
              : dict.coverage.unmeasuredBadge
          }`}
          title={dict.families[family.id].label}
          intro={dict.families[family.id].summary}
        >
          <p className="mica-notice max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow mr-2">{dict.common.whyItIsHard}</span>
            {dict.families[family.id].whyItIsHard}
          </p>
          <DataTableScroller
            lang={lang}
            label={`${dict.families[family.id].label} — ${dict.common.canonicalTasks}`}
            className="mt-6"
          >
            <table className="mica-table">
              <caption>
                {dict.families[family.id].label} — {dict.tasks.captionSuffix}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{dict.table.task}</th>
                  <th scope="col">{dict.tasks.declaredFinalState}</th>
                  <th scope="col">{dict.common.confirmationBoundary}</th>
                  <th scope="col">{dict.table.markets}</th>
                </tr>
              </thead>
              <tbody>
                {family.canonicalTasks.map((task) => (
                  <tr key={task.id}>
                    <th scope="row" className="max-w-[26ch] font-normal">
                      {task.title}
                      <span className="mt-1 block font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-ink-faint)]">
                        {task.id}
                      </span>
                    </th>
                    <td className="max-w-[34ch] text-[13.5px] text-[var(--color-ink-soft)]">
                      {task.finalState}
                    </td>
                    <td className="max-w-[34ch] text-[13.5px] text-[var(--color-vermilion)]">
                      {task.confirmationBoundary}
                    </td>
                    <td className="text-[13px] text-[var(--color-ink-faint)]">
                      {marketNames(task.markets)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableScroller>
        </Section>
      ))}

      <Section
        eyebrow={dict.tasks.missionsEyebrow}
        title={dict.tasks.missionsTitle}
        intro={dict.tasks.missionsIntro}
      >
        <div className="border-t border-[var(--color-rule)]">
          {HERO_MISSIONS.map((mission) => (
            <article
              key={mission.id}
              className="mica-grid border-b border-[var(--color-rule)] py-5"
            >
              <div className="md:col-span-3">
                <h3 className="mica-display text-[18px]">{mission.title}</h3>
                <p className="mica-eyebrow mt-1">
                  <LocaleLink lang={lang}
                    href={`/countries/${mission.country}`}
                    className="mica-link"
                  >
                    {COUNTRY_BY_CODE.get(mission.country)?.name ??
                      mission.country}
                  </LocaleLink>{" "}
                  · {familyLabel(mission.family)}
                </p>
              </div>
              <blockquote className="m-0 border-l-2 border-[var(--color-atlas)] pl-4 text-[14.5px] italic text-[var(--color-ink)] md:col-span-6">
                {mission.prompt}
              </blockquote>
              <p className="text-[13px] text-[var(--color-ink-faint)] md:col-span-3">
                {mission.confirmationBoundary}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
