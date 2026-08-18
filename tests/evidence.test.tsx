import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  runCellId,
  parseRunCellId,
  getRunCellById,
  RUN_CELL_IDS,
  evidenceHref,
} from "@/lib/evidence";
import { RUN_CELLS } from "@/data/demo/runs";
import { NAV } from "@/components/nav-items";
import sitemap from "@/app/sitemap";
import EvidenceIndexPage from "@/app/[lang]/evidence/page";
import { generateStaticParams } from "@/app/[lang]/evidence/[cell]/page";

const anonymousCoordinates = {
  system: "submitted-system",
  country: "kr" as const,
  family: "email-calendar" as const,
};

describe("run-cell identity helpers", () => {
  it("builds and parses a stable coordinate id without requiring published data", () => {
    const id = runCellId(anonymousCoordinates);
    expect(id).toBe("submitted-system--kr--email-calendar");
    expect(parseRunCellId(id)).toEqual(anonymousCoordinates);
    expect(evidenceHref(anonymousCoordinates)).toBe(`/evidence/${id}`);
  });

  it("rejects invalid coordinates and unpublished cells", () => {
    expect(parseRunCellId("nope")).toBeNull();
    expect(parseRunCellId("submitted-system--zz--email-calendar")).toBeNull();
    expect(parseRunCellId("submitted-system--kr--not-a-family")).toBeNull();
    expect(getRunCellById(runCellId(anonymousCoordinates))).toBeNull();
  });
});

describe("empty evidence registry", () => {
  it("publishes no run cells or detail static params", () => {
    expect(RUN_CELLS).toEqual([]);
    expect(RUN_CELL_IDS).toEqual([]);
    expect(generateStaticParams()).toEqual([]);
  });

  it("renders an honest empty index in English", async () => {
    render(
      await EvidenceIndexPage({
        params: Promise.resolve({ lang: "en" }),
        searchParams: Promise.resolve({}),
      }),
    );
    const text = document.body.textContent ?? "";
    expect(text).toMatch(/no run cells recorded/i);
    expect(text).toMatch(/evidence registry is empty/i);
    expect(document.querySelector("a[href^='/en/evidence/']")).toBeNull();
  });

  it("renders an honest empty index in Korean", async () => {
    render(
      await EvidenceIndexPage({
        params: Promise.resolve({ lang: "ko" }),
        searchParams: Promise.resolve({ country: "kr" }),
      }),
    );
    expect(document.body.textContent).toMatch(/기록된 실행 셀 없음/);
    expect(document.body.textContent).toMatch(/근거 등록부에는 아직 기록이 없습니다/);
    expect(document.querySelector("a[href^='/ko/evidence/']")).toBeNull();
  });
});

describe("evidence routing", () => {
  it("keeps the empty registry reachable from primary navigation", () => {
    expect(NAV.some((item) => item.href === "/evidence")).toBe(true);
  });

  it("lists only evidence indexes in the sitemap, never fictional details", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/evidence"))).toBe(true);
    expect(urls.some((url) => /\/evidence\/.+/.test(new URL(url).pathname))).toBe(false);
  });
});
