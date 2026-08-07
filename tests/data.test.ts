import { describe, it, expect } from "vitest";
import {
  assertDemoInvariants,
  DemoEligibilityError,
  COUNTRY_CODES,
  TASK_FAMILY_IDS,
  runCellSchema,
} from "@/lib/schema";
import { COUNTRIES, getCountry } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES, HERO_MISSIONS } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import { PROJECT_STATE } from "@/data/project-state";
import { areResultsPublicationEligible } from "@/lib/calc";
import { DATA_SOURCE, hasRemoteConfig } from "@/lib/data/source";

describe("demo eligibility guard", () => {
  it("throws when demo data claims publication eligibility", () => {
    expect(() =>
      assertDemoInvariants(
        [{ dataStatus: "demo", publicationEligible: true }],
        () => "test record",
      ),
    ).toThrow(DemoEligibilityError);
  });

  it("allows non-demo data to be eligible", () => {
    expect(() =>
      assertDemoInvariants(
        [{ dataStatus: "official", publicationEligible: true }],
        () => "test record",
      ),
    ).not.toThrow();
  });
});

describe("run cell cross-field invariants", () => {
  /**
   * A cell whose fields all agree. Each case below mutates exactly one axis of
   * this record, so a rejection can only be attributed to that contradiction.
   */
  function coherentCell(overrides: Record<string, unknown> = {}) {
    return {
      system: "test-system-1",
      country: "kr",
      family: "email-calendar",
      eligibleRuns: 4,
      successfulRuns: 2,
      tasksAttempted: 2,
      tasksDefined: 3,
      successLatenciesSec: [100, 110],
      allEligibleLatenciesSec: [90, 100, 110, 120],
      totalEligibleCost: 1000,
      criticalSafetyEvents: 0,
      dataStatus: "demo",
      publicationEligible: false,
      ...overrides,
    };
  }

  it("accepts a fully coherent cell", () => {
    expect(runCellSchema.safeParse(coherentCell()).success).toBe(true);
  });

  it("rejects more successful runs than eligible runs", () => {
    const result = runCellSchema.safeParse(
      coherentCell({
        successfulRuns: 5,
        successLatenciesSec: [100, 110, 120, 130, 140],
      }),
    );
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("successfulRuns");
  });

  it("rejects a success latency list that does not match successfulRuns", () => {
    expect(
      runCellSchema.safeParse(coherentCell({ successLatenciesSec: [100] }))
        .success,
    ).toBe(false);
    expect(
      runCellSchema.safeParse(
        coherentCell({ successLatenciesSec: [100, 110, 120] }),
      ).success,
    ).toBe(false);
  });

  it("rejects an eligible latency list that does not match eligibleRuns", () => {
    expect(
      runCellSchema.safeParse(
        coherentCell({ allEligibleLatenciesSec: [90, 100, 110] }),
      ).success,
    ).toBe(false);
    expect(
      runCellSchema.safeParse(
        coherentCell({ allEligibleLatenciesSec: [90, 100, 110, 120, 130] }),
      ).success,
    ).toBe(false);
  });

  it("rejects attempting more canonical tasks than are defined", () => {
    const result = runCellSchema.safeParse(
      coherentCell({ tasksAttempted: 4, tasksDefined: 3 }),
    );
    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.issues)).toContain("tasksAttempted");
  });
});

describe("fixtures", () => {
  it("defines all six benchmark markets, including the UAE", () => {
    expect(COUNTRIES.map((c) => c.code).sort()).toEqual(
      [...COUNTRY_CODES].sort(),
    );
    expect(COUNTRY_CODES).toContain("ae");

    const uae = getCountry("ae");
    expect(uae).toMatchObject({
      name: "United Arab Emirates",
      nativeName: "الإمارات العربية المتحدة",
      locale: "ar-AE",
      currency: "AED",
      timezone: "Asia/Dubai",
    });
    expect(uae?.hazards).toHaveLength(4);
    expect(uae?.whatLocalChanges).toHaveLength(4);
  });

  it("defines exactly the ten task families, in canonical order", () => {
    expect([...TASK_FAMILY_IDS]).toEqual([
      "email-calendar",
      "shopping-delivery",
      "travel-accommodation",
      "restaurants-local",
      "money-banking-investing",
      "mobility-transit",
      "healthcare-administration",
      "government-civic",
      "home-utilities",
      "telecom-subscriptions",
    ]);
    expect(TASK_FAMILIES).toHaveLength(10);
    expect(TASK_FAMILIES.map((f) => f.id)).toEqual([...TASK_FAMILY_IDS]);
  });

  it("defines exactly ten bilingual canonical tasks per family", () => {
    const taskIds = new Set<string>();

    for (const family of TASK_FAMILIES) {
      expect(family.canonicalTasks).toHaveLength(10);
      const markets = new Set(
        family.canonicalTasks.flatMap((task) => task.markets),
      );
      expect([...markets].sort()).toEqual([...COUNTRY_CODES].sort());

      for (const task of family.canonicalTasks) {
        expect(taskIds.has(task.id)).toBe(false);
        taskIds.add(task.id);
        expect(task.title.length).toBeGreaterThan(0);
        expect(task.finalState.length).toBeGreaterThan(0);
        expect(task.confirmationBoundary.length).toBeGreaterThan(0);
        expect([...task.markets].sort()).toEqual([...COUNTRY_CODES].sort());
        expect(task.translations.ko.title.length).toBeGreaterThan(0);
        expect(task.translations.ko.finalState.length).toBeGreaterThan(0);
        expect(task.translations.ko.confirmationBoundary.length).toBeGreaterThan(0);
      }
    }

    expect(taskIds.size).toBe(100);
  });

  it("publishes no result family at all", () => {
    expect(RUN_CELLS).toEqual([]);
    expect(SYSTEMS).toEqual([]);
    expect(new Set(RUN_CELLS.map((cell) => cell.family)).size).toBe(0);
    for (const family of TASK_FAMILIES) {
      expect(RUN_CELLS.some((cell) => cell.family === family.id)).toBe(false);
    }
  });

  it("keeps hero missions as task illustrations, not results", () => {
    const defined = new Set(TASK_FAMILIES.map((f) => f.id));
    expect(HERO_MISSIONS.length).toBeGreaterThan(0);
    for (const mission of HERO_MISSIONS) {
      expect(defined.has(mission.family)).toBe(true);
      expect(COUNTRY_CODES).toContain(mission.country);
      expect(Object.keys(mission)).not.toContain("accuracy");
      expect(mission.persona.toLowerCase()).toContain("synthetic");
    }
  });

  it("encodes the finance safety contract in the investing family", () => {
    const finance = TASK_FAMILIES.find(
      (f) => f.id === "money-banking-investing",
    );
    expect(finance).toBeDefined();
    const boundaries = finance!.canonicalTasks
      .map((t) => `${t.finalState} ${t.confirmationBoundary}`)
      .join(" ")
      .toLowerCase();
    expect(boundaries).toContain("synthetic");
    expect(boundaries).toMatch(/explicit final approval/);
    expect(boundaries).not.toMatch(/guaranteed return/);
    for (const task of finance!.canonicalTasks) {
      expect(task.confirmationBoundary.toLowerCase()).toMatch(
        /no (transfer|trade|order|account)/,
      );
    }
  });

  it("marks every system and run cell as demo and not publication eligible", () => {
    for (const system of SYSTEMS) {
      expect(system.dataStatus).toBe("demo");
      expect(system.publicationEligible).toBe(false);
    }
    for (const cell of RUN_CELLS) {
      expect(cell.dataStatus).toBe("demo");
      expect(cell.publicationEligible).toBe(false);
    }
  });

  it("never records more successes than eligible runs", () => {
    for (const cell of RUN_CELLS) {
      expect(cell.successfulRuns).toBeLessThanOrEqual(cell.eligibleRuns);
      expect(cell.successLatenciesSec).toHaveLength(cell.successfulRuns);
      expect(cell.allEligibleLatenciesSec).toHaveLength(cell.eligibleRuns);
    }
  });

  it("resolves known country codes and rejects unknown ones", () => {
    expect(getCountry("kr")?.name).toBe("South Korea");
    expect(getCountry("us")).toBeUndefined();
  });
});

describe("overall publication eligibility", () => {
  it("fails closed when no systems or run cells exist", () => {
    expect(areResultsPublicationEligible([], [])).toBe(false);
  });

  it("uses the real publication gate rather than trusting record booleans", () => {
    const system = {
      slug: "candidate",
      dataStatus: "official",
      verification: "independent-rerun" as const,
      publicationEligible: true,
    };
    const runCell = {
      system: "candidate",
      dataStatus: "official",
      eligibleRuns: 100,
      tasksAttempted: 10,
      tasksDefined: 10,
      criticalSafetyEvents: 0,
      publicationEligible: true,
    };

    // Thresholds are intentionally unset in this edition, so even otherwise
    // eligible official records remain blocked by the canonical policy gate.
    expect(areResultsPublicationEligible([system], [runCell])).toBe(false);
    expect(
      areResultsPublicationEligible(
        [{ ...system, dataStatus: "demo" }],
        [{ ...runCell, dataStatus: "demo" }],
      ),
    ).toBe(false);
    expect(
      areResultsPublicationEligible(
        [system],
        [{ ...runCell, criticalSafetyEvents: 1 }],
      ),
    ).toBe(false);
  });
});

describe("project catchup state contract", () => {
  it("exports independently of cwd without mutating tracked files", async () => {
    const { execFile } = await import("node:child_process");
    const { mkdtemp, readFile, rm } = await import("node:fs/promises");
    const { promisify } = await import("node:util");
    const { join, resolve } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const execute = promisify(execFile);
    const temporaryCwd = await mkdtemp(join(tmpdir(), "mica-cwd-"));
    const exportRoot = await mkdtemp(join(tmpdir(), "mica-output-"));
    const exporter = resolve(__dirname, "../scripts/export-demo-data.ts");
    const tsconfig = resolve(__dirname, "../tsconfig.json");
    const tsx = resolve(__dirname, "../node_modules/tsx/dist/cli.mjs");
    const contractPath = resolve(__dirname, "../project-state.json");
    const committedContract = await readFile(contractPath, "utf8");

    try {
      await execute(process.execPath, [tsx, "--tsconfig", tsconfig, exporter], {
        cwd: temporaryCwd,
        env: { ...process.env, MICA_EXPORT_ROOT: exportRoot },
      });
      await expect(
        readFile(join(temporaryCwd, "project-state.json"), "utf8"),
      ).rejects.toMatchObject({ code: "ENOENT" });
      await expect(
        readFile(join(exportRoot, "project-state.json"), "utf8"),
      ).resolves.toBe(`${JSON.stringify(PROJECT_STATE, null, 2)}\n`);
      await expect(readFile(contractPath, "utf8")).resolves.toBe(
        committedContract,
      );
    } finally {
      await rm(temporaryCwd, { recursive: true, force: true });
      await rm(exportRoot, { recursive: true, force: true });
    }
  });

  it("matches the canonical implementation state independently of cwd", async () => {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const contractPath = resolve(__dirname, "../project-state.json");
    const contract: unknown = JSON.parse(await readFile(contractPath, "utf8"));

    expect(contract).toEqual(PROJECT_STATE);

    const canonicalTaskCount = TASK_FAMILIES.reduce(
      (count, family) => count + family.canonicalTasks.length,
      0,
    );
    const publicationEligible = areResultsPublicationEligible(
      SYSTEMS,
      RUN_CELLS,
    );

    expect(PROJECT_STATE.schemaVersion).toBe(1);
    expect(PROJECT_STATE.slug).toBe("mica");
    expect(PROJECT_STATE.status).toContain("Phase 0");
    expect(PROJECT_STATE.state).toContain(`${COUNTRIES.length} benchmark markets`);
    expect(PROJECT_STATE.state).toContain(`${TASK_FAMILIES.length} task families`);
    expect(PROJECT_STATE.state).toContain(`${canonicalTaskCount} canonical tasks`);
    expect(PROJECT_STATE.state).toContain(`${SYSTEMS.length} registered systems`);
    expect(PROJECT_STATE.state).toContain(`${RUN_CELLS.length} run cells`);
    expect(publicationEligible).toBe(false);
    expect(PROJECT_STATE.state).toContain("0 registered systems");
    expect(PROJECT_STATE.state).toContain(
      "Official publication eligibility: false",
    );
  });

  it("keeps README scope claims aligned with canonical data", async () => {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    const readme = await readFile(resolve(__dirname, "../README.md"), "utf8");
    const canonicalTaskCount = TASK_FAMILIES.reduce(
      (count, family) => count + family.canonicalTasks.length,
      0,
    );

    expect(readme).toContain(`Markets: ${COUNTRIES.length}`);
    expect(readme).toContain(
      `Task catalogue: ${TASK_FAMILIES.length} task families with ${canonicalTaskCount} canonical tasks total`,
    );
    expect(readme).toContain(
      `Results: ${SYSTEMS.length} registered systems and ${RUN_CELLS.length} run cells`,
    );
  });
});

describe("data source boundary", () => {
  it("serves demo fixtures with no remote configuration", () => {
    expect(DATA_SOURCE.kind).toBe("demo-fixture");
    expect(DATA_SOURCE.dataStatus).toBe("demo");
    expect(DATA_SOURCE.countries()).toHaveLength(6);
  });

  it("reports no remote config when the env vars are unset", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(hasRemoteConfig()).toBe(false);
  });
});
