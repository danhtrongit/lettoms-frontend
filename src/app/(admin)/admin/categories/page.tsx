import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { listCategoriesAdmin } from "@/lib/repos/catalog-admin.repo";
import { Button } from "@/components/ui/button";
import { genderLabel } from "@/data/site";
import type { Gender } from "@/types";
import { CategoryRowActions } from "@/components/admin/category-row-actions";

export const metadata = { title: "Danh mục sản phẩm" };

export default async function AdminCategoriesPage() {
  const rows = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} danh mục (gồm cả danh mục con)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
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
              <th className="px-4 py-3 font-medium">Giới tính</th>
              <th className="px-4 py-3 font-medium">Danh mục cha</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">
                  {r.parentName && <span className="text-muted-foreground">— </span>}
                  {r.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
                <td className="px-4 py-3">{genderLabel[r.gender as Gender]}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.parentName ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {r.isActive ? "Hiển thị" : "Ẩn"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <CategoryRowActions id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
