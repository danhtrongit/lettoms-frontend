import Link from "next/link";
import { requireStaff } from "@/lib/auth/rbac";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOutIcon, ExternalLinkIcon } from "lucide-react";

export const metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị Letom's" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background lg:flex">
          <div className="flex h-14 items-center border-b px-5">
            <Link href="/admin" className="text-lg font-semibold tracking-tight">
              Letom&apos;s <span className="text-muted-foreground">Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminSidebar role={user.role} />
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <AdminMobileNav role={user.role} />
              <span className="truncate text-sm text-muted-foreground">
                <span className="hidden sm:inline">Xin chào, </span>
                <span className="font-medium text-foreground">{user.name ?? user.email}</span>
                <span className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 text-xs uppercase sm:inline">
                  {user.role}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/" target="_blank">
                  <ExternalLinkIcon className="size-4" />
                  <span className="hidden sm:inline">Xem site</span>
                </Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOutIcon className="size-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </form>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
