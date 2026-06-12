"use client";

import { useWidgetData } from "@/hooks/use-widget-data";
import type { Product } from "@/types";
import { ProductGridView, type ProductGridWidgetProps } from "./product-grid-view";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridClient({ heading, flag, limit, href }: ProductGridWidgetProps) {
  const { data, loading } = useWidgetData<Product>(
    `/api/widgets/products?flag=${flag || "bestseller"}&limit=${limit || 4}`
  );
  if (loading || !data) {
    return (
      <section className="container-page py-8">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="product-grid">
          {Array.from({ length: limit || 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }
  return <ProductGridView heading={heading} href={href} products={data} />;
}
