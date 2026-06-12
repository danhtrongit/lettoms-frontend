import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { listOrdersAdmin } from "@/lib/repos/orders.repo";
import { formatVND, formatDate } from "@/lib/format";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  orderStatusClass,
} from "@/lib/order-status";

export const metadata = { title: "Đơn hàng" };

export default async function AdminOrdersPage() {
  const rows = await listOrdersAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">{rows.length} đơn hàng</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <PlusIcon className="size-4" /> Tạo đơn hàng
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Mã đơn</th>
              <th className="px-4 py-3 font-medium">Khách hàng</th>
              <th className="px-4 py-3 font-medium">Tổng tiền</th>
              <th className="px-4 py-3 font-medium">Thanh toán</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Chưa có đơn hàng nào.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${r.id}`} className="font-medium hover:underline">
                      {r.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3">{formatVND(r.total)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs">
                      {PAYMENT_METHOD_LABEL[r.paymentMethod]} ·{" "}
                      {PAYMENT_STATUS_LABEL[r.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${orderStatusClass(r.status)}`}
                    >
                      {ORDER_STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(r.createdAt.toISOString())}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
