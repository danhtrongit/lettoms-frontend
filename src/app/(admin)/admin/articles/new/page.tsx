import { listArticleCategoriesAdmin } from "@/lib/repos/content-admin.repo";
import { ArticleForm } from "@/components/admin/article-form";

export const metadata = { title: "Thêm bài viết" };

export default async function NewArticlePage() {
  const cats = await listArticleCategoriesAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm bài viết</h1>
      <ArticleForm categories={cats.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
