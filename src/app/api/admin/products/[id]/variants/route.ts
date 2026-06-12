import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/rbac";
import { getProductAdmin, listColors, listSizes } from "@/lib/repos/catalog-admin.repo";

/**
 * GET /api/admin/products/[id]/variants
 * Returns active variants of a product with color/size labels for the
 * admin order builder. Staff-only.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireStaff();
  const { id } = await params;
  const [product, colors, sizes] = await Promise.all([
    getProductAdmin(id),
    listColors(),
    listSizes(),
  ]);
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const colorName = new Map(colors.map((c) => [c.code, c.name]));
  const sizeLabel = new Map(sizes.map((s) => [s.code, s.label]));

  const variants = product.variants
    .filter((v) => v.isActive)
    .map((v) => ({
      id: v.id,
      colorCode: v.colorCode,
      sizeCode: v.sizeCode,
      colorName: colorName.get(v.colorCode) ?? v.colorCode,
      sizeLabel: sizeLabel.get(v.sizeCode) ?? v.sizeCode,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      image: v.image ?? product.thumbnail ?? null,
    }));

  return NextResponse.json({
    name: product.name,
    thumbnail: product.thumbnail,
    variants,
  });
}
