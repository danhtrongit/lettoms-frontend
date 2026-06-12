import type { Product } from "@/types";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductGrid } from "@/components/product/product-grid";

interface FeaturedCollectionProps {
  title: string;
  description?: string;
  href?: string;
  products: Product[];
}

export function FeaturedCollection({
  title,
  description,
  href,
  products,
}: FeaturedCollectionProps) {
  if (!products.length) return null;
  return (
    <section className="container-page py-12">
      <SectionHeading title={title} description={description} href={href} />
      <ProductGrid products={products.slice(0, 4)} />
    </section>
  );
}
