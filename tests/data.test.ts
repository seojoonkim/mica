import { describe, it, expect } from "vitest";
import {
  assertDemoInvariants,
  DemoEligibilityError,
  COUNTRY_CODES,
  TASK_FAMILY_IDS,
} from "@/lib/schema";
import { COUNTRIES, getCountry } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import {
  TASK_FAMILIES,
  HERO_MISSIONS,
  SEEDED_DEMO_FAMILY_IDS,
} from "@/data/demo/tasks";
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

  it("gives every family at least two canonical tasks covering all five markets", () => {
    for (const family of TASK_FAMILIES) {
      expect(family.canonicalTasks.length).toBeGreaterThanOrEqual(2);
      const markets = new Set(
        family.canonicalTasks.flatMap((task) => task.markets),
      );
      expect([...markets].sort()).toEqual([...COUNTRY_CODES].sort());
      for (const task of family.canonicalTasks) {
        expect(task.finalState.length).toBeGreaterThan(0);
        expect(task.confirmationBoundary.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps seeded demo result coverage to the original four families", () => {
    expect([...SEEDED_DEMO_FAMILY_IDS]).toEqual([
      "email-calendar",
      "shopping-delivery",
      "travel-accommodation",
      "restaurants-local",
    ]);
    const seeded = new Set<string>(SEEDED_DEMO_FAMILY_IDS);
    for (const cell of RUN_CELLS) {
      expect(seeded.has(cell.family)).toBe(true);
    }
  });

  it("fabricates no run cells for the six newly added families", () => {
    const seeded = new Set<string>(SEEDED_DEMO_FAMILY_IDS);
    const unseeded = TASK_FAMILIES.filter((f) => !seeded.has(f.id));
    expect(unseeded).toHaveLength(6);
    for (const family of unseeded) {
      expect(RUN_CELLS.some((cell) => cell.family === family.id)).toBe(false);
    }
  });

  it("leaves the existing run aggregates untouched", () => {
    expect(RUN_CELLS).toHaveLength(108);
    expect(RUN_CELLS.reduce((sum, c) => sum + c.eligibleRuns, 0)).toBe(2662);
    expect(RUN_CELLS.reduce((sum, c) => sum + c.successfulRuns, 0)).toBe(1423);
  });

  it("gives every market four hero missions across the seeded families", () => {
    const seeded = new Set<string>(SEEDED_DEMO_FAMILY_IDS);
    for (const code of COUNTRY_CODES) {
      const missions = HERO_MISSIONS.filter((m) => m.country === code);
      expect(missions).toHaveLength(4);
      expect(new Set(missions.map((m) => m.family)).size).toBe(4);
      for (const mission of missions) {
        expect(seeded.has(mission.family)).toBe(true);
      }
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
