import { describe, it, expect } from "vitest";
import {
  assertDemoInvariants,
  DemoEligibilityError,
  COUNTRY_CODES,
  TASK_FAMILY_IDS,
} from "@/lib/schema";
import { COUNTRIES, getCountry } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES, HERO_MISSIONS } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
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

describe("fixtures", () => {
  it("defines all five MVP markets", () => {
    expect(COUNTRIES.map((c) => c.code).sort()).toEqual(
      [...COUNTRY_CODES].sort(),
    );
  });

  it("defines all four task families", () => {
    expect(TASK_FAMILIES.map((f) => f.id).sort()).toEqual(
      [...TASK_FAMILY_IDS].sort(),
    );
  });

  it("gives every market four hero missions, one per family", () => {
    for (const code of COUNTRY_CODES) {
      const missions = HERO_MISSIONS.filter((m) => m.country === code);
      expect(missions).toHaveLength(4);
      expect(new Set(missions.map((m) => m.family)).size).toBe(4);
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
    }
  });

  it("omits cells for uncovered markets instead of writing zeros", () => {
    const covered = new Set(
      RUN_CELLS.filter((c) => c.system === "hangang-assistant").map(
        (c) => c.country,
      ),
    );
    expect([...covered].sort()).toEqual(["jp", "kr"]);
  });

  it("includes a zero-success cell so the interface must render words", () => {
    expect(RUN_CELLS.some((cell) => cell.successfulRuns === 0)).toBe(true);
  });

  it("includes a critical safety event", () => {
    expect(RUN_CELLS.some((cell) => cell.criticalSafetyEvents > 0)).toBe(true);
  });

  it("resolves known country codes and rejects unknown ones", () => {
    expect(getCountry("kr")?.name).toBe("South Korea");
    expect(getCountry("us")).toBeUndefined();
  });
});

describe("data source boundary", () => {
  it("serves demo fixtures with no remote configuration", () => {
    expect(DATA_SOURCE.kind).toBe("demo-fixture");
    expect(DATA_SOURCE.dataStatus).toBe("demo");
    expect(DATA_SOURCE.countries()).toHaveLength(5);
  });

  it("reports no remote config when the env vars are unset", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(hasRemoteConfig()).toBe(false);
  });
});
