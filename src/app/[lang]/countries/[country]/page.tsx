import { LocaleLink } from "@/components/locale-link";
import { TaskFamilyIcon } from "@/components/task-family-icon";
import { CountryIntegrationIllustration } from "@/components/country-integration-illustration";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { COUNTRIES, getCountry } from "@/data/demo/countries";
import { heroMissionsForCountry, familyLabel } from "@/data/demo/tasks";
import { TASK_FAMILIES } from "@/data/demo/tasks";
import { DIAGNOSTIC_AXES } from "@/data/policy/axes";
import { countryCodeSchema } from "@/lib/schema";
import {
  DataList,
  DemoDisclosure,
  PageHeader,
  Section,
} from "@/components/editorial";

const AXIS_LABEL = new Map(DIAGNOSTIC_AXES.map((axis) => [axis.id, axis.label]));

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams & { country: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const lang = await readLocale(Promise.resolve(resolved));
  const { country: slug } = resolved;
  const country = getCountry(slug);
  if (!country) return { title: "Market not found" };
  return {
    title: `${country.name} edition`,
    description: country.editionNote,
    alternates: localeAlternates(lang, `/countries/${country.code}`),
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<LangParams & { country: string }>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  const { country: slug } = await params;
  const parsed = countryCodeSchema.safeParse(slug);
  const country = parsed.success ? getCountry(parsed.data) : undefined;
  if (!parsed.success || !country) notFound();

  const code = parsed.data;
  const missions = heroMissionsForCountry(code);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={`${dict.country.eyebrowPrefix} · ${country.locale} · ${country.timezone}`}
        title={`${dict.markets[code]} — ${country.nativeName}`}
        standfirst={country.editionNote}
      >
        <DemoDisclosure lang={lang} />
      </PageHeader>

      {/*
       * This market page used to open with a result table, a best-accuracy
       * table per family and a list of run-cell links. Nothing was measured
       * here, so all three are gone. What a market edition genuinely has is
       * what remains: the task families defined for it, the hazards an agent
       * meets, and what changes when the task is local.
       */}
      <Section
        eyebrow="What will be measured here"
        title={`Task families defined for ${country.name}`}
        intro="Each family is written against this market specifically. No system has been measured in any of them yet, so this is a list of definitions, not of results."
      >
        <ul className="m-0 grid list-none gap-x-8 gap-y-1 border-t border-[var(--color-rule)] p-0 pt-3 text-[14.5px] md:grid-cols-2">
          {TASK_FAMILIES.map((family) => (
            <li key={family.id} data-icon-surface="country-category">
              <LocaleLink
                lang={lang}
                href={`/tasks#${family.id}`}
                className="mica-link"
              >
                <TaskFamilyIcon family={family.id} />
                {dict.families[family.id].label}
              </LocaleLink>
              <span className="ml-2 text-[var(--color-ink-faint)]">
                {
                  family.canonicalTasks.filter((task) =>
                    task.markets.includes(code),
                  ).length
                }{" "}
                {dict.common.canonicalTasks}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Operational hazards"
        title={`Why ${country.name} is hard for an agent`}
        intro="Each hazard is tied to the diagnostic axis it loads onto, so a failure can be traced to a capability rather than to a vague sense of difficulty."
      >
        <DataList
          items={country.hazards.map((hazard) => ({
            term: hazard.title,
            detail: (
              <>
                <span className="mica-eyebrow mr-2 text-[var(--color-atlas)]">
                  {AXIS_LABEL.get(hazard.axis) ?? hazard.axis}
                </span>
                {hazard.detail}
              </>
            ),
          }))}
        />
      </Section>

      {/*
       * The declared market integration profile. It is editorial, not a table:
       * each situation is a term with a short detail and five fixed metadata
       * labels, so it wraps into one column at 390px and sits in the same
       * measure as the hazard list at 1280px.
       */}
      <Section
        id="integration"
        eyebrow={dict.integration.eyebrow}
        title={dict.integration.title}
        intro={dict.integration.intro}
      >
        {/*
         * The same plate as the editions list, drawn larger. It restates the
         * declared situations below it as geometry only; it is decorative and
         * carries no claim of a measured result.
         */}
        <div className="mica-country-plate">
          <CountryIntegrationIllustration code={code} size="detail" />
        </div>
        <p className="mica-micro mt-0 max-w-[76ch]">
          {lang === "ko"
            ? country.integrationProfile.translations.ko.summary
            : country.integrationProfile.summary}
        </p>
        <p className="mica-micro mt-2 max-w-[76ch]">
          {dict.integration.parityNote}
        </p>
        <ul
          className="m-0 list-none border-t border-[var(--color-rule)] p-0"
          data-integration-profile
        >
          {country.integrationProfile.situations.map((situation) => {
            const title =
              lang === "ko" ? situation.translations.ko.title : situation.title;
            const detail =
              lang === "ko"
                ? situation.translations.ko.detail
                : situation.detail;
            const capability =
              lang === "ko"
                ? situation.translations.ko.capabilityArea
                : situation.capabilityArea;
            const meta: [string, string][] = [
              [
                dict.integration.surfaceLabel,
                situation.surfaces
                  .map((surface) => dict.integration.surfaces[surface])
                  .join(" · "),
              ],
              [
                dict.integration.authorizationLabel,
                dict.integration.authorizations[situation.authorization],
              ],
              [
                dict.integration.completionLabel,
                dict.integration.completions[situation.completion],
              ],
              [
                dict.integration.recoveryLabel,
                situation.recovery
                  .map((item) => dict.integration.recoveries[item])
                  .join(" · "),
              ],
              [
                dict.integration.evidenceLabel,
                situation.evidence
                  .map((item) => dict.integration.evidence[item])
                  .join(" · "),
              ],
            ];
            return (
              <li
                key={situation.id}
                data-integration-situation={situation.id}
                className="border-b border-[var(--color-rule)] py-4"
              >
                <p className="mica-eyebrow m-0 text-[var(--color-atlas)]">
                  {capability}
                </p>
                <h3 className="mica-display mt-1 mb-0 text-[18px]">{title}</h3>
                <p className="mt-2 mb-0 max-w-[76ch] text-[14.5px] text-[var(--color-ink-soft)]">
                  {detail}
                </p>
                <dl className="m-0 mt-3 grid gap-x-8 gap-y-1 p-0 text-[13px] md:grid-cols-2">
                  {meta.map(([label, value]) => (
                    <div key={label} className="flex flex-wrap gap-x-2">
                      <dt className="mica-eyebrow m-0">{label}</dt>
                      <dd className="m-0 text-[var(--color-ink-soft)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
        <p className="mica-micro mt-3 max-w-[76ch]" data-integration-status>
          {dict.integration.statusNote}
        </p>
      </Section>

      <Section
        eyebrow="Localisation"
        title="What changes when the task is local"
        intro="These are the concrete differences an agent has to absorb before it can finish an everyday task here."
      >
        <ul className="m-0 list-none border-t border-[var(--color-rule)] p-0">
          {country.whatLocalChanges.map((item) => (
            <li
              key={item}
              className="max-w-[76ch] border-b border-[var(--color-rule)] py-3 text-[14.5px] text-[var(--color-ink-soft)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {missions.length > 0 ? (
        <Section
          eyebrow="Hero missions"
          title="What we actually asked for"
          intro="A hero mission is the human-readable version of a canonical task: a persona, a prompt, a declared final state, and the line the system must not cross alone."
        >
          <div className="border-t border-[var(--color-rule)]">
            {missions.map((mission) => (
              <article
                key={mission.id}
                className="mica-grid border-b border-[var(--color-rule)] py-6"
              >
                <div className="md:col-span-4">
                  <p className="mica-eyebrow">{familyLabel(mission.family)}</p>
                  <h3 className="mica-display mt-2 text-[21px]">
                    {mission.title}
                  </h3>
                  <p className="mt-2 text-[13px] text-[var(--color-ink-faint)]">
                    {mission.persona}
                  </p>
                </div>
                <div className="md:col-span-8">
                  <blockquote className="m-0 border-l-2 border-[var(--color-atlas)] pl-4 text-[15px] italic text-[var(--color-ink)]">
                    {mission.prompt}
                  </blockquote>
                  <p className="mt-3 max-w-[64ch] text-[14px] text-[var(--color-ink-soft)]">
                    <span className="mica-eyebrow mr-2">Final state</span>
                    {mission.finalState}
                  </p>
                  <p className="mt-2 max-w-[64ch] text-[14px] text-[var(--color-ink-soft)]">
                    <span className="mica-eyebrow mr-2 text-[var(--color-vermilion)]">
                      Confirmation boundary
                    </span>
                    {mission.confirmationBoundary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <nav aria-label="Other markets" className="mt-14">
        <span className="mica-ticks" aria-hidden="true" />
        <p className="mica-eyebrow mt-4">Other markets</p>
        <ul className="mt-2 flex list-none flex-wrap gap-x-6 p-0">
          {COUNTRIES.filter((other) => other.code !== code).map((other) => (
            <li key={other.code}>
              <LocaleLink lang={lang} href={`/countries/${other.code}`} className="mica-link">
                {other.name}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
