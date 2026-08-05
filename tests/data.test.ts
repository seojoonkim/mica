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
