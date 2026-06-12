import { getFeaturedProducts } from "@/lib/api/products";
import type { ProductFlag } from "@/types";
import { ProductCarouselView, type ProductCarouselWidgetProps } from "./product-carousel-view";

export type { ProductCarouselWidgetProps };

export async function ProductCarouselServer({ heading, flag, limit }: ProductCarouselWidgetProps) {
  const products = await getFeaturedProducts((flag || "new") as ProductFlag, limit || 8);
  return <ProductCarouselView heading={heading} products={products} />;
}
