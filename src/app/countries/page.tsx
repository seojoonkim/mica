import Link from "next/link";
import type { Metadata } from "next";
import { COUNTRIES } from "@/data/demo/countries";
import { countrySnapshot } from "@/lib/derive";
import { formatPercent, NO_DATA } from "@/lib/format";
import { heroMissionsForCountry } from "@/data/demo/tasks";
import {
  DemoDisclosure,
  DemoStamp,
  PageHeader,
  Section,
} from "@/components/editorial";

export const metadata: Metadata = {
  title: "Countries",
  description:
    "The five markets in the MICA index and what changes for a consumer agent in each.",
  alternates: { canonical: "/countries" },
};

export default function CountriesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Market index"
        title="Five markets, five different problems"
        standfirst="MICA does not translate one market's benchmark into four others. Each edition is written against the payment rails, identity checks, address formats and service conventions that actually exist there."
      >
        <DemoDisclosure />
      </PageHeader>

      <Section
        eyebrow="Derived from run cells"
        title="Coverage at a glance"
        intro="Systems covered counts the systems with at least one demo run cell in the market."
      >
        <DemoStamp className="mb-4" />
        <div className="mica-scroller">
          <table className="mica-table">
            <caption>
              Market coverage — Illustrative demo data, not an official ranking.
            </caption>
            <thead>
              <tr>
                <th scope="col">Market</th>
                <th scope="col">Locale</th>
                <th scope="col">Currency</th>
                <th scope="col" className="num">
                  Systems covered
                </th>
                <th scope="col" className="num">
                  Highest demo accuracy
                </th>
                <th scope="col" className="num">
                  Hero missions
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
                      <Link
                        href={`/countries/${country.code}`}
                        className="mica-link"
                      >
                        {country.name}
                      </Link>
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
                      {best === null ? NO_DATA : formatPercent(best)}
                    </td>
                    <td className="num">
                      {heroMissionsForCountry(country.code).length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        eyebrow="Editions"
        title="What the edition note says"
        intro="Each market edition is signed with a note explaining the choices MICA made about scope in that country."
      >
        <div className="border-t border-[var(--color-rule)]">
          {COUNTRIES.map((country) => (
            <article
              key={country.code}
              className="mica-grid border-b border-[var(--color-rule)] py-6"
            >
              <div className="md:col-span-4">
                <h3 className="mica-display text-[24px]">
                  <Link
                    href={`/countries/${country.code}`}
                    className="text-[var(--color-ink)] no-underline hover:text-[var(--color-vermilion)]"
                  >
                    {country.name}
                  </Link>
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
