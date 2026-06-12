import { notFound } from "next/navigation";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { legacyBlocksToPuckData } from "@/lib/builder/migrate-legacy";
import { PageEditor } from "@/components/builder/page-editor";
import type { Data } from "@puckeditor/core";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) notFound();

  // Pages not yet migrated open with their legacy blocks converted on the fly.
  const data: Data = page.content ?? legacyBlocksToPuckData(page.blocks);

  return (
    <PageEditor
      page={{ id: page.id, title: page.title, slug: page.slug, status: page.status, data }}
    />
  );
}
