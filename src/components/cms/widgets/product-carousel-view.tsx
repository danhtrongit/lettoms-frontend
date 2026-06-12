import type { Product } from "@/types";
import { ProductGrid } from "@/components/product/product-grid";

export interface ProductCarouselWidgetProps {
  heading?: string;
  flag?: string;
  limit?: number;
}

export function ProductCarouselView({
  heading,
  products,
}: {
  heading?: string;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="container-page py-8">
      {heading && (
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {products.map((prod) => (
          <div key={prod.id} className="w-44 shrink-0 snap-start sm:w-56">
            <ProductGrid products={[prod]} />
          </div>
        ))}
      </div>
    </section>
  );
}
