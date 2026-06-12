import Link from "next/link";
import Image from "next/image";
import { PlusIcon } from "lucide-react";
import { listProductsAdmin } from "@/lib/repos/catalog-admin.repo";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { genderLabel } from "@/data/site";
import type { Gender } from "@/types";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata = { title: "Sản phẩm" };

export default async function AdminProductsPage() {
  const rows = await listProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sản phẩm</h1>
          <p className="text-sm text-muted-foreground">{rows.length} sản phẩm</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusIcon className="size-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Ảnh</th>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Giới tính</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2">
                  <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                    {r.thumbnail && (
                      <Image
                        src={r.thumbnail}
                        alt={r.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${r.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{r.slug}</p>
                </td>
                <td className="px-4 py-3">{genderLabel[r.gender as Gender]}</td>
                <td className="px-4 py-3">{formatVND(r.basePrice)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.variantCount}</td>
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
                  <ProductRowActions id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
