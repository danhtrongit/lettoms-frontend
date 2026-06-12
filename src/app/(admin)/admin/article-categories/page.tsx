import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { listArticleCategoriesAdmin } from "@/lib/repos/content-admin.repo";
import { Button } from "@/components/ui/button";
import { ArticleCategoryRowActions } from "@/components/admin/article-category-row-actions";

export const metadata = { title: "Danh mục bài viết" };

export default async function AdminArticleCategoriesPage() {
  const rows = await listArticleCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục bài viết</h1>
          <p className="text-sm text-muted-foreground">{rows.length} danh mục</p>
        </div>
        <Button asChild>
          <Link href="/admin/article-categories/new">
            <PlusIcon className="size-4" />
            Thêm danh mục
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Mô tả</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="line-clamp-1">{r.description}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <ArticleCategoryRowActions id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
