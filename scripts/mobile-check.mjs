import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const routes = ['/', '/rankings', '/countries/kr'];
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];
const results = [];
for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => ({
      title: document.title,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      demo: document.body.innerText.includes('ILLUSTRATIVE DEMO DATA'),
      h1: document.querySelector('h1')?.textContent?.trim() ?? null,
      focusable: document.querySelectorAll('a[href],button,input,select,textarea').length,
    }));
    results.push({ viewport: viewport.name, route, ...metrics, overflow: metrics.scrollWidth > metrics.clientWidth });
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.overflow || !result.demo || !result.h1)) process.exit(1);
