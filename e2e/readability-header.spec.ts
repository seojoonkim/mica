import { expect, test } from "@playwright/test";

const locales = ["en", "ko"] as const;
const pages = ["", "/rankings", "/tasks", "/methodology", "/evidence", "/submit"] as const;
const localePath = (lang: (typeof locales)[number], path: string) =>
  lang === "en" ? path || "/" : `/ko${path}`;

function luminance([r, g, b]: number[]) {
  return [r, g, b]
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground: number[], background: number[]) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

for (const lang of locales) {
  for (const path of pages) {
    test(`${lang} ${path || "home"} keeps readable type and a fixed two-row header`, async ({ page }) => {
      await page.goto(localePath(lang, path));
      await page.evaluate(() => document.fonts.ready);

      const audit = await page.evaluate(() => {
        const parseRgb = (value: string) =>
          (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const visibleText = [...document.querySelectorAll<HTMLElement>("body *")].filter((node) => {
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return (
            node.children.length === 0 &&
            Boolean(node.textContent?.trim()) &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rect.width > 0 &&
            rect.height > 0
          );
        });
        const masthead = document.querySelector<HTMLElement>(".mica-masthead")!;
        const h1 = document.querySelector<HTMLElement>("h1")!;
        const h2 = document.querySelector<HTMLElement>("h2");
        const mastheadBefore = masthead.getBoundingClientRect();
        const headerRows = masthead.querySelector(".mica-shell")?.children.length ?? 0;
        window.scrollTo(0, Math.min(800, document.documentElement.scrollHeight - innerHeight));
        const mastheadAfter = masthead.getBoundingClientRect();
        const faintNode = visibleText.find(
          (node) => getComputedStyle(node).color === "rgb(147, 163, 179)",
        );
        const minimumFontSize = Math.min(
          ...visibleText.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)),
        );
        const minimumNodes = visibleText
          .filter((node) => Number.parseFloat(getComputedStyle(node).fontSize) === minimumFontSize)
          .map((node) => ({ tag: node.tagName, className: node.className, text: node.textContent?.trim() }));
        return {
          minimumFontSize,
          minimumNodes,
          faint: parseRgb(getComputedStyle(faintNode ?? document.body).color),
          paper: parseRgb(getComputedStyle(document.body).backgroundColor),
          mastheadPosition: getComputedStyle(masthead).position,
          mastheadTopBefore: mastheadBefore.top,
          mastheadTopAfter: mastheadAfter.top,
          mastheadHeight: mastheadBefore.height,
          headerRows,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          h1Size: Number.parseFloat(getComputedStyle(h1).fontSize),
          h2Size: h2 ? Number.parseFloat(getComputedStyle(h2).fontSize) : null,
          bodySize: Number.parseFloat(getComputedStyle(document.body).fontSize),
        };
      });

      expect(audit.minimumFontSize, JSON.stringify(audit.minimumNodes)).toBeGreaterThanOrEqual(10);
      expect(contrast(audit.faint, audit.paper)).toBeGreaterThanOrEqual(6.5);
      expect(audit.mastheadPosition).toBe("sticky");
      expect(audit.mastheadTopBefore).toBeGreaterThanOrEqual(-1);
      expect(audit.mastheadTopAfter).toBeGreaterThanOrEqual(-1);
      expect(audit.headerRows).toBeLessThanOrEqual(2);
      expect(audit.overflow).toBeLessThanOrEqual(0);
      expect(audit.h1Size).toBeGreaterThan(audit.bodySize * 1.8);
      if (audit.h2Size !== null) expect(audit.h2Size).toBeGreaterThan(audit.bodySize * 1.35);
      if (page.viewportSize()!.width === 390) expect(audit.mastheadHeight).toBeLessThanOrEqual(132);
    });
  }
}
