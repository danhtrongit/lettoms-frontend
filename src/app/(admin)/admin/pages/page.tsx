import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { listPagesAdmin } from "@/lib/repos/pages.repo";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { PageRowActions } from "@/components/admin/page-row-actions";

export const metadata = { title: "Trang (Page)" };

export default async function AdminPagesPage() {
  const rows = await listPagesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trang (Page)</h1>
          <p className="text-sm text-muted-foreground">{rows.length} trang</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <PlusIcon className="size-4" />
            Tạo trang
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Cập nhật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Chưa có trang nào.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/pages/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/trang/{r.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === "published"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                          : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      }
                    >
                      {r.status === "published" ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(r.updatedAt.toISOString())}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PageRowActions id={r.id} slug={r.slug} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
