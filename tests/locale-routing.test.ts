import { describe, expect, it } from "vitest";
import nextConfig from "@/../next.config";

function rules<T>(value: T[] | (() => Promise<T[]>)) {
  return typeof value === "function" ? value() : Promise.resolve(value);
}

describe("canonical locale routing", () => {
  it("permanently redirects legacy English prefixes outside middleware", async () => {
    const redirects = await rules(nextConfig.redirects!);
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/en", destination: "/", permanent: true }),
        expect.objectContaining({ source: "/en/:path*", destination: "/:path*", permanent: true }),
      ]),
    );
  });

  it("internally maps canonical English paths to the existing locale tree", async () => {
    const rewrites = await nextConfig.rewrites!();
    expect(rewrites).toMatchObject({
      afterFiles: expect.arrayContaining([
        { source: "/", destination: "/en" },
        expect.objectContaining({ destination: "/en/:path" }),
      ]),
    });
  });

  it("excludes Korean and legacy English prefixes from the catch-all English rewrite", async () => {
    const rewrites = await nextConfig.rewrites!();
    const catchAll = Array.isArray(rewrites) ? [] : rewrites.afterFiles ?? [];
    const source = catchAll.find((rule) => rule.destination === "/en/:path")?.source ?? "";
    expect(source).toContain("ko");
    expect(source).toContain("en");
  });
});
