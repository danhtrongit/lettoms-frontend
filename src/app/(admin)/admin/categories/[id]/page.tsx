import { notFound } from "next/navigation";
import { getCategoryAdmin, listCategoriesAdmin } from "@/lib/repos/catalog-admin.repo";
import { CategoryForm } from "@/components/admin/category-form";
import type { Gender } from "@/types";

export const metadata = { title: "Sửa danh mục" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cat, rows] = await Promise.all([
    getCategoryAdmin(id),
    listCategoriesAdmin(),
  ]);
  if (!cat) notFound();

  const parents = rows
    .filter((r) => !r.parentId)
    .map((r) => ({ id: r.id, name: r.name, gender: r.gender }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa danh mục</h1>
      <CategoryForm
        id={cat.id}
        parents={parents}
        initial={{
          name: cat.name,
          slug: cat.slug,
          gender: cat.gender as Gender,
          parentId: cat.parentId,
          description: cat.description,
          heroImage: cat.heroImage,
          iconImage: cat.iconImage,
          seoTitle: cat.seoTitle,
          seoDescription: cat.seoDescription,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
        }}
      />
    </div>
  );
}
