import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  runCellId,
  parseRunCellId,
  getRunCellById,
  runCellEvidence,
  RUN_CELL_IDS,
  evidenceHref,
} from "@/lib/evidence";
import { RUN_CELLS } from "@/data/demo/runs";
import { NAV } from "@/components/nav-items";
import sitemap from "@/app/sitemap";
import EvidenceIndexPage from "@/app/[lang]/evidence/page";
import EvidenceCellPage, {
  generateStaticParams,
} from "@/app/[lang]/evidence/[cell]/page";

describe("run-cell identity", () => {
  it("builds a stable id from system, market and family", () => {
    expect(
      runCellId({
        system: "atlas-concierge",
        country: "kr",
        family: "email-calendar",
      }),
    ).toBe("atlas-concierge--kr--email-calendar");
  });

  it("round-trips every canonical run cell without storing a second dataset", () => {
    expect(RUN_CELL_IDS).toHaveLength(RUN_CELLS.length);
    expect(new Set(RUN_CELL_IDS).size).toBe(RUN_CELLS.length);
    for (const cell of RUN_CELLS) {
      const id = runCellId(cell);
      expect(parseRunCellId(id)).toEqual({
        system: cell.system,
        country: cell.country,
        family: cell.family,
      });
      expect(getRunCellById(id)).toBe(cell);
    }
  });

  it("rejects ids that do not name a canonical cell", () => {
    expect(parseRunCellId("nope")).toBeNull();
    expect(parseRunCellId("atlas-concierge--zz--email-calendar")).toBeNull();
    expect(parseRunCellId("atlas-concierge--kr--not-a-family")).toBeNull();
    expect(getRunCellById("ghost-system--kr--email-calendar")).toBeNull();
    expect(evidenceHref(RUN_CELLS[0])).toBe(
      `/evidence/${runCellId(RUN_CELLS[0])}`,
    );
  });
});

describe("run-cell evidence view", () => {
  const cell = RUN_CELLS.find((entry) => entry.successfulRuns > 0)!;
  const evidence = runCellEvidence(runCellId(cell))!;

  it("reports the aggregate exactly as recorded", () => {
    expect(evidence.eligibleRuns).toBe(cell.eligibleRuns);
    expect(evidence.successfulRuns).toBe(cell.successfulRuns);
    expect(evidence.allEligibleLatencyCount).toBe(
      cell.allEligibleLatenciesSec.length,
    );
    expect(evidence.totalEligibleCost).toBe(cell.totalEligibleCost);
    expect(evidence.accuracy).toBeCloseTo(
      cell.successfulRuns / cell.eligibleRuns,
    );
    expect(evidence.accuracyInterval).not.toBeNull();
    expect(evidence.latencyP95!).toBeGreaterThanOrEqual(evidence.latencyP50!);
    expect(evidence.dataStatus).toBe("demo");
    expect(evidence.publicationEligible).toBe(false);
    expect(evidence.blockers.length).toBeGreaterThan(0);
  });

  it("never claims individual attempt provenance", () => {
    expect(Object.keys(evidence)).not.toContain("attempts");
    expect(Object.keys(evidence)).not.toContain("transcripts");
  });
});

describe("evidence index page", () => {
  it("lists every canonical run cell as a link and stays demo-labelled", async () => {
    render(await EvidenceIndexPage({ params: Promise.resolve({ lang: "en" }), searchParams: Promise.resolve({}) }));
    for (const id of RUN_CELL_IDS.slice(0, 5)) {
      expect(
        document.querySelector(`a[href="/en/evidence/${id}"]`),
      ).not.toBeNull();
    }
    expect(document.body.textContent).toMatch(/illustrative demo data/i);
    expect(document.body.textContent).toMatch(/not an official ranking/i);
    expect(document.body.textContent).toMatch(/aggregate run cell/i);
  });

  it("filters by market when asked", async () => {
    render(
      await EvidenceIndexPage({
        params: Promise.resolve({ lang: "en" }),
        searchParams: Promise.resolve({ country: "kr" }),
      }),
    );
    const hrefs = [...document.querySelectorAll("a[href^='/en/evidence/']")].map(
      (a) => a.getAttribute("href")!,
    );
    const cellLinks = hrefs.filter((href) => href !== "/en/evidence");
    expect(cellLinks.length).toBeGreaterThan(0);
    expect(cellLinks.every((href) => href.includes("--kr--"))).toBe(true);
  });
});

describe("evidence detail page", () => {
  const cell = RUN_CELLS[0];
  const id = runCellId(cell);

  it("is statically generated for every canonical cell", () => {
    expect(generateStaticParams()).toHaveLength(RUN_CELLS.length);
  });

  it("states the aggregate lineage without inventing a transcript", async () => {
    render(await EvidenceCellPage({ params: Promise.resolve({ lang: "en", cell: id }) }));
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/aggregate run cell/i);
    expect(text).toMatch(/not an individual transcript/i);
    expect(text).toMatch(/no user data/i);
    expect(text).toMatch(/eligible runs/i);
    expect(text).toMatch(/95% interval/i);
    expect(text).toMatch(/cost per success/i);
    expect(text).toMatch(/task coverage/i);
    expect(text).toMatch(/critical safety events/i);
    expect(text).toMatch(/illustrative demo data/i);
    expect(screen.getByRole("link", { name: new RegExp(cell.system.split("-")[0], "i") })).toBeTruthy();
  });
});

describe("evidence routing", () => {
  it("is reachable from the primary nav", () => {
    expect(NAV.some((item) => item.href === "/evidence")).toBe(true);
  });

  it("appears in the sitemap, index and details", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/evidence"))).toBe(true);
    for (const id of RUN_CELL_IDS) {
      expect(urls.some((url) => url.endsWith(`/evidence/${id}`))).toBe(true);
    }
  });
});
