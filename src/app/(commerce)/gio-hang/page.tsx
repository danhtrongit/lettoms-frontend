"use client";

import * as React from "react";
import { useCart, selectCartTotal } from "@/store/cart";
import { CartLineItem } from "@/components/commerce/cart-line-item";
import { CartSummary } from "@/components/commerce/cart-summary";
import { EmptyState } from "@/components/common/empty-state";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useHydrated } from "@/hooks/use-hydrated";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectCartTotal);
  const mounted = useHydrated();

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Giỏ hàng" }]} />
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Giỏ hàng
      </h1>

      {!mounted ? null : items.length === 0 ? (
        <EmptyState
          title="Giỏ hàng trống"
          description="Bạn chưa thêm sản phẩm nào vào giỏ hàng."
          actionLabel="Tiếp tục mua sắm"
          actionHref="/women"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="divide-y">
            {items.map((item) => (
              <CartLineItem
                key={`${item.productId}-${item.colorCode}-${item.sizeCode}`}
                item={item}
              />
            ))}
          </div>
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      )}
    </div>
  );
}
