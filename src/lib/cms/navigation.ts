import type { MenuNode } from "@/db/schema/cms";
import { getMenu } from "@/lib/repos/menus.repo";
import { mainNav, footerNav } from "@/data/navigation";
import type { NavItem, NavColumn } from "@/types";

/**
 * Header: gender mega-menu items stay code-driven (they embed category data);
 * DB "header" menu replaces the static tail links (Khuyến Mãi, Hàng Mới, ...).
 * Footer: DB "footer" menu replaces footerNav columns entirely when present.
 */
export async function getSiteNavigation(): Promise<{
  headerNav: NavItem[];
  footerColumns: NavColumn[];
}> {
  const [headerDb, footerDb] = await Promise.all([
    getMenu("header"),
    getMenu("footer"),
  ]);

  const genderItems = mainNav.filter((i) => i.gender);
  const headerTail: NavItem[] = headerDb?.length
    ? headerDb.map(menuNodeToNavItem)
    : mainNav.filter((i) => !i.gender);

  const footerColumns: NavColumn[] = footerDb?.length
    ? footerDb.map((col) => ({
        title: col.label,
        items: (col.children ?? []).map((c) => ({ label: c.label, href: c.href })),
      }))
    : footerNav;

  return { headerNav: [...genderItems, ...headerTail], footerColumns };
}

function menuNodeToNavItem(node: MenuNode): NavItem {
  return {
    label: node.label,
    href: node.href,
    ...(node.children?.length
      ? {
          columns: [
            {
              title: node.label,
              items: node.children.map((c) => ({ label: c.label, href: c.href })),
            },
          ],
        }
      : {}),
  };
}
