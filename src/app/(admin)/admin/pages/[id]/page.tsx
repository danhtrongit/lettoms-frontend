import { notFound } from "next/navigation";
import { getPageAdmin } from "@/lib/repos/pages.repo";
import { PageSettingsForm } from "@/components/admin/page-settings-form";

export const metadata = { title: "Cài đặt trang" };

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
      <h1 className="text-2xl font-semibold tracking-tight">
        Cài đặt trang: {page.title}
      </h1>
      <PageSettingsForm
        id={page.id}
        isSystem={page.isSystem}
        initial={{
          title: page.title,
          slug: page.slug,
          status: page.status,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          ogImage: page.ogImage,
        }}
      />
    </div>
  );
}
