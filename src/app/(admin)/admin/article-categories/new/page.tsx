import { ArticleCategoryForm } from "@/components/admin/article-category-form";

export const metadata = { title: "Thêm danh mục bài viết" };

export default function NewArticleCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm danh mục bài viết</h1>
      <ArticleCategoryForm />
    </div>
  );
}
