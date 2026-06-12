import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth/rbac";
import { listUsersAdmin } from "@/lib/repos/users-admin.repo";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { UserRowActions } from "@/components/admin/user-row-actions";

export const metadata = { title: "Người dùng" };

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  staff: "Nhân viên",
  customer: "Khách hàng",
};

const ROLE_CLASS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  staff: "bg-blue-100 text-blue-700",
  customer: "bg-muted text-muted-foreground",
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const rows = await listUsersAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Người dùng</h1>
          <p className="text-sm text-muted-foreground">{rows.length} người dùng</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <PlusIcon className="size-4" />
            Thêm người dùng
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{r.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ROLE_CLASS[r.role]}`}>
                    {ROLE_LABEL[r.role] ?? r.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(r.createdAt.toISOString())}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserRowActions id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
