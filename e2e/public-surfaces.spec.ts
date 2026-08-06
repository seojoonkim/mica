import { expect, test } from "@playwright/test";

const locales = ["en", "ko"] as const;

for (const lang of locales) {
  test(`${lang} home exposes publication status without horizontal page overflow`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page.getByTestId("publication-status")).toBeVisible();
    await expect(page.getByTestId("demo-disclosure")).toHaveCount(0);
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);

    const axisCards = page.locator(".mica-axis");
    await expect(axisCards).toHaveCount(3);
    for (const card of await axisCards.all()) {
      const heading = card.getByRole("heading", { level: 3 });
      const measure = card.locator(".mica-axis-measure");
      const rule = card.locator(".mica-axis-rule");
      await expect(heading).toBeVisible();
      await expect(measure).toBeVisible();
      await expect(rule).toBeVisible();

      const geometry = await card.evaluate((node) => {
        const headingNode = node.querySelector("h3")!;
        const measureNode = node.querySelector(".mica-axis-measure")!;
        const ruleNode = node.querySelector(".mica-axis-rule")!;
        const cardRect = node.getBoundingClientRect();
        const headingRect = headingNode.getBoundingClientRect();
        const measureRect = measureNode.getBoundingClientRect();
        const ruleRect = ruleNode.getBoundingClientRect();
        return {
          contained:
            headingRect.left >= cardRect.left &&
            headingRect.right <= cardRect.right + 1 &&
            measureRect.left >= cardRect.left &&
            measureRect.right <= cardRect.right + 1 &&
            ruleRect.left >= cardRect.left &&
            ruleRect.right <= cardRect.right + 1,
          ordered:
            headingRect.bottom < measureRect.top &&
            measureRect.bottom <= ruleRect.top,
        };
      });
      expect(geometry.contained).toBe(true);
      expect(geometry.ordered).toBe(true);
    }
  });

  test(`${lang} empty rankings status precedes controls`, async ({ page }) => {
    await page.goto(`/${lang}/rankings?country=kr&family=email-calendar`);
    const status = page.getByTestId("publication-status");
    const form = page.getByRole("form");
    await expect(status).toBeVisible();
    await expect(form).toBeVisible();
    await expect(page.getByText(lang === "en"
      ? "No verified result is published for the selected market and task family."
      : "선택한 시장과 과제 계열에는 공개된 검증 결과가 없습니다.", { exact: false })).toBeVisible();
    expect(
      await status.evaluate((node, formNode) =>
        Boolean(node.compareDocumentPosition(formNode as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      await form.elementHandle()),
    ).toBe(true);
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test(`${lang} task index and native contract remain usable`, async ({ page }) => {
    await page.goto(`/${lang}/tasks`);
    const contracts = page.locator("details[data-task-contract]");
    await expect(contracts).toHaveCount(100);
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
    const first = contracts.first();
    await expect(first).not.toHaveAttribute("open", "");
    const summary = first.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator(".mica-task-contract-content")).toBeVisible();

    const categoryLink = page.locator(".mica-task-index a").nth(1);
    await categoryLink.click();
    const targetId = (await categoryLink.getAttribute("href"))!.slice(1);
    const target = page.locator(`#${targetId}`);
    const index = page.locator(".mica-task-index");
    const [targetBox, indexBox] = await Promise.all([target.boundingBox(), index.boundingBox()]);
    expect(targetBox).not.toBeNull();
    expect(indexBox).not.toBeNull();
    expect(targetBox!.y).toBeGreaterThanOrEqual(indexBox!.y + indexBox!.height - 1);

    await first.evaluate((element) => element.removeAttribute("open"));
    await page.emulateMedia({ media: "print" });
    await expect(first.locator("summary")).toBeVisible();
    await expect(first.locator(".mica-task-contract-content")).toBeVisible();
  });
}
