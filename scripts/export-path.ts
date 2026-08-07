import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function resolveExportRoot(
  moduleUrl: string,
  override: string | undefined,
): string {
  return override
    ? resolve(override)
    : resolve(dirname(fileURLToPath(moduleUrl)), "..");
}
