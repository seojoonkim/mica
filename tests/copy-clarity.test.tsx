import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { COUNTRIES } from "@/data/demo/countries";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";
import HomePage from "@/app/[lang]/page";
import { generateMetadata as homeMetadata } from "@/app/[lang]/page";
import { generateMetadata as countriesMetadata } from "@/app/[lang]/countries/page";
import { generateMetadata as rankingsMetadata } from "@/app/[lang]/rankings/page";
import { generateMetadata as agentsMetadata } from "@/app/[lang]/agents/page";
import { generateMetadata as tasksMetadata } from "@/app/[lang]/tasks/page";
import { generateMetadata as evidenceMetadata } from "@/app/[lang]/evidence/page";
import MethodologyPage, {
  generateMetadata as methodologyMetadata,
} from "@/app/[lang]/methodology/page";
import GovernancePage, {
  generateMetadata as governanceMetadata,
} from "@/app/[lang]/about/governance/page";
import SubmitPage, {
  generateMetadata as submitMetadata,
} from "@/app/[lang]/submit/page";

describe("plain-language public copy", () => {
  it("states the canonical market count everywhere it summarizes coverage", () => {
    expect(en.common.editionSummary).toContain(`${COUNTRIES.length} markets`);
    expect(ko.common.editionSummary).toContain(`${COUNTRIES.length}개 시장`);
    expect(en.home.bandEyebrow).toContain(String(COUNTRIES.length));
    expect(ko.home.bandEyebrow).toContain(String(COUNTRIES.length));
  });

  it("does not present unavailable results or submissions as available actions", () => {
    expect(en.home.readTables).toMatch(/preview|how results/i);
    expect(ko.home.readTables).toMatch(/미리 보기|공개 방식/);
    expect(en.nav.submit).toMatch(/requirements|how submissions/i);
    expect(ko.nav.submit).toMatch(/요건|안내/);
    expect(en.submit.title).not.toMatch(/^Submit\b/i);
    expect(ko.submit.title).not.toMatch(/제출$/);
  });

  it("uses reader-facing terms for the most visible benchmark concepts", () => {
    expect(ko.common.finalState).toBe("완료 조건");
    expect(ko.common.confirmationBoundary).toBe("사용자 승인이 필요한 지점");
    expect(ko.table.snapshot).toBe("평가용 시스템 버전");
    expect(ko.table.runCell).toBe("평가 결과 묶음");
    expect(ko.table.locale).toBe("언어·지역 설정");
    expect(ko.chrome.colophonNote).not.toContain("publicationEligible");
  });

  it("removes the unlabeled mixed-purpose edition strip from the home hero", async () => {
    render(await HomePage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(document.querySelector(".mica-strip")).toBeNull();
  });
});

describe("Korean detail routes", () => {
  it("localizes metadata for every public Korean index route", async () => {
    const params = () => Promise.resolve({ lang: "ko" });
    await expect(homeMetadata({ params: params() })).resolves.toMatchObject({
      title: `MICA — ${ko.site.longName}`,
      description: ko.site.definition,
      alternates: { canonical: "/ko" },
    });
    for (const [metadata, copy, path] of [
      [countriesMetadata, ko.countries, "/ko/countries"],
      [rankingsMetadata, ko.rankings, "/ko/rankings"],
      [agentsMetadata, ko.agents, "/ko/agents"],
      [tasksMetadata, ko.tasks, "/ko/tasks"],
      [evidenceMetadata, ko.evidence, "/ko/evidence"],
    ] as const) {
      await expect(metadata({ params: params() })).resolves.toMatchObject({
        title: copy.metaTitle,
        description: copy.metaDescription,
        alternates: { canonical: path },
      });
    }
    expect(ko.rankings.metaDescription).toMatch(/공개된 검증 결과가 없습니다/);
    expect(ko.agents.metaDescription).toMatch(/등록부는 비어 있습니다/);
    expect(ko.evidence.metaDescription).toMatch(/등록부는 비어 있습니다/);
  });

  it("keeps English index metadata factual and language-specific", async () => {
    const params = () => Promise.resolve({ lang: "en" });
    await expect(homeMetadata({ params: params() })).resolves.toMatchObject({
      title: `MICA — ${en.site.longName}`,
      description: en.site.definition,
      alternates: { canonical: "/en" },
    });
    for (const [metadata, copy, path] of [
      [countriesMetadata, en.countries, "/en/countries"],
      [rankingsMetadata, en.rankings, "/en/rankings"],
      [agentsMetadata, en.agents, "/en/agents"],
      [tasksMetadata, en.tasks, "/en/tasks"],
      [evidenceMetadata, en.evidence, "/en/evidence"],
    ] as const) {
      await expect(metadata({ params: params() })).resolves.toMatchObject({
        title: copy.metaTitle,
        description: copy.metaDescription,
        alternates: { canonical: path },
      });
    }
    expect(en.rankings.metaDescription).toMatch(/no verified results/i);
    expect(en.agents.metaDescription).toMatch(/registry is empty/i);
    expect(en.evidence.metaDescription).toMatch(/registry is empty/i);
  });

  it("renders the methodology sections from the Korean dictionary", async () => {
    render(await MethodologyPage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: ko.methodology.axesTitle })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: ko.methodology.publicationTitle })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("The three outcome axes");
  });

  it("renders governance sections from the Korean dictionary", async () => {
    render(await GovernancePage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: ko.governance.rulesTitle })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: ko.governance.correctionsTitle })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("What MICA will not do");
    expect(document.body.textContent).not.toContain("demo-fixture");
    expect(document.body.textContent).not.toContain("Preview edition");
    expect(document.body.textContent).not.toContain("데이터 상태demo");
  });

  it("renders submission guidance from the Korean dictionary", async () => {
    render(await SubmitPage({ params: Promise.resolve({ lang: "ko" }) }));
    expect(screen.getByRole("heading", { name: ko.submit.stepOneTitle })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: ko.submit.contactTitle })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("Declare the snapshot");
  });

  it("localizes metadata for all three Korean detail routes", async () => {
    await expect(
      methodologyMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.methodology.metaTitle,
      description: ko.methodology.metaDescription,
    });
    await expect(
      governanceMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.governance.metaTitle,
      description: ko.governance.metaDescription,
    });
    await expect(
      submitMetadata({ params: Promise.resolve({ lang: "ko" }) }),
    ).resolves.toMatchObject({
      title: ko.submit.metaTitle,
      description: ko.submit.metaDescription,
    });
  });
});
