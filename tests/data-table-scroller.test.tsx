import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { DataTableScroller } from "@/components/data-table-scroller";
import { ResultsTable } from "@/components/results-table";
import { aggregateBySystem } from "@/lib/derive";
import HomePage from "@/app/[lang]/page";

describe("DataTableScroller", () => {
  it("is a keyboard-focusable region with the caption as its name", () => {
    render(
      <DataTableScroller label="Demo accuracy spread by market">
        <table>
          <caption>Demo accuracy spread by market</caption>
          <tbody>
            <tr>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </DataTableScroller>,
    );
    const region = screen.getByRole("region", {
      name: /demo accuracy spread by market/i,
    });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });

  it("carries a horizontal-scroll cue that is not read twice", () => {
    render(
      <DataTableScroller label="Slice">
        <table>
          <tbody>
            <tr>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </DataTableScroller>,
    );
    const cue = screen.getByText(/scroll horizontally/i);
    expect(cue).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ResultsTable uses the shared scroller", () => {
  const rows = aggregateBySystem({ country: "kr" });

  it("wraps its table in a named focusable region", () => {
    render(<ResultsTable rows={rows} caption="Korea slice" metric="accuracy" />);
    const region = screen.getByRole("region", { name: /korea slice/i });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });

  it("visually highlights the active metric column and keeps aria-sort", () => {
    render(<ResultsTable rows={rows} caption="c" metric="speed" />);
    const header = screen.getByRole("columnheader", { name: /speed p50/i });
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(header.className).toContain("is-metric");
    const accuracy = screen.getByRole("columnheader", { name: /^accuracy$/i });
    expect(accuracy.className).not.toContain("is-metric");
  });

  it("right-aligns numeric cells with tabular figures", () => {
    render(<ResultsTable rows={rows} caption="c" metric="accuracy" />);
    const header = screen.getByRole("columnheader", { name: /^accuracy$/i });
    expect(header.className).toContain("num");
  });
});

describe("home page tables adopt the scroller", () => {
  it("gives every data table a focusable named region", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "en" }) }));
    const tables = screen.getAllByRole("table");
    const regions = screen.getAllByRole("region");
    expect(regions.length).toBeGreaterThanOrEqual(tables.length);
    for (const table of tables) {
      expect(table.closest("[role='region']")).not.toBeNull();
    }
  });
});
