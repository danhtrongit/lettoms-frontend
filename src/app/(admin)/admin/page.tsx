import Link from "next/link";
import {
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  BanknoteIcon,
  NewspaperIcon,
  ImageIcon,
  ClockIcon,
} from "lucide-react";
import { getAdminStats } from "@/lib/repos/stats.repo";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Tổng quan" };

const cards = [
  { key: "revenue", label: "Doanh thu (đã TT)", icon: BanknoteIcon, money: true },
  { key: "orders", label: "Đơn hàng", icon: ShoppingCartIcon, href: "/admin/orders" },
  { key: "pendingOrders", label: "Đơn chờ xử lý", icon: ClockIcon, href: "/admin/orders" },
  { key: "products", label: "Sản phẩm", icon: PackageIcon, href: "/admin/products" },
  { key: "customers", label: "Khách hàng", icon: UsersIcon, href: "/admin/users" },
  { key: "articles", label: "Bài viết", icon: NewspaperIcon, href: "/admin/articles" },
  { key: "media", label: "Ảnh", icon: ImageIcon, href: "/admin/media" },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">
          Thống kê nhanh về cửa hàng Letom&apos;s
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const value =
            "money" in c && c.money
              ? formatVND(stats.revenue)
              : String(stats[c.key as keyof typeof stats]);
          const inner = (
            <div className="rounded-xl border bg-background p-5 transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
            </div>
          );
          return "href" in c && c.href ? (
            <Link key={c.key} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.key}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
