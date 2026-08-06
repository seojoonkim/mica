#!/usr/bin/env node
/**
 * Bounded HTTP smoke check against a deployed MICA preview.
 *
 * Node built-ins only. Every check is a hard assertion: the first failure
 * prints a route/check-specific message and exits nonzero.
 *
 *   node scripts/smoke-production.mjs [baseUrl]
 *   MICA_BASE_URL=... node scripts/smoke-production.mjs
 */

const DEFAULT_BASE_URL = "https://mica-eta.vercel.app";
const TIMEOUT_MS = 20_000;
const EXPECT_NOINDEX = process.env.MICA_EXPECT_NOINDEX === "1";

const HTML_ROUTES = [
  "/",
  "/ko",
  "/rankings",
  "/ko/rankings",
  "/tasks",
  "/ko/tasks",
  "/methodology",
  "/ko/methodology",
];

const DATA_ROUTE = "/data/demo/mica-demo.json";
const NON_PAGE_ROUTES = ["/robots.txt", "/sitemap.xml"];
const CANONICAL_MARKETS = ["kr", "jp", "sg", "tw", "ae", "th"];

/**
 * Claims that would assert an official/verified result while the public
 * fixture is still demo. Deliberately narrow: the site's own copy repeatedly
 * says there is *no* official ranking, so bare "official ranking" is handled
 * separately with a negation check rather than being forbidden outright.
 */
const FORBIDDEN_MARKERS = [
  { label: 'embedded dataStatus "official"', re: /"dataStatus"\s*:\s*\\?"official/i },
  { label: "publicationEligible true", re: /publicationEligible\\?"?\s*:\s*true/i },
  { label: "verified official result claim", re: /verified\s+official\s+(result|ranking|edition)/i },
  { label: "official ranking publication claim", re: /(publishe[sd]|released)\s+(the\s+|its\s+)?first\s+official\s+(ranking|edition)/i },
];

/** Phrases that legitimately precede "official ranking" in disclaimer copy. */
const NEGATED_OFFICIAL_RANKING = /(not\s+an?|no|never|isn['’]t\s+an?|aren['’]t)\s+(yet\s+)?official\s+ranking/i;

const failures = [];

function fail(route, check, detail) {
  failures.push(`${route} — ${check}: ${detail}`);
}

async function fetchRoute(baseUrl, route) {
  const url = new URL(route, baseUrl).toString();
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "mica-smoke/1.0" },
  });
  return { res, body: await res.text(), url };
}

async function fetchRedirect(baseUrl, route) {
  const url = new URL(route, baseUrl).toString();
  return fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "mica-smoke/1.0" },
  });
}

function firstMatch(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function metaContent(html, name) {
  // Attribute order varies, so try both orderings.
  return (
    firstMatch(html, new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i")) ??
    firstMatch(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"))
  );
}

function canonicalHref(html) {
  return (
    firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ??
    firstMatch(html, /<link[^>]+href=["']([^"']*)["'][^>]*rel=["']canonical["']/i)
  );
}

function checkHtmlRoute(route, res, html) {
  if (res.status !== 200) {
    fail(route, "status", `expected 200, got ${res.status}`);
    return;
  }

  const lang = firstMatch(html, /<html[^>]+lang=["']([^"']+)["']/i);
  const expectedLang = route === "/ko" || route.startsWith("/ko/") ? "ko" : "en";
  if (lang !== expectedLang) fail(route, "document language", `${lang || "missing"} !== ${expectedLang}`);

  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) fail(route, "title", "missing or empty <title>");

  const description = metaContent(html, "description");
  if (!description) fail(route, "meta description", "missing or empty");

  const canonical = canonicalHref(html);
  if (!canonical) {
    fail(route, "canonical", "missing <link rel=canonical>");
  } else {
    // Accept absolute or relative; compare pathnames only.
    const resolved = new URL(canonical, res.url || "https://example.invalid");
    const want = new URL(route, "https://example.invalid").pathname.replace(/\/$/, "") || "/";
    const got = resolved.pathname.replace(/\/$/, "") || "/";
    if (got !== want) fail(route, "canonical", `pathname ${got} !== route ${want}`);
  }

  // Preview noindex may arrive via HTML meta or header. Indexable production
  // deployments leave MICA_EXPECT_NOINDEX unset and do not assert this policy.
  const robotsMeta = metaContent(html, "robots") ?? "";
  const robotsHeader = res.headers.get("x-robots-tag") ?? "";
  if (EXPECT_NOINDEX && !/noindex/i.test(robotsMeta) && !/noindex/i.test(robotsHeader)) {
    fail(
      route,
      "noindex",
      `neither meta robots (${robotsMeta || "absent"}) nor x-robots-tag (${robotsHeader || "absent"}) contains noindex`,
    );
  }
}

function checkRankingsClaims(route, html) {
  for (const { label, re } of FORBIDDEN_MARKERS) {
    if (re.test(html)) fail(route, "official-claim", `forbidden marker present: ${label}`);
  }

  for (const m of html.matchAll(/.{0,40}official\s+ranking/gi)) {
    if (!NEGATED_OFFICIAL_RANKING.test(m[0])) {
      fail(route, "official-claim", `non-negated "official ranking" claim near: ${m[0].trim()}`);
    }
  }
}

function checkDataFixture(route, res, body) {
  if (res.status !== 200) {
    fail(route, "status", `expected 200, got ${res.status}`);
    return;
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    fail(route, "json", `not parseable: ${err.message}`);
    return;
  }

  if (data.dataStatus !== "demo") fail(route, "dataStatus", `expected "demo", got ${JSON.stringify(data.dataStatus)}`);
  if (data.publicationEligible !== false) {
    fail(route, "publicationEligible", `expected false, got ${JSON.stringify(data.publicationEligible)}`);
  }

  const marketCodes = Array.isArray(data.countries)
    ? data.countries.map((country) => country?.code)
    : null;
  if (JSON.stringify(marketCodes) !== JSON.stringify(CANONICAL_MARKETS)) {
    fail(
      route,
      "countries",
      `expected canonical markets ${CANONICAL_MARKETS.join(",")}, got ${JSON.stringify(marketCodes)}`,
    );
  }

  if (!Array.isArray(data.taskFamilies) || data.taskFamilies.length !== 10) {
    fail(
      route,
      "taskFamilies",
      `expected 10 families, got ${Array.isArray(data.taskFamilies) ? data.taskFamilies.length : typeof data.taskFamilies}`,
    );
  } else {
    const taskCounts = data.taskFamilies.map((family) => family?.canonicalTasks?.length);
    if (taskCounts.some((count) => count !== 10)) {
      fail(route, "canonicalTasks", `expected 10 tasks per family, got ${JSON.stringify(taskCounts)}`);
    }
  }

  // These two arrays carry the run/system evidence. While the fixture is demo
  // they must stay empty, otherwise the public site is showing result claims.
  for (const key of ["systems", "runCells"]) {
    if (!Array.isArray(data[key])) {
      fail(route, key, `expected an array, got ${typeof data[key]}`);
    } else if (data[key].length !== 0) {
      fail(route, key, `expected empty while dataStatus is demo, got ${data[key].length} entries`);
    }
  }
}

async function main() {
  const baseUrl = process.argv[2] || process.env.MICA_BASE_URL || DEFAULT_BASE_URL;

  for (const route of HTML_ROUTES) {
    try {
      const { res, body } = await fetchRoute(baseUrl, route);
      checkHtmlRoute(route, res, body);
      if (route.endsWith("/rankings") && res.status === 200) checkRankingsClaims(route, body);
    } catch (err) {
      fail(route, "fetch", err.message);
    }
  }

  for (const [from, to] of [
    ["/en", "/"],
    ["/en/rankings?country=kr", "/rankings?country=kr"],
  ]) {
    try {
      const res = await fetchRedirect(baseUrl, from);
      const location = res.headers.get("location");
      const resolved = location ? new URL(location, baseUrl) : null;
      const got = resolved ? `${resolved.pathname}${resolved.search}` : "missing";
      if (res.status !== 308) fail(from, "legacy redirect", `expected 308, got ${res.status}`);
      if (got !== to) fail(from, "legacy redirect", `${got} !== ${to}`);
    } catch (err) {
      fail(from, "legacy redirect", err.message);
    }
  }

  for (const route of NON_PAGE_ROUTES) {
    try {
      const res = await fetchRedirect(baseUrl, route);
      if (res.status !== 200) fail(route, "non-page route", `expected 200 without redirect, got ${res.status}`);
      if (res.headers.get("location")) fail(route, "non-page route", `unexpected redirect to ${res.headers.get("location")}`);
    } catch (err) {
      fail(route, "non-page route", err.message);
    }
  }

  try {
    const { res, body } = await fetchRoute(baseUrl, DATA_ROUTE);
    checkDataFixture(DATA_ROUTE, res, body);
  } catch (err) {
    fail(DATA_ROUTE, "fetch", err.message);
  }

  if (failures.length > 0) {
    for (const line of failures) console.error(`FAIL ${line}`);
    console.error(`FAIL ${baseUrl} — ${failures.length} check(s) failed`);
    process.exit(1);
  }

  console.log(`PASS ${baseUrl} — ${HTML_ROUTES.length} HTML routes, ${NON_PAGE_ROUTES.length} non-page routes and 1 data route`);
}

await main();
