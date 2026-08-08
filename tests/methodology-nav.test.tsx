import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import MethodologyPage from "@/app/[lang]/methodology/page";
import { WIKI_CHAPTERS } from "@/data/methodology/wiki";

const LOCALES = ["en", "ko"] as const;
type TestLocale = (typeof LOCALES)[number];

async function renderPage(lang: TestLocale) {
  return render(await MethodologyPage({ params: Promise.resolve({ lang }) }));
}

function getTocNav(lang: TestLocale) {
  return screen.getByRole("navigation", {
    name: lang === "ko" ? /이 페이지의 목차/ : /on this page/i,
  });
}

/** Every contents entry, read back out of the rendered nav in document order. */
function tocEntries(nav: HTMLElement) {
  return [...nav.querySelectorAll("a[data-toc-link]")].map((link) => ({
    id: link.getAttribute("data-toc-link")!,
    href: link.getAttribute("href")!,
    depth: Number(link.getAttribute("data-toc-depth")),
    number:
      link.querySelector("[data-toc-number]")?.textContent?.trim() ?? null,
  }));
}

/** Every numbered section, read back out of the rendered body in order. */
function bodySections(container: HTMLElement) {
  return [...container.querySelectorAll("[data-editorial-section][data-section-number]")].map(
    (section) => ({
      id: section.getAttribute("id"),
      number: section.getAttribute("data-section-number")!,
      headingNumber: section
        .querySelector("[data-section-heading-number]")
        ?.textContent?.trim(),
      headingText: section.querySelector("h2")!.textContent ?? "",
    }),
  );
}

describe("methodology on-this-page navigation", () => {
  it("offers a named nav whose links all resolve to real section ids", async () => {
    const { container } = await renderPage("en");
    const nav = getTocNav("en");
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(5);
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      expect(href.startsWith("#")).toBe(true);
      expect(container.querySelector(`[id="${href.slice(1)}"]`)).not.toBeNull();
    }
  });
});

describe.each(LOCALES)("methodology academic numbering (%s)", (lang) => {
  it("numbers the contents and the body identically, in the same order", async () => {
    const { container } = await renderPage(lang);
    const nav = getTocNav(lang);

    const toc = tocEntries(nav);
    const body = bodySections(container);

    expect(toc.length).toBe(body.length);
    expect(toc.map((entry) => [entry.id, entry.number])).toEqual(
      body.map((section) => [section.id, section.number]),
    );
  });

  it("puts the number inside the heading exactly once", async () => {
    const { container } = await renderPage(lang);
    for (const section of bodySections(container)) {
      expect(section.headingNumber).toBe(section.number);
      // The screen reader gets the number as part of the heading name, and the
      // heading holds one copy of it, not two.
      expect(section.headingText.startsWith(section.number)).toBe(true);
      const occurrences = section.headingText.split(section.number).length - 1;
      expect(occurrences).toBe(1);
    }
  });

  it("gives every wiki chapter a whole number and the colophon the next one", async () => {
    const { container } = await renderPage(lang);
    const nav = getTocNav(lang);
    const chapters = tocEntries(nav).filter((entry) => entry.depth === 1);

    expect(chapters.length).toBe(WIKI_CHAPTERS.length + 1);
    expect(chapters.map((entry) => entry.number)).toEqual(
      chapters.map((_, index) => String(index + 1)),
    );
    expect(chapters.slice(0, WIKI_CHAPTERS.length).map((entry) => entry.id)).toEqual(
      WIKI_CHAPTERS.map((chapter) => chapter.id),
    );

    const colophon = chapters.at(-1)!;
    expect(colophon.id).toBe("wiki-colophon");
    expect(colophon.number).toBe(String(WIKI_CHAPTERS.length + 1));
    expect(container.querySelector("#wiki-colophon")).not.toBeNull();
  });

  it("numbers every subsection under the chapter that owns it", async () => {
    const nav = (await renderPage(lang), getTocNav(lang));
    const entries = tocEntries(nav);

    let currentChapter: string | null = null;
    let expectedSub = 0;
    for (const entry of entries) {
      if (entry.depth === 1) {
        currentChapter = entry.number;
        expectedSub = 0;
        continue;
      }
      expect(entry.depth).toBe(2);
      expect(currentChapter).not.toBeNull();
      expectedSub += 1;
      expect(entry.number).toBe(`${currentChapter}.${expectedSub}`);
    }
    // The page really does have nested subsections, so the walk above is not
    // passing on an empty list.
    expect(entries.filter((entry) => entry.depth === 2).length).toBeGreaterThan(5);
  });

  it("nests subsections inside their chapter's list item", async () => {
    const { container } = await renderPage(lang);
    const nav = getTocNav(lang);

    const chapterList = nav.querySelector('ol[data-toc-level="chapter"]');
    expect(chapterList).not.toBeNull();
    // No flat pill list: the contents is one ordered list with nested lists.
    expect(nav.querySelector(".mica-toc")).toBeNull();

    for (const sublist of nav.querySelectorAll('ol[data-toc-level="subsection"]')) {
      const owner = sublist.closest("li")!;
      const ownerNumber = owner
        .querySelector("a[data-toc-link] [data-toc-number]")!
        .textContent!.trim();
      for (const link of sublist.querySelectorAll("[data-toc-number]")) {
        expect(link.textContent!.trim().startsWith(`${ownerNumber}.`)).toBe(true);
      }
    }

    for (const entry of tocEntries(nav)) {
      expect(container.querySelector(`[id="${entry.href.slice(1)}"]`)).not.toBeNull();
    }
  });

  it("repeats no id and no number", async () => {
    const { container } = await renderPage(lang);
    const nav = getTocNav(lang);

    for (const list of [tocEntries(nav), bodySections(container)]) {
      const ids = list.map((entry) => entry.id);
      const numbers = list.map((entry) => entry.number);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });
});

describe("methodology numbering parity across locales", () => {
  it("uses the same ids and the same numbers in English and Korean", async () => {
    const en = await renderPage("en");
    const enNav = getTocNav("en");
    const enToc = tocEntries(enNav);
    const enBody = bodySections(en.container);
    en.unmount();

    const ko = await renderPage("ko");
    const koNav = getTocNav("ko");
    const koToc = tocEntries(koNav);
    const koBody = bodySections(ko.container);

    expect(koToc.map((e) => [e.id, e.number, e.depth])).toEqual(
      enToc.map((e) => [e.id, e.number, e.depth]),
    );
    expect(koBody.map((s) => [s.id, s.number])).toEqual(
      enBody.map((s) => [s.id, s.number]),
    );
  });
});

describe("editorial Section stays backward compatible", () => {
  it("keeps the decorative counter when no explicit number is passed", async () => {
    const { container } = await renderPage("en");
    // Methodology passes a number to every section, so nothing here should be
    // falling back — but the fallback markup must still exist for other pages.
    expect(container.querySelectorAll(".mica-section-num").length).toBe(0);
    expect(
      container.querySelectorAll("[data-editorial-section]").length,
    ).toBe(container.querySelectorAll("[data-section-number]").length);
  });
});
