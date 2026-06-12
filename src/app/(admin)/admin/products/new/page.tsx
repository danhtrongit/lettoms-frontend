import {
  listColors,
  listSizes,
  listCategoriesAdmin,
} from "@/lib/repos/catalog-admin.repo";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Thêm sản phẩm" };

export default async function NewProductPage() {
  const [colors, sizes, cats] = await Promise.all([
    listColors(),
    listSizes(),
    listCategoriesAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm sản phẩm</h1>
      <ProductForm
        colors={colors.map((c) => ({ code: c.code, name: c.name, hex: c.hex }))}
        sizes={sizes.map((s) => ({ code: s.code, label: s.label }))}
        categories={cats.map((c) => ({
          id: c.id,
          name: c.name,
          gender: c.gender,
          parentId: c.parentId,
        }))}
      />
    </div>
  );
}
