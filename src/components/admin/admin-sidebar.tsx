"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  FolderTreeIcon,
  ImageIcon,
  NewspaperIcon,
  TagsIcon,
  ShoppingCartIcon,
  UsersIcon,
  SettingsIcon,
  LayoutTemplateIcon,
  PaletteIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const links: NavLink[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Sản phẩm", icon: PackageIcon },
  { href: "/admin/categories", label: "Danh mục SP", icon: FolderTreeIcon },
  { href: "/admin/colors-sizes", label: "Màu & Kích cỡ", icon: PaletteIcon },
  { href: "/admin/articles", label: "Bài viết", icon: NewspaperIcon },
  { href: "/admin/article-categories", label: "Danh mục bài viết", icon: TagsIcon },
  { href: "/admin/media", label: "Thư viện ảnh", icon: ImageIcon },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCartIcon },
  { href: "/admin/pages", label: "Trang (Page)", icon: LayoutTemplateIcon },
  { href: "/admin/users", label: "Người dùng", icon: UsersIcon, adminOnly: true },
  { href: "/admin/settings", label: "Cấu hình", icon: SettingsIcon, adminOnly: true },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      {links
        .filter((l) => !l.adminOnly || role === "admin")
        .map((l) => {
          const active =
            l.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {l.label}
            </Link>
          );
        })}
    </nav>
  );
}
