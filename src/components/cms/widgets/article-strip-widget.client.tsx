"use client";

import { useWidgetData } from "@/hooks/use-widget-data";
import type { Article } from "@/types";
import { ArticleStripView, type ArticleStripWidgetProps } from "./article-strip-view";
import { Skeleton } from "@/components/ui/skeleton";

export function ArticleStripClient({ heading, limit }: ArticleStripWidgetProps) {
  const { data, loading } = useWidgetData<Article>(
    `/api/widgets/articles?limit=${limit || 3}`
  );
  if (loading || !data) {
    return (
      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit || 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return <ArticleStripView heading={heading} articles={data} />;
}
