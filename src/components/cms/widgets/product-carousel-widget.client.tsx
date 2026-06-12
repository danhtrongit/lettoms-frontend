"use client";

import { useWidgetData } from "@/hooks/use-widget-data";
import type { Product } from "@/types";
import { ProductCarouselView, type ProductCarouselWidgetProps } from "./product-carousel-view";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCarouselClient({ heading, flag, limit }: ProductCarouselWidgetProps) {
  const { data, loading } = useWidgetData<Product>(
    `/api/widgets/products?flag=${flag || "new"}&limit=${limit || 8}`
  );
  if (loading || !data) {
    return (
      <section className="container-page py-8">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {Array.from({ length: limit || 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-44 shrink-0 sm:w-56" />
          ))}
        </div>
      </section>
    );
  }
  return <ProductCarouselView heading={heading} products={data} />;
}
