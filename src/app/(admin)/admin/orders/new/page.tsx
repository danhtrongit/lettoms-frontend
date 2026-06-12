import { requireStaff } from "@/lib/auth/rbac";
import { AdminOrderForm } from "@/components/admin/admin-order-form";

export const metadata = { title: "Tạo đơn hàng" };

export default async function NewAdminOrderPage() {
  await requireStaff();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tạo đơn hàng</h1>
      <AdminOrderForm />
    </div>
  );
}
