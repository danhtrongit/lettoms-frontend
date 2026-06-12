import { requireAdmin } from "@/lib/auth/rbac";
import { UserForm } from "@/components/admin/user-form";

export const metadata = { title: "Thêm người dùng" };

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Thêm người dùng</h1>
      <UserForm />
    </div>
  );
}
