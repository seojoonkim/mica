import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/dictionary";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { type LangParams } from "@/lib/i18n/route";
import { SYSTEMS } from "@/data/demo/systems";

/**
 * A system detail page exists for exactly the systems in the registry, and the
 * registry is empty: no static params are generated and every request for a
 * detail page is a 404. This is a route, not a placeholder — when the first
 * verified snapshot is admitted, the page it needs is rebuilt against real
 * records rather than resurrected from a fixture.
 */
export function generateStaticParams() {
  return SYSTEMS.map((system) => ({ system: system.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams & { system: string }>;
}): Promise<Metadata> {
  await params;
  return { title: getDict(DEFAULT_LOCALE).agent.notFound };
}

export default async function SystemPage({
  params,
}: {
  params: Promise<LangParams & { system: string }>;
}) {
  await params;
  notFound();
}
