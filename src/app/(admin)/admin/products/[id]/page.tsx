import { notFound } from "next/navigation";
import {
  getProductAdmin,
  listColors,
  listSizes,
  listCategoriesAdmin,
} from "@/lib/repos/catalog-admin.repo";
import { ProductForm } from "@/components/admin/product-form";
import type { Gender } from "@/types";
import type { JSONContent } from "@tiptap/core";

export const metadata = { title: "Sửa sản phẩm" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, colors, sizes, cats] = await Promise.all([
    getProductAdmin(id),
    listColors(),
    listSizes(),
    listCategoriesAdmin(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa sản phẩm</h1>
      <ProductForm
        id={product.id}
        colors={colors.map((c) => ({ code: c.code, name: c.name, hex: c.hex }))}
        sizes={sizes.map((s) => ({ code: s.code, label: s.label }))}
        categories={cats.map((c) => ({
          id: c.id,
          name: c.name,
          gender: c.gender,
          parentId: c.parentId,
        }))}
        initial={{
          name: product.name,
          slug: product.slug,
          gender: product.gender as Gender,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId,
          descriptionJson: (product.descriptionJson as JSONContent | null) ?? null,
          materialsJson: (product.materialsJson as JSONContent | null) ?? null,
          careJson: (product.careJson as JSONContent | null) ?? null,
          basePrice: product.basePrice,
          originalPrice: product.originalPrice,
          flags: product.flags,
          thumbnail: product.thumbnail,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          colorCodes: [...product.colors]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => c.colorCode),
          sizeCodes: [...product.sizes]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((s) => s.sizeCode),
          images: [...product.images]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((im) => ({ src: im.src, alt: im.alt, colorCode: im.colorCode })),
          variants: product.variants.map((v) => ({
            colorCode: v.colorCode,
            sizeCode: v.sizeCode,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            image: v.image ?? null,
            isActive: v.isActive,
          })),
        }}
      />
    </div>
  );
}
