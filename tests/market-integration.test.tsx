import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  assertIntegrationLinkage,
  assertValidatedIntegrationCoverage,
  auditIntegrationCoverage,
  buildIntegrationSituationIndex,
  countrySchema,
  COUNTRY_CODES,
  INTEGRATION_COVERAGE_MINIMUMS,
  IntegrationCoverageError,
  IntegrationLinkageError,
  integrationLinkageGaps,
  taskAttemptResultSchema,
  type TaskAttemptResult,
} from "@/lib/schema";
import {
  COUNTRIES,
  INTEGRATION_SITUATION_INDEX,
  MARKET_INTEGRATION_AUDIT,
  integrationSituationsFor,
} from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { RUN_CELLS } from "@/data/demo/runs";
import { en } from "@/lib/i18n/en";
import { ko } from "@/lib/i18n/ko";
import { getDict } from "@/lib/i18n/dictionary";
import CountryPage from "@/app/[lang]/countries/[country]/page";
import MethodologyPage from "@/app/[lang]/methodology/page";

describe("declared market integration profiles", () => {
  it("gives all six markets a validating profile with unique, market-prefixed ids", () => {
    expect(COUNTRIES).toHaveLength(COUNTRY_CODES.length);
    const global = new Set<string>();

    for (const country of COUNTRIES) {
      // Re-parsing proves the record still satisfies the schema on its own,
      // independently of the module-load parse that produced it.
      expect(countrySchema.safeParse(country).success).toBe(true);

      const ids = country.integrationProfile.situations.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) {
        expect(id.startsWith(`${country.code}-`)).toBe(true);
        expect(global.has(id)).toBe(false);
        global.add(id);
      }
      for (const situation of country.integrationProfile.situations) {
        expect(situation.title.trim()).not.toBe("");
        expect(situation.detail.trim()).not.toBe("");
        expect(situation.families.length).toBeGreaterThan(0);
        expect(situation.status).toBe("declared-not-exercised");
        // Korean is a translation, not an echo of the English string.
        expect(situation.translations.ko.title).not.toBe(situation.title);
        expect(situation.translations.ko.detail).not.toBe(situation.detail);
      }
    }
  });

  it("rejects a duplicated or wrongly prefixed situation id", () => {
    const kr = COUNTRIES.find((country) => country.code === "kr")!;
    const [first, second, ...rest] = kr.integrationProfile.situations;

    const duplicated = countrySchema.safeParse({
      ...kr,
      integrationProfile: {
        ...kr.integrationProfile,
        situations: [first, { ...second, id: first.id }, ...rest],
      },
    });
    expect(duplicated.success).toBe(false);

    const foreign = countrySchema.safeParse({
      ...kr,
      integrationProfile: {
        ...kr.integrationProfile,
        situations: [{ ...first, id: "jp-borrowed-situation" }, second, ...rest],
      },
    });
    expect(foreign.success).toBe(false);
  });

  it("keeps the Korean profile copy free of the em dash", () => {
    for (const country of COUNTRIES) {
      expect(country.integrationProfile.translations.ko.summary).not.toContain(
        "—",
      );
      for (const situation of country.integrationProfile.situations) {
        expect(situation.translations.ko.title).not.toContain("—");
        expect(situation.translations.ko.detail).not.toContain("—");
      }
    }
  });
});

describe("integration coverage audit", () => {
  it("covers all six markets and reports no gap for the shipped records", () => {
    expect(MARKET_INTEGRATION_AUDIT.byCountry.map((r) => r.country)).toEqual([
      ...COUNTRY_CODES,
    ]);
    expect(MARKET_INTEGRATION_AUDIT.missingCountries).toEqual([]);
    expect(
      MARKET_INTEGRATION_AUDIT.byCountry.flatMap((r) => r.gaps),
    ).toEqual([]);
    expect(MARKET_INTEGRATION_AUDIT.complete).toBe(true);

    for (const report of MARKET_INTEGRATION_AUDIT.byCountry) {
      expect(report.situations).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.situations,
      );
      expect(report.surfaces.length).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.surfaces,
      );
      expect(report.authorizations.length).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.authorizations,
      );
      expect(report.completions.length).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.completions,
      );
      expect(report.recoveries.length).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.recoveries,
      );
      expect(report.evidence.length).toBeGreaterThanOrEqual(
        INTEGRATION_COVERAGE_MINIMUMS.evidence,
      );
    }
  });

  it("fails closed on a deliberately incomplete synthetic profile", () => {
    // One market kept, thinned to a single situation; the rest removed. Both
    // failure modes — a shallow profile and a missing market — must surface.
    const thin = {
      code: "kr" as const,
      integrationProfile: {
        summary: "synthetic test profile",
        situations: [
          COUNTRIES.find((c) => c.code === "kr")!.integrationProfile
            .situations[0],
        ],
        translations: { ko: { summary: "합성 테스트 프로필" } },
      },
    };

    const audit = auditIntegrationCoverage([thin]);
    expect(audit.complete).toBe(false);
    expect([...audit.missingCountries].sort()).toEqual(
      [...COUNTRY_CODES].filter((code) => code !== "kr").sort(),
    );
    const kr = audit.byCountry.find((report) => report.country === "kr")!;
    expect(kr.gaps.length).toBeGreaterThan(0);
    expect(kr.gaps.join(" ")).toContain("situations");

    expect(() => assertValidatedIntegrationCoverage([thin])).toThrow(
      IntegrationCoverageError,
    );
    expect(() => assertValidatedIntegrationCoverage(COUNTRIES)).not.toThrow();
  });
});

describe("representative situation classes per market", () => {
  /** Enum-level expectations, so rewording a title cannot break the test. */
  const REQUIRED = {
    kr: {
      surfaces: ["super-app-channel", "signed-in-app"],
      authorizations: ["carrier-identity", "payment-approval"],
      completions: ["human-confirmed", "out-of-band-completion"],
      recoveries: ["identity-handoff-timeout", "duplicate-or-retry-risk"],
      evidence: ["handoff-checkpoint", "post-action-readback"],
    },
    jp: {
      surfaces: ["open-web", "human-handoff"],
      authorizations: ["otp", "payment-approval"],
      completions: ["out-of-band-completion", "human-confirmed"],
      recoveries: ["whole-form-invalidation", "duplicate-or-retry-risk"],
      evidence: ["locale-formatted-artifact", "retry-idempotency-record"],
    },
    sg: {
      surfaces: ["qr-device-handoff", "official-api"],
      authorizations: ["payment-approval", "account-holder-confirmation"],
      completions: ["human-confirmed", "asynchronous-pending"],
      recoveries: ["stale-inventory-or-late-fee", "channel-unavailable"],
      evidence: ["post-action-readback", "handoff-checkpoint"],
    },
    tw: {
      surfaces: ["super-app-channel", "human-handoff"],
      authorizations: ["payment-approval", "account-holder-confirmation"],
      completions: ["out-of-band-completion", "human-confirmed"],
      recoveries: ["stale-inventory-or-late-fee", "duplicate-or-retry-risk"],
      evidence: ["locale-formatted-artifact", "authoritative-response"],
    },
    th: {
      surfaces: ["qr-device-handoff", "human-handoff"],
      authorizations: ["payment-approval", "account-holder-confirmation"],
      completions: ["out-of-band-completion", "synchronous-confirmed"],
      recoveries: ["duplicate-or-retry-risk", "channel-unavailable"],
      evidence: ["handoff-checkpoint", "retry-idempotency-record"],
    },
    ae: {
      surfaces: ["signed-in-app", "official-api"],
      authorizations: ["government-identity", "otp"],
      completions: ["human-confirmed", "out-of-band-completion"],
      recoveries: ["identity-handoff-timeout", "stale-inventory-or-late-fee"],
      evidence: ["handoff-checkpoint", "authoritative-response"],
    },
  } as const;

  it.each([...COUNTRY_CODES])("declares the expected classes for %s", (code) => {
    const report = MARKET_INTEGRATION_AUDIT.byCountry.find(
      (entry) => entry.country === code,
    )!;
    const required = REQUIRED[code];
    for (const surface of required.surfaces) {
      expect(report.surfaces).toContain(surface);
    }
    for (const authorization of required.authorizations) {
      expect(report.authorizations).toContain(authorization);
    }
    for (const completion of required.completions) {
      expect(report.completions).toContain(completion);
    }
    for (const recovery of required.recoveries) {
      expect(report.recoveries).toContain(recovery);
    }
    for (const evidence of required.evidence) {
      expect(report.evidence).toContain(evidence);
    }
  });
});

describe("attempt linkage to a market situation", () => {
  const index = buildIntegrationSituationIndex(COUNTRIES);
  const krSituation = integrationSituationsFor("kr")[0].id;
  const jpSituation = integrationSituationsFor("jp")[0].id;

  /** Synthetic scaffolding. It describes no system and no real run. */
  function attempt(overrides: Record<string, unknown> = {}) {
    return {
      attemptId: "test-attempt-1",
      system: "test-system-1",
      systemSnapshotVersion: "0.0.1",
      market: "kr",
      family: "shopping-delivery",
      taskId: "test-task-1",
      taskVersion: "v1",
      attemptClass: "validated-localized",
      integrationSituationIds: [krSituation],
      outcome: "confirmed-success",
      observedLatencySec: 120,
      modelCostUsd: 0.02,
      toolApiCostUsd: 0.01,
      observedCostUsd: 0.03,
      scoringReferences: { speedTargetSec: 60, costTargetUsd: 0.03 },
      modelInvocations: [
        {
          order: 1,
          provider: "test-provider",
          modelId: "test-model",
          modelVersion: "2026-01-01-snapshot",
          purpose: "plan",
          inputTokens: 100,
          outputTokens: 20,
          latencySec: 4,
          costUsd: 0.02,
        },
      ],
      dataStatus: "demo",
      publicationEligible: false,
      ...overrides,
    };
  }

  const parse = (input: Record<string, unknown>) =>
    taskAttemptResultSchema.safeParse(input);

  it("accepts a validated localized attempt linked to its own market", () => {
    const result = parse(attempt());
    expect(result.success).toBe(true);
    expect(
      integrationLinkageGaps(result.data as TaskAttemptResult, index),
    ).toEqual([]);
    expect(() =>
      assertIntegrationLinkage(result.data as TaskAttemptResult, index),
    ).not.toThrow();
  });

  it("requires a validated localized attempt to name a situation", () => {
    const result = parse(attempt({ integrationSituationIds: undefined }));
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain(
      "integrationSituationIds",
    );
  });

  it("rejects a repeated situation link", () => {
    expect(
      parse(attempt({ integrationSituationIds: [krSituation, krSituation] }))
        .success,
    ).toBe(false);
  });

  it("rejects a cross-market link and an unknown situation", () => {
    const crossMarket = parse(
      attempt({ integrationSituationIds: [jpSituation] }),
    ).data as TaskAttemptResult;
    const gaps = integrationLinkageGaps(crossMarket, index);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toContain("jp");
    expect(() => assertIntegrationLinkage(crossMarket, index)).toThrow(
      IntegrationLinkageError,
    );

    const unknown = parse(
      attempt({ integrationSituationIds: ["kr-not-a-real-situation"] }),
    ).data as TaskAttemptResult;
    expect(integrationLinkageGaps(unknown, index)[0]).toContain(
      "not declared by any market",
    );
  });

  it("leaves synthetic fixtures uncoupled from the catalogue", () => {
    // Schema and unit fixtures assert nothing about a market, so they neither
    // require nor gain a situation link.
    const synthetic = parse(
      attempt({ attemptClass: undefined, integrationSituationIds: undefined }),
    );
    expect(synthetic.success).toBe(true);
    expect(synthetic.data!.attemptClass).toBe("synthetic-fixture");
    expect(
      integrationLinkageGaps(synthetic.data as TaskAttemptResult, index),
    ).toEqual([]);
  });

  it("ships an index that matches the declared catalogue", () => {
    expect([...INTEGRATION_SITUATION_INDEX.keys()].sort()).toEqual(
      [...COUNTRY_CODES].sort(),
    );
    expect(INTEGRATION_SITUATION_INDEX.get("kr")!.has(krSituation)).toBe(true);
    expect(INTEGRATION_SITUATION_INDEX.get("kr")!.has(jpSituation)).toBe(false);
  });
});

describe("integration copy on the public pages", () => {
  it.each(["en", "ko"] as const)(
    "renders the %s market profile on a country page without claiming a result",
    async (lang) => {
      render(
        await CountryPage({
          params: Promise.resolve({ lang, country: "kr" }),
        }),
      );
      const dict = getDict(lang);
      const situations = integrationSituationsFor("kr");

      expect(
        document.querySelectorAll("[data-integration-situation]"),
      ).toHaveLength(situations.length);
      const text = document.body.textContent ?? "";
      expect(text).toContain(dict.integration.title);
      expect(text).toContain(dict.integration.statusNote);
      expect(text).toContain(dict.integration.parityNote);
      const sample = situations[0];
      expect(text).toContain(
        lang === "ko" ? sample.translations.ko.title : sample.title,
      );

      // The page still says nothing has been measured.
      expect(SYSTEMS).toEqual([]);
      expect(RUN_CELLS).toEqual([]);
      expect(screen.queryAllByRole("table")).toHaveLength(0);
    },
  );

  it.each(["en", "ko"] as const)(
    "renders the %s integration coverage contract on the methodology page",
    async (lang) => {
      const { container } = render(
        await MethodologyPage({ params: Promise.resolve({ lang }) }),
      );
      const dict = getDict(lang);
      expect(container.querySelector("#integration")).not.toBeNull();
      const text = document.body.textContent ?? "";
      expect(text).toContain(dict.integration.methodologyTitle);
      expect(text).toContain(dict.integration.methodologyStatus);
      for (const item of dict.integration.methodologyItems) {
        expect(text).toContain(item.term);
      }
    },
  );

  it("translates the integration taxonomy rather than echoing it", () => {
    expect(ko.integration.title).not.toBe(en.integration.title);
    expect(ko.integration.methodologyItems).toHaveLength(
      en.integration.methodologyItems.length,
    );
    for (const value of [
      ko.integration.intro,
      ko.integration.statusNote,
      ko.integration.parityNote,
      ko.integration.methodologyIntro,
      ko.integration.methodologyStatus,
      ...ko.integration.methodologyItems.map((item) => item.detail),
    ]) {
      expect(value, `em dash in: ${value}`).not.toContain("—");
    }
  });
});
