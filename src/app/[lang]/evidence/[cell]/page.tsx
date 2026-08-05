import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n/dictionary";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { type LangParams } from "@/lib/i18n/route";
import { RUN_CELL_IDS } from "@/lib/evidence";

/**
 * A cell page is a handle on a recorded aggregate. No aggregate has been
 * recorded, so no cell id exists, no static param is generated, and every
 * request for a cell — including any id that once appeared in the demo fixture
 * — is a 404 rather than a page that reconstructs a plausible aggregate.
 */
export function generateStaticParams() {
  return RUN_CELL_IDS.map((cell) => ({ cell }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams & { cell: string }>;
}): Promise<Metadata> {
  await params;
  return { title: getDict(DEFAULT_LOCALE).evidenceCell.notFound };
}

export default async function EvidenceCellPage({
  params,
}: {
  params: Promise<LangParams & { cell: string }>;
}) {
  await params;
  notFound();
}
