import type { Breadcrumb, Product, ProductFilter } from "@/types";
import { getProducts, getFacets } from "@/lib/api/products";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/product/sort-select";
import { PaginationBar } from "@/components/product/pagination-bar";
import { FilterControls, ClearFiltersButton } from "@/components/product/filter-controls";
import { FilterDrawer } from "@/components/product/filter-drawer";
import { EmptyState } from "@/components/common/empty-state";

interface ProductListingProps {
  title: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
  filter: ProductFilter;
}

export async function ProductListing({
  title,
  description,
  breadcrumbs,
  filter,
}: ProductListingProps) {
  const [{ items, total, page, totalPages }, facets] = await Promise.all([
    getProducts({ ...filter, pageSize: 12 }),
    getFacets({
      gender: filter.gender,
      categorySlug: filter.categorySlug,
      subcategorySlug: filter.subcategorySlug,
    }),
  ]);

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Bộ lọc</h2>
            <ClearFiltersButton />
          </div>
          <FilterControls facets={facets} />
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FilterDrawer facets={facets} />
              <span className="text-sm text-muted-foreground">
                {total} sản phẩm
              </span>
            </div>
            <SortSelect />
          </div>

          {items.length ? (
            <>
              <ProductGrid products={items} />
              <div className="mt-10">
                <PaginationBar page={page} totalPages={totalPages} total={total} />
              </div>
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử điều chỉnh bộ lọc hoặc xóa bớt tiêu chí tìm kiếm."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export type { Product };
