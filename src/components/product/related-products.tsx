import type { Product } from "@/types";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "./product-grid";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="py-12">
      <SectionHeading title="Có thể bạn cũng thích" />
      <ProductGrid products={products.slice(0, 4)} />
    </section>
  );
}
