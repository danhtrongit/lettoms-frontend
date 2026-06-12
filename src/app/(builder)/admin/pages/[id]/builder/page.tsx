import { notFound } from "next/navigation";
import { getPageAdmin } from "@/lib/repos/pages.repo";
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
  if (!page.content) notFound();

  const data: Data = page.content;

  return (
    <PageEditor
      page={{ id: page.id, title: page.title, slug: page.slug, status: page.status, data }}
    />
  );
}
