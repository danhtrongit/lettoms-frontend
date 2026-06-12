"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon, MapPinIcon, PackageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/tai-khoan", label: "Hồ sơ", icon: UserIcon },
  { href: "/tai-khoan/dia-chi", label: "Sổ địa chỉ", icon: MapPinIcon },
  { href: "/tai-khoan/don-hang", label: "Đơn hàng", icon: PackageIcon },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active =
          l.href === "/tai-khoan" ? pathname === l.href : pathname.startsWith(l.href);
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
            <Icon className="size-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
