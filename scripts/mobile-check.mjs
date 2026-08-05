import { chromium } from 'playwright-core';

/*
 * Browser QA for the responsive contract. 768 and 899 are checked explicitly
 * because that band is exactly where a `md:` column span used to meet a
 * one-column .mica-grid; both must now behave like the 1280 layout.
 *
 * Run against a built server on 127.0.0.1:4173. Screenshots are only written
 * when SHOT=1, and only to /tmp, so nothing lands in the repo.
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const SHOT = process.env.SHOT === '1';

const routes = [
  { path: '/', nav: null },
  { path: '/rankings?country=kr', nav: '/rankings' },
  { path: '/countries/kr', nav: '/countries' },
  { path: '/agents/hangang-assistant', nav: '/agents' },
  { path: '/evidence', nav: '/evidence' },
  { path: '/evidence/atlas-concierge--kr--email-calendar', nav: '/evidence' },
  { path: '/methodology', nav: '/methodology' },
];

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-899', width: 899, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 900 },
];

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

const results = [];
for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  for (const route of routes) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' });
    const metrics = await page.evaluate((expectedNav) => {
      const text = document.body.innerText.toLowerCase();
      const current = [...document.querySelectorAll('nav[aria-label="Primary"] a[aria-current="page"]')]
        .map((a) => a.getAttribute('href'));
      const regions = [...document.querySelectorAll('.mica-scroll-viewport')];
      // A scroller must contain its own overflow: the page never scrolls sideways.
      const scrollerContained = regions.every(
        (region) => region.getBoundingClientRect().width <= document.documentElement.clientWidth + 1,
      );
      const h1 = document.querySelector('h1');
      const statusBar = document.querySelector('.mica-statusbar');
      const statusText = statusBar?.innerText ?? '';
      return {
        title: document.title,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        h1: h1?.textContent?.trim() ?? null,
        h1Visible: !!h1 && h1.getBoundingClientRect().height > 0,
        demoStatusVisible:
          !!statusBar &&
          statusBar.getBoundingClientRect().height > 0 &&
          /illustrative demo data/i.test(statusText) &&
          /not an official ranking/i.test(statusText),
        demoTextPresent:
          text.includes('illustrative demo data') && text.includes('not an official ranking'),
        activeNav: current,
        activeNavOk: expectedNav === null ? current.length === 0 : current.includes(expectedNav),
        scrollers: regions.length,
        scrollerContained,
        scrollerFocusable: regions.every((region) => region.getAttribute('tabindex') === '0'),
      };
    }, route.nav);

    const overflow = metrics.scrollWidth > metrics.clientWidth + 1;
    const ok =
      !overflow &&
      metrics.h1Visible &&
      metrics.demoStatusVisible &&
      metrics.demoTextPresent &&
      metrics.activeNavOk &&
      metrics.scrollerContained &&
      metrics.scrollerFocusable;
    results.push({ viewport: viewport.name, route: route.path, overflow, ok, ...metrics });

    if (SHOT) {
      const slug = route.path.replace(/[^a-z0-9]+/gi, '-') || 'home';
      await page.screenshot({ path: `/tmp/mica-${viewport.name}${slug}.png`, fullPage: true });
    }
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

const failures = results.filter((result) => !result.ok);
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed:`);
  for (const failure of failures) console.error(`  ${failure.viewport} ${failure.route}`);
  process.exit(1);
}
