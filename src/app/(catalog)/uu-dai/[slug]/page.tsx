import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ProductFlag } from "@/types";
import { parseFilterParams } from "@/lib/filter-params";
import { buildMetadata } from "@/lib/seo";
import { ProductListing } from "@/components/product/product-listing";

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const FEATURES: Record<
  string,
  { title: string; description: string; flag: ProductFlag }
> = {
  "hang-moi": {
    title: "Hàng Mới Về",
    description: "Những thiết kế mới nhất vừa cập bến Letom's.",
    flag: "new",
  },
  "khuyen-mai": {
    title: "Khuyến Mãi",
    description: "Ưu đãi giá tốt cho các sản phẩm chọn lọc.",
    flag: "sale",
  },
  "ban-chay": {
    title: "Bán Chạy Nhất",
    description: "Những sản phẩm được khách hàng yêu thích nhất.",
    flag: "bestseller",
  },
  "uu-dai-co-han": {
    title: "Ưu Đãi Có Hạn",
    description: "Số lượng giới hạn, nhanh tay sở hữu.",
    flag: "limited",
  },
};

export function generateStaticParams() {
  return Object.keys(FEATURES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = FEATURES[slug];
  if (!feature) return {};
  return buildMetadata({
    title: feature.title,
    description: feature.description,
    path: `/uu-dai/${slug}`,
  });
}

export default async function FeaturePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const feature = FEATURES[slug];
  if (!feature) notFound();

  const sp = await searchParams;
  const filter = {
    ...parseFilterParams(sp),
    flags: [feature.flag],
  };

  return (
    <ProductListing
      title={feature.title}
      description={feature.description}
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: feature.title },
      ]}
      filter={filter}
    />
  );
}
