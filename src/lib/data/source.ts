import { COUNTRIES } from "@/data/demo/countries";
import { SYSTEMS } from "@/data/demo/systems";
import { TASK_FAMILIES, HERO_MISSIONS } from "@/data/demo/tasks";
import { RUN_CELLS } from "@/data/demo/runs";
import type {
  Country,
  SystemRecord,
  TaskFamilyRecord,
  HeroMission,
  RunCell,
} from "@/lib/schema";

/**
 * Data-source boundary.
 *
 * Today every record is a local demo fixture. When a real edition exists, a
 * remote implementation of `MicaDataSource` can be swapped in behind this
 * interface without any page importing a fixture directly.
 *
 * Supabase is intentionally NOT installed. The environment variables below are
 * read only to report which source is active; a build with both unset — the
 * state described in `.env.example` — is the supported default.
 */

export interface MicaDataSource {
  readonly kind: "demo-fixture" | "remote";
  readonly dataStatus: "demo" | "preview" | "official";
  countries(): readonly Country[];
  systems(): readonly SystemRecord[];
  taskFamilies(): readonly TaskFamilyRecord[];
  heroMissions(): readonly HeroMission[];
  runCells(): readonly RunCell[];
}

const demoSource: MicaDataSource = {
  kind: "demo-fixture",
  dataStatus: "demo",
  countries: () => COUNTRIES,
  systems: () => SYSTEMS,
  taskFamilies: () => TASK_FAMILIES,
  heroMissions: () => HERO_MISSIONS,
  runCells: () => RUN_CELLS,
};

/** True only when a complete remote configuration is present. */
export function hasRemoteConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getDataSource(): MicaDataSource {
  // No remote implementation exists yet; a configured remote is recorded but
  // still served from fixtures so that builds never depend on a secret.
  return demoSource;
}

export const DATA_SOURCE = getDataSource();
