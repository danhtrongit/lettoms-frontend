import type { Metadata } from "next";
import { parseFilterParams } from "@/lib/filter-params";
import { getProducts } from "@/lib/api/products";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/product/sort-select";
import { PaginationBar } from "@/components/product/pagination-bar";
import { EmptyState } from "@/components/common/empty-state";

type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Search;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return buildMetadata({
    title: q ? `Kết quả cho "${q}"` : "Tìm kiếm",
    path: "/tim-kiem",
    noIndex: true,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const filter = parseFilterParams(sp);
  const query = filter.query ?? "";
  const { items, total, page, totalPages } = await getProducts({
    ...filter,
    pageSize: 12,
  });

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label: "Tìm kiếm" }]}
      />

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {query ? `Kết quả cho "${query}"` : "Tìm kiếm sản phẩm"}
        </h1>
        {query && (
          <p className="mt-1 text-sm text-muted-foreground">
            {total} sản phẩm phù hợp
          </p>
        )}
      </div>

      {items.length ? (
        <>
          <div className="mb-5 flex justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={items} />
          <div className="mt-10">
            <PaginationBar page={page} totalPages={totalPages} total={total} />
          </div>
        </>
      ) : (
        <EmptyState
          title={query ? "Không tìm thấy kết quả" : "Bắt đầu tìm kiếm"}
          description={
            query
              ? "Thử từ khóa khác hoặc kiểm tra chính tả."
              : "Nhập từ khóa để tìm sản phẩm yêu thích."
          }
          actionLabel="Khám phá sản phẩm"
          actionHref="/women"
        />
      )}
    </div>
  );
}
