import Link from "next/link";
import { requireUser } from "@/lib/auth/rbac";
import { listOrdersByUser } from "@/lib/repos/orders.repo";
import { formatVND, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/common/empty-state";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  orderStatusClass,
} from "@/lib/order-status";

export const metadata = { title: "Đơn hàng của tôi" };

export default async function MyOrdersPage() {
  const user = await requireUser("/tai-khoan/don-hang");
  const orders = await listOrdersByUser(user.id);

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng của tôi</h1>
        <EmptyState
          title="Chưa có đơn hàng"
          description="Bạn chưa đặt đơn hàng nào."
          actionLabel="Mua sắm ngay"
          actionHref="/nu"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng của tôi</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/dat-hang/${o.code}`}
            className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:border-primary/40"
          >
            <div>
              <p className="font-medium">{o.code}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(o.createdAt.toISOString())} ·{" "}
                {PAYMENT_STATUS_LABEL[o.paymentStatus]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">{formatVND(o.total)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${orderStatusClass(o.status)}`}
              >
                {ORDER_STATUS_LABEL[o.status] ?? o.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
