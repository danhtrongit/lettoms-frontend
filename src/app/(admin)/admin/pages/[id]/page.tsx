import { notFound } from "next/navigation";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { PageBuilder } from "@/components/admin/page-builder";

export const metadata = { title: "Sửa trang" };

export default async function EditPageBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa trang: {page.title}</h1>
      <PageBuilder
        id={page.id}
        initial={{
          title: page.title,
          slug: page.slug,
          status: page.status,
          blocks: page.blocks,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
        }}
      />
    </div>
  );
}
