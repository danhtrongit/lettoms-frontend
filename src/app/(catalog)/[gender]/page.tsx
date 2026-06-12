import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Gender } from "@/types";
import { genders, genderLabel } from "@/data/site";
import { getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import { getFeaturedProducts } from "@/lib/api/products";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { SectionHeading } from "@/components/common/section-heading";

const VALID: Gender[] = ["nu", "nam"];

// Closed set of genders — unknown slugs must be a hard 404, not a cached
// soft-404 shell from the dynamic-params fallback render.
export const dynamicParams = false;

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
  const label = genderLabel[gender as Gender];
  return buildMetadata({
    title: `Thời Trang ${label}`,
    description: `Khám phá bộ sưu tập thời trang ${label} của Letom's — cơ bản, chất lượng cao, dễ phối.`,
    path: `/${gender}`,
  });
}

export default async function GenderPage({
  params,
}: {
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  if (!VALID.includes(gender as Gender)) notFound();
  const g = gender as Gender;
  const label = genderLabel[g];
  const [cats, newItems] = await Promise.all([
    getCategoriesByGenderDb(g),
    getFeaturedProducts("new", 4),
  ]);

  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[{ label: "Trang chủ", href: "/" }, { label }]}
      />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Thời Trang {label}
      </h1>

      <section className="py-10">
        <SectionHeading title="Danh mục" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/${g}/${c.slug}`}
              className="group flex aspect-square flex-col items-center justify-center rounded-lg border bg-muted/40 p-4 text-center transition-colors hover:border-primary"
            >
              <span className="font-medium group-hover:text-primary">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedCollection
        title="Hàng mới về"
        href="/uu-dai/hang-moi"
        products={newItems}
      />
    </div>
  );
}
