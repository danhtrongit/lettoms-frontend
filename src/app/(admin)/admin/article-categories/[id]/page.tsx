import { notFound } from "next/navigation";
import { getArticleCategoryAdmin } from "@/lib/repos/content-admin.repo";
import { ArticleCategoryForm } from "@/components/admin/article-category-form";

export const metadata = { title: "Sửa danh mục bài viết" };

export default async function EditArticleCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = await getArticleCategoryAdmin(id);
  if (!cat) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa danh mục bài viết</h1>
      <ArticleCategoryForm
        id={cat.id}
        initial={{
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          thumbnail: cat.thumbnail,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder,
        }}
      />
    </div>
  );
}
