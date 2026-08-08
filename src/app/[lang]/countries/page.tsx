import { LocaleLink } from "@/components/locale-link";
import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/dictionary";
import { readLocale, type LangParams } from "@/lib/i18n/route";
import { localeAlternates } from "@/lib/i18n/config";
import { COUNTRIES } from "@/data/demo/countries";
import { heroMissionsForCountry } from "@/data/demo/tasks";
import { DemoDisclosure, DetailCue, PageHeader, Section } from "@/components/editorial";
import { DataTableScroller } from "@/components/data-table-scroller";
import { CountryIntegrationIllustration } from "@/components/country-integration-illustration";

export async function generateMetadata({ params }: { params: Promise<LangParams> }): Promise<Metadata> {
  const lang = await readLocale(params);
  const dict = getDict(lang);
  return {
    title: dict.countries.metaTitle,
    description: dict.countries.metaDescription,
    alternates: localeAlternates(lang, "/countries"),
  };
}

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
        {/*
         * Edition parameters only. The systems-covered and highest-accuracy
         * columns are gone with the fixture they read from: a count of covered
         * systems is a measurement claim, and MICA has made none.
         */}
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
                  {dict.table.heroMissions}
                </th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((country) => (
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
                    <td className="num">
                      {heroMissionsForCountry(country.code).length}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </DataTableScroller>
      </Section>

      <Section
        eyebrow={dict.countries.editionsEyebrow}
        title={dict.countries.editionsTitle}
        intro={dict.countries.editionsIntro}
      >
        {/*
         * Each edition carries its own integration plate: the same 160x100
         * atlas grammar, drawn for the conditions declared on that market's
         * page. The plate is decorative and repeats nothing the row does not
         * already say in text.
         */}
        <div className="mica-country-edition-grid">
          {COUNTRIES.map((country) => (
            <article
              key={country.code}
              data-country-edition
              className="mica-country-edition-card"
            >
              <CountryIntegrationIllustration code={country.code} size="card" />
              <div>
                <h3 className="mica-display m-0 text-[22px]">
                  <LocaleLink lang={lang}
                    href={`/countries/${country.code}`}
                    className="mica-country-edition-link"
                    data-detail-link
                  >
                    {dict.markets[country.code]}
                    <DetailCue />
                  </LocaleLink>
                </h3>
                <p className="mica-eyebrow mt-1">
                  {country.nativeName} · {country.timezone}
                </p>
                <p className="mt-2 mb-0 max-w-[56ch] text-[14.5px] text-[var(--color-ink-soft)]">
                  {country.editionNote}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
