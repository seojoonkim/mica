import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PUBLICATION_RULES, THRESHOLDS_NOT_SET } from "@/data/policy/publication";
import { evaluatePublicationEligibility } from "@/lib/calc";
import { globalAccuracyRows } from "@/lib/derive";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS } from "@/data/demo/systems";
import { runCellSchema } from "@/lib/schema";
import { SYNTHETIC_ROWS, SYNTHETIC_RUN_CELLS } from "./support/synthetic";
import { ResultsTable } from "@/components/results-table";
import RankingsPage from "@/app/[lang]/rankings/page";
import HomePage from "@/app/[lang]/page";
import { generateMetadata as layoutMetadata } from "@/app/[lang]/layout";
import { SITE } from "@/lib/site";

/**
 * The shipped registries are empty and stay empty, so the row and cell shape
 * contracts are asserted against anonymous synthetic records. The derivation
 * itself is covered against the same fixtures in `derive.test.ts`; the
 * empty-registry behaviour is covered in `no-published-results.test.tsx`.
 */
describe("p95 replaces p90", () => {
  it("exposes latencyP95 and no longer exposes latencyP90", () => {
    const row = SYNTHETIC_ROWS[0];
    expect(row.latencyP95).not.toBeUndefined();
    expect("latencyP90" in row).toBe(false);
  });

  it("keeps p95 at or above p50 on every row", () => {
    for (const row of SYNTHETIC_ROWS) {
      if (row.latencyP50 === null) continue;
      expect(row.latencyP95).not.toBeNull();
      expect(row.latencyP95!).toBeGreaterThanOrEqual(row.latencyP50);
    }
  });
});

describe("run cells record all eligible latencies", () => {
  it("keeps successLatenciesSec and adds allEligibleLatenciesSec", () => {
    for (const cell of SYNTHETIC_RUN_CELLS) {
      expect(cell.successLatenciesSec).toHaveLength(cell.successfulRuns);
      expect(cell.allEligibleLatenciesSec).toHaveLength(cell.eligibleRuns);
    }
  });

  it("requires allEligibleLatenciesSec in the schema", () => {
    const { allEligibleLatenciesSec, ...rest } = SYNTHETIC_RUN_CELLS[0];
    expect(allEligibleLatenciesSec.length).toBeGreaterThan(0);
    expect(runCellSchema.safeParse(rest).success).toBe(false);
  });

  it("records no cell at all in the shipped registry", () => {
    expect(RUN_CELLS).toEqual([]);
  });
});

describe("publication thresholds are not set", () => {
  const otherwiseComplete = {
    dataStatus: "official",
    verification: "independent-rerun" as const,
    eligibleRuns: 400,
    tasksAttempted: 10,
    tasksDefined: 10,
    criticalSafetyEvents: 0,
  };

  it("declares no numeric thresholds", () => {
    expect(PUBLICATION_RULES.minEligibleRuns).toBeNull();
    expect(PUBLICATION_RULES.minCoverage).toBeNull();
  });

  it("blocks every cell with a threshold-not-set blocker", () => {
    const verdict = evaluatePublicationEligibility(otherwiseComplete);
    expect(verdict.eligible).toBe(false);
    expect(verdict.blockers).toContain(THRESHOLDS_NOT_SET);
  });

  it("never marks demo or preview records publication eligible", () => {
    for (const dataStatus of ["demo", "preview"]) {
      const verdict = evaluatePublicationEligibility({
        ...otherwiseComplete,
        dataStatus,
      });
      expect(verdict.eligible).toBe(false);
      expect(verdict.blockers.length).toBeGreaterThan(1);
    }
  });
});

describe("diagnostics are evidence-led, not scored", () => {
  it("carries no 1-5 diagnostic scores on system records", () => {
    for (const system of SYSTEMS) {
      expect("diagnostics" in system).toBe(false);
    }
  });
});

describe("global accuracy is a country macro-average", () => {
  it("has no row to average while no system is published", () => {
    expect(globalAccuracyRows()).toEqual([]);
    expect(SYSTEMS).toEqual([]);
  });

  it("never claims a pooled index-wide figure on the home page", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));
    const text = document.body.textContent ?? "";
    expect(screen.queryByText(/pooled across every market/i)).toBeNull();
    expect(text).not.toMatch(/index-wide accuracy/i);
    expect(screen.queryAllByRole("table")).toHaveLength(0);
  });
});

describe("ResultsTable", () => {
  const rows = SYNTHETIC_ROWS;

  it("shows a p95 column and no p90 column", () => {
    render(<ResultsTable rows={rows} caption="c" metric="accuracy" />);
    expect(screen.getByRole("columnheader", { name: /p95/i })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /p90/i })).toBeNull();
  });

  it("marks the ordered metric column with aria-sort", () => {
    render(<ResultsTable rows={rows} caption="c" metric="speed" />);
    expect(
      screen.getByRole("columnheader", { name: /speed p50/i }),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      screen.getByRole("columnheader", { name: /accuracy/i }),
    ).not.toHaveAttribute("aria-sort");
  });

  it("marks accuracy as descending when accuracy is the ordered metric", () => {
    render(<ResultsTable rows={rows} caption="c" metric="accuracy" />);
    expect(
      screen.getByRole("columnheader", { name: /^accuracy$/i }),
    ).toHaveAttribute("aria-sort", "descending");
  });
});

describe("Rankings is country-first and verified-first", () => {
  it("prompts for a market and shows no results table when none is selected", async () => {
    render(await RankingsPage({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/select a market/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("publishes no table and no result rows once a market is chosen", async () => {
    render(
      await RankingsPage({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({ country: "kr" }) }),
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(document.querySelector("a[href*='/evidence/']")).toBeNull();
    expect(document.body.textContent).toMatch(/no verified results are published/i);
  });

  it("publishes nothing when widened to self-reported through the filter", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ lang: "en" }),
        searchParams: Promise.resolve({
          country: "kr",
          verification: "self-reported",
        }),
      }),
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(
      screen.getByLabelText(/verification/i, { selector: "select" }),
    ).toHaveValue("self-reported");
  });

  it("offers a verification control preserved in the GET URL", async () => {
    render(
      await RankingsPage({
        params: Promise.resolve({ lang: "en" }),
        searchParams: Promise.resolve({
          country: "kr",
          family: "email-calendar",
          metric: "cost",
          verification: "provisional",
        }),
      }),
    );
    const form = screen.getByRole("form", { name: /filter/i });
    expect(form).toHaveAttribute("method", "get");
    for (const name of ["country", "family", "metric", "verification"]) {
      expect(form.querySelector(`[name="${name}"]`)).not.toBeNull();
    }
    expect(
      screen.getByLabelText(/verification/i, { selector: "select" }),
    ).toHaveValue("provisional");
  });
});

describe("demo preview metadata", () => {
  it("is noindex, nofollow while the canonical stays the live preview", async () => {
    const rootMetadata = await layoutMetadata({
      params: Promise.resolve({ lang: "en" }),
    });
    expect(rootMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(rootMetadata.metadataBase?.toString()).toContain(
      new URL(SITE.url).host,
    );
    expect(rootMetadata.alternates?.canonical).toBe("/en");
  });
});
