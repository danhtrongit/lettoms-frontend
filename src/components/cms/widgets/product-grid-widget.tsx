import { getFeaturedProducts } from "@/lib/api/products";
import type { ProductFlag } from "@/types";
import { ProductGridView, type ProductGridWidgetProps } from "./product-grid-view";

export type { ProductGridWidgetProps };

export async function ProductGridServer({ heading, flag, limit, href }: ProductGridWidgetProps) {
  const products = await getFeaturedProducts((flag || "bestseller") as ProductFlag, limit || 4);
  return <ProductGridView heading={heading} href={href} products={products} />;
}
