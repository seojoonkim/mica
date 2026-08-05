import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PUBLICATION_RULES, THRESHOLDS_NOT_SET } from "@/data/policy/publication";
import { evaluatePublicationEligibility } from "@/lib/calc";
import { aggregateBySystem, globalAccuracyRows } from "@/lib/derive";
import { RUN_CELLS } from "@/data/demo/runs";
import { SYSTEMS } from "@/data/demo/systems";
import { runCellSchema } from "@/lib/schema";
import { ResultsTable } from "@/components/results-table";
import RankingsPage from "@/app/rankings/page";
import HomePage from "@/app/page";
import { metadata as rootMetadata } from "@/app/layout";
import { SITE } from "@/lib/site";

describe("p95 replaces p90", () => {
  it("exposes latencyP95 and no longer exposes latencyP90", () => {
    const row = aggregateBySystem({ country: "kr" })[0];
    expect(row.latencyP95).not.toBeUndefined();
    expect("latencyP90" in row).toBe(false);
  });

  it("computes p95 from successful runs only and at or above p50", () => {
    for (const row of aggregateBySystem({ country: "kr" })) {
      if (row.latencyP50 === null) continue;
      expect(row.latencyP95).not.toBeNull();
      expect(row.latencyP95!).toBeGreaterThanOrEqual(row.latencyP50);
    }
  });
});

describe("run cells record all eligible latencies", () => {
  it("keeps successLatenciesSec and adds allEligibleLatenciesSec", () => {
    for (const cell of RUN_CELLS) {
      expect(cell.successLatenciesSec).toHaveLength(cell.successfulRuns);
      expect(cell.allEligibleLatenciesSec).toHaveLength(cell.eligibleRuns);
    }
  });

  it("requires allEligibleLatenciesSec in the schema", () => {
    const cell = RUN_CELLS[0];
    const { allEligibleLatenciesSec, ...rest } = cell;
    expect(allEligibleLatenciesSec.length).toBeGreaterThan(0);
    expect(runCellSchema.safeParse(rest).success).toBe(false);
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
  it("returns one row per system with a macro-average or an explicit null", () => {
    const rows = globalAccuracyRows();
    expect(rows).toHaveLength(SYSTEMS.length);
    const partial = rows.find((row) => row.systemSlug === "hangang-assistant")!;
    expect(partial.accuracy).toBeNull();
    const full = rows.find((row) => row.systemSlug === "atlas-concierge")!;
    expect(full.accuracy).not.toBeNull();
  });

  it("does not reuse the pooled-run accuracy", () => {
    const macro = globalAccuracyRows().find(
      (row) => row.systemSlug === "atlas-concierge",
    )!.accuracy!;
    const pooled = aggregateBySystem().find(
      (row) => row.systemSlug === "atlas-concierge",
    )!.accuracy!;
    expect(macro).not.toBe(pooled);
  });

  it("says macro-average on the home page and never pooled", () => {
    render(HomePage());
    expect(screen.getAllByText(/country macro-average/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText(/pooled across every market/i)).toBeNull();
  });
});

describe("ResultsTable", () => {
  const rows = aggregateBySystem({ country: "kr" });

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
    render(await RankingsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/select a market/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows only independently rerun systems by default once a market is chosen", async () => {
    render(
      await RankingsPage({ searchParams: Promise.resolve({ country: "kr" }) }),
    );
    const table = screen.getByRole("table");
    expect(within(table).getByText("Atlas Concierge")).toBeInTheDocument();
    expect(within(table).queryByText("Swift Errand")).toBeNull();
    expect(within(table).queryByText("Hangang Assistant")).toBeNull();
  });

  it("can widen to self-reported rows through the verification filter", async () => {
    render(
      await RankingsPage({
        searchParams: Promise.resolve({
          country: "kr",
          verification: "self-reported",
        }),
      }),
    );
    const table = screen.getByRole("table");
    expect(within(table).getByText("Swift Errand")).toBeInTheDocument();
    expect(within(table).queryByText("Atlas Concierge")).toBeNull();
  });

  it("offers a verification control preserved in the GET URL", async () => {
    render(
      await RankingsPage({
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
  it("is noindex, nofollow while the canonical stays the live preview", () => {
    expect(rootMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(rootMetadata.metadataBase?.toString()).toContain(
      new URL(SITE.url).host,
    );
    expect(rootMetadata.alternates?.canonical).toBe("/");
  });
});
