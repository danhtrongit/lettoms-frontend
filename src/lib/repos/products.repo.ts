import { cache } from "react";
import { db } from "@/db";
import type { Product, ProductFlag } from "@/types";

// Row shape from the relational query below.
type ProductRow = Awaited<ReturnType<typeof queryProducts>>[number];

function queryProducts() {
  return db.query.products.findMany({
    where: (p, { eq }) => eq(p.isActive, true),
    with: {
      images: true,
      colors: { with: { color: true } },
      sizes: { with: { size: true } },
      variants: true,
    },
  });
}

function mapProduct(
  r: ProductRow,
  catById: Map<string, { slug: string }>
): Product {
  const category = r.categoryId ? catById.get(r.categoryId) : undefined;
  const subcategory = r.subcategoryId
    ? catById.get(r.subcategoryId)
    : undefined;

  const colors = [...r.colors]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pc) => ({
      code: pc.color.code,
      name: pc.color.name,
      hex: pc.color.hex,
      chip: pc.color.chip ?? undefined,
    }));

  // A size is in stock if any variant of that size has stock > 0.
  const stockBySize = new Map<string, boolean>();
  for (const v of r.variants) {
    if (v.stock > 0) stockBySize.set(v.sizeCode, true);
  }

  const sizes = [...r.sizes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((ps) => ({
      code: ps.size.code,
      label: ps.size.label,
      inStock: stockBySize.get(ps.size.code) ?? false,
    }));

  const images = [...r.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((im) => ({
      src: im.src,
      alt: im.alt,
      colorCode: im.colorCode ?? undefined,
    }));

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    gender: r.gender,
    categorySlug: category?.slug ?? "",
    subcategorySlug: subcategory?.slug,
    price: r.basePrice,
    originalPrice: r.originalPrice ?? undefined,
    description: r.description,
    materials: r.materials,
    care: r.care,
    descriptionHtml: r.descriptionHtml ?? null,
    materialsHtml: r.materialsHtml ?? null,
    careHtml: r.careHtml ?? null,
    colors,
    sizes,
    images,
    flags: r.flags as ProductFlag[],
    rating: r.rating,
    reviewCount: r.reviewCount,
    createdAt: r.createdAt.toISOString().slice(0, 10),
  };
}

/** All active products mapped to the domain `Product` shape (per-request cached). */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const [rows, cats] = await Promise.all([
    queryProducts(),
    db.query.categories.findMany(),
  ]);
  const catById = new Map(cats.map((c) => [c.id, { slug: c.slug }]));
  return rows.map((r) => mapProduct(r, catById));
});
