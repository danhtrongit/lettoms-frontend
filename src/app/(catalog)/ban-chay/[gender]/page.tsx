import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Gender } from "@/types";
import { genders, genderLabel } from "@/data/site";
import { getRankings } from "@/lib/api/products";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";

const VALID: Gender[] = ["nu", "nam"];

export function generateStaticParams() {
  return genders.map((g) => ({ gender: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender: string }>;
}): Promise<Metadata> {
  const { gender } = await params;
  if (!VALID.includes(gender as Gender)) return {};
  return buildMetadata({
    title: `Sản Phẩm Bán Chạy ${genderLabel[gender as Gender]}`,
    description: `Bảng xếp hạng sản phẩm bán chạy nhất dành cho ${genderLabel[gender as Gender]}.`,
    path: `/ban-chay/${gender}`,
  });
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  if (!VALID.includes(gender as Gender)) notFound();
  const g = gender as Gender;
  const ranked = await getRankings(g, 12);

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { label: "Trang chủ", href: "/" },
          { label: `Bán chạy ${genderLabel[g]}` },
        ]}
      />
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Sản Phẩm Bán Chạy {genderLabel[g]}
      </h1>

      <div className="product-grid">
        {ranked.map((p, i) => (
          <div key={p.id} className="relative">
            <span className="absolute left-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {i + 1}
            </span>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
