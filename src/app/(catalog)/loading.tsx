import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function Loading() {
  return (
    <div className="container-page py-10">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
