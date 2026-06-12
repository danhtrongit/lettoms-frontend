import { getMenu } from "@/lib/repos/menus.repo";
import { listPublishedPagesForSitemap } from "@/lib/repos/pages.repo";
import { MenuEditor } from "@/components/admin/menu-editor";

export const metadata = { title: "Quản lý menu" };

export default async function MenusPage() {
  const [header, footer, pages] = await Promise.all([
    getMenu("header"),
    getMenu("footer"),
    listPublishedPagesForSitemap(),
  ]);
  const pageOptions = pages
    .filter((p) => !p.isSystem)
    .map((p) => ({ label: p.slug, href: `/trang/${p.slug}` }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Menu điều hướng</h1>
      <MenuEditor
        initialHeader={header ?? []}
        initialFooter={footer ?? []}
        pageOptions={pageOptions}
      />
    </div>
  );
}
