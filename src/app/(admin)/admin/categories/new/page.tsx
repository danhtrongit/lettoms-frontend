import { listCategoriesAdmin } from "@/lib/repos/catalog-admin.repo";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Thêm danh mục" };

export default async function NewCategoryPage() {
  const rows = await listCategoriesAdmin();
  const parents = rows
    .filter((r) => !r.parentId)
    .map((r) => ({ id: r.id, name: r.name, gender: r.gender }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm danh mục</h1>
      <CategoryForm parents={parents} />
    </div>
  );
}
