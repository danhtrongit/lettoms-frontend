import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Gender } from "@/types";
import { genderLabel } from "@/data/site";
import { getCategoryDb, getCategoriesByGenderDb } from "@/lib/repos/categories.repo";
import { parseFilterParams } from "@/lib/filter-params";
import { buildMetadata } from "@/lib/seo";
import { ProductListing } from "@/components/product/product-listing";

const VALID: Gender[] = ["nu", "nam"];

type Params = Promise<{ gender: string; category: string; subcategory: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { gender, category, subcategory } = await params;
  if (!VALID.includes(gender as Gender)) return {};
  const cat = await getCategoryDb(gender as Gender, category);
  const sub = cat?.subcategories.find((s) => s.slug === subcategory);
  if (!cat || !sub) return {};
  return buildMetadata({
    title: `${sub.name} ${genderLabel[gender as Gender]}`,
    description: `${sub.name} ${genderLabel[gender as Gender]} — ${cat.description ?? ""}`,
    path: `/${gender}/${category}/${subcategory}`,
  });
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { gender, category, subcategory } = await params;
  if (!VALID.includes(gender as Gender)) notFound();
  const g = gender as Gender;
  const cat = await getCategoryDb(g, category);
  const sub = cat?.subcategories.find((s) => s.slug === subcategory);
  if (!cat || !sub) notFound();

  const sp = await searchParams;
  const filter = {
    ...parseFilterParams(sp),
    gender: g,
    categorySlug: category,
    subcategorySlug: subcategory,
  };

  return (
    <ProductListing
      title={`${sub.name} ${genderLabel[g]}`}
      breadcrumbs={[
        { label: "Trang chủ", href: "/" },
        { label: genderLabel[g], href: `/${g}` },
        { label: cat.name, href: `/${g}/${category}` },
        { label: sub.name },
      ]}
      filter={filter}
    />
  );
}

export async function generateStaticParams() {
  const all: { gender: string; category: string; subcategory: string }[] = [];
  for (const g of VALID) {
    for (const c of await getCategoriesByGenderDb(g)) {
      for (const s of c.subcategories) {
        all.push({ gender: g, category: c.slug, subcategory: s.slug });
      }
    }
  }
  return all;
}
