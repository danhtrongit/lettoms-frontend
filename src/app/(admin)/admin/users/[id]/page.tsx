import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/rbac";
import { getUserAdmin } from "@/lib/repos/users-admin.repo";
import { UserForm } from "@/components/admin/user-form";

export const metadata = { title: "Sửa người dùng" };

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const user = await getUserAdmin(id);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Sửa người dùng</h1>
      <UserForm
        id={user.id}
        initial={{
          name: user.name ?? "",
          email: user.email,
          role: user.role,
          phone: user.phone ?? "",
        }}
      />
    </div>
  );
}
