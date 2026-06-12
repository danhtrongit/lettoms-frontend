import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { listArticlesAdmin } from "@/lib/repos/content-admin.repo";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { ArticleRowActions } from "@/components/admin/article-row-actions";

export const metadata = { title: "Bài viết" };

export default async function AdminArticlesPage() {
  const rows = await listArticlesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground">{rows.length} bài viết</p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <PlusIcon className="size-4" />
            Thêm bài viết
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Tiêu đề</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Ngày đăng</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/articles/${r.id}`} className="font-medium hover:underline">
                    {r.title}
                  </Link>
                  {r.featured && (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                      Nổi bật
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(r.publishedAt.toISOString())}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.isPublished
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {r.isPublished ? "Đã đăng" : "Nháp"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <ArticleRowActions id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
