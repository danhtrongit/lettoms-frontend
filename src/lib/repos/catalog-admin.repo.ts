import { eq, asc, desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  products,
  productVariants,
  productImages,
  productColors,
  productSizes,
  colors,
  sizes,
} from "@/db/schema";
import type { CategoryInput, ProductInput } from "@/lib/validators/catalog";
import { renderTiptapHtml } from "@/lib/rich-text/render";
import type { JSONContent } from "@tiptap/core";

/** Build the rich-content column pairs (json source + cached html) for a product. */
function richCols(input: ProductInput) {
  const dJson = (input.descriptionJson ?? null) as JSONContent | null;
  const mJson = (input.materialsJson ?? null) as JSONContent | null;
  const cJson = (input.careJson ?? null) as JSONContent | null;
  return {
    descriptionJson: dJson,
    descriptionHtml: renderTiptapHtml(dJson),
    materialsJson: mJson,
    materialsHtml: renderTiptapHtml(mJson),
    careJson: cJson,
    careHtml: renderTiptapHtml(cJson),
  };
}

/* ----------------------------- Categories ----------------------------- */

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  gender: string;
  parentId: string | null;
  parentName: string | null;
  isActive: boolean;
  sortOrder: number;
}

export async function listCategoriesAdmin(): Promise<AdminCategoryRow[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.gender), asc(categories.sortOrder));
  const byId = new Map(rows.map((r) => [r.id, r]));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    gender: r.gender,
    parentId: r.parentId,
    parentName: r.parentId ? byId.get(r.parentId)?.name ?? null : null,
    isActive: r.isActive,
    sortOrder: r.sortOrder,
  }));
}

export async function getCategoryAdmin(id: string) {
  return db.query.categories.findFirst({ where: eq(categories.id, id) });
}

export async function createCategory(input: CategoryInput): Promise<string> {
  const [row] = await db
    .insert(categories)
    .values({
      slug: input.slug,
      name: input.name,
      gender: input.gender,
      parentId: input.parentId || null,
      description: input.description ?? null,
      heroImage: input.heroImage ?? null,
      iconImage: input.iconImage ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    })
    .returning({ id: categories.id });
  return row.id;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  await db
    .update(categories)
    .set({
      slug: input.slug,
      name: input.name,
      gender: input.gender,
      parentId: input.parentId || null,
      description: input.description ?? null,
      heroImage: input.heroImage ?? null,
      iconImage: input.iconImage ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      ogImage: input.ogImage ?? null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}

/* ----------------------------- Colors / Sizes ----------------------------- */

export async function listColors() {
  return db.select().from(colors).orderBy(asc(colors.code));
}

export async function listSizes() {
  return db.select().from(sizes).orderBy(asc(sizes.sortOrder));
}

export async function upsertColor(input: {
  code: string;
  name: string;
  hex: string;
  chip?: string | null;
}): Promise<void> {
  await db
    .insert(colors)
    .values({
      code: input.code,
      name: input.name,
      hex: input.hex,
      chip: input.chip ?? null,
    })
    .onConflictDoUpdate({
      target: colors.code,
      set: { name: input.name, hex: input.hex, chip: input.chip ?? null },
    });
}

export async function deleteColor(code: string): Promise<void> {
  await db.delete(colors).where(eq(colors.code, code));
}

export async function upsertSize(input: {
  code: string;
  label: string;
  sortOrder: number;
}): Promise<void> {
  await db
    .insert(sizes)
    .values({ code: input.code, label: input.label, sortOrder: input.sortOrder })
    .onConflictDoUpdate({
      target: sizes.code,
      set: { label: input.label, sortOrder: input.sortOrder },
    });
}

export async function deleteSize(code: string): Promise<void> {
  await db.delete(sizes).where(eq(sizes.code, code));
}

/* ----------------------------- Products ----------------------------- */

export interface AdminProductRow {
  id: string;
  slug: string;
  name: string;
  gender: string;
  basePrice: number;
  isActive: boolean;
  thumbnail: string | null;
  variantCount: number;
}

export async function listProductsAdmin(): Promise<AdminProductRow[]> {
  const rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  const variants = await db
    .select({ productId: productVariants.productId })
    .from(productVariants);
  const counts = new Map<string, number>();
  for (const v of variants)
    counts.set(v.productId, (counts.get(v.productId) ?? 0) + 1);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    gender: r.gender,
    basePrice: r.basePrice,
    isActive: r.isActive,
    thumbnail: r.thumbnail,
    variantCount: counts.get(r.id) ?? 0,
  }));
}

export async function getProductAdmin(id: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: true,
      images: true,
      colors: true,
      sizes: true,
    },
  });
  return product;
}

export async function createProduct(input: ProductInput): Promise<string> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(products)
      .values({
        slug: input.slug,
        name: input.name,
        gender: input.gender,
        categoryId: input.categoryId || null,
        subcategoryId: input.subcategoryId || null,
        description: input.description,
        materials: input.materials,
        care: input.care,
        ...richCols(input),
        basePrice: input.basePrice,
        originalPrice: input.originalPrice ?? null,
        flags: input.flags,
        thumbnail: input.thumbnail ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        ogImage: input.ogImage ?? null,
        isActive: input.isActive,
      })
      .returning({ id: products.id });

    const productId = row.id;
    await writeProductRelations(tx, productId, input);
    return productId;
  });
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        slug: input.slug,
        name: input.name,
        gender: input.gender,
        categoryId: input.categoryId || null,
        subcategoryId: input.subcategoryId || null,
        description: input.description,
        materials: input.materials,
        care: input.care,
        ...richCols(input),
        basePrice: input.basePrice,
        originalPrice: input.originalPrice ?? null,
        flags: input.flags,
        thumbnail: input.thumbnail ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        ogImage: input.ogImage ?? null,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    // Replace relations wholesale (simplest correct approach).
    await tx.delete(productColors).where(eq(productColors.productId, id));
    await tx.delete(productSizes).where(eq(productSizes.productId, id));
    await tx.delete(productImages).where(eq(productImages.productId, id));
    await tx.delete(productVariants).where(eq(productVariants.productId, id));

    await writeProductRelations(tx, id, input);
  });
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function writeProductRelations(
  tx: Tx,
  productId: string,
  input: ProductInput
): Promise<void> {
  if (input.colorCodes.length)
    await tx.insert(productColors).values(
      input.colorCodes.map((code, i) => ({
        productId,
        colorCode: code,
        sortOrder: i,
      }))
    );

  if (input.sizeCodes.length)
    await tx.insert(productSizes).values(
      input.sizeCodes.map((code, i) => ({
        productId,
        sizeCode: code,
        sortOrder: i,
      }))
    );

  if (input.images.length)
    await tx.insert(productImages).values(
      input.images.map((img, i) => ({
        productId,
        src: img.src,
        alt: img.alt,
        colorCode: img.colorCode ?? null,
        sortOrder: i,
      }))
    );

  if (input.variants.length)
    await tx.insert(productVariants).values(
      input.variants.map((v) => ({
        productId,
        colorCode: v.colorCode,
        sizeCode: v.sizeCode,
        sku: v.sku,
        price: v.price,
        originalPrice: v.originalPrice ?? null,
        stock: v.stock,
        image: v.image ?? null,
        isActive: v.isActive,
      }))
    );
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  if (ids.length) await db.delete(products).where(inArray(products.id, ids));
}
