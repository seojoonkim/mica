import Link from "next/link";
import type { Metadata } from "next";
import { TASK_FAMILIES, HERO_MISSIONS, familyLabel } from "@/data/demo/tasks";
import { COUNTRY_BY_CODE } from "@/data/demo/countries";
import { OUTCOME_AXES } from "@/data/policy/axes";
import { DemoDisclosure, PageHeader, Section } from "@/components/editorial";

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

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Task definitions"
        title="A task is a final state, not a transcript"
        standfirst="Every MICA task declares the state the world must be in for the run to count, and the line past which the system must stop and ask. Nothing is scored on how convincing the agent sounded along the way."
      >
        <DemoDisclosure detail="The task definitions on this page are the real thing; the run figures elsewhere on the site are illustrative demo data and not an official ranking." />
      </PageHeader>

      <Section
        eyebrow="Scoring contract"
        title="What a completed task earns"
        intro="A run contributes to three separate results. It never contributes to a combined one."
      >
        <div className="grid gap-px border border-[var(--color-rule)] bg-[var(--color-rule)] md:grid-cols-3">
          {OUTCOME_AXES.map((axis) => (
            <article key={axis.id} className="bg-[var(--color-paper)] p-5">
              <h3 className="mica-display text-[20px]">{axis.label}</h3>
              <p className="mica-eyebrow mt-1.5">{axis.unit}</p>
            </article>
          ))}
        </div>
      </Section>

      {TASK_FAMILIES.map((family) => (
        <Section
          key={family.id}
          id={family.id}
          eyebrow={`${family.canonicalTasks.length} canonical tasks`}
          title={family.label}
          intro={family.summary}
        >
          <p className="mica-notice max-w-[76ch] text-[14px] text-[var(--color-ink-soft)]">
            <span className="mica-eyebrow mr-2">Why it is hard</span>
            {family.whyItIsHard}
          </p>
          <div className="mica-scroller mt-6">
            <table className="mica-table">
              <caption>
                {family.label} — canonical tasks, declared final states and
                confirmation boundaries.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">Declared final state</th>
                  <th scope="col">Confirmation boundary</th>
                  <th scope="col">Markets</th>
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
          </div>
        </Section>
      ))}

      <Section
        eyebrow="Worked examples"
        title="Hero missions across the index"
        intro="One mission per market and family, written the way a person would actually ask."
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
                  <Link
                    href={`/countries/${mission.country}`}
                    className="mica-link"
                  >
                    {COUNTRY_BY_CODE.get(mission.country)?.name ??
                      mission.country}
                  </Link>{" "}
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
