import { requireUser } from "@/lib/auth/rbac";
import { logoutAction } from "@/server/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata = {
  title: { default: "Tài khoản", template: "%s | Tài khoản Letom's" },
  robots: { index: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/tai-khoan");

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Xin chào,</p>
            <p className="font-semibold">{user.name ?? user.email}</p>
          </div>
          <AccountNav />
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <LogOutIcon className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
