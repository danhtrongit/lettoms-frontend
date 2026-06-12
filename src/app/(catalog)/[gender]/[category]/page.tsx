import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Gender } from "@/types";
import { genderLabel } from "@/data/site";
import { getCategoryDb, getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import { parseFilterParams } from "@/lib/filter-params";
import { buildMetadata } from "@/lib/seo";
import { ProductListing } from "@/components/product/product-listing";

const VALID: Gender[] = ["nu", "nam", "tre-em", "em-be"];

type Params = Promise<{ gender: string; category: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { gender, category } = await params;
  if (!VALID.includes(gender as Gender)) return {};
  const cat = await getCategoryDb(gender as Gender, category);
  if (!cat) return {};
  return buildMetadata({
    title: `${cat.name} ${genderLabel[gender as Gender]}`,
    description: cat.description,
    path: `/${gender}/${category}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { gender, category } = await params;
  if (!VALID.includes(gender as Gender)) notFound();
  const g = gender as Gender;
  const cat = await getCategoryDb(g, category);
  if (!cat) notFound();

  const sp = await searchParams;
  const filter = {
    ...parseFilterParams(sp),
    gender: g,
    categorySlug: category,
  };

  return (
    <ProductListing
      title={`${cat.name} ${genderLabel[g]}`}
      description={cat.description}
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: genderLabel[g], href: `/${g}` },
        { label: cat.name },
      ]}
      filter={filter}
    />
  );
}

export async function generateStaticParams() {
  const all: { gender: string; category: string }[] = [];
  for (const g of VALID) {
    for (const c of await getCategoriesByGenderDb(g)) {
      all.push({ gender: g, category: c.slug });
    }
  }
  return all;
}
