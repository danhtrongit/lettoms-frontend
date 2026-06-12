import { listColors, listSizes } from "@/lib/repos/catalog-admin.repo";
import { ColorsSizesManager } from "@/components/admin/colors-sizes-manager";

export const metadata = { title: "Màu & Kích cỡ" };

export default async function ColorsSizesPage() {
  const [colors, sizes] = await Promise.all([listColors(), listSizes()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Màu & Kích cỡ</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý bảng màu và kích cỡ dùng chung cho biến thể sản phẩm.
        </p>
      </div>
      <ColorsSizesManager
        colors={colors.map((c) => ({ code: c.code, name: c.name, hex: c.hex }))}
        sizes={sizes.map((s) => ({ code: s.code, label: s.label, sortOrder: s.sortOrder }))}
      />
    </div>
  );
}
