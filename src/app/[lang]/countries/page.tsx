import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { COUNTRIES } from "@/data/demo/countries";
import { countrySnapshot } from "@/lib/derive";
import { formatPercent, missingLabels } from "@/lib/format";
import { heroMissionsForCountry } from "@/data/demo/tasks";
import {
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";

export const metadata: Metadata = {
  title: "Countries",
  description:
    "The five markets in the MICA index and what changes for a consumer agent in each.",
  alternates: { canonical: "/countries" },
};

export default async function CountriesPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const lang = await readLocale(params);
  const dict = getDict(lang);

  return (
    <div>
      <PageHeader lang={lang}
        eyebrow={dict.countries.eyebrow}
        title={dict.countries.title}
        standfirst={dict.countries.standfirst}
      >
        <DemoDisclosure lang={lang} />
      </PageHeader>

      <Section
        eyebrow={dict.countries.coverageEyebrow}
        title={dict.countries.coverageTitle}
        intro={dict.countries.coverageIntro}
      >
        <DemoStamp lang={lang} className="mb-4" />
        <DataTableScroller lang={lang} label={dict.countries.coverageCaption}>
          <table className="mica-table">
            <caption>
              {dict.countries.coverageCaption} — {dict.table.captionSuffix}
            </caption>
            <thead>
              <tr>
                <th scope="col">{dict.table.market}</th>
                <th scope="col">{dict.table.locale}</th>
                <th scope="col">{dict.table.currency}</th>
                <th scope="col" className="num">
                  {dict.table.systemsCovered}
                </th>
                <th scope="col" className="num">
                  {dict.countries.highestAccuracy}
                </th>
                <th scope="col" className="num">
                  {dict.table.heroMissions}
                </th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((country) => {
                const rows = countrySnapshot(country.code);
                const best = rows[0]?.accuracy ?? null;
                return (
                  <tr key={country.code}>
                    <th scope="row" className="font-normal">
                      <LocaleLink lang={lang}
                        href={`/countries/${country.code}`}
                        className="mica-link"
                      >
                        {dict.markets[country.code]}
                      </LocaleLink>
                      <span className="ml-2 text-[var(--color-ink-faint)]">
                        {country.nativeName}
                      </span>
                    </th>
                    <td className="font-[family-name:var(--font-mono)] text-[12.5px]">
                      {country.locale}
                    </td>
                    <td className="font-[family-name:var(--font-mono)] text-[12.5px]">
                      {country.currency} {country.currencySymbol}
                    </td>
                    <td className="num">{rows.length}</td>
                    <td className="num">
                      {best === null
                        ? missingLabels(lang).noData
                        : formatPercent(best, 1, lang)}
                    </td>
                    <td className="num">
                      {heroMissionsForCountry(country.code).length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow={dict.countries.editionsEyebrow}
        title={dict.countries.editionsTitle}
        intro={dict.countries.editionsIntro}
      >
        <div className="border-t border-[var(--color-rule)]">
          {COUNTRIES.map((country) => (
            <article
              key={country.code}
              className="mica-grid border-b border-[var(--color-rule)] py-6"
            >
              <div className="md:col-span-4">
                <h3 className="mica-display text-[24px]">
                  <LocaleLink lang={lang}
                    href={`/countries/${country.code}`}
                    className="text-[var(--color-ink)] no-underline hover:text-[var(--color-vermilion)]"
                  >
                    {dict.markets[country.code]}
                  </LocaleLink>
                </h3>
                <p className="mica-eyebrow mt-1">
                  {country.nativeName} · {country.timezone}
                </p>
              </div>
              <p className="max-w-[64ch] text-[14.5px] text-[var(--color-ink-soft)] md:col-span-8">
                {country.editionNote}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
