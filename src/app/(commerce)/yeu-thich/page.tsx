"use client";

import * as React from "react";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/common/empty-state";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useHydrated } from "@/hooks/use-hydrated";

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const mounted = useHydrated();
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const ctrl = new AbortController();
    if (!ids.length) {
      // defer to avoid synchronous setState in effect body
      const id = window.setTimeout(() => setProducts([]), 0);
      return () => window.clearTimeout(id);
    }
    fetch(`/api/products?ids=${ids.join(",")}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((json: { data: Product[] }) => setProducts(json.data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [ids]);

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Yêu thích" }]}
      />
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Danh sách yêu thích
      </h1>

      {!mounted ? null : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm yêu thích"
          description="Nhấn vào biểu tượng trái tim trên sản phẩm để lưu lại."
          actionLabel="Khám phá sản phẩm"
          actionHref="/women"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
