import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div className={cn("product-grid", className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-3/4 w-full rounded-md" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
