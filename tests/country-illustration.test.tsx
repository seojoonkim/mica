import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CountriesPage from "@/app/[lang]/countries/page";
import CountryPage from "@/app/[lang]/countries/[country]/page";
import { COUNTRIES } from "@/data/demo/countries";

const codes = COUNTRIES.map((country) => country.code);

async function renderIndex() {
  return render(await CountriesPage({ params: Promise.resolve({ lang: "en" }) }));
}

async function renderDetail(country: string) {
  return render(
    await CountryPage({ params: Promise.resolve({ lang: "en", country }) }),
  );
}

function plates(container: HTMLElement) {
  return [...container.querySelectorAll("[data-country-illustration]")];
}

describe("country integration illustrations", () => {
  it("renders one plate per market on the editions index", async () => {
    const index = await renderIndex();
    const marks = plates(index.container);

    expect(marks).toHaveLength(codes.length);
    expect(marks.map((mark) => mark.getAttribute("data-country-illustration"))).toEqual(
      codes,
    );

    const editions = [...index.container.querySelectorAll("[data-country-edition]")];
    expect(editions).toHaveLength(codes.length);
    for (const edition of editions) {
      expect(edition.querySelector("[data-country-illustration]")).not.toBeNull();
      expect(edition.querySelector("[data-detail-link]")).not.toBeNull();
    }
    index.unmount();
  });

  it("renders only the matching plate on each market detail page", async () => {
    for (const code of codes) {
      const detail = await renderDetail(code);
      const marks = plates(detail.container);

      expect(marks).toHaveLength(1);
      expect(marks[0]).toHaveAttribute("data-country-illustration", code);
      expect(marks[0]).toHaveAttribute("data-illustration-size", "detail");
      detail.unmount();
    }
  });

  it("reuses one component and geometry across both surfaces", async () => {
    const index = await renderIndex();
    const cardGeometry = new Map(
      plates(index.container).map((mark) => [
        mark.getAttribute("data-country-illustration"),
        mark.innerHTML,
      ]),
    );
    index.unmount();

    for (const code of codes) {
      const detail = await renderDetail(code);
      const mark = plates(detail.container)[0];
      expect(mark.innerHTML).toBe(cardGeometry.get(code));
      expect(mark.getAttribute("viewBox")).toBe("0 0 160 100");
      detail.unmount();
    }

    expect(new Set(cardGeometry.values()).size).toBe(codes.length);
  });

  it("keeps every plate decorative and free of text nodes", async () => {
    const index = await renderIndex();
    for (const mark of plates(index.container)) {
      expect(mark).toHaveAttribute("aria-hidden", "true");
      expect(mark).toHaveAttribute("focusable", "false");
      expect(mark.querySelectorAll("text, tspan, textPath, foreignObject")).toHaveLength(
        0,
      );
      expect(mark.textContent).toBe("");
    }
    index.unmount();

    const detail = await renderDetail("th");
    const mark = plates(detail.container)[0];
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveAttribute("focusable", "false");
    expect(mark.querySelectorAll("text, tspan, textPath, foreignObject")).toHaveLength(0);
    detail.unmount();
  });

  it("keeps the market name, native name and timezone in text, not in the plate", async () => {
    const index = await renderIndex();
    const editions = [...index.container.querySelectorAll("[data-country-edition]")];
    COUNTRIES.forEach((country, position) => {
      const edition = editions[position];
      expect(
        edition.querySelector(`[data-country-illustration="${country.code}"]`),
      ).not.toBeNull();
      expect(edition.textContent).toContain(country.nativeName);
      expect(edition.textContent).toContain(country.timezone);
      expect(edition.textContent).toContain(country.editionNote);
    });
    index.unmount();
  });
});
