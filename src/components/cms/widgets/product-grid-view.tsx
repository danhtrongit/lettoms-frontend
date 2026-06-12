import type { Product } from "@/types";
import { FeaturedCollection } from "@/components/home/featured-collection";

export interface ProductGridWidgetProps {
  heading?: string;
  flag?: string;
  limit?: number;
  href?: string;
}

export function ProductGridView({
  heading,
  href,
  products,
}: {
  heading?: string;
  href?: string;
  products: Product[];
}) {
  return (
    <FeaturedCollection
      title={heading || "Sản phẩm"}
      href={href || undefined}
      products={products}
    />
  );
}
