"use client";

import { useWidgetData } from "@/hooks/use-widget-data";
import type { Category } from "@/types";
import { FeaturedCategoriesView, type FeaturedCategoriesWidgetProps } from "./featured-categories-view";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCategoriesClient({ heading, gender, limit }: FeaturedCategoriesWidgetProps) {
  const { data, loading } = useWidgetData<Category>(
    `/api/widgets/categories?gender=${gender || "nu"}`
  );
  if (loading || !data) {
    return (
      <section className="container-page py-8">
        <Skeleton className="mb-4 h-8 w-56" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: limit || 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <FeaturedCategoriesView
      heading={heading}
      gender={gender}
      categories={data}
      limit={limit}
    />
  );
}
