import { expect, test } from "@playwright/test";

const locales = ["en", "ko"] as const;
const pathFor = (lang: (typeof locales)[number]) =>
  lang === "en" ? "/methodology" : "/ko/methodology";

for (const lang of locales) {
  test(`${lang} methodology exposes a clean contents and term-detail hierarchy`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(pathFor(lang));
    await expect(page).toHaveTitle(lang === "ko" ? /방법론 — MICA/ : /Methodology — MICA/);
    await expect(page.locator(".mica-methodology")).toBeVisible();

    const hierarchy = await page.evaluate(() => {
      const toc = document.querySelector<HTMLElement>(".mica-method-toc");
      const chapter = toc?.querySelector<HTMLElement>(":scope > li > a .mica-toc-label");
      const subsection = toc?.querySelector<HTMLElement>(".mica-method-toc-sub .mica-toc-label");
      const entries = [...document.querySelectorAll<HTMLElement>(".mica-wiki-list > div")];
      if (!toc || !chapter || !subsection || entries.length === 0) return null;

      const px = (value: string) => Number.parseFloat(value);
      const chapterStyle = getComputedStyle(chapter);
      const subsectionStyle = getComputedStyle(subsection);
      const entryStyles = entries.map((entry) => {
        const term = entry.querySelector<HTMLElement>(".mica-wiki-term");
        const badge = entry.querySelector<HTMLElement>(".mica-badge");
        const detail = entry.querySelector<HTMLElement>("dd");
        if (!term || !badge || !detail) return null;
        const termStyle = getComputedStyle(term);
        const badgeStyle = getComputedStyle(badge);
        const detailStyle = getComputedStyle(detail);
        return {
          termSize: px(termStyle.fontSize),
          termWeight: Number(termStyle.fontWeight),
          detailSize: px(detailStyle.fontSize),
          detailWeight: Number(detailStyle.fontWeight),
          badgeDisplay: badgeStyle.display,
          badgeColor: badgeStyle.color,
          termColor: termStyle.color,
          detailColor: detailStyle.color,
        };
      });

      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        chapters: toc.children.length,
        subsections: toc.querySelectorAll(".mica-method-toc-sub li").length,
        chapterSize: px(chapterStyle.fontSize),
        chapterWeight: Number(chapterStyle.fontWeight),
        subsectionSize: px(subsectionStyle.fontSize),
        subsectionWeight: Number(subsectionStyle.fontWeight),
        entryCount: entries.length,
        entryStyles,
      };
    });

    expect(errors).toEqual([]);
    expect(hierarchy, "expected methodology contents and wiki entries").not.toBeNull();
    if (!hierarchy) return;
    expect(hierarchy.overflow).toBeLessThanOrEqual(0);
    expect(hierarchy.chapters).toBe(20);
    expect(hierarchy.subsections).toBe(13);
    expect(hierarchy.chapterSize).toBeGreaterThan(hierarchy.subsectionSize);
    expect(hierarchy.chapterWeight).toBeGreaterThan(hierarchy.subsectionWeight);
    expect(hierarchy.entryCount).toBeGreaterThan(0);
    expect(hierarchy.entryStyles).not.toContain(null);
    for (const entry of hierarchy.entryStyles) {
      expect(entry, "expected every wiki entry to include badge, term and detail").not.toBeNull();
      if (!entry) continue;
      expect(entry.termSize).toBeGreaterThan(entry.detailSize);
      expect(entry.termWeight).toBeGreaterThan(entry.detailWeight);
      expect(entry.badgeDisplay).toBe("block");
      expect(entry.badgeColor).not.toBe(entry.termColor);
      expect(entry.termColor).not.toBe(entry.detailColor);
    }
  });
}
